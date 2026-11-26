import type { TheoryQuestion } from '../logic/theoryEngine';
import { SIGNS_AND_RULES_QUESTIONS } from './questions/signsAndRulesQuestions';
import { VEHICLE_AND_MARGINS_QUESTIONS } from './questions/vehicleAndMarginsQuestions';
import { USERS_AND_HAZARDS_QUESTIONS } from './questions/usersAndHazardsQuestions';

const CORE_THEORY_QUESTIONS: TheoryQuestion[] = [
  // 1. Road & Traffic Signs
  {
    id: 'uk-q1',
    category: 'Road & Traffic Signs',
    signId: 'national-speed',
    prompt: 'What does this circular white sign with a diagonal black stripe mean on a single carriageway road?',
    options: [
      'No waiting or loading at any time',
      'National speed limit applies (60 mph for cars)',
      'National speed limit applies (70 mph for cars)',
      'Road ahead is derestricted for heavy goods vehicles only',
    ],
    correctIndex: 1,
    explanation:
      'On a single carriageway, the national speed limit sign indicates 60 mph for cars and motorcycles (50 mph if towing a trailer). On dual carriageways and motorways, it is 70 mph for cars.',
    highwayCodeRef: 'Highway Code Rule 124',
  },
  {
    id: 'uk-q2',
    category: 'Road & Traffic Signs',
    signId: 'clearway',
    prompt: 'What does a circular blue sign with a red cross (X) over it instruct drivers to do?',
    options: [
      'No entry for vehicular traffic',
      'No stopping (clearway) — do not stop, even to pick up or set down passengers',
      'No waiting except for loading and unloading',
      'Crossroads ahead with no priority',
    ],
    correctIndex: 1,
    explanation:
      'A blue circle with a red border and red diagonal cross means "No stopping" (an urban or rural clearway). You must not stop for any reason except in an emergency or for traffic signals.',
    highwayCodeRef: 'Highway Code Signs: Prohibitory',
  },
  {
    id: 'uk-q3',
    category: 'Road & Traffic Signs',
    signId: 'give-way',
    prompt: 'You see an inverted red-bordered triangle ahead with a dashed double white line across the road. What must you do?',
    options: [
      'Always come to a complete standstill before proceeding',
      'Give way to traffic on the major road and stop if necessary',
      'Priority is yours over oncoming vehicles',
      'Prepare to merge into a motorway slip road',
    ],
    correctIndex: 1,
    explanation:
      'The inverted triangle is the Give Way sign. Slow down, look both ways, and be prepared to stop to give priority to vehicles on the major road.',
    highwayCodeRef: 'Highway Code Rule 172',
  },
  {
    id: 'uk-q4',
    category: 'Road & Traffic Signs',
    signId: 'stop',
    prompt: 'When approaching an octagonal red STOP sign with a solid white line across the road, what is legally required?',
    options: [
      'Slow down to 5 mph and roll across if clear',
      'Sound your horn before emerging',
      'Come to a complete stop behind the solid white line before moving on',
      'Only stop if other traffic is approaching from the right',
    ],
    correctIndex: 2,
    explanation:
      'A STOP sign is placed where visibility is severely restricted. You MUST bring all four wheels to a complete standstill at the solid white line before proceeding.',
    highwayCodeRef: 'Highway Code Rule 171',
  },
  {
    id: 'uk-q5',
    category: 'Road & Traffic Signs',
    signId: 'motorway-red-x',
    prompt: 'You are driving on a smart motorway and see a red flashing X displayed on the gantry above your lane. What must you do?',
    options: [
      'Reduce speed to 40 mph and continue with hazard lights on',
      'Leave that lane as soon as it is safe to do so — the lane is closed',
      'Use the hard shoulder immediately',
      'Continue until you reach the next exit slip road',
    ],
    correctIndex: 1,
    explanation:
      'A red X means the lane is closed due to an incident, obstruction, or roadworks ahead. Driving past a red X is illegal and dangerous; move safely into an open lane.',
    highwayCodeRef: 'Highway Code Rule 258',
  },
  {
    id: 'uk-q6',
    category: 'Road & Traffic Signs',
    signId: 'no-entry',
    prompt: 'What does a circular red sign with a horizontal white bar indicate?',
    options: [
      'End of controlled parking zone',
      'No entry for vehicles',
      'Level crossing without barrier ahead',
      'Roadworks ahead — single file traffic',
    ],
    correctIndex: 1,
    explanation:
      'A red disc with a horizontal white bar means No Entry for vehicular traffic, usually protecting one-way streets or motorway exit slip roads.',
    highwayCodeRef: 'Highway Code Signs: Prohibitory',
  },
  {
    id: 'uk-q7',
    category: 'Road & Traffic Signs',
    signId: 'roundabout',
    prompt: 'When you see this triangular warning sign with three circular arrows, what should you prepare for?',
    options: [
      'A roundabout ahead — check mirrors and prepare to give way to traffic from the right',
      'A mini-roundabout where you have automatic priority',
      'One-way gyratory system with traffic merging from the left only',
      'U-turns prohibited for the next 400 yards',
    ],
    correctIndex: 0,
    explanation:
      'This triangular warning sign alerts you to a roundabout ahead. Apply the Mirror–Signal–Manoeuvre routine and give priority to traffic approaching from your right.',
    highwayCodeRef: 'Highway Code Rule 184',
  },
  {
    id: 'uk-q8',
    category: 'Road & Traffic Signs',
    signId: 'minimum-speed',
    prompt: 'What does a circular blue sign showing "30" in white numerals mean?',
    options: [
      'Maximum speed limit of 30 mph',
      'Recommended speed in wet weather',
      'Minimum speed limit of 30 mph (unless unsafe to maintain)',
      'Advisory speed limit for articulated lorries',
    ],
    correctIndex: 2,
    explanation:
      'Blue circular signs give positive instructions. A blue circle with "30" means you must travel at least 30 mph unless road or traffic conditions make it unsafe.',
    highwayCodeRef: 'Highway Code Signs: Mandatory',
  },
  {
    id: 'uk-q9',
    category: 'Road & Traffic Signs',
    signId: 'dual-ends',
    prompt: 'What hazard does a triangular sign showing two lanes narrowing into one indicate?',
    options: [
      'Dual carriageway ends ahead — oncoming traffic will share the road',
      'Motorway service area exit ahead',
      'Passing places on a single-track road',
      'Bus lane begins in 100 yards',
    ],
    correctIndex: 0,
    explanation:
      'This warning sign indicates the end of a dual carriageway. You are moving onto a two-way single carriageway where you may encounter oncoming traffic.',
    highwayCodeRef: 'Highway Code Signs: Warning',
  },
  {
    id: 'uk-q10',
    category: 'Road & Traffic Signs',
    signId: 'keep-left',
    prompt: 'What does a circular blue sign with a white arrow pointing downward to the left instruct you to do?',
    options: [
      'Turn left immediately at the next junction',
      'Pass on the left of the traffic island or bollard',
      'Left lane closed ahead',
      'Cycle lane on the left side only',
    ],
    correctIndex: 1,
    explanation:
      'Mounted on bollards and traffic islands, this mandatory sign tells drivers to keep to the left of the obstacle.',
    highwayCodeRef: 'Highway Code Signs: Mandatory',
  },

  // 2. Rules of the Road
  {
    id: 'uk-q11',
    category: 'Rules of the Road',
    prompt: 'In the UK, what is the sequence of traffic lights before they turn green?',
    options: [
      'Red -> Amber -> Green',
      'Red -> Flashing Amber -> Green',
      'Red -> Red and Amber together -> Green',
      'Red -> Green directly',
    ],
    correctIndex: 2,
    explanation:
      'UK traffic lights show Red, then Red and Amber together (meaning prepare to go, but stay behind the stop line), then Green.',
    highwayCodeRef: 'Highway Code Rule 109',
  },
  {
    id: 'uk-q12',
    category: 'Rules of the Road',
    signId: 'box-junction',
    prompt: 'When may you enter a yellow criss-cross box junction and stop inside it?',
    options: [
      'Whenever the traffic lights ahead are green',
      'Only when turning right and your exit road is clear, but you are waiting for oncoming traffic',
      'When following a bus or emergency vehicle closely',
      'Never under any circumstances',
    ],
    correctIndex: 1,
    explanation:
      'You must not enter a box junction unless your exit is clear. The one exception is when turning right: you may enter and wait in the box if prevented from turning only by oncoming traffic or other vehicles waiting to turn right.',
    highwayCodeRef: 'Highway Code Rule 174',
  },
  {
    id: 'uk-q13',
    category: 'Rules of the Road',
    prompt: 'What is the maximum speed limit for a car on a single carriageway road with street lights spaced less than 200 yards (183 metres) apart, unless signs show otherwise?',
    options: ['20 mph', '30 mph', '40 mph', '50 mph'],
    correctIndex: 1,
    explanation:
      'A system of street lighting (lamps placed not more than 200 yards / 183 metres apart) automatically indicates a 30 mph speed limit in England, Scotland, and Northern Ireland (20 mph in most restricted roads in Wales), unless signs state otherwise.',
    highwayCodeRef: 'Highway Code Rule 124',
  },
  {
    id: 'uk-q14',
    category: 'Rules of the Road',
    prompt: 'Which way should you signal when taking the first exit (to the left) at a standard roundabout?',
    options: [
      'Signal right on approach, then left at the exit',
      'No signal on approach, signal left after passing the island',
      'Signal left on approach and keep signalling left until you have left the roundabout',
      'Use hazard warning lights if traffic is heavy',
    ],
    correctIndex: 2,
    explanation:
      'When taking the first exit to the left, keep in the left-hand lane, signal left on approach, and maintain the left signal until you clear the exit.',
    highwayCodeRef: 'Highway Code Rule 186',
  },
  {
    id: 'uk-q15',
    category: 'Rules of the Road',
    prompt: 'What do double broken white lines across the road at a junction mean?',
    options: [
      'Stop completely at all times',
      'Give way to traffic on the major road',
      'Level crossing stop line',
      'Pedestrian priority zone',
    ],
    correctIndex: 1,
    explanation:
      'Double broken white lines mark a Give Way line. You must give way to traffic travelling on the major road.',
    highwayCodeRef: 'Highway Code Rule 172',
  },
  {
    id: 'uk-q16',
    category: 'Rules of the Road',
    prompt: 'When may you overtake on the left on a multi-lane carriageway?',
    options: [
      'Whenever the right-hand lane has a slower driver',
      'Only in congested slow-moving queues where traffic in the right-hand lane is moving more slowly, or when a vehicle ahead is signalling to turn right',
      'At any time on dual carriageways if there is room',
      'Only when flashing your headlights first',
    ],
    correctIndex: 1,
    explanation:
      'Do not overtake on the left unless traffic is moving in queues and the queue on your right is moving more slowly than you are, or when a vehicle in front has signalled to turn right and there is room to pass safely on the left.',
    highwayCodeRef: 'Highway Code Rule 268',
  },
  {
    id: 'uk-q17',
    category: 'Rules of the Road',
    prompt: 'What does a single solid white line along the centre of the road on your side mean?',
    options: [
      'Do not cross or straddle the line unless turning into a side road/property, or passing a stationary vehicle, pedal cycle, horse, or road maintenance vehicle travelling at 10 mph or less',
      'Overtaking is permitted whenever you can see 50 metres ahead',
      'Clearway — no stopping',
      'Two-way cycle track ahead',
    ],
    correctIndex: 0,
    explanation:
      'You must not cross or straddle a solid white line on your side unless it is safe and you need to enter premises/a side road, or pass a stationary vehicle, or overtake a pedal cycle, horse, or road maintenance vehicle going 10 mph or less.',
    highwayCodeRef: 'Highway Code Rule 129',
  },
  {
    id: 'uk-q18',
    category: 'Rules of the Road',
    prompt: 'Where must you NOT park or wait at any time?',
    options: [
      'Opposite a junction more than 15 metres away',
      'On zig-zag lines at a pedestrian crossing or within 10 metres (32 feet) of a junction',
      'On a single yellow line outside controlled hours',
      'On the left-hand side of a quiet residential street facing traffic flow',
    ],
    correctIndex: 1,
    explanation:
      'Stopping or parking on crossing zig-zag lines blocks visibility for pedestrians and drivers and is strictly illegal. You also must not park opposite or within 10 metres of a junction.',
    highwayCodeRef: 'Highway Code Rules 191 & 243',
  },

  // 3. Vulnerable Road Users
  {
    id: 'uk-q19',
    category: 'Vulnerable Road Users',
    signId: 'zebra-crossing',
    prompt: 'As you approach a Zebra crossing, a pedestrian is waiting on the pavement ready to cross. Under the updated Hierarchy of Road Users, what should you do?',
    options: [
      'Continue if they have not yet stepped onto the stripes',
      'Flash your headlights to wave them across',
      'Slow down and stop to give way to the pedestrian waiting to cross',
      'Sound your horn briefly so they wait for you to pass',
    ],
    correctIndex: 2,
    explanation:
      'Under the Highway Code (Rule H2 & Rule 195), drivers should give way when a pedestrian is waiting to cross at a Zebra crossing, and MUST give way once they have moved onto the crossing.',
    highwayCodeRef: 'Highway Code Rules H2 & 195',
  },
  {
    id: 'uk-q20',
    category: 'Vulnerable Road Users',
    prompt: 'At a Puffin crossing, what does the red-and-amber flashing phase mean?',
    options: [
      'Puffin crossings do not have a flashing amber phase — they use kerbside sensors and switch directly from red to red-and-amber',
      'Proceed immediately even if pedestrians are still crossing',
      'Give way to pedestrians still on the crossing before moving',
      'Only cyclists may cross during flashing amber',
    ],
    correctIndex: 0,
    explanation:
      'A Pelican crossing has a flashing amber light (meaning give way to pedestrians still crossing). A Puffin crossing uses kerbside and on-crossing detectors instead, and has no flashing amber phase.',
    highwayCodeRef: 'Highway Code Rule 196',
  },
  {
    id: 'uk-q21',
    category: 'Vulnerable Road Users',
    prompt: 'How much lateral space should you leave as a minimum when overtaking a cyclist at speeds up to 30 mph?',
    options: [
      'At least 0.5 metres',
      'At least 1.0 metre',
      'At least 1.5 metres (5 feet), and more at higher speeds',
      'Half the width of your vehicle',
    ],
    correctIndex: 2,
    explanation:
      'Highway Code Rule 163 states you should leave at least 1.5 metres when overtaking cyclists at speeds of up to 30 mph, and give them more space when overtaking at higher speeds.',
    highwayCodeRef: 'Highway Code Rule 163',
  },
  {
    id: 'uk-q22',
    category: 'Vulnerable Road Users',
    prompt: 'You are turning left from a main road into a side road, and a pedestrian is waiting to cross the side road. What should you do?',
    options: [
      'Accelerate cleanly around the corner before they step off',
      'Give way to the pedestrian waiting to cross the side road',
      'Sound your horn to warn them you are turning',
      'Proceed because vehicles on the main road always have priority',
    ],
    correctIndex: 1,
    explanation:
      'Rule H2 states that at a junction you should give way to pedestrians crossing or waiting to cross a road into which or from which you are turning.',
    highwayCodeRef: 'Highway Code Rule H2',
  },
  {
    id: 'uk-q23',
    category: 'Vulnerable Road Users',
    prompt: 'When passing a horse and rider on a narrow country lane, what speed and space guideline does the Highway Code give?',
    options: [
      'Pass quickly at 30 mph to minimise time alongside',
      'Pass slowly at under 10 mph and leave at least 2 metres of space',
      'Sound your horn gently to alert the horse',
      'Rev your engine lightly so the rider hears you',
    ],
    correctIndex: 1,
    explanation:
      'Rule 215 advises passing horses slowly at a maximum of 10 mph, allowing at least 2 metres of clearance, and avoiding revving or sounding the horn.',
    highwayCodeRef: 'Highway Code Rule 215',
  },
  {
    id: 'uk-q24',
    category: 'Vulnerable Road Users',
    signId: 'school-patrol',
    prompt: 'A school crossing patrol officer steps into the road holding a "STOP — Children" sign. What must you do?',
    options: [
      'Slow down and edge past once children reach the kerb',
      'Stop until the patrol officer signals it is safe to proceed',
      'Only stop during school term hours',
      'Give way only if children are actively walking in your lane',
    ],
    correctIndex: 1,
    explanation:
      'You are legally required to stop when directed by a school crossing patrol displaying a Stop sign, and wait until they clear the carriageway.',
    highwayCodeRef: 'Highway Code Rule 210',
  },

  // 4. Safety Margins
  {
    id: 'uk-q25',
    category: 'Safety Margins',
    prompt: 'What is the overall stopping distance (thinking + braking distance) for a car travelling at 30 mph in dry conditions?',
    options: ['12 metres (40 feet)', '23 metres (75 feet)', '36 metres (118 feet)', '53 metres (175 feet)'],
    correctIndex: 1,
    explanation:
      'At 30 mph, typical thinking distance is 9 metres (30 ft) and braking distance is 14 metres (45 ft), giving a total stopping distance of 23 metres (75 feet), roughly 6 car lengths.',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q26',
    category: 'Safety Margins',
    prompt: 'In wet weather on an open road, how should you adjust the gap between you and the vehicle in front?',
    options: [
      'Keep the standard two-second gap',
      'Double the gap to at least four seconds',
      'Halve the gap so spray stays below your windscreen',
      'Stay 1.5 car lengths behind at 60 mph',
    ],
    correctIndex: 1,
    explanation:
      'Stopping distances in wet weather are at least double those required on dry roads, so leave at least a 4-second gap ("Only a fool breaks the two-second rule" twice over).',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q27',
    category: 'Safety Margins',
    prompt: 'What is the typical overall stopping distance at 70 mph on a dry road?',
    options: ['53 metres (175 feet)', '73 metres (240 feet)', '96 metres (315 feet)', '120 metres (394 feet)'],
    correctIndex: 2,
    explanation:
      'At 70 mph, thinking distance is 21 m (70 ft) and braking distance is 75 m (245 ft), totalling 96 metres (315 feet) — about 24 car lengths.',
    highwayCodeRef: 'Highway Code Rule 126',
  },
  {
    id: 'uk-q28',
    category: 'Safety Margins',
    prompt: 'Your vehicle begins to aquaplane on standing water at speed (steering suddenly feels very light). What should you do?',
    options: [
      'Brake hard immediately to regain grip',
      'Ease off the accelerator smoothly and keep the steering straight until tyres regain grip',
      'Steer sharply toward the kerb',
      'Switch to reverse gear briefly',
    ],
    correctIndex: 1,
    explanation:
      'Aquaplaning happens when water builds up under the tyres. Do not brake harshly or turn suddenly; ease off the accelerator to let speed drop until the tyres make contact with the road again.',
    highwayCodeRef: 'Highway Code Rule 227',
  },
  {
    id: 'uk-q29',
    category: 'Safety Margins',
    prompt: 'What is the minimum legal tread depth for car tyres across the central three-quarters of the breadth of the tread in the UK?',
    options: ['1.0 mm', '1.6 mm', '2.5 mm', '3.0 mm'],
    correctIndex: 1,
    explanation:
      'Car tyres must have at least 1.6 mm of tread depth across the central three-quarters of the tread width and around the entire circumference.',
    highwayCodeRef: 'Highway Code Annex 6',
  },

  // 5. Motorway Rules
  {
    id: 'uk-q30',
    category: 'Motorway Rules',
    prompt: 'What colour are the reflective road studs (cat’s eyes) between the main carriageway and the hard shoulder on a UK motorway?',
    options: ['White', 'Amber', 'Red', 'Green'],
    correctIndex: 2,
    explanation:
      'Motorway stud colours: Red = left edge / hard shoulder; White = between lanes; Amber = central reservation (right edge); Green = slip road exits and lay-bys.',
    highwayCodeRef: 'Highway Code Rule 132',
  },
  {
    id: 'uk-q31',
    category: 'Motorway Rules',
    prompt: 'On a three-lane motorway, which lane should you normally drive in?',
    options: [
      'The middle lane to avoid merging traffic',
      'The left-hand lane unless overtaking',
      'The right-hand lane if travelling at 70 mph',
      'Any lane as long as you maintain 60 mph',
    ],
    correctIndex: 1,
    explanation:
      'Always keep to the left-hand lane unless overtaking. Return to the left-hand lane as soon as you have safely passed slower vehicles.',
    highwayCodeRef: 'Highway Code Rule 264',
  },
  {
    id: 'uk-q32',
    category: 'Motorway Rules',
    prompt: 'What is the maximum speed limit for a car towing a caravan or trailer on a UK motorway?',
    options: ['50 mph', '60 mph', '65 mph', '70 mph'],
    correctIndex: 1,
    explanation:
      'Cars towing a trailer or caravan are restricted to 60 mph on motorways and dual carriageways, and may not use the right-hand (outermost) lane of a 3+ lane motorway.',
    highwayCodeRef: 'Highway Code Rule 124 & 265',
  },
  {
    id: 'uk-q33',
    category: 'Motorway Rules',
    prompt: 'When joining a motorway from an acceleration slip road, who has priority?',
    options: [
      'Joining traffic has priority over lane 1',
      'Traffic already travelling on the motorway has priority',
      'Vehicles alternate zip-merge fashion by law',
      'Heavy goods vehicles must move to lane 2 for you',
    ],
    correctIndex: 1,
    explanation:
      'Traffic already on the motorway has priority. Match your speed to the flow of traffic on the slip road and merge safely into a suitable gap without forcing others to swerve or brake.',
    highwayCodeRef: 'Highway Code Rule 259',
  },
  {
    id: 'uk-q34',
    category: 'Motorway Rules',
    prompt: 'When may you drive on the hard shoulder of a motorway?',
    options: [
      'To undertake slow-moving traffic in lane 1',
      'Only in an emergency, or when directed by police, traffic officers, or overhead gantry signs showing a speed limit above it',
      'Whenever you need to answer an urgent phone call',
      'To reach an exit 500 yards ahead during congestion',
    ],
    correctIndex: 1,
    explanation:
      'You must not drive on the hard shoulder except in an emergency or when overhead signs/police specifically open it as a running lane (All-Lane Running / Dynamic Hard Shoulder).',
    highwayCodeRef: 'Highway Code Rule 263',
  },

  // 6. Alertness & Attitude
  {
    id: 'uk-q35',
    category: 'Alertness',
    prompt: 'Before moving off from a parked position at the side of the road, what final check must you make just before releasing the handbrake?',
    options: [
      'Flash headlights once',
      'Check the exterior and interior mirrors plus the blind spot over your right shoulder',
      'Sound the horn softly',
      'Engage second gear first',
    ],
    correctIndex: 1,
    explanation:
      'Before moving off, use the POM routine (Prepare, Observe, Move) and check all mirrors plus your right-shoulder blind spot for cyclists, motorcyclists, or approaching traffic.',
    highwayCodeRef: 'Highway Code Rule 159',
  },
  {
    id: 'uk-q36',
    category: 'Alertness',
    prompt: 'When are you permitted to use a hand-held mobile phone while sitting in the driver’s seat with the engine running?',
    options: [
      'When stopped at red traffic lights',
      'In stationary motorway traffic jams',
      'Only to call 999 or 112 in a genuine emergency where it is unsafe or impractical to stop',
      'When checking a navigation route at under 10 mph',
    ],
    correctIndex: 2,
    explanation:
      'It is illegal to hold and use a phone, sat-nav, or device while driving—including when stopped at traffic lights or in queues—except in a genuine 999/112 emergency if unsafe to stop.',
    highwayCodeRef: 'Highway Code Rule 149',
  },
  {
    id: 'uk-q37',
    category: 'Attitude',
    prompt: 'What is the proper reason to flash your headlights at another road user according to the Highway Code?',
    options: [
      'To thank another driver for giving way',
      'To warn oncoming drivers of a speed camera ahead',
      'Only to let other road users know you are there',
      'To tell a slower car in front to move over',
    ],
    correctIndex: 2,
    explanation:
      'Rule 110 states: Only flash your headlights to let other road users know that you are there. Do not flash to convey any other message or intimidate.',
    highwayCodeRef: 'Highway Code Rule 110',
  },
  {
    id: 'uk-q38',
    category: 'Attitude',
    prompt: 'At an unmarked crossroads where no road has priority signs or markings, who has right of way?',
    options: [
      'Traffic approaching from the right always has priority',
      'Larger vehicles have priority',
      'Nobody has automatic priority — approach slowly, look both ways, and proceed with care',
      'Traffic heading north-south has priority',
    ],
    correctIndex: 2,
    explanation:
      'At unmarked junctions nobody has priority. Slow down, look carefully in all directions, and be ready to stop if another vehicle is emerging.',
    highwayCodeRef: 'Highway Code Rule 170',
  },
  {
    id: 'uk-q39',
    category: 'Alertness',
    prompt: 'When driving through a long tunnel, which lights should you switch on before entering?',
    options: [
      'Hazard warning lights',
      'Dipped headlights (even if the tunnel is well lit)',
      'Rear fog lights',
      'Full-beam main headlights',
    ],
    correctIndex: 1,
    explanation:
      'Switch on dipped headlights before entering a tunnel, remove sunglasses, and tune to local radio traffic bulletins if marked.',
    highwayCodeRef: 'Highway Code Rule 226',
  },

  // 7. Hazard Awareness
  {
    id: 'uk-q40',
    category: 'Hazard Awareness',
    prompt: 'You are driving behind a long articulated lorry approaching a left-hand bend or mini-roundabout. Why might it swing out to the right first?',
    options: [
      'The driver is letting faster cars overtake on the left',
      'It needs extra room so its rear trailer wheels do not mount the kerb',
      'Its steering alignment is faulty',
      'It is preparing to make a U-turn',
    ],
    correctIndex: 1,
    explanation:
      'Long vehicles cut in sharply at the rear wheels, so they often swing wide before turning. Never squeeze up the inside (left) of a turning lorry.',
    highwayCodeRef: 'Highway Code Rule 221',
  },
  {
    id: 'uk-q41',
    category: 'Hazard Awareness',
    prompt: 'When may you use rear fog lights?',
    options: [
      'Whenever it begins to drizzle lightly',
      'Only when visibility is seriously reduced, generally to less than 100 metres (328 feet)',
      'At dusk to make your car more visible on motorways',
      'Whenever driving on unlit country lanes',
    ],
    correctIndex: 1,
    explanation:
      'Only use front or rear fog lights when visibility drops below 100 metres, and remember to switch them off as soon as visibility improves so you do not dazzle drivers behind.',
    highwayCodeRef: 'Highway Code Rule 236',
  },
  {
    id: 'uk-q42',
    category: 'Hazard Awareness',
    prompt: 'You are approaching a flooded section of road. After driving slowly through shallow water in first gear, what should you do once clear?',
    options: [
      'Accelerate hard to dry the engine bay',
      'Test your brakes lightly while moving slowly to dry them out',
      'Pull the handbrake up sharply while moving',
      'Turn off the engine for two minutes',
    ],
    correctIndex: 1,
    explanation:
      'Water can reduce braking efficiency. Once out of deep water, gently test your brakes when it is safe to do so to dry the pads and discs.',
    highwayCodeRef: 'Highway Code Rule 121',
  },
  {
    id: 'uk-q43',
    category: 'Hazard Awareness',
    signId: 'no-overtaking',
    prompt: 'What does a circular red-bordered sign showing a red car beside a black car prohibit?',
    options: [
      'No dual carriageway ahead',
      'No overtaking',
      'No entry for cars carrying passengers',
      'Keep two-car-length distance',
    ],
    correctIndex: 1,
    explanation:
      'This prohibitory sign means No Overtaking. Do not overtake motor vehicles until you pass the end-of-restriction sign or road layout changes.',
    highwayCodeRef: 'Highway Code Signs: Prohibitory',
  },

  // 8. Essential Documents & Vehicle Safety
  {
    id: 'uk-q44',
    category: 'Essential Documents',
    prompt: 'When must a new passenger car first undergo an annual MOT roadworthiness test in Great Britain?',
    options: [
      'One year after registration',
      'Two years after registration',
      'Three years after first registration',
      'Five years after first registration',
    ],
    correctIndex: 2,
    explanation:
      'Cars in Great Britain require their first MOT test on the third anniversary of registration (4 years in Northern Ireland), and every year thereafter.',
    highwayCodeRef: 'Highway Code Annex 3',
  },
  {
    id: 'uk-q45',
    category: 'Essential Documents',
    prompt: 'If a newly qualified driver accumulates how many penalty points within the first 2 years of passing their first driving test will their licence be revoked under the New Drivers Act?',
    options: ['3 points', '6 or more points', '9 points', '12 points'],
    correctIndex: 1,
    explanation:
      'Under the Road Traffic (New Drivers) Act, accumulating 6 or more penalty points within 2 years of passing your first practical test results in licence revocation, requiring you to retake both theory and practical tests.',
    highwayCodeRef: 'DVSA New Driver Rules',
  },
  {
    id: 'uk-q46',
    category: 'Essential Documents',
    prompt: 'Which legal documents must you hold and be able to produce (usually within 7 days at a police station if requested) to drive a car on a UK public road?',
    options: [
      'Valid driving licence, valid insurance certificate, and valid MOT certificate (if vehicle is over 3 years old)',
      'Vehicle handbook, breakdown cover card, and V5C logbook inside the glovebox',
      'Passport and proof of home address',
      'Only a photocard driving licence',
    ],
    correctIndex: 0,
    explanation:
      'You must hold a valid driving licence, at least third-party motor insurance, valid Vehicle Excise Duty (road tax), and an up-to-date MOT certificate if the car is 3+ years old.',
    highwayCodeRef: 'Highway Code Annex 3',
  },

  // 9. Incidents & Accidents
  {
    id: 'uk-q47',
    category: 'Incidents & Accidents',
    prompt: 'You are first on the scene of a collision where a motorcyclist is lying unconscious on the road. What should you do regarding their helmet?',
    options: [
      'Remove the helmet gently so they can breathe better',
      'Do NOT remove their helmet unless it is essential (e.g. they have stopped breathing and you need to give CPR)',
      'Prop their head up with a folded coat',
      'Give them water immediately',
    ],
    correctIndex: 1,
    explanation:
      'Never remove a motorcyclist’s helmet unless it is absolutely essential to maintain an airway or perform CPR, as moving the neck could worsen a spinal injury.',
    highwayCodeRef: 'Highway Code Rule 283',
  },
  {
    id: 'uk-q48',
    category: 'Incidents & Accidents',
    prompt: 'You break down on a motorway and manage to reach the hard shoulder. Where should you and your passengers wait?',
    options: [
      'Inside the car with seatbelts fastened',
      'Standing just behind the boot to wave traffic away',
      'Exit via the left-hand (nearside) doors and wait behind the safety barrier, well away from the carriageway',
      'Walk along the hard shoulder toward the nearest junction',
    ],
    correctIndex: 2,
    explanation:
      'Leave the vehicle via the left-hand doors away from traffic, move everyone behind the crash barrier (and up the embankment if possible), and use an emergency roadside telephone or call 999.',
    highwayCodeRef: 'Highway Code Rule 275',
  },
  {
    id: 'uk-q49',
    category: 'Incidents & Accidents',
    prompt: 'If a warning light showing a red circle with an exclamation mark (!) stays illuminated on your dashboard while driving, what does it usually indicate?',
    options: [
      'Windscreen washer fluid is low',
      'A brake system fault or the handbrake is still engaged — stop safely and check immediately',
      'Tyre pressure monitoring calibration',
      'Service interval reminder',
    ],
    correctIndex: 1,
    explanation:
      'A red brake warning light indicates either the handbrake is partially applied or brake fluid / braking pressure has dropped dangerously. Stop safely as soon as possible.',
    highwayCodeRef: 'Highway Code Rule 89',
  },
  {
    id: 'uk-q50',
    category: 'Rules of the Road',
    prompt: 'When you park facing uphill on a steep road with a kerb, which way should you turn your front wheels?',
    options: [
      'Toward the kerb',
      'Away from the kerb (to the right in the UK)',
      'Keep them straight ahead',
      'It makes no difference if the handbrake is on',
    ],
    correctIndex: 1,
    explanation:
      'When parking uphill next to a kerb, turn your steering wheel away from the kerb (to the right in the UK) so if the car rolls back, the front tyre catches against the kerb.',
    highwayCodeRef: 'Highway Code Rule 252',
  },
];

export const THEORY_QUESTIONS: TheoryQuestion[] = [
  ...CORE_THEORY_QUESTIONS,
  ...SIGNS_AND_RULES_QUESTIONS,
  ...VEHICLE_AND_MARGINS_QUESTIONS,
  ...USERS_AND_HAZARDS_QUESTIONS,
];

export type CarPartId =
  | 'bonnet-oil'
  | 'bonnet-coolant'
  | 'bonnet-brake'
  | 'bonnet-washer'
  | 'tyre-tread'
  | 'headlights'
  | 'indicators'
  | 'horn'
  | 'demister'
  | 'wipers';

export interface ShowMeTellMeItem {
  id: string;
  type: 'Tell Me' | 'Show Me';
  partId: CarPartId;
  partLabel: string;
  question: string;
  officialAnswer: string;
  examinerTip: string;
}

export const SHOW_ME_TELL_ME_QUESTIONS: ShowMeTellMeItem[] = [
  {
    id: 'smtm-1',
    type: 'Tell Me',
    partId: 'bonnet-oil',
    partLabel: 'Engine Oil Dipstick',
    question: 'Tell me how you’d check that the engine has sufficient oil.',
    officialAnswer:
      'Identify the dipstick (usually yellow/orange loop). Ensure the car is on level ground and engine is cold/settled. Remove the dipstick, wipe it clean, re-insert fully, remove again and verify the oil film sits between the MIN and MAX markers.',
    examinerTip: 'You do not need to get your hands oily on test—just point to the dipstick and explain clearly.',
  },
  {
    id: 'smtm-2',
    type: 'Tell Me',
    partId: 'bonnet-coolant',
    partLabel: 'Engine Coolant Tank',
    question: 'Tell me how you’d check that the engine has sufficient engine coolant.',
    officialAnswer:
      'Identify the translucent coolant expansion tank under the bonnet and check that the fluid level sits between the MIN and MAX markings on the side. Only ever open the cap when the engine is completely cold.',
    examinerTip: 'Mentioning "only open when cold" demonstrates crucial safety awareness against scalding.',
  },
  {
    id: 'smtm-3',
    type: 'Tell Me',
    partId: 'bonnet-brake',
    partLabel: 'Brake Fluid Reservoir',
    question: 'Tell me how you’d check that you have a safe level of hydraulic brake fluid.',
    officialAnswer:
      'Identify the brake fluid reservoir near the back of the engine bay (driver’s side) and verify the fluid level is between the high and low (MIN/MAX) markings.',
    examinerTip: 'Note that a sudden drop in brake fluid means a leak and requires immediate garage inspection.',
  },
  {
    id: 'smtm-4',
    type: 'Tell Me',
    partId: 'tyre-tread',
    partLabel: 'Tyres & Tread Gauge',
    question: 'Tell me how you’d check the tyres to ensure that they have sufficient tread depth and are in safe condition.',
    officialAnswer:
      'There should be no cuts or bulges on the sidewalls, and at least 1.6 mm of tread depth across the central three-quarters of the breadth of the tyre and around the entire outer circumference.',
    examinerTip: 'You can mention checking tyre tread wear indicators or using a tread depth gauge.',
  },
  {
    id: 'smtm-5',
    type: 'Tell Me',
    partId: 'headlights',
    partLabel: 'Headlights & Tail Lights',
    question: 'Tell me how you’d check that the headlights and tail lights are working.',
    officialAnswer:
      'Turn on the ignition (if needed), operate the light switch to turn on dipped headlights, then walk around the vehicle to check both front headlights and rear tail lights are illuminated.',
    examinerTip: 'Because this is a "Tell Me" question, you simply explain the check without getting out.',
  },
  {
    id: 'smtm-6',
    type: 'Tell Me',
    partId: 'indicators',
    partLabel: 'Direction Indicators',
    question: 'Tell me how you’d check that the direction indicators are working.',
    officialAnswer:
      'Switch on the hazard warning lights (ignition not always required) and walk around the car to verify all front, side-repeater, and rear amber indicators are flashing.',
    examinerTip: 'Checking with hazard lights lets you inspect all corners in a single walkaround.',
  },
  {
    id: 'smtm-7',
    type: 'Show Me',
    partId: 'bonnet-washer',
    partLabel: 'Windscreen Washers',
    question: 'When it’s safe to do so, can you show me how you wash and clean the front windscreen?',
    officialAnswer:
      'Pull or push the right-hand windscreen wiper stalk toward you while keeping your eyes on the road ahead so fluid sprays and the wipers sweep the glass clean.',
    examinerTip: 'Asked while driving on the practical test—operate the stalk smoothly without looking down.',
  },
  {
    id: 'smtm-8',
    type: 'Show Me',
    partId: 'demister',
    partLabel: 'Front & Rear Demisters',
    question: 'When it’s safe to do so, can you show me how you’d set the rear demister or clear misted front glass?',
    officialAnswer:
      'Press the heated rear window button (rectangular icon with wavy lines) or direct the fan dial to the windscreen symbol at high blower speed and warm/AC setting.',
    examinerTip: 'Know the exact tactile position of your car’s demister switch before test day.',
  },
  {
    id: 'smtm-9',
    type: 'Show Me',
    partId: 'wipers',
    partLabel: 'Dipped Headlights & Wipers',
    question: 'When it’s safe to do so, can you show me how you’d operate the dipped headlights?',
    officialAnswer:
      'Rotate the headlight dial or left-hand stalk two clicks to the dipped beam icon (green lamp pointing slightly downward) and confirm the green dipped beam indicator on the instrument cluster.',
    examinerTip: 'Do not accidentally engage full high-beam (blue icon) into oncoming traffic.',
  },
  {
    id: 'smtm-10',
    type: 'Show Me',
    partId: 'horn',
    partLabel: 'Audible Horn',
    question: 'When it’s safe to do so, can you show me how you’d operate the horn?',
    officialAnswer:
      'Press the centre boss of the steering wheel firmly for a brief tap when safe and where it will not startle nearby pedestrians, cyclists, or horses.',
    examinerTip: 'Wait until there are no vulnerable road users nearby before sounding the horn.',
  },
];
