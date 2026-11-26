import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { CheckCircle2, Eye } from 'lucide-react';
import { SHOW_ME_TELL_ME_QUESTIONS, type CarPartId } from '../data/theoryQuestions';
import { buildUkCar } from '../three/carBuilder';

const PART_CAMERA_TARGETS: Record<CarPartId, { pos: [number, number, number]; target: [number, number, number] }> = {
  'bonnet-oil': { pos: [0.6, 2.3, -2.5], target: [0.15, 0.72, -1.55] },
  'bonnet-coolant': { pos: [-1.1, 2.2, -2.6], target: [-0.35, 0.72, -1.6] },
  'bonnet-brake': { pos: [1.3, 2.3, -2.3], target: [0.42, 0.75, -1.42] },
  'bonnet-washer': { pos: [-1.2, 2.2, -2.4], target: [-0.45, 0.72, -1.5] },
  'tyre-tread': { pos: [2.4, 0.75, -1.3], target: [0.85, 0.35, -1.32] },
  headlights: { pos: [-1.6, 1.0, -3.6], target: [0, 0.58, -2.05] },
  indicators: { pos: [2.2, 1.1, -2.9], target: [0.8, 0.62, -1.95] },
  horn: { pos: [0.36, 1.55, 0.55], target: [0.36, 0.94, -0.58] },
  demister: { pos: [0.1, 1.48, 0.45], target: [0.0, 0.88, -0.82] },
  wipers: { pos: [0.55, 1.48, 0.45], target: [0.22, 0.92, -0.68] },
};

export function ShowMeTellMeStudio() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const mountRef = useRef<HTMLDivElement | null>(null);
  const targetPartRef = useRef<CarPartId>(SHOW_ME_TELL_ME_QUESTIONS[0].partId);
  const requestRenderRef = useRef<() => void>(() => {});

  const currentItem = SHOW_ME_TELL_ME_QUESTIONS[selectedIdx];

  useEffect(() => {
    targetPartRef.current = currentItem.partId;
    requestRenderRef.current();
  }, [currentItem.partId]);

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
    renderer.toneMappingExposure = 1.1;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth || 640, container.clientHeight || 420);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe2e8f0);
    scene.fog = new THREE.Fog(0xe2e8f0, 14, 34);

    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();

    const camera = new THREE.PerspectiveCamera(
      45,
      (container.clientWidth || 640) / (container.clientHeight || 420),
      0.1,
      60
    );
    camera.position.set(2.8, 2.0, -3.5);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.maxPolarAngle = Math.PI * 0.48;
    controls.minDistance = 1.4;
    controls.maxDistance = 8.0;

    // Warm key + Cool hemi studio lighting
    const hemi = new THREE.HemisphereLight(0xdbeafe, 0x64748b, 0.75);
    scene.add(hemi);
    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.5);
    keyLight.position.set(4, 7, -5);
    scene.add(keyLight);

    // Garage floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(14, 48),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.78 })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const car = buildUkCar({
      bodyColor: 0x0b4f8a,
      isLearnerCar: true,
      plateText: 'SM26 UKT',
      maxAnisotropy: maxAniso,
      isSoftwareGl,
    });
    scene.add(car.group);

    // Open-Bonnet Engine Bay Inspection Assembly (no geometry clipping)
    const engineGroup = new THREE.Group();
    const bayTray = new THREE.Mesh(
      new THREE.BoxGeometry(1.38, 0.14, 0.78),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.85 })
    );
    bayTray.position.set(0, 0.74, -1.56);

    // Propped-open bonnet lid tilted upward behind engine bay
    const openBonnet = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 0.04, 0.84),
      new THREE.MeshStandardMaterial({ color: 0x0b4f8a, metalness: 0.45, roughness: 0.24 })
    );
    openBonnet.position.set(0, 1.14, -1.16);
    openBonnet.rotation.x = 0.92;

    const bonnetProp = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.65, 8),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.8, roughness: 0.25 })
    );
    bonnetProp.position.set(0.55, 1.02, -1.48);

    const engineBlock = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.22, 0.46),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.48 })
    );
    engineBlock.position.set(0.02, 0.86, -1.56);

    const dipstick = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.016, 8, 16),
      new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.3 })
    );
    dipstick.position.set(0.18, 1.02, -1.52);

    const coolantTank = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 14, 14),
      new THREE.MeshStandardMaterial({ color: 0xfb7185, roughness: 0.35 })
    );
    coolantTank.position.set(-0.38, 0.88, -1.62);

    const brakeTank = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.14, 12),
      new THREE.MeshStandardMaterial({ color: 0xfde047, roughness: 0.35 })
    );
    brakeTank.position.set(0.46, 0.89, -1.42);

    const washerCap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.1, 12),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3 })
    );
    washerCap.position.set(-0.48, 0.87, -1.46);

    engineGroup.add(
      bayTray,
      openBonnet,
      bonnetProp,
      engineBlock,
      dipstick,
      coolantTank,
      brakeTank,
      washerCap
    );
    scene.add(engineGroup);

    // Highlight beacon ring at target hotspot
    const markerRing = new THREE.Mesh(
      new THREE.RingGeometry(0.11, 0.17, 24),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b, side: THREE.DoubleSide })
    );
    markerRing.rotation.x = -Math.PI / 2;
    scene.add(markerRing);

    const desiredPos = new THREE.Vector3();
    const desiredTarget = new THREE.Vector3();
    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let manualInteracting = false;

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

    const requestRender = () => {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        const spec = PART_CAMERA_TARGETS[targetPartRef.current];
        markerRing.position.set(spec.target[0], spec.target[1] + 0.08, spec.target[2]);

        let stillMoving = false;
        if (!manualInteracting) {
          desiredPos.set(...spec.pos);
          desiredTarget.set(...spec.target);
          camera.position.lerp(desiredPos, isSoftwareGl ? 1 : 0.14);
          controls.target.lerp(desiredTarget, isSoftwareGl ? 1 : 0.14);
          if (camera.position.distanceTo(desiredPos) > 0.03) {
            stillMoving = true;
          }
        }

        // Light indicators if inspecting indicators
        const isInd = targetPartRef.current === 'indicators';
        const isHead = targetPartRef.current === 'headlights';
        car.updateLights({
          brake: isHead,
          reverse: false,
          leftInd: isInd,
          rightInd: isInd,
          blinkOn: true,
        });

        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || stillMoving) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    };

    requestRenderRef.current = () => {
      manualInteracting = false;
      requestRender();
    };

    controls.addEventListener('start', () => {
      manualInteracting = true;
    });
    controls.addEventListener('change', () => requestRender());

    const ro = new ResizeObserver(() => {
      const w = container.clientWidth || 640;
      const h = container.clientHeight || 420;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    });
    ro.observe(container);

    requestRender();

    return () => {
      ro.disconnect();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
      <div>
        <p className="text-xs font-medium text-[#0B4F8A] tracking-wide uppercase mb-1">
          Practical Preparation · Vehicle Safety Checks
        </p>
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">
          Show Me, Tell Me — 3D Vehicle Inspection
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          On your UK practical driving test, the examiner asks one “Tell Me” question before you drive and one “Show Me”
          question while driving. Select a check to inspect the exact 3D component.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 3D Garage Viewport */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span className="font-semibold text-slate-900">
              Focused Component: {currentItem.partLabel}
            </span>
            <span>Drag to orbit 3D vehicle · Scroll to zoom</span>
          </div>
          <div
            ref={mountRef}
            data-testid="smtm-3d-canvas"
            className="w-full h-[380px] sm:h-[440px] bg-slate-200"
          />
          <div className="p-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#0B4F8A]">
                {currentItem.type} Question
              </span>
              <span className="text-xs text-slate-500 font-mono">
                {selectedIdx + 1} / {SHOW_ME_TELL_ME_QUESTIONS.length}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-slate-900">{currentItem.question}</h2>

            {revealed[currentItem.id] ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-2 text-sm text-emerald-950">
                <p className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  Official DVSA Answer
                </p>
                <p>{currentItem.officialAnswer}</p>
                <p className="text-xs text-emerald-800 pt-1">
                  Examiner Tip: {currentItem.examinerTip}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setRevealed((prev) => ({ ...prev, [currentItem.id]: true }))}
                className="px-4 py-2.5 text-sm font-semibold bg-[#0B4F8A] hover:bg-[#093E6E] text-white rounded-lg inline-flex items-center gap-2 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Reveal Official Answer
              </button>
            )}
          </div>
        </div>

        {/* Question List */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {SHOW_ME_TELL_ME_QUESTIONS.map((item, idx) => {
            const active = idx === selectedIdx;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left px-4 py-3.5 transition-colors flex items-start justify-between gap-3 ${
                  active ? 'bg-[#0B4F8A]/8' : 'hover:bg-slate-50'
                }`}
              >
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-0.5">
                    {item.type} · {item.partLabel}
                  </p>
                  <p className={`text-sm ${active ? 'font-semibold text-[#0B4F8A]' : 'text-slate-800'}`}>
                    {item.question}
                  </p>
                </div>
                {revealed[item.id] && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
