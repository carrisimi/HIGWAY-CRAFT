import * as THREE from 'three';
import {
  makeAsphaltTexture,
  makeBrickWallTexture,
  makeContactShadowTexture,
  makeGrassTexture,
  makeSpeedSignTexture,
} from './proceduralTextures';
import { buildUkCar, type CarRig } from './carBuilder';
import type { UkTrafficLightPhase } from '../logic/practicalEngine';

export interface TrafficSignalHandle {
  redMat: THREE.MeshStandardMaterial;
  amberMat: THREE.MeshStandardMaterial;
  greenMat: THREE.MeshStandardMaterial;
}

export interface AiCarEntity {
  rig: CarRig;
  angle: number; // for roundabout orbit
  radius: number;
  speedRad: number;
}

export interface PedestrianEntity {
  group: THREE.Group;
  leftLeg: THREE.Mesh;
  rightLeg: THREE.Mesh;
  leftArm: THREE.Mesh;
  rightArm: THREE.Mesh;
  x: number;
  z: number;
  crossingProgress: number; // 0 = waiting on left kerb, 1 = crossed
  active: boolean;
}

export interface UkWorldHandles {
  trafficSignals: TrafficSignalHandle[];
  belishaMats: THREE.MeshStandardMaterial[];
  aiCars: AiCarEntity[];
  pedestrian: PedestrianEntity;
  bayHighlightGroup: THREE.Group;
  parallelHighlightGroup: THREE.Group;
  rightPullHighlightGroup: THREE.Group;
  guideGroups: {
    bayPark: THREE.Group;
    parallelPark: THREE.Group;
    pullRight: THREE.Group;
    emergencyStop: THREE.Group;
  };
  updateTrafficSignals: (phase: UkTrafficLightPhase) => void;
  updateBelishaBeacons: (elapsedSec: number) => void;
}

export function buildUkDrivingWorld(
  scene: THREE.Scene,
  maxAnisotropy: number,
  isSoftwareGl: boolean
): UkWorldHandles {
  // 1. Ground terrain extending well beyond driving zone with procedural turf variation
  const grassTex = makeGrassTexture(maxAnisotropy);
  const groundMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: grassTex,
    roughness: 0.94,
    metalness: 0.0,
  });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(420, 420), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  // 2. Road Asphalt & Markings (offset +0.025m above grass to prevent Z-fighting)
  const { map: asphaltMap, bumpMap: asphaltBump } = makeAsphaltTexture(maxAnisotropy);
  const roadMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: asphaltMap,
    bumpMap: asphaltBump,
    bumpScale: 0.015,
    roughness: 0.85,
    metalness: 0.05,
  });

  const roadNS = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 170), roadMat);
  roadNS.rotation.x = -Math.PI / 2;
  roadNS.position.set(0, 0.025, 0);
  roadNS.receiveShadow = true;
  scene.add(roadNS);

  const roadEW = new THREE.Mesh(new THREE.PlaneGeometry(170, 9.6), roadMat);
  roadEW.rotation.x = -Math.PI / 2;
  roadEW.position.set(0, 0.028, 0);
  roadEW.receiveShadow = true;
  scene.add(roadEW);

  // Secondary parallel street on East (x = 42) for Pull Up on Right manoeuvre & loop
  const roadEast = new THREE.Mesh(new THREE.PlaneGeometry(9.0, 120), roadMat);
  roadEast.rotation.x = -Math.PI / 2;
  roadEast.position.set(42, 0.025, 0);
  roadEast.receiveShadow = true;
  scene.add(roadEast);

  // DVSA Test Centre Car Park pad at (-26, 36)
  const carParkPad = new THREE.Mesh(new THREE.PlaneGeometry(28, 22), roadMat);
  carParkPad.rotation.x = -Math.PI / 2;
  carParkPad.position.set(-22, 0.026, 36);
  carParkPad.receiveShadow = true;
  scene.add(carParkPad);

  // Roundabout asphalt ring at (0,0)
  const roundaboutApron = new THREE.Mesh(new THREE.RingGeometry(6.2, 13.8, 48), roadMat);
  roundaboutApron.rotation.x = -Math.PI / 2;
  roundaboutApron.position.set(0, 0.032, 0);
  roundaboutApron.receiveShadow = true;
  scene.add(roundaboutApron);

  // Two clearly separated circulating lanes: inner and outer.
  // Dashed white lane divider follows the full circumference of the ring.
  const roundaboutLaneDashMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.52,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const roundaboutLaneDashGeo = new THREE.BoxGeometry(0.12, 0.025, 0.72);
  const roundaboutLaneDashes = new THREE.Group();
  for (let angle = 0; angle < Math.PI * 2; angle += 0.22) {
    const dash = new THREE.Mesh(roundaboutLaneDashGeo, roundaboutLaneDashMat);
    dash.position.set(Math.cos(angle) * 10, 0.065, Math.sin(angle) * 10);
    dash.rotation.y = -angle;
    roundaboutLaneDashes.add(dash);
  }
  scene.add(roundaboutLaneDashes);

  // Roundabout central grass & brick island
  const kerbMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const islandKerb = new THREE.Mesh(new THREE.CylinderGeometry(6.2, 6.4, 0.24, 36), kerbMat);
  islandKerb.position.set(0, 0.12, 0);
  islandKerb.receiveShadow = true;
  const islandGrass = new THREE.Mesh(
    new THREE.CylinderGeometry(5.8, 5.8, 0.28, 36),
    new THREE.MeshStandardMaterial({ color: 0x4d7c3f, roughness: 0.9 })
  );
  islandGrass.position.set(0, 0.14, 0);
  scene.add(islandKerb, islandGrass);

  // Roundabout landmark monument (5-part composite stepped stone & bronze obelisk)
  const monumentGroup = new THREE.Group();
  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.62, metalness: 0.08 });
  const darkStoneMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.72, metalness: 0.05 });
  const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.34, metalness: 0.85 });

  const plinthBase = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 2.6), darkStoneMat);
  plinthBase.position.y = 0.46;
  const plinthTier = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.25, 0.55, 8), stoneMat);
  plinthTier.position.y = 0.96;
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.78, 3.8, 8), stoneMat);
  shaft.position.y = 3.12;
  shaft.castShadow = !isSoftwareGl;
  const collarRing = new THREE.Mesh(new THREE.CylinderGeometry(0.54, 0.54, 0.16, 16), bronzeMat);
  collarRing.position.y = 5.05;
  const finial = new THREE.Mesh(new THREE.OctahedronGeometry(0.42, 1), bronzeMat);
  finial.position.y = 5.45;
  monumentGroup.add(plinthBase, plinthTier, shaft, collarRing, finial);
  scene.add(monumentGroup);

  // Raised sidewalks / kerbs along main roads
  const pavementMat = new THREE.MeshStandardMaterial({ color: 0xb6bec9, roughness: 0.86 });
  for (const side of [-1, 1]) {
    // North & South of roundabout
    for (const zCenter of [-48, 48]) {
      const walk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 68), pavementMat);
      walk.position.set(side * 6.1, 0.07, zCenter);
      walk.receiveShadow = true;
      scene.add(walk);
    }
  }

  // White & Yellow UK Road Markings (offset +0.045m)
  const whitePaintMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.55,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });
  const yellowPaintMat = new THREE.MeshStandardMaterial({
    color: 0xfacc15,
    roughness: 0.5,
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  });

  // Dashed centre lines along North-South and East-West roads (InstancedMesh)
  const dashGeom = new THREE.PlaneGeometry(0.18, 2.4);
  const dashPositions: Array<{ x: number; z: number; rotY: number }> = [];
  for (let z = -80; z <= 80; z += 5.5) {
    if (Math.abs(z) > 14.5 && Math.abs(z - 32) > 5 && Math.abs(z + 28) > 4.5) {
      dashPositions.push({ x: 0, z, rotY: 0 });
    }
  }
  for (let x = -80; x <= 80; x += 5.5) {
    if (Math.abs(x) > 14.5) {
      dashPositions.push({ x, z: 0, rotY: Math.PI / 2 });
    }
  }
  const dashInst = new THREE.InstancedMesh(dashGeom, whitePaintMat, dashPositions.length);
  const dummy = new THREE.Object3D();
  dashPositions.forEach((p, idx) => {
    dummy.position.set(p.x, 0.045, p.z);
    dummy.rotation.set(-Math.PI / 2, 0, p.rotY);
    dummy.updateMatrix();
    dashInst.setMatrixAt(idx, dummy.matrix);
  });
  dashInst.instanceMatrix.needsUpdate = true;
  dashInst.computeBoundingSphere();
  scene.add(dashInst);

  // Double yellow lines near roundabout approaches
  for (const side of [-1, 1]) {
    for (const zPos of [22, -22]) {
      const dy1 = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 14), yellowPaintMat);
      dy1.rotation.x = -Math.PI / 2;
      dy1.position.set(side * 4.55, 0.046, zPos);
      const dy2 = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 14), yellowPaintMat);
      dy2.rotation.x = -Math.PI / 2;
      dy2.position.set(side * 4.35, 0.046, zPos);
      scene.add(dy1, dy2);
    }
  }

  // Roundabout Give-Way dashed line at Southern approach (z = 14.2, left lane x = -2.4)
  for (let i = -3; i <= 0; i++) {
    const gwLine = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.25), whitePaintMat);
    gwLine.rotation.x = -Math.PI / 2;
    gwLine.position.set(i * 1.15 - 0.5, 0.048, 14.2);
    scene.add(gwLine);
  }

  // 3. UK Traffic Light Junction at (0, 32)
  const stopLine = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.35), whitePaintMat);
  stopLine.rotation.x = -Math.PI / 2;
  stopLine.position.set(-2.4, 0.048, 35.5); // Left-hand lane approaching north toward z=32
  scene.add(stopLine);

  const trafficSignals: TrafficSignalHandle[] = [];
  const createSignalPole = (x: number, z: number, rotY: number) => {
    const poleGroup = new THREE.Group();
    poleGroup.position.set(x, 0, z);
    poleGroup.rotation.y = rotY;

    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6, roughness: 0.4 });
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 4.2, 10), poleMat);
    pole.position.y = 2.1;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.46, 1.25, 0.38), poleMat);
    head.position.set(0, 3.65, 0);

    const redMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      emissive: 0xef4444,
      emissiveIntensity: 2.0,
    });
    const amberMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.0,
    });
    const greenMat = new THREE.MeshStandardMaterial({
      color: 0x14532d,
      emissive: 0x22c55e,
      emissiveIntensity: 0.0,
    });

    const lensGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.08, 16);
    lensGeo.rotateX(Math.PI / 2);

    const redLens = new THREE.Mesh(lensGeo, redMat);
    redLens.position.set(0, 4.02, 0.19);
    const amberLens = new THREE.Mesh(lensGeo, amberMat);
    amberLens.position.set(0, 3.65, 0.19);
    const greenLens = new THREE.Mesh(lensGeo, greenMat);
    greenLens.position.set(0, 3.28, 0.19);

    poleGroup.add(pole, head, redLens, amberLens, greenLens);
    scene.add(poleGroup);
    trafficSignals.push({ redMat, amberMat, greenMat });
  };
  createSignalPole(-5.2, 34.5, 0); // Primary left-side UK signal facing approaching +Z traffic

  // 4. UK Zebra Crossing at z = -28 with flashing Belisha Beacons
  for (let i = -4; i <= 4; i++) {
    if (i % 2 === 0) continue;
    const stripe = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 3.4), whitePaintMat);
    stripe.rotation.x = -Math.PI / 2;
    stripe.position.set(i * 0.95, 0.048, -28);
    scene.add(stripe);
  }

  const belishaMats: THREE.MeshStandardMaterial[] = [];
  for (const side of [-1, 1]) {
    const postGroup = new THREE.Group();
    postGroup.position.set(side * 5.2, 0, -28);
    for (let s = 0; s < 6; s++) {
      const seg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.45, 10),
        new THREE.MeshStandardMaterial({ color: s % 2 === 0 ? 0x0f172a : 0xf8fafc, roughness: 0.5 })
      );
      seg.position.y = 0.225 + s * 0.45;
      postGroup.add(seg);
    }
    const beaconMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.5,
      roughness: 0.2,
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), beaconMat);
    globe.position.y = 2.95;
    postGroup.add(globe);
    scene.add(postGroup);
    belishaMats.push(beaconMat);
  }

  // Articulated 7-part Zebra Pedestrian + grounded radial contact shadow
  const pedGroup = new THREE.Group();
  const pedCoat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.68 });
  const pedSkin = new THREE.MeshStandardMaterial({ color: 0xf3d2b3, roughness: 0.62 });
  const pedTrouser = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.82 });
  const pedHair = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.85 });

  const pedTorso = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.58, 0.24), pedCoat);
  pedTorso.position.y = 1.14;
  pedTorso.castShadow = !isSoftwareGl;

  const pedHead = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), pedSkin);
  pedHead.position.y = 1.62;
  const pedCap = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.165, 0.1, 14), pedHair);
  pedCap.position.y = 1.72;

  const legGeo = new THREE.BoxGeometry(0.15, 0.78, 0.18);
  legGeo.translate(0, -0.39, 0);
  const leftLeg = new THREE.Mesh(legGeo, pedTrouser);
  leftLeg.position.set(-0.11, 0.82, 0);
  const rightLeg = new THREE.Mesh(legGeo, pedTrouser);
  rightLeg.position.set(0.11, 0.82, 0);

  const armGeo = new THREE.BoxGeometry(0.12, 0.5, 0.14);
  armGeo.translate(0, -0.25, 0);
  const leftArm = new THREE.Mesh(armGeo, pedCoat);
  leftArm.position.set(-0.29, 1.38, 0);
  const rightArm = new THREE.Mesh(armGeo, pedCoat);
  rightArm.position.set(0.29, 1.38, 0);

  const pedShadowTex = makeContactShadowTexture();
  const pedShadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.52, 20),
    new THREE.MeshBasicMaterial({ map: pedShadowTex, transparent: true, opacity: 0.6, depthWrite: false })
  );
  pedShadow.rotation.x = -Math.PI / 2;
  pedShadow.position.y = 0.018;

  pedGroup.add(pedTorso, pedHead, pedCap, leftLeg, rightLeg, leftArm, rightArm, pedShadow);
  pedGroup.position.set(-5.8, 0, -28);
  scene.add(pedGroup);
  const pedestrian: PedestrianEntity = {
    group: pedGroup,
    leftLeg,
    rightLeg,
    leftArm,
    rightArm,
    x: -5.8,
    z: -28,
    crossingProgress: 0,
    active: false,
  };

  // 5. UK Speed Limit Signs (30 mph, 20 mph near school/car park)
  const addSpeedSign = (x: number, z: number, limit: number, rotY = 0) => {
    const signGroup = new THREE.Group();
    signGroup.position.set(x, 0, z);
    signGroup.rotation.y = rotY;
    const post = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 2.7, 8),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.4 })
    );
    post.position.y = 1.35;
    const tex = makeSpeedSignTexture(limit, maxAnisotropy);
    const face = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 24),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.35, side: THREE.DoubleSide })
    );
    face.position.set(0, 2.55, 0.06);
    signGroup.add(post, face);
    scene.add(signGroup);
  };

  addSpeedSign(-5.2, 48, 30, 0);
  addSpeedSign(-5.2, -16, 20, 0);

  // 6. Test Centre Parking Bays & Parked Reference Cars
  const bayHighlightGroup = new THREE.Group();
  const bayPositions = [-27, -23.6, -20.2, -16.8];
  bayPositions.forEach((bx, idx) => {
    const leftLine = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 5.4), whitePaintMat);
    leftLine.rotation.x = -Math.PI / 2;
    leftLine.position.set(bx - 1.35, 0.048, 36);
    const rightLine = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 5.4), whitePaintMat);
    rightLine.rotation.x = -Math.PI / 2;
    rightLine.position.set(bx + 1.35, 0.048, 36);
    const backLine = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.12), whitePaintMat);
    backLine.rotation.x = -Math.PI / 2;
    backLine.position.set(bx, 0.048, 33.3);
    scene.add(leftLine, rightLine, backLine);

    // Put parked cars in bays 0 and 2, leaving bay 1 (-23.6, 36) open as the target test bay!
    if (idx === 0 || idx === 2) {
      const parked = buildUkCar({
        bodyColor: idx === 0 ? 0x64748b : 0x991b1b,
        isLearnerCar: false,
        plateText: idx === 0 ? 'LD23 KPR' : 'BN71 XTV',
        maxAnisotropy,
        isSoftwareGl,
      });
      parked.group.position.set(bx, 0, 36);
      scene.add(parked.group);
    }
  });

  // Glowing target outline for Bay Parking (-23.6, 36)
  const bayTargetMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.32,
  });
  const bayTargetFloor = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 5.2), bayTargetMat);
  bayTargetFloor.rotation.x = -Math.PI / 2;
  bayTargetFloor.position.set(-23.6, 0.052, 36);
  bayHighlightGroup.add(bayTargetFloor);
  scene.add(bayHighlightGroup);

  // Parallel Parking Zone on main avenue left kerb (x = -3.2, z = 19..27):
  // Parked lead car at (-3.2, 18.5), target open space behind it at (-3.2, 25.0)
  const leadParkedCar = buildUkCar({
    bodyColor: 0x334155,
    isLearnerCar: false,
    plateText: 'YT24 MLO',
    maxAnisotropy,
    isSoftwareGl,
  });
  leadParkedCar.group.position.set(-3.2, 0, 18.5);
  scene.add(leadParkedCar.group);

  const parallelHighlightGroup = new THREE.Group();
  const parFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 5.8),
    new THREE.MeshBasicMaterial({ color: 0x0ea5e9, transparent: true, opacity: 0.3 })
  );
  parFloor.rotation.x = -Math.PI / 2;
  parFloor.position.set(-3.2, 0.052, 24.8);
  parallelHighlightGroup.add(parFloor);
  scene.add(parallelHighlightGroup);

  // Pull Up on Right zone highlight on East residential road (x = 44.6, z = 18)
  const rightPullHighlightGroup = new THREE.Group();
  const rightFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(2.4, 5.6),
    new THREE.MeshBasicMaterial({ color: 0xf59e0b, transparent: true, opacity: 0.3 })
  );
  rightFloor.rotation.x = -Math.PI / 2;
  rightFloor.position.set(44.6, 0.052, 18);
  rightPullHighlightGroup.add(rightFloor);
  scene.add(rightPullHighlightGroup);

  // 6b. Toggleable 3D Visual Guide Paths & Target Chevrons for Manoeuvres
  const buildGuideRibbon = (pts: Array<[number, number]>, color: number): THREE.Mesh => {
    const vectors = pts.map(([x, z]) => new THREE.Vector3(x, 0.09, z));
    const curve = new THREE.CatmullRomCurve3(vectors);
    const tube = new THREE.TubeGeometry(curve, 32, 0.14, 8, false);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.85 });
    return new THREE.Mesh(tube, mat);
  };

  const makeChevron = (x: number, z: number, rotY: number, color: number): THREE.Mesh => {
    const shape = new THREE.Shape();
    shape.moveTo(0, 0.65);
    shape.lineTo(-0.55, -0.35);
    shape.lineTo(-0.22, -0.35);
    shape.lineTo(0, 0.12);
    shape.lineTo(0.22, -0.35);
    shape.lineTo(0.55, -0.35);
    shape.closePath();
    const mesh = new THREE.Mesh(
      new THREE.ShapeGeometry(shape),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide })
    );
    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = rotY;
    mesh.position.set(x, 0.08, z);
    return mesh;
  };

  const bayGuide = new THREE.Group();
  bayGuide.add(
    buildGuideRibbon(
      [
        [-23.6, 45.0],
        [-23.6, 41.2],
        [-23.6, 36.2],
      ],
      0x10b981
    )
  );
  bayGuide.add(makeChevron(-23.6, 42.2, 0, 0x34d399));
  bayGuide.add(makeChevron(-23.6, 39.2, 0, 0x34d399));
  const bayStopBar = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 0.24),
    new THREE.MeshBasicMaterial({ color: 0x34d399, transparent: true, opacity: 0.9 })
  );
  bayStopBar.rotation.x = -Math.PI / 2;
  bayStopBar.position.set(-23.6, 0.075, 33.9);
  bayGuide.add(bayStopBar);
  scene.add(bayGuide);

  const parallelGuide = new THREE.Group();
  parallelGuide.add(
    buildGuideRibbon(
      [
        [-0.2, 19.0],
        [-1.3, 21.6],
        [-2.7, 23.6],
        [-3.2, 25.0],
      ],
      0x38bdf8
    )
  );
  parallelGuide.add(makeChevron(-1.6, 22.0, Math.PI * 0.8, 0x38bdf8));
  parallelGuide.add(makeChevron(-3.2, 24.8, Math.PI, 0x38bdf8));
  scene.add(parallelGuide);

  const pullRightGuide = new THREE.Group();
  pullRightGuide.add(
    buildGuideRibbon(
      [
        [39.6, 33.5],
        [41.5, 27.5],
        [44.4, 21.8],
        [44.6, 18.0],
      ],
      0xf59e0b
    )
  );
  pullRightGuide.add(
    buildGuideRibbon(
      [
        [44.6, 18.0],
        [44.6, 23.5],
        [44.6, 28.5],
      ],
      0xfbbf24
    )
  );
  pullRightGuide.add(makeChevron(42.8, 24.5, -0.35, 0xf59e0b));
  pullRightGuide.add(makeChevron(44.6, 23.8, Math.PI, 0xfde047));
  pullRightGuide.add(makeChevron(44.6, 27.2, Math.PI, 0xfde047));
  scene.add(pullRightGuide);

  const emergencyStopGuide = new THREE.Group();
  emergencyStopGuide.add(
    buildGuideRibbon(
      [
        [-2.4, 65.0],
        [-2.4, 52.0],
        [-2.4, 41.0],
      ],
      0xf43f5e
    )
  );
  emergencyStopGuide.add(makeChevron(-2.4, 56.0, 0, 0xfb7185));
  emergencyStopGuide.add(makeChevron(-2.4, 48.0, 0, 0xfb7185));
  scene.add(emergencyStopGuide);

  // 7. Composite 8-part British Terraced Houses & Buildings (shared geometries for fast draw calls)
  const houseColors = ['#9b4a3c', '#b4694e', '#d6c6b2', '#7c6f64'];
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.78 });
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.88 });
  const trimWoodMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.55 });
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x0b4f8a, roughness: 0.45 });
  const chimneyPotMat = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8 });

  const sharedPlinthGeo = new THREE.BoxGeometry(8.8, 0.45, 7.5);
  const sharedWallGeo = new THREE.BoxGeometry(8.5, 6.0, 7.2);
  const sharedRoofGeo = new THREE.ConeGeometry(6.65, 2.75, 4);
  const sharedEavesGeo = new THREE.BoxGeometry(8.9, 0.18, 7.6);
  const sharedChimneyGeo = new THREE.BoxGeometry(0.95, 1.9, 0.95);
  const sharedPotGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.36, 10);
  const sharedPorchRoofGeo = new THREE.BoxGeometry(2.1, 0.2, 1.1);
  const sharedDoorGeo = new THREE.BoxGeometry(1.05, 2.15, 0.12);
  const sharedStepGeo = new THREE.BoxGeometry(1.9, 0.16, 0.95);

  const wallMaterials = houseColors.map(
    (hex) =>
      new THREE.MeshStandardMaterial({
        map: makeBrickWallTexture(hex, maxAnisotropy),
        roughness: 0.85,
      })
  );

  const buildHouse = (x: number, z: number, rotY: number, colorIdx: number) => {
    const hGroup = new THREE.Group();
    hGroup.position.set(x, 0, z);
    hGroup.rotation.y = rotY;

    const plinth = new THREE.Mesh(sharedPlinthGeo, plinthMat);
    plinth.position.y = 0.225;

    const wall = new THREE.Mesh(sharedWallGeo, wallMaterials[colorIdx % wallMaterials.length]);
    wall.position.y = 3.45;
    wall.castShadow = !isSoftwareGl;
    wall.receiveShadow = true;

    const eaves = new THREE.Mesh(sharedEavesGeo, trimWoodMat);
    eaves.position.y = 6.48;

    const roof = new THREE.Mesh(sharedRoofGeo, roofMat);
    roof.position.y = 7.92;
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = !isSoftwareGl;

    const chimney = new THREE.Mesh(sharedChimneyGeo, wallMaterials[colorIdx % wallMaterials.length]);
    chimney.position.set(-2.3, 8.25, -1.2);
    const potA = new THREE.Mesh(sharedPotGeo, chimneyPotMat);
    potA.position.set(-2.52, 9.35, -1.2);
    const potB = new THREE.Mesh(sharedPotGeo, chimneyPotMat);
    potB.position.set(-2.08, 9.35, -1.2);

    const door = new THREE.Mesh(sharedDoorGeo, doorMat);
    door.position.set(0, 1.32, 3.63);
    const porchCanopy = new THREE.Mesh(sharedPorchRoofGeo, roofMat);
    porchCanopy.position.set(0, 2.55, 4.1);
    const doorstep = new THREE.Mesh(sharedStepGeo, plinthMat);
    doorstep.position.set(0, 0.08, 4.05);

    hGroup.add(plinth, wall, eaves, roof, chimney, potA, potB, door, porchCanopy, doorstep);
    scene.add(hGroup);
  };

  [
    [-14.5, 55, Math.PI / 2, 0],
    [-14.5, 42, Math.PI / 2, 1],
    [14.5, 52, -Math.PI / 2, 2],
    [14.5, 38, -Math.PI / 2, 3],
    [14.5, 22, -Math.PI / 2, 0],
    [-14.5, -24, Math.PI / 2, 2],
    [-14.5, -38, Math.PI / 2, 1],
    [14.5, -24, -Math.PI / 2, 3],
    [14.5, -38, -Math.PI / 2, 0],
    [54, 24, -Math.PI / 2, 1],
    [54, 10, -Math.PI / 2, 2],
    [54, -8, -Math.PI / 2, 0],
  ].forEach(([x, z, r, c]) => buildHouse(x, z, r, c));

  // 8. Instanced Roadside Broadleaf Trees (> 25 instances with ±15% scale & color variation)
  const treePositions: Array<[number, number]> = [
    [-9.5, 64], [9.5, 62], [-9.5, 28], [9.5, 16],
    [-22, 14], [-34, 14], [22, 14], [32, 14],
    [-22, -14], [-34, -14], [22, -14], [32, -14],
    [-9.5, -18], [9.5, -18], [-9.5, -48], [9.5, -50],
    [35, 34], [35, 20], [35, -16], [35, -32],
    [49, 36], [49, -22], [-38, 42], [-38, 28],
    [-12, 72], [12, 72], [-12, -62], [12, -62],
  ];
  const trunkGeo = new THREE.CylinderGeometry(0.24, 0.34, 2.4, 8);
  trunkGeo.translate(0, 1.2, 0);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, treePositions.length);

  const crownGeo = new THREE.IcosahedronGeometry(1.9, 1);
  crownGeo.translate(0, 3.6, 0);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85 });
  const crownInst = new THREE.InstancedMesh(crownGeo, crownMat, treePositions.length);

  const treeColor = new THREE.Color();
  treePositions.forEach(([tx, tz], i) => {
    const s = 0.88 + ((i * 37) % 100) / 350;
    dummy.position.set(tx, 0, tz);
    dummy.rotation.set(0, (i * 1.1) % (Math.PI * 2), 0);
    dummy.scale.set(s, s, s);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(i, dummy.matrix);
    crownInst.setMatrixAt(i, dummy.matrix);

    treeColor.setHSL(0.28 + ((i % 5) - 2) * 0.015, 0.45, 0.34 + (i % 3) * 0.04);
    crownInst.setColorAt(i, treeColor);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  crownInst.instanceMatrix.needsUpdate = true;
  if (crownInst.instanceColor) crownInst.instanceColor.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  crownInst.computeBoundingSphere();
  scene.add(trunkInst, crownInst);

  // 8b. Streetscape dressing (all decorative, kept clear of drivable road and the car park)
  [
    [-14.5, 12, Math.PI / 2, 3], [-14.5, -10, Math.PI / 2, 0], [-14.5, -52, Math.PI / 2, 3], [-14.5, -66, Math.PI / 2, 2],
    [-14.5, 70, Math.PI / 2, 0], [14.5, 10, -Math.PI / 2, 1], [14.5, -10, -Math.PI / 2, 2], [14.5, -52, -Math.PI / 2, 1],
    [14.5, -66, -Math.PI / 2, 3], [14.5, 66, -Math.PI / 2, 2], [54, -22, -Math.PI / 2, 3], [54, -36, -Math.PI / 2, 1],
  ].forEach(([x, z, r, c]) => buildHouse(x, z, r, c));

  const paveMat = new THREE.MeshStandardMaterial({ color: 0xb9bfc8, roughness: 0.9 });
  const lineMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6 });
  for (const sd of [-1, 1]) {
    for (const [z0, z1] of [[14, 84], [-84, -14]]) {
      const pave = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, z1 - z0), paveMat);
      pave.position.set(sd * 5.7, 0.06, (z0 + z1) / 2);
      pave.receiveShadow = true;
      scene.add(pave);
    }
    // solid white edge lines, broken around the zebra crossing and traffic-light stop lines
    for (const [z0, z1] of [[14, 28], [36, 84], [-84, -32], [-24, -14]]) {
      const edge = new THREE.Mesh(new THREE.PlaneGeometry(0.12, z1 - z0), lineMat);
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(sd * 4.5, 0.032, (z0 + z1) / 2);
      scene.add(edge);
    }
  }

  const lampZ = [-76, -62, -46, -16, 18, 48, 64, 78];
  const poles = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.07, 0.1, 6, 8),
    new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.4, roughness: 0.5 }),
    lampZ.length * 2
  );
  const lampHeads = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.9, 0.14, 0.34),
    new THREE.MeshStandardMaterial({ color: 0xfff3c4, emissive: 0xffd57a, emissiveIntensity: 0.8 }),
    lampZ.length * 2
  );
  const lm = new THREE.Matrix4();
  let li = 0;
  for (const z of lampZ) {
    for (const sd of [-1, 1]) {
      poles.setMatrixAt(li, lm.makeTranslation(sd * 6.3, 3, z));
      lampHeads.setMatrixAt(li, lm.makeTranslation(sd * 5.8, 6.05, z));
      li++;
    }
  }
  poles.castShadow = !isSoftwareGl;
  scene.add(poles, lampHeads);

  const hedgeMat = new THREE.MeshStandardMaterial({ color: 0x3f6b2e, roughness: 1 });
  const hedgeGeo = new THREE.BoxGeometry(0.9, 1.0, 8.2);
  for (const z of [12, -10, -24, -38, -52, -66, 55, 70]) {
    const h = new THREE.Mesh(hedgeGeo, hedgeMat);
    h.position.set(-9.6, 0.5, z);
    h.castShadow = !isSoftwareGl;
    scene.add(h);
  }
  for (const z of [10, -10, 22, 38, 52, -24, -38, -52, -66, 66]) {
    const h = new THREE.Mesh(hedgeGeo, hedgeMat);
    h.position.set(9.6, 0.5, z);
    h.castShadow = !isSoftwareGl;
    scene.add(h);
  }

  // Cars parked on front drives (not on the road, so routes and manoeuvres are unaffected)
  const driveCars: Array<[number, number, number, number]> = [
    [-8, 12, Math.PI, 0xc0392b], [-8, -24, Math.PI, 0x1f6f8b], [8, 22, 0, 0xe5e7eb], [8, -38, 0, 0x374151], [8, 52, 0, 0xd4a017],
  ];
  for (const [x, z, ry, color] of driveCars) {
    const car = buildUkCar({ bodyColor: color, isLearnerCar: false, maxAnisotropy, isSoftwareGl });
    car.group.position.set(x, 0, z);
    car.group.rotation.y = ry;
    scene.add(car.group);
  }

  // 9. Circulating AI Traffic Car on the Roundabout (Clockwise in UK!)
  const aiCarRig = buildUkCar({
    bodyColor: 0xd97706,
    isLearnerCar: false,
    plateText: 'UK25 RBT',
    maxAnisotropy,
    isSoftwareGl,
  });
  scene.add(aiCarRig.group);
  const aiCars: AiCarEntity[] = [
    {
      rig: aiCarRig,
      // Start on the approach driver's right, circulating in the outer lane.
      angle: Math.PI * 0.35,
      radius: 11.8,
      // Positive angle is clockwise when viewed from above in this X/Z world.
      speedRad: 0.42,
    },
  ];

  const updateTrafficSignals = (phase: UkTrafficLightPhase) => {
    for (const s of trafficSignals) {
      s.redMat.emissiveIntensity = phase === 'RED' || phase === 'RED_AMBER' ? 2.4 : 0.05;
      s.amberMat.emissiveIntensity = phase === 'AMBER' || phase === 'RED_AMBER' ? 2.4 : 0.05;
      s.greenMat.emissiveIntensity = phase === 'GREEN' ? 2.4 : 0.05;
    }
  };

  const updateBelishaBeacons = (elapsedSec: number) => {
    const on = Math.floor(elapsedSec * 2.2) % 2 === 0;
    for (const m of belishaMats) {
      m.emissiveIntensity = on ? 2.2 : 0.25;
    }
  };

  return {
    trafficSignals,
    belishaMats,
    aiCars,
    pedestrian,
    bayHighlightGroup,
    parallelHighlightGroup,
    rightPullHighlightGroup,
    guideGroups: {
      bayPark: bayGuide,
      parallelPark: parallelGuide,
      pullRight: pullRightGuide,
      emergencyStop: emergencyStopGuide,
    },
    updateTrafficSignals,
    updateBelishaBeacons,
  };
}
