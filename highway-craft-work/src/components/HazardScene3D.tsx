import * as THREE from 'three';
import { buildUkCar } from '../three/carBuilder';
import { makeAsphaltTexture, makeBrickWallTexture, makeGrassTexture } from '../three/proceduralTextures';
import type { HazardScenario } from '../data/hazardScenarios';

/**
 * First-person dashcam view of a UK road (left-hand traffic, right-hand drive).
 * The studio calls render(tSec) every frame; everything is a pure function of time,
 * so scrubbing, replays and the "results" freeze-frame all work.
 */
export interface HazardScene {
  render: (tSec: number) => void;
  dispose: () => void;
  /** Drive mode: the player controls speed and lane position instead of the scripted dashcam run. */
  setInteractive: (on: boolean) => void;
  setControls: (c: { brake?: boolean; left?: boolean; right?: boolean }) => void;
  getSpeedMph: () => number;
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const ramp = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const ease = (x: number) => x * x * (3 - 2 * x);
const mat = (c: number, r = 0.8, m = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m });
const box = (w: number, h: number, d: number, m: THREE.Material, x = 0, y = 0, z = 0) => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  return mesh;
};

const SKIN = mat(0xe0ac8a, 0.7);
const GLASS = mat(0x1e293b, 0.1, 0.4);
const TYRE = mat(0x111827, 0.9);

function wheel(r: number, w: number, x: number, z: number) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, w, 20), TYRE);
  m.rotation.z = Math.PI / 2;
  m.position.set(x, r, z);
  return m;
}

function person(shirt: number, height = 1.75) {
  const s = height / 1.75;
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.CapsuleGeometry(0.2 * s, 0.55 * s, 6, 12), mat(shirt, 0.8)));
  g.children[0].position.y = 1.15 * s;
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.13 * s, 16, 12), SKIN);
  head.position.y = 1.68 * s;
  g.add(head);
  const legs: THREE.Mesh[] = [];
  for (const x of [-0.09, 0.09]) {
    const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.08 * s, 0.55 * s, 4, 8), mat(0x1e3a5f));
    leg.geometry.translate(0, -0.3 * s, 0); // pivot at the hip
    leg.position.set(x * s, 0.85 * s, 0);
    legs.push(leg);
    g.add(leg);
  }
  g.traverse((o) => (o.castShadow = true));
  g.userData.walk = (t: number, amount = 1) => {
    legs[0].rotation.x = Math.sin(t * 9) * 0.7 * amount;
    legs[1].rotation.x = -Math.sin(t * 9) * 0.7 * amount;
  };
  return g;
}

function van(color: number, length = 5, beacon?: THREE.MeshStandardMaterial) {
  const g = new THREE.Group();
  const paint = mat(color, 0.35, 0.3);
  g.add(box(2, 1.9, length, paint, 0, 1.45, 0.3));
  g.add(box(1.8, 0.8, 0.06, GLASS, 0, 1.9, -length / 2 + 0.2)); // windscreen
  g.add(box(2.02, 0.3, length * 0.98, mat(0x1f2937), 0, 0.55, 0.3));
  for (const x of [-0.95, 0.95]) for (const z of [-length / 2 + 0.9, length / 2 - 0.5]) g.add(wheel(0.38, 0.26, x, z));
  if (beacon) g.add(box(0.5, 0.18, 0.3, beacon, 0, 2.5, 0));
  return g;
}

export function createHazardScene(canvas: HTMLCanvasElement, sc: HazardScenario): HazardScene {
  const W = 1280;
  const H = 640;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power', alpha: false });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const aniso = renderer.capabilities.getMaxAnisotropy();

  const theme = sc.theme;
  const rain = theme === 'rainy-roundabout';
  const rural = theme === 'rural' || theme === 'blind-horse';
  const parked = ['suburban', 'parked-door', 'ice-cream-van'].includes(theme);
  const sky = rain ? 0x76808c : rural ? 0xa8d5f2 : 0x9fd0f2;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(sky);
  scene.fog = new THREE.Fog(sky, rain ? 25 : 70, rain ? 110 : 240);

  scene.add(new THREE.HemisphereLight(0xffffff, 0x6b8f4e, rain ? 0.9 : 1.15));
  const sun = new THREE.DirectionalLight(0xfff1d6, rain ? 0.7 : 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -35, right: 35, top: 35, bottom: -35, near: 1, far: 140 });
  scene.add(sun, sun.target);

  const speed = sc.roadLimitMph * 0.447 * 0.8; // m/s
  const laneX = parked ? -0.9 : -1.75;
  const camX = laneX + 0.36; // right-hand drive: eyes sit right of the car centreline
  const T0 = sc.windowStartSec;
  const ahead = Math.max(28, speed * 4.2); // about 4 seconds of headway on fast roads
  // Distance travelled: steady speed, then the driver brakes smoothly once the hazard has begun
  const dist = (t: number) => {
    const tb = T0 + 0.2;
    if (t <= tb) return speed * t;
    const d = Math.min(t - tb, 2.2);
    return speed * (tb + d - 0.2159 * d * d + 0.05 * Math.max(0, t - tb - 2.2));
  };
  const hz = -speed * T0 - ahead; // where the hazard appears

  // ---- ground, road, kerbs, markings
  const grassTex = makeGrassTexture(aniso);
  grassTex.wrapS = grassTex.wrapT = THREE.RepeatWrapping;
  grassTex.repeat.set(60, 120);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 700), new THREE.MeshStandardMaterial({ map: grassTex, color: rain ? 0x8fa58a : 0xffffff }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -0.02, -250);
  ground.receiveShadow = true;
  scene.add(ground);

  const asph = makeAsphaltTexture(aniso);
  for (const t of [asph.map, asph.bumpMap]) {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 140);
  }
  const road = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 700),
    new THREE.MeshStandardMaterial({ map: asph.map, bumpMap: asph.bumpMap, roughness: rain ? 0.25 : 0.85, metalness: rain ? 0.3 : 0 })
  );
  road.rotation.x = -Math.PI / 2;
  road.position.set(0, 0, -250);
  road.receiveShadow = true;
  scene.add(road);

  for (const s of [-1, 1]) {
    const kerb = box(0.25, 0.15, 700, mat(0xcbd5e1), s * 3.6, 0.07, -250);
    const path = box(2.2, 0.13, 700, mat(0xb6bcc6), s * 4.8, 0.06, -250);
    kerb.receiveShadow = path.receiveShadow = true;
    scene.add(kerb, path);
  }
  const dashGeo = new THREE.BoxGeometry(0.14, 0.012, 2.6);
  const dashes = new THREE.InstancedMesh(dashGeo, mat(0xf8fafc, 0.5), 90);
  const dm = new THREE.Matrix4();
  for (let i = 0; i < 90; i++) dashes.setMatrixAt(i, dm.makeTranslation(0, 0.012, 30 - i * 8));
  scene.add(dashes);

  // ---- roadside: houses (town) or hedgerows (country), trees, lamps
  const brick = ['#9b4a3c', '#b4694e', '#8a7a68'].map((c) => {
    const t = makeBrickWallTexture(c, aniso);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(2, 2);
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 });
  });
  const roofGeo = (() => {
    const s = new THREE.Shape();
    s.moveTo(-5.2, 0); s.lineTo(5.2, 0); s.lineTo(0, 2.8); s.closePath();
    const g = new THREE.ExtrudeGeometry(s, { depth: 8.6, bevelEnabled: false });
    g.translate(0, 0, -4.3);
    return g;
  })();
  const roofMat = mat(0x3b4658, 0.7);
  const glowWin = mat(rain ? 0xfde68a : 0x93c5fd, 0.15, 0.3);
  if (rain) glowWin.emissive = new THREE.Color(0xfbbf24), (glowWin.emissiveIntensity = 0.6);
  const hedge = mat(0x3f6b2e, 1);
  const leaf = mat(0x4f8a35, 0.9);
  const trunk = mat(0x5b4636);
  const treeAt = (x: number, z: number, sc2 = 1) => {
    const g = new THREE.Group();
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 2.6, 8), trunk);
    tr.position.y = 1.3;
    const c1 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), leaf);
    c1.position.y = 3.6;
    const c2 = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), leaf);
    c2.position.set(0.7, 4.5, 0.3);
    g.add(tr, c1, c2);
    g.traverse((o) => (o.castShadow = true));
    g.position.set(x, 0, z);
    g.scale.setScalar(sc2);
    scene.add(g);
  };
  for (let i = 0; i < 44; i++) {
    const z = 30 - i * 13;
    for (const s of [-1, 1]) {
      const gap = Math.abs(z - hz) < 7 && s === -1; // keep the hazard gap clear
      if (rural) {
        if (!gap) scene.add(box(1.4, 1.9, 13, hedge, s * 6.4, 0.95, z));
        if (i % 4 === 1) treeAt(s * 8, z + 3, 1.3);
      } else {
        const h = new THREE.Group();
        h.add(box(9, 6, 8, brick[(i + (s > 0 ? 1 : 0)) % 3], 0, 3, 0));
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 6;
        roof.castShadow = true;
        h.add(roof);
        const face = -s * 4.55;
        for (const dz of [-2.4, 2.4]) h.add(box(0.1, 1.4, 1.3, glowWin, face, 4.3, dz), box(0.1, 1.4, 1.3, glowWin, face, 1.9, dz));
        h.add(box(0.12, 2.2, 1.1, mat(i % 2 ? 0x1d4ed8 : 0x166534), face, 1.1, 0));
        h.position.set(s * 13, 0, z);
        scene.add(h);
        if (i % 2 === 0) treeAt(s * 5.9, z + 6, 0.8);
        if (theme !== 'suburban' && i % 3 === 0) {
          const lamp = box(0.12, 6, 0.12, mat(0x475569), s * 5.7, 3, z - 4);
          lamp.add(box(0.9, 0.12, 0.3, glowWin, -s * 0.5, 3, 0));
          scene.add(lamp);
        }
      }
    }
  }

  // ---- ambient traffic (oncoming, headlights toward us) + parked cars
  const carColors = [0xc0392b, 0x1f6f8b, 0xe5e7eb, 0x374151, 0xd4a017];
  const oncoming: { g: THREE.Group; z0: number }[] = [];
  if (!rural) {
    [-120, -330].forEach((z0, i) => {
      const car = buildUkCar({ isLearnerCar: false, bodyColor: carColors[i + 1], isSoftwareGl: true });
      car.group.rotation.y = Math.PI;
      car.group.position.x = 1.9;
      scene.add(car.group);
      oncoming.push({ g: car.group, z0 });
    });
  }
  if (parked) {
    for (let i = 0; i < 6; i++) {
      const z = 10 - i * 38;
      if (Math.abs(z - hz) < 12) continue;
      const car = buildUkCar({ isLearnerCar: false, bodyColor: carColors[i % 5], isSoftwareGl: true });
      car.group.position.set(-2.65, 0, z);
      scene.add(car.group);
    }
  }

  // ---- the hazard itself: update(t) positions the actors as a function of time
  let hazardUpdate: (t: number) => void = () => {};
  const side = (z: number, x: number) => {
    const s = new THREE.Mesh(new THREE.PlaneGeometry(30, 7), new THREE.MeshStandardMaterial({ map: asph.map, roughness: 0.85 }));
    s.rotation.x = -Math.PI / 2;
    s.position.set(x, 0.005, z);
    scene.add(s);
  };
  const beacon = new THREE.MeshStandardMaterial({ color: 0xff7a00, emissive: 0xff7a00, emissiveIntensity: 2 });
  const blueA = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, emissive: 0x2563eb, emissiveIntensity: 3 });
  const place = (o: THREE.Object3D, x: number, z: number, ry = 0) => {
    o.position.set(x, 0, z);
    o.rotation.y = ry;
    scene.add(o);
    return o;
  };

  if (theme === 'suburban' || theme === 'ice-cream-van') {
    const isIce = theme === 'ice-cream-van';
    const v = place(van(isIce ? 0xfef3c7 : 0x2563eb, 5, isIce ? undefined : undefined), -2.7, hz - 2);
    if (isIce) {
      v.add(box(2.02, 0.35, 4.9, mat(0xf472b6), 0, 1.5, 0.3));
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.9, 16), mat(0xfcd34d));
      cone.position.y = 3;
      cone.rotation.x = Math.PI;
      v.add(cone);
    }
    const kid = person(isIce ? 0xec4899 : 0xf59e0b, 1.2);
    scene.add(kid);
    hazardUpdate = (t) => {
      const p = ease(ramp(t, T0, T0 + 1.6));
      kid.position.set(-4.4 + p * 3.0, 0, hz + 1.5);
      kid.rotation.y = Math.PI / 2;
      kid.userData.walk(t, p > 0 && p < 1 ? 1.6 : 0);
      kid.visible = t > T0 - 0.2;
    };
  } else if (theme === 'rural') {
    const tr = new THREE.Group();
    tr.add(box(1.4, 1.1, 2.6, mat(0x15803d, 0.5), 0, 1.3, 0), box(1.4, 1.5, 1.2, GLASS, 0, 2.3, 0.6));
    tr.add(wheel(0.85, 0.5, -0.95, 0.9), wheel(0.85, 0.5, 0.95, 0.9), wheel(0.45, 0.3, -0.8, -1), wheel(0.45, 0.3, 0.8, -1));
    place(tr, -9, hz);
    hazardUpdate = (t) => {
      tr.position.x = -9 + ease(ramp(t, T0 - 1, T0 + 3.2)) * 7.6;
      tr.rotation.y = -Math.PI / 2;
    };
  } else if (theme === 'blind-horse') {
    const horse = new THREE.Group();
    const brown = mat(0x7c4a2d, 0.8);
    horse.add(box(0.5, 0.8, 1.6, brown, 0, 1.4, 0), box(0.25, 0.9, 0.3, brown, 0, 1.9, -0.9), box(0.22, 0.25, 0.55, brown, 0, 2.3, -1.2));
    for (const x of [-0.17, 0.17]) for (const z of [-0.6, 0.6]) horse.add(box(0.12, 1.1, 0.12, brown, x, 0.55, z));
    const rider = person(0xfde047, 1.5);
    rider.position.set(0, 1.55, 0.1);
    horse.add(rider);
    place(horse, -9, hz);
    hazardUpdate = (t) => {
      horse.position.x = -9 + ease(ramp(t, T0 - 0.6, T0 + 3.4)) * 6.4;
      horse.rotation.y = -Math.PI / 2;
      horse.position.y = Math.abs(Math.sin(t * 6)) * 0.05;
    };
  } else if (theme === 'urban') {
    const bus = new THREE.Group();
    bus.add(box(2.5, 3, 10.5, mat(0xdc2626, 0.4, 0.2), 0, 1.9, 0), box(2.52, 1, 10, GLASS, 0, 2.5, 0));
    for (const z of [-3.5, 3.5]) for (const x of [-1.2, 1.2]) bus.add(wheel(0.5, 0.3, x, z));
    place(bus, -2.6, hz - 3);
    const shelter = box(0.1, 2.4, 3, mat(0x94a3b8, 0.3, 0.5), -5.7, 1.2, hz + 5);
    scene.add(shelter);
    const ped = person(0x22c55e);
    scene.add(ped);
    hazardUpdate = (t) => {
      const p = ease(ramp(t, T0, T0 + 3));
      bus.position.x = -2.6 + p * 1.7;
      bus.position.z = hz - 3 - ramp(t, T0, T0 + 6) * 6;
      ped.position.set(-5.2, 0, hz + 6);
      ped.userData.walk(t, 0);
    };
  } else if (theme === 'dual') {
    const car = buildUkCar({ isLearnerCar: false, bodyColor: 0xd4a017, isSoftwareGl: true });
    place(car.group, -5.5, hz);
    hazardUpdate = (t) => {
      const p = ease(ramp(t, T0, T0 + 2.4));
      car.group.position.set(-5.5 + p * (laneX + 5.5), 0, hz - speed * 0.85 * (t - T0));
      car.group.rotation.y = -0.12 * Math.sin(p * Math.PI);
      car.updateLights({ brake: p > 0.9, reverse: false, leftInd: false, rightInd: p < 1, blinkOn: Math.floor(t * 2.5) % 2 === 0 });
    };
  } else if (theme === 'rainy-roundabout') {
    side(hz, 0);
    const car = buildUkCar({ isLearnerCar: false, bodyColor: 0x374151, isSoftwareGl: true });
    place(car.group, 14, hz + 1.5, Math.PI / 2);
    hazardUpdate = (t) => {
      car.group.position.x = 14 - ease(ramp(t, T0 - 1.5, T0 + 4)) * 20;
    };
  } else if (theme === 'parked-door') {
    const car = buildUkCar({ isLearnerCar: false, bodyColor: 0x7c3aed, isSoftwareGl: true });
    place(car.group, -2.65, hz);
    const hinge = new THREE.Group();
    hinge.position.set(-0.88, 0.9, -0.55);
    hinge.add(box(0.07, 0.8, 1.05, mat(0x7c3aed, 0.3, 0.4), 0, 0, 0.55));
    car.group.add(hinge);
    const dr = person(0x0ea5e9);
    scene.add(dr);
    hazardUpdate = (t) => {
      const p = ease(ramp(t, T0, T0 + 1.2));
      hinge.rotation.y = p * 1.15;
      dr.position.set(-3.5 + p * 0.1, 0, hz - 0.6);
      dr.visible = p > 0.3;
    };
  } else if (theme === 'roadworks-merge') {
    const cone = new THREE.ConeGeometry(0.22, 0.7, 14);
    const cm = mat(0xf97316, 0.5);
    for (let i = 0; i < 14; i++) {
      const c = new THREE.Mesh(cone, cm);
      c.position.set(-3.3 + i * 0.2, 0.35, hz + 12 - i * 2.6);
      c.castShadow = true;
      scene.add(c);
    }
    scene.add(box(2.4, 1, 0.12, mat(0xdc2626), -1.9, 0.9, hz - 25));
    const v = van(0xfacc15, 5.5, beacon);
    place(v, -3, hz - 6);
    hazardUpdate = (t) => {
      const p = ease(ramp(t, T0, T0 + 2.6));
      v.position.x = -3 + p * (laneX + 3);
      v.position.z = hz - 6 - ramp(t, T0, T0 + 6) * 4;
      beacon.emissiveIntensity = Math.floor(t * 4) % 2 ? 3 : 0.3;
    };
  } else {
    // emergency-junction: ambulance with blue lights crossing from the right
    side(hz, 0);
    const amb = van(0xf8fafc, 5.4);
    amb.add(box(2.02, 0.35, 5.3, mat(0xdc2626), 0, 1.2, 0.3), box(0.8, 0.14, 0.3, blueA, 0, 2.52, -1.2));
    const light = new THREE.PointLight(0x3b82f6, 0, 18);
    light.position.set(0, 3, -1);
    amb.add(light);
    place(amb, 16, hz + 1.5, Math.PI / 2);
    hazardUpdate = (t) => {
      amb.position.x = 16 - ease(ramp(t, T0 - 2, T0 + 3.6)) * 22;
      const on = Math.floor(t * 6) % 2 === 0;
      blueA.emissiveIntensity = on ? 4 : 0.4;
      light.intensity = on ? 40 : 0;
    };
  }

  // ---- rain
  let rainPts: THREE.Points | null = null;
  const rainPos = new Float32Array(1100 * 3);
  if (rain) {
    for (let i = 0; i < 1100; i++) rainPos.set([(Math.random() - 0.5) * 30, Math.random() * 14, -Math.random() * 40], i * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    rainPts = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xcbd5e1, size: 0.07, transparent: true, opacity: 0.7 }));
    rainPts.frustumCulled = false;
    scene.add(rainPts);
  }

  // ---- driver's cockpit (dash, wheel, mirror, bonnet) glued to the camera
  const camera = new THREE.PerspectiveCamera(62, W / H, 0.05, 400);
  scene.add(camera);
  const dark = mat(0x111827, 0.7);
  camera.add(box(2.4, 0.4, 0.9, dark, -0.36, -0.86, -0.8));
  const bonnetColor = mat(0x0b6ab8, 0.25, 0.4);
  camera.add(box(1.7, 0.1, 1.8, bonnetColor, -0.36, -0.68, -1.9));
  const wheelRing = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.025, 10, 28), dark);
  wheelRing.position.set(0, -0.5, -0.6);
  wheelRing.rotation.x = -0.9;
  camera.add(wheelRing);
  camera.add(box(0.4, 0.1, 0.04, dark, -0.36, 0.42, -0.7));
  camera.add(box(0.07, 1.2, 0.07, dark, 0.78, 0.1, -0.9));

  let lastT = 0;
  let interactive = false;
  let ud = 0;
  let uSpeed = speed;
  let latOff = 0;
  let curSpeed = speed;
  const ctl = { brake: false, left: false, right: false };
  const render = (t: number) => {
    const restarted = t < lastT - 0.3;
    const dt = t >= lastT ? Math.min(0.1, t - lastT) : 0.016;
    lastT = t;
    if (restarted) {
      ud = 0;
      uSpeed = speed;
      latOff = 0;
    }
    let z: number;
    let steer = 0;
    if (interactive) {
      uSpeed += ((ctl.brake ? 0 : speed) - uSpeed) * Math.min(1, dt * (ctl.brake ? 2.6 : 0.7));
      steer = (ctl.right ? 1 : 0) - (ctl.left ? 1 : 0);
      latOff = Math.max(-1.1, Math.min(1.3, latOff + steer * 1.8 * dt));
      ud += uSpeed * dt;
      curSpeed = uSpeed;
      z = -ud;
    } else {
      z = -dist(t);
      curSpeed = (dist(t) - dist(Math.max(0, t - 0.05))) / 0.05;
    }
    const cx = camX + (interactive ? latOff : 0);
    camera.position.set(cx + Math.sin(t * 0.7) * 0.01, 1.2 + Math.sin(t * 9) * 0.004, z);
    camera.rotation.set(-0.03, -steer * 0.03, 0);
    wheelRing.rotation.z = -steer * 0.7;
    sun.position.set(cx - 30, 50, z + 20);
    sun.target.position.set(cx, 0, z - 10);
    for (const o of oncoming) o.g.position.z = o.z0 + 12 * t;
    hazardUpdate(t);
    if (rainPts) {
      for (let i = 0; i < 1100; i++) {
        let y = rainPos[i * 3 + 1] - 20 * dt;
        if (y < 0) y += 14;
        rainPos[i * 3 + 1] = y;
      }
      rainPts.position.set(cx, 0, z - 8);
      (rainPts.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
    }
    renderer.render(scene, camera);
  };

  render(1);
  return {
    render,
    setInteractive: (on) => {
      interactive = on;
      ud = 0;
      uSpeed = speed;
      latOff = 0;
      ctl.brake = ctl.left = ctl.right = false;
    },
    setControls: (c) => Object.assign(ctl, c),
    getSpeedMph: () => Math.round(curSpeed / 0.447 / 0.8),
    dispose: () => {
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) geometries.add(m.geometry);
        const list = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
        for (const material of list) {
          materials.add(material);
          for (const value of Object.values(material)) if (value instanceof THREE.Texture) textures.add(value);
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
