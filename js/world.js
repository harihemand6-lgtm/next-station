// 3D city (Three.js). Camera follows behind your character. Walk with the joystick, WASD/arrows, or tap the ground.
// Drag to turn the camera. Walk up to people and places to interact. Live players are drawn here too.
window.AE_WORLD = (function () {
  const AV = window.AE_AVATAR;
  const COLS = 48, ROWS = 36, SPEED = 3.6;
  const ROAD = 0, SIDE = 1, PLAZA = 2, GRASS = 3, BLD = 4, WATER = 5, TREE = 6, JETTY = 7;
  const WALKABLE = [true, true, true, true, false, false, false, true];
  const VROADS = [5, 17, 29, 41], HROADS = [5, 17, 29];
  const BX = [[0, 4], [7, 16], [19, 28], [31, 40], [43, 47]], BY = [[0, 4], [7, 16], [19, 28], [31, 35]];
  const WATER_WEST = { KL: "Backwaters", MH: "Arabian Sea", WB: "Hooghly River" };
  const LANDMARK = { street: "{stall}", job: "Brightline Systems", govt: "Coaching Centre", creator: "Creator Café", startup: "Co-working Space", craft: "Weavers' Workshop", film: "Studio Gate", cricket: "Cricket Ground", reality: "Spotlight House", trader: "Wi-Fi Café" };
  const SKIN = AV.SKIN, HAIRC = AV.HAIR;

  let THREE, el, renderer, scene, camera, ray, groundMesh, grid, blds, trees, labels, spots, doors, figs = {}, me, raf = 0, last = 0, opts = {}, yaw = 0, lastDrag = 0, keys = {}, joy = { x: 0, y: 0, on: false }, nearKey = null, sceneMarker = null, guide = null, beacon, bang, labelLayer, banner, actBtn, logEl, ok3d = false, lastMoveSent = 0, matCache = {}, extraSpots = {}, inside = {};

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function hashNum(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const at = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS ? BLD : grid[y * COLS + x]);
  const setT = (x, y, v) => { if (x >= 0 && y >= 0 && x < COLS && y < ROWS) grid[y * COLS + x] = v; };
  const walk = (x, y) => WALKABLE[at(x, y)];
  const tileOf = p => ({ x: Math.floor(p.x), y: Math.floor(p.z) });

  // ── city layout (grid) ──
  function build(o) {
    grid = new Array(COLS * ROWS).fill(SIDE); blds = []; labels = []; trees = []; spots = {}; doors = [];
    const R = rng(hashNum(o.stateId + "city"));
    VROADS.forEach(c => { for (let y = 0; y < ROWS; y++) { setT(c, y, ROAD); setT(c + 1, y, ROAD); } });
    HROADS.forEach(r => { for (let x = 0; x < COLS; x++) { setT(x, r, ROAD); setT(x, r + 1, ROAD); } });
    const w = o.words;
    BY.forEach(([y0, y1], by) => BX.forEach(([x0, x1], bx) => {
      const ix0 = x0 + 1, ix1 = x1 - 1, iy0 = y0 + 1, iy1 = y1 - 1, key = bx + "," + by, cx = Math.floor((x0 + x1) / 2), cy = Math.floor((y0 + y1) / 2);
      if (key === "2,1") {
        for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++) setT(x, y, PLAZA);
        [[ix0, iy0], [ix1, iy0], [ix0, iy1], [ix1, iy1]].forEach(([x, y]) => { setT(x, y, TREE); trees.push({ x, y }); });
        spots.board = { x: cx, y: cy, label: "Notice Board" };
        return;
      }
      if (key === "3,2") {
        for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++) { const p = x === cx || y === cy; setT(x, y, p ? PLAZA : GRASS); if (!p && R() < 0.2) { setT(x, y, TREE); trees.push({ x, y }); } }
        spots.f = { x: cx, y: y0, label: "City Park" };
        return;
      }
      if (bx === 0 && WATER_WEST[o.stateId]) {
        for (let y = y0; y <= y1; y++) for (let x = 0; x <= 3; x++) setT(x, y, WATER);
        if (by === 1) for (let x = 1; x <= 3; x++) setT(x, 11, JETTY);
        return;
      }
      const big = { "1,1": "life", "3,1": "rival", "1,2": "home", "2,2": "station", "1,0": "hall", "2,0": "fxn" }[key];
      let x = ix0;
      while (x <= ix1) {
        const bw = big ? ix1 - ix0 + 1 : Math.min(ix1 - x + 1, 3 + Math.floor(R() * 4)), bh = iy1 - iy0;
        for (let yy = iy0; yy < iy0 + bh; yy++) for (let xx = x; xx < x + bw; xx++) setT(xx, yy, BLD);
        const height = big ? 3.2 + R() * 1.5 : 1.4 + R() * 3.2;
        blds.push({ x, y: iy0, w: bw, d: bh, h: height, tone: Math.floor(R() * 4), big });
        if (!big && bh > 0) doors.push({ x: x + Math.floor(bw / 2), y: y1 });
        x += bw + 1;
      }
      const name = { life: (LANDMARK[o.lifeId] || "Market").replace("{stall}", w.stall), rival: w.v + "'s place", home: "Home", station: w.city + " Railway Station", hall: "Town Hall", fxn: "FXN Rentals" }[big];
      if (big) labels.push({ x: cx + 0.5, y: iy1 + 0.05, t: name, c: { life: "#f4a52b", rival: "#ef6a5f", home: "#c9b6ff", station: "#22b5a6", hall: "#f3efe6", fxn: "#ff4f9a" }[big], h: blds[blds.length - 1].h });
      if (big === "life") spots.m = { x: cx, y: y1, label: name };
      if (big === "rival") spots.v = { x: cx, y: y1, label: name };
      if (big === "home") spots.p = { x: cx, y: y1, label: "Home" };
      if (big === "station") spots.station = { x: cx, y: y1, label: name };
      if (big === "hall") spots.hall = { x: cx, y: y1, label: "Town Hall" };
      if (big === "fxn") spots.fxn = { x: cx, y: y1, label: "FXN Rentals" };
    }));
    if (WATER_WEST[o.stateId]) for (let y = 0; y < ROWS; y++) for (let x = 0; x <= 3; x++) if (at(x, y) !== JETTY) setT(x, y, WATER);
  }

  function nearestWalk(t) {
    if (walk(t.x, t.y)) return t;
    for (let r = 1; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (walk(t.x + dx, t.y + dy)) return { x: t.x + dx, y: t.y + dy };
    return null;
  }
  function path(a, b) {
    b = nearestWalk(b); if (!b) return [];
    if (!walk(a.x, a.y)) return [b];
    const key = (x, y) => y * COLS + x, open = [{ x: a.x, y: a.y, g: 0, f: 0 }], came = {}, gs = { [key(a.x, a.y)]: 0 };
    let guard = 0;
    while (open.length && guard++ < 5000) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
      const c = open.splice(bi, 1)[0];
      if (c.x === b.x && c.y === b.y) { const out = []; let k = key(c.x, c.y); while (k !== key(a.x, a.y) && k !== undefined) { out.unshift({ x: k % COLS, y: Math.floor(k / COLS) }); k = came[k]; } return out; }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = c.x + dx, ny = c.y + dy;
        if (!walk(nx, ny) || (dx && dy && (!walk(c.x + dx, c.y) || !walk(c.x, c.y + dy)))) continue;
        const g = c.g + (dx && dy ? 1.414 : 1), k = key(nx, ny);
        if (gs[k] === undefined || g < gs[k]) { gs[k] = g; came[k] = key(c.x, c.y); open.push({ x: nx, y: ny, g, f: g + Math.hypot(nx - b.x, ny - b.y) }); }
      }
    }
    return [];
  }
  const toPts = arr => arr.map(t => ({ x: t.x + 0.5, z: t.y + 0.5 }));

  // ── 3D helpers ──
  const mat = c => matCache[c] || (matCache[c] = new THREE.MeshLambertMaterial({ color: c }));
  function textSprite(text, color, scale) {
    const c = document.createElement("canvas"), x = c.getContext("2d");
    x.font = "800 40px Mukta, sans-serif"; const w = Math.ceil(x.measureText(text).width) + 40;
    c.width = w; c.height = 64;
    x.font = "800 40px Mukta, sans-serif"; x.fillStyle = "rgba(18,15,31,.88)"; x.strokeStyle = color; x.lineWidth = 4;
    x.fillRect(2, 2, w - 4, 60); x.strokeRect(2, 2, w - 4, 60);
    x.fillStyle = color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, w / 2, 34);
    const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true }));
    s.scale.set((w / 64) * (scale || 0.55), scale || 0.55, 1);
    return s;
  }
  function groundTexture() {
    const P = 16, c = document.createElement("canvas"); c.width = COLS * P; c.height = ROWS * P;
    const x = c.getContext("2d");
    const col = { [ROAD]: "#2c2846", [SIDE]: "#57507a", [PLAZA]: "#6a6190", [GRASS]: "#2f6b45", [BLD]: "#3b345f", [WATER]: "#1c5578", [TREE]: "#2f6b45", [JETTY]: "#8a6a45" };
    for (let y = 0; y < ROWS; y++) for (let xx = 0; xx < COLS; xx++) { x.fillStyle = col[at(xx, y)]; x.fillRect(xx * P, y * P, P, P); }
    x.fillStyle = "rgba(244,165,43,.75)";
    HROADS.forEach(r => { for (let i = 0; i < COLS; i += 2) if (at(i, r) === ROAD) x.fillRect(i * P + 3, (r + 1) * P - 1, 10, 2); });
    VROADS.forEach(cc => { for (let i = 0; i < ROWS; i += 2) if (at(cc, i) === ROAD) x.fillRect((cc + 1) * P - 1, i * P + 3, 2, 10); });
    x.strokeStyle = "rgba(255,255,255,.07)";
    for (let y = 0; y < ROWS; y++) for (let xx = 0; xx < COLS; xx++) if (at(xx, y) === PLAZA || at(xx, y) === SIDE) x.strokeRect(xx * P + .5, y * P + .5, P - 1, P - 1);
    return new THREE.CanvasTexture(c);
  }
  function windowTexture() {
    const c = document.createElement("canvas"); c.width = 32; c.height = 32;
    const x = c.getContext("2d"); x.fillStyle = "#ffffff"; x.fillRect(0, 0, 32, 32);
    x.fillStyle = "#ffd98a"; x.fillRect(8, 8, 9, 11); x.fillStyle = "#c9c3e6"; x.fillRect(20, 8, 6, 11);
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
  }

  // ── people ──
  function personLook(av, outfit) {
    const B = window.AE_FXN ? window.AE_FXN.basics : { top: "#8f8d9e", bottom: "#2a2742", style: "tee" };
    return { skin: SKIN[av.skin] || SKIN[3], height: av.height || 165, weight: av.weight || 60, hair: av.hair || "short", hairC: HAIRC[av.hairColor] || HAIRC[0], acc: av.acc || "none", o: outfit || B };
  }
  function person(look) {
    const g = new THREE.Group(), o = look.o;
    const H = 0.78 + (Math.max(140, Math.min(200, look.height)) - 140) / 60 * 0.3;
    const bmi = look.weight / Math.pow(look.height / 100, 2), wf = Math.max(0.78, Math.min(1.4, 0.82 + (bmi - 18) / 14 * 0.5));
    const legH = H * 0.46, torsoH = H * 0.32, headR = H * 0.085, top = o.top, bottom = o.bottom, trim = o.trim || top;
    const legs = [], arms = [];
    [-1, 1].forEach(sd => {
      const p = new THREE.Group(); p.position.set(sd * 0.065 * wf, legH, 0);
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.1 * wf, legH, 0.11), mat(bottom)); m.position.y = -legH / 2; p.add(m);
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.11 * wf, 0.05, 0.16), mat("#151320")); sh.position.set(0, -legH + 0.025, 0.02); p.add(sh);
      g.add(p); legs.push(p);
    });
    const draped = ["saree", "lehenga", "gown", "mundu"].indexOf(o.style) >= 0;
    if (draped) {
      const r1 = o.style === "mundu" ? 0.2 * wf : 0.27 * wf;
      const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * wf, r1, legH * 0.96, 12), mat(bottom)); sk.position.y = legH * 0.5; g.add(sk);
      const band = new THREE.Mesh(new THREE.CylinderGeometry(r1 + 0.004, r1 + 0.004, 0.05, 12), mat(trim)); band.position.y = 0.05; g.add(band);
    }
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.3 * wf, torsoH, 0.18 * wf), mat(top)); torso.position.y = legH + torsoH / 2; g.add(torso);
    if (o.style === "kurta" || o.style === "suit") { const k = new THREE.Mesh(new THREE.BoxGeometry(0.31 * wf, legH * 0.42, 0.185 * wf), mat(top)); k.position.y = legH - legH * 0.2; g.add(k); }
    if (o.style === "suit") { const tie = new THREE.Mesh(new THREE.BoxGeometry(0.035, torsoH * 0.75, 0.01), mat(trim)); tie.position.set(0, legH + torsoH * 0.55, 0.092 * wf); g.add(tie); }
    if (o.style === "saree" || (o.style === "kurta" && o.trim)) { const pallu = new THREE.Mesh(new THREE.BoxGeometry(0.07, torsoH * 1.15, 0.2 * wf), mat(trim)); pallu.position.set(0.1 * wf, legH + torsoH * 0.5, 0); pallu.rotation.z = 0.5; g.add(pallu); }
    if (o.style === "sport") { const st = new THREE.Mesh(new THREE.BoxGeometry(0.31 * wf, 0.04, 0.185 * wf), mat(trim)); st.position.y = legH + torsoH * 0.75; g.add(st); }
    [-1, 1].forEach(sd => {
      const p = new THREE.Group(); p.position.set(sd * (0.15 * wf + 0.045), legH + torsoH * 0.95, 0);
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.075, torsoH * 0.95, 0.075), mat(o.style === "saree" || o.style === "gown" ? look.skin : top)); m.position.y = -torsoH * 0.475; p.add(m);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 6), mat(look.skin)); hand.position.y = -torsoH * 0.98; p.add(hand);
      g.add(p); arms.push(p);
    });
    const hy = legH + torsoH + headR * 1.15;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.06, 8), mat(look.skin)); neck.position.y = legH + torsoH + 0.02; g.add(neck);
    const head = new THREE.Mesh(new THREE.SphereGeometry(headR, 14, 10), mat(look.skin)); head.position.y = hy; g.add(head);
    [-1, 1].forEach(sd => { const e = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.13, 6, 4), mat("#141018")); e.position.set(sd * headR * 0.38, hy + headR * 0.1, headR * 0.9); g.add(e); });
    const hm = mat(look.hairC);
    if (look.hair !== "bald") {
      const cap = new THREE.Mesh(new THREE.SphereGeometry(headR * (look.hair === "curly" ? 1.12 : 1.05), 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), hm); cap.position.y = hy + headR * 0.05; cap.rotation.x = -0.25; g.add(cap);
      if (look.hair === "long") { const b = new THREE.Mesh(new THREE.BoxGeometry(headR * 2, headR * 2.6, 0.05), hm); b.position.set(0, hy - headR * 0.8, -headR * 0.75); g.add(b); }
      if (look.hair === "bun") { const b = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.45, 8, 6), hm); b.position.set(0, hy + headR * 0.75, -headR * 0.75); g.add(b); }
    }
    if (look.acc === "specs") [-1, 1].forEach(sd => { const r = new THREE.Mesh(new THREE.TorusGeometry(headR * 0.28, headR * 0.05, 6, 12), mat("#141018")); r.position.set(sd * headR * 0.38, hy + headR * 0.1, headR * 0.98); g.add(r); });
    if (look.acc === "cap") { const c = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.08, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.5), mat(trim)); c.position.y = hy + headR * 0.05; g.add(c); const br = new THREE.Mesh(new THREE.BoxGeometry(headR * 1.6, 0.012, headR * 1.1), mat(trim)); br.position.set(0, hy + headR * 0.15, headR * 1.05); g.add(br); }
    if (look.acc === "beard") { const b = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.95, 10, 6, 0, Math.PI * 2, Math.PI * 0.55, Math.PI * 0.45), hm); b.position.set(0, hy, headR * 0.12); g.add(b); }
    if (look.acc === "moustache") { const m = new THREE.Mesh(new THREE.BoxGeometry(headR * 0.9, headR * 0.16, 0.02), hm); m.position.set(0, hy - headR * 0.32, headR * 0.95); g.add(m); }
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.22 * wf, 16), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.3, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.01; g.add(shadow);
    return { group: g, legs, arms, H: hy + headR };
  }

  function addFig(id, kind, av, outfit, name, x, z) {
    const lab = document.createElement("div"); lab.className = "lab " + kind;
    lab.innerHTML = `<div class="bub" hidden></div><span>${esc(name)}</span>`;
    labelLayer.appendChild(lab);
    const f = { id, kind, av, outfit, name, x, z, path: [], heading: 0, ph: 0, moving: false, lab, H: 1.1 };
    if (ok3d) { f.mesh = person(personLook(av, outfit)); f.mesh.group.userData.figId = id; f.H = f.mesh.H; scene.add(f.mesh.group); place(f); }
    figs[id] = f; return f;
  }
  function removeFig(id) { const f = figs[id]; if (!f) return; if (f.mesh) scene.remove(f.mesh.group); f.lab.remove(); delete figs[id]; }
  function setLookFig(id, av, outfit) {
    const f = figs[id]; if (!f) return;
    f.av = av || f.av; f.outfit = outfit;
    if (!ok3d) return;
    scene.remove(f.mesh.group);
    f.mesh = person(personLook(f.av, outfit)); f.mesh.group.userData.figId = id; f.H = f.mesh.H;
    scene.add(f.mesh.group); place(f);
  }
  function place(f) { if (f.mesh) { f.mesh.group.position.set(f.x, 0, f.z); f.mesh.group.rotation.y = f.heading; } }

  // ── mount ──
  function mount(slot, o) {
    opts = o;
    if (!el || el.dataset.key !== o.key) {
      if (el) destroy();
      THREE = window.THREE;
      build(o);
      el = document.createElement("section");
      el.className = "world w3d";
      el.dataset.key = o.key;
      el.innerHTML = `<div class="w-banner" hidden><span class="arrow" aria-hidden="true">➤</span><div class="w-banner-t"><b></b><span></span></div><div class="w-banner-a"></div></div>
        <div class="w3-view"><div class="w-labels"></div><div class="joy" aria-label="Joystick: drag to walk"><i></i></div>
          <div class="w-ui"><button class="w-btn act" hidden></button><button class="w-btn say" hidden>Say…</button><button class="w-btn chat" hidden>Chat</button><span class="w-online" hidden></span></div>
          <div class="say-panel" hidden></div>
          <div class="chat-log" aria-live="polite"></div></div>
        <form class="chat-row" hidden><input maxlength="80" placeholder="Type a message (no numbers, links or handles)" aria-label="Chat message"><button class="w-btn">Send</button></form>
        <p class="w-hint">Drag to look around. Joystick, WASD or tap the ground to walk. Chat vanishes and is never saved. <a href="#rules" data-act="rules">Rules &amp; contact</a></p>`;
      labelLayer = el.querySelector(".w-labels"); banner = el.querySelector(".w-banner"); actBtn = el.querySelector(".act"); logEl = el.querySelector(".chat-log");
      figs = {}; extraSpots = {}; inside = {}; guide = null; sceneMarker = null; nearKey = null; yaw = Math.PI / 2;
      ok3d = false;
      try { if (THREE) { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" }); ok3d = !!renderer.getContext(); } } catch (e) { ok3d = false; }
      const view = el.querySelector(".w3-view");
      if (ok3d) {
        renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));
        view.insertBefore(renderer.domElement, view.firstChild);
        scene = new THREE.Scene();
        const sky = new THREE.Color(o.hue || "#7b8cff").lerp(new THREE.Color("#120f1f"), 0.72);
        scene.background = sky; scene.fog = new THREE.Fog(sky, 12, 30);
        camera = new THREE.PerspectiveCamera(58, 1, 0.1, 80);
        ray = new THREE.Raycaster();
        scene.add(new THREE.HemisphereLight(0xcfd8ff, 0x2a2440, 0.95));
        const sun = new THREE.DirectionalLight(0xffe2b0, 0.75); sun.position.set(-10, 20, 8); scene.add(sun);
        groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(COLS, ROWS), new THREE.MeshLambertMaterial({ map: groundTexture() }));
        groundMesh.rotation.x = -Math.PI / 2; groundMesh.position.set(COLS / 2, 0, ROWS / 2); scene.add(groundMesh);
        const win = windowTexture(), hue = new THREE.Color(o.hue || "#7b8cff");
        blds.forEach(b => {
          const base = new THREE.Color(["#4a4275", "#574a80", "#3f3a6b", "#5d4f86"][b.tone]).lerp(hue, b.big ? 0.35 : 0.12);
          if (b.big === "fxn") base.set("#3a1838");
          const t = win.clone(); t.needsUpdate = true; t.repeat.set(Math.max(1, b.w), Math.max(1, Math.round(b.h / 1.1)));
          const side = new THREE.MeshLambertMaterial({ color: base, map: t }), roof = new THREE.MeshLambertMaterial({ color: base.clone().multiplyScalar(0.7) });
          const m = new THREE.Mesh(new THREE.BoxGeometry(b.w * 0.96, b.h, b.d * 0.96), [side, side, roof, roof, side, side]);
          m.position.set(b.x + b.w / 2, b.h / 2, b.y + b.d / 2); scene.add(m);
          if (b.big) { const door = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.9, 0.05), mat(b.big === "fxn" ? "#ff4f9a" : "#1b1830")); door.position.set(b.x + b.w / 2, 0.45, b.y + b.d * 0.98 + 0.01); scene.add(door); }
        });
        labels.forEach(l => { const s = textSprite(l.t, l.c, 0.6); s.position.set(l.x, l.h + 0.6, l.y); scene.add(s); });
        trees.forEach(t => {
          const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.6, 6), mat("#6b4a2f")); tr.position.set(t.x + 0.5, 0.3, t.y + 0.5); scene.add(tr);
          const cn = new THREE.Mesh(new THREE.SphereGeometry(0.45, 8, 6), mat("#3f8f55")); cn.position.set(t.x + 0.5, 0.95, t.y + 0.5); scene.add(cn);
        });
        const bd = spots.board, board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.06), mat("#8a6a45")); board.position.set(bd.x + 0.5, 0.95, bd.y + 0.5); scene.add(board);
        const paper = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.07), mat("#f3efe6")); paper.position.copy(board.position); scene.add(paper);
        const bs = textSprite("Notice Board", "#22b5a6", 0.42); bs.position.set(bd.x + 0.5, 1.6, bd.y + 0.5); scene.add(bs);
        beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 7, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0x22b5a6, transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }));
        beacon.visible = false; scene.add(beacon);
        bang = textSprite(" ! ", "#f4a52b", 0.7); bang.visible = false; scene.add(bang);
      } else {
        view.insertAdjacentHTML("afterbegin", `<p class="no3d">3D isn't available on this device or browser. You can still play: use the "Go there" button on the mission bar to skip walking.</p>`);
      }
      me = addFig("me", "me", o.avatar, o.outfit, o.meLabel || "You", 8.5, 18.5);
      ["m", "f", "v", "p"].forEach(r => { const s = spots[r]; if (s) { const f = addFig("npc_" + r, "npc", npcLook(o.stateId, r), null, o.cast[r], s.x + 0.5, s.y + 0.5); f.role = r; f.heading = Math.PI; place(f); } });
      bindInput();
      window.addEventListener("resize", resize); window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
      last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    } else if (JSON.stringify(o.outfit || null) !== JSON.stringify(figs.me.outfit || null)) setLookFig("me", o.avatar, o.outfit);
    slot.appendChild(el);
    resize();
    return el;
  }
  function npcLook(stateId, role) {
    const R = rng(hashNum(stateId + role));
    return { skin: Math.floor(R() * 8), height: 155 + Math.floor(R() * 30), weight: 52 + Math.floor(R() * 30), hair: role === "p" ? "bun" : ["short", "curly", "long", "buzz"][Math.floor(R() * 4)], hairColor: role === "p" || role === "m" ? 4 : Math.floor(R() * 3), acc: role === "m" ? "specs" : role === "v" ? "cap" : "none" };
  }
  function resize() {
    if (!el || !el.isConnected || !ok3d) return;
    const view = el.querySelector(".w3-view"), w = view.clientWidth || 360, h = view.clientHeight || 380;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  }

  // ── input ──
  function bindInput() {
    const view = el.querySelector(".w3-view");
    let down = null;
    view.addEventListener("pointerdown", e => { if (e.target.closest(".joy")) return; down = { x: e.clientX, lx: e.clientX, drag: false }; try { view.setPointerCapture(e.pointerId); } catch (er) { } });
    view.addEventListener("pointermove", e => {
      if (!down) return;
      if (Math.abs(e.clientX - down.x) > 6 || down.drag) { down.drag = true; yaw -= (e.clientX - down.lx) * 0.008; down.lx = e.clientX; lastDrag = performance.now(); }
    });
    view.addEventListener("pointerup", e => { if (down && !down.drag) tap(e); down = null; });
    const joyEl = el.querySelector(".joy"), knob = joyEl.querySelector("i");
    const jmove = e => { const r = joyEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2); const n = Math.hypot(dx, dy); if (n > 1) { dx /= n; dy /= n; } joy.x = dx; joy.y = dy; knob.style.transform = `translate(${dx * 24}px, ${dy * 24}px)`; };
    joyEl.addEventListener("pointerdown", e => { e.stopPropagation(); joy.on = true; try { joyEl.setPointerCapture(e.pointerId); } catch (er) { } jmove(e); });
    joyEl.addEventListener("pointermove", e => { if (joy.on) jmove(e); });
    const jend = () => { if (!joy.on) return; joy.on = false; joy.x = joy.y = 0; knob.style.transform = ""; sendMe(true); };
    joyEl.addEventListener("pointerup", jend); joyEl.addEventListener("pointercancel", jend);
    actBtn.addEventListener("click", () => { if (nearKey && opts.onSpot) opts.onSpot(nearKey); });
    const sayPanel = el.querySelector(".say-panel"), chatRow = el.querySelector(".chat-row");
    el.querySelector(".say").addEventListener("click", () => { sayPanel.hidden = !sayPanel.hidden; chatRow.hidden = true; });
    el.querySelector(".chat").addEventListener("click", () => { if (opts.onChatOpen && !opts.onChatOpen()) return; chatRow.hidden = !chatRow.hidden; sayPanel.hidden = true; if (!chatRow.hidden) chatRow.querySelector("input").focus(); });
    sayPanel.addEventListener("click", e => { const b = e.target.closest("[data-say]"); if (!b) return; sayPanel.hidden = true; if (opts.onSay) opts.onSay(b.dataset.kind, +b.dataset.say); });
    chatRow.addEventListener("submit", e => { e.preventDefault(); const inp = chatRow.querySelector("input"); const v = inp.value.trim(); if (v && opts.onType && opts.onType(v) !== false) inp.value = ""; });
    banner.querySelector(".w-banner-a").addEventListener("click", e => { const b = e.target.closest("[data-gact]"); if (b && opts.onGuideAction) opts.onGuideAction(b.dataset.gact); });
  }
  const KEYMAP = { ArrowUp: "f", w: "f", W: "f", ArrowDown: "b", s: "b", S: "b", ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", q: "tl", Q: "tl", e: "tr", E: "tr" };
  function kd(e) { if (!el || !el.isConnected || /input|textarea|select/i.test((document.activeElement || {}).tagName || "")) return; const k = KEYMAP[e.key]; if (k) { keys[k] = true; e.preventDefault(); } }
  function ku(e) { const k = KEYMAP[e.key]; if (k) { keys[k] = false; if (!keys.f && !keys.b && !keys.l && !keys.r) sendMe(true); } }

  function tap(e) {
    if (!ok3d) return;
    const r = renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(v, camera);
    const remotes = Object.values(figs).filter(f => f.kind === "remote" && f.mesh).map(f => f.mesh.group);
    const hitR = ray.intersectObjects(remotes, true)[0];
    if (hitR) { let o = hitR.object; while (o && o.userData.figId === undefined) o = o.parent; const f = o && figs[o.userData.figId]; if (f && opts.onRemoteTap) opts.onRemoteTap(f.rid, f.name); return; }
    const hit = ray.intersectObject(groundMesh)[0];
    if (!hit) return;
    me.path = toPts(path(tileOf(me), { x: Math.floor(hit.point.x), y: Math.floor(hit.point.z) }));
    sendMe(true, me.path.length ? me.path[me.path.length - 1] : null);
  }
  function sendMe(force, target) {
    const now = performance.now();
    if (!force && now - lastMoveSent < 500) return;
    lastMoveSent = now;
    const t = target ? { x: Math.floor(target.x), y: Math.floor(target.z) } : tileOf(me);
    if (opts.onMove) opts.onMove(t.x, t.y);
  }

  // ── simulation ──
  function stepPath(f, dt, speed) {
    if (!f.path.length) { f.moving = false; return; }
    const t = f.path[0], dx = t.x - f.x, dz = t.z - f.z, d = Math.hypot(dx, dz), s = (speed || SPEED) * dt;
    if (d > 0.001) f.heading = Math.atan2(dx, dz);
    if (d <= s) { f.x = t.x; f.z = t.z; f.path.shift(); } else { f.x += dx / d * s; f.z += dz / d * s; }
    f.moving = true;
  }
  function freeMove(dt) {
    if (keys.tl) yaw += dt * 2; if (keys.tr) yaw -= dt * 2;
    let fwd = (keys.f ? 1 : 0) - (keys.b ? 1 : 0) - joy.y, str = (keys.r ? 1 : 0) - (keys.l ? 1 : 0) + joy.x;
    const n = Math.hypot(fwd, str);
    if (n < 0.15) return false;
    if (n > 1) { fwd /= n; str /= n; }
    const fx = Math.sin(yaw), fz = Math.cos(yaw), rx = -Math.cos(yaw), rz = Math.sin(yaw);
    const vx = fx * fwd + rx * str, vz = fz * fwd + rz * str, s = SPEED * dt;
    me.path = [];
    const nx = me.x + vx * s, nz = me.z + vz * s;
    if (walk(Math.floor(nx), Math.floor(me.z))) me.x = nx;
    if (walk(Math.floor(me.x), Math.floor(nz))) me.z = nz;
    me.heading = Math.atan2(vx, vz); me.moving = true; me.free = true;
    sendMe(false);
    return true;
  }
  function animate(f, dt) {
    if (!f.mesh) return;
    if (f.moving) f.ph += dt * 11; else f.ph *= 0.8;
    const sw = Math.sin(f.ph) * (f.moving ? 0.6 : 0);
    f.mesh.legs[0].rotation.x = sw; f.mesh.legs[1].rotation.x = -sw;
    f.mesh.arms[0].rotation.x = -sw * 0.8; f.mesh.arms[1].rotation.x = sw * 0.8;
    place(f);
  }
  const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };
  function tick(time) {
    const dt = Math.min(0.05, (time - last) / 1000); last = time;
    me.free = false;
    if (!freeMove(dt)) stepPath(me, dt);
    Object.values(figs).forEach(f => {
      if (f.kind === "remote") stepPath(f, dt);
      if (f.kind === "courier") {
        stepPath(f, dt, 5.5);
        if (performance.now() - (f.repath || 0) > 800) { f.repath = performance.now(); f.path = toPts(path(tileOf(f), tileOf(me))); }
        if (f.cb && Math.hypot(f.x - me.x, f.z - me.z) < 1.1) { const cb = f.cb; f.cb = null; cb(); setTimeout(() => removeFig(f.id), 3000); }
      }
    });
    if (ok3d && el && el.isConnected) {
      if (me.moving && !me.free && performance.now() - lastDrag > 1500) yaw += angDiff(yaw, me.heading) * Math.min(1, dt * 2.2);
      Object.values(figs).forEach(f => animate(f, dt));
      const fx = Math.sin(yaw), fz = Math.cos(yaw);
      camera.position.set(me.x - fx * 3.4, 2.0, me.z - fz * 3.4);
      camera.lookAt(me.x + fx * 1.2, 0.75, me.z + fz * 1.2);
      const g = guide && spotPos(guide.key);
      beacon.visible = !!g; if (g) beacon.position.set(g.x, 3.5, g.z);
      const sm = sceneMarker && spotPos(sceneMarker);
      bang.visible = !!sm; if (sm) bang.position.set(sm.x, 2.3 + Math.sin(time / 200) * 0.12, sm.z);
      renderer.render(scene, camera);
      projectLabels();
    }
    let best = null, bd = 1.8;
    Object.keys(Object.assign({}, spots, extraSpots)).forEach(k => { const p = spotPos(k); if (!p) return; const d = Math.hypot(p.x - me.x, p.z - me.z); if (d < bd) { bd = d; best = k; } });
    if (best !== nearKey) { nearKey = best; const lbl = best && opts.spotLabel ? opts.spotLabel(best) : null; actBtn.hidden = !lbl; if (lbl) actBtn.textContent = lbl; }
    [guide && guide.key, sceneMarker].forEach(k => {
      if (!k) return; const p = spotPos(k); if (!p) return;
      const d = Math.hypot(p.x - me.x, p.z - me.z);
      if (d > 2.2) { inside[k] = false; return; }
      if (d < 1.3 && !inside[k]) { inside[k] = true; if (opts.onArrive) opts.onArrive(k); }
    });
    updateBanner();
    raf = requestAnimationFrame(tick);
  }
  function spotPos(k) {
    if (["m", "f", "v", "p"].indexOf(k) >= 0 && figs["npc_" + k]) return { x: figs["npc_" + k].x, z: figs["npc_" + k].z };
    const s = spots[k] || extraSpots[k]; return s ? { x: s.x + 0.5, z: s.y + 0.5 } : null;
  }
  function projectLabels() {
    const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight, v = new THREE.Vector3(), now = performance.now();
    Object.values(figs).forEach(f => {
      v.set(f.x, f.H + 0.22, f.z).project(camera);
      const dist = Math.hypot(f.x - me.x, f.z - me.z);
      const vis = v.z < 1 && dist < 16 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2;
      f.lab.style.display = vis ? "" : "none";
      if (vis) f.lab.style.transform = `translate(${(v.x + 1) / 2 * w}px, ${(1 - v.y) / 2 * h}px) translate(-50%, -100%)`;
      if (f.bubble && now > f.bubble.until) { f.bubble = null; f.lab.querySelector(".bub").hidden = true; }
    });
  }
  function updateBanner() {
    if (!banner) return;
    if (!guide) { banner.hidden = true; return; }
    banner.hidden = false;
    const p = guide.key && spotPos(guide.key), arrow = banner.querySelector(".arrow"), info = banner.querySelector(".w-banner-t span");
    if (p) {
      const ang = Math.atan2(p.x - me.x, p.z - me.z), rel = angDiff(yaw, ang), d = Math.hypot(p.x - me.x, p.z - me.z);
      arrow.style.transform = `rotate(${-rel - Math.PI / 2}rad)`; arrow.style.visibility = "visible";
      info.textContent = (guide.sub ? guide.sub + " · " : "") + Math.max(1, Math.round(d * 3)) + " m away";
    } else { arrow.style.visibility = "hidden"; info.textContent = guide.sub || ""; }
  }

  // ── public API ──
  function setGuide(gd) {
    guide = gd ? Object.assign({}, gd) : null;
    if (!el) return;
    banner.querySelector(".w-banner-t b").textContent = gd ? gd.text : "";
    banner.querySelector(".w-banner-a").innerHTML = gd && gd.actions ? gd.actions.map(a => `<button class="w-btn small" data-gact="${esc(a[0])}">${esc(a[1])}</button>`).join("") : "";
    updateBanner();
  }
  function setMarker(k) { sceneMarker = k || null; }
  function setExtraSpot(k, pos) { if (pos) extraSpots[k] = pos; else delete extraSpots[k]; }
  function randomDoor(r) { const d = doors[Math.floor(r * doors.length) % Math.max(1, doors.length)]; return d ? { x: d.x, y: d.y } : { x: 20, y: 18 }; }
  function bubble(f, t, s, typed) {
    if (!f) return;
    const b = f.lab.querySelector(".bub");
    b.innerHTML = esc(t) + (s ? `<small>${esc(s)}</small>` : ""); b.hidden = false; b.classList.toggle("typed", !!typed);
    f.bubble = { until: performance.now() + (s ? 6500 : 5000) };
  }
  function log(name, t) {
    if (!logEl) return;
    const p = document.createElement("p"); p.innerHTML = `<b>${esc(name)}:</b> ${esc(t)}`;
    logEl.appendChild(p); while (logEl.children.length > 4) logEl.firstChild.remove();
    clearTimeout(log._t); logEl.hidden = false; log._t = setTimeout(() => { if (logEl) logEl.hidden = true; }, 12000);
  }
  function npcSay(role, t, s) { bubble(figs["npc_" + role], t, s); }
  function meSay(t, typed) { bubble(me, t, null, typed); log(me.name, t); }
  function note(t) { log("Note", t); }
  function upsertRemote(id, d) {
    const k = "r_" + id;
    if (figs[k]) { if (d.outfitKey !== figs[k].outfitKey) { figs[k].outfitKey = d.outfitKey; setLookFig(k, d.av, d.outfit); } return; }
    const t = nearestWalk({ x: d.x, y: d.y }) || { x: 8, y: 18 };
    const f = addFig(k, "remote", d.av, d.outfit, d.nick, t.x + 0.5, t.y + 0.5); f.rid = id; f.outfitKey = d.outfitKey;
  }
  function moveRemote(id, x, y) { const f = figs["r_" + id]; if (f) f.path = toPts(path(tileOf(f), { x, y })); }
  function sayRemote(id, t, typed) { const f = figs["r_" + id]; if (!f || Math.hypot(f.x - me.x, f.z - me.z) > 14) return false; bubble(f, t, null, typed); log(f.name, t); return true; }
  function removeRemote(id) { removeFig("r_" + id); }
  function clearRemotes() { Object.keys(figs).filter(k => k.indexOf("r_") === 0).forEach(removeFig); }
  function setOnline(n, phrases, emotes, canType) {
    if (!el) return;
    const on = el.querySelector(".w-online");
    if (n == null) { on.hidden = true; el.querySelector(".say").hidden = true; el.querySelector(".chat").hidden = true; return; }
    on.hidden = false; on.textContent = n === 1 ? "Only you here" : n + " players here";
    el.querySelector(".say").hidden = false; el.querySelector(".chat").hidden = !canType;
    el.querySelector(".say-panel").innerHTML = phrases.map((p, i) => `<button data-kind="p" data-say="${i}">${esc(p)}</button>`).join("") + `<div class="emo">${emotes.map((p, i) => `<button data-kind="e" data-say="${i}">${esc(p)}</button>`).join("")}</div>`;
  }
  function spawnCourier(name, av, outfit, onArrive) {
    const s = spots.fxn || { x: 20, y: 4 };
    removeFig("courier");
    const f = addFig("courier", "courier", av, outfit, name + " · FXN", s.x + 0.5, s.y + 0.5);
    f.cb = onArrive; f.path = toPts(path({ x: s.x, y: s.y }, tileOf(me)));
    if (!ok3d) setTimeout(() => { if (f.cb) { const cb = f.cb; f.cb = null; cb(); removeFig("courier"); } }, 1500);
    return f;
  }
  function courierSay(t) { bubble(figs.courier, t); }
  function teleport(k) { inside[k] = true; const p = spotPos(k); if (!p) return; const t = nearestWalk({ x: Math.floor(p.x), y: Math.floor(p.z) + 1 }) || { x: Math.floor(p.x), y: Math.floor(p.z) }; me.x = t.x + 0.5; me.z = t.y + 0.5; me.path = []; sendMe(true); }
  function position() { return me ? tileOf(me) : { x: 8, y: 18 }; }
  function destroy() {
    cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("resize", resize);
    if (renderer) { try { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); } catch (e) { } }
    if (el) el.remove(); el = null; figs = {}; extraSpots = {}; guide = null; sceneMarker = null; renderer = null; matCache = {};
  }
  return { mount, setGuide, setMarker, setExtraSpot, randomDoor, npcSay, meSay, note, upsertRemote, moveRemote, sayRemote, removeRemote, clearRemotes, setOnline, spawnCourier, courierSay, setLook: (av, outfit) => setLookFig("me", av, outfit), teleport, position, destroy, available: () => ok3d };
})();
