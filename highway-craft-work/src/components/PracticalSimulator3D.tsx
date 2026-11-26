import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  Camera,
  Eye,
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Compass,
  Pause,
  Play,
} from 'lucide-react';
import { buildUkCar, type CarRig } from '../three/carBuilder';
import { buildUkDrivingWorld, type UkWorldHandles } from '../three/ukWorldBuilder';
import {
  createInitialVehicleState,
  evaluateDl25TestResult,
  evaluateManoeuvreScore,
  evaluateParkingManoeuvre,
  evaluateSpeedCompliance,
  getUkTrafficLightPhase,
  MPS_TO_MPH,
  stepVehicleKinematics,
  type DrivingFault,
  type GearMode,
  type ManoeuvreScoreBreakdown,
  type UkTrafficLightPhase,
  type VehicleKinematicsState,
} from '../logic/practicalEngine';
import { soundEngine } from '../utils/soundEngine';

import { PRACTICAL_SCENARIOS, type PracticalScenarioId } from '../data/practicalScenarios';

export type CameraViewMode = 'chase' | 'cockpit' | 'overhead';

// Pre-allocated scratch vectors outside render loop (zero GC)
const _camDesired = new THREE.Vector3();
const _lookDesired = new THREE.Vector3();
const _worldAnchor = new THREE.Vector3();
const _worldTarget = new THREE.Vector3();

export type GameShellState = 'title' | 'playing' | 'paused' | 'gameover';

interface HudSnapshot {
  speedMph: number;
  limitMph: number;
  gear: GearMode;
  handbrakeOn: boolean;
  indicatorLeft: boolean;
  indicatorRight: boolean;
  trafficPhase: UkTrafficLightPhase;
  examinerPrompt: string;
  emergencyActive: boolean;
  mirrorCheckedAgoSec: number;
  activeStepIndex: number;
  faults: DrivingFault[];
  elapsedSec: number;
}

interface PracticalSimulator3DProps {
  initialScenarioId?: PracticalScenarioId;
  onExitToAcademy: () => void;
  onRecordPracticalPass: (
    passed: boolean,
    minors: number,
    serious?: number,
    scoreBreakdown?: ManoeuvreScoreBreakdown,
    scenarioId?: PracticalScenarioId
  ) => void;
}

export function PracticalSimulator3D({
  initialScenarioId = 'mock-route',
  onExitToAcademy,
  onRecordPracticalPass,
}: PracticalSimulator3DProps) {
  const autostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [gameState, setGameState] = useState<GameShellState>(autostart ? 'playing' : 'title');
  const [scenarioId, setScenarioId] = useState<PracticalScenarioId>(initialScenarioId);
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('chase');
  const [showVisualGuide, setShowVisualGuide] = useState<boolean>(true);
  const [muted, setMuted] = useState<boolean>(soundEngine.isMuted());
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [testOutcome, setTestOutcome] = useState<{
    completed: boolean;
    faults: DrivingFault[];
    scoreBreakdown: ManoeuvreScoreBreakdown;
  } | null>(null);

  const [hud, setHud] = useState<HudSnapshot>(() => {
    const sc = PRACTICAL_SCENARIOS.find((s) => s.id === initialScenarioId) ?? PRACTICAL_SCENARIOS[0];
    return {
      speedMph: 0,
      limitMph: 30,
      gear: sc.spawn.gear,
      handbrakeOn: false,
      indicatorLeft: false,
      indicatorRight: false,
      trafficPhase: 'RED',
      examinerPrompt: sc.initialPrompt,
      emergencyActive: false,
      mirrorCheckedAgoSec: 0,
      activeStepIndex: 0,
      faults: [],
      elapsedSec: 0,
    };
  });

  const mountRef = useRef<HTMLDivElement | null>(null);
  const carStateRef = useRef<VehicleKinematicsState>(
    (() => {
      const sc = PRACTICAL_SCENARIOS.find((s) => s.id === initialScenarioId) ?? PRACTICAL_SCENARIOS[0];
      return createInitialVehicleState(sc.spawn.x, sc.spawn.z, sc.spawn.headingRad, sc.spawn.gear);
    })()
  );

  // Mutable simulation refs so React updates never tear down WebGL
  const gameStateRef = useRef<GameShellState>(autostart ? 'playing' : 'title');
  const scenarioRef = useRef<PracticalScenarioId>(initialScenarioId);
  const cameraModeRef = useRef<CameraViewMode>('chase');
  const showGuideRef = useRef<boolean>(true);
  const keysRef = useRef<Set<string>>(new Set());
  const touchInputRef = useRef({ throttle: 0, brake: 0, steer: 0 });
  const faultsRef = useRef<DrivingFault[]>([]);
  const faultCooldownRef = useRef<Record<string, number>>({});
  const mirrorTimerRef = useRef<number>(0);
  const mirrorCountRef = useRef<number>(0);
  const simTimeRef = useRef<number>(0);
  const testEndedRef = useRef<boolean>(false);
  const pullRightStageRef = useRef<'approach' | 'pulled_up' | 'reversing'>('approach');
  const pullRightMaxDriftRef = useRef<number>(0);
  const pullRightSignalUsedRef = useRef<boolean>(false);
  const emergencyTriggeredRef = useRef<boolean>(false);
  const emergencyTriggerTimeRef = useRef<number>(0);
  const emergencyReactionSecRef = useRef<number | null>(null);
  const emergencyMaxHeadingDriftRef = useRef<number>(0);
  const emergencyBrakedDoneRef = useRef<boolean>(false);
  const wheelSpinRef = useRef<number>(0);
  const lastHudSyncRef = useRef<number>(0);
  const traumaRef = useRef<number>(0);
  const hitstopRef = useRef<number>(0);
  const impactFlashRef = useRef<number>(0);
  const spawnBurstRef = useRef<(x: number, z: number) => void>(() => {});

  const worldRef = useRef<UkWorldHandles | null>(null);
  const carRigRef = useRef<CarRig | null>(null);

  const onRecordPassRef = useRef(onRecordPracticalPass);
  onRecordPassRef.current = onRecordPracticalPass;

  const setShellState = (next: GameShellState) => {
    gameStateRef.current = next;
    setGameState(next);
    document.body.dataset.state = next;
    if (next !== 'playing') {
      soundEngine.stopEngine();
    }
  };

  const resetScenario = (nextId: PracticalScenarioId, targetState: GameShellState = 'playing') => {
    const sc = PRACTICAL_SCENARIOS.find((s) => s.id === nextId) ?? PRACTICAL_SCENARIOS[0];
    scenarioRef.current = nextId;
    setScenarioId(nextId);
    carStateRef.current = createInitialVehicleState(
      sc.spawn.x,
      sc.spawn.z,
      sc.spawn.headingRad,
      sc.spawn.gear
    );
    faultsRef.current = [];
    faultCooldownRef.current = {};
    mirrorTimerRef.current = 0;
    mirrorCountRef.current = 0;
    simTimeRef.current = 0;
    testEndedRef.current = false;
    traumaRef.current = 0;
    hitstopRef.current = 0;
    impactFlashRef.current = 0;
    pullRightStageRef.current = 'approach';
    pullRightMaxDriftRef.current = 0;
    pullRightSignalUsedRef.current = false;
    emergencyTriggeredRef.current = false;
    emergencyTriggerTimeRef.current = 0;
    emergencyReactionSecRef.current = null;
    emergencyMaxHeadingDriftRef.current = 0;
    emergencyBrakedDoneRef.current = false;
    keysRef.current.clear();
    touchInputRef.current = { throttle: 0, brake: 0, steer: 0 };
    setTestOutcome(null);
    setShellState(targetState);

    if (worldRef.current) {
      worldRef.current.pedestrian.crossingProgress = 0;
      worldRef.current.pedestrian.active = false;
      worldRef.current.pedestrian.group.position.set(-5.8, 0, -28);
      worldRef.current.pedestrian.leftLeg.rotation.x = 0;
      worldRef.current.pedestrian.rightLeg.rotation.x = 0;
      worldRef.current.pedestrian.leftArm.rotation.x = 0;
      worldRef.current.pedestrian.rightArm.rotation.x = 0;
      worldRef.current.bayHighlightGroup.visible = nextId === 'bay-park';
      worldRef.current.parallelHighlightGroup.visible = nextId === 'parallel-park';
      worldRef.current.rightPullHighlightGroup.visible = nextId === 'pull-right';
      const showG = showGuideRef.current;
      worldRef.current.guideGroups.bayPark.visible = showG && nextId === 'bay-park';
      worldRef.current.guideGroups.parallelPark.visible = showG && nextId === 'parallel-park';
      worldRef.current.guideGroups.pullRight.visible = showG && nextId === 'pull-right';
      worldRef.current.guideGroups.emergencyStop.visible = showG && nextId === 'emergency-stop';
    }

    setHud({
      speedMph: 0,
      limitMph: 30,
      gear: sc.spawn.gear,
      handbrakeOn: false,
      indicatorLeft: false,
      indicatorRight: false,
      trafficPhase: getUkTrafficLightPhase(0),
      examinerPrompt: sc.initialPrompt,
      emergencyActive: false,
      mirrorCheckedAgoSec: 0,
      activeStepIndex: 0,
      faults: [],
      elapsedSec: 0,
    });
  };

  useEffect(() => {
    document.body.dataset.state = autostart ? 'playing' : 'title';
    return () => {
      soundEngine.stopEngine();
      delete document.body.dataset.state;
    };
  }, [autostart]);

  useEffect(() => {
    cameraModeRef.current = cameraMode;
  }, [cameraMode]);

  useEffect(() => {
    showGuideRef.current = showVisualGuide;
    if (worldRef.current) {
      const nextId = scenarioRef.current;
      worldRef.current.guideGroups.bayPark.visible = showVisualGuide && nextId === 'bay-park';
      worldRef.current.guideGroups.parallelPark.visible = showVisualGuide && nextId === 'parallel-park';
      worldRef.current.guideGroups.pullRight.visible = showVisualGuide && nextId === 'pull-right';
      worldRef.current.guideGroups.emergencyStop.visible = showVisualGuide && nextId === 'emergency-stop';
    }
  }, [showVisualGuide]);

  // Helper controls
  const toggleGear = (g: GearMode) => {
    carStateRef.current.gear = g;
    carStateRef.current.reverseLightOn = g === 'R';
  };

  const toggleHandbrake = () => {
    carStateRef.current.handbrakeOn = !carStateRef.current.handbrakeOn;
  };

  const toggleIndicator = (side: 'left' | 'right') => {
    const c = carStateRef.current;
    if (side === 'left') {
      c.indicatorLeft = !c.indicatorLeft;
      if (c.indicatorLeft) c.indicatorRight = false;
    } else {
      c.indicatorRight = !c.indicatorRight;
      if (c.indicatorRight) {
        c.indicatorLeft = false;
        pullRightSignalUsedRef.current = true;
      }
    }
  };

  const triggerMirrorCheck = () => {
    mirrorTimerRef.current = 0;
    mirrorCountRef.current += 1;
    soundEngine.playChime('mirror');
  };

  const cycleCamera = () => {
    setCameraMode((prev) => (prev === 'chase' ? 'cockpit' : prev === 'cockpit' ? 'overhead' : 'chase'));
  };

  const toggleMute = () => {
    const next = !muted;
    soundEngine.setMuted(next);
    setMuted(next);
  };

  // Keyboard Listeners (held vs justPressed edge gating)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const gState = gameStateRef.current;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
        e.preventDefault();
      }

      if (!keysRef.current.has(code)) {
        keysRef.current.add(code);

        if (gState === 'title') {
          if (code === 'Enter' || code === 'Space') {
            resetScenario(scenarioRef.current, 'playing');
          }
          return;
        }

        if (code === 'Escape' || code === 'KeyP') {
          if (gState === 'playing') {
            setShellState('paused');
          } else if (gState === 'paused') {
            setShellState('playing');
          }
          return;
        }

        if (gState !== 'playing' || testEndedRef.current) return;

        if (code === 'KeyQ') toggleIndicator('left');
        else if (code === 'KeyE') toggleIndicator('right');
        else if (code === 'KeyM') triggerMirrorCheck();
        else if (code === 'Space') toggleHandbrake();
        else if (code === 'KeyC') cycleCamera();
        else if (code === 'KeyG') setShowVisualGuide((v) => !v);
        else if (code === 'KeyR') toggleGear(carStateRef.current.gear === 'R' ? 'D' : 'R');
        else if (code === 'KeyH') setDockCollapsed((v) => !v);
        else if (code === 'KeyU') toggleMute();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.code);
    };

    const onBlur = () => {
      keysRef.current.clear();
      touchInputRef.current = { throttle: 0, brake: 0, steer: 0 };
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [muted]);

  // Main Three.js Mount & 60 FPS Simulation Loop (mounted once)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(container.clientWidth || 1280, container.clientHeight || 720);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const skyCanvas = document.createElement('canvas');
    skyCanvas.width = 8;
    skyCanvas.height = 256;
    const skyCtx = skyCanvas.getContext('2d');
    if (skyCtx) {
      const grad = skyCtx.createLinearGradient(0, 0, 0, 256);
      grad.addColorStop(0, '#5aa9ee');
      grad.addColorStop(0.55, '#a9d4f7');
      grad.addColorStop(0.85, '#fde9c8');
      grad.addColorStop(1, '#f9d9aa');
      skyCtx.fillStyle = grad;
      skyCtx.fillRect(0, 0, 8, 256);
    }
    const skyTex = new THREE.CanvasTexture(skyCanvas);
    skyTex.colorSpace = THREE.SRGBColorSpace;
    scene.background = skyTex;
    scene.fog = new THREE.FogExp2(0xe6ddd0, 0.0078);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      60,
      (container.clientWidth || 1280) / (container.clientHeight || 720),
      0.15,
      320
    );

    // Balanced warm/cool outdoor lighting
    const hemi = new THREE.HemisphereLight(0xcfe6ff, 0x5a6b45, 0.8);
    scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffe2b0, 1.9);
    sun.position.set(55, 48, 30); // lower sun gives longer, softer shadows
    sun.castShadow = !isSoftwareGl;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    const d = 65;
    sun.shadow.camera.left = -d;
    sun.shadow.camera.right = d;
    sun.shadow.camera.top = d;
    sun.shadow.camera.bottom = -d;
    sun.shadow.camera.near = 5;
    sun.shadow.camera.far = 160;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const world = buildUkDrivingWorld(scene, maxAniso, isSoftwareGl);
    worldRef.current = world;
    world.bayHighlightGroup.visible = scenarioRef.current === 'bay-park';
    world.parallelHighlightGroup.visible = scenarioRef.current === 'parallel-park';
    world.rightPullHighlightGroup.visible = scenarioRef.current === 'pull-right';
    world.guideGroups.bayPark.visible = showGuideRef.current && scenarioRef.current === 'bay-park';
    world.guideGroups.parallelPark.visible = showGuideRef.current && scenarioRef.current === 'parallel-park';
    world.guideGroups.pullRight.visible = showGuideRef.current && scenarioRef.current === 'pull-right';
    world.guideGroups.emergencyStop.visible = showGuideRef.current && scenarioRef.current === 'emergency-stop';

    const playerCar = buildUkCar({
      bodyColor: 0x0b4f8a,
      isLearnerCar: true,
      plateText: 'DV26 UKA',
      maxAnisotropy: maxAniso,
      isSoftwareGl,
    });
    scene.add(playerCar.group);
    carRigRef.current = playerCar;

    // Pooled Impact Spark / Kerb Debris Particle System (pre-allocated InstancedMesh, zero runtime alloc)
    const MAX_PARTICLES = 36;
    const particleGeo = new THREE.BoxGeometry(0.14, 0.14, 0.14);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xf59e0b,
      emissiveIntensity: 1.6,
      roughness: 0.35,
    });
    const particleInst = new THREE.InstancedMesh(particleGeo, particleMat, MAX_PARTICLES);
    particleInst.frustumCulled = false;
    const particlePool = Array.from({ length: MAX_PARTICLES }, () => ({
      active: false,
      x: 0,
      y: -10,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      life: 0,
    }));
    const _particleDummy = new THREE.Object3D();
    for (let i = 0; i < MAX_PARTICLES; i++) {
      _particleDummy.position.set(0, -10, 0);
      _particleDummy.scale.setScalar(0.001);
      _particleDummy.updateMatrix();
      particleInst.setMatrixAt(i, _particleDummy.matrix);
    }
    particleInst.instanceMatrix.needsUpdate = true;
    scene.add(particleInst);

    spawnBurstRef.current = (bx: number, bz: number) => {
      let spawned = 0;
      for (let i = 0; i < MAX_PARTICLES && spawned < 14; i++) {
        const p = particlePool[i];
        if (!p.active) {
          const angle = (spawned / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
          const speed = 2.5 + Math.random() * 4.5;
          p.active = true;
          p.x = bx;
          p.y = 0.45;
          p.z = bz;
          p.vx = Math.cos(angle) * speed;
          p.vy = 3.2 + Math.random() * 2.8;
          p.vz = Math.sin(angle) * speed;
          p.life = 0.55;
          spawned++;
        }
      }
      traumaRef.current = Math.min(1, traumaRef.current + 0.65);
      hitstopRef.current = 0.045;
      impactFlashRef.current = 0.16;
    };

    // Place initial camera smoothly behind spawn
    const initCar = carStateRef.current;
    camera.position.set(initCar.x, 3.2, initCar.z + 7.5);
    camera.lookAt(initCar.x, 1.0, initCar.z - 4);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const recordFault = (
      key: string,
      category: DrivingFault['category'],
      severity: DrivingFault['severity'],
      description: string,
      cooldownSec = 5.0
    ) => {
      const last = faultCooldownRef.current[key] ?? -999;
      if (simTimeRef.current - last < cooldownSec) return;
      faultCooldownRef.current[key] = simTimeRef.current;
      faultsRef.current.push({
        id: `${key}-${Math.round(simTimeRef.current * 10)}`,
        timestampSec: Number(simTimeRef.current.toFixed(1)),
        category,
        severity,
        description,
      });
      soundEngine.playChime(severity === 'minor' ? 'fault' : 'serious');
    };

    const buildScoreBreakdown = (completed: boolean, faultsCopy: DrivingFault[]) =>
      evaluateManoeuvreScore({
        scenarioId: scenarioRef.current,
        completed,
        car: carStateRef.current,
        faults: faultsCopy,
        mirrorChecks: mirrorCountRef.current,
        pullRightMaxDriftM: pullRightMaxDriftRef.current,
        pullRightSignalUsed: pullRightSignalUsedRef.current,
        emergencyReactionSec: emergencyReactionSecRef.current,
        emergencyMaxHeadingDriftDeg: emergencyMaxHeadingDriftRef.current,
      });

    const completeTest = (completed: boolean) => {
      if (testEndedRef.current) return;
      testEndedRef.current = true;
      const faultsCopy = [...faultsRef.current];
      const summary = evaluateDl25TestResult(faultsCopy, completed);
      const scoreBreakdown = buildScoreBreakdown(completed, faultsCopy);
      if (summary.passed) soundEngine.playChime('pass');
      else soundEngine.playChime('serious');
      setShellState('gameover');
      onRecordPassRef.current(
        summary.passed,
        summary.minorCount,
        summary.seriousCount + summary.dangerousCount,
        scoreBreakdown,
        scenarioRef.current
      );
      setTestOutcome({ completed, faults: faultsCopy, scoreBreakdown });
    };

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 1280;
      const h = container.clientHeight || 720;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(container);

    let frameId = 0;
    let lastTime = performance.now();

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    let idleTimeSec = 0;

    const tick = () => {
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(Math.max(rawDt, 0.001), 0.05);
      idleTimeSec += dt;

      const gState = gameStateRef.current;

      // Update pooled burst particles & camera trauma even during brief impact hitstop
      if (traumaRef.current > 0) {
        traumaRef.current = Math.max(0, traumaRef.current - dt * 2.2);
      }
      if (impactFlashRef.current > 0) {
        impactFlashRef.current = Math.max(0, impactFlashRef.current - dt);
        playerCar.brakeLightMat.emissiveIntensity = 3.2;
      }

      let anyParticleDirty = false;
      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = particlePool[i];
        if (!p.active) continue;
        anyParticleDirty = true;
        p.life -= dt;
        if (p.life <= 0) {
          p.active = false;
          _particleDummy.position.set(0, -10, 0);
          _particleDummy.scale.setScalar(0.001);
        } else {
          p.vy -= 14 * dt;
          p.x += p.vx * dt;
          p.y = Math.max(0.06, p.y + p.vy * dt);
          p.z += p.vz * dt;
          _particleDummy.position.set(p.x, p.y, p.z);
          _particleDummy.rotation.set(p.life * 8, p.life * 5, 0);
          _particleDummy.scale.setScalar(Math.max(0.2, p.life * 1.8));
        }
        _particleDummy.updateMatrix();
        particleInst.setMatrixAt(i, _particleDummy.matrix);
      }
      if (anyParticleDirty) {
        particleInst.instanceMatrix.needsUpdate = true;
      }

      // Brief tactile impact hitstop pause while particles still fly
      if (hitstopRef.current > 0) {
        hitstopRef.current = Math.max(0, hitstopRef.current - dt);
      }

      const simActive = gState === 'playing' && !testEndedRef.current && hitstopRef.current <= 0;
      if (simActive) {
        simTimeRef.current += dt;
        mirrorTimerRef.current += dt;
      }

      const simT = simTimeRef.current;
      const car = carStateRef.current;
      const scId = scenarioRef.current;

      // Gather merged keyboard + touch controls
      const keys = keysRef.current;
      let throttle = touchInputRef.current.throttle;
      let brake = touchInputRef.current.brake;
      let steer = touchInputRef.current.steer;

      if (keys.has('KeyW') || keys.has('ArrowUp')) throttle = 1;
      if (keys.has('KeyS') || keys.has('ArrowDown')) brake = 1;
      if (keys.has('KeyA') || keys.has('ArrowLeft')) steer -= 1;
      if (keys.has('KeyD') || keys.has('ArrowRight')) steer += 1;
      steer = Math.max(-1, Math.min(1, steer));

      if (simActive) {
        carStateRef.current = stepVehicleKinematics(car, { throttle, brake, steer }, dt);
      }

      const updatedCar = carStateRef.current;
      const speedMph = Math.abs(updatedCar.speedMps) * MPS_TO_MPH;
      if (simActive) {
        wheelSpinRef.current -= (updatedCar.speedMps * dt) / 0.32;
      }

      // Sync 3D Player Car transform, wheels, lights & engine hum
      playerCar.group.position.set(updatedCar.x, 0, updatedCar.z);
      playerCar.group.rotation.y = updatedCar.headingRad;
      playerCar.updateWheels(updatedCar.steerAngleRad, wheelSpinRef.current);

      const blinkOn = Math.floor((gState === 'title' ? idleTimeSec : simT) * 2.8) % 2 === 0;
      playerCar.updateLights({
        brake: updatedCar.brakeLightOn || impactFlashRef.current > 0,
        reverse: updatedCar.reverseLightOn,
        leftInd: updatedCar.indicatorLeft,
        rightInd: updatedCar.indicatorRight,
        blinkOn,
      });

      if ((updatedCar.indicatorLeft || updatedCar.indicatorRight) && simActive) {
        const beat = Math.floor(simT * 2.8);
        if (Math.abs(simT * 2.8 - beat) < 0.08) {
          soundEngine.playIndicatorTick(beat % 2 === 0);
        }
      }

      soundEngine.updateEngineHum(speedMph, gState === 'playing' && !testEndedRef.current);

      // Update UK Traffic Lights, Belisha Beacons & Circulating AI Roundabout Car
      const lightPhase = getUkTrafficLightPhase(gState === 'title' ? idleTimeSec : simT);
      world.updateTrafficSignals(lightPhase);
      world.updateBelishaBeacons(gState === 'title' ? idleTimeSec : simT);

      const aiStepDt = gState === 'paused' ? 0 : dt;
      for (const ai of world.aiCars) {
        ai.angle += ai.speedRad * aiStepDt;
        const ax = Math.cos(ai.angle) * ai.radius;
        const az = Math.sin(ai.angle) * ai.radius;
        ai.rig.group.position.set(ax, 0, az);
        ai.rig.group.rotation.y = -ai.angle;
        ai.rig.updateWheels(0.15, (gState === 'title' ? idleTimeSec : simT) * 10);
      }

      // Zebra pedestrian crossing activation + articulated walking limb swing
      if (scId === 'mock-route' && simActive && updatedCar.z < -8 && updatedCar.z > -36) {
        world.pedestrian.active = true;
      }
      if (world.pedestrian.active && world.pedestrian.crossingProgress < 1 && simActive) {
        world.pedestrian.crossingProgress = Math.min(
          1,
          world.pedestrian.crossingProgress + dt * 0.22
        );
        const px = -5.8 + world.pedestrian.crossingProgress * 11.6;
        world.pedestrian.x = px;
        world.pedestrian.group.position.set(px, 0, -28);
        const walkPhase = world.pedestrian.crossingProgress * 28;
        const swing = Math.sin(walkPhase) * 0.52;
        world.pedestrian.leftLeg.rotation.x = swing;
        world.pedestrian.rightLeg.rotation.x = -swing;
        world.pedestrian.leftArm.rotation.x = -swing * 0.7;
        world.pedestrian.rightArm.rotation.x = swing * 0.7;
      }

      // Dynamic Speed Limit Zone & Active Step Index
      const limitMph = updatedCar.z < -15 && Math.abs(updatedCar.x) < 15 ? 20 : 30;
      let examinerPrompt =
        PRACTICAL_SCENARIOS.find((s) => s.id === scId)?.initialPrompt ?? '';
      let emergencyActive = false;
      let activeStepIndex = 0;

      if (simActive) {
        // 1. Speed limit check
        const speedCheck = evaluateSpeedCompliance(speedMph, limitMph);
        if (speedCheck.status === 'minor') {
          recordFault(
            'speed-minor',
            'Speeding',
            'minor',
            `Exceeded ${limitMph} mph speed limit (${Math.round(speedMph)} mph).`
          );
        } else if (speedCheck.status === 'serious') {
          recordFault(
            'speed-serious',
            'Speeding',
            'serious',
            `Significantly exceeded ${limitMph} mph limit (${Math.round(speedMph)} mph).`
          );
        }

        // 2. Mirror check prompt before sharp steering at speed
        if (Math.abs(steer) > 0.55 && speedMph > 5 && mirrorTimerRef.current > 8) {
          recordFault(
            'mirror-turn',
            'Mirrors',
            'minor',
            'Changed direction without a recent Mirror check [M].',
            7.5
          );
        }

        // 3. Collision check against parked reference cars & roundabout island + pooled burst & shake
        const distRoundabout = Math.hypot(updatedCar.x, updatedCar.z);
        if (distRoundabout < 7.2) {
          recordFault(
            'island-hit',
            'Positioning & Kerb',
            'serious',
            'Mounted the central roundabout island.',
            4.0
          );
          spawnBurstRef.current(updatedCar.x, updatedCar.z);
          const pushAngle = Math.atan2(updatedCar.z, updatedCar.x);
          updatedCar.x = Math.cos(pushAngle) * 7.4;
          updatedCar.z = Math.sin(pushAngle) * 7.4;
          updatedCar.speedMps *= 0.2;
        }

        const obstacles: Array<[number, number, string]> = [
          [-3.2, 18.5, 'parked saloon car'],
          [-27, 36, 'parked grey hatchback'],
          [-20.2, 36, 'parked red hatchback'],
        ];
        for (const [ox, oz, label] of obstacles) {
          if (Math.abs(updatedCar.x - ox) < 1.65 && Math.abs(updatedCar.z - oz) < 3.6) {
            recordFault(
              `hit-${label}`,
              'Collision',
              'dangerous',
              `Made contact with the ${label}.`,
              4.0
            );
            spawnBurstRef.current(updatedCar.x, updatedCar.z);
            updatedCar.speedMps = 0;
          }
        }

        for (const ai of world.aiCars) {
          const distAi = Math.hypot(
            updatedCar.x - ai.rig.group.position.x,
            updatedCar.z - ai.rig.group.position.z
          );
          if (distAi < 3.4) {
            recordFault(
              'ai-roundabout-hit',
              'Junctions & Roundabouts',
              'dangerous',
              'Failed to give way to traffic circulating from the right on the roundabout.',
              5.0
            );
            spawnBurstRef.current(updatedCar.x, updatedCar.z);
            updatedCar.speedMps = 0;
          }
        }

        // Scenario-specific Examiner Rules & Step Progress
        if (scId === 'mock-route') {
          if (updatedCar.z > 35.5) {
            activeStepIndex = 0;
            examinerPrompt =
              lightPhase === 'RED' || lightPhase === 'RED_AMBER'
                ? 'Traffic lights ahead are RED — stop behind the white stop line.'
                : 'Traffic lights are GREEN — check mirrors and proceed toward the roundabout.';
          } else if (updatedCar.z <= 35.5 && updatedCar.z > 31 && (lightPhase === 'RED' || lightPhase === 'RED_AMBER') && speedMph > 2) {
            activeStepIndex = 0;
            recordFault(
              'red-light',
              'Traffic Lights',
              'serious',
              'Crossed the white stop line while traffic signal was Red / Red+Amber.',
              8.0
            );
          } else if (updatedCar.z <= 31 && updatedCar.z > 13.5) {
            activeStepIndex = 1;
            examinerPrompt = 'Approaching roundabout: give way to traffic coming from your right, take 2nd exit straight ahead.';
          } else if (updatedCar.z <= 13.5 && updatedCar.z > -15) {
            activeStepIndex = 1;
            examinerPrompt = 'Navigate smoothly around the left side of the roundabout and exit north.';
          } else if (updatedCar.z <= -15 && updatedCar.z > -28) {
            activeStepIndex = 2;
            examinerPrompt =
              world.pedestrian.crossingProgress < 0.95
                ? '20 mph zone · Pedestrian crossing at Zebra Crossing — slow and stop!'
                : 'Pedestrian clear — check mirrors and drive to the test finish line ahead.';
            if (
              Math.abs(updatedCar.z + 28) < 2.2 &&
              world.pedestrian.crossingProgress > 0.15 &&
              world.pedestrian.crossingProgress < 0.85 &&
              speedMph > 2.5
            ) {
              recordFault(
                'zebra-fail',
                'Pedestrian Crossings',
                'dangerous',
                'Failed to stop for a pedestrian crossing at the Zebra crossing.',
                6.0
              );
            }
          } else if (updatedCar.z <= -48) {
            activeStepIndex = 2;
            examinerPrompt = 'Route complete! Pulling up.';
            completeTest(true);
          } else {
            activeStepIndex = 2;
          }
        } else if (scId === 'parallel-park') {
          const evalBay = evaluateParkingManoeuvre(
            updatedCar,
            { centerX: -3.2, centerZ: 24.8, width: 2.55, length: 5.8, targetHeadingRad: 0 },
            false
          );
          if (evalBay.insideBay) {
            activeStepIndex = 2;
            examinerPrompt = 'Inside bay! Straighten wheels, stop completely, and apply Handbrake [Space].';
            if (speedMph < 0.5 && updatedCar.handbrakeOn) {
              if (evalBay.grade === 'minor') {
                recordFault('par-angle', 'Manoeuvre Accuracy', 'minor', evalBay.feedback, 10);
              }
              completeTest(true);
            }
          } else if (mirrorCountRef.current > 0 || updatedCar.distanceTravelledM > 0.5) {
            activeStepIndex = 1;
          }
        } else if (scId === 'bay-park') {
          const evalBay = evaluateParkingManoeuvre(
            updatedCar,
            { centerX: -23.6, centerZ: 36, width: 2.7, length: 5.4, targetHeadingRad: 0 },
            true
          );
          if (evalBay.insideBay) {
            activeStepIndex = 2;
            examinerPrompt = 'Positioned in bay! Come to a complete stop and apply Handbrake [Space].';
            if (speedMph < 0.5 && updatedCar.handbrakeOn) {
              if (evalBay.grade === 'minor') {
                recordFault('bay-angle', 'Manoeuvre Accuracy', 'minor', evalBay.feedback, 10);
              }
              completeTest(true);
            }
          } else if (updatedCar.z < 43.2) {
            activeStepIndex = 1;
          }
        } else if (scId === 'pull-right') {
          const inRightZone =
            Math.abs(updatedCar.x - 44.6) < 1.35 && Math.abs(updatedCar.z - 18) < 3.0;
          if (pullRightStageRef.current === 'approach') {
            activeStepIndex = 0;
            if (updatedCar.indicatorRight) pullRightSignalUsedRef.current = true;
            if (updatedCar.x > 42 && !updatedCar.indicatorRight) {
              recordFault(
                'pull-right-ind',
                'Signals',
                'minor',
                'Moved across to the right-hand side without right indicator [E].',
                8
              );
            }
            if (inRightZone && speedMph < 0.5) {
              pullRightStageRef.current = 'pulled_up';
              examinerPrompt =
                'Good! Now select Reverse [R], check mirrors [M], and reverse straight back 2 car lengths (past the zone).';
            }
          } else {
            pullRightStageRef.current = 'reversing';
            activeStepIndex = updatedCar.z >= 25.5 ? 2 : 1;
            examinerPrompt =
              'Reverse straight back along the right kerb until z >= 27m, then stop and apply Handbrake [Space].';
            const kerbDrift = Math.max(0, 44.6 - updatedCar.x);
            if (kerbDrift > pullRightMaxDriftRef.current) {
              pullRightMaxDriftRef.current = kerbDrift;
            }
            if (updatedCar.x < 42.3) {
              recordFault(
                'pull-right-drift',
                'Positioning & Kerb',
                'minor',
                'Drifted too far away from the right-hand kerb while reversing.',
                6
              );
            }
            if (updatedCar.z >= 27.0 && speedMph < 0.5 && updatedCar.handbrakeOn) {
              completeTest(true);
            }
          }
        } else if (scId === 'emergency-stop') {
          if (!emergencyTriggeredRef.current && speedMph >= 22) {
            emergencyTriggeredRef.current = true;
            emergencyTriggerTimeRef.current = simT;
            soundEngine.playChime('emergency');
          }
          if (emergencyTriggeredRef.current && !emergencyBrakedDoneRef.current) {
            activeStepIndex = 1;
            emergencyActive = true;
            examinerPrompt = 'STOP! Brake firmly and keep steering steady!';
            const hDeg = Math.abs((updatedCar.headingRad * 180) / Math.PI);
            if (hDeg > emergencyMaxHeadingDriftRef.current) {
              emergencyMaxHeadingDriftRef.current = hDeg;
            }
            if (Math.abs(steer) > 0.65 && speedMph > 6) {
              recordFault(
                'estop-swerve',
                'Control & Braking',
                'serious',
                'Lost steering straightness during emergency braking.',
                6
              );
            }
            if (speedMph < 0.4) {
              const reactionSec = simT - emergencyTriggerTimeRef.current;
              emergencyReactionSecRef.current = reactionSec;
              if (reactionSec > 4.2) {
                recordFault(
                  'estop-slow',
                  'Control & Braking',
                  'minor',
                  `Slow emergency stop completion (${reactionSec.toFixed(1)}s).`,
                  10
                );
              }
              emergencyBrakedDoneRef.current = true;
            }
          } else if (emergencyBrakedDoneRef.current) {
            activeStepIndex = 2;
            examinerPrompt = 'Car stopped! Apply Handbrake [Space] to secure the vehicle and complete the drill.';
            if (updatedCar.handbrakeOn) {
              completeTest(true);
            }
          }
        }
      }

      // Smooth Exponential Camera Choreography (Live Flyover on Title, Trauma Shake on Impacts)
      const mode = cameraModeRef.current;
      const dampFactor = isSoftwareGl ? 1 : 1 - Math.exp(-8.5 * dt);
      const fwdX = -Math.sin(updatedCar.headingRad);
      const fwdZ = -Math.cos(updatedCar.headingRad);

      if (gState === 'title') {
        const orbitAngle = idleTimeSec * 0.22;
        _camDesired.set(
          Math.sin(orbitAngle) * 24,
          10.5,
          Math.cos(orbitAngle) * 24
        );
        _lookDesired.set(0, 1.8, 12);
        camera.position.lerp(_camDesired, isSoftwareGl ? 1 : 0.08);
        camera.lookAt(_lookDesired);
      } else if (mode === 'chase') {
        _camDesired.set(updatedCar.x - fwdX * 7.2, 3.1, updatedCar.z - fwdZ * 7.2);
        _lookDesired.set(updatedCar.x + fwdX * 4.5, 1.15, updatedCar.z + fwdZ * 4.5);
        camera.position.lerp(_camDesired, dampFactor);
        camera.lookAt(_lookDesired);
      } else if (mode === 'cockpit') {
        playerCar.cockpitAnchor.getWorldPosition(_worldAnchor);
        playerCar.chaseTarget.getWorldPosition(_worldTarget);
        camera.position.copy(_worldAnchor);
        camera.lookAt(_worldTarget);
      } else {
        _camDesired.set(updatedCar.x, 22, updatedCar.z + 2.5);
        _lookDesired.set(updatedCar.x, 0, updatedCar.z);
        camera.position.lerp(_camDesired, dampFactor);
        camera.lookAt(_lookDesired);
      }

      if (traumaRef.current > 0.005) {
        const shake = traumaRef.current * traumaRef.current * 0.35;
        camera.position.x += Math.sin(idleTimeSec * 65) * shake;
        camera.position.y += Math.cos(idleTimeSec * 52) * shake * 0.6;
      }

      renderer.render(scene, camera);

      // Throttle React HUD state updates to <= 10 Hz
      if (now - lastHudSyncRef.current > 100) {
        lastHudSyncRef.current = now;
        setHud({
          speedMph: Math.round(speedMph),
          limitMph,
          gear: updatedCar.gear,
          handbrakeOn: updatedCar.handbrakeOn,
          indicatorLeft: updatedCar.indicatorLeft,
          indicatorRight: updatedCar.indicatorRight,
          trafficPhase: lightPhase,
          examinerPrompt,
          emergencyActive,
          mirrorCheckedAgoSec: Math.round(mirrorTimerRef.current),
          activeStepIndex,
          faults: [...faultsRef.current],
          elapsedSec: simT,
        });
      }

      if (isSoftwareGl) afterDraw(tick);
      else frameId = requestAnimationFrame(tick);
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      soundEngine.stopEngine();
      renderer.dispose();
    };
  }, []);

  const minorCount = hud.faults.filter((f) => f.severity === 'minor').length;
  const seriousCount = hud.faults.filter((f) => f.severity !== 'minor').length;
  const dl25Summary = testOutcome ? evaluateDl25TestResult(testOutcome.faults, testOutcome.completed) : null;

  return (
    <div className="relative w-full h-[calc(100vh-0px)] overflow-hidden bg-slate-900 select-none">
      {/* Isolated Full-Bleed WebGL Canvas Container */}
      <div
        ref={mountRef}
        data-testid="practical-3d-canvas"
        className="absolute inset-0 w-full h-full"
      />

      {/* Title Screen Overlay over Live 3D World Flyover (Zero backdrop-filter, crisp SVG wordmark) */}
      {gameState === 'title' && (
        <div
          data-testid="practical-title-screen"
          className="fixed inset-0 z-30 pointer-events-none flex flex-col items-center justify-between py-10 px-6"
        >
          <div className="pointer-events-auto flex items-center justify-between w-full max-w-5xl">
            <button
              type="button"
              onClick={onExitToAcademy}
              className="px-3.5 py-2 bg-[#0F172A]/95 hover:bg-slate-800 border border-slate-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit to Academy
            </button>
            <div className="px-3.5 py-1.5 bg-[#0F172A]/95 border border-slate-600 text-slate-200 rounded-xl text-xs font-mono">
              LHT · UK RIGHT-HAND DRIVE
            </div>
          </div>

          <div className="pointer-events-auto max-w-lg w-full bg-[#0F172A]/95 border border-slate-700 rounded-2xl p-7 text-center text-white space-y-5 shadow-2xl">
            <div className="flex flex-col items-center gap-2">
              <svg
                width="68"
                height="48"
                viewBox="0 0 68 48"
                fill="none"
                aria-hidden="true"
              >
                <rect x="2" y="2" width="64" height="44" rx="10" fill="#0B4F8A" stroke="#F8FAFC" strokeWidth="2.5" />
                <path d="M18 14V34H30" stroke="#EF4444" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="47" cy="24" r="9" stroke="#FACC15" strokeWidth="3.5" />
                <path d="M47 18V24L51 27" stroke="#F8FAFC" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
                HIGHWAY CRAFT 3D
              </h1>
              <p className="text-xs text-slate-300">
                DVSA Practical Test Manoeuvres &amp; Roundabout Simulator
              </p>
            </div>

            <div className="space-y-1.5 text-left">
              <label htmlFor="title-scenario-select" className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Choose Practical Manoeuvre
              </label>
              <select
                id="title-scenario-select"
                value={scenarioId}
                onChange={(e) => {
                  const next = e.target.value as PracticalScenarioId;
                  resetScenario(next, 'title');
                }}
                className="w-full bg-slate-800 border border-slate-600 text-white text-sm font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {PRACTICAL_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              data-start="true"
              onClick={() => resetScenario(scenarioId, 'playing')}
              className="w-full py-3.5 bg-[#0B4F8A] hover:bg-[#0d5fa6] border border-sky-400/50 text-white font-display font-bold tracking-wide text-base rounded-xl transition-colors inline-flex items-center justify-center gap-2 shadow-lg"
            >
              <Play className="w-4 h-4 fill-white" />
              START PRACTICAL DRIVE
            </button>

            <p className="text-[11px] font-mono text-slate-400 tracking-tight">
              WASD Drive · Space Handbrake · Q/E Indicate · M Mirrors · Esc Pause
            </p>
          </div>

          <div className="h-4" />
        </div>
      )}

      {/* Perimeter HUD Wrapper (pointer-events-none so viewport stays interactive) */}
      {gameState !== 'title' && (
        <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 z-10">
          {/* Top Perimeter Row */}
          <div className="flex flex-wrap items-start justify-between gap-3">
            {/* Top-Left: Examiner Prompt & Scenario Switcher */}
            <div className="pointer-events-auto max-w-md bg-[#0F172A]/90 border border-slate-700/80 rounded-xl p-3.5 text-white shadow-lg space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="scenario-select" className="sr-only">
                Select Practical Test Scenario
              </label>
              <select
                id="scenario-select"
                value={scenarioId}
                onChange={(e) => resetScenario(e.target.value as PracticalScenarioId)}
                className="bg-slate-800 border border-slate-600 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {PRACTICAL_SCENARIOS.map((sc) => (
                  <option key={sc.id} value={sc.id}>
                    {sc.title}
                  </option>
                ))}
              </select>

              {/* Live UK Speed Limit Circle */}
              <div
                aria-label={`Speed limit ${hud.limitMph} mph`}
                className="w-9 h-9 rounded-full bg-white border-[3.5px] border-red-600 flex items-center justify-center text-slate-950 font-display font-bold text-sm shrink-0"
              >
                {hud.limitMph}
              </div>
            </div>

            <div
              className={`text-xs leading-relaxed rounded-lg px-3 py-2 border ${
                hud.emergencyActive
                  ? 'bg-red-600 border-red-400 text-white font-bold'
                  : 'bg-slate-800/90 border-slate-700 text-slate-100'
              }`}
            >
              {hud.examinerPrompt}
            </div>

            {/* Step-by-Step Manoeuvre Visual Checklist */}
            <div className="space-y-1 pt-0.5">
              {(PRACTICAL_SCENARIOS.find((s) => s.id === scenarioId)?.steps ?? []).map((stepText, idx) => {
                const isDone = idx < hud.activeStepIndex;
                const isCurr = idx === hud.activeStepIndex;
                return (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 text-[11px] leading-tight ${
                      isDone
                        ? 'text-emerald-300'
                        : isCurr
                        ? 'text-white font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : isCurr
                          ? 'bg-sky-500 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {isDone ? '✓' : idx + 1}
                    </span>
                    <span>{stepText}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top-Right: DL25 Fault Tally + Visual Guide + Camera & Exit Actions */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            <div className="bg-[#0F172A]/90 border border-slate-700/80 rounded-xl px-3.5 py-2 text-white flex items-center gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Minors</span>
                <span className="font-mono font-bold text-sm tabular-nums">{minorCount} / 15</span>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Serious</span>
                <span
                  className={`font-mono font-bold text-sm tabular-nums ${
                    seriousCount > 0 ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {seriousCount}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowVisualGuide((v) => !v)}
              className={`px-3 py-2 border rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                showVisualGuide
                  ? 'bg-emerald-700 hover:bg-emerald-600 border-emerald-500 text-white'
                  : 'bg-[#0F172A]/90 hover:bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              3D Guide [G]
            </button>

            <button
              type="button"
              onClick={cycleCamera}
              className="px-3 py-2 bg-[#0F172A]/90 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Camera className="w-3.5 h-3.5" />
              {cameraMode === 'chase' ? 'Chase Cam' : cameraMode === 'cockpit' ? 'Cockpit RHD' : 'Overhead'}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
              className="p-2.5 bg-[#0F172A]/90 hover:bg-slate-800 border border-slate-700 text-white rounded-xl transition-colors"
            >
              {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setShellState('paused')}
              aria-label="Pause simulation"
              className="px-3 py-2 bg-[#0F172A]/90 hover:bg-slate-800 border border-slate-700 text-white rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Pause className="w-3.5 h-3.5" />
              Pause
            </button>

            <button
              type="button"
              onClick={() => resetScenario(scenarioId, 'playing')}
              aria-label="Restart scenario"
              className="p-2.5 bg-[#0F172A]/90 hover:bg-slate-800 border border-slate-700 text-white rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onExitToAcademy}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit Drive
            </button>
          </div>
        </div>

        {/* Center Emergency Stop Alert Overlay */}
        {hud.emergencyActive && !testOutcome && (
          <div className="self-center bg-red-600 border-2 border-white text-white px-8 py-4 rounded-xl shadow-2xl text-center">
            <p className="font-display text-3xl font-bold tracking-wide">STOP!</p>
            <p className="text-xs font-medium mt-0.5">Brake firmly now (S / Down Arrow)</p>
          </div>
        )}

        {/* Bottom Collapsible UK Instrument Cluster & Driving Dock */}
        <div className="flex flex-col items-center">
          <button
            type="button"
            onClick={() => setDockCollapsed((v) => !v)}
            className="pointer-events-auto mb-1.5 px-3 py-1 bg-[#0F172A]/90 border border-slate-700 text-slate-200 rounded-lg text-[11px] font-medium flex items-center gap-1 hover:bg-slate-800"
          >
            {dockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {dockCollapsed ? 'Show Instrument Dock [H]' : 'Hide Controls [H]'}
          </button>

          {!dockCollapsed && (
            <div className="pointer-events-auto w-full max-w-[920px] bg-[#0F172A]/92 border border-slate-700/90 rounded-2xl px-4 py-3 text-white shadow-2xl flex flex-wrap items-center justify-between gap-4">
              {/* Speedometer & Gear */}
              <div className="flex items-center gap-4">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`font-mono text-3xl font-bold tabular-nums ${
                      hud.speedMph > hud.limitMph + 2 ? 'text-red-400' : 'text-white'
                    }`}
                  >
                    {hud.speedMph}
                  </span>
                  <span className="text-xs font-medium text-slate-400">MPH</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
                  {(['D', 'R', 'P'] as GearMode[]).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleGear(g)}
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition-colors ${
                        hud.gear === g ? 'bg-[#0B4F8A] text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={toggleHandbrake}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                    hud.handbrakeOn
                      ? 'bg-red-600 border-red-400 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {hud.handbrakeOn ? 'Handbrake ON' : 'Handbrake [Space]'}
                </button>
              </div>

              {/* Signals & Mirror Check */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleIndicator('left')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                    hud.indicatorLeft
                      ? 'bg-amber-500 border-amber-300 text-slate-950'
                      : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  ← Left [Q]
                </button>
                <button
                  type="button"
                  onClick={triggerMirrorCheck}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                    hud.mirrorCheckedAgoSec <= 3
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" />
                  Mirrors [M]
                </button>
                <button
                  type="button"
                  onClick={() => toggleIndicator('right')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap ${
                    hud.indicatorRight
                      ? 'bg-amber-500 border-amber-300 text-slate-950'
                      : 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  Right [E] →
                </button>
              </div>

              {/* Touch / Mouse Driving Pedals & Steer + Finish Button */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onPointerDown={() => (touchInputRef.current.steer = -1)}
                  onPointerUp={() => (touchInputRef.current.steer = 0)}
                  onPointerLeave={() => (touchInputRef.current.steer = 0)}
                  aria-label="Steer Left"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-mono"
                >
                  A
                </button>
                <button
                  type="button"
                  onPointerDown={() => (touchInputRef.current.brake = 1)}
                  onPointerUp={() => (touchInputRef.current.brake = 0)}
                  onPointerLeave={() => (touchInputRef.current.brake = 0)}
                  aria-label="Brake"
                  className="px-2.5 py-1.5 bg-red-900/80 hover:bg-red-800 border border-red-700 rounded-lg text-xs font-mono"
                >
                  Brake [S]
                </button>
                <button
                  type="button"
                  onPointerDown={() => (touchInputRef.current.throttle = 1)}
                  onPointerUp={() => (touchInputRef.current.throttle = 0)}
                  onPointerLeave={() => (touchInputRef.current.throttle = 0)}
                  aria-label="Accelerate"
                  className="px-2.5 py-1.5 bg-emerald-800/90 hover:bg-emerald-700 border border-emerald-600 rounded-lg text-xs font-mono"
                >
                  Drive [W]
                </button>
                <button
                  type="button"
                  onPointerDown={() => (touchInputRef.current.steer = 1)}
                  onPointerUp={() => (touchInputRef.current.steer = 0)}
                  onPointerLeave={() => (touchInputRef.current.steer = 0)}
                  aria-label="Steer Right"
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-mono"
                >
                  D
                </button>
                <button
                  type="button"
                  onClick={() => {
                    testEndedRef.current = true;
                    setShellState('gameover');
                    const faultsCopy = [...faultsRef.current];
                    const summary = evaluateDl25TestResult(faultsCopy, false);
                    const scoreBreakdown = evaluateManoeuvreScore({
                      scenarioId: scenarioRef.current,
                      completed: false,
                      car: carStateRef.current,
                      faults: faultsCopy,
                      mirrorChecks: mirrorCountRef.current,
                      pullRightMaxDriftM: pullRightMaxDriftRef.current,
                      pullRightSignalUsed: pullRightSignalUsedRef.current,
                      emergencyReactionSec: emergencyReactionSecRef.current,
                      emergencyMaxHeadingDriftDeg: emergencyMaxHeadingDriftRef.current,
                    });
                    onRecordPassRef.current(
                      summary.passed,
                      summary.minorCount,
                      summary.seriousCount + summary.dangerousCount,
                      scoreBreakdown,
                      scenarioRef.current
                    );
                    setTestOutcome({ completed: false, faults: faultsCopy, scoreBreakdown });
                  }}
                  className="ml-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium whitespace-nowrap"
                >
                  Finish Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Pause Modal Overlay (Esc / P) */}
      {gameState === 'paused' && !testOutcome && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="pause-modal-title"
          className="fixed inset-0 z-30 bg-slate-950/70 flex items-center justify-center p-4"
        >
          <div className="bg-[#0F172A] border border-slate-700 rounded-2xl max-w-sm w-full p-6 text-white space-y-5 shadow-2xl">
            <div className="text-center space-y-1">
              <p className="text-[11px] font-mono uppercase tracking-wider text-sky-400">
                Simulation Paused
              </p>
              <h2 id="pause-modal-title" className="font-display text-2xl font-bold">
                Take a Breather
              </h2>
              <p className="text-xs text-slate-400">
                {PRACTICAL_SCENARIOS.find((s) => s.id === scenarioId)?.title}
              </p>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => setShellState('playing')}
                className="w-full py-2.5 bg-[#0B4F8A] hover:bg-[#0d5fa6] text-white text-sm font-semibold rounded-xl inline-flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Resume Drive [Esc]
              </button>
              <button
                type="button"
                onClick={() => resetScenario(scenarioId, 'playing')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white text-sm font-medium rounded-xl inline-flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Restart Scenario
              </button>
              <button
                type="button"
                onClick={() => resetScenario(scenarioId, 'title')}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-sm font-medium rounded-xl"
              >
                Scenario Title Screen
              </button>
              <button
                type="button"
                onClick={onExitToAcademy}
                className="w-full py-2.5 text-slate-400 hover:text-white text-xs font-medium"
              >
                Exit to Academy Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DL25 Practical Driving Test Examiner Report Modal */}
      {testOutcome && dl25Summary && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="dl25-title"
          className="fixed inset-0 z-30 bg-slate-950/75 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start gap-3">
              {dl25Summary.passed ? (
                <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  UK DVSA DL25 Practical Assessment Report
                </p>
                <h2 id="dl25-title" className="text-xl font-bold text-slate-900 mt-0.5">
                  {dl25Summary.verdictTitle}
                </h2>
                <p className="text-sm text-slate-600 mt-1">{dl25Summary.verdictSummary}</p>
              </div>
            </div>

            {/* Explicit Multi-Axis Manoeuvre Scoring System */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Manoeuvre Performance Score
                </h3>
                <span className="font-mono text-sm font-bold text-[#0B4F8A] tabular-nums">
                  {testOutcome.scoreBreakdown.overallScore}/100 · {testOutcome.scoreBreakdown.grade}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs">
                {(
                  [
                    ['Accuracy', testOutcome.scoreBreakdown.accuracyScore],
                    ['Positioning', testOutcome.scoreBreakdown.positioningScore],
                    ['Control', testOutcome.scoreBreakdown.controlScore],
                  ] as const
                ).map(([label, val]) => (
                  <div key={label} className="bg-white border border-slate-200 rounded-lg p-2.5 space-y-1.5">
                    <div className="flex items-center justify-between font-medium text-slate-700">
                      <span>{label}</span>
                      <span className="font-mono font-bold text-slate-900">{val}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          val >= 80 ? 'bg-emerald-600' : val >= 60 ? 'bg-amber-500' : 'bg-red-600'
                        }`}
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {testOutcome.scoreBreakdown.notes.length > 0 && (
                <ul className="text-xs text-slate-600 space-y-1 pt-1">
                  {testOutcome.scoreBreakdown.notes.map((n, i) => (
                    <li key={i}>• {n}</li>
                  ))}
                </ul>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-xs text-slate-500 block">Driving Faults</span>
                <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {dl25Summary.minorCount}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-xs text-slate-500 block">Serious Faults</span>
                <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {dl25Summary.seriousCount}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                <span className="text-xs text-slate-500 block">Dangerous</span>
                <span className="font-mono text-2xl font-bold text-slate-900 tabular-nums">
                  {dl25Summary.dangerousCount}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-slate-900">Recorded Examiner Notes</h3>
              {testOutcome.faults.length === 0 ? (
                <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  Zero driving, serious, or dangerous faults recorded during this run.
                </p>
              ) : (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl max-h-48 overflow-y-auto">
                  {testOutcome.faults.map((f) => (
                    <div key={f.id} className="px-3.5 py-2.5 text-sm flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {f.category} ·{' '}
                          <span
                            className={
                              f.severity === 'minor' ? 'text-amber-700' : 'text-red-700 font-semibold'
                            }
                          >
                            {f.severity.toUpperCase()}
                          </span>
                        </p>
                        <p className="text-xs text-slate-600">{f.description}</p>
                      </div>
                      <span className="text-xs font-mono text-slate-400 shrink-0">{f.timestampSec}s</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onExitToAcademy}
                className="px-4 py-2.5 text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Return to Academy
              </button>
              <button
                type="button"
                data-start="true"
                onClick={() => resetScenario(scenarioId)}
                className="px-5 py-2.5 text-sm font-semibold bg-[#0B4F8A] hover:bg-[#093E6E] text-white rounded-lg flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Retry Scenario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
