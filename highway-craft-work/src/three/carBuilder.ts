import * as THREE from 'three';
import {
  makeContactShadowTexture,
  makeLearnerPlateTexture,
  makePlateTexture,
} from './proceduralTextures';

export interface CarRig {
  group: THREE.Group;
  steeringWheel: THREE.Group;
  frontLeftPivot: THREE.Group;
  frontRightPivot: THREE.Group;
  wheelMeshes: THREE.Group[];
  brakeLightMat: THREE.MeshStandardMaterial;
  reverseLightMat: THREE.MeshStandardMaterial;
  leftIndicatorMat: THREE.MeshStandardMaterial;
  rightIndicatorMat: THREE.MeshStandardMaterial;
  cockpitAnchor: THREE.Object3D;
  chaseTarget: THREE.Object3D;
  updateLights: (opts: {
    brake: boolean;
    reverse: boolean;
    leftInd: boolean;
    rightInd: boolean;
    blinkOn: boolean;
  }) => void;
  updateWheels: (steerRad: number, wheelSpinRad: number) => void;
}

export interface CarBuildOptions {
  bodyColor?: number;
  isLearnerCar?: boolean;
  plateText?: string;
  maxAnisotropy?: number;
  isSoftwareGl?: boolean;
}

export function buildUkCar(options: CarBuildOptions = {}): CarRig {
  const {
    bodyColor = 0x0b4f8a,
    isLearnerCar = true,
    plateText = 'DV26 UKA',
    maxAnisotropy = 4,
    isSoftwareGl = false,
  } = options;

  const group = new THREE.Group();

  // Materials with clear roughness/metalness contrast
  const paintMat = new THREE.MeshPhysicalMaterial({
    color: bodyColor,
    metalness: 0.45,
    roughness: 0.24,
    clearcoat: 0.9,
    clearcoatRoughness: 0.12,
  });

  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.78,
    metalness: 0.1,
  });

  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.92,
    roughness: 0.16,
  });

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0f172a,
    metalness: 0.1,
    roughness: 0.08,
    transparent: true,
    opacity: isSoftwareGl ? 0.22 : 0.24,
    clearcoat: 1.0,
  });

  const tyreMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.88,
    metalness: 0.05,
  });

  const alloyMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    metalness: 0.86,
    roughness: 0.22,
  });

  // Helper: rounded-edge box (width x, height y, depth z) so nothing reads as a raw cube
  const rbox = (w: number, h: number, d: number, r: number, mat: THREE.Material) => {
    const s = new THREE.Shape();
    const x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ExtrudeGeometry(s, {
      depth: d, bevelEnabled: true, bevelThickness: r * 0.4, bevelSize: r * 0.4, bevelSegments: 2, curveSegments: 6,
    });
    g.translate(0, 0, -d / 2);
    const m = new THREE.Mesh(g, mat);
    m.castShadow = !isSoftwareGl;
    return m;
  };

  // 1. Smooth lower body: curved nose, bonnet, beltline and tail (shape x = world Z, front at -Z)
  const lower = new THREE.Shape();
  lower.moveTo(-2.0, 0.30);
  lower.lineTo(-2.06, 0.52);
  lower.quadraticCurveTo(-2.06, 0.72, -1.78, 0.78);
  lower.lineTo(-1.2, 0.90);
  lower.lineTo(-0.9, 0.93);
  lower.lineTo(1.3, 0.93);
  lower.quadraticCurveTo(1.95, 0.95, 2.03, 0.76);
  lower.lineTo(2.06, 0.5);
  lower.quadraticCurveTo(2.05, 0.31, 1.88, 0.30);
  lower.closePath();
  const bodyGeom = new THREE.ExtrudeGeometry(lower, {
    depth: 1.6, bevelEnabled: true, bevelThickness: 0.07, bevelSize: 0.07, bevelSegments: 4, curveSegments: 14,
  });
  bodyGeom.translate(0, 0, -0.8);
  bodyGeom.rotateY(-Math.PI / 2);
  bodyGeom.computeVertexNormals();
  const bodyMesh = new THREE.Mesh(bodyGeom, paintMat);
  bodyMesh.castShadow = !isSoftwareGl;
  bodyMesh.receiveShadow = true;
  group.add(bodyMesh);

  // 2. Black lower sill / bumpers
  const sill = rbox(1.76, 0.1, 3.5, 0.04, trimMat);
  sill.position.set(0, 0.3, 0);
  const fBump = rbox(1.6, 0.14, 0.2, 0.06, trimMat); fBump.position.set(0, 0.36, -2.06);
  const rBump = rbox(1.6, 0.14, 0.2, 0.06, trimMat); rBump.position.set(0, 0.36, 2.04);
  group.add(sill, fBump, rBump);

  // 3. Glasshouse with pillars and a gloss roof panel
  const cabin = new THREE.Shape();
  cabin.moveTo(-0.95, 0.92);
  cabin.lineTo(-0.5, 1.37);
  cabin.quadraticCurveTo(-0.44, 1.42, -0.3, 1.42);
  cabin.lineTo(1.0, 1.42);
  cabin.quadraticCurveTo(1.2, 1.42, 1.3, 1.3);
  cabin.lineTo(1.84, 0.92);
  cabin.closePath();
  const cabinGeom = new THREE.ExtrudeGeometry(cabin, { depth: 1.44, bevelEnabled: false, curveSegments: 10 });
  cabinGeom.translate(0, 0, -0.72);
  cabinGeom.rotateY(-Math.PI / 2);
  group.add(new THREE.Mesh(cabinGeom, glassMat));

  const roof = rbox(1.46, 0.06, 1.42, 0.03, paintMat);
  roof.position.set(0, 1.43, 0.35);
  group.add(roof);
  const pillar = (z: number, y: number, len: number, rot: number, side: number) => {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.055, len, 0.06), paintMat);
    p.position.set(side * 0.73, y, z);
    p.rotation.x = rot;
    group.add(p);
  };
  for (const side of [-1, 1]) {
    pillar(-0.73, 1.15, 0.66, 0.75, side); // A
    pillar(0.35, 1.17, 0.5, 0, side);      // B
    pillar(1.57, 1.11, 0.64, -0.94, side); // C
  }

  // Door shut lines and handles
  for (const side of [-1, 1]) {
    for (const z of [-0.6, 0.35, 1.2]) {
      const line = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.5, 0.014), trimMat);
      line.position.set(side * 0.875, 0.65, z);
      group.add(line);
    }
    for (const z of [-0.1, 0.78]) {
      const h = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.03, 0.16), chromeMat);
      h.position.set(side * 0.885, 0.84, z);
      group.add(h);
    }
  }

  // 4. Right-hand-drive interior (wheel on +x side)
  const dash = rbox(1.5, 0.24, 0.42, 0.05, trimMat);
  dash.position.set(0, 0.84, -0.82);
  group.add(dash);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
  for (const x of [-0.36, 0.36]) {
    const seat = rbox(0.42, 0.5, 0.14, 0.05, seatMat);
    seat.position.set(x, 1.05, 0.5);
    seat.rotation.x = -0.12;
    group.add(seat);
  }

  const steeringWheel = new THREE.Group();
  steeringWheel.position.set(0.36, 0.94, -0.58);
  steeringWheel.rotation.x = -0.45;
  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.022, 10, 28), trimMat);
  const wheelSpoke = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.03, 0.02), chromeMat);
  const wheelCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 14), trimMat);
  wheelCenter.rotation.x = Math.PI / 2;
  steeringWheel.add(wheelRim, wheelSpoke, wheelCenter);
  group.add(steeringWheel);

  // 5. Wing mirrors on stalks
  for (const side of [-1, 1]) {
    const mirror = rbox(0.1, 0.12, 0.2, 0.04, paintMat);
    mirror.position.set(side * 0.99, 0.98, -0.66);
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.1), chromeMat);
    glass.position.set(side * 0.99, 0.98, -0.555);
    group.add(mirror, glass);
  }

  // 6. Front Grille & Headlights
  const grille = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.18, 0.06), trimMat);
  grille.position.set(0, 0.48, -2.10);
  group.add(grille);

  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfef9c3,
    emissive: 0xfef08a,
    emissiveIntensity: 0.7,
    roughness: 0.15,
  });
  for (const side of [-1, 1]) {
    const hl = rbox(0.34, 0.12, 0.08, 0.04, headlightMat);
    hl.position.set(side * 0.62, 0.60, -2.06);
    group.add(hl);
  }

  // 7. Tail Lights, Brake Lights, Reverse Light & Indicators
  const brakeLightMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    emissive: 0xef4444,
    emissiveIntensity: 0.25,
    roughness: 0.2,
  });
  const reverseLightMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    emissive: 0xffffff,
    emissiveIntensity: 0.0,
    roughness: 0.2,
  });
  const leftIndicatorMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.0,
    roughness: 0.2,
  });
  const rightIndicatorMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    emissive: 0xf59e0b,
    emissiveIntensity: 0.0,
    roughness: 0.2,
  });

  for (const side of [-1, 1]) {
    const tail = rbox(0.3, 0.12, 0.07, 0.04, brakeLightMat);
    tail.position.set(side * 0.66, 0.68, 2.04);
    group.add(tail);

    const indMat = side < 0 ? leftIndicatorMat : rightIndicatorMat;
    const rearInd = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.10, 0.07), indMat);
    rearInd.position.set(side * 0.82, 0.68, 2.04);
    const frontInd = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.09, 0.08), indMat);
    frontInd.position.set(side * 0.80, 0.60, -2.05);
    group.add(rearInd, frontInd);
  }

  const revLight = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.06), reverseLightMat);
  revLight.position.set(-0.42, 0.56, 2.05);
  group.add(revLight);

  // 8. UK Number Plates (Front White, Rear Yellow) placed cleanly outside beveled bodywork
  const frontPlateTex = makePlateTexture(plateText, '#FFFFFF', '#0F172A', maxAnisotropy);
  const rearPlateTex = makePlateTexture(plateText, '#FACC15', '#0F172A', maxAnisotropy);
  const frontPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.54, 0.13),
    new THREE.MeshStandardMaterial({ map: frontPlateTex, roughness: 0.35 })
  );
  frontPlate.position.set(0, 0.38, -2.18);
  frontPlate.rotation.y = Math.PI;
  const rearPlate = new THREE.Mesh(
    new THREE.PlaneGeometry(0.54, 0.13),
    new THREE.MeshStandardMaterial({ map: rearPlateTex, roughness: 0.35 })
  );
  rearPlate.position.set(0, 0.48, 2.14);
  group.add(frontPlate, rearPlate);

  // 9. Driving School Roof Box & 'L' Learner Plates (if player car)
  if (isLearnerCar) {
    const roofBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.76, 0.16, 0.28),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.25 })
    );
    roofBox.position.set(0, 1.54, 0.12);
    const roofBand = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.05, 0.30),
      new THREE.MeshStandardMaterial({ color: 0x0b4f8a, roughness: 0.3 })
    );
    roofBand.position.set(0, 1.48, 0.12);
    group.add(roofBox, roofBand);

    const lTex = makeLearnerPlateTexture(maxAnisotropy);
    const lMat = new THREE.MeshStandardMaterial({ map: lTex, roughness: 0.35 });
    const frontL = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), lMat);
    frontL.position.set(-0.48, 0.78, -1.78);
    frontL.rotation.x = -1.25;
    frontL.rotation.y = Math.PI;
    const rearL = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.22), lMat);
    rearL.position.set(0.48, 0.68, 2.13);
    group.add(frontL, rearL);
  }

  // 10. Four Composite Alloy Wheels (Front 2 steered via pivots, all 4 spin)
  const wheelMeshes: THREE.Group[] = [];
  const discMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.4 });
  const createWheel = (): THREE.Group => {
    const wGroup = new THREE.Group();
    const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.235, 0.088, 14, 32), tyreMat);
    tyre.rotation.y = Math.PI / 2;
    const tread = new THREE.Mesh(new THREE.CylinderGeometry(0.322, 0.322, 0.17, 28, 1, true), tyreMat);
    tread.rotation.z = Math.PI / 2;
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.05, 20), discMat);
    disc.rotation.z = Math.PI / 2;
    const face = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 24), alloyMat);
    face.rotation.z = Math.PI / 2;
    wGroup.add(tyre, tread, disc, face);
    for (let i = 0; i < 5; i++) {
      const sp = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.34, 0.05), alloyMat);
      sp.rotation.x = (i * Math.PI) / 5;
      wGroup.add(sp);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.15, 12), trimMat);
    hub.rotation.z = Math.PI / 2;
    wGroup.add(hub);
    return wGroup;
  };

  // Dark wheel-arch liners so tyres sit inside the bodywork
  for (const side of [-1, 1]) {
    for (const z of [-1.32, 1.32]) {
      const arch = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.02, 24), trimMat);
      arch.rotation.z = Math.PI / 2;
      arch.position.set(side * 0.88, 0.34, z);
      group.add(arch);
    }
  }

  const frontLeftPivot = new THREE.Group();
  frontLeftPivot.position.set(-0.84, 0.32, -1.32);
  const flWheel = createWheel();
  frontLeftPivot.add(flWheel);
  wheelMeshes.push(flWheel);

  const frontRightPivot = new THREE.Group();
  frontRightPivot.position.set(0.84, 0.32, -1.32);
  const frWheel = createWheel();
  frontRightPivot.add(frWheel);
  wheelMeshes.push(frWheel);

  const rlWheel = createWheel();
  rlWheel.position.set(-0.84, 0.32, 1.32);
  wheelMeshes.push(rlWheel);

  const rrWheel = createWheel();
  rrWheel.position.set(0.84, 0.32, 1.32);
  wheelMeshes.push(rrWheel);

  group.add(frontLeftPivot, frontRightPivot, rlWheel, rrWheel);

  // 11. Contact shadow plane grounded under the tyres
  const shadowTex = makeContactShadowTexture();
  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(2.5, 4.7),
    new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = 0.015;
  group.add(shadowPlane);

  // Camera anchors (UK RHD cockpit position cleanly over dash & wheel!)
  const cockpitAnchor = new THREE.Object3D();
  cockpitAnchor.position.set(0.36, 1.24, -0.16);
  group.add(cockpitAnchor);

  const chaseTarget = new THREE.Object3D();
  chaseTarget.position.set(0.36, 1.12, -5.0);
  group.add(chaseTarget);

  const updateLights: CarRig['updateLights'] = ({
    brake,
    reverse,
    leftInd,
    rightInd,
    blinkOn,
  }) => {
    brakeLightMat.emissiveIntensity = brake ? 2.6 : 0.35;
    reverseLightMat.emissiveIntensity = reverse ? 2.0 : 0.0;
    leftIndicatorMat.emissiveIntensity = leftInd && blinkOn ? 2.8 : 0.0;
    rightIndicatorMat.emissiveIntensity = rightInd && blinkOn ? 2.8 : 0.0;
  };

  const updateWheels: CarRig['updateWheels'] = (steerRad, wheelSpinRad) => {
    frontLeftPivot.rotation.y = steerRad;
    frontRightPivot.rotation.y = steerRad;
    steeringWheel.rotation.z = -steerRad * 2.4;
    for (const w of wheelMeshes) {
      w.rotation.x = wheelSpinRad;
    }
  };

  return {
    group,
    steeringWheel,
    frontLeftPivot,
    frontRightPivot,
    wheelMeshes,
    brakeLightMat,
    reverseLightMat,
    leftIndicatorMat,
    rightIndicatorMat,
    cockpitAnchor,
    chaseTarget,
    updateLights,
    updateWheels,
  };
}
