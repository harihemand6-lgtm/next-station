// Walkable street scene. Tap (or use arrow keys) to walk; walk up to characters to talk or start the next scene.
// Remote players (from net.js) are drawn here too. The scene element persists across screen re-renders.
window.AE_WORLD = (function () {
  const AV = window.AE_AVATAR;
  const W = 1500, H = 270, BAND_TOP = 168, BAND_BOT = 250, SPEED = 170;
  const LANDMARK = {
    street: "{stall}", job: "Brightline Systems", govt: "Coaching Centre", creator: "Café", startup: "Co-working Space",
    craft: "Weavers' Workshop", film: "Studio Gate", cricket: "Cricket Ground", reality: "Spotlight House", trader: "Wi-Fi Café"
  };
  const CITY_SPOT = { KL: "Ferry Jetty", MH: "Dadar Station", PB: "Clock Tower Chowk", WB: "Tram Depot", RJ: "Pink City Gate", KA: "Darshini" };
  const SPOTS = { m: { x: 470, y: 205, sign: "life" }, f: { x: 260, y: 225, sign: null }, v: { x: 1010, y: 200, sign: "rival" }, p: { x: 1330, y: 215, sign: "home" }, board: { x: 760, y: 190, sign: "board" } };

  let el, scene, cam = 0, me, npcs = {}, remotes = {}, raf = 0, last = 0, opts = {}, nearRole = null, marker = null, keys = {}, nearBtn, sayPanel;

  function hashNum(s) { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function backdrop(stateId, lifeId, hue, words) {
    const R = rng(hashNum(stateId + lifeId));
    let b = "";
    let x = 0;
    while (x < W) {
      const w = 90 + Math.floor(R() * 90), h = 70 + Math.floor(R() * 90);
      const tone = Math.floor(R() * 3);
      b += `<div class="bld t${tone}" style="left:${x}px;width:${w}px;height:${h}px;--h:${hue}"></div>`;
      x += w + 6 + Math.floor(R() * 14);
    }
    const sign = (x, label, cls) => `<div class="sign ${cls || ""}" style="left:${x}px">${esc(label)}</div>`;
    b += sign(SPOTS.m.x - 60, (LANDMARK[lifeId] || "Market").replace("{stall}", words.stall));
    b += sign(SPOTS.board.x - 50, "Notice Board", "board");
    b += sign(SPOTS.v.x - 50, words.v + "'s place", "rival");
    b += sign(SPOTS.p.x - 40, "Home", "home");
    b += sign(80, CITY_SPOT[stateId] || words.city, "city");
    return `<div class="sky" style="--h:${hue}"></div><div class="skyline">${b}</div><div class="road"></div><div class="walk"></div>`;
  }

  function figure(id, av, label, cls) {
    const d = document.createElement("div");
    d.className = "fig " + (cls || "");
    d.dataset.id = id;
    d.innerHTML = `<div class="bubble-s" hidden></div><div class="body">${AV.svg(av, 44)}</div><span class="nm">${esc(label)}</span>`;
    scene.appendChild(d);
    return d;
  }
  function npcFigure(role, name) {
    const d = document.createElement("div");
    d.className = "fig npc";
    d.dataset.role = role;
    d.innerHTML = `<div class="mark" hidden>!</div><div class="bubble-s" hidden></div><div class="npc-body"><span class="init" data-role="${role}">${esc(name[0])}</span></div><span class="nm">${esc(name)}</span>`;
    scene.appendChild(d);
    return d;
  }
  function place(o) {
    const s = 0.82 + (o.y - BAND_TOP) / (BAND_BOT - BAND_TOP) * 0.3;
    o.el.style.transform = `translate(${o.x - 22}px, ${o.y - 96 + (o.bob || 0)}px) scale(${s})`;
    o.el.style.zIndex = String(Math.round(o.y));
    const body = o.el.querySelector(".body");
    if (body) body.style.transform = o.face < 0 ? "scaleX(-1)" : "";
  }

  function mount(slot, o) {
    opts = o;
    if (!el || el.dataset.key !== o.key) {
      if (el) destroy();
      el = document.createElement("section");
      el.className = "world";
      el.dataset.key = o.key;
      el.setAttribute("aria-label", "Street. Tap to walk.");
      el.innerHTML = `<div class="viewport"><div class="scene" style="width:${W}px;height:${H}px">${backdrop(o.stateId, o.lifeId, o.hue, o.words)}</div></div>
        <div class="w-ui"><button class="w-btn near" hidden></button><button class="w-btn say" hidden>Say…</button><span class="w-online" hidden></span></div>
        <div class="say-panel" hidden></div>
        <p class="w-hint">Tap the street to walk. Walk up to someone to talk.</p>`;
      scene = el.querySelector(".scene");
      nearBtn = el.querySelector(".near");
      sayPanel = el.querySelector(".say-panel");
      me = { x: 120, y: 220, tx: 120, ty: 220, face: 1, el: figure("me", o.avatar, o.meLabel || "You", "me") };
      npcs = {};
      ["m", "f", "v", "p"].forEach(r => { const sp = SPOTS[r]; npcs[r] = { x: sp.x, y: sp.y, el: npcFigure(r, o.cast[r]) }; place(npcs[r]); });
      const boardMark = document.createElement("div");
      boardMark.className = "fig board-fig";
      boardMark.innerHTML = `<div class="mark" hidden>!</div>`;
      scene.appendChild(boardMark);
      npcs.board = { x: SPOTS.board.x, y: SPOTS.board.y, el: boardMark }; place(npcs.board);
      place(me);
      el.querySelector(".viewport").addEventListener("pointerdown", onTap);
      nearBtn.addEventListener("click", () => { if (nearRole && opts.onTalk) opts.onTalk(nearRole); });
      el.querySelector(".say").addEventListener("click", () => { sayPanel.hidden = !sayPanel.hidden; });
      sayPanel.addEventListener("click", e => { const b = e.target.closest("[data-say]"); if (!b) return; sayPanel.hidden = true; if (opts.onSay) opts.onSay(b.dataset.kind, +b.dataset.say); });
      window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
      last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    }
    slot.appendChild(el);
    follow(true);
    return el;
  }
  function kd(e) { if (!el || !el.isConnected) return; if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].indexOf(e.key) >= 0 && !/input|textarea/i.test(document.activeElement.tagName)) { keys[e.key] = true; e.preventDefault(); } }
  function ku(e) { keys[e.key] = false; }

  function onTap(e) {
    if (e.target.closest(".w-btn,.say-panel")) return;
    const r = scene.getBoundingClientRect();
    const sx = r.width / W;
    const x = Math.max(20, Math.min(W - 20, (e.clientX - r.left) / sx));
    const y = Math.max(BAND_TOP, Math.min(BAND_BOT, (e.clientY - r.top) / sx));
    walkTo(x, y, true);
  }
  function walkTo(x, y, send) {
    me.tx = x; me.ty = y;
    if (send && opts.onMove) opts.onMove(Math.round(x), Math.round(y));
  }

  function step(o, dt) {
    const dx = o.tx - o.x, dy = o.ty - o.y, d = Math.hypot(dx, dy);
    if (d < 2) { o.bob = 0; return false; }
    const s = Math.min(d, SPEED * dt);
    o.x += dx / d * s; o.y += dy / d * s;
    if (Math.abs(dx) > 1) o.face = dx < 0 ? -1 : 1;
    o.ph = (o.ph || 0) + dt * 12; o.bob = Math.sin(o.ph) * 2;
    return true;
  }
  function follow(snap) {
    if (!el) return;
    const vw = el.querySelector(".viewport").clientWidth || 360;
    const sx = Math.min(1, (el.querySelector(".viewport").clientHeight || H) / H);
    const target = Math.max(0, Math.min(W - vw / sx, me.x - vw / sx / 2));
    cam = snap ? target : cam + (target - cam) * 0.12;
    scene.style.transform = `scale(${sx}) translateX(${-cam}px)`;
  }

  function tick(t) {
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (keys.ArrowLeft || keys.ArrowRight || keys.ArrowUp || keys.ArrowDown) {
      const nx = me.x + (keys.ArrowRight ? 40 : 0) - (keys.ArrowLeft ? 40 : 0), ny = me.y + (keys.ArrowDown ? 25 : 0) - (keys.ArrowUp ? 25 : 0);
      walkTo(Math.max(20, Math.min(W - 20, nx)), Math.max(BAND_TOP, Math.min(BAND_BOT, ny)), false);
      me._keyMoved = true;
    } else if (me._keyMoved) { me._keyMoved = false; if (opts.onMove) opts.onMove(Math.round(me.tx), Math.round(me.ty)); }
    if (step(me, dt) || me.bob) place(me);
    Object.values(remotes).forEach(o => { if (step(o, dt) || o.bob) place(o); });
    follow(false);
    // proximity
    let near = null, best = 1e9;
    ["m", "f", "v", "p"].forEach(r => { const n = npcs[r]; const d = Math.hypot(n.x - me.x, (n.y - me.y) * 1.4); if (d < 85 && d < best) { best = d; near = r; } });
    if (near !== nearRole) {
      nearRole = near;
      nearBtn.hidden = !near;
      if (near) nearBtn.textContent = "Talk to " + opts.cast[near];
    }
    if (marker && npcs[marker]) {
      const n = npcs[marker];
      if (Math.hypot(n.x - me.x, (n.y - me.y) * 1.4) < 70) { const m = marker; setMarker(null); if (opts.onReach) opts.onReach(m); }
    }
    raf = requestAnimationFrame(tick);
  }

  function setMarker(role) {
    marker = role;
    Object.keys(npcs).forEach(r => { const m = npcs[r].el.querySelector(".mark"); if (m) m.hidden = r !== role; });
  }
  function bubble(o, text, sub) {
    const b = o.el.querySelector(".bubble-s");
    if (!b) return;
    b.innerHTML = esc(text) + (sub ? `<small>${esc(sub)}</small>` : "");
    b.hidden = false;
    clearTimeout(o._bt); o._bt = setTimeout(() => { b.hidden = true; }, 4500);
  }
  function npcSay(role, text, sub) { if (npcs[role]) bubble(npcs[role], text, sub); }
  function meSay(text) { bubble(me, text); }

  function upsertRemote(id, data) {
    let o = remotes[id];
    if (!o) {
      o = remotes[id] = { x: data.x, y: data.y, tx: data.x, ty: data.y, face: 1, el: figure(id, data.av, data.nick, "remote") };
      o.el.addEventListener("click", ev => { ev.stopPropagation(); if (opts.onRemoteTap) opts.onRemoteTap(id, data.nick); });
      o.el.addEventListener("pointerdown", ev => ev.stopPropagation());
    }
    place(o);
  }
  function moveRemote(id, x, y) { const o = remotes[id]; if (o) { o.tx = x; o.ty = y; } }
  function sayRemote(id, text) { const o = remotes[id]; if (o) bubble(o, text); }
  function removeRemote(id) { const o = remotes[id]; if (o) { o.el.remove(); delete remotes[id]; } }
  function clearRemotes() { Object.keys(remotes).forEach(removeRemote); }
  function setOnline(n, phrases, emotes) {
    if (!el) return;
    const on = el.querySelector(".w-online"), sb = el.querySelector(".say");
    if (n == null) { on.hidden = true; sb.hidden = true; return; }
    on.hidden = false; on.textContent = n === 1 ? "Only you on this street" : n + " players on this street";
    sb.hidden = false;
    sayPanel.innerHTML = phrases.map((p, i) => `<button data-kind="p" data-say="${i}">${esc(p)}</button>`).join("") + `<div class="emo">${emotes.map((p, i) => `<button data-kind="e" data-say="${i}">${esc(p)}</button>`).join("")}</div>`;
  }
  function position() { return { x: Math.round(me.tx), y: Math.round(me.ty) }; }
  function destroy() { cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); if (el) el.remove(); el = null; remotes = {}; }

  return { mount, setMarker, npcSay, meSay, upsertRemote, moveRemote, sayRemote, removeRemote, clearRemotes, setOnline, position, destroy, W, BAND_TOP, BAND_BOT };
})();
