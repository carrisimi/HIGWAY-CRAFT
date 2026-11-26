import type { TheoryQuestion } from '../../logic/theoryEngine';

export const USERS_AND_HAZARDS_QUESTIONS: TheoryQuestion[] = [
  // Vulnerable Road Users (17 new)
  {
    id: 'uk-q161',
    category: 'Vulnerable Road Users',
    prompt: 'Under the updated Highway Code Hierarchy of Road Users (Rule H2), who should drivers give way to at a junction?',
    options: [
      'Only pedestrians crossing on marked Zebra stripes',
      'Pedestrians crossing or waiting to cross a road into which or from which you are turning',
      'Only pedestrians wearing high-visibility jackets',
      'Only cyclists approaching from the right',
    ],
    correctIndex: 1,
    explanation:
      'Rule H2 states at a junction you should give way to pedestrians crossing or waiting to cross a road into which or from which you are turning.',
    highwayCodeRef: 'Highway Code Rule H2',
  },
  {
    id: 'uk-q162',
    category: 'Vulnerable Road Users',
    prompt: 'What minimum clearance should you leave when overtaking a cyclist at speeds up to 30 mph according to Highway Code Rule 163?',
    options: [
      'At least 0.5 metres',
      'At least 1.5 metres (increasing to 2 metres or more at higher speeds)',
      '1 metre regardless of speed',
      'Enough room for a wing mirror only',
    ],
    correctIndex: 1,
    explanation:
      'Rule 163 specifies leaving at least 1.5 metres when overtaking cyclists at speeds up to 30 mph, and giving them even more space at higher speeds.',
    highwayCodeRef: 'Highway Code Rule 163',
  },
  {
    id: 'uk-q163',
    category: 'Vulnerable Road Users',
    prompt: 'When overtaking a horse and rider on a narrow road, what speed and gap does Highway Code Rule 215 recommend?',
    options: [
      'Pass at 40 mph with headlights flashing so the horse sees you',
      'Pass wide and slowly at under 10 mph with at least 2 metres of space, avoiding revving the engine or sounding the horn',
      'Sound one short warning beep before passing',
      'Accelerate sharply past to spend less time beside them',
    ],
    correctIndex: 1,
    explanation:
      'Rule 215 advises slowing down to a maximum of 10 mph, being patient, leaving at least 2 metres clearance, and avoiding loud engine revs or horns that can startle horses.',
    highwayCodeRef: 'Highway Code Rule 215',
  },
  {
    id: 'uk-q164',
    category: 'Vulnerable Road Users',
    prompt: 'What does the "Dutch Reach" technique help prevent when exiting a parked car?',
    options: [
      'Leaving the handbrake unlatched',
      'Opening a car door directly into the path of passing cyclists or motorcyclists',
      'Forgetting to switch off headlights',
      'Scrape marks on alloy wheels',
    ],
    correctIndex: 1,
    explanation:
      'Rule 239 recommends opening your door using the hand furthest from it (the Dutch Reach), naturally turning your torso and head to check mirrors and blind spots for cyclists.',
    highwayCodeRef: 'Highway Code Rule 239',
  },
  {
    id: 'uk-q165',
    category: 'Vulnerable Road Users',
    prompt: 'Why should drivers allow cyclists to ride in the centre of a lane on quiet streets, narrow lanes, or approaching junctions?',
    options: [
      'Cyclists are breaking the law if they leave the gutter',
      'Rule 72 explains riding in the centre ("primary position") improves cyclist visibility and prevents drivers squeezing dangerously past where the road is too narrow',
      'It only applies to electric scooters',
      'It allows cyclists to double the speed limit',
    ],
    correctIndex: 1,
    explanation:
      'Rule 72 / 213 encourages cyclists to position visibly away from car doors and kerbs at junctions or narrow sections; wait patiently until it is genuinely safe to overtake.',
    highwayCodeRef: 'Highway Code Rule 213',
  },
  {
    id: 'uk-q166',
    category: 'Vulnerable Road Users',
    prompt: 'What is a Toucan crossing designed for?',
    options: [
      'Pedestrians and cyclists to cross together without cyclists having to dismount',
      'Horses and riders only',
      'Blind pedestrians with guide dogs only',
      'Tramway crossings',
    ],
    correctIndex: 0,
    explanation:
      'Remember "two can cross": a Toucan crossing is shared by both pedestrians and cyclists side by side.',
    highwayCodeRef: 'Highway Code Rule 198',
  },
  {
    id: 'uk-q167',
    category: 'Vulnerable Road Users',
    prompt: 'What should you be alert for when a pedestrian holding a white stick with a RED band is waiting to cross?',
    options: [
      'The person is both deaf and visually impaired (deafblind)',
      'They are a road safety marshal',
      'They only need guidance from cyclists',
      'It indicates a temporary school patrol',
    ],
    correctIndex: 0,
    explanation:
      'A white cane indicates visual impairment; red bands on a white stick signify the pedestrian is also deaf or hard of hearing — be extra patient and never use your horn.',
    highwayCodeRef: 'Highway Code Rule 207',
  },
  {
    id: 'uk-q168',
    category: 'Vulnerable Road Users',
    prompt: 'What is the coloured Advanced Stop Line (ASL) box marked with a bicycle symbol ahead of traffic lights for?',
    options: [
      'Motorcycles waiting to filter',
      'Providing cyclists a safe, visible area ahead of motor vehicles while lights are red — stop at the first white line if occupied or on red',
      'Delivery van unloading space',
      'Emergency ambulance turn-around bay',
    ],
    correctIndex: 1,
    explanation:
      'Rule 178: If lights turn red, stop behind the FIRST white line. If you entered on green and lights turn amber/red before clearing, stop at the second line without blocking cyclists if possible.',
    highwayCodeRef: 'Highway Code Rule 178',
  },
  {
    id: 'uk-q169',
    category: 'Vulnerable Road Users',
    prompt: 'What maximum speed are Class 3 mobility scooters allowed to travel at on the ROAD (carriageway) vs on the pavement?',
    options: [
      'Up to 8 mph on roads and 4 mph on pavements',
      'Up to 15 mph on roads and 8 mph on pavements',
      'Mobility scooters may never cross a road',
      '20 mph on roads',
    ],
    correctIndex: 0,
    explanation:
      'Class 3 powered wheelchairs and mobility scooters are limited to 4 mph on footways and up to 8 mph on roads, often displaying a flashing amber beacon on dual carriageways.',
    highwayCodeRef: 'Highway Code Rule 36',
  },
  {
    id: 'uk-q170',
    category: 'Vulnerable Road Users',
    prompt: 'Why must you check both blind spots and mirrors carefully before turning left across a cycle lane or kerb?',
    options: [
      'Motorists always have priority over cyclists going straight ahead',
      'Under Rule H3, do not cut across cyclists, horse riders, or horse-drawn vehicles going straight ahead — wait until they have passed safely',
      'Only electric bikes are covered by H3',
      'Turning left never crosses a cyclist’s path',
    ],
    correctIndex: 1,
    explanation:
      'Rule H3 forbids cutting across cyclists continuing straight ahead when turning into or out of a junction or changing lanes.',
    highwayCodeRef: 'Highway Code Rule H3',
  },
  {
    id: 'uk-q171',
    category: 'Vulnerable Road Users',
    prompt: 'When you see a stationary ice cream van or school bus with hazard lights flashing on a residential street, what is the primary danger?',
    options: [
      'Engine exhaust fumes only',
      'Children may run suddenly from behind or in front of the vehicle into your path without looking',
      'The vehicle is about to perform a high-speed U-turn',
      'Street lighting may turn off',
    ],
    correctIndex: 1,
    explanation:
      'Rule 209: Drive slowly and look under/around stationary buses and ice cream vans for children’s feet and movement.',
    highwayCodeRef: 'Highway Code Rule 209',
  },
  {
    id: 'uk-q172',
    category: 'Vulnerable Road Users',
    prompt: 'Why should you look twice at junctions specifically for motorcyclists?',
    options: [
      'Motorcycles do not have headlights',
      'Their narrower silhouette can be hidden behind windscreen pillars or misjudged in speed and distance',
      'Motorcycles never use indicators',
      'Motorcycles always ride in the gutter',
    ],
    correctIndex: 1,
    explanation:
      'Rule 211: "Think Bike" — always lean and look around car A-pillars/B-pillars at junctions because slim motorcycles are easily obscured.',
    highwayCodeRef: 'Highway Code Rule 211',
  },
  {
    id: 'uk-q173',
    category: 'Vulnerable Road Users',
    prompt: 'When may you drive over a public pavement (footway)?',
    options: [
      'To bypass temporary roadworks queues',
      'Only to gain lawful access to a property or driveway, giving priority to pedestrians',
      'Whenever unloading parcels for less than 3 minutes',
      'Whenever parking in a narrow street outside London',
    ],
    correctIndex: 1,
    explanation:
      'Rule 145: You MUST NOT drive on or over a pavement, footpath, or bridleway except to gain lawful access to property or in an emergency.',
    highwayCodeRef: 'Highway Code Rule 145',
  },
  {
    id: 'uk-q174',
    category: 'Vulnerable Road Users',
    prompt: 'What does a Pegasus crossing provide for?',
    options: [
      'Trams and buses',
      'Horse riders as well as pedestrians, with a higher mounted push-button control',
      'Motorcycles crossing dual carriageways',
      'Heavy goods vehicles only',
    ],
    correctIndex: 1,
    explanation:
      'Pegasus crossings feature mounted rider buttons at saddle height alongside standard pedestrian controls.',
    highwayCodeRef: 'Highway Code Rule 198',
  },
  {
    id: 'uk-q175',
    category: 'Vulnerable Road Users',
    prompt: 'When approaching a pedestrian standing at the kerbside of a Zebra crossing, what must you do?',
    options: [
      'Wave them across quickly',
      'Look out for them, slow down, and be prepared to stop to give way — MUST give way once they step onto the crossing',
      'Sound the horn to confirm they see you',
      'Only stop if two or more pedestrians are waiting',
    ],
    correctIndex: 1,
    explanation:
      'Rule 195: Slow down and prepare to stop if someone is waiting to cross; you MUST give way once a pedestrian has moved onto a Zebra crossing. Never wave pedestrians across in case another driver overtakes.',
    highwayCodeRef: 'Highway Code Rule 195',
  },
  {
    id: 'uk-q176',
    category: 'Vulnerable Road Users',
    prompt: 'If a cyclist ahead is wobbling slightly on a windy day or wet cobbles, what is your safest response?',
    options: [
      'Overtake immediately with the horn sounding',
      'Hold back patiently until the road is wide and straight enough to pass with full clearance',
      'Flash full beam to steady them',
      'Squeeze past within 50 cm',
    ],
    correctIndex: 1,
    explanation:
      'Cyclists may swerve unexpectedly to avoid drains, potholes, or gusts; holding back protects them and avoids dangerous head-on risks.',
    highwayCodeRef: 'Highway Code Rule 213',
  },
  {
    id: 'uk-q177',
    category: 'Vulnerable Road Users',
    prompt: 'What happens if you drive across a dropped kerb where tactile blister paving is installed for blind pedestrians?',
    options: [
      'Nothing if you leave 30 cm space',
      'You block a vital accessible crossing point for wheelchair users and visually impaired pedestrians',
      'It is permitted for 20 minutes outside shops',
      'Only motorbikes are barred from blocking dropped kerbs',
    ],
    correctIndex: 1,
    explanation:
      'Rule 243: Do not stop or park where the kerb has been lowered to help wheelchair users and powered mobility vehicles.',
    highwayCodeRef: 'Highway Code Rule 243',
  },

  // Hazard Awareness, Alertness, Attitude, Incidents (38 new)
  {
    id: 'uk-q178',
    category: 'Hazard Awareness',
    prompt: 'What are the three steps of a safe Mirror–Signal–Manoeuvre (MSM) routine when you spot a hazard ahead?',
    options: [
      'Signal first, turn steering, then check mirror',
      'Check mirrors early, assess whether a signal is needed to help others, then adjust Position, Speed, and Gear smoothly',
      'Brake sharply first, then look in the door mirror',
      'Use hazard lights before every corner',
    ],
    correctIndex: 1,
    explanation:
      'Always check mirrors BEFORE signalling or changing speed/position so you know how following traffic will be affected.',
    highwayCodeRef: 'Highway Code Routine MSM',
  },
  {
    id: 'uk-q179',
    category: 'Hazard Awareness',
    prompt: 'What does a flashing amber beacon on a vehicle parked partly on the carriageway on a rural road usually warn of?',
    options: [
      'An ice cream van serving customers',
      'A road maintenance, utility, or recovery vehicle that may have workers near the carriageway',
      'A learner driver reversing',
      'An official funeral procession',
    ],
    correctIndex: 1,
    explanation:
      'Flashing amber beacons warn of slow, stationary, or abnormal-load hazard vehicles; slow down and expect workers or cables.',
    highwayCodeRef: 'Highway Code Rule 221',
  },
  {
    id: 'uk-q180',
    category: 'Hazard Awareness',
    prompt: 'When approaching a blind summit (brow of a hill) on a country road, why must you NEVER overtake?',
    options: [
      'Fuel consumption peaks uphill',
      'You cannot see oncoming vehicles, cyclists, or pedestrians hidden just beyond the crest',
      'Brakes automatically lock uphill',
      'Double yellow lines cover all hills',
    ],
    correctIndex: 1,
    explanation:
      'Rule 167: Never overtake where you cannot see far enough ahead — such as approaching a brow of a hill, corner, or dip.',
    highwayCodeRef: 'Highway Code Rule 167',
  },
  {
    id: 'uk-q181',
    category: 'Hazard Awareness',
    prompt: 'At a rural railway level crossing with half-barriers, flashing red lights start just before the barriers drop. What MUST you do?',
    options: [
      'Accelerate quickly across before the barrier descends',
      'Stop immediately behind the white stop line and wait until the lights stop flashing and barriers rise fully',
      'Zig-zag slowly round the half-barrier if no train is visible',
      'Switch off headlights and reverse',
    ],
    correctIndex: 1,
    explanation:
      'Rule 293: Steady amber means stop unless unsafe; twin flashing red lights mean you MUST stop. Another train can arrive immediately from the opposite direction after one passes.',
    highwayCodeRef: 'Highway Code Rule 293',
  },
  {
    id: 'uk-q182',
    category: 'Hazard Awareness',
    prompt: 'When driving past a line of parked cars on a terraced street, what early clues signal a parked vehicle may be about to pull out or open a door?',
    options: [
      'Exhaust smoke/condensation, turned front wheels, brake/reversing lights, or an occupant visible in the driver mirror',
      'Clean hubcaps and folded wing mirrors',
      'Blue disabled badge on dashboard',
      'Closed rear boot lid',
    ],
    correctIndex: 0,
    explanation:
      'Looking through windscreens for heads, checking front wheels turned outward, exhaust vapour, or glowing lights gives vital early warning before a car moves.',
    highwayCodeRef: 'DVSA Hazard Perception Guide',
  },
  {
    id: 'uk-q183',
    category: 'Hazard Awareness',
    prompt: 'What hazard do bright sunny mornings or low winter sun create, and how should you react?',
    options: [
      'Dazzle reduces forward vision — lower sun visors, wear sunglasses if appropriate, keep glass spotless inside/out, and slow down',
      'Switch on full-beam headlights to balance glare',
      'Follow the vehicle ahead as closely as possible',
      'Drive faster to leave shaded sections quickly',
    ],
    correctIndex: 0,
    explanation:
      'Low sun blinds drivers and reflects off dirty windscreens; clean glass inside and out and slow down whenever visibility drops.',
    highwayCodeRef: 'Highway Code Rule 237',
  },
  {
    id: 'uk-q184',
    category: 'Hazard Awareness',
    prompt: 'While following a long articulated lorry preparing to turn LEFT at a narrow urban junction, why might the lorry swing out slightly to the RIGHT first?',
    options: [
      'The driver is unsure which road to take',
      'The trailer’s rear wheels cut inside the tractor path, so the driver needs extra room on the right to clear the left kerb',
      'It is inviting cars to overtake on its left',
      'Its brakes have failed',
    ],
    correctIndex: 1,
    explanation:
      'Rule 221: Never undertake or squeeze up the inside (left) of a long vehicle signalling or positioned near a junction — its rear trailer sweeps sharply across the inside lane.',
    highwayCodeRef: 'Highway Code Rule 221',
  },
  {
    id: 'uk-q185',
    category: 'Hazard Awareness',
    prompt: 'What does a green traffic sign with an orange/black square detour symbol (triangle, circle, diamond) help you navigate?',
    options: [
      'Scenic tourist loops only',
      'Official motorway/trunk-road emergency diversion routes when a section ahead is closed',
      'Cycle paths',
      'Private toll roads',
    ],
    correctIndex: 1,
    explanation:
      'Black shapes on yellow backgrounds (circle, triangle, square, diamond) mark emergency diversion routes guiding drivers back onto the main road past closures.',
    highwayCodeRef: 'Highway Code Signs',
  },
  {
    id: 'uk-q186',
    category: 'Hazard Awareness',
    prompt: 'What particular danger exists on roads right after a dry spell when light rain first starts falling?',
    options: [
      'Tyres harden rapidly',
      'Oil, rubber dust, and grease mix with water to form a very slippery film before heavier rain washes it away',
      'Traffic lights turn off briefly',
      'Road markings dissolve temporarily',
    ],
    correctIndex: 1,
    explanation:
      'The first few minutes of rain after dry weather create exceptionally greasy tarmac with reduced grip — increase stopping distances immediately.',
    highwayCodeRef: 'Highway Code Rule 227',
  },
  {
    id: 'uk-q187',
    category: 'Alertness',
    prompt: 'Using a handheld mobile phone (even to scroll playlists or check maps while stopped in traffic queues or at red lights) carries what penalty in Great Britain?',
    options: [
      '£50 fine with no points if stationary at traffic lights',
      '6 penalty points and a £200 fine (enough to revoke a new driver’s licence within 2 years)',
      '1 penalty point only',
      'Allowed if the car has automatic Start-Stop',
    ],
    correctIndex: 1,
    explanation:
      'Rule 149: It is illegal to hold and use a phone, sat-nav, or device while driving — including stopped at traffic lights or in queues. Penalty: 6 points + £200 fine.',
    highwayCodeRef: 'Highway Code Rule 149',
  },
  {
    id: 'uk-q188',
    category: 'Alertness',
    prompt: 'How often should you generally check your interior rear-view mirror while driving on a normal road?',
    options: [
      'Only when reversing',
      'Regularly every few seconds, and always before changing speed, position, or signalling',
      'Once every 5 minutes',
      'Only after overtaking',
    ],
    correctIndex: 1,
    explanation:
      'Frequent mirror scans maintain continuous situational awareness of following traffic, emergency vehicles, and filtering motorcycles.',
    highwayCodeRef: 'Highway Code Rule 159',
  },
  {
    id: 'uk-q189',
    category: 'Alertness',
    prompt: 'Why is talking on a HANDS-FREE mobile phone still discouraged by the Highway Code?',
    options: [
      'It drains the vehicle alternator',
      'Conversation still splits mental concentration, slowing reaction times and narrowing hazard awareness',
      'It interferes with ABS brakes',
      'Hands-free is equally illegal as handheld',
    ],
    correctIndex: 1,
    explanation:
      'Rule 149 warns that even hands-free calls distract attention significantly; pull over safely and switch off the engine before important calls.',
    highwayCodeRef: 'Highway Code Rule 149',
  },
  {
    id: 'uk-q190',
    category: 'Alertness',
    prompt: 'Before pulling away from a parked position on the kerb, what must you check LAST just before moving off?',
    options: [
      'Your fuel gauge',
      'Your right-side blind spot (over your right shoulder) for cyclists, motorcyclists, or overtaking cars',
      'Your glovebox latch',
      'The passenger footwell',
    ],
    correctIndex: 1,
    explanation:
      'Rule 159: Use Prepare–Observe–Move: check mirrors and finish with a decisive blind-spot shoulder check right before moving out.',
    highwayCodeRef: 'Highway Code Rule 159',
  },
  {
    id: 'uk-q191',
    category: 'Alertness',
    prompt: 'If a prescription or over-the-counter medicine label says "May cause drowsiness", what should you do?',
    options: [
      'Take half a dose and drive carefully',
      'Do not drive — ask a doctor or pharmacist for a non-drowsy alternative or arrange other transport',
      'Drink an energy drink before driving',
      'Only drive during daylight',
    ],
    correctIndex: 1,
    explanation:
      'Rule 96: Driving while impaired by prescription or over-the-counter medicines is illegal and carries the same penalties as illegal drug-driving.',
    highwayCodeRef: 'Highway Code Rule 96',
  },
  {
    id: 'uk-q192',
    category: 'Alertness',
    prompt: 'When driving at night along an unlit country road, when should you switch from full-beam headlights back to dipped beam?',
    options: [
      'Only when oncoming drivers flash you',
      'As soon as oncoming headlights appear, when overtaking, or when approaching behind another vehicle so you do not dazzle drivers ahead',
      'Keep full beam on past cyclists',
      'Never on 60 mph roads',
    ],
    correctIndex: 1,
    explanation:
      'Rule 114: Dip headlights when meeting oncoming vehicles or cyclists, and when following behind traffic so mirrors do not dazzle the driver ahead.',
    highwayCodeRef: 'Highway Code Rule 114',
  },
  {
    id: 'uk-q193',
    category: 'Alertness',
    prompt: 'How do you avoid being dazzled by an oncoming driver who forgets to dip their headlights at night?',
    options: [
      'Stare directly into their headlights and leave yours on full beam',
      'Look slightly toward the left kerb edge and slow down until your eyes recover',
      'Switch off all your lights momentarily',
      'Steer toward the centre white line',
    ],
    correctIndex: 1,
    explanation:
      'Rule 115: If dazzled by oncoming headlights, slow down or stop if necessary and focus toward the near-side kerb edge rather than the bright lamps.',
    highwayCodeRef: 'Highway Code Rule 115',
  },
  {
    id: 'uk-q194',
    category: 'Alertness',
    prompt: 'Why should you update your sat-nav destination ONLY before setting off or when parked safely with the engine off?',
    options: [
      'GPS satellites disconnect above 30 mph',
      'Touching or programming a mounted device takes eyes and attention away from developing hazards and risks prosecution for careless driving',
      'Sat-nav mounts overheat when moving',
      'It uses excessive fuel',
    ],
    correctIndex: 1,
    explanation:
      'Configure routes prior to moving; never hold a phone or sat-nav while driving.',
    highwayCodeRef: 'Highway Code Rule 149',
  },
  {
    id: 'uk-q195',
    category: 'Attitude',
    prompt: 'Another driver cuts sharply in front of you on a dual carriageway, forcing you to brake. What is the safest response?',
    options: [
      'Flash full-beam lights and sound your horn angrily',
      'Drop back calmly to restore a safe two-second separation gap and avoid escalating conflict',
      'Tailgate close behind so they notice your disapproval',
      'Overtake immediately on the left',
    ],
    correctIndex: 1,
    explanation:
      'Rule 147: Stay calm, do not react aggressively or retaliate, and re-establish a safe braking margin immediately.',
    highwayCodeRef: 'Highway Code Rule 147',
  },
  {
    id: 'uk-q196',
    category: 'Attitude',
    prompt: 'A driver behind you is tailgating dangerously close on a single carriageway. How should you deal with them?',
    options: [
      'Tap the brake pedal sharply to frighten them',
      'Gradually increase your gap to the vehicle ahead so you can brake gently, and let them overtake safely when opportunity arises',
      'Accelerate well above the speed limit',
      'Switch on rear fog lights in clear weather',
    ],
    correctIndex: 1,
    explanation:
      'Extending the safety space in front of you prevents a sudden stop causing a rear-end shunt from the tailgater.',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q197',
    category: 'Attitude',
    prompt: 'An emergency vehicle with flashing blue lights and sirens approaches behind you at a red traffic light. What should you NOT do?',
    options: [
      'Stay alert and check mirrors to see where they intend to pass',
      'Drive through a red traffic light or mount a crowded pavement illegally where unsafe',
      'Pull cleanly aside when safe and legal without blocking junctions',
      'Wait calmly if there is no safe space until the signal turns green',
    ],
    correctIndex: 1,
    explanation:
      'Rule 219: Keep calm and let emergency vehicles pass safely, but do NOT endanger pedestrians, break traffic laws, or jump red lights into crossing traffic.',
    highwayCodeRef: 'Highway Code Rule 219',
  },
  {
    id: 'uk-q198',
    category: 'Attitude',
    prompt: 'When someone flashes their headlights at you as you wait to emerge from a side road, what does the Highway Code state this means?',
    options: [
      'It is an official signal giving you guaranteed priority',
      'Only flash headlights to let other road users know you are there — NEVER assume a flashed headlight means it is safe to pull out',
      'It means speed up',
      'It indicates a speed camera ahead',
    ],
    correctIndex: 1,
    explanation:
      'Rule 110 & 111: Flashing headlights means ONLY "I am here". Always check all directions yourself before moving.',
    highwayCodeRef: 'Highway Code Rule 110',
  },
  {
    id: 'uk-q199',
    category: 'Attitude',
    prompt: 'What do green "P" plates displayed on a newly passed driver’s car mean to other road users?',
    options: [
      'The driver holds a special police permit',
      'The driver recently passed their test and may appreciate extra patience and space',
      'The car is restricted to 40 mph',
      'The driver is still on a provisional licence',
    ],
    correctIndex: 1,
    explanation:
      'Green Probationary (P) plates are optional in Great Britain and ask fellow drivers to show extra courtesy and space.',
    highwayCodeRef: 'DVSA Guidance',
  },
  {
    id: 'uk-q200',
    category: 'Attitude',
    prompt: 'When a large vehicle is overtaking you on a dual carriageway in heavy spray, how can you show good road attitude?',
    options: [
      'Speed up so it stays alongside longer',
      'Hold a steady speed or ease off slightly to help it complete the overtake safely and quickly',
      'Move closer to the centre white line',
      'Turn off your windscreen wipers',
    ],
    correctIndex: 1,
    explanation:
      'Rule 168: If a driver is trying to overtake you, maintain a steady speed and slow down slightly if needed to let them pass safely.',
    highwayCodeRef: 'Highway Code Rule 168',
  },
  {
    id: 'uk-q201',
    category: 'Attitude',
    prompt: 'On a narrow country lane with passing places, you meet an oncoming car closer to a passing place on YOUR right (their left). What should happen?',
    options: [
      'You drive across into the right-hand passing place',
      'Wait opposite the passing place on your left side while the oncoming driver pulls into the bay on their left',
      'Both cars reverse blindly around the bend',
      'Sound horns until the smaller car reverses',
    ],
    correctIndex: 1,
    explanation:
      'Rule 155: Never pull into a passing place on your right-hand side; stop opposite it on your left so the oncoming vehicle can use the bay on its left.',
    highwayCodeRef: 'Highway Code Rule 155',
  },
  {
    id: 'uk-q202',
    category: 'Attitude',
    prompt: 'What is "defensive driving"?',
    options: [
      'Driving 15 mph below every limit regardless of road conditions',
      'Anticipating mistakes by other road users early, keeping safe space margins, and driving smoothly and considerately',
      'Blocking overtaking lanes to prevent speeding',
      'Refusing to let vehicles merge',
    ],
    correctIndex: 1,
    explanation:
      'Defensive driving combines proactive observation, safe separation distances, and calm restraint so unexpected actions by others do not cause collisions.',
    highwayCodeRef: 'Highway Code General Principles',
  },
  {
    id: 'uk-q203',
    category: 'Incidents & Accidents',
    prompt: 'You are first at the scene of a road traffic collision where a motorcyclist is lying unconscious on the tarmac. What should you NEVER do unless there is immediate fire/danger?',
    options: [
      'Call 999 and protect the scene from approaching traffic',
      'Remove the motorcyclist’s crash helmet',
      'Check if they are breathing',
      'Switch off nearby vehicle ignitions',
    ],
    correctIndex: 1,
    explanation:
      'Annex 7: Never remove a motorcyclist’s helmet unless essential to clear an obstructed airway/CPR, as moving the head can worsen spinal injuries.',
    highwayCodeRef: 'Highway Code Annex 7',
  },
  {
    id: 'uk-q204',
    category: 'Incidents & Accidents',
    prompt: 'At a collision scene, what is the FIRST priority before rushing to treat injured casualties?',
    options: [
      'Take photos for social media',
      'Ensure your own safety and warn approaching traffic (hazard lights, switch off engines) so no secondary crash occurs',
      'Give casualties water to drink',
      'Move damaged cars immediately without checking injuries',
    ],
    correctIndex: 1,
    explanation:
      'Annex 7 follows DRABC (Danger, Response, Airway, Breathing, Circulation) — check for danger first so rescuers do not become additional casualties.',
    highwayCodeRef: 'Highway Code Annex 7',
  },
  {
    id: 'uk-q205',
    category: 'Incidents & Accidents',
    prompt: 'If a casualty at a crash scene is bleeding heavily from a wound in their arm (with no embedded object), how should you control the bleeding?',
    options: [
      'Wash the wound under cold water for 10 minutes first',
      'Apply firm direct pressure over the wound using a clean pad or dressing while wearing gloves if available',
      'Tie a tight tourniquet around their neck',
      'Leave the wound uncovered to clot in the air',
    ],
    correctIndex: 1,
    explanation:
      'Annex 7: Firm, steady direct pressure over a clean pad controls external bleeding effectively (do not press on embedded objects; pad around them).',
    highwayCodeRef: 'Highway Code Annex 7',
  },
  {
    id: 'uk-q206',
    category: 'Incidents & Accidents',
    prompt: 'You accidentally hit and damage a parked car on a quiet street and cannot find the owner. What MUST you do by law?',
    options: [
      'Drive away if the damage looks under £100',
      'Leave your name, address, and registration clearly on the vehicle AND report the collision to the police as soon as practicable (within 24 hours)',
      'Only tell your insurer next month',
      'Wait for 5 minutes and then drive off',
    ],
    correctIndex: 1,
    explanation:
      'Rule 286: If damage or injury occurs and you cannot exchange details at the scene, you MUST report the incident to a police station or officer within 24 hours.',
    highwayCodeRef: 'Highway Code Rule 286',
  },
  {
    id: 'uk-q207',
    category: 'Incidents & Accidents',
    prompt: 'If a car catches fire inside a road tunnel, what should you do?',
    options: [
      'Try to reverse back out of the tunnel',
      'Stop if safe, switch off the engine, leave the key in the ignition, evacuate immediately on foot via emergency exits, and raise the alarm',
      'Stay inside with windows wound up',
      'Turn on full-beam headlights',
    ],
    correctIndex: 1,
    explanation:
      'Rule 290: Leave keys in the car (so emergency crews can move it if needed), exit immediately to emergency walkways, and use tunnel emergency phones.',
    highwayCodeRef: 'Highway Code Rule 290',
  },
  {
    id: 'uk-q208',
    category: 'Incidents & Accidents',
    prompt: 'What are the key signs of medical shock in a collision casualty, and how should you care for them?',
    options: [
      'Pale, cold, clammy skin and rapid shallow breathing — keep them warm, lie them down calmly, do not give food/drink, and reassure until 999 arrives',
      'Give them hot sweet tea immediately',
      'Walk them briskly up and down the verge',
      'Splash icy water on their face',
    ],
    correctIndex: 0,
    explanation:
      'Annex 7: Treat shock by keeping the casualty still, lying down if injuries allow, warm with a coat/blanket, and withholding food or drink in case surgery is needed.',
    highwayCodeRef: 'Highway Code Annex 7',
  },
  {
    id: 'uk-q209',
    category: 'Incidents & Accidents',
    prompt: 'How far behind your broken-down vehicle should you place a red warning triangle on an ordinary road (NEVER on a motorway)?',
    options: [
      'At least 45 metres (147 feet) behind on the same side of the road',
      '2 metres behind the rear bumper',
      'In the middle of the opposite lane',
      '300 metres behind',
    ],
    correctIndex: 0,
    explanation:
      'Rule 274: Place a warning triangle at least 45 metres (147 feet) behind your vehicle on non-motorway roads to give oncoming traffic ample warning.',
    highwayCodeRef: 'Highway Code Rule 274',
  },
  {
    id: 'uk-q210',
    category: 'Incidents & Accidents',
    prompt: 'After a vehicle carrying an orange rectangular "Hazard Warning" plate with numbers crashes and spills liquid, what should you tell the 999 operator?',
    options: [
      'The colour of the lorry cab only',
      'Stay upwind well clear of fumes and read the hazard warning plate codes/numbers from a safe distance',
      'Wash the liquid down the roadside drain',
      'Light a flare to warn oncoming traffic',
    ],
    correctIndex: 1,
    explanation:
      'Rule 285: Dangerous goods vehicles carry Kemler/UN codes on orange plates; stay well away from fumes and pass those exact codes to emergency services.',
    highwayCodeRef: 'Highway Code Rule 285',
  },
  {
    id: 'uk-q211',
    category: 'Incidents & Accidents',
    prompt: 'What should you do if an adult casualty is unresponsive and NOT breathing normally?',
    options: [
      'Place them in the recovery position only',
      'Call 999 immediately (speakerphone) and begin Chest Compressions (CPR) at 100–120 per minute',
      'Wait 5 minutes to see if they wake up',
      'Give sips of water',
    ],
    correctIndex: 1,
    explanation:
      'Annex 7 / Resuscitation Council UK: Call 999, request an AED if nearby, and start continuous chest compressions cleanly in the centre of the chest.',
    highwayCodeRef: 'Highway Code Annex 7',
  },
  {
    id: 'uk-q212',
    category: 'Incidents & Accidents',
    prompt: 'Under UK law, when a collision results in personal injury to another person, what additional document must you produce at the scene or police station within 24 hours?',
    options: [
      'V5C registration book',
      'Valid Certificate of Motor Insurance',
      'Driving school receipt',
      'Car purchase invoice',
    ],
    correctIndex: 1,
    explanation:
      'Rule 286: Whenever personal injury occurs, you MUST stop, share details, and produce valid insurance details to anyone with reasonable grounds (or report to police within 24h and produce within 7 days).',
    highwayCodeRef: 'Highway Code Rule 286',
  },
  {
    id: 'uk-q213',
    category: 'Incidents & Accidents',
    prompt: 'Your vehicle breaks down on a single-track railway level crossing and the warning bells start ringing. What is the single most critical action?',
    options: [
      'Keep cranking the starter motor until the train stops',
      'Get everyone out of the vehicle immediately, get clear of the crossing behind barriers/gates, and use the crossing telephone to alert the signaller',
      'Try to push the car solo off the rails while holding a phone',
      'Stay inside with seatbelt on',
    ],
    correctIndex: 1,
    explanation:
      'Rule 299: Human life always comes first. Evacuate the vehicle immediately, move well clear of the tracks, and use the railway crossing telephone to warn the signaller.',
    highwayCodeRef: 'Highway Code Rule 299',
  },
  {
    id: 'uk-q214',
    category: 'Hazard Awareness',
    prompt: 'When approaching a roundabout where a long bus or lorry is turning right in the left lane, what should you expect?',
    options: [
      'It is lost and turning left',
      'Long vehicles sometimes straddle or use wider left lanes when turning right round tight roundabouts — stay back and never pass alongside it',
      'It will reverse',
      'Sound horn and overtake on the right',
    ],
    correctIndex: 1,
    explanation:
      'Rule 187 / 221: Watch large vehicles’ signals and wheel angles closely; stay back and do not pull up alongside them on roundabouts.',
    highwayCodeRef: 'Highway Code Rule 187',
  },
  {
    id: 'uk-q215',
    category: 'Attitude',
    prompt: 'What should you do when passing roadworks where temporary traffic lights or a "STOP / GO" lollipop sign is operating?',
    options: [
      'Follow the car in front through on STOP if only 2 seconds late',
      'Stop cleanly at the temporary stop board or red signal and wait patiently until directed GO or green',
      'Drive onto the opposite grass verge',
      'Sound the horn at workers to speed up',
    ],
    correctIndex: 1,
    explanation:
      'Rule 288: Temporary STOP signs and signals at roadworks are legally binding and protect workers inches from live traffic.',
    highwayCodeRef: 'Highway Code Rule 288',
  },
];
