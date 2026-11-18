// FXN Arcade: four quick FXN-themed mini-games with a premium lobby.
// Self-contained overlay. The app passes in money scaling, paid-play limits and a payout callback.
window.AE_ARCADE = (function () {
  "use strict";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const SND = () => window.AE_SOUND || { sfx() {} };
  const GAMES = [
    { id: "style", icon: "👗", name: "Style Match", blurb: "A client needs a look. Pick the right outfit before the timer runs out.", target: 1200 },
    { id: "pack", icon: "📦", name: "Pack Rush", blurb: "Memorise the order slip, then pack the items in the right order.", target: 700 },
    { id: "dash", icon: "🛵", name: "Delivery Dash", blurb: "Weave through Kochi traffic and grab every pink FXN box.", target: 520 },
    { id: "drone", icon: "🚁", name: "Drone Drop", blurb: "Kochi 2030: drop the parcel on the glowing balcony pad.", target: 900 }
  ];
  const BRIEFS = {
    onam: ["Onam sadya at the tharavad", "Pookalam contest at the Town Hall"],
    festival: ["Vishu family lunch", "Diwali party at a friend's flat", "Temple festival evening"],
    wedding: ["Cousin's wedding reception", "Engagement at a Marine Drive hall"],
    formal: ["Annual day at Infopark", "Bank interview on MG Road", "Client pitch in a glass tower"],
    party: ["College fest night", "Rooftop party at Panampilly Nagar"],
    premiere: ["Movie premiere at Lulu", "Fashion week front row"],
    sport: ["Sunday cricket at the maidan", "Corporate cricket league"]
  };
  const TIPS = [
    ["Wear the moment.", "Kasavu for Onam, a sherwani for the reception: rent it, wear it, send it back."],
    ["Delivered in 10–50 minutes.", "FXN dark stores keep the looks close, so the outfit arrives before the auto does."],
    ["Never repeat a look.", "One closet for every function in the calendar, and nothing left to dry-clean after."],
    ["Premium, without the price tag.", "Designer lehengas and bandhgalas for a fraction of the buy price."],
    ["Made in Kochi.", "FXN India is a fashion-rental startup from Kerala. This game is our love letter to the city."]
  ];
  let root = null, O = {}, raf = 0, timers = [], keyH = null, cur = null;

  // ---------- small helpers ----------
  const R = (a, b) => a + Math.random() * (b - a);
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const inr = n => "₹" + Math.round(n).toLocaleString("en-IN");
  function stopAll() { cancelAnimationFrame(raf); raf = 0; timers.forEach(clearInterval); timers.forEach(clearTimeout); timers = []; if (keyH) { window.removeEventListener("keydown", keyH); keyH = null; } }
  function best(id) { try { return +(localStorage.getItem("ns.arc." + id) || 0); } catch (e) { return 0; } }
  function setBest(id, v) { try { if (v > best(id)) localStorage.setItem("ns.arc." + id, v); } catch (e) {} }
  // a little mannequin wearing a catalogue look
  function fig(look, size) {
    const L = look || {}, top = L.top || "#888", bot = L.bottom || "#333", trim = L.trim || top, st = L.style || "tee";
    const long = ["saree", "lehenga", "gown", "mundu"].indexOf(st) >= 0, kurta = st === "kurta";
    let s = `<svg viewBox="0 0 60 92" width="${size || 54}" height="${(size || 54) * 92 / 60}" aria-hidden="true"><ellipse cx="30" cy="89" rx="16" ry="2.5" fill="rgba(0,0,0,.25)"/>`;
    s += `<circle cx="30" cy="13" r="7.5" fill="#c68c5e"/><path d="M22.5 12a7.5 7.5 0 0 1 15 0c0-6-15-6-15 0z" fill="#1d1612"/>`;
    s += `<rect x="27" y="20" width="6" height="4" fill="#b57b50"/>`;
    if (long) {
      const flare = st === "lehenga" || st === "gown" ? 15 : st === "mundu" ? 9 : 11;
      s += `<path d="M${30 - 9} 47 L${30 - flare} 86 L${30 + flare} 86 L${30 + 9} 47z" fill="${bot}"/><rect x="${30 - flare}" y="82" width="${flare * 2}" height="4" fill="${trim}"/>`;
    } else {
      s += `<rect x="21.5" y="${kurta ? 60 : 47}" width="7.5" height="${kurta ? 26 : 39}" rx="2" fill="${bot}"/><rect x="31" y="${kurta ? 60 : 47}" width="7.5" height="${kurta ? 26 : 39}" rx="2" fill="${bot}"/>`;
    }
    s += `<path d="M19 26 Q30 21 41 26 L${kurta ? 42 : 40} ${kurta ? 62 : 49} L${kurta ? 18 : 20} ${kurta ? 62 : 49}z" fill="${top}"/>`;
    s += `<rect x="13" y="26" width="6" height="20" rx="3" fill="${top}"/><rect x="41" y="26" width="6" height="20" rx="3" fill="${top}"/>`;
    if (st === "saree") s += `<path d="M37 25 L41 27 L24 56 L20 53z" fill="${trim}" opacity=".9"/>`;
    if (st === "suit") s += `<path d="M27 24 L30 36 L33 24" fill="none" stroke="${trim}" stroke-width="2"/>`;
    if (kurta || st === "shirt") s += `<rect x="29" y="25" width="2" height="${kurta ? 34 : 22}" fill="${trim}"/>`;
    if (st === "sport") s += `<rect x="20" y="36" width="20" height="3" fill="${trim}"/>`;
    return s + `</svg>`;
  }

  // ---------- shell ----------
  function open(o) {
    O = o || {}; close(true);
    root = document.createElement("div"); root.className = "arc"; root.setAttribute("role", "dialog"); root.setAttribute("aria-label", "FXN Arcade");
    document.body.appendChild(root);
    root.addEventListener("click", onClick);
    lobby(); SND().sfx("open");
  }
  function close(silent) {
    stopAll(); cur = null;
    if (root) { root.remove(); root = null; if (!silent && O.onClose) O.onClose(); }
  }
  function onClick(e) {
    const b = e.target.closest("[data-a]"); if (!b) return;
    const a = b.dataset.a, v = b.dataset.v;
    if (a === "close") { SND().sfx("click"); return close(); }
    if (a === "lobby") { SND().sfx("click"); stopAll(); return lobby(); }
    if (a === "play") { SND().sfx("click"); return start(v); }
    if (a === "rent") { SND().sfx("click"); close(true); if (O.onRent) O.onRent(); return; }
    if (cur && cur.click) cur.click(a, v, b);
  }
  function lobby() {
    stopAll(); cur = null;
    const picks = (O.picks || []).slice(0, 3);
    root.innerHTML = `<div class="arc-in">
      <div class="arc-top"><span class="arc-tag">FXN ARCADE</span><button class="arc-x" data-a="close" aria-label="Close">✕</button></div>
      <div class="arc-hero"><div class="arc-sheen"></div><b class="arc-logo">FXN</b><h2>Wear the moment.</h2><p>Kochi's fashion rental · delivered in 10–50 minutes</p>
        <div class="arc-hfig">${picks.map(p => fig(p.look, 44)).join("")}</div></div>
      <h3 class="arc-h">Play and earn</h3>
      <div class="arc-games">${GAMES.map(G => { const left = O.paidLeft ? O.paidLeft(G.id) : 0, top = O.money ? O.money(250) : 250;
        return `<button class="arc-game" data-a="play" data-v="${G.id}"><span class="arc-gi">${G.icon}</span><b>${G.name}</b><small>${esc(G.blurb)}</small><span class="arc-pay">${left > 0 ? "Up to " + inr(top) + " · " + left + " paid " + (left === 1 ? "play" : "plays") + " left today" : "High-score mode today"}</span>${best(G.id) ? `<span class="arc-best">Best ${best(G.id)}</span>` : ""}</button>`; }).join("")}</div>
      ${picks.length ? `<h3 class="arc-h">FXN picks this week</h3><div class="arc-picks">${picks.map(p => `<div class="arc-pick">${fig(p.look, 46)}<div><b>${esc(p.name)}</b><span>${esc(p.price)} to rent</span></div></div>`).join("")}</div>
      <button class="arc-cta" data-a="rent">Open the FXN app</button>` : ""}
      <p class="arc-disc">Presented by FXN India, a real fashion-rental startup from Kochi. In-game prices and pay are for fun.</p></div>`;
  }
  function frame(G, inner) {
    root.innerHTML = `<div class="arc-in play"><div class="arc-top"><button class="arc-back" data-a="lobby" aria-label="Back to arcade">‹ Arcade</button><span class="arc-tag">${G.icon} ${esc(G.name)}</span><span class="arc-score" id="arc-s">0</span></div>${inner}</div>`;
  }
  function setScore(v) { const s = root && root.querySelector("#arc-s"); if (s) { s.textContent = v; s.classList.remove("bump"); void s.offsetWidth; s.classList.add("bump"); } }
  function start(id) {
    stopAll(); const G = GAMES.find(g => g.id === id); if (!G) return;
    ({ style: styleGame, pack: packGame, dash: dashGame, drone: droneGame })[id](G);
  }
  function finish(G, score, line) {
    stopAll(); cur = null;
    const prev = best(G.id); setBest(G.id, score);
    const frac = Math.max(0, Math.min(1, score / G.target));
    const pay = O.onPay ? O.onPay(G.id, score, frac) : 0;
    const tip = pick(TIPS);
    SND().sfx(pay > 0 ? "payday" : score > prev ? "goal" : "notify");
    root.innerHTML = `<div class="arc-in"><div class="arc-top"><span class="arc-tag">${G.icon} ${esc(G.name)}</span><button class="arc-x" data-a="close" aria-label="Close">✕</button></div>
      <div class="arc-res"><span class="arc-big">${score}</span><p>${esc(line || "")}</p>
      ${score > prev && prev ? `<span class="arc-new">New best!</span>` : ""}
      <p class="arc-earn">${pay > 0 ? "You earned <b>" + inr(pay) + "</b>" : (O.paidLeft && O.paidLeft(G.id) <= 0 ? "Paid plays for today are used up. Playing for the high score." : "Score higher to earn cash.")}</p>
      <div class="arc-bar"><i style="width:${Math.round(frac * 100)}%"></i></div></div>
      <div class="arc-tip"><b>${esc(tip[0])}</b><span>${esc(tip[1])}</span></div>
      <div class="arc-row"><button class="arc-cta" data-a="play" data-v="${G.id}">Play again</button><button class="arc-ghost" data-a="lobby">All games</button></div></div>`;
  }

  // ---------- 1. Style Match ----------
  function styleGame(G) {
    const cat = (window.AE_FXN && AE_FXN.catalogue) || [];
    const tags = Object.keys(BRIEFS).filter(t => cat.some(it => it.tags.indexOf(t) >= 0));
    let round = 0, score = 0, streak = 0, t0 = 0, R0 = null, lock = false;
    const N = 8, SECS = 5;
    function next() {
      if (round >= N) return finish(G, score, streak >= 3 ? "Stylist on a streak!" : "Every client went home happy.");
      const tag = pick(tags), right = pick(cat.filter(it => it.tags.indexOf(tag) >= 0));
      const wrong = shuffle(cat.filter(it => it.tags.indexOf(tag) < 0)).slice(0, 2);
      R0 = { tag, right: right.id, opts: shuffle([right].concat(wrong)) }; lock = false;
      frame(G, `<div class="sm-brief"><span>Client ${round + 1} of ${N}</span><b>${esc(pick(BRIEFS[tag]))}</b><small>Which look should they rent?</small></div>
        <div class="arc-timer"><i id="sm-t"></i></div>
        <div class="sm-opts">${R0.opts.map(it => `<button class="sm-opt" data-a="smpick" data-v="${it.id}">${fig(it.look, 58)}<b>${esc(it.name)}</b></button>`).join("")}</div>
        <p class="arc-hint">${streak >= 2 ? "🔥 Streak x" + streak : "Faster picks score more"}</p>`);
      setScore(score); t0 = performance.now();
      const tm = setInterval(() => { const left = 1 - (performance.now() - t0) / (SECS * 1000), el = root && root.querySelector("#sm-t"); if (el) el.style.width = Math.max(0, left * 100) + "%"; if (left <= 0) { clearInterval(tm); answer(null); } }, 50);
      timers.push(tm);
    }
    function answer(id) {
      if (lock) return; lock = true; timers.forEach(clearInterval); timers = [];
      const ok = id === R0.right;
      root.querySelectorAll(".sm-opt").forEach(b => { if (b.dataset.v === R0.right) b.classList.add("ok"); else if (b.dataset.v === id) b.classList.add("bad"); });
      if (ok) { streak++; const left = Math.max(0, 1 - (performance.now() - t0) / (SECS * 1000)); score += Math.round(100 + left * 60) + (streak >= 3 ? 25 : 0); SND().sfx("coin"); }
      else { streak = 0; SND().sfx("error"); }
      setScore(score); round++;
      timers.push(setTimeout(next, ok ? 550 : 1000));
    }
    cur = { click: (a, v) => { if (a === "smpick") answer(v); } };
    next();
  }

  // ---------- 2. Pack Rush ----------
  function packGame(G) {
    const ITEMS = [["🥻", "Saree"], ["👔", "Shirt"], ["👗", "Gown"], ["👟", "Sneakers"], ["👜", "Clutch"], ["💍", "Ring"], ["🕶️", "Shades"], ["🧣", "Shawl"], ["👠", "Heels"]];
    let n = 3, lives = 3, score = 0, slip = [], step = 0, phase = "show", tEnd = performance.now() + 50000;
    function round() {
      if (lives <= 0 || performance.now() > tEnd) return finish(G, score, score >= 500 ? "Packing pro. The riders love you." : "Orders out the door!");
      slip = shuffle(ITEMS.map((_, i) => i)).slice(0, n); step = 0; phase = "show";
      frame(G, `<div class="pk-head"><span>${"❤️".repeat(lives)}${"🤍".repeat(3 - lives)}</span><span id="pk-time"></span></div>
        <div class="pk-slip" id="pk-slip"><small>ORDER #${Math.floor(R(1000, 9999))} · memorise</small><div>${slip.map(i => `<span>${ITEMS[i][0]}</span>`).join("")}</div></div>
        <div class="pk-box" id="pk-box">${slip.map(() => `<i></i>`).join("")}</div>
        <div class="pk-grid">${ITEMS.map((it, i) => `<button class="pk-it" data-a="pk" data-v="${i}" disabled><span>${it[0]}</span><small>${it[1]}</small></button>`).join("")}</div>`);
      setScore(score);
      const tick = setInterval(() => { const el = root && root.querySelector("#pk-time"); const s = Math.max(0, Math.ceil((tEnd - performance.now()) / 1000)); if (el) el.textContent = "⏱ " + s + "s"; if (s <= 0 && phase === "pack") { clearInterval(tick); round(); } }, 250);
      timers.push(tick);
      timers.push(setTimeout(() => { phase = "pack"; const s = root && root.querySelector("#pk-slip"); if (s) s.classList.add("hide"); root.querySelectorAll(".pk-it").forEach(b => b.disabled = false); }, 1300 + n * 450));
    }
    function tap(i, b) {
      if (phase !== "pack") return;
      if (+i === slip[step]) {
        step++; score += 10 * n; SND().sfx("click"); b.classList.add("ok"); setTimeout(() => b.classList.remove("ok"), 250);
        const box = root.querySelectorAll("#pk-box i")[step - 1]; if (box) box.textContent = ITEMS[i][0];
        setScore(score);
        if (step >= slip.length) { phase = "done"; score += 30; SND().sfx("coin"); n = Math.min(7, n + 1); timers.forEach(clearInterval); timers = []; timers.push(setTimeout(round, 500)); }
      } else {
        lives--; SND().sfx("error"); b.classList.add("bad"); root.querySelector(".pk-grid").classList.add("shake"); phase = "done";
        timers.forEach(clearInterval); timers = []; n = Math.max(3, n - 1); timers.push(setTimeout(round, 800));
      }
    }
    cur = { click: (a, v, b) => { if (a === "pk") tap(v, b); } };
    round();
  }

  // ---------- canvas helper ----------
  function canvasFrame(G, hint) {
    frame(G, `<div class="arc-cv"><canvas width="360" height="520"></canvas><div class="arc-cvhud" id="cv-hud"></div><div class="arc-go" id="cv-go"><b>Ready?</b><span>${esc(hint)}</span><button class="arc-cta" data-a="go">Start</button></div></div>`);
    const cv = root.querySelector("canvas"); return { cv, ctx: cv.getContext("2d") };
  }
  function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function fxnBox(c, x, y, s) {
    c.save(); c.translate(x, y);
    c.fillStyle = "#ff3d8b"; rr(c, -s / 2, -s / 2, s, s, s * 0.18); c.fill();
    c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(-s / 2, -s * 0.08, s, s * 0.16);
    c.fillStyle = "#fff"; c.font = `800 ${Math.round(s * 0.36)}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText("FXN", 0, 1);
    c.restore();
  }

  // ---------- 3. Delivery Dash ----------
  function dashGame(G) {
    const { cv, ctx: c } = canvasFrame(G, "Tap left or right (or swipe / arrow keys) to change lanes. Grab pink boxes, dodge autos, potholes and cows.");
    const LX = [105, 180, 255], PY = 440, DUR = 40;
    let lane = 1, px = LX[1], objs = [], t = 0, last = 0, spawn = 0, scroll = 0, lives = 3, boxes = 0, inv = 0, run = false, dist = 0, flash = 0;
    function move(d) { if (!run) return; lane = Math.max(0, Math.min(2, lane + d)); SND().sfx("step"); }
    function draw() {
      // road and roadside
      c.fillStyle = "#4f8f4a"; c.fillRect(0, 0, 360, 520);
      c.fillStyle = "#d9c9a8"; c.fillRect(48, 0, 264, 520);
      c.fillStyle = "#3a3d45"; c.fillRect(62, 0, 236, 520);
      c.fillStyle = "rgba(255,255,255,.75)"; for (let y = -40 + (scroll % 60); y < 520; y += 60) { c.fillRect(141, y, 4, 30); c.fillRect(216, y, 4, 30); }
      for (let i = 0; i < 6; i++) { const y = ((i * 100 + scroll * 1) % 600) - 60; [22, 338].forEach(x => { c.fillStyle = "#6b4a2b"; c.fillRect(x - 2, y, 4, 22); c.fillStyle = "#2f7a3a"; c.beginPath(); c.arc(x, y, 14, 0, 7); c.fill(); c.fillStyle = "#3f9b4a"; c.beginPath(); c.arc(x - 4, y - 4, 8, 0, 7); c.fill(); }); }
      objs.forEach(o => {
        if (o.k === "box") fxnBox(c, o.x, o.y, 30);
        else if (o.k === "pot") { c.fillStyle = "#1c1c20"; c.beginPath(); c.ellipse(o.x, o.y, 24, 11, 0, 0, 7); c.fill(); c.strokeStyle = "#5a5a60"; c.lineWidth = 2; c.stroke(); }
        else if (o.k === "auto") { c.fillStyle = "#1b1b1b"; rr(c, o.x - 19, o.y - 30, 38, 60, 10); c.fill(); c.fillStyle = "#2fae5a"; rr(c, o.x - 17, o.y - 6, 34, 34, 8); c.fill(); c.fillStyle = "#f4c21b"; rr(c, o.x - 17, o.y - 28, 34, 24, 10); c.fill(); c.fillStyle = "#9fd3ff"; c.fillRect(o.x - 12, o.y + 18, 24, 6); }
        else if (o.k === "cow") { c.fillStyle = "#f2efe8"; c.beginPath(); c.ellipse(o.x, o.y, 15, 26, 0, 0, 7); c.fill(); c.fillStyle = "#5b4636"; c.beginPath(); c.arc(o.x + 4, o.y - 4, 6, 0, 7); c.fill(); c.fillStyle = "#e9e3d6"; c.beginPath(); c.arc(o.x, o.y + 26, 8, 0, 7); c.fill(); c.fillStyle = "#c9a26b"; c.fillRect(o.x - 9, o.y + 20, 3, 6); c.fillRect(o.x + 6, o.y + 20, 3, 6); }
      });
      // rider
      if (!(inv > 0 && Math.floor(inv * 10) % 2)) {
        c.fillStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.ellipse(px, PY + 26, 18, 6, 0, 0, 7); c.fill();
        c.fillStyle = "#222"; rr(c, px - 5, PY - 30, 10, 18, 4); c.fill(); rr(c, px - 5, PY + 14, 10, 18, 4); c.fill();
        c.fillStyle = "#ff3d8b"; rr(c, px - 13, PY - 16, 26, 38, 9); c.fill();
        fxnBox(c, px, PY + 12, 22);
        c.fillStyle = "#1a1a2e"; c.beginPath(); c.arc(px, PY - 12, 9, 0, 7); c.fill(); c.fillStyle = "#ff8ab8"; c.fillRect(px - 9, PY - 14, 18, 3);
      }
      if (flash > 0) { c.fillStyle = `rgba(255,60,60,${flash * 0.5})`; c.fillRect(0, 0, 360, 520); }
    }
    function step(now) {
      const dt = Math.min(0.05, (now - last) / 1000 || 0); last = now;
      if (run) {
        t += dt; const sp = 230 + t * 7; scroll += sp * dt; dist += sp * dt; inv = Math.max(0, inv - dt); flash = Math.max(0, flash - dt * 2);
        px += (LX[lane] - px) * Math.min(1, dt * 14);
        spawn -= dt;
        if (spawn <= 0) {
          spawn = Math.max(0.42, 0.85 - t * 0.012);
          const l = Math.floor(Math.random() * 3), k = Math.random() < 0.38 ? "box" : pick(["auto", "auto", "pot", "cow"]);
          if (!objs.some(o => o.y < 60 && o.l === l)) objs.push({ k, l, x: LX[l], y: -40 });
          if (k !== "box" && Math.random() < 0.25 + t * 0.006) { const l2 = (l + 1 + Math.floor(Math.random() * 2)) % 3; objs.push({ k: "box", l: l2, x: LX[l2], y: -110 }); }
        }
        objs.forEach(o => { o.y += sp * dt * (o.k === "auto" ? 0.7 : 1); });
        objs = objs.filter(o => {
          if (o.y > 600) return false;
          if (Math.abs(o.y - PY) < (o.k === "auto" ? 44 : 30) && Math.abs(o.x - px) < 28) {
            if (o.k === "box") { boxes++; SND().sfx("coin"); return false; }
            if (inv <= 0) { lives--; inv = 1.2; flash = 1; SND().sfx(o.k === "auto" ? "honkAuto" : "error"); if (navigator.vibrate) try { navigator.vibrate(60); } catch (e) {} }
          }
          return true;
        });
        const score = boxes * 25 + Math.floor(dist / 120);
        setScoreQuiet(score);
        const hud = root && root.querySelector("#cv-hud"); if (hud) hud.innerHTML = `<span>${"❤️".repeat(Math.max(0, lives))}</span><span>📦 ${boxes}</span><span>⏱ ${Math.max(0, Math.ceil(DUR - t))}s</span>`;
        if (lives <= 0 || t >= DUR) { run = false; draw(); return finish(G, score, lives <= 0 ? "Ouch! " + boxes + " boxes delivered before the crash." : boxes + " boxes delivered across Kochi."); }
      }
      draw(); raf = requestAnimationFrame(step);
    }
    let sx = null;
    cv.addEventListener("pointerdown", e => { sx = e.clientX; });
    cv.addEventListener("pointerup", e => { if (sx == null) return; const dx = e.clientX - sx; if (Math.abs(dx) > 25) move(dx > 0 ? 1 : -1); else { const r = cv.getBoundingClientRect(); move(e.clientX - r.left < r.width / 2 ? -1 : 1); } sx = null; });
    keyH = e => { if (e.key === "ArrowLeft" || e.key === "a") move(-1); if (e.key === "ArrowRight" || e.key === "d") move(1); };
    window.addEventListener("keydown", keyH);
    cur = { click: a => { if (a === "go") { root.querySelector("#cv-go").hidden = true; run = true; SND().sfx("vroom"); } } };
    last = performance.now(); raf = requestAnimationFrame(step);
  }
  let lastShown = -1;
  function setScoreQuiet(v) { if (v === lastShown) return; lastShown = v; const s = root && root.querySelector("#arc-s"); if (s) s.textContent = v; }

  // ---------- 4. Drone Drop ----------
  function droneGame(G) {
    const { cv, ctx: c } = canvasFrame(G, "Tap anywhere to drop the parcel. The box keeps the drone's speed, so lead your shot. 10 parcels.");
    const N = 10, PADY = 432;
    const sky = [];
    for (let i = 0; i < 14; i++) sky.push({ x: i * 28 - 10 + R(-6, 6), w: R(22, 40), h: R(120, 300), c: pick(["#19e6ff", "#ff2fd0", "#9b6bff", "#ffcf4a"]) });
    const stars = Array.from({ length: 40 }, () => [R(0, 360), R(0, 220), R(0.5, 1.6)]);
    let t = 0, last = 0, dx = 0, dronX = 180, prevX = 180, box = null, left = N, score = 0, pads = [], target = 0, run = false, msg = null, phase = Math.random() * 6;
    function newPads() { const xs = shuffle([70, 180, 290]); pads = xs.map((x, i) => ({ x, base: x, w: 66, ph: R(0, 6) })); target = Math.floor(Math.random() * 3); }
    newPads();
    function drop() { if (!run || box || left <= 0) return; box = { x: dronX, y: 104, vx: (dronX - prevX) / Math.max(0.016, dx) * 0.55, vy: 0 }; left--; SND().sfx("click"); }
    function draw() {
      const g = c.createLinearGradient(0, 0, 0, 520); g.addColorStop(0, "#0b0a24"); g.addColorStop(0.6, "#2b1250"); g.addColorStop(1, "#4b1c5c");
      c.fillStyle = g; c.fillRect(0, 0, 360, 520);
      stars.forEach(s => { c.fillStyle = `rgba(255,255,255,${0.4 + Math.sin(t * 2 + s[0]) * 0.3})`; c.fillRect(s[0], s[1], s[2], s[2]); });
      sky.forEach(b => { c.fillStyle = "#16132e"; c.fillRect(b.x, 520 - b.h, b.w, b.h); c.fillStyle = b.c; c.globalAlpha = 0.85; c.fillRect(b.x, 520 - b.h, b.w, 2); c.globalAlpha = 0.25; for (let y = 520 - b.h + 10; y < 510; y += 14) for (let x = b.x + 4; x < b.x + b.w - 4; x += 8) if ((x * 7 + y) % 3) c.fillRect(x, y, 4, 6); c.globalAlpha = 1; });
      // balconies
      pads.forEach((p, i) => {
        c.fillStyle = "#26224a"; c.fillRect(p.x - p.w / 2, PADY, p.w, 90);
        const on = i === target; c.fillStyle = on ? "#ff3d8b" : "#5a5680"; c.fillRect(p.x - p.w / 2 - 4, PADY - 4, p.w + 8, 6);
        if (on) { c.save(); c.shadowColor = "#ff3d8b"; c.shadowBlur = 18; c.fillStyle = "rgba(255,61,139,.35)"; c.fillRect(p.x - p.w / 2, PADY - 26, p.w, 22); c.restore(); c.fillStyle = "#fff"; c.font = "800 11px system-ui, sans-serif"; c.textAlign = "center"; c.fillText("FXN DROP", p.x, PADY - 11); }
        c.strokeStyle = on ? "#ff8ab8" : "#7b77a8"; c.lineWidth = 2; for (let k = -p.w / 2 + 6; k < p.w / 2; k += 10) { c.beginPath(); c.moveTo(p.x + k, PADY + 2); c.lineTo(p.x + k, PADY + 18); c.stroke(); }
      });
      // drone
      c.save(); c.translate(dronX, 82);
      c.fillStyle = "#1d1b33"; rr(c, -26, -8, 52, 16, 8); c.fill();
      c.strokeStyle = "#8f8bb5"; c.lineWidth = 2; [-22, 22].forEach(x => { c.beginPath(); c.moveTo(x, -4); c.lineTo(x, -12); c.stroke(); c.fillStyle = "rgba(200,220,255,.5)"; c.beginPath(); c.ellipse(x, -13, 15 + Math.sin(t * 60) * 2, 2.5, 0, 0, 7); c.fill(); });
      c.fillStyle = "#19e6ff"; c.fillRect(-10, 4, 20, 2);
      c.restore();
      if (!box && left > 0) fxnBox(c, dronX, 104, 22);
      if (box) fxnBox(c, box.x, box.y, 22);
      if (msg) { c.globalAlpha = Math.min(1, msg.t); c.fillStyle = msg.c; c.font = "800 22px system-ui, sans-serif"; c.textAlign = "center"; c.fillText(msg.s, 180, 300); c.globalAlpha = 1; }
    }
    function step(now) {
      dx = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      if (run) {
        t += dx; const done = N - left, spd = 1.3 + done * 0.09;
        prevX = dronX; dronX = 180 + Math.sin(t * spd + phase) * 135;
        if (done >= 5) pads.forEach(p => { p.x = p.base + Math.sin(t * 0.9 + p.ph) * 18; });
        if (msg) { msg.t -= dx; if (msg.t <= 0) msg = null; }
        if (box) {
          box.vy += 900 * dx; box.x += box.vx * dx; box.y += box.vy * dx;
          if (box.y >= PADY - 11) {
            const hit = pads.findIndex(p => Math.abs(box.x - p.x) < p.w / 2 + 6);
            if (hit === target) { const off = Math.abs(box.x - pads[hit].x) / (pads[hit].w / 2); const pts = 70 + Math.round((1 - Math.min(1, off)) * 50); score += pts; msg = { s: off < 0.3 ? "Perfect! +" + pts : "Delivered +" + pts, c: "#ffcf4a", t: 0.9 }; SND().sfx(off < 0.3 ? "sparkle" : "coin"); }
            else if (hit >= 0) { score += 15; msg = { s: "Wrong flat +15", c: "#c9b6ff", t: 0.9 }; SND().sfx("notify"); }
            else { msg = { s: "Missed!", c: "#ff6b6b", t: 0.9 }; SND().sfx("error"); }
            box = null; target = (target + 1 + Math.floor(Math.random() * 2)) % 3;
            if (Math.random() < 0.4) { const xs = shuffle([70, 180, 290]); pads.forEach((p, i) => { p.base = xs[i]; p.x = xs[i]; }); }
          }
        }
        setScoreQuiet(score);
        const hud = root && root.querySelector("#cv-hud"); if (hud) hud.innerHTML = `<span>📦 ${left} left</span><span>Kochi 2030</span>`;
        if (left <= 0 && !box && !msg) { run = false; draw(); return finish(G, score, score >= 900 ? "Sky courier of the year." : "All parcels dropped over Kochi."); }
      }
      draw(); raf = requestAnimationFrame(step);
    }
    cv.addEventListener("pointerdown", e => { e.preventDefault(); drop(); });
    keyH = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); drop(); } };
    window.addEventListener("keydown", keyH);
    cur = { click: a => { if (a === "go") { root.querySelector("#cv-go").hidden = true; run = true; SND().sfx("vroom"); } } };
    last = performance.now(); raf = requestAnimationFrame(step);
  }

  return { open, close, games: GAMES, fig, isOpen: () => !!root };
})();
