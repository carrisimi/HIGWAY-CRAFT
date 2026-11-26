import type { TheoryQuestion } from '../../logic/theoryEngine';

export const SIGNS_AND_RULES_QUESTIONS: TheoryQuestion[] = [
  // Road & Traffic Signs (18 new -> 26+ total)
  {
    id: 'uk-q51',
    category: 'Road & Traffic Signs',
    signId: 'speed-20',
    prompt: 'Where are 20 mph speed limit zones most commonly introduced in the UK?',
    options: [
      'On rural single-carriageway A-roads',
      'In residential areas, outside schools, and busy town centres',
      'On motorway slip roads during peak traffic',
      'On dual carriageways with central reservations',
    ],
    correctIndex: 1,
    explanation:
      '20 mph limits and traffic-calmed zones protect pedestrians and cyclists around schools, housing estates, and high-footfall town centres.',
    highwayCodeRef: 'Highway Code Rule 124',
  },
  {
    id: 'uk-q52',
    category: 'Road & Traffic Signs',
    signId: 'dual-ends',
    prompt: 'What does this rectangular warning sign tell you ahead?',
    options: [
      'Dual carriageway ends — prepare for two-way traffic on a single carriageway',
      'Motorway regulations begin ahead',
      'Left-hand lane is reserved for buses and cycles',
      'Road widens to three lanes ahead',
    ],
    correctIndex: 0,
    explanation:
      'Two black arrows curving together below a central divider warn that the dual carriageway is ending and two-way traffic will share a single carriageway.',
    highwayCodeRef: 'Highway Code Signs: Warning',
  },
  {
    id: 'uk-q53',
    category: 'Road & Traffic Signs',
    signId: 'keep-left',
    prompt: 'You see a blue circular sign with a white arrow pointing downward and to the left on a bollard. What must you do?',
    options: [
      'Turn sharp left at the next junction',
      'Keep to the left of the bollard or traffic island',
      'Enter the left-hand bus lane only',
      'Park on the left verge',
    ],
    correctIndex: 1,
    explanation:
      'A blue circle with a downward-left white arrow is a mandatory sign instructing all vehicles to pass to the left of the bollard or refuge.',
    highwayCodeRef: 'Highway Code Signs: Regulatory',
  },
  {
    id: 'uk-q54',
    category: 'Road & Traffic Signs',
    signId: 'no-overtaking',
    prompt: 'What does a white circular sign with a red border showing a red car beside a black car mean?',
    options: [
      'Two-way traffic crosses a one-way road',
      'No overtaking',
      'End of dual carriageway',
      'No motor vehicles allowed',
    ],
    correctIndex: 1,
    explanation:
      'This prohibitory circular sign means no overtaking until you pass a sign cancelling the restriction or leave that stretch of road.',
    highwayCodeRef: 'Highway Code Rule 168',
  },
  {
    id: 'uk-q55',
    category: 'Road & Traffic Signs',
    signId: 'school-patrol',
    prompt: 'When a rectangular sign with a red triangle shows children walking, what hazard should you anticipate?',
    options: [
      'A pedestrian precinct closed to all cars',
      'School crossing patrol or children likely to cross the road ahead',
      'Playground equipment overhanging the footway',
      'Cycle track crossing only',
    ],
    correctIndex: 1,
    explanation:
      'The triangular children sign warns of a school, playground, or crossing patrol ahead. Reduce speed and scan parked vehicles carefully.',
    highwayCodeRef: 'Highway Code Rule 208',
  },
  {
    id: 'uk-q56',
    category: 'Road & Traffic Signs',
    signId: 'box-junction',
    prompt: 'What is the main rule when approaching a yellow criss-cross box junction?',
    options: [
      'Never enter unless your exit road is clear, except when waiting to turn right and prevented only by oncoming traffic',
      'Stop inside the box to let pedestrians cross',
      'Always use the box junction for U-turns',
      'Enter whenever the lights are amber',
    ],
    correctIndex: 0,
    explanation:
      'Highway Code Rule 174 states you MUST NOT enter the box until your exit is clear, unless you want to turn right and are only prevented from clearing it by oncoming traffic or other vehicles waiting to turn right.',
    highwayCodeRef: 'Highway Code Rule 174',
  },
  {
    id: 'uk-q57',
    category: 'Road & Traffic Signs',
    prompt: 'What colour are the direction signs on a UK motorway?',
    options: ['Green with white lettering', 'Blue with white lettering', 'White with black borders', 'Brown with white lettering'],
    correctIndex: 1,
    explanation:
      'UK motorway signs use blue backgrounds, primary A-road signs use green, local non-primary roads use white, and tourist attractions use brown.',
    highwayCodeRef: 'Highway Code Direction Signs',
  },
  {
    id: 'uk-q58',
    category: 'Road & Traffic Signs',
    prompt: 'What colour are reflective road studs (cat’s eyes) between the hard shoulder and the left-hand lane on a motorway?',
    options: ['White', 'Amber', 'Red', 'Green'],
    correctIndex: 2,
    explanation:
      'Red studs mark the left edge of the carriageway, white mark lane dividers, amber mark the central reservation, and green mark slip roads or lay-bys.',
    highwayCodeRef: 'Highway Code Rule 132',
  },
  {
    id: 'uk-q59',
    category: 'Road & Traffic Signs',
    prompt: 'Where would you see green reflective road studs on a UK motorway or dual carriageway?',
    options: [
      'Along the central reservation',
      'Where slip roads join or leave the main carriageway and at lay-bys',
      'Between overtaking lanes',
      'At level crossings only',
    ],
    correctIndex: 1,
    explanation:
      'Green studs indicate the edge of the main carriageway at lay-bys and where slip roads merge or diverge.',
    highwayCodeRef: 'Highway Code Rule 132',
  },
  {
    id: 'uk-q60',
    category: 'Road & Traffic Signs',
    prompt: 'What shape are triangular traffic signs in the UK Highway Code?',
    options: ['They always give warnings of hazards ahead', 'They always give orders you must obey', 'They always indicate tourist information', 'They indicate national speed limits'],
    correctIndex: 0,
    explanation:
      'Warning signs are normally triangular with a red border and white background; circular signs normally give orders.',
    highwayCodeRef: 'Highway Code Signs Overview',
  },
  {
    id: 'uk-q61',
    category: 'Road & Traffic Signs',
    prompt: 'What do double white lines along the centre of a road mean when the line nearer to you is solid?',
    options: [
      'You may cross to overtake slow tractors travelling at 25 mph',
      'You must not cross or straddle the line except to enter a premises, side road, or pass a stationary vehicle or cyclist under 10 mph',
      'You may overtake any vehicle provided the road ahead looks clear',
      'Parking is permitted along both kerbs',
    ],
    correctIndex: 1,
    explanation:
      'Under Rule 129 you MUST NOT cross or straddle a solid white line nearer your side except in specific legal exceptions such as turning into premises/side road or safely passing a stationary vehicle, pedal cycle, horse, or road maintenance vehicle travelling at 10 mph or less.',
    highwayCodeRef: 'Highway Code Rule 129',
  },
  {
    id: 'uk-q62',
    category: 'Road & Traffic Signs',
    prompt: 'What does a single broken white line with long dashes and short gaps down the centre of a road warn you of?',
    options: [
      'A zebra crossing ahead',
      'A hazard ahead — do not overtake unless you can see well ahead and it is completely safe',
      'A bus lane operational 24 hours',
      'A clearway ending',
    ],
    correctIndex: 1,
    explanation:
      'Longer centre dashes with shorter gaps are hazard warning lines alerting drivers to junctions, bends, or hills ahead.',
    highwayCodeRef: 'Highway Code Rule 127',
  },
  {
    id: 'uk-q63',
    category: 'Road & Traffic Signs',
    prompt: 'What do zig-zag white lines painted on both approaches to a pedestrian crossing indicate?',
    options: [
      'No parking or overtaking is permitted within the zig-zag area',
      'You may drop off passengers briefly if hazards are on',
      'Only motorcycles may overtake inside the zig-zag lines',
      'A 40 mph speed zone starts at the crossing',
    ],
    correctIndex: 0,
    explanation:
      'Zig-zag markings keep sightlines clear for drivers and pedestrians. Waiting, parking, or overtaking the leading vehicle within the zig-zag zone is prohibited.',
    highwayCodeRef: 'Highway Code Rule 191',
  },
  {
    id: 'uk-q64',
    category: 'Road & Traffic Signs',
    prompt: 'What does a brown tourist information sign showing a tent and caravan symbol indicate?',
    options: ['Caravan prohibition zone', 'Camping and caravan site ahead', 'Motorway service area only', 'Lay-by for HGVs'],
    correctIndex: 1,
    explanation:
      'Brown signs direct road users to leisure, heritage, and tourist facilities such as camping and caravan sites.',
    highwayCodeRef: 'Highway Code Information Signs',
  },
  {
    id: 'uk-q65',
    category: 'Road & Traffic Signs',
    prompt: 'What does an amber flashing light above a triangular "Children" sign near a school mean?',
    options: [
      'Road closed to private cars',
      'Speed limit reduces permanently to 10 mph',
      'The school crossing patrol or children crossing warning is active — slow down and take extra care',
      'Traffic signals ahead are out of order',
    ],
    correctIndex: 2,
    explanation:
      'Twin amber flashing lights warn drivers that children may be crossing or a school patrol is operating; slow down and expect to stop.',
    highwayCodeRef: 'Highway Code Rule 208',
  },
  {
    id: 'uk-q66',
    category: 'Road & Traffic Signs',
    prompt: 'What does a red triangle showing a silhouette of a hump bridge mean?',
    options: ['Uneven road surface for 2 miles', 'Hump bridge ahead — reduce speed', 'Steep hill downwards 15%', 'Level crossing with barrier'],
    correctIndex: 1,
    explanation:
      'A hump bridge sign warns of restricted forward visibility and potential grounding or sudden weight shift if taken too fast.',
    highwayCodeRef: 'Highway Code Warning Signs',
  },
  {
    id: 'uk-q67',
    category: 'Road & Traffic Signs',
    prompt: 'At a traffic light, a green filter arrow points left while the main circular signal is red. When may you proceed left?',
    options: [
      'Never while the main circular signal is red',
      'Only if no pedestrians are crossing and it is safe to turn in the direction of the green arrow',
      'Only if you are driving a bus or taxi',
      'You may go straight ahead as well as left',
    ],
    correctIndex: 1,
    explanation:
      'A lit green arrow lets traffic in the appropriate lane proceed in the arrow’s direction even if the main circular light is red, giving way to pedestrians still crossing.',
    highwayCodeRef: 'Highway Code Rule 177',
  },
  {
    id: 'uk-q68',
    category: 'Road & Traffic Signs',
    prompt: 'What do black-and-white chevron signs on a sharp bend indicate?',
    options: [
      'A sharp change of road direction to the left or right',
      'One-way street ahead',
      'End of dual carriageway',
      'Low bridge height restriction',
    ],
    correctIndex: 0,
    explanation:
      'Chevron boards show the direction and severity of a sharp bend so you can adjust speed and gear before entry.',
    highwayCodeRef: 'Highway Code Rule 154',
  },

  // Rules of the Road (19 new)
  {
    id: 'uk-q69',
    category: 'Rules of the Road',
    prompt: 'What is the UK speed limit for a standard passenger car on an unlit dual carriageway unless signs state otherwise?',
    options: ['50 mph', '60 mph', '70 mph', '80 mph'],
    correctIndex: 2,
    explanation:
      'Cars and motorcycles (not towing trailers) have a national speed limit of 70 mph on dual carriageways and motorways, and 60 mph on single carriageways.',
    highwayCodeRef: 'Highway Code Rule 124',
  },
  {
    id: 'uk-q70',
    category: 'Rules of the Road',
    prompt: 'When may you use a bus lane during its stated hours of operation?',
    options: [
      'When overtaking a slow vehicle ahead',
      'Only when directed by a police officer or to cross briefly for access/turning where permitted by broken white lines',
      'Whenever traffic in the main lane queues for more than 100 yards',
      'Between 10:00 and 16:00 regardless of signs',
    ],
    correctIndex: 1,
    explanation:
      'Unless signs show the bus lane is outside its operational hours, unauthorised vehicles must keep out except when following police directions or crossing safely where markings permit.',
    highwayCodeRef: 'Highway Code Rule 141',
  },
  {
    id: 'uk-q71',
    category: 'Rules of the Road',
    prompt: 'Who has priority when a road narrows and neither side has a priority sign, and there is a parked car obstructing your lane?',
    options: [
      'You have automatic priority because you reached the car first',
      'Oncoming traffic in the unobstructed lane has priority — wait behind the obstruction',
      'Whichever vehicle is larger has priority',
      'Flash headlights to claim right of way',
    ],
    correctIndex: 1,
    explanation:
      'If an obstruction is on your side of the road, you must give way to oncoming vehicles travelling in the clear lane.',
    highwayCodeRef: 'Highway Code Rule 163',
  },
  {
    id: 'uk-q72',
    category: 'Rules of the Road',
    prompt: 'How close to a road junction must you NOT park or wait (except in an enforced bay or to avoid an accident)?',
    options: ['Within 5 metres (16 feet)', 'Within 10 metres (32 feet)', 'Within 20 metres (65 feet)', 'Within 2 metres (6 feet)'],
    correctIndex: 1,
    explanation:
      'Rule 243 states you MUST NOT stop or park opposite or within 10 metres (32 feet) of a junction, except in an authorised parking space.',
    highwayCodeRef: 'Highway Code Rule 243',
  },
  {
    id: 'uk-q73',
    category: 'Rules of the Road',
    prompt: 'When you park at night on a road where the speed limit exceeds 30 mph, what lights must you leave switched on?',
    options: ['Dipped headlights', 'Parking (sidelights) and rear position lights', 'Hazard warning lights', 'Front fog lights'],
    correctIndex: 1,
    explanation:
      'Under Rule 249, all vehicles MUST display parking lights when parked on a road or lay-by with a speed limit over 30 mph.',
    highwayCodeRef: 'Highway Code Rule 249',
  },
  {
    id: 'uk-q74',
    category: 'Rules of the Road',
    prompt: 'Which side of a two-way street should you normally park on during the hours of darkness?',
    options: [
      'Facing against the flow of traffic so headlights show reflectors',
      'On the left side facing in the direction of traffic flow',
      'Straddling the kerb so reflectors remain visible',
      'Either side provided hazard lights are active',
    ],
    correctIndex: 1,
    explanation:
      'Rule 248 states you MUST NOT park on a road at night facing against the direction of the traffic flow unless in a recognised parking space, so rear red reflectors face oncoming drivers.',
    highwayCodeRef: 'Highway Code Rule 248',
  },
  {
    id: 'uk-q75',
    category: 'Rules of the Road',
    prompt: 'What is the maximum speed limit for a car towing a caravan or trailer on a single carriageway in the UK?',
    options: ['40 mph', '50 mph', '60 mph', '70 mph'],
    correctIndex: 1,
    explanation:
      'Towing limits for cars are 50 mph on single carriageways and 60 mph on dual carriageways and motorways (where you also cannot use the rightmost lane of 3+ lanes).',
    highwayCodeRef: 'Highway Code Rule 124',
  },
  {
    id: 'uk-q76',
    category: 'Rules of the Road',
    prompt: 'When approaching a mini-roundabout, how should you treat the painted white central disc?',
    options: [
      'Drive straight across the centre if turning right',
      'Pass around the central markings unless driving a large vehicle physically unable to do so',
      'Give way to traffic approaching from your left',
      'Stop on the white circle before turning right',
    ],
    correctIndex: 1,
    explanation:
      'Rule 188 requires all vehicles to pass around the central markings except large vehicles incapable of turning round it; beware vehicles making U-turns.',
    highwayCodeRef: 'Highway Code Rule 188',
  },
  {
    id: 'uk-q77',
    category: 'Rules of the Road',
    prompt: 'At a junction where traffic lights are out of order and nobody is directing traffic, what should you do?',
    options: [
      'Proceed at normal speed because the major road always takes priority',
      'Treat the junction as an unmarked crossroads — proceed slowly and give way safely with eye contact',
      'Sound your horn continuously while crossing',
      'Wait indefinitely until a police officer arrives',
    ],
    correctIndex: 1,
    explanation:
      'Rule 176: if traffic lights are not working, treat the situation as an unmarked junction and proceed with extreme care.',
    highwayCodeRef: 'Highway Code Rule 176',
  },
  {
    id: 'uk-q78',
    category: 'Rules of the Road',
    prompt: 'When may you sound your car horn in the UK?',
    options: [
      'To express annoyance when another driver cuts in',
      'Only while moving, to warn other road users of your presence when necessary for safety',
      'When stationary outside a friend’s house between 11:30 pm and 7:00 am',
      'Whenever approaching a blind zebra crossing',
    ],
    correctIndex: 1,
    explanation:
      'Rule 112: use the horn ONLY while your vehicle is moving and you need to warn other road users of your presence. Never use it aggressively or while stationary (except danger from another moving vehicle), and never in built-up areas 11:30 pm–7:00 am.',
    highwayCodeRef: 'Highway Code Rule 112',
  },
  {
    id: 'uk-q79',
    category: 'Rules of the Road',
    prompt: 'At a pelican crossing, what does the flashing amber signal mean?',
    options: [
      'Stop and wait until the steady green light appears',
      'Give way to any pedestrians still on the crossing; if the crossing is clear, you may proceed',
      'Pedestrians must not start crossing, so you have priority even if someone is walking',
      'Treat it as a red stop signal for 5 seconds',
    ],
    correctIndex: 1,
    explanation:
      'At a pelican crossing, flashing amber means you MUST give way to pedestrians already on the crossing, and proceed only when it is clear.',
    highwayCodeRef: 'Highway Code Rule 196',
  },
  {
    id: 'uk-q80',
    category: 'Rules of the Road',
    prompt: 'What is the purpose of a puffin crossing compared with an older pelican crossing?',
    options: [
      'It uses kerbside pedestrian detectors so there is no flashing amber phase — lights go straight from red to red+amber then green',
      'It requires cyclists to dismount before pressing the button',
      'It stays permanently green unless an emergency vehicle approaches',
      'It is only installed on motorways',
    ],
    correctIndex: 0,
    explanation:
      'Puffin crossings have kerbside sensors that keep traffic stopped on red while pedestrians finish crossing and go straight back through red+amber to green.',
    highwayCodeRef: 'Highway Code Rule 196',
  },
  {
    id: 'uk-q81',
    category: 'Rules of the Road',
    prompt: 'You want to turn right from a minor road onto a busy dual carriageway with a narrow central reservation. What must you check before emerging?',
    options: [
      'Only check traffic coming from the right',
      'If the central reservation is narrower than your car, wait until BOTH carriageways are clear before emerging',
      'Emerge halfway and let your rear overhang block the first carriageway',
      'Turn left and reverse across the central gap',
    ],
    correctIndex: 1,
    explanation:
      'Rule 173 warns that if the central reservation cannot protect the entire length of your vehicle, wait until you can cross both carriageways in one safe movement.',
    highwayCodeRef: 'Highway Code Rule 173',
  },
  {
    id: 'uk-q82',
    category: 'Rules of the Road',
    prompt: 'What does a green traffic light mean in the UK Highway Code?',
    options: [
      'Accelerate immediately regardless of junction clearance',
      'You may go on if the way is clear — give way to pedestrians already crossing if turning',
      'Pedestrians must yield to turning cars at all junctions',
      'Priority over emergency vehicles',
    ],
    correctIndex: 1,
    explanation:
      'Rule 175: Green means you may proceed IF the way is clear, taking special care for pedestrians crossing the road into which you are turning.',
    highwayCodeRef: 'Highway Code Rule 175',
  },
  {
    id: 'uk-q83',
    category: 'Rules of the Road',
    prompt: 'When is it legal to reverse from a minor side road onto a major road?',
    options: [
      'Whenever hazard lights are switched on',
      'Never — Highway Code Rule 201 states you must not reverse from a side road into a main road',
      'Only during daylight hours',
      'When guided by a passenger',
    ],
    correctIndex: 1,
    explanation:
      'Rule 201: Do not reverse further than necessary and NEVER reverse from a side road into a main road.',
    highwayCodeRef: 'Highway Code Rule 201',
  },
  {
    id: 'uk-q84',
    category: 'Rules of the Road',
    prompt: 'Which lane should you normally occupy when driving on a two-lane single-direction road or dual carriageway?',
    options: [
      'The right-hand lane so joining traffic has space',
      'The left-hand lane unless overtaking or preparing to turn right',
      'Whichever lane has fewer potholes',
      'The middle of both lanes',
    ],
    correctIndex: 1,
    explanation:
      'Rule 137 / 264: Always keep to the left lane unless overtaking, turning right, or following overhead lane signs.',
    highwayCodeRef: 'Highway Code Rule 137',
  },
  {
    id: 'uk-q85',
    category: 'Rules of the Road',
    prompt: 'How should you signal when intending to turn right at a roundabout (typically 3rd or 4th exit)?',
    options: [
      'Approach in the right lane signalling right, keep signalling right past earlier exits, then signal left after passing the exit before yours',
      'Signal left on approach, then switch to right on the roundabout',
      'Only signal after leaving the roundabout',
      'Use hazard warning lights throughout the manoeuvre',
    ],
    correctIndex: 0,
    explanation:
      'Rule 186 sets out the standard right-turn roundabout routine: position right, signal right on approach and around the island until passing the exit prior to yours, then check mirrors and signal left to exit.',
    highwayCodeRef: 'Highway Code Rule 186',
  },
  {
    id: 'uk-q86',
    category: 'Rules of the Road',
    prompt: 'Who may authorise you to cross a solid white stop line when traffic signals are showing red?',
    options: [
      'A uniformed police officer or traffic officer directing traffic',
      'A car behind flashing its headlights',
      'A delivery driver waving you through',
      'No one under any circumstances',
    ],
    correctIndex: 0,
    explanation:
      'Rule 108: You must obey traffic signals unless directed otherwise by a police officer, traffic officer, or traffic warden.',
    highwayCodeRef: 'Highway Code Rule 108',
  },
  {
    id: 'uk-q87',
    category: 'Rules of the Road',
    prompt: 'What is the penalty points risk for failing to stop at a red traffic light or pedestrian crossing in Great Britain?',
    options: [
      'No penalty points, warning letter only',
      '3 penalty points and a fixed penalty fine (or higher in court)',
      '1 penalty point only',
      'Immediate lifetime ban',
    ],
    correctIndex: 1,
    explanation:
      'Passing a red traffic light carries an endorsement (TS10) of 3 penalty points and a fine — and under the New Drivers Act, reaching 6 points within 2 years revokes a new driver’s licence.',
    highwayCodeRef: 'Highway Code Penalties',
  },

  // Motorway Rules (18 new)
  {
    id: 'uk-q88',
    category: 'Motorway Rules',
    prompt: 'What should you do if your vehicle breaks down on a smart motorway with no hard shoulder and you cannot reach an Emergency Area?',
    options: [
      'Stay seated in the rear passenger seat with your seatbelt fastened',
      'Stop as close to the left verge as possible, switch on hazards, exit via the left doors if safe, and get behind the safety barrier before calling 999',
      'Place a warning triangle 45 metres behind the vehicle on a smart motorway',
      'Attempt a roadside wheel change in the live lane',
    ],
    correctIndex: 1,
    explanation:
      'Rule 275 / 277: Never use a warning triangle on a motorway. Exit away from traffic when safe, climb behind the safety barrier well clear of the car, and call National Highways / 999.',
    highwayCodeRef: 'Highway Code Rule 275',
  },
  {
    id: 'uk-q89',
    category: 'Motorway Rules',
    prompt: 'Which vehicles are NOT allowed to use UK motorways?',
    options: [
      'Electric cars under 40 kW',
      'Learner car drivers unaccompanied by an ADI in dual-control cars, motorcycles under 50cc, cyclists, pedestrians, and agricultural vehicles',
      'Motorhomes and minibuses',
      'Cars towing single-axle trailers',
    ],
    correctIndex: 1,
    explanation:
      'Rule 253: Motorways must not be used by pedestrians, pedal cycles, motorcycles under 50cc, certain slow vehicles, horses, or learner drivers unless with an Approved Driving Instructor in a dual-controlled car.',
    highwayCodeRef: 'Highway Code Rule 253',
  },
  {
    id: 'uk-q90',
    category: 'Motorway Rules',
    prompt: 'When you join a motorway from a slip road, who has priority?',
    options: [
      'Vehicles already travelling on the main motorway carriageway',
      'Traffic joining from the slip road',
      'Whichever vehicle is going faster',
      'HGVs always yield to cars joining',
    ],
    correctIndex: 0,
    explanation:
      'Rule 259: Adjust your speed on the slip road to match motorway traffic and give priority to vehicles already on the motorway.',
    highwayCodeRef: 'Highway Code Rule 259',
  },
  {
    id: 'uk-q91',
    category: 'Motorway Rules',
    prompt: 'What does a flashing amber light on a motorway matrix sign alongside a temporary speed limit (e.g. 50) indicate?',
    options: [
      'Motorway is closed permanently ahead',
      'Advisory or mandatory hazard speed reduction ahead due to congestion, debris, or weather',
      'Emergency vehicles only permitted in lane 3',
      'End of variable speed zone',
    ],
    correctIndex: 1,
    explanation:
      'Matrix signs with flashing amber lights warn of hazards ahead; if the speed number is inside a red ring, it is legally enforceable.',
    highwayCodeRef: 'Highway Code Rule 257',
  },
  {
    id: 'uk-q92',
    category: 'Motorway Rules',
    prompt: 'Are you permitted to overtake on the left (undertake) on a motorway?',
    options: [
      'Yes, whenever lane 3 moves slowly',
      'No, except in slow-moving queues where traffic in your lane is moving faster than the lane to your right',
      'Yes, provided you flash your headlights twice',
      'Only when driving an electric vehicle',
    ],
    correctIndex: 1,
    explanation:
      'Rule 268: Do not overtake on the left or weave between lanes, EXCEPT in congested conditions when traffic is moving in queues and the queue on your right is slower than yours.',
    highwayCodeRef: 'Highway Code Rule 268',
  },
  {
    id: 'uk-q93',
    category: 'Motorway Rules',
    prompt: 'Which lane of a three-lane motorway MUST you stay out of when towing a trailer?',
    options: ['Lane 1 (leftmost)', 'Lane 2 (middle)', 'Lane 3 (rightmost overtaking lane)', 'All lanes are allowed'],
    correctIndex: 2,
    explanation:
      'Rule 265: Vehicles towing a trailer or over 3.5 tonnes are restricted to 60 mph on motorways and MUST NOT use the right-hand lane of a 3-or-more-lane carriageway unless directed.',
    highwayCodeRef: 'Highway Code Rule 265',
  },
  {
    id: 'uk-q94',
    category: 'Motorway Rules',
    prompt: 'How far before a motorway exit should you normally begin moving into the left-hand lane?',
    options: [
      'At the 300-yard countdown marker',
      'Well in good time (around the 1/2-mile sign), signalling left near the 300-yard marker',
      'Only after crossing the solid white chevron markings',
      'Immediately after the previous junction',
    ],
    correctIndex: 1,
    explanation:
      'Rule 272 advises moving into the left lane well ahead of your exit and activating your left indicator around the 300-yard countdown marker.',
    highwayCodeRef: 'Highway Code Rule 272',
  },
  {
    id: 'uk-q95',
    category: 'Motorway Rules',
    prompt: 'What do the 3, 2, and 1 white diagonal-bar countdown markers on the left verge mean?',
    options: [
      'Distance in miles to the next services',
      '300, 200, and 100 yards to a motorway exit slip road',
      'Number of lanes closing ahead',
      'Emergency telephone spacing markers',
    ],
    correctIndex: 1,
    explanation:
      'Three bars = 300 yards, two bars = 200 yards, one bar = 100 yards to the exit slip road.',
    highwayCodeRef: 'Highway Code Motorway Signs',
  },
  {
    id: 'uk-q96',
    category: 'Motorway Rules',
    prompt: 'What colour are the SOS emergency roadside telephones on UK motorways, and how should you walk toward the nearest one?',
    options: [
      'Yellow; follow the small arrows on marker posts pointing to the nearest phone',
      'Blue; walk against the flow of traffic in lane 1',
      'Orange; always walk northbound',
      'Green; cross the central reservation first',
    ],
    correctIndex: 0,
    explanation:
      'Marker posts along the motorway verge show directional arrows guiding you to the nearest orange/yellow emergency telephone (or use 999 / National Highways if safe behind the barrier).',
    highwayCodeRef: 'Highway Code Rule 276',
  },
  {
    id: 'uk-q97',
    category: 'Motorway Rules',
    prompt: 'What should you do if you miss your intended motorway exit?',
    options: [
      'Reverse carefully along the hard shoulder back to the slip road',
      'Perform a U-turn through an emergency central barrier gap',
      'Continue safely to the next junction and turn around there',
      'Stop on the hatched markings to wait for a gap',
    ],
    correctIndex: 2,
    explanation:
      'Rule 263: NEVER reverse, cross the central reservation, or drive against traffic on a motorway. Continue to the next exit.',
    highwayCodeRef: 'Highway Code Rule 263',
  },
  {
    id: 'uk-q98',
    category: 'Motorway Rules',
    prompt: 'What does a grey square matrix sign showing "END" on a motorway tell you?',
    options: [
      'Motorway ends in 100 yards',
      'The temporary hazard warning and advisory speed restriction have ended',
      'No stopping zone starts here',
      'Roadworks contraflow begins',
    ],
    correctIndex: 1,
    explanation:
      'The "END" matrix signal indicates that the preceding temporary speed or hazard warning no longer applies (unless a National Speed Limit sign follows a variable limit).',
    highwayCodeRef: 'Highway Code Rule 257',
  },
  {
    id: 'uk-q99',
    category: 'Motorway Rules',
    prompt: 'How do you identify the hard shoulder versus an active All-Lane-Running smart motorway lane?',
    options: [
      'A solid continuous white line separates a traditional hard shoulder (unless overhead gantry signs explicitly open it with a green arrow/speed limit)',
      'Hard shoulders are always painted green',
      'Smart motorways never have speed limits',
      'Hard shoulders have double yellow lines',
    ],
    correctIndex: 0,
    explanation:
      'Rule 269: Do not drive on the hard shoulder except in an emergency or when overhead gantry signals explicitly display a speed limit above that lane.',
    highwayCodeRef: 'Highway Code Rule 269',
  },
  {
    id: 'uk-q100',
    category: 'Motorway Rules',
    prompt: 'When joining a busy motorway where traffic is flowing quickly in lane 1, what should you avoid doing at the end of the slip road?',
    options: [
      'Matching motorway speed early',
      'Forcing your way in or coming to a sudden stop if unnecessary — adjust speed early to slot smoothly into a safe gap',
      'Checking your right door mirror and blind spot',
      'Signalling right before merging',
    ],
    correctIndex: 1,
    explanation:
      'Rule 259: Use the slip road to build speed up to match lane 1 traffic, check mirrors and blind spots, and merge smoothly into a gap without forcing others to brake.',
    highwayCodeRef: 'Highway Code Rule 259',
  },
  {
    id: 'uk-q101',
    category: 'Motorway Rules',
    prompt: 'What does an orange beacon on a slow-moving maintenance vehicle ahead on the motorway warn you of?',
    options: [
      'Police pursuit in progress',
      'A slow-moving or stationary roadworks/recovery vehicle — keep well back and watch for lane closures',
      'Oversize load turning across the central reservation',
      'Emergency ambulance priority',
    ],
    correctIndex: 1,
    explanation:
      'Flashing amber beacons indicate slow maintenance, gritter, or breakdown vehicles that may stop or move at low speed.',
    highwayCodeRef: 'Highway Code Rule 221',
  },
  {
    id: 'uk-q102',
    category: 'Motorway Rules',
    prompt: 'After driving for two hours on a motorway, what is the recommended break duration according to the Highway Code?',
    options: ['At least 15 minutes rest', 'At least 2 minutes at the hard shoulder', 'Only stop if you drift across rumble strips', 'Drink coffee while keeping at 70 mph'],
    correctIndex: 0,
    explanation:
      'Rule 91 advises taking a break of at least 15 minutes every two hours at motorway services or a safe rest area to prevent driver fatigue.',
    highwayCodeRef: 'Highway Code Rule 91',
  },
  {
    id: 'uk-q103',
    category: 'Motorway Rules',
    prompt: 'What are white diagonal-hatched road markings surrounded by a broken white line on a motorway slip road meant for?',
    options: [
      'Overtaking fast traffic',
      'Separating traffic lanes — do not enter them unless necessary and safe',
      'Dedicated parking for breakdown lorries',
      'Motorcycles only',
    ],
    correctIndex: 1,
    explanation:
      'Rule 130: If hatched markings are bordered by a broken white line, you should not enter them unless it is necessary and you can see it is safe to do so.',
    highwayCodeRef: 'Highway Code Rule 130',
  },
  {
    id: 'uk-q104',
    category: 'Motorway Rules',
    prompt: 'What should you do when you see a "Contraflow system ahead" sign at motorway roadworks?',
    options: [
      'Keep in your lane, obey reduced speed limits, and expect oncoming traffic separated only by cones or temporary barriers',
      'Switch on full-beam headlights',
      'Use the right-hand lane to pass HGVs through narrow lanes',
      'Ignore temporary red-ring speed signs',
    ],
    correctIndex: 0,
    explanation:
      'Rule 288: Slow down smoothly, stay well within narrow lane boundaries, maintain a larger gap ahead, and expect traffic travelling in the opposite direction next to your lane.',
    highwayCodeRef: 'Highway Code Rule 288',
  },
  {
    id: 'uk-q105',
    category: 'Motorway Rules',
    prompt: 'If you feel sleepy on a motorway and have already passed a service area, what should you do?',
    options: [
      'Pull onto the hard shoulder for a 10-minute nap',
      'Leave the motorway at the next exit and find a safe place to stop and rest',
      'Open all four windows and drive faster to reach home earlier',
      'Stop in an Emergency Area strictly for sleeping',
    ],
    correctIndex: 1,
    explanation:
      'Never stop on the hard shoulder or in an Emergency Area to sleep. Leave at the next junction or service area to rest safely.',
    highwayCodeRef: 'Highway Code Rule 91',
  },
];
