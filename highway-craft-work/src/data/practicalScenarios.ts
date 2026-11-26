import type { GearMode } from '../logic/practicalEngine';

export type PracticalScenarioId =
  | 'mock-route'
  | 'parallel-park'
  | 'bay-park'
  | 'pull-right'
  | 'emergency-stop';

export interface ScenarioConfig {
  id: PracticalScenarioId;
  title: string;
  subtitle: string;
  spawn: { x: number; z: number; headingRad: number; gear: GearMode };
  initialPrompt: string;
  steps: [string, string, string];
}

export const PRACTICAL_SCENARIOS: ScenarioConfig[] = [
  {
    id: 'mock-route',
    title: '1. City, Roundabout & Zebra Route',
    subtitle: 'Obey UK traffic lights (Red+Amber), give way right at roundabout, stop for Zebra pedestrian.',
    spawn: { x: -2.4, z: 58, headingRad: 0, gear: 'D' },
    initialPrompt: 'Drive straight ahead in the left lane. Obey the traffic lights and roundabout ahead.',
    steps: [
      'Stop behind stop line on Red / Red+Amber',
      'Give way to right at roundabout (take 2nd exit)',
      'Stop for Zebra pedestrian & enter 20 mph zone',
    ],
  },
  {
    id: 'parallel-park',
    title: '2. Parallel Park Behind Saloon',
    subtitle: 'Reverse cleanly into the marked kerbside space behind the dark grey saloon, then apply handbrake.',
    spawn: { x: -0.2, z: 19.0, headingRad: 0, gear: 'R' },
    initialPrompt: 'Check mirrors [M], reverse smoothly into the blue bay behind the parked car, and apply Handbrake [Space].',
    steps: [
      'Check mirrors [M] & engage Reverse [R]',
      'Steer smoothly along blue 3D guide curve',
      'Straighten inside bay & apply Handbrake [Space]',
    ],
  },
  {
    id: 'bay-park',
    title: '3. DVSA Test Centre Bay Park',
    subtitle: 'Manoeuvre cleanly between the white bay lines beside parked cars without touching adjacent vehicles.',
    spawn: { x: -23.6, z: 45.0, headingRad: 0, gear: 'D' },
    initialPrompt: 'Steer smoothly into the green marked bay between the two parked cars, straighten up, and apply Handbrake [Space].',
    steps: [
      'Check mirrors [M] & align with green guide',
      'Creep steadily between both parked cars',
      'Stop straight inside bay & apply Handbrake [Space]',
    ],
  },
  {
    id: 'pull-right',
    title: '4. Pull Up on Right & Reverse',
    subtitle: 'Signal right, pull up beside the right kerb, reverse 2 car lengths straight, then secure the car.',
    spawn: { x: 39.6, z: 34.0, headingRad: 0, gear: 'D' },
    initialPrompt: 'Indicate right [E], check mirrors [M], and pull up inside the amber right-hand zone.',
    steps: [
      'Check mirrors [M] & Signal Right [E] into amber zone',
      'Select Reverse [R] & reverse 2 lengths straight',
      'Hold kerb gap cleanly & apply Handbrake [Space]',
    ],
  },
  {
    id: 'emergency-stop',
    title: '5. Emergency Stop Drill',
    subtitle: 'Accelerate to 25–30 mph. When the examiner shouts STOP!, brake firmly and secure with handbrake.',
    spawn: { x: -2.4, z: 66.0, headingRad: 0, gear: 'D' },
    initialPrompt: 'Build up smoothly to 25–30 mph along the avenue. Be ready for the examiner STOP signal.',
    steps: [
      'Accelerate smoothly toward 25–30 mph',
      'Brake firmly with straight wheel on STOP!',
      'Apply Handbrake [Space] once stationary',
    ],
  },
];