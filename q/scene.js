/* Pixel Rise. The reference's 3D orange computer, built from primitives
   in Three.js instead of shipped as a render: one group (monitor, screen,
   camera, keyboard) idling on a slow bob/rotate, three paper-craft props
   (envelope, sticker, tape roll) each on their own orbit, one key light
   plus a soft rim light for the warm plastic-render look the reference has.
   Pointer parallax tilts the whole rig a few degrees, never the camera
   itself, so nothing here re-projects the scene. */
import * as THREE from 'three';

const canvas = document.getElementById('glcanvas');
const mount = document.getElementById('scene');
if (!canvas || !mount) { /* no-op if the markup is missing */ }
else {
  const reduce = !matchMedia('(prefers-reduced-motion: no-preference)').matches;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0.6, 9.5);
  camera.lookAt(0, 0.1, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  // ── lights: warm key from upper-left, cool rim from the right, soft fill
  scene.add(new THREE.AmbientLight(0xfff3e6, 0.55));
  const key = new THREE.DirectionalLight(0xfff0da, 1.6);
  key.position.set(-4, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 1; key.shadow.camera.far = 20;
  key.shadow.camera.left = -6; key.shadow.camera.right = 6;
  key.shadow.camera.top = 6; key.shadow.camera.bottom = -6;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xbcd7ff, 0.5);
  rim.position.set(5, 2, -4);
  scene.add(rim);

  // ── ground shadow catcher, invisible except for the shadow it holds
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 30),
    new THREE.ShadowMaterial({ opacity: 0.16 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -2.05;
  ground.receiveShadow = true;
  scene.add(ground);

  const rig = new THREE.Group();
  scene.add(rig);

  // ── the computer ──────────────────────────────────────────────────────
  const computer = new THREE.Group();
  rig.add(computer);

  const orange = new THREE.MeshStandardMaterial({ color: 0xE07A2C, roughness: 0.42, metalness: 0.05 });
  const orangeDeep = new THREE.MeshStandardMaterial({ color: 0xB85E1E, roughness: 0.5, metalness: 0.05 });
  const cream = new THREE.MeshStandardMaterial({ color: 0xF3E9DA, roughness: 0.55 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2B2420, roughness: 0.4 });
  const red = new THREE.MeshStandardMaterial({ color: 0xD8472E, roughness: 0.35 });

  function addShadow(mesh) { mesh.castShadow = true; mesh.receiveShadow = true; return mesh; }

  // monitor body: rounded box via a slightly scaled box + bevel look through
  // segments is overkill here, so a plain box read as "retro CRT" is enough
  const body = addShadow(new THREE.Mesh(new THREE.BoxGeometry(3.1, 2.5, 2.1), orange));
  body.position.y = 0.55;
  computer.add(body);

  // screen bezel + glowing "app" screen, drawn as a canvas texture
  const bezel = addShadow(new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.9, 0.12), dark));
  bezel.position.set(0, 0.65, 1.08);
  computer.add(bezel);

  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 256; screenCanvas.height = 200;
  const sctx = screenCanvas.getContext('2d');
  sctx.fillStyle = '#F6F1E7'; sctx.fillRect(0, 0, 256, 200);
  const swatches = ['#E8A94F', '#5C9C6B', '#3C6FE0', '#D8472E', '#F3D24A'];
  let si = 0;
  for (let y = 18; y < 182; y += 46) {
    for (let x = 18; x < 240; x += 62) {
      sctx.fillStyle = swatches[si++ % swatches.length];
      sctx.fillRect(x, y, 44, 32);
    }
  }
  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.26, 1.66),
    new THREE.MeshStandardMaterial({ map: screenTex, roughness: 0.3, emissive: 0x222222, emissiveIntensity: 0.15 })
  );
  screen.position.set(0, 0.65, 1.15);
  computer.add(screen);

  // camera nub on top
  const camBody = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.5, 20), red));
  camBody.position.set(0.9, 2.05, 0.2);
  camBody.rotation.z = Math.PI / 2.3;
  computer.add(camBody);
  const camLens = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.12, 20), dark));
  camLens.position.set(1.28, 2.2, 0.2);
  camLens.rotation.z = Math.PI / 2.3;
  computer.add(camLens);

  // keyboard base
  const base = addShadow(new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.32, 1.7), cream));
  base.position.y = -1.05;
  computer.add(base);
  const keysGeo = new THREE.BoxGeometry(0.26, 0.1, 0.26);
  for (let kx = -1.3; kx <= 1.3; kx += 0.34) {
    for (let kz = -0.5; kz <= 0.5; kz += 0.34) {
      const key = addShadow(new THREE.Mesh(keysGeo, orangeDeep));
      key.position.set(kx, -0.86, kz);
      computer.add(key);
    }
  }
  // a short foot connecting base to body
  const neck = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.9, 16), dark));
  neck.position.y = -0.5;
  computer.add(neck);

  computer.position.y = 0.1;

  // ── floating props, each its own slow orbit ─────────────────────────────
  const props = new THREE.Group();
  rig.add(props);

  function makeEnvelope() {
    // a card, not a folded envelope: a triangular cone-flap reads as an
    // arrow or a fork from most orbit angles, so the recognisable shape
    // here is a flat rectangle with a printed flap seam and a wax-seal
    // dot, legible from any side as the orbit turns it.
    const g = new THREE.Group();
    const body = addShadow(new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.64, 0.05), cream));
    g.add(body);
    const seamShape = new THREE.Shape();
    seamShape.moveTo(-0.4, 0.28);
    seamShape.lineTo(0, 0.02);
    seamShape.lineTo(0.4, 0.28);
    const seamGeo = new THREE.ShapeGeometry(seamShape);
    const seam = new THREE.Mesh(seamGeo, new THREE.MeshStandardMaterial({ color: 0xD8641F, roughness: 0.5, side: THREE.DoubleSide }));
    seam.position.set(0, 0, 0.031);
    g.add(seam);
    const seamBack = seam.clone(); seamBack.position.z = -0.031; seamBack.rotation.y = Math.PI;
    g.add(seamBack);
    const seal = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 16), red));
    seal.rotation.x = Math.PI / 2; seal.position.set(0, 0.02, 0.045);
    g.add(seal);
    return g;
  }
  function makeSticker() {
    const g = new THREE.Group();
    const disc = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.07, 28), new THREE.MeshStandardMaterial({ color: 0xF0C93A, roughness: 0.4 })));
    disc.rotation.x = Math.PI / 2;
    g.add(disc);
    const eye = new THREE.MeshStandardMaterial({ color: 0x2B2420 });
    const eyeGeo = new THREE.SphereGeometry(0.045, 12, 12);
    const e1 = new THREE.Mesh(eyeGeo, eye); e1.position.set(-0.14, 0.045, 0.15);
    const e2 = new THREE.Mesh(eyeGeo, eye); e2.position.set(0.14, 0.045, 0.15);
    g.add(e1, e2);
    return g;
  }
  function makeTape() {
    const g = new THREE.Group();
    const teal = new THREE.MeshStandardMaterial({ color: 0x4E8A7C, roughness: 0.4 });
    const outer = addShadow(new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.15, 14, 28), teal));
    g.add(outer);
    const core = addShadow(new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 20), dark));
    core.rotation.x = Math.PI / 2;
    g.add(core);
    return g;
  }

  const envelope = makeEnvelope(); const sticker = makeSticker(); const tape = makeTape();
  props.add(envelope, sticker, tape);

  const orbitDefs = [
    { obj: envelope, r: 2.75, y: 1.15, z0: 0.9, speed: 0.10, phase: 0.0, tiltSpeed: 0.6 },
    { obj: sticker, r: 3.0, y: -0.25, z0: -0.6, speed: 0.13, phase: 2.1, tiltSpeed: -0.4 },
    { obj: tape, r: 2.5, y: 0.25, z0: 1.3, speed: 0.085, phase: 4.2, tiltSpeed: 0.5 },
  ];

  camera.updateProjectionMatrix();

  function fit() {
    const w = mount.clientWidth, h = mount.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / Math.max(1, h);
    camera.updateProjectionMatrix();
  }
  fit();
  addEventListener('resize', fit, { passive: true });

  // pointer parallax: tilts the rig, never the camera
  let px = 0, py = 0, rx = 0, ry = 0;
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    addEventListener('pointermove', (e) => {
      px = (e.clientX / innerWidth - 0.5) * 2;
      py = (e.clientY / innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  function frame(elapsed) {
    computer.position.y = 0.1 + Math.sin(elapsed * 0.6) * 0.06;
    computer.rotation.y = Math.sin(elapsed * 0.18) * 0.22;

    orbitDefs.forEach((o) => {
      const a = elapsed * o.speed + o.phase;
      o.obj.position.set(Math.cos(a) * o.r, o.y + Math.sin(a * 1.6) * 0.25, Math.sin(a) * o.r * 0.35 + o.z0);
      o.obj.rotation.y = elapsed * o.tiltSpeed;
      o.obj.rotation.x = Math.sin(elapsed * 0.4 + o.phase) * 0.15;
    });

    rx += (py * 0.12 - rx) * 0.04;
    ry += (px * 0.16 - ry) * 0.04;
    rig.rotation.x = rx;
    rig.rotation.y = ry;

    renderer.render(scene, camera);
  }

  if (reduce) {
    frame(0.6);
  } else {
    const clock = new THREE.Clock();
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { running = e.isIntersecting; if (running && !raf) loop(); });
    }, { threshold: 0.05 });
    io.observe(mount);
    let running = true, raf = null;
    function loop() {
      if (!running) { raf = null; return; }
      frame(clock.getElapsedTime());
      raf = requestAnimationFrame(loop);
    }
    loop();
  }
}
