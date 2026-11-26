import type { TheoryQuestion } from '../../logic/theoryEngine';

export const VEHICLE_AND_MARGINS_QUESTIONS: TheoryQuestion[] = [
  // Vehicle Knowledge (24 questions — directly fulfilling prompt topic!)
  {
    id: 'uk-q106',
    category: 'Vehicle Knowledge',
    prompt: 'What is the legal minimum tread depth for car tyres in the UK?',
    options: [
      '1.0 mm across half the tyre width',
      '1.6 mm across the central three-quarters of the tread breadth and around the entire outer circumference',
      '2.5 mm on front tyres only',
      '3.0 mm during winter months only',
    ],
    correctIndex: 1,
    explanation:
      'UK law requires at least 1.6 mm of tread depth throughout a continuous band across the central three-quarters of the breadth of the tread and around the entire circumference.',
    highwayCodeRef: 'Highway Code Annex 3',
  },
  {
    id: 'uk-q107',
    category: 'Vehicle Knowledge',
    prompt: 'When should you check your vehicle’s tyre pressures?',
    options: [
      'Immediately after a fast 50-mile motorway drive',
      'When the tyres are cold, before starting a journey, using a reliable gauge',
      'Only once a year during the MOT test',
      'While the car is loaded on a steep hill',
    ],
    correctIndex: 1,
    explanation:
      'Driving heats air inside tyres and raises pressure readings artificially. Check tyre pressures when cold according to the manufacturer’s handbook (or door-pillar sticker), adjusting for heavy loads.',
    highwayCodeRef: 'Highway Code Annex 6',
  },
  {
    id: 'uk-q108',
    category: 'Vehicle Knowledge',
    prompt: 'What is the main purpose of an Anti-lock Braking System (ABS)?',
    options: [
      'To halve stopping distances on thick ice',
      'To prevent the wheels from locking under harsh braking so you can continue steering',
      'To apply the handbrake automatically at traffic lights',
      'To reduce brake pad wear on motorways',
    ],
    correctIndex: 1,
    explanation:
      'ABS pulses brake pressure rapidly when a wheel is about to lock, helping you retain steering control around hazards during an emergency stop.',
    highwayCodeRef: 'Highway Code Rule 120',
  },
  {
    id: 'uk-q109',
    category: 'Vehicle Knowledge',
    prompt: 'If a car fitted with ABS vibrates or pulses through the brake pedal during an emergency stop, what should you do?',
    options: [
      'Pump the brake pedal up and down rapidly',
      'Keep pressing the brake pedal firmly until the vehicle stops',
      'Release the brake and pull the handbrake instead',
      'Switch off the ignition immediately',
    ],
    correctIndex: 1,
    explanation:
      'Pedal vibration is normal ABS operation. Maintain firm, continuous pressure on the brake pedal rather than pumping it.',
    highwayCodeRef: 'Highway Code Rule 120',
  },
  {
    id: 'uk-q110',
    category: 'Vehicle Knowledge',
    prompt: 'What could cause uneven wear along the outer edges of both front tyres?',
    options: [
      'Over-inflated tyres',
      'Under-inflated tyres or misaligned steering geometry',
      'Low windscreen washer fluid',
      'Faulty catalytic converter',
    ],
    correctIndex: 1,
    explanation:
      'Under-inflation wears both outer shoulders of a tyre prematurely, whereas over-inflation wears the centre strip faster.',
    highwayCodeRef: 'Highway Code Vehicle Maintenance',
  },
  {
    id: 'uk-q111',
    category: 'Vehicle Knowledge',
    prompt: 'What does a red warning light shaped like an oil can illuminating while driving indicate?',
    options: [
      'Washer fluid tank is empty',
      'Engine oil pressure is dangerously low — pull over safely and switch off the engine immediately',
      'Service reminder due in 1,000 miles',
      'Catalytic converter warming up normally',
    ],
    correctIndex: 1,
    explanation:
      'A red oil pressure warning indicates insufficient lubrication pressure, risking severe engine seizure or fire. Stop safely and turn off the engine promptly.',
    highwayCodeRef: 'Highway Code Rule 89',
  },
  {
    id: 'uk-q112',
    category: 'Vehicle Knowledge',
    prompt: 'What should you do before opening the engine coolant reservoir cap to top up coolant?',
    options: [
      'Rev the engine to 3,000 rpm',
      'Wait until the engine is completely cold so pressurised scalding steam does not spray out',
      'Pour cold tap water straight onto a hot radiator',
      'Turn on the rear heated screen',
    ],
    correctIndex: 1,
    explanation:
      'Cooling systems operate under high pressure and temperature; opening a hot cap can cause severe scalding burns.',
    highwayCodeRef: 'DVSA Show Me, Tell Me Guide',
  },
  {
    id: 'uk-q113',
    category: 'Vehicle Knowledge',
    prompt: 'Why is it dangerous to drive with an improperly adjusted head restraint?',
    options: [
      'It increases fuel consumption by 10%',
      'It fails to protect your neck from serious whiplash injury in a rear-end collision',
      'It blocks the front passenger airbag sensor',
      'It causes steering wheel wobble at 60 mph',
    ],
    correctIndex: 1,
    explanation:
      'Rule 97: Adjust the head restraint so the rigid part is at least as high as the eye or top of the ears and as close to the back of your head as comfortable.',
    highwayCodeRef: 'Highway Code Rule 97',
  },
  {
    id: 'uk-q114',
    category: 'Vehicle Knowledge',
    prompt: 'What happens to your vehicle if you drive with too much engine oil above the MAX mark on the dipstick?',
    options: [
      'Nothing — extra oil makes the engine run cooler',
      'Excess pressure can damage oil seals, create smoke, or harm the catalytic converter',
      'Tyre grip improves in wet weather',
      'The battery charges twice as fast',
    ],
    correctIndex: 1,
    explanation:
      'Overfilling oil forces oil past seals and into combustion/exhaust systems, risking costly engine and catalytic converter damage.',
    highwayCodeRef: 'Highway Code Annex 6',
  },
  {
    id: 'uk-q115',
    category: 'Vehicle Knowledge',
    prompt: 'What could cause your brake pedal to feel soft or spongy when you press it?',
    options: [
      'Air in the hydraulic brake lines or low/worn brake fluid',
      'Worn windscreen wiper blades',
      'Over-inflated rear tyres',
      'A flat battery in the key fob',
    ],
    correctIndex: 0,
    explanation:
      'Air trapped in hydraulic lines compresses under pressure, producing a spongy pedal and dangerously reduced braking power. Have it inspected before driving.',
    highwayCodeRef: 'Highway Code Rule 89',
  },
  {
    id: 'uk-q116',
    category: 'Vehicle Knowledge',
    prompt: 'What should you do if a red brake system warning light stays illuminated after releasing the handbrake?',
    options: [
      'Continue driving and book a check next month',
      'Do not drive the car — check brake fluid level and seek immediate mechanical assistance',
      'Pump the clutch twice to reset the light',
      'Switch on rear fog lights',
    ],
    correctIndex: 1,
    explanation:
      'A lit red brake warning light with the handbrake off signals dangerously low brake fluid or a braking circuit fault.',
    highwayCodeRef: 'Highway Code Rule 89',
  },
  {
    id: 'uk-q117',
    category: 'Vehicle Knowledge',
    prompt: 'How do roof racks, roof boxes, and under-inflated tyres affect a car’s performance?',
    options: [
      'They improve aerodynamics at motorway speeds',
      'They increase aerodynamic drag and rolling resistance, significantly increasing fuel or battery consumption',
      'They shorten braking distances in rain',
      'They reduce tyre wear',
    ],
    correctIndex: 1,
    explanation:
      'Remove empty roof racks/boxes and keep tyres correctly inflated to maximise fuel efficiency and reduce CO2 emissions.',
    highwayCodeRef: 'Highway Code Eco-Safe Driving',
  },
  {
    id: 'uk-q118',
    category: 'Vehicle Knowledge',
    prompt: 'How can you make your driving more environmentally friendly (eco-safe driving)?',
    options: [
      'Brake sharply at the last moment before traffic lights',
      'Anticipate traffic flow early, shift up gears smoothly, avoid harsh acceleration, and turn off the engine when stationary for long periods',
      'Leave the air conditioning and heated rear screen on permanently',
      'Warm the engine up idling on the driveway for 15 minutes before setting off',
    ],
    correctIndex: 1,
    explanation:
      'Smooth acceleration, reading the road ahead to reduce unnecessary braking, and using higher gears appropriately cut fuel use and emissions by up to 15%.',
    highwayCodeRef: 'Highway Code Eco-Safe Driving',
  },
  {
    id: 'uk-q119',
    category: 'Vehicle Knowledge',
    prompt: 'What is the purpose of a catalytic converter on a petrol car?',
    options: [
      'To cool down turbocharger intake air',
      'To reduce harmful toxic exhaust gases before they leave the tailpipe',
      'To increase top motorway speed',
      'To filter dust entering the cabin heater',
    ],
    correctIndex: 1,
    explanation:
      'Catalytic converters chemically convert carbon monoxide, hydrocarbons, and nitrogen oxides into less harmful gases.',
    highwayCodeRef: 'Highway Code Annex 6',
  },
  {
    id: 'uk-q120',
    category: 'Vehicle Knowledge',
    prompt: 'What should you do if a car’s steering suddenly feels heavy and pulls sharply to one side while driving?',
    options: [
      'Accelerate gently to straighten the wheels',
      'Hold the steering wheel firmly, ease off the accelerator, brake gently, and pull over safely to check for a puncture',
      'Pull the handbrake firmly at 50 mph',
      'Turn off the ignition while moving',
    ],
    correctIndex: 1,
    explanation:
      'A sudden pull or heavy steering commonly indicates a tyre blowout or rapid deflation. Grip the wheel firmly, avoid harsh braking, and coast safely to a stop.',
    highwayCodeRef: 'Highway Code Rule 281',
  },
  {
    id: 'uk-q121',
    category: 'Vehicle Knowledge',
    prompt: 'When you replace a wheel or have tyres changed, what safety check is essential after driving roughly 30 miles?',
    options: [
      'Check that the wheel nuts are still tightened to the correct torque',
      'Bleed the hydraulic brake fluid',
      'Drain half the engine oil',
      'Reset the speedometer needle',
    ],
    correctIndex: 0,
    explanation:
      'Wheel nuts can settle after fitment; checking torque after a short mileage prevents wheels working loose.',
    highwayCodeRef: 'Highway Code Maintenance',
  },
  {
    id: 'uk-q122',
    category: 'Vehicle Knowledge',
    prompt: 'What is the legal requirement for windscreen wipers and washers?',
    options: [
      'Only the driver-side wiper needs to clear glass',
      'Wipers and washers must work effectively and keep the windscreen clear of dirt and spray',
      'Washer fluid is optional in summer',
      'Rear wipers are legally compulsory on every saloon car',
    ],
    correctIndex: 1,
    explanation:
      'Rule 89 requires windscreens and windows to be kept clean and unobstructed; defective wipers or empty washers can fail an MOT and impair safety.',
    highwayCodeRef: 'Highway Code Rule 89',
  },
  {
    id: 'uk-q123',
    category: 'Vehicle Knowledge',
    prompt: 'What does an illuminated amber engine management light (MIL) mean while driving?',
    options: [
      'Fuel cap is unlocked',
      'A fault has been detected in the engine or emissions control system — have the car checked promptly',
      'Full-beam headlights are active',
      'Tyre pressure is 2 psi high',
    ],
    correctIndex: 1,
    explanation:
      'An engine management light warns of an ECU, sensor, or emissions fault; if it flashes or the car loses power, stop safely and arrange recovery.',
    highwayCodeRef: 'Highway Code Rule 89',
  },
  {
    id: 'uk-q124',
    category: 'Vehicle Knowledge',
    prompt: 'Why should you NEVER carry loose heavy items on the rear parcel shelf inside a hatchback?',
    options: [
      'They scratch rear window heating elements only',
      'They restrict your rear view and can become lethal projectiles flying forward under heavy braking or collision',
      'They disable the ABS brakes',
      'They invalidate third-party insurance automatically',
    ],
    correctIndex: 1,
    explanation:
      'Secure heavy luggage low in the boot; unsecured items on the parcel shelf obstruct your rear mirror view and fly forward at crash speeds.',
    highwayCodeRef: 'Highway Code Rule 98',
  },
  {
    id: 'uk-q125',
    category: 'Vehicle Knowledge',
    prompt: 'If you notice blue smoke coming from a car’s exhaust pipe under acceleration, what does this usually indicate?',
    options: [
      'Excess water condensation on a cold morning',
      'Engine oil is burning inside the combustion chamber',
      'Brakes are overheating',
      'Air conditioning gas is low',
    ],
    correctIndex: 1,
    explanation:
      'Blue exhaust smoke signifies burning engine oil (worn piston rings/valve seals); black smoke means excessive unburnt fuel; persistent thick white steam on a warm engine can signal coolant entering cylinders.',
    highwayCodeRef: 'Highway Code Annex 6',
  },
  {
    id: 'uk-q126',
    category: 'Vehicle Knowledge',
    prompt: 'What is the maximum permitted tint darkness for a front windscreen and front side windows on modern UK cars?',
    options: [
      'Front windscreen must let at least 75% of light through; front side windows at least 70%',
      'Any tint darkness is legal as long as mirrors work',
      'Front side windows only need 30% light transmission',
      'Only rear windows have legal visibility rules',
    ],
    correctIndex: 0,
    explanation:
      'Rule 89 / UK law: heavily tinted front glass reduces night and dusk visibility of pedestrians and cyclists, so minimum 75% windscreen / 70% front side light transmission applies.',
    highwayCodeRef: 'Highway Code Rule 89',
  },
  {
    id: 'uk-q127',
    category: 'Vehicle Knowledge',
    prompt: 'What should you check before carrying a rear-facing child seat on a front passenger seat?',
    options: [
      'That the front passenger airbag is switched OFF (deactivated)',
      'That the seat is pushed as far forward as possible',
      'That the child restraint uses only a lap belt',
      'That child locks are turned on on the boot lid',
    ],
    correctIndex: 0,
    explanation:
      'Rule 100: NEVER place a rear-facing child seat in front of an active front passenger airbag — airbag inflation can cause fatal injury to the child.',
    highwayCodeRef: 'Highway Code Rule 100',
  },
  {
    id: 'uk-q128',
    category: 'Vehicle Knowledge',
    prompt: 'When you switch on rear fog lights in thick fog, what dashboard warning indicator MUST be lit?',
    options: [
      'A blue beam symbol',
      'An amber warning light showing a fog lamp symbol',
      'A green left-right arrow',
      'A red battery light',
    ],
    correctIndex: 1,
    explanation:
      'Rear fog lamps require an amber dashboard tell-tale light so drivers remember to switch them off as soon as visibility improves beyond 100 metres.',
    highwayCodeRef: 'Highway Code Rule 236',
  },
  {
    id: 'uk-q129',
    category: 'Vehicle Knowledge',
    prompt: 'Which fluid keeps the brake pads pressing reliably against brake discs when you press the footbrake?',
    options: ['Power steering fluid', 'Hydraulic brake fluid', 'Screenwash concentrate', 'Diesel exhaust fluid (AdBlue)'],
    correctIndex: 1,
    explanation:
      'Hydraulic brake fluid transfers force from the master cylinder to each wheel’s brake caliper or cylinder.',
    highwayCodeRef: 'Highway Code Maintenance',
  },

  // Safety Margins (16 new)
  {
    id: 'uk-q130',
    category: 'Safety Margins',
    prompt: 'What is the overall typical stopping distance at 30 mph on a dry road according to the Highway Code?',
    options: ['14 metres (46 feet)', '23 metres (75 feet / 6 car lengths)', '36 metres (118 feet)', '53 metres (175 feet)'],
    correctIndex: 1,
    explanation:
      'At 30 mph, thinking distance is 9m (30 ft) plus braking distance 14m (45 ft) = 23 metres (75 feet), about 6 car lengths.',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q131',
    category: 'Safety Margins',
    prompt: 'What is the overall typical stopping distance at 50 mph in good, dry conditions?',
    options: ['36 metres (118 feet)', '53 metres (175 feet / 13 car lengths)', '73 metres (240 feet)', '96 metres (315 feet)'],
    correctIndex: 1,
    explanation:
      'At 50 mph: 15m thinking distance + 38m braking distance = 53 metres (175 feet). Notice braking distance rises with the square of speed!',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q132',
    category: 'Safety Margins',
    prompt: 'What is the overall typical stopping distance at 60 mph in dry conditions?',
    options: ['53 metres (175 feet)', '73 metres (240 feet / 18 car lengths)', '96 metres (315 feet)', '40 metres (131 feet)'],
    correctIndex: 1,
    explanation:
      'At 60 mph: 18m thinking distance + 55m braking distance = 73 metres (240 feet).',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q133',
    category: 'Safety Margins',
    prompt: 'What is the minimum safe following gap you should leave in dry weather at national speed limit?',
    options: ['One second', 'Two seconds ("Only a fool breaks the two-second rule")', 'One car length', 'Five metres'],
    correctIndex: 1,
    explanation:
      'Rule 126: Leave at least a 2-second time gap in dry conditions, doubling to at least 4 seconds in wet weather and even more on ice.',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q134',
    category: 'Safety Margins',
    prompt: 'If you double your driving speed from 30 mph to 60 mph, what happens to your braking distance?',
    options: ['It doubles', 'It roughly quadruples (4 times longer)', 'It increases by 50%', 'It stays the same if ABS is fitted'],
    correctIndex: 1,
    explanation:
      'Kinetic energy increases with the square of speed (30 mph braking = 14m; 60 mph braking = 55m, nearly 4 times as far).',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q135',
    category: 'Safety Margins',
    prompt: 'Which factors directly increase your THINKING distance?',
    options: [
      'Bald tyres and wet road surface',
      'Tiredness, alcohol, drugs, mobile phone distraction, and higher speed',
      'Downhill gradient and worn brake pads',
      'Carrying a roof box',
    ],
    correctIndex: 1,
    explanation:
      'Thinking distance depends on driver reaction time and speed. Braking distance depends on tyres, brakes, load, gradient, and road surface.',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q136',
    category: 'Safety Margins',
    prompt: 'What is "aquaplaning" and what is its warning sign?',
    options: [
      'A tyre blowout on dry tarmac',
      'Water builds up under the tyres faster than tread can clear it, causing steering to feel suddenly light and unresponsive',
      'Brakes freezing solid in winter',
      'Engine stalling in shallow puddles',
    ],
    correctIndex: 1,
    explanation:
      'If steering goes light in standing water, ease off the accelerator gently to let speed drop until tyre tread regains contact with the tarmac. Do NOT brake harshly or yank the wheel.',
    highwayCodeRef: 'Highway Code Rule 227',
  },
  {
    id: 'uk-q137',
    category: 'Safety Margins',
    prompt: 'After driving through deep standing water (flood), what safety check should you carry out?',
    options: [
      'Rev the engine in neutral while stationary',
      'Test your brakes gently as soon as safe to dry out wet brake discs/pads',
      'Switch off headlights immediately',
      'Drive at 60 mph to spin water off',
    ],
    correctIndex: 1,
    explanation:
      'Rule 121: Wet brakes lose efficiency. Lightly apply footbrake pressure while moving slowly when safe to dry them before relying on full braking power.',
    highwayCodeRef: 'Highway Code Rule 121',
  },
  {
    id: 'uk-q138',
    category: 'Safety Margins',
    prompt: 'When driving in icy conditions, what gear and technique help prevent wheelspin?',
    options: [
      'Pull away in the highest practical gear (e.g. 2nd gear) with gentle clutch and accelerator inputs',
      'Use 1st gear with full throttle',
      'Maintain the same following gap as on dry summer roads',
      'Pump the handbrake around corners',
    ],
    correctIndex: 0,
    explanation:
      'Rule 230: In snow and ice, select 2nd gear to pull away gently, keep speeds low, and leave up to 10 times the normal stopping gap.',
    highwayCodeRef: 'Highway Code Rule 230',
  },
  {
    id: 'uk-q139',
    category: 'Safety Margins',
    prompt: 'What should you do if you enter a rear-wheel skid on a slippery surface?',
    options: [
      'Brake as hard as possible',
      'Ease off the accelerator/brake and steer smoothly into the direction of the skid',
      'Pull the handbrake firmly',
      'Steer sharply away from the direction the rear is sliding',
    ],
    correctIndex: 1,
    explanation:
      'Steering smoothly in the direction the rear is moving ("into the skid") while releasing harsh braking helps tyres regain grip.',
    highwayCodeRef: 'Highway Code Winter Driving',
  },
  {
    id: 'uk-q140',
    category: 'Safety Margins',
    prompt: 'Which road user is particularly vulnerable to sudden side gusts in windy weather?',
    options: [
      'Motorcyclists, cyclists, high-sided lorries, and cars towing caravans',
      'Low sports cars in town centres only',
      'Underground trains',
      'Trams on fixed rails',
    ],
    correctIndex: 0,
    explanation:
      'Rule 232: High winds can blow cyclists, motorcyclists, and high-sided vehicles sideways unexpectedly — give extra clearance when passing.',
    highwayCodeRef: 'Highway Code Rule 232',
  },
  {
    id: 'uk-q141',
    category: 'Safety Margins',
    prompt: 'What does contraflow or surface "black ice" look like on winter roads?',
    options: [
      'A thick white blanket of snow',
      'Invisible or glossy dark patches that look wet, accompanied by very quiet tyre noise',
      'Bright orange frost crystals',
      'Dry dusty tarmac',
    ],
    correctIndex: 1,
    explanation:
      'Black ice is transparent over dark tarmac, especially in shaded bridges and under trees; unusually quiet tyre noise and light steering are key warning clues.',
    highwayCodeRef: 'Highway Code Rule 228',
  },
  {
    id: 'uk-q142',
    category: 'Safety Margins',
    prompt: 'What is "contraflow braking" or "engine braking" useful for on a long steep downhill gradient?',
    options: [
      'Coasting in neutral saves brake pads',
      'Selecting a lower gear lets the engine help restrain speed so footbrakes do not overheat and fade',
      'Applying the handbrake partially down the hill',
      'Switching off the engine down hills',
    ],
    correctIndex: 1,
    explanation:
      'Rule 122: Never coast down hills in neutral or with the clutch pressed. Selecting a lower gear uses engine compression to prevent brake fade.',
    highwayCodeRef: 'Highway Code Rule 122',
  },
  {
    id: 'uk-q143',
    category: 'Safety Margins',
    prompt: 'When driving in heavy rain on a 60 mph road, why should you keep well back from a large lorry ahead?',
    options: [
      'To improve radio reception',
      'To avoid heavy blinding spray and give yourself extra visibility and stopping distance',
      'Because lorry brake lights do not work in rain',
      'To reduce tyre temperature',
    ],
    correctIndex: 1,
    explanation:
      'HGVs throw up dense spray that reduces visibility; dropping back clears your windscreen and creates safer braking space.',
    highwayCodeRef: 'Highway Code Rule 227',
  },
  {
    id: 'uk-q144',
    category: 'Safety Margins',
    prompt: 'What minimum visibility rule triggers legal use of front or rear fog lights?',
    options: [
      'Visibility reduced to less than 100 metres (328 feet)',
      'Whenever light drizzle starts',
      'Visibility below 500 metres',
      'Every evening after 6 pm in autumn',
    ],
    correctIndex: 0,
    explanation:
      'Rule 226: You MUST use headlights when visibility is seriously reduced (generally below 100 metres), and you MAY use front or rear fog lights — switching fog lights off once visibility improves.',
    highwayCodeRef: 'Highway Code Rule 226',
  },
  {
    id: 'uk-q145',
    category: 'Safety Margins',
    prompt: 'When parked or driving in thick fog at night, why is it dangerous to rely solely on Automatic Headlights?',
    options: [
      'Automatic headlights only illuminate full beam',
      'Daytime fog may be bright enough to prevent light sensors from switching on your rear tail lights',
      'Sensors drain the fuel tank faster',
      'Automatic lights stay permanently off under 40 mph',
    ],
    correctIndex: 1,
    explanation:
      'Daytime running lights (DRLs) do not always turn on rear tail lights, and light sensors can misread bright daytime fog — turn dipped headlights on manually.',
    highwayCodeRef: 'Highway Code Rule 226',
  },

  // Essential Documents (15 new)
  {
    id: 'uk-q146',
    category: 'Essential Documents',
    prompt: 'How long does an MOT test certificate remain valid for a car that is over 3 years old?',
    options: ['6 months', '12 months', '24 months', '36 months'],
    correctIndex: 1,
    explanation:
      'Once a car is 3 years old (4 years in Northern Ireland), it must pass a valid MOT roadworthiness inspection every 12 months.',
    highwayCodeRef: 'Highway Code Legal Requirements',
  },
  {
    id: 'uk-q147',
    category: 'Essential Documents',
    prompt: 'When are you legally allowed to drive a vehicle on a public road WITHOUT a valid MOT certificate?',
    options: [
      'For up to 14 days after expiry to get paid',
      'Only when driving directly to a pre-booked MOT test or to a place of repair for a failed MOT (provided no dangerous faults exist)',
      'Whenever the car has full comprehensive insurance',
      'On Sundays only',
    ],
    correctIndex: 1,
    explanation:
      'You may only drive an un-MOT’d car straight to a pre-booked MOT appointment or pre-arranged repair if it is still roadworthy and insured.',
    highwayCodeRef: 'Highway Code Legal Requirements',
  },
  {
    id: 'uk-q148',
    category: 'Essential Documents',
    prompt: 'What is the statutory minimum age to supervise a learner driver in a car in the UK?',
    options: ['18 years old', '21 years old, holding a full valid licence for that vehicle category for at least 3 years', '25 years old', '21 years old with 1 year of driving experience'],
    correctIndex: 1,
    explanation:
      'A supervising driver must be at least 21, qualified to drive the vehicle type (manual if the car is manual), and have held a full UK/EEA licence for at least 3 years.',
    highwayCodeRef: 'Highway Code Rule 90',
  },
  {
    id: 'uk-q149',
    category: 'Essential Documents',
    prompt: 'What happens under the Road Traffic (New Drivers) Act if a newly qualified driver accumulates 6 or more penalty points within 2 years of passing their first practical test?',
    options: [
      'They receive a written warning only',
      'Their full driving licence is revoked and they revert to provisional learner status requiring re-taking both Theory and Practical tests',
      'Their insurance premium freezes for 2 years',
      'They only retake the practical test',
    ],
    correctIndex: 1,
    explanation:
      'Under the New Drivers Act, reaching 6+ points within 2 years of first passing revokes the full licence, requiring re-application for a provisional licence and passing both theory and practical tests again.',
    highwayCodeRef: 'GOV.UK New Drivers Act',
  },
  {
    id: 'uk-q150',
    category: 'Essential Documents',
    prompt: 'When you buy or sell a used car in Great Britain, who is responsible for notifying the DVLA of the change of registered keeper?',
    options: [
      'The buyer only',
      'The registered keeper (seller) must notify DVLA immediately and pass the V5C/2 green slip to the new keeper',
      'The local police station',
      'The MOT testing garage',
    ],
    correctIndex: 1,
    explanation:
      'The outgoing keeper notifies DVLA online or via the V5C logbook so tax and liability records update immediately.',
    highwayCodeRef: 'Highway Code Documents',
  },
  {
    id: 'uk-q151',
    category: 'Essential Documents',
    prompt: 'What is a Statutory Off Road Notification (SORN)?',
    options: [
      'A permit allowing untaxed cars to park on quiet residential streets',
      'A declaration to DVLA that a vehicle is kept completely off public roads and therefore does not require road tax or insurance',
      'An emergency motorway breakdown pass',
      'A replacement for a driving licence',
    ],
    correctIndex: 1,
    explanation:
      'Under Continuous Insurance Enforcement, any vehicle not covered by a valid SORN MUST be taxed and insured — even if parked on a private driveway unless SORN’d.',
    highwayCodeRef: 'Highway Code Legal Requirements',
  },
  {
    id: 'uk-q152',
    category: 'Essential Documents',
    prompt: 'Which level of motor insurance covers ONLY injury to other people and damage to other people’s property (not damage to your own car)?',
    options: [
      'Fully Comprehensive',
      'Third Party Only',
      'Third Party, Fire and Theft',
      'No-claims protected cover',
    ],
    correctIndex: 1,
    explanation:
      'Third Party Only is the legal minimum insurance required on UK public roads, covering liability to others but not theft or damage to your own vehicle.',
    highwayCodeRef: 'Highway Code Insurance',
  },
  {
    id: 'uk-q153',
    category: 'Essential Documents',
    prompt: 'If a police officer asks you to produce your driving licence, insurance certificate, and MOT at a roadside stop and you do not have them with you, how long do you have to present them at a police station?',
    options: ['24 hours', '7 days', '14 days', '28 days'],
    correctIndex: 1,
    explanation:
      'You have 7 days to produce the requested valid documents at a nominated police station.',
    highwayCodeRef: 'Highway Code Legal Requirements',
  },
  {
    id: 'uk-q154',
    category: 'Essential Documents',
    prompt: 'What is the maximum fine for driving a vehicle with defective brakes, steering, or bald tyres (per bald tyre)?',
    options: [
      '£100 fine only with no points',
      'Up to £2,500 fine, 3 penalty points per defective tyre, and possible disqualification',
      '£500 fine and 1 point total',
      'Warning notice only',
    ],
    correctIndex: 1,
    explanation:
      'Each illegal/bald tyre carries 3 penalty points and up to £2,500 fine — four bald tyres can mean 12 points and an immediate ban.',
    highwayCodeRef: 'Highway Code Penalties',
  },
  {
    id: 'uk-q155',
    category: 'Essential Documents',
    prompt: 'At what age does a standard UK full car driving licence need to be renewed for the first time under the photocard rules (other than 10-year photo renewals)?',
    options: [
      'Photo updates every 10 years, and the licence entitlement itself requires medical/age renewal at age 70 (then every 3 years)',
      'Every 5 years from age 21',
      'Never after passing the test',
      'Only at age 80',
    ],
    correctIndex: 0,
    explanation:
      'Photocard licences must have an updated photo every 10 years, and driving entitlement expires at age 70 unless renewed every 3 years thereafter.',
    highwayCodeRef: 'GOV.UK Driving Licence Rules',
  },
  {
    id: 'uk-q156',
    category: 'Essential Documents',
    prompt: 'Which medical conditions MUST you legally report to the DVLA?',
    options: [
      'Only broken bones that heal within 2 weeks',
      'Any notifiable condition affecting safe driving such as epilepsy, blackouts, certain insulin-treated diabetes, serious heart conditions, or sight loss',
      'Mild seasonal hay fever only',
      'None if your GP says you feel okay',
    ],
    correctIndex: 1,
    explanation:
      'Rule 90 / GOV.UK: Drivers MUST inform DVLA of any condition or disability that could affect safe control of a vehicle. Failing to do so can invalidate insurance and lead to a £1,000 fine.',
    highwayCodeRef: 'Highway Code Rule 90',
  },
  {
    id: 'uk-q157',
    category: 'Essential Documents',
    prompt: 'Can you use your own car for the UK practical driving test if it has a known recall defect or warning light on?',
    options: [
      'Yes, any car with fuel is accepted',
      'No — it must be roadworthy, tax/MOT valid, insured for test use, fitted with an extra interior mirror for the examiner, and free of warning lights like airbag/ABS faults',
      'Only if the learner signs a waiver',
      'Only for automatic cars',
    ],
    correctIndex: 1,
    explanation:
      'DVSA examiners inspect your test vehicle before starting and will cancel the test if tyres, lights, L-plates, extra examiner mirror, or dashboard warning lights fail legal test standards.',
    highwayCodeRef: 'DVSA Practical Test Rules',
  },
  {
    id: 'uk-q158',
    category: 'Essential Documents',
    prompt: 'What must be displayed on a vehicle whenever a provisional licence holder is driving?',
    options: [
      'Green P-plates front and rear',
      'Clean, regulation-size red L-plates (or D-plates in Wales) front and rear — removed when a full licence holder drives alone',
      'A roof beacon',
      'L-plate in the rear window only',
    ],
    correctIndex: 1,
    explanation:
      'Regulation L-plates (red L on white background) must be clearly visible at both front and rear; remove or cover them when no learner is driving.',
    highwayCodeRef: 'Highway Code Rule 90',
  },
  {
    id: 'uk-q159',
    category: 'Essential Documents',
    prompt: 'How does the law treat using a cover note vs full certificate of motor insurance?',
    options: [
      'Cover notes are illegal to drive with',
      'A temporary cover note provides full proof of insurance for the stated dates until the main certificate arrives',
      'Cover notes only cover off-road parking',
      'Cover notes exclude third-party injury',
    ],
    correctIndex: 1,
    explanation:
      'A cover note is temporary legal proof of valid motor insurance while the full policy document is being issued.',
    highwayCodeRef: 'Highway Code Insurance',
  },
  {
    id: 'uk-q160',
    category: 'Essential Documents',
    prompt: 'What is the eyesight requirement you must satisfy at the very start of the UK practical driving test?',
    options: [
      'Read a standard UK number plate from 20 metres (20.5m for old-style plates) in good daylight, wearing glasses/lenses if needed',
      'Read a number plate from 10 metres',
      'Identify three road signs from 50 metres',
      'No eyesight check takes place on the practical test',
    ],
    correctIndex: 0,
    explanation:
      'Rule 92: If you fail to read a number plate from 20 metres at the start of your practical test, the test ends immediately as a fail and DVLA may be notified.',
    highwayCodeRef: 'Highway Code Rule 92',
  },
];
