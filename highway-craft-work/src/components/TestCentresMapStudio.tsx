/// <reference types="google.maps" />
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useAdvancedMarkerRef,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import {
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Navigation,
  Search,
  Star,
} from 'lucide-react';

interface GroundingSource {
  title: string;
  uri: string;
}

interface MapsGroundingPlace {
  title: string;
  uri: string;
  snippets: string[];
}

interface CentrePlaceResult {
  id: string;
  displayName: string;
  formattedAddress: string;
  location: { lat: number; lng: number };
  rating?: number | null;
  userRatingCount?: number | null;
  googleMapsURI?: string | null;
}

interface RouteSummary {
  distanceMeters: number;
  durationMillis: number;
  originLabel: string;
  destinationLabel: string;
  steps: string[];
}

const UK_CITY_PRESETS = [
  'London',
  'Manchester',
  'Birmingham',
  'Edinburgh',
  'Leeds',
  'Bristol',
  'Cardiff',
  'Glasgow',
] as const;

const UK_DEFAULT_CENTER = { lat: 51.5074, lng: -0.1278 };

function isQuotaError(err: unknown): boolean {
  const msg = String(err ?? '');
  return (
    msg.includes('429') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('OVER_QUERY_LIMIT') ||
    msg.includes('OverQuotaMapError')
  );
}

function triggerQuotaBannerIfNeeded(err: unknown) {
  if (isQuotaError(err)) {
    window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
  }
}

interface MarkerItemProps {
  place: CentrePlaceResult;
  isSelected: boolean;
  zIndex: number;
  onSelect: (place: CentrePlaceResult, marker: google.maps.marker.AdvancedMarkerElement) => void;
}

function PlaceAdvancedMarker({ place, isSelected, zIndex, onSelect }: MarkerItemProps) {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <AdvancedMarker
      ref={markerRef}
      position={place.location}
      zIndex={zIndex}
      title={place.displayName}
      onClick={() => {
        if (marker) {
          onSelect(place, marker);
        }
      }}
    >
      <Pin
        background={isSelected ? '#D97706' : '#0B4F8A'}
        borderColor={isSelected ? '#92400E' : '#063259'}
        glyphColor="#FFFFFF"
      />
    </AdvancedMarker>
  );
}

function useUkAutocompleteSuggestions(
  inputString: string,
  placesLib: google.maps.PlacesLibrary | null
) {
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const [suggestions, setSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!placesLib || inputString.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      const { AutocompleteSessionToken, AutocompleteSuggestion } = placesLib;
      if (!sessionTokenRef.current) {
        sessionTokenRef.current = new AutocompleteSessionToken();
      }

      setIsLoading(true);
      AutocompleteSuggestion.fetchAutocompleteSuggestions({
        input: inputString.trim(),
        sessionToken: sessionTokenRef.current,
        includedRegionCodes: ['gb'],
      })
        .then((res: { suggestions: google.maps.places.AutocompleteSuggestion[] }) => {
          if (cancelled) return;
          setSuggestions(res.suggestions ?? []);
          setIsLoading(false);
        })
        .catch((err: unknown) => {
          if (cancelled) return;
          setIsLoading(false);
          triggerQuotaBannerIfNeeded(err);
        });
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [placesLib, inputString]);

  const resetSession = useCallback(() => {
    sessionTokenRef.current = null;
    setSuggestions([]);
  }, []);

  return { suggestions, isLoading, resetSession };
}

function MapsExplorerInner() {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const routesLib = useMapsLibrary('routes');

  const [query, setQuery] = useState('DVSA Driving Test Centre London');
  const [places, setPlaces] = useState<CentrePlaceResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);

  const [selectedPlace, setSelectedPlace] = useState<CentrePlaceResult | null>(null);
  const [selectedMarker, setSelectedMarker] =
    useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);

  // Origin autocomplete & Routes API state
  const [originInput, setOriginInput] = useState('');
  const [originLocation, setOriginLocation] = useState<{
    label: string;
    coords: { lat: number; lng: number } | string;
  } | null>(null);
  const { suggestions, resetSession } = useUkAutocompleteSuggestions(originInput, placesLib);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  // Google Search Grounding briefing for the active centre/city
  const [groundingLoading, setGroundingLoading] = useState(false);
  const [groundingSummary, setGroundingSummary] = useState<string | null>(null);
  const [groundingSources, setGroundingSources] = useState<GroundingSource[]>([]);
  const [groundingError, setGroundingError] = useState<string | null>(null);

  // Google Maps Grounding (gemini-4-hydrogen + googleMaps tool) for local test centre places
  const [mapsGroundingLoading, setMapsGroundingLoading] = useState(false);
  const [mapsGroundingSummary, setMapsGroundingSummary] = useState<string | null>(null);
  const [mapsGroundingLinks, setMapsGroundingLinks] = useState<MapsGroundingPlace[]>([]);
  const [mapsGroundingError, setMapsGroundingError] = useState<string | null>(null);

  const clearRoutePolylines = useCallback(() => {
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      clearRoutePolylines();
    };
  }, [clearRoutePolylines]);

  const runPlaceSearch = useCallback(
    async (textQuery: string) => {
      if (!placesLib || !textQuery.trim()) return;
      setSearching(true);
      setSearchError(null);
      setHasSearchedOnce(true);

      try {
        const response = await placesLib.Place.searchByText({
          textQuery: textQuery.trim(),
          fields: [
            'id',
            'displayName',
            'formattedAddress',
            'location',
            'rating',
            'userRatingCount',
            'googleMapsURI',
          ],
          region: 'gb',
          maxResultCount: 10,
        });

        const mapped: CentrePlaceResult[] = (response.places ?? [])
          .filter((p) => p.location)
          .map((p) => {
            const loc = p.location!;
            const lat = typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat);
            const lng = typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng);
            return {
              id: p.id || `${lat}-${lng}`,
              displayName: p.displayName || 'UK Driving Location',
              formattedAddress: p.formattedAddress || 'United Kingdom',
              location: { lat, lng },
              rating: p.rating ?? null,
              userRatingCount: p.userRatingCount ?? null,
              googleMapsURI: p.googleMapsURI ?? null,
            };
          });

        setPlaces(mapped);
        setSelectedMarker(null);
        setInfoOpen(false);
        clearRoutePolylines();
        setRouteSummary(null);

        if (mapped.length > 0) {
          setSelectedPlace(mapped[0]);
          if (map && typeof google !== 'undefined') {
            const bounds = new google.maps.LatLngBounds();
            mapped.forEach((m) => bounds.extend(m.location));
            map.fitBounds(bounds, 56);
          }
        } else {
          setSelectedPlace(null);
        }
      } catch (err) {
        triggerQuotaBannerIfNeeded(err);
        setSearchError('Unable to load Places search results right now. Please try another UK query.');
      } finally {
        setSearching(false);
      }
    },
    [placesLib, map, clearRoutePolylines]
  );

  // Run initial live search once Places library loads
  useEffect(() => {
    if (placesLib && !hasSearchedOnce) {
      void runPlaceSearch('DVSA Driving Test Centre London');
    }
  }, [placesLib, hasSearchedOnce, runPlaceSearch]);

  const handleSelectSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    if (!placesLib || !suggestion.placePrediction) return;
    try {
      const place = suggestion.placePrediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });
      const label =
        place.formattedAddress || place.displayName || suggestion.placePrediction.text.text;
      if (place.location) {
        const lat =
          typeof place.location.lat === 'function'
            ? place.location.lat()
            : Number(place.location.lat);
        const lng =
          typeof place.location.lng === 'function'
            ? place.location.lng()
            : Number(place.location.lng);
        setOriginLocation({ label, coords: { lat, lng } });
      } else {
        setOriginLocation({ label, coords: label });
      }
      setOriginInput(label);
      resetSession();
    } catch (err) {
      triggerQuotaBannerIfNeeded(err);
      setRouteError('Could not retrieve details for the selected starting address.');
    }
  };

  const handleComputeRoute = async () => {
    if (!routesLib || !map || !selectedPlace) return;
    const originVal = originLocation?.coords || originInput.trim();
    if (!originVal) {
      setRouteError('Enter a UK starting postcode or street address first.');
      return;
    }

    setRouteLoading(true);
    setRouteError(null);
    clearRoutePolylines();

    try {
      const request = {
        origin: originVal,
        destination: selectedPlace.location,
        travelMode: 'DRIVING',
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport', 'legs'],
      };

      const { routes } = await (routesLib.Route as unknown as {
        computeRoutes: (req: unknown) => Promise<{
          routes?: Array<{
            distanceMeters?: number;
            durationMillis?: number;
            viewport?: google.maps.LatLngBounds;
            legs?: Array<{
              steps?: Array<{
                instructions?: string;
                navigationInstruction?: { instructions?: string };
              }>;
            }>;
            createPolylines: () => google.maps.Polyline[];
          }>;
        }>;
      }).computeRoutes(request);

      if (!routes || routes.length === 0) {
        setRouteError('No driving route found between that origin and test centre.');
        setRouteLoading(false);
        return;
      }

      const primaryRoute = routes[0];
      const newPolylines = primaryRoute.createPolylines();
      newPolylines.forEach((polyline) => {
        polyline.setOptions({
          strokeColor: '#0B4F8A',
          strokeWeight: 6,
          strokeOpacity: 0.9,
        });
        polyline.setMap(map);
      });
      polylinesRef.current = newPolylines;

      if (primaryRoute.viewport) {
        map.fitBounds(primaryRoute.viewport);
      }

      const rawSteps = primaryRoute.legs?.[0]?.steps ?? [];
      const steps = rawSteps
        .map((s) => s.navigationInstruction?.instructions || s.instructions || '')
        .filter((s) => s.trim().length > 0)
        .slice(0, 6);

      setRouteSummary({
        distanceMeters: primaryRoute.distanceMeters ?? 0,
        durationMillis: primaryRoute.durationMillis ?? 0,
        originLabel: originLocation?.label || originInput.trim(),
        destinationLabel: selectedPlace.displayName,
        steps,
      });
    } catch (err) {
      triggerQuotaBannerIfNeeded(err);
      setRouteError('Could not compute driving route. Verify your UK starting address.');
    } finally {
      setRouteLoading(false);
    }
  };

  const handleSearchGrounding = async (topicQuery: string) => {
    if (!topicQuery.trim()) return;
    setGroundingLoading(true);
    setGroundingError(null);

    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: topicQuery }),
      });
      const data = (await res.json()) as {
        summary?: string;
        sources?: GroundingSource[];
        error?: string;
      };
      if (!res.ok) {
        setGroundingError(data.error || 'Live Google Search briefing unavailable right now.');
      } else {
        setGroundingSummary(data.summary || '');
        setGroundingSources(data.sources ?? []);
      }
    } catch {
      setGroundingError('Network error reaching the Google Search Grounding service.');
    } finally {
      setGroundingLoading(false);
    }
  };

  const handleMapsGrounding = async () => {
    const focusName = selectedPlace?.displayName || query;
    const prompt = `Using Google Maps data, summarise notable nearby roundabouts, dual carriageways, parking car parks, and learner practice landmarks around ${focusName} (${selectedPlace?.formattedAddress || 'United Kingdom'}).`;
    setMapsGroundingLoading(true);
    setMapsGroundingError(null);

    try {
      const res = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt,
          lat: selectedPlace?.location.lat,
          lng: selectedPlace?.location.lng,
        }),
      });
      const data = (await res.json()) as {
        summary?: string;
        mapLinks?: MapsGroundingPlace[];
        error?: string;
      };
      if (!res.ok) {
        setMapsGroundingError(data.error || 'Google Maps Grounding lookup unavailable right now.');
      } else {
        setMapsGroundingSummary(data.summary || '');
        setMapsGroundingLinks(data.mapLinks ?? []);
      }
    } catch {
      setMapsGroundingError('Network error reaching the Google Maps Grounding service.');
    } finally {
      setMapsGroundingLoading(false);
    }
  };

  const sortedPlaces = [...places].sort((a, b) => b.location.lat - a.location.lat);

  return (
    <div className="space-y-6">
      {/* Search & City Presets Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void runPlaceSearch(query);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <label htmlFor="uk-places-search" className="sr-only">
              Search UK driving test centres or driving schools
            </label>
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="uk-places-search"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search e.g. DVSA Driving Test Centre Bristol or driving schools in Leeds"
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F8A]/30 focus:border-[#0B4F8A]"
            />
          </div>
          <button
            type="submit"
            disabled={searching || !placesLib}
            className="px-5 py-2.5 bg-[#0B4F8A] hover:bg-[#093E6E] disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2 shrink-0"
          >
            {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
            Search Places
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 mr-1">UK Cities:</span>
          {UK_CITY_PRESETS.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => {
                const next = `DVSA Driving Test Centre ${city}`;
                setQuery(next);
                void runPlaceSearch(next);
              }}
              className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
            >
              {city}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Interactive Google Map + Live Results & Route Planner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-2">
            <div className="h-[500px] w-full rounded-lg overflow-hidden relative">
              <GoogleMap
                mapId="DEMO_MAP_ID"
                defaultCenter={UK_DEFAULT_CENTER}
                defaultZoom={11}
                gestureHandling="greedy"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                {sortedPlaces.map((place, index) => {
                  const isSel = selectedPlace?.id === place.id;
                  return (
                    <PlaceAdvancedMarker
                      key={place.id}
                      place={place}
                      isSelected={isSel}
                      zIndex={isSel ? 1000 : index}
                      onSelect={(p, marker) => {
                        setSelectedPlace(p);
                        setSelectedMarker(marker);
                        setInfoOpen(true);
                      }}
                    />
                  );
                })}

                {infoOpen && selectedMarker && selectedPlace && (
                  <InfoWindow
                    anchor={selectedMarker}
                    pixelOffset={[0, -4]}
                    onCloseClick={() => setInfoOpen(false)}
                  >
                    <div className="max-w-xs space-y-1 text-slate-900 p-1">
                      <p className="font-semibold text-sm">{selectedPlace.displayName}</p>
                      <p className="text-xs text-slate-600">{selectedPlace.formattedAddress}</p>
                      {selectedPlace.rating !== null && selectedPlace.rating !== undefined && (
                        <p className="text-xs font-medium text-amber-700">
                          Rating: {selectedPlace.rating.toFixed(1)} ({selectedPlace.userRatingCount ?? 0} reviews)
                        </p>
                      )}
                      {selectedPlace.googleMapsURI && (
                        <a
                          href={selectedPlace.googleMapsURI}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B4F8A] hover:underline pt-1"
                        >
                          Open in Google Maps
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </div>
          </div>

          {/* Live Google Search Grounding Briefings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#0B4F8A]" />
                  Live Google Search: Local Test Centre &amp; Highway Code Info
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fetch real-time web context for a selected test centre, local roundabouts, or UK DVSA guidance.
                </p>
              </div>
              <button
                type="button"
                disabled={groundingLoading}
                onClick={() =>
                  void handleSearchGrounding(
                    selectedPlace
                      ? `${selectedPlace.displayName} driving test routes roundabouts and DVSA tips`
                      : `${query} UK DVSA driving test info`
                  )
                }
                className="px-3.5 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 disabled:opacity-60 text-white rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                {groundingLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Search className="w-3.5 h-3.5" />
                )}
                Search Web Info
              </button>
            </div>

            {groundingError && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
                {groundingError}
              </p>
            )}

            {groundingSummary && (
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {groundingSummary}
                </div>
                {groundingSources.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Grounded Sources
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {groundingSources.map((src) => (
                        <a
                          key={src.uri}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-[#0B4F8A] rounded-md transition-colors"
                        >
                          <span className="truncate max-w-[220px]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Google Maps Data Grounding (Places & Nearby Roads) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#0B4F8A]" />
                  Google Maps Data: Nearby Roads &amp; Test Area Brief
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Analyse local junctions, car parks, and review highlights grounded in Google Maps place data.
                </p>
              </div>
              <button
                type="button"
                disabled={mapsGroundingLoading}
                onClick={() => void handleMapsGrounding()}
                className="px-3.5 py-2 text-xs font-semibold bg-[#0B4F8A] hover:bg-[#093E6E] disabled:opacity-60 text-white rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                {mapsGroundingLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                Analyse Local Area
              </button>
            </div>

            {mapsGroundingError && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
                {mapsGroundingError}
              </p>
            )}

            {mapsGroundingSummary && (
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {mapsGroundingSummary}
                </div>
                {mapsGroundingLinks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Google Maps Place Citations
                    </p>
                    <div className="space-y-2">
                      {mapsGroundingLinks.map((link) => (
                        <div key={link.uri} className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-1">
                          <a
                            href={link.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B4F8A] hover:underline"
                          >
                            <span>{link.title}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                          {link.snippets.length > 0 && (
                            <p className="text-xs text-slate-600">{link.snippets[0]}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Places List + Practice Route Planner */}
        <div className="lg:col-span-5 space-y-5">
          {/* Route Planner */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#0B4F8A]" />
                Practice Route to Selected Centre
              </h3>
            </div>

            <div className="relative">
              <label htmlFor="route-origin-input" className="block text-xs font-medium text-slate-600 mb-1">
                Starting UK Address or Postcode
              </label>
              <input
                id="route-origin-input"
                type="text"
                value={originInput}
                onChange={(e) => {
                  setOriginInput(e.target.value);
                  setOriginLocation(null);
                }}
                placeholder="e.g. Euston Station, London or SW1A"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B4F8A]/30 focus:border-[#0B4F8A]"
              />

              {suggestions.length > 0 && (
                <ul
                  aria-label="Address suggestions"
                  className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100"
                >
                  {suggestions.map((s, idx) => (
                    <li key={s.placePrediction?.placeId || idx}>
                      <button
                        type="button"
                        onClick={() => void handleSelectSuggestion(s)}
                        className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        {s.placePrediction?.text.text}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="text-xs text-slate-600">
              Destination:{' '}
              <span className="font-semibold text-slate-900">
                {selectedPlace ? selectedPlace.displayName : 'Select a centre below'}
              </span>
            </div>

            <button
              type="button"
              disabled={routeLoading || !selectedPlace || !routesLib}
              onClick={() => void handleComputeRoute()}
              className="w-full py-2.5 bg-[#0B4F8A] hover:bg-[#093E6E] disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center justify-center gap-2"
            >
              {routeLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              Compute Driving Route
            </button>

            {routeError && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-2.5">
                {routeError}
              </p>
            )}

            {routeSummary && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-900">
                  <span>
                    {(routeSummary.distanceMeters / 1609.344).toFixed(1)} miles (
                    {(routeSummary.distanceMeters / 1000).toFixed(1)} km)
                  </span>
                  <span className="font-mono text-[#0B4F8A]">
                    {Math.max(1, Math.round(routeSummary.durationMillis / 60000))} mins drive
                  </span>
                </div>
                {routeSummary.steps.length > 0 && (
                  <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside pt-1 border-t border-slate-200">
                    {routeSummary.steps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                )}
              </div>
            )}
          </div>

          {/* Search Results List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-900">
                Places Found ({places.length})
              </h3>
              <span className="text-xs text-slate-500">Powered by Places API</span>
            </div>

            {searchError && (
              <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3">
                {searchError}
              </p>
            )}

            {!searching && !searchError && places.length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">
                No matching places returned for that query. Try a broader UK town or city name.
              </p>
            )}

            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto pr-1">
              {places.map((place) => {
                const active = selectedPlace?.id === place.id;
                return (
                  <div
                    key={place.id}
                    className={`py-3 px-2.5 rounded-lg transition-colors ${
                      active ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlace(place);
                        setInfoOpen(false);
                        map?.panTo(place.location);
                        map?.setZoom(14);
                      }}
                      className="w-full text-left space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{place.displayName}</p>
                        {place.rating !== null && place.rating !== undefined && (
                          <span className="inline-flex items-center gap-1 text-xs font-mono text-amber-700 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            {place.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {place.formattedAddress}
                      </p>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestCentresMapStudio() {
  const envKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) || '';
  const [mapsKey, setMapsKey] = useState<string>(envKey);
  const [loadingConfig, setLoadingConfig] = useState<boolean>(!envKey);

  // Fallback Google Search Grounding state when Maps key isn't active in env
  const [fallbackQuery, setFallbackQuery] = useState('DVSA Driving Test Centres near London');
  const [fallbackSummary, setFallbackSummary] = useState<string | null>(null);
  const [fallbackSources, setFallbackSources] = useState<GroundingSource[]>([]);
  const [fallbackLoading, setFallbackLoading] = useState(false);

  useEffect(() => {
    if (envKey) return;
    let active = true;
    fetch('/api/maps-config')
      .then((r) => r.json())
      .then((data: { apiKey?: string }) => {
        if (active && data.apiKey) {
          setMapsKey(data.apiKey);
        }
      })
      .catch(() => {
        // ignore if server unreachable
      })
      .finally(() => {
        if (active) setLoadingConfig(false);
      });
    return () => {
      active = false;
    };
  }, [envKey]);

  const runFallbackSearch = async () => {
    setFallbackLoading(true);
    try {
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: fallbackQuery }),
      });
      const data = (await res.json()) as {
        summary?: string;
        sources?: GroundingSource[];
      };
      setFallbackSummary(data.summary || 'Unable to fetch UK driving search results.');
      setFallbackSources(data.sources ?? []);
    } catch {
      setFallbackSummary('Could not connect to the UK driving search service.');
    } finally {
      setFallbackLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      <div className="space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0B4F8A]">
          Real-World UK Maps &amp; Route Explorer
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
          UK Driving Test Centres &amp; Practice Route Planner
        </h2>
        <p className="text-sm text-slate-600 max-w-3xl">
          Locate official UK DVSA driving test centres and local driving schools via Google Maps Platform Places,
          compute real driving practice routes to a test centre, and pull live Google Search road briefings.
        </p>
      </div>

      {loadingConfig ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 flex items-center justify-center gap-3 text-sm text-slate-600">
          <Loader2 className="w-5 h-5 animate-spin text-[#0B4F8A]" />
          Loading Google Maps configuration...
        </div>
      ) : mapsKey ? (
        <APIProvider apiKey={mapsKey} region="GB" language="en-GB" libraries={['places', 'routes', 'marker']}>
          <MapsExplorerInner />
        </APIProvider>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-slate-900">
              Google Maps API Key Pending Provisioning
            </h3>
            <p className="text-sm text-slate-600">
              Interactive map tiles require <code className="font-mono text-xs">VITE_GOOGLE_MAPS_API_KEY</code> in
              the server environment. You can still look up UK DVSA test centres and route guidance below using live
              Google Search Grounding.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={fallbackQuery}
              onChange={(e) => setFallbackQuery(e.target.value)}
              aria-label="Search UK driving test centres via Google Search"
              className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-lg"
            />
            <button
              type="button"
              disabled={fallbackLoading}
              onClick={() => void runFallbackSearch()}
              className="px-4 py-2 bg-[#0B4F8A] hover:bg-[#093E6E] text-white text-sm font-semibold rounded-lg inline-flex items-center justify-center gap-2"
            >
              {fallbackLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search via Google Search
            </button>
          </div>

          {fallbackSummary && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-sm text-slate-700 whitespace-pre-line">
              <div>{fallbackSummary}</div>
              {fallbackSources.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                  {fallbackSources.map((s) => (
                    <a
                      key={s.uri}
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#0B4F8A] hover:underline inline-flex items-center gap-1"
                    >
                      {s.title}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
