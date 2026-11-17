// Open city (top-down). Walk in any direction: tap a spot, or use arrow keys / WASD.
// Walk up to characters to talk, or to the "!" to open the next scene. Live players are drawn here too.
window.AE_WORLD = (function () {
  const AV = window.AE_AVATAR;
  const T = 24, COLS = 48, ROWS = 36, WPX = COLS * T, HPX = ROWS * T, SPEED = 4.2 * T, VIEW_H = 360;
  const ROAD = 0, SIDE = 1, PLAZA = 2, GRASS = 3, BLD = 4, WATER = 5, TREE = 6, JETTY = 7;
  const WALKABLE = [true, true, true, true, false, false, false, true];
  const VROADS = [5, 17, 29, 41], HROADS = [5, 17, 29];
  const BX = [[0, 4], [7, 16], [19, 28], [31, 40], [43, 47]], BY = [[0, 4], [7, 16], [19, 28], [31, 35]];
  const WATER_WEST = { KL: "Backwaters", MH: "Arabian Sea", WB: "Hooghly River" };
  const CITY_SPOT = { KL: "Ferry Jetty", MH: "Dadar Station", PB: "Clock Tower Chowk", WB: "Tram Depot", RJ: "Pink City Gate", KA: "Majestic Bus Stand" };
  const LANDMARK = { street: "{stall}", job: "Brightline Systems", govt: "Coaching Centre", creator: "Creator Café", startup: "Co-working Space", craft: "Weavers' Workshop", film: "Studio Gate", cricket: "Cricket Ground", reality: "Spotlight House", trader: "Wi-Fi Café" };

  let el, cv, cx, dpr = 1, grid, blds = [], labels = [], trees = [], npcs = {}, me, remotes = {}, raf = 0, last = 0, opts = {}, cam = { x: 0, y: 0 }, keys = {}, nearRole = null, marker = null, t0 = 0, imgCache = {}, logEl, nearBtn;

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function hashNum(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const at = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS ? BLD : grid[y * COLS + x]);
  const set = (x, y, v) => { if (x >= 0 && y >= 0 && x < COLS && y < ROWS) grid[y * COLS + x] = v; };
  const walk = (x, y) => WALKABLE[at(x, y)];
  const tileOf = p => ({ x: Math.floor(p.x / T), y: Math.floor(p.y / T) });
  const centre = t => ({ x: t.x * T + T / 2, y: t.y * T + T / 2 });

  function avatarImg(av) {
    const k = JSON.stringify(av);
    if (!imgCache[k]) { const i = new Image(); i.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(AV.svg(av, 120)); imgCache[k] = i; }
    return imgCache[k];
  }
  function npcLook(stateId, role) {
    const R = rng(hashNum(stateId + role));
    const hair = role === "p" ? (R() < 0.5 ? "bun" : "short") : ["short", "curly", "long", "buzz"][Math.floor(R() * 4)];
    return { skin: Math.floor(R() * 8), height: 155 + Math.floor(R() * 30), weight: 52 + Math.floor(R() * 30), hair, hairColor: role === "p" || role === "m" ? 4 : Math.floor(R() * 3), top: ["shirt", "kurta", "tee"][Math.floor(R() * 3)], outfit: { m: 1, v: 2, f: 3, p: 6 }[role], acc: role === "m" ? "specs" : role === "v" ? "cap" : "none" };
  }

  // ── city layout ──
  function build(o) {
    grid = new Array(COLS * ROWS).fill(SIDE); blds = []; labels = []; trees = [];
    const R = rng(hashNum(o.stateId + "city"));
    VROADS.forEach(c => { for (let y = 0; y < ROWS; y++) { set(c, y, ROAD); set(c + 1, y, ROAD); } });
    HROADS.forEach(r => { for (let x = 0; x < COLS; x++) { set(x, r, ROAD); set(x, r + 1, ROAD); } });
    const spots = {};
    const words = o.words;
    BY.forEach(([y0, y1], by) => BX.forEach(([x0, x1], bx) => {
      const ix0 = x0 + 1, ix1 = x1 - 1, iy0 = y0 + 1, iy1 = y1 - 1;
      const key = bx + "," + by;
      const cxT = Math.floor((x0 + x1) / 2);
      if (key === "2,1") { // plaza with notice board
        for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++) set(x, y, PLAZA);
        [[ix0, iy0], [ix1, iy0], [ix0, iy1], [ix1, iy1]].forEach(([x, y]) => { set(x, y, TREE); trees.push({ x, y }); });
        spots.board = { x: cxT, y: Math.floor((y0 + y1) / 2) };
        labels.push({ x: cxT, y: spots.board.y - 1.6, t: "Notice Board", c: "#22b5a6" });
        return;
      }
      if (key === "3,2") { // park
        for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++) {
          const path = x === cxT || y === Math.floor((y0 + y1) / 2);
          set(x, y, path ? PLAZA : GRASS);
          if (!path && R() < 0.22) { set(x, y, TREE); trees.push({ x, y }); }
        }
        spots.f = { x: cxT, y: y0 };
        labels.push({ x: cxT, y: y0 + 2.2, t: "City Park", c: "#6fd08c" });
        return;
      }
      if (bx === 0 && WATER_WEST[o.stateId]) {
        for (let y = y0; y <= y1; y++) for (let x = 0; x <= 3; x++) set(x, y, WATER);
        if (by === 1) { for (let x = 1; x <= 3; x++) set(x, 11, JETTY); labels.push({ x: 2, y: 9.6, t: CITY_SPOT[o.stateId] || "Jetty", c: "#f4a52b" }); }
        if (by === 2) labels.push({ x: 2, y: 23, t: WATER_WEST[o.stateId], c: "#7fb7d8" });
        return;
      }
      // buildings face the road below (front row stays sidewalk)
      let x = ix0;
      const big = { "1,1": "life", "3,1": "rival", "1,2": "home", "2,2": "city" }[key];
      while (x <= ix1) {
        const w = big ? ix1 - ix0 + 1 : Math.min(ix1 - x + 1, 3 + Math.floor(R() * 4));
        const h = iy1 - iy0;
        for (let yy = iy0; yy < iy0 + h; yy++) for (let xx = x; xx < x + w; xx++) set(xx, yy, BLD);
        blds.push({ x, y: iy0, w, h, tone: Math.floor(R() * 4), big });
        x += w + 1;
      }
      if (big === "life") { spots.m = { x: cxT, y: y1 }; labels.push({ x: cxT, y: iy0 + 1.2, t: (LANDMARK[o.lifeId] || "Market").replace("{stall}", words.stall), c: "#f4a52b", big: 1 }); }
      if (big === "rival") { spots.v = { x: cxT, y: y1 }; labels.push({ x: cxT, y: iy0 + 1.2, t: words.v + "'s place", c: "#ef6a5f", big: 1 }); }
      if (big === "home") { spots.p = { x: cxT, y: y1 }; labels.push({ x: cxT, y: iy0 + 1.2, t: "Home", c: "#c9b6ff", big: 1 }); }
      if (big === "city" && !WATER_WEST[o.stateId]) labels.push({ x: cxT, y: iy0 + 1.2, t: CITY_SPOT[o.stateId] || words.city, c: "#f4a52b", big: 1 });
      if (big === "city" && WATER_WEST[o.stateId]) labels.push({ x: cxT, y: iy0 + 1.2, t: words.city + " Market", c: "#f4a52b", big: 1 });
    }));
    if (WATER_WEST[o.stateId]) for (let y = 0; y < ROWS; y++) for (let x = 0; x <= 3; x++) if (at(x, y) !== JETTY) set(x, y, WATER);
    return spots;
  }

  // ── pathfinding (A*, 8 directions, no corner cutting) ──
  function nearestWalk(t) {
    if (walk(t.x, t.y)) return t;
    for (let r = 1; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (walk(t.x + dx, t.y + dy)) return { x: t.x + dx, y: t.y + dy };
    return null;
  }
  function path(a, b) {
    b = nearestWalk(b); if (!b) return [];
    const key = (x, y) => y * COLS + x, open = [{ x: a.x, y: a.y, g: 0, f: 0 }], came = {}, gs = { [key(a.x, a.y)]: 0 };
    const H = (x, y) => Math.hypot(x - b.x, y - b.y);
    let guard = 0;
    while (open.length && guard++ < 4000) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
      const c = open.splice(bi, 1)[0];
      if (c.x === b.x && c.y === b.y) {
        const out = []; let k = key(c.x, c.y);
        while (k !== key(a.x, a.y)) { out.unshift({ x: k % COLS, y: Math.floor(k / COLS) }); k = came[k]; if (k === undefined) break; }
        return out;
      }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = c.x + dx, ny = c.y + dy;
        if (!walk(nx, ny) || (dx && dy && (!walk(c.x + dx, c.y) || !walk(c.x, c.y + dy)))) continue;
        const g = c.g + (dx && dy ? 1.414 : 1), k = key(nx, ny);
        if (gs[k] === undefined || g < gs[k]) { gs[k] = g; came[k] = key(c.x, c.y); open.push({ x: nx, y: ny, g, f: g + H(nx, ny) }); }
      }
    }
    return [];
  }

  // ── mount / DOM ──
  function mount(slot, o) {
    opts = o;
    if (!el || el.dataset.key !== o.key) {
      if (el) destroy();
      const spots = build(o);
      el = document.createElement("section");
      el.className = "world city";
      el.dataset.key = o.key;
      el.innerHTML = `<canvas aria-label="City map. Tap to walk."></canvas>
        <div class="w-ui"><button class="w-btn near" hidden></button><button class="w-btn say" hidden>Say…</button><button class="w-btn chat" hidden>Chat</button><span class="w-online" hidden></span></div>
        <div class="say-panel" hidden></div>
        <div class="chat-log" aria-live="polite"></div>
        <form class="chat-row" hidden><input maxlength="80" placeholder="Type a message (no numbers, links or handles)" aria-label="Chat message"><button class="w-btn">Send</button></form>
        <p class="w-hint">Tap anywhere to walk. Arrow keys or WASD work too. Messages vanish and are never saved. <a href="#rules" data-act="rules">Rules &amp; contact</a></p>`;
      cv = el.querySelector("canvas"); cx = cv.getContext("2d");
      nearBtn = el.querySelector(".near"); logEl = el.querySelector(".chat-log");
      const start = { x: 8, y: 18 };
      me = Object.assign(centre(start), { path: [], face: 1, av: o.avatar, name: o.meLabel || "You", me: true });
      npcs = {};
      ["m", "f", "v", "p"].forEach(r => { const t = spots[r]; if (t) npcs[r] = Object.assign(centre(t), { role: r, name: o.cast[r], av: npcLook(o.stateId, r), face: 1 }); });
      npcs.board = Object.assign(centre(spots.board), { role: "board", board: true });
      cv.addEventListener("pointerdown", onTap);
      nearBtn.addEventListener("click", () => { if (nearRole && opts.onTalk) opts.onTalk(nearRole); });
      const sayPanel = el.querySelector(".say-panel"), chatRow = el.querySelector(".chat-row");
      el.querySelector(".say").addEventListener("click", () => { sayPanel.hidden = !sayPanel.hidden; chatRow.hidden = true; });
      el.querySelector(".chat").addEventListener("click", () => { if (opts.onChatOpen && !opts.onChatOpen()) return; chatRow.hidden = !chatRow.hidden; sayPanel.hidden = true; if (!chatRow.hidden) chatRow.querySelector("input").focus(); });
      sayPanel.addEventListener("click", e => { const b = e.target.closest("[data-say]"); if (!b) return; sayPanel.hidden = true; if (opts.onSay) opts.onSay(b.dataset.kind, +b.dataset.say); });
      chatRow.addEventListener("submit", e => { e.preventDefault(); const inp = chatRow.querySelector("input"); const v = inp.value.trim(); if (!v) return; if (opts.onType && opts.onType(v) !== false) inp.value = ""; });
      window.addEventListener("keydown", kd); window.addEventListener("keyup", ku); window.addEventListener("resize", resize);
      t0 = last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    }
    slot.appendChild(el);
    resize();
    return el;
  }
  function resize() {
    if (!el || !el.isConnected) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = el.clientWidth || 360;
    cv.width = Math.round(w * dpr); cv.height = Math.round(VIEW_H * dpr);
    cv.style.width = w + "px"; cv.style.height = VIEW_H + "px";
  }
  function kd(e) {
    if (!el || !el.isConnected || /input|textarea|select/i.test(document.activeElement && document.activeElement.tagName)) return;
    const k = { ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", ArrowUp: "u", w: "u", W: "u", ArrowDown: "dn", s: "dn", S: "dn" }[e.key];
    if (k) { keys[k] = true; e.preventDefault(); }
  }
  function ku(e) { const k = { ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", ArrowUp: "u", w: "u", W: "u", ArrowDown: "dn", s: "dn", S: "dn" }[e.key]; if (k) keys[k] = false; }

  function onTap(e) {
    const r = cv.getBoundingClientRect();
    const wx = e.clientX - r.left + cam.x, wy = e.clientY - r.top + cam.y;
    for (const id in remotes) { const o = remotes[id]; if (Math.abs(wx - o.x) < 14 && wy < o.y + 4 && wy > o.y - 50) { if (opts.onRemoteTap) opts.onRemoteTap(id, o.name); return; } }
    const goal = { x: Math.floor(wx / T), y: Math.floor(wy / T) };
    me.path = path(tileOf(me), goal).map(centre);
    const end = me.path.length ? tileOf(me.path[me.path.length - 1]) : tileOf(me);
    if (opts.onMove) opts.onMove(end.x, end.y);
  }

  function stepAlong(o, dt) {
    if (!o.path || !o.path.length) { o.moving = false; return; }
    const tgt = o.path[0], dx = tgt.x - o.x, dy = tgt.y - o.y, d = Math.hypot(dx, dy), s = SPEED * dt;
    if (Math.abs(dx) > 0.5) o.face = dx < 0 ? -1 : 1;
    if (d <= s) { o.x = tgt.x; o.y = tgt.y; o.path.shift(); } else { o.x += dx / d * s; o.y += dy / d * s; }
    o.moving = true;
  }
  function keyMove(dt) {
    const vx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0), vy = (keys.dn ? 1 : 0) - (keys.u ? 1 : 0);
    if (!vx && !vy) { if (me._kb) { me._kb = false; const t = tileOf(me); if (opts.onMove) opts.onMove(t.x, t.y); } return false; }
    me.path = []; me._kb = true;
    const n = Math.hypot(vx, vy), s = SPEED * dt;
    const nx = me.x + vx / n * s, ny = me.y + vy / n * s;
    if (walk(Math.floor(nx / T), Math.floor(me.y / T))) me.x = nx;
    if (walk(Math.floor(me.x / T), Math.floor(ny / T))) me.y = ny;
    if (vx) me.face = vx < 0 ? -1 : 1;
    me.moving = true;
    const now = performance.now();
    if (now - (me._sent || 0) > 500) { me._sent = now; const t = tileOf(me); if (opts.onMove) opts.onMove(t.x, t.y); }
    return true;
  }

  // ── drawing ──
  const COL = { [ROAD]: "#2a2643", [SIDE]: "#4a4468", [PLAZA]: "#5c5480", [GRASS]: "#2f5b3e", [BLD]: "#000", [WATER]: "#1d4d6c", [TREE]: "#2f5b3e", [JETTY]: "#8a6a45" };
  function draw(time) {
    const W = cv.width / dpr, H = VIEW_H;
    cam.x = Math.max(0, Math.min(WPX - W, me.x - W / 2));
    cam.y = Math.max(0, Math.min(HPX - H, me.y - H / 2));
    if (WPX < W) cam.x = (WPX - W) / 2;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx.fillStyle = "#120f1f"; cx.fillRect(0, 0, W, H);
    cx.save(); cx.translate(-Math.round(cam.x), -Math.round(cam.y));
    const tx0 = Math.max(0, Math.floor(cam.x / T)), tx1 = Math.min(COLS - 1, Math.ceil((cam.x + W) / T)), ty0 = Math.max(0, Math.floor(cam.y / T)), ty1 = Math.min(ROWS - 1, Math.ceil((cam.y + H) / T));
    for (let y = ty0; y <= ty1; y++) for (let x = tx0; x <= tx1; x++) {
      const v = at(x, y); if (v === BLD) continue;
      cx.fillStyle = COL[v]; cx.fillRect(x * T, y * T, T, T);
      if (v === WATER && ((x * 7 + y * 3 + Math.floor(time / 600)) % 5 === 0)) { cx.fillStyle = "rgba(160,210,240,.25)"; cx.fillRect(x * T + 4, y * T + 10, 12, 2); }
      if (v === JETTY) { cx.fillStyle = "rgba(0,0,0,.25)"; cx.fillRect(x * T, y * T + T / 2, T, 1); }
    }
    // road lane markings
    cx.fillStyle = "rgba(244,165,43,.55)";
    HROADS.forEach(r => { for (let x = tx0; x <= tx1; x++) if (at(x, r) === ROAD && x % 2 === 0) cx.fillRect(x * T + 4, (r + 1) * T - 1, 12, 2); });
    VROADS.forEach(c => { for (let y = ty0; y <= ty1; y++) if (at(c, y) === ROAD && y % 2 === 0) cx.fillRect((c + 1) * T - 1, y * T + 4, 2, 12); });
    // buildings
    const hue = opts.hue || "#7b8cff";
    blds.forEach(b => {
      const x = b.x * T, y = b.y * T, w = b.w * T, h = b.h * T;
      if (x > cam.x + W || x + w < cam.x || y > cam.y + H || y + h < cam.y) return;
      cx.fillStyle = ["#3a3363", "#463c6e", "#33305a", "#4d4170"][b.tone]; cx.fillRect(x, y, w, h);
      cx.globalAlpha = b.big ? 0.5 : 0.22; cx.fillStyle = hue; cx.fillRect(x, y, w, h); cx.globalAlpha = 1;
      cx.fillStyle = "rgba(0,0,0,.35)"; cx.fillRect(x, y + h - 8, w, 8);
      cx.fillStyle = "rgba(255,214,140,.35)";
      for (let wy = y + 8; wy < y + h - 14; wy += 14) for (let wx = x + 6; wx < x + w - 8; wx += 12) cx.fillRect(wx, wy, 5, 6);
      if (b.big) { cx.fillStyle = "#1b1830"; cx.fillRect(x + w / 2 - 8, y + h - 12, 16, 12); }
    });
    trees.forEach(t => { const x = t.x * T + T / 2, y = t.y * T + T / 2; cx.fillStyle = "rgba(0,0,0,.3)"; cx.beginPath(); cx.ellipse(x + 3, y + 8, 10, 4, 0, 0, 6.3); cx.fill(); cx.fillStyle = "#3f8f55"; cx.beginPath(); cx.arc(x, y - 2, 11, 0, 6.3); cx.fill(); cx.fillStyle = "#57ad6c"; cx.beginPath(); cx.arc(x - 3, y - 5, 5, 0, 6.3); cx.fill(); });
    // notice board
    const nb = npcs.board; cx.fillStyle = "#8a6a45"; cx.fillRect(nb.x - 14, nb.y - 26, 28, 18); cx.fillStyle = "#f3efe6"; cx.fillRect(nb.x - 11, nb.y - 23, 9, 7); cx.fillRect(nb.x + 1, nb.y - 22, 9, 9); cx.fillStyle = "#5a4630"; cx.fillRect(nb.x - 2, nb.y - 8, 4, 10);
    // labels
    cx.font = "700 11px Mukta, system-ui, sans-serif"; cx.textAlign = "center"; cx.textBaseline = "middle";
    labels.forEach(l => { const x = l.x * T + T / 2, y = l.y * T; const w = cx.measureText(l.t).width + 12; cx.fillStyle = "rgba(18,15,31,.85)"; rr(x - w / 2, y - 9, w, 18, 6); cx.fill(); cx.strokeStyle = l.c; cx.lineWidth = 1; cx.stroke(); cx.fillStyle = l.c; cx.fillText(l.t, x, y + 1); });
    // figures sorted by y
    const figs = [me].concat(Object.values(remotes), ["m", "f", "v", "p"].map(r => npcs[r]).filter(Boolean)).sort((a, b) => a.y - b.y);
    figs.forEach(o => drawFig(o, time));
    // marker
    if (marker && npcs[marker]) { const n = npcs[marker], bob = Math.sin(time / 180) * 3, y = n.y - (n.board ? 44 : 64) + bob; cx.fillStyle = "#f4a52b"; cx.beginPath(); cx.arc(n.x, y, 10, 0, 6.3); cx.fill(); cx.fillStyle = "#1a1205"; cx.font = "900 13px Mukta, sans-serif"; cx.fillText("!", n.x, y + 1); }
    figs.forEach(o => drawBubble(o, time));
    cx.restore();
  }
  function rr(x, y, w, h, r) { cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function drawFig(o, time) {
    const img = avatarImg(o.av), h = 54, w = h * 120 / 220, bob = o.moving ? Math.sin(time / 90) * 1.5 : 0;
    cx.fillStyle = "rgba(0,0,0,.3)"; cx.beginPath(); cx.ellipse(o.x, o.y + 2, 9, 3.5, 0, 0, 6.3); cx.fill();
    if (img.complete && img.naturalWidth) {
      cx.save(); cx.translate(o.x, o.y - h + 4 + bob); if (o.face < 0) cx.scale(-1, 1);
      cx.drawImage(img, -w / 2, 0, w, h); cx.restore();
    }
    cx.font = "700 10px Mukta, sans-serif"; cx.textAlign = "center";
    const label = o.name || "", tw = cx.measureText(label).width + 8;
    cx.fillStyle = "rgba(12,10,24,.75)"; rr(o.x - tw / 2, o.y + 5, tw, 13, 5); cx.fill();
    cx.fillStyle = o.me ? "#f4a52b" : o.role ? "#f3efe6" : "#22b5a6"; cx.fillText(label, o.x, o.y + 12);
  }
  function wrap(text, max) {
    const words = String(text).split(" "), lines = []; let cur = "";
    words.forEach(w => { const t = cur ? cur + " " + w : w; if (cx.measureText(t).width > max && cur) { lines.push(cur); cur = w; } else cur = t; });
    if (cur) lines.push(cur); return lines.slice(0, 4);
  }
  function drawBubble(o, time) {
    if (!o.bubble || time > o.bubble.until) return;
    cx.font = "600 11px Mukta, sans-serif";
    const main = wrap(o.bubble.t, 150); cx.font = "400 10px Mukta, sans-serif"; const sub = o.bubble.s ? wrap(o.bubble.s, 150) : [];
    cx.font = "600 11px Mukta, sans-serif";
    const w = Math.max(...main.map(l => cx.measureText(l).width), ...sub.map(l => cx.measureText(l).width * 0.92), 20) + 14;
    const h = main.length * 13 + sub.length * 12 + 10, x = o.x - w / 2, y = o.y - 62 - h;
    cx.fillStyle = o.typed ? "#e7f6f4" : "#f3efe6"; rr(x, y, w, h, 8); cx.fill();
    cx.beginPath(); cx.moveTo(o.x - 5, y + h); cx.lineTo(o.x, y + h + 6); cx.lineTo(o.x + 5, y + h); cx.fill();
    cx.fillStyle = "#120f1f"; main.forEach((l, i) => cx.fillText(l, o.x, y + 11 + i * 13));
    cx.font = "400 10px Mukta, sans-serif"; cx.fillStyle = "#4a4566"; sub.forEach((l, i) => cx.fillText(l, o.x, y + 11 + main.length * 13 + i * 12));
  }

  function tick(time) {
    const dt = Math.min(0.05, (time - last) / 1000); last = time;
    if (!keyMove(dt)) stepAlong(me, dt);
    Object.values(remotes).forEach(o => stepAlong(o, dt));
    if (el && el.isConnected) draw(time);
    let near = null, best = 1e9;
    ["m", "f", "v", "p"].forEach(r => { const n = npcs[r]; if (!n) return; const d = Math.hypot(n.x - me.x, n.y - me.y); if (d < T * 1.8 && d < best) { best = d; near = r; } });
    if (near !== nearRole) { nearRole = near; nearBtn.hidden = !near; if (near) nearBtn.textContent = "Talk to " + opts.cast[near]; }
    if (marker && npcs[marker] && Math.hypot(npcs[marker].x - me.x, npcs[marker].y - me.y) < T * 1.4) { const m = marker; marker = null; if (opts.onReach) opts.onReach(m); }
    raf = requestAnimationFrame(tick);
  }

  // ── public API ──
  function setMarker(role) { marker = role; }
  const SHOW = 4800;
  function npcSay(role, t, s) { if (npcs[role]) npcs[role].bubble = { t, s, until: performance.now() + SHOW + 1500 }; }
  function meSay(t, typed) { me.bubble = { t, until: performance.now() + SHOW }; me.typed = !!typed; log(me.name, t); }
  function upsertRemote(id, d) {
    if (remotes[id]) return;
    const t = nearestWalk({ x: d.x, y: d.y }) || { x: 8, y: 18 };
    remotes[id] = Object.assign(centre(t), { id, name: d.nick, av: d.av, path: [], face: 1 });
  }
  function moveRemote(id, x, y) { const o = remotes[id]; if (o) o.path = path(tileOf(o), { x, y }).map(centre); }
  function sayRemote(id, t, typed) {
    const o = remotes[id]; if (!o) return false;
    if (Math.hypot(o.x - me.x, o.y - me.y) > T * 14) return false; // only players near you
    o.bubble = { t, until: performance.now() + SHOW }; o.typed = !!typed; log(o.name, t);
    return true;
  }
  function log(name, t) {
    if (!logEl) return;
    const p = document.createElement("p"); p.innerHTML = `<b>${esc(name)}:</b> ${esc(t)}`;
    logEl.appendChild(p); while (logEl.children.length > 4) logEl.firstChild.remove();
    clearTimeout(log._t); logEl.hidden = false; log._t = setTimeout(() => { logEl.hidden = true; }, 12000);
  }
  function note(t) { log("Chat", t); }
  function removeRemote(id) { delete remotes[id]; }
  function clearRemotes() { remotes = {}; }
  function setOnline(n, phrases, emotes, canType) {
    if (!el) return;
    const on = el.querySelector(".w-online");
    if (n == null) { on.hidden = true; el.querySelector(".say").hidden = true; el.querySelector(".chat").hidden = true; return; }
    on.hidden = false; on.textContent = n === 1 ? "Only you in this city" : n + " players in this city";
    el.querySelector(".say").hidden = false; el.querySelector(".chat").hidden = !canType;
    el.querySelector(".say-panel").innerHTML = phrases.map((p, i) => `<button data-kind="p" data-say="${i}">${esc(p)}</button>`).join("") + `<div class="emo">${emotes.map((p, i) => `<button data-kind="e" data-say="${i}">${esc(p)}</button>`).join("")}</div>`;
  }
  function position() { return tileOf(me); }
  function destroy() { cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("resize", resize); if (el) el.remove(); el = null; remotes = {}; }

  return { note, mount, setMarker, npcSay, meSay, upsertRemote, moveRemote, sayRemote, removeRemote, clearRemotes, setOnline, position, destroy, COLS, ROWS };
})();
