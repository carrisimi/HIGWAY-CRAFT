export type GearMode = 'P' | 'D' | 'R';

export type UkTrafficLightPhase = 'RED' | 'RED_AMBER' | 'GREEN' | 'AMBER';

export type FaultSeverity = 'minor' | 'serious' | 'dangerous';

export interface DrivingFault {
  id: string;
  timestampSec: number;
  category:
    | 'Speeding'
    | 'Mirrors'
    | 'Signals'
    | 'Traffic Lights'
    | 'Junctions & Roundabouts'
    | 'Pedestrian Crossings'
    | 'Positioning & Kerb'
    | 'Control & Braking'
    | 'Manoeuvre Accuracy'
    | 'Collision';
  severity: FaultSeverity;
  description: string;
}

export interface VehicleKinematicsState {
  x: number;
  z: number;
  headingRad: number; // 0 = facing -Z (north), +PI/2 = facing -X (west, Three.js right-hand Y-up)
  speedMps: number;
  steerAngleRad: number;
  gear: GearMode;
  handbrakeOn: boolean;
  indicatorLeft: boolean;
  indicatorRight: boolean;
  brakeLightOn: boolean;
  reverseLightOn: boolean;
  distanceTravelledM: number;
}

export interface VehicleInput {
  throttle: number; // 0..1
  brake: number; // 0..1
  steer: number; // -1 (left) .. +1 (right)
}

export const MPS_TO_MPH = 2.23694;
export const MPH_TO_MPS = 1 / MPS_TO_MPH;
export const MAX_MINOR_FAULTS_ALLOWED = 15;

export function createInitialVehicleState(
  x = 0,
  z = 0,
  headingRad = 0,
  gear: GearMode = 'D'
): VehicleKinematicsState {
  return {
    x,
    z,
    headingRad,
    speedMps: 0,
    steerAngleRad: 0,
    gear,
    handbrakeOn: false,
    indicatorLeft: false,
    indicatorRight: false,
    brakeLightOn: false,
    reverseLightOn: gear === 'R',
    distanceTravelledM: 0,
  };
}

/**
 * Pure frame-rate independent bicycle-model car kinematics step.
 * Heading convention (Three.js Y-up):
 * forward = (-Math.sin(headingRad), 0, -Math.cos(headingRad))
 * Turning left (steer < 0) increases headingRad (CCW from above).
 * Turning right (steer > 0) decreases headingRad (CW from above).
 */
export function stepVehicleKinematics(
  state: VehicleKinematicsState,
  input: VehicleInput,
  dt: number
): VehicleKinematicsState {
  const clampedDt = Math.min(Math.max(dt, 0), 0.05);
  const wheelbase = 2.65; // Standard UK supermini / hatchback wheelbase in metres
  const maxSteerRad = 0.56; // ~32 degrees

  const targetSteer = -Math.max(-1, Math.min(1, input.steer)) * maxSteerRad;
  const steerLerp = 1 - Math.exp(-9 * clampedDt);
  const steerAngleRad = state.steerAngleRad + (targetSteer - state.steerAngleRad) * steerLerp;

  let speedMps = state.speedMps;
  const throttle = Math.max(0, Math.min(1, input.throttle));
  const brake = Math.max(0, Math.min(1, input.brake));

  if (state.handbrakeOn || state.gear === 'P') {
    const decel = 14.0 * clampedDt;
    if (Math.abs(speedMps) <= decel) speedMps = 0;
    else speedMps -= Math.sign(speedMps) * decel;
  } else {
    const maxForwardMps = 45 * MPH_TO_MPS; // ~20.1 m/s
    const maxReverseMps = 12 * MPH_TO_MPS; // ~5.4 m/s
    const accelRate = 8.4;
    const brakeRate = 14.5;
    const rollingDrag = 1.15;

    if (state.gear === 'D') {
      if (throttle > 0) {
        speedMps += throttle * accelRate * clampedDt;
      }
      if (brake > 0) {
        if (speedMps > 0.15) {
          speedMps = Math.max(0, speedMps - brake * brakeRate * clampedDt);
        } else {
          speedMps = Math.max(0, speedMps);
        }
      }
      if (throttle === 0 && brake === 0) {
        const drag = rollingDrag * clampedDt;
        speedMps = Math.abs(speedMps) <= drag ? 0 : speedMps - Math.sign(speedMps) * drag;
      }
      speedMps = Math.max(-maxReverseMps, Math.min(maxForwardMps, speedMps));
    } else if (state.gear === 'R') {
      if (throttle > 0) {
        speedMps -= throttle * 4.2 * clampedDt;
      }
      if (brake > 0) {
        if (speedMps < -0.15) {
          speedMps = Math.min(0, speedMps + brake * brakeRate * clampedDt);
        } else {
          speedMps = 0;
        }
      }
      if (throttle === 0 && brake === 0) {
        const drag = rollingDrag * clampedDt;
        speedMps = Math.abs(speedMps) <= drag ? 0 : speedMps - Math.sign(speedMps) * drag;
      }
      speedMps = Math.max(-maxReverseMps, Math.min(0.5, speedMps));
    }
  }

  let headingRad = state.headingRad;
  if (Math.abs(speedMps) > 0.02) {
    const angularVel = (speedMps / wheelbase) * Math.tan(steerAngleRad);
    headingRad += angularVel * clampedDt;
  }

  const dx = -Math.sin(headingRad) * speedMps * clampedDt;
  const dz = -Math.cos(headingRad) * speedMps * clampedDt;

  return {
    ...state,
    x: state.x + dx,
    z: state.z + dz,
    headingRad,
    speedMps,
    steerAngleRad,
    brakeLightOn: brake > 0.05 || state.handbrakeOn,
    reverseLightOn: state.gear === 'R',
    distanceTravelledM: state.distanceTravelledM + Math.hypot(dx, dz),
  };
}

/**
 * Genuine UK Traffic Light Sequence:
 * Red (8s) -> Red+Amber (1.8s) -> Green (9s) -> Amber (2.5s) -> Red
 */
export function getUkTrafficLightPhase(cycleTimeSec: number): UkTrafficLightPhase {
  const period = 21.3;
  const t = ((cycleTimeSec % period) + period) % period;
  if (t < 8.0) return 'RED';
  if (t < 9.8) return 'RED_AMBER';
  if (t < 18.8) return 'GREEN';
  return 'AMBER';
}

export function evaluateSpeedCompliance(
  speedMph: number,
  limitMph: number
): { status: 'ok' | 'minor' | 'serious'; excessMph: number } {
  const excess = speedMph - limitMph;
  if (excess <= 2) return { status: 'ok', excessMph: Math.max(0, excess) };
  if (excess <= 6) return { status: 'minor', excessMph: excess };
  return { status: 'serious', excessMph: excess };
}

export interface BayBox {
  centerX: number;
  centerZ: number;
  width: number;
  length: number;
  targetHeadingRad: number;
}

export interface ParkingEvaluation {
  insideBay: boolean;
  lateralOffsetM: number;
  longitudinalOffsetM: number;
  centerOffsetM: number;
  headingErrorDeg: number;
  grade: 'pass' | 'minor' | 'fail';
  feedback: string;
}

function normalizeAngleRad(a: number): number {
  let res = a % (Math.PI * 2);
  if (res > Math.PI) res -= Math.PI * 2;
  if (res < -Math.PI) res += Math.PI * 2;
  return res;
}

export function evaluateParkingManoeuvre(
  car: Pick<VehicleKinematicsState, 'x' | 'z' | 'headingRad' | 'speedMps'>,
  bay: BayBox,
  allowEitherDirection = false
): ParkingEvaluation {
  const dx = car.x - bay.centerX;
  const dz = car.z - bay.centerZ;

  // Project offset into bay's local coordinate frame
  const sinH = Math.sin(bay.targetHeadingRad);
  const cosH = Math.cos(bay.targetHeadingRad);
  // Local forward = (-sinH, -cosH), local right = (cosH, -sinH)
  const lateralOffsetM = Math.abs(dx * cosH - dz * sinH);
  const longitudinalOffsetM = Math.abs(-dx * sinH - dz * cosH);

  let headingDiff = Math.abs(normalizeAngleRad(car.headingRad - bay.targetHeadingRad));
  if (allowEitherDirection) {
    const flippedDiff = Math.abs(normalizeAngleRad(car.headingRad - (bay.targetHeadingRad + Math.PI)));
    headingDiff = Math.min(headingDiff, flippedDiff);
  }
  const headingErrorDeg = (headingDiff * 180) / Math.PI;

  const carHalfW = 0.92;
  const carHalfL = 2.05;
  const maxLat = bay.width / 2 - carHalfW;
  const maxLon = bay.length / 2 - carHalfL;

  const insideBay =
    lateralOffsetM <= Math.max(0.25, maxLat) && longitudinalOffsetM <= Math.max(0.35, maxLon);
  const centerOffsetM = Math.hypot(lateralOffsetM, longitudinalOffsetM);

  if (!insideBay) {
    return {
      insideBay: false,
      lateralOffsetM,
      longitudinalOffsetM,
      centerOffsetM,
      headingErrorDeg,
      grade: 'fail',
      feedback: 'Vehicle is outside the marked bay boundary lines.',
    };
  }

  if (headingErrorDeg > 14 || lateralOffsetM > Math.max(0.2, maxLat * 0.85)) {
    return {
      insideBay: true,
      lateralOffsetM,
      longitudinalOffsetM,
      centerOffsetM,
      headingErrorDeg,
      grade: 'minor',
      feedback: 'Inside bay, but alignment or kerb clearance needs minor adjustment.',
    };
  }

  return {
    insideBay: true,
    lateralOffsetM,
    longitudinalOffsetM,
    centerOffsetM,
    headingErrorDeg,
    grade: 'pass',
    feedback: 'Cleanly positioned inside the bay lines and straight.',
  };
}

export interface ManoeuvreScoreBreakdown {
  accuracyScore: number; // 0..100
  positioningScore: number; // 0..100
  controlScore: number; // 0..100
  overallScore: number; // 0..100
  grade: 'Distinction' | 'Pass' | 'Needs Practice';
  notes: string[];
}

function clampPct(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function computeControlScore(faults: DrivingFault[], mirrorChecks: number, minRecommendedMirrors = 1): number {
  const minorControlFaults = faults.filter((f) => f.severity === 'minor').length;
  const severeFaults = faults.filter((f) => f.severity !== 'minor').length;
  const mirrorBonus = mirrorChecks >= minRecommendedMirrors ? 0 : -14;
  return clampPct(100 - minorControlFaults * 10 - severeFaults * 35 + mirrorBonus);
}

function buildGrade(overall: number, severeFaults: number): ManoeuvreScoreBreakdown['grade'] {
  if (severeFaults > 0 || overall < 65) return 'Needs Practice';
  if (overall >= 88) return 'Distinction';
  return 'Pass';
}

export function evaluateManoeuvreScore(params: {
  scenarioId: 'mock-route' | 'parallel-park' | 'bay-park' | 'pull-right' | 'emergency-stop';
  completed: boolean;
  car: VehicleKinematicsState;
  faults: DrivingFault[];
  mirrorChecks: number;
  pullRightMaxDriftM?: number;
  pullRightSignalUsed?: boolean;
  emergencyReactionSec?: number | null;
  emergencyMaxHeadingDriftDeg?: number;
}): ManoeuvreScoreBreakdown {
  const { scenarioId, completed, car, faults, mirrorChecks } = params;
  const severeCount = faults.filter((f) => f.severity !== 'minor').length;
  const controlBase = computeControlScore(faults, mirrorChecks, 1);

  if (scenarioId === 'bay-park' || scenarioId === 'parallel-park') {
    const bay: BayBox =
      scenarioId === 'bay-park'
        ? { centerX: -23.6, centerZ: 36, width: 2.7, length: 5.4, targetHeadingRad: 0 }
        : { centerX: -3.2, centerZ: 24.8, width: 2.55, length: 5.8, targetHeadingRad: 0 };

    const parkEval = evaluateParkingManoeuvre(car, bay, scenarioId === 'bay-park');
    const accuracyScore = parkEval.insideBay
      ? clampPct(100 - parkEval.headingErrorDeg * 3.2 - (completed ? 0 : 15))
      : clampPct(48 - Math.min(40, parkEval.centerOffsetM * 12));
    const positioningScore = parkEval.insideBay
      ? clampPct(100 - parkEval.lateralOffsetM * 65 - parkEval.longitudinalOffsetM * 28)
      : clampPct(45 - Math.min(40, parkEval.lateralOffsetM * 18));
    const controlScore = clampPct(controlBase - (car.handbrakeOn ? 0 : 10));
    const overallScore = clampPct(accuracyScore * 0.4 + positioningScore * 0.35 + controlScore * 0.25);

    const notes: string[] = [
      `Centre offset: ${parkEval.centerOffsetM.toFixed(2)}m · Heading alignment error: ${parkEval.headingErrorDeg.toFixed(1)}°`,
      mirrorChecks > 0
        ? `Effective observation recorded (${mirrorChecks} mirror check${mirrorChecks === 1 ? '' : 's'}).`
        : 'Remember to check mirrors [M] before steering into or reversing into the bay.',
    ];
    if (!parkEval.insideBay) notes.push('Ensure all four wheels finish completely inside the painted bay lines.');

    return {
      accuracyScore,
      positioningScore,
      controlScore,
      overallScore,
      grade: buildGrade(overallScore, severeCount),
      notes,
    };
  }

  if (scenarioId === 'pull-right') {
    const idealKerbX = 44.6;
    const kerbGapM = Math.abs(idealKerbX - car.x);
    const headingErrorDeg = (Math.abs(normalizeAngleRad(car.headingRad)) * 180) / Math.PI;
    const maxDrift = params.pullRightMaxDriftM ?? 0;

    const accuracyScore = completed
      ? clampPct(100 - headingErrorDeg * 2.5 - (params.pullRightSignalUsed === false ? 15 : 0))
      : clampPct(50 - Math.min(35, headingErrorDeg * 2));
    const positioningScore = clampPct(100 - kerbGapM * 26 - maxDrift * 18);
    const controlScore = clampPct(controlBase - (car.handbrakeOn ? 0 : 10));
    const overallScore = clampPct(accuracyScore * 0.35 + positioningScore * 0.35 + controlScore * 0.3);

    const notes: string[] = [
      `Final kerb alignment offset: ${kerbGapM.toFixed(2)}m · Heading straightness: ${headingErrorDeg.toFixed(1)}°`,
      params.pullRightSignalUsed
        ? 'Correctly signalled right [E] before crossing to the opposite kerb.'
        : 'Signal right [E] clearly before pulling over to the right-hand side.',
    ];
    return {
      accuracyScore,
      positioningScore,
      controlScore,
      overallScore,
      grade: buildGrade(overallScore, severeCount),
      notes,
    };
  }

  if (scenarioId === 'emergency-stop') {
    const reactionSec = params.emergencyReactionSec ?? null;
    const headingDriftDeg = params.emergencyMaxHeadingDriftDeg ?? 0;
    const accuracyScore =
      completed && reactionSec !== null
        ? clampPct(100 - Math.max(0, reactionSec - 1.2) * 18)
        : 40;
    const positioningScore = clampPct(100 - headingDriftDeg * 4.5 - Math.abs(car.x + 2.4) * 15);
    const controlScore = clampPct(controlBase - (car.handbrakeOn ? 0 : 12));
    const overallScore = clampPct(accuracyScore * 0.4 + positioningScore * 0.3 + controlScore * 0.3);

    const notes: string[] = [
      reactionSec !== null
        ? `Stopping time after STOP cue: ${reactionSec.toFixed(2)}s · Steering deviation: ${headingDriftDeg.toFixed(1)}°`
        : 'Accelerate to 25–30 mph and bring the car to a firm halt when STOP appears.',
      car.handbrakeOn
        ? 'Vehicle secured properly with handbrake after stopping.'
        : 'Apply the handbrake [Space] immediately once stationary.',
    ];
    return {
      accuracyScore,
      positioningScore,
      controlScore,
      overallScore,
      grade: buildGrade(overallScore, severeCount),
      notes,
    };
  }

  // General city route scoring
  const accuracyScore = clampPct((completed ? 98 : 55) - severeCount * 35);
  const positioningScore = clampPct(
    100 -
      faults.filter((f) => f.category === 'Positioning & Kerb' || f.category === 'Junctions & Roundabouts').length * 16
  );
  const controlScore = controlBase;
  const overallScore = clampPct(accuracyScore * 0.35 + positioningScore * 0.35 + controlScore * 0.3);

  return {
    accuracyScore,
    positioningScore,
    controlScore,
    overallScore,
    grade: buildGrade(overallScore, severeCount),
    notes: [
      `Recorded ${mirrorChecks} mirror check${mirrorChecks === 1 ? '' : 's'} and ${faults.length} DL25 fault${faults.length === 1 ? '' : 's'}.`,
    ],
  };
}

export interface Dl25TestSummary {
  passed: boolean;
  minorCount: number;
  seriousCount: number;
  dangerousCount: number;
  verdictTitle: string;
  verdictSummary: string;
}

export function evaluateDl25TestResult(
  faults: DrivingFault[],
  completedObjective: boolean
): Dl25TestSummary {
  let minorCount = 0;
  let seriousCount = 0;
  let dangerousCount = 0;

  for (const f of faults) {
    if (f.severity === 'minor') minorCount++;
    else if (f.severity === 'serious') seriousCount++;
    else if (f.severity === 'dangerous') dangerousCount++;
  }

  const passed =
    completedObjective &&
    seriousCount === 0 &&
    dangerousCount === 0 &&
    minorCount <= MAX_MINOR_FAULTS_ALLOWED;

  let verdictTitle = 'PASS — Practical Test Standard Met';
  let verdictSummary = `Completed with ${minorCount} driving fault${minorCount === 1 ? '' : 's'} (maximum ${MAX_MINOR_FAULTS_ALLOWED} allowed) and 0 serious or dangerous faults.`;

  if (!completedObjective) {
    verdictTitle = 'TEST ENDED EARLY — Incomplete Route';
    verdictSummary = 'You ended the practical drive before completing the required route or manoeuvre.';
  } else if (dangerousCount > 0 || seriousCount > 0) {
    verdictTitle = 'FAIL — Serious or Dangerous Fault Recorded';
    verdictSummary = `Recorded ${seriousCount} serious and ${dangerousCount} dangerous fault${seriousCount + dangerousCount === 1 ? '' : 's'} alongside ${minorCount} driving fault${minorCount === 1 ? '' : 's'}.`;
  } else if (minorCount > MAX_MINOR_FAULTS_ALLOWED) {
    verdictTitle = 'FAIL — Exceeded Maximum Driving Faults';
    verdictSummary = `Recorded ${minorCount} driving faults (DVSA maximum allowed is ${MAX_MINOR_FAULTS_ALLOWED}).`;
  }

  return {
    passed,
    minorCount,
    seriousCount,
    dangerousCount,
    verdictTitle,
    verdictSummary,
  };
}
