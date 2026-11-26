export type HazardScenarioTheme =
  | 'suburban'
  | 'rural'
  | 'urban'
  | 'dual'
  | 'rainy-roundabout'
  | 'parked-door'
  | 'blind-horse'
  | 'ice-cream-van'
  | 'roadworks-merge'
  | 'emergency-junction';

export interface HazardScenario {
  id: string;
  title: string;
  environment: string;
  roadLimitMph: number;
  durationSec: number;
  windowStartSec: number;
  windowEndSec: number;
  hazardTitle: string;
  hazardExplanation: string;
  theme: HazardScenarioTheme;
}

export const HAZARD_SCENARIOS: HazardScenario[] = [
  {
    id: 'hp-school-van',
    title: 'Clip 1 · Suburban Street & Parked Delivery Van',
    environment: '30 mph residential road outside a primary school',
    roadLimitMph: 30,
    durationSec: 16,
    windowStartSec: 6.2,
    windowEndSec: 10.6,
    hazardTitle: 'Child emerging between parked cars & cyclist swerving',
    hazardExplanation:
      'As you approach the parked blue delivery van on the left, a child pedestrian steps out near the rear of the van while an oncoming cyclist moves wide. Clicking as soon as the pedestrian begins stepping into the road scores 5/5.',
    theme: 'suburban',
  },
  {
    id: 'hp-rural-tractor',
    title: 'Clip 2 · Country Lane & Concealed Farm Gate',
    environment: '60 mph narrow rural road with hedgerows',
    roadLimitMph: 60,
    durationSec: 16,
    windowStartSec: 5.5,
    windowEndSec: 9.8,
    hazardTitle: 'Farm tractor emerging from blind left-hand gateway',
    hazardExplanation:
      'Warning signs and mud tracks on the tarmac hint at farm vehicles. The scoring window begins the moment the tractor nose appears through the hedge gap and moves onto your carriageway.',
    theme: 'rural',
  },
  {
    id: 'hp-urban-bus',
    title: 'Clip 3 · High Street Bus Stop',
    environment: '30 mph town centre high street',
    roadLimitMph: 30,
    durationSec: 16,
    windowStartSec: 6.8,
    windowEndSec: 11.2,
    hazardTitle: 'Double-decker bus indicating right & pulling out',
    hazardExplanation:
      'Rule 223 asks drivers to give way to buses signalling to pull away from a bus stop when safe. The hazard develops as the bus switches on its right indicator and pulls into your lane.',
    theme: 'urban',
  },
  {
    id: 'hp-dual-merge',
    title: 'Clip 4 · Dual Carriageway Slip Road Merge',
    environment: '70 mph dual carriageway approaching junction',
    roadLimitMph: 70,
    durationSec: 16,
    windowStartSec: 5.8,
    windowEndSec: 10.0,
    hazardTitle: 'Saloon car merging from slip road without matching speed',
    hazardExplanation:
      'A silver saloon enters from the left slip road while traffic ahead brakes, forcing you to ease off or check mirrors to move safely to lane 2.',
    theme: 'dual',
  },
  {
    id: 'hp-rainy-roundabout',
    title: 'Clip 5 · Rainy Dusk Mini-Roundabout',
    environment: '30 mph wet urban approach at dusk',
    roadLimitMph: 30,
    durationSec: 16,
    windowStartSec: 6.4,
    windowEndSec: 10.8,
    hazardTitle: 'Vehicle approaching fast from the left failing to slow',
    hazardExplanation:
      'Even though you have priority over traffic from your left at a UK roundabout, the hatchback approaching from the left fails to brake early on wet tarmac—developing into a collision hazard.',
    theme: 'rainy-roundabout',
  },
  {
    id: 'hp-parked-door',
    title: 'Clip 6 · Cyclist & Parked Car Door Opening',
    environment: '20 mph terraced residential street',
    roadLimitMph: 20,
    durationSec: 16,
    windowStartSec: 6.0,
    windowEndSec: 10.2,
    hazardTitle: 'Parked driver door opens, forcing cyclist to swerve right into your lane',
    hazardExplanation:
      'A cyclist rides past a line of parked cars on the left. As the driver-side door of a parked car swings open, the cyclist swerves wide into the carriageway to avoid collision.',
    theme: 'parked-door',
  },
  {
    id: 'hp-blind-horse',
    title: 'Clip 7 · Country Bend & Horse Riders',
    environment: '50 mph winding rural road with high banks',
    roadLimitMph: 50,
    durationSec: 16,
    windowStartSec: 5.6,
    windowEndSec: 9.9,
    hazardTitle: 'Horses and riders rounding blind left-hand bend ahead',
    hazardExplanation:
      'Rule 215 requires slowing below 10 mph and leaving at least 2 metres space around horses. Click early as the lead rider comes into sight round the foliage.',
    theme: 'blind-horse',
  },
  {
    id: 'hp-ice-cream-van',
    title: 'Clip 8 · Parkside Ice Cream Van',
    environment: '30 mph road alongside a busy local park',
    roadLimitMph: 30,
    durationSec: 16,
    windowStartSec: 6.5,
    windowEndSec: 10.9,
    hazardTitle: 'Pedestrians stepping out from in front of stationary ice cream van',
    hazardExplanation:
      'A stationary ice cream van with flashing hazard lights hides pedestrians walking out from the offside kerb into your path.',
    theme: 'ice-cream-van',
  },
  {
    id: 'hp-roadworks-merge',
    title: 'Clip 9 · Roadworks Cone Taper Merge',
    environment: '50 mph A-road approaching lane closure cones',
    roadLimitMph: 50,
    durationSec: 16,
    windowStartSec: 6.1,
    windowEndSec: 10.5,
    hazardTitle: 'White van cutting sharply across right-lane closure cones',
    hazardExplanation:
      'Ahead, the right lane narrows into temporary cones. A white van accelerates past and cuts late across the chevrons directly into your safe braking gap.',
    theme: 'roadworks-merge',
  },
  {
    id: 'hp-emergency-junction',
    title: 'Clip 10 · Town Crossroads & Ambulance',
    environment: '30 mph urban crossroads approaching green lights',
    roadLimitMph: 30,
    durationSec: 16,
    windowStartSec: 5.9,
    windowEndSec: 10.3,
    hazardTitle: 'Ambulance with flashing blue lights crossing from the right',
    hazardExplanation:
      'Even with a green traffic signal ahead, an emergency ambulance approaches quickly from the right cross-street with beacons active. Spot it early and prepare to hold back cleanly.',
    theme: 'emergency-junction',
  },
];
