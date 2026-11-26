import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialVehicleState,
  stepVehicleKinematics,
  getUkTrafficLightPhase,
  evaluateSpeedCompliance,
  evaluateParkingManoeuvre,
  evaluateManoeuvreScore,
  evaluateDl25TestResult,
  MPS_TO_MPH,
  type DrivingFault,
} from './practicalEngine';

test('stepVehicleKinematics accelerates forward and steers accurately', () => {
  let car = createInitialVehicleState(0, 0, 0, 'D');
  for (let i = 0; i < 40; i++) {
    car = stepVehicleKinematics(car, { throttle: 1, brake: 0, steer: 0 }, 0.05);
  }
  assert.ok(car.speedMps > 5, 'Car should accelerate smoothly in Drive');
  assert.ok(car.z < -2, 'Car facing heading 0 should move toward -Z');

  const beforeHeading = car.headingRad;
  car = stepVehicleKinematics(car, { throttle: 0.5, brake: 0, steer: -1 }, 0.05);
  assert.ok(car.headingRad > beforeHeading, 'Steering left should increase headingRad');
});

test('stepVehicleKinematics respects handbrake and reverse gear', () => {
  let car = createInitialVehicleState(0, 0, 0, 'R');
  for (let i = 0; i < 20; i++) {
    car = stepVehicleKinematics(car, { throttle: 1, brake: 0, steer: 0 }, 0.05);
  }
  assert.ok(car.speedMps < -1, 'Reverse gear should produce negative velocity');
  assert.ok(car.z > 0, 'Reversing from heading 0 moves toward +Z');

  car.handbrakeOn = true;
  for (let i = 0; i < 30; i++) {
    car = stepVehicleKinematics(car, { throttle: 1, brake: 0, steer: 0 }, 0.05);
  }
  assert.equal(car.speedMps, 0, 'Handbrake should bring car to 0 speed');
});

test('getUkTrafficLightPhase follows authentic UK Red -> Red+Amber -> Green -> Amber cycle', () => {
  assert.equal(getUkTrafficLightPhase(1.0), 'RED');
  assert.equal(getUkTrafficLightPhase(8.5), 'RED_AMBER');
  assert.equal(getUkTrafficLightPhase(12.0), 'GREEN');
  assert.equal(getUkTrafficLightPhase(19.5), 'AMBER');
  assert.equal(getUkTrafficLightPhase(22.0), 'RED');
});

test('evaluateSpeedCompliance flags minor vs serious speeding properly', () => {
  assert.equal(evaluateSpeedCompliance(31, 30).status, 'ok');
  assert.equal(evaluateSpeedCompliance(34, 30).status, 'minor');
  assert.equal(evaluateSpeedCompliance(39, 30).status, 'serious');
  assert.ok(30 / MPS_TO_MPH > 13);
});

test('evaluateParkingManoeuvre grades centered, angled, and out-of-bay vehicles', () => {
  const bay = { centerX: 10, centerZ: -20, width: 2.6, length: 5.2, targetHeadingRad: 0 };

  const clean = evaluateParkingManoeuvre({ x: 10, z: -20, headingRad: 0.03, speedMps: 0 }, bay);
  assert.equal(clean.insideBay, true);
  assert.equal(clean.grade, 'pass');

  const crooked = evaluateParkingManoeuvre({ x: 10, z: -20, headingRad: 0.35, speedMps: 0 }, bay);
  assert.equal(crooked.insideBay, true);
  assert.equal(crooked.grade, 'minor');

  const outside = evaluateParkingManoeuvre({ x: 12.5, z: -20, headingRad: 0, speedMps: 0 }, bay);
  assert.equal(outside.insideBay, false);
  assert.equal(outside.grade, 'fail');
});

test('evaluateManoeuvreScore scores accuracy, positioning, and control for key UK drills', () => {
  const bayCar = createInitialVehicleState(-23.6, 36, 0.02, 'P');
  bayCar.handbrakeOn = true;
  const bayScore = evaluateManoeuvreScore({
    scenarioId: 'bay-park',
    completed: true,
    car: bayCar,
    faults: [],
    mirrorChecks: 2,
  });
  assert.ok(bayScore.accuracyScore >= 90);
  assert.ok(bayScore.positioningScore >= 90);
  assert.ok(bayScore.controlScore >= 90);
  assert.equal(bayScore.grade, 'Distinction');

  const rightCar = createInitialVehicleState(44.5, 28.0, 0.01, 'R');
  rightCar.handbrakeOn = true;
  const pullRightScore = evaluateManoeuvreScore({
    scenarioId: 'pull-right',
    completed: true,
    car: rightCar,
    faults: [],
    mirrorChecks: 2,
    pullRightMaxDriftM: 0.2,
    pullRightSignalUsed: true,
  });
  assert.ok(pullRightScore.overallScore >= 88);
  assert.equal(pullRightScore.grade, 'Distinction');

  const estopCar = createInitialVehicleState(-2.4, 22, 0.01, 'D');
  estopCar.handbrakeOn = true;
  const estopScore = evaluateManoeuvreScore({
    scenarioId: 'emergency-stop',
    completed: true,
    car: estopCar,
    faults: [],
    mirrorChecks: 1,
    emergencyReactionSec: 1.4,
    emergencyMaxHeadingDriftDeg: 1.5,
  });
  assert.ok(estopScore.overallScore >= 88);
});

test('evaluateDl25TestResult enforces 15 minor limit and 0 serious/dangerous rule', () => {
  const makeMinor = (i: number): DrivingFault => ({
    id: `m-${i}`,
    timestampSec: i * 5,
    category: 'Mirrors',
    severity: 'minor',
    description: 'Mirror check missed',
  });

  const passRun = evaluateDl25TestResult([makeMinor(1), makeMinor(2)], true);
  assert.equal(passRun.passed, true);

  const tooManyMinors = evaluateDl25TestResult(
    Array.from({ length: 16 }, (_, i) => makeMinor(i)),
    true
  );
  assert.equal(tooManyMinors.passed, false);

  const seriousRun = evaluateDl25TestResult(
    [
      makeMinor(1),
      {
        id: 's-1',
        timestampSec: 12,
        category: 'Traffic Lights',
        severity: 'serious',
        description: 'Crossed red traffic light',
      },
    ],
    true
  );
  assert.equal(seriousRun.passed, false);
});
