// Deterministic game engine. The engine decides every number; text only describes it.
window.AE = (function () {
  const CHAPTERS = 6, STEPS = 3;
  const LIVES = () => window.AE_LIVES, STATES = () => window.AE_STATES, COMMON = () => window.AE_COMMON;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const has = (g, f) => g.flags.indexOf(f) >= 0;
  const r10 = n => Math.round(n / 10) * 10;
  const inr = n => (n < 0 ? "−₹" : "₹") + Math.abs(Math.round(n)).toLocaleString("en-IN");

  function rnd(g) {
    let t = (g.rs = (g.rs + 0x6D2B79F5) | 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const pick = (g, arr) => arr[Math.floor(rnd(g) * arr.length)];

  const life = g => LIVES().find(l => l.id === g.lifeId);
  const st = g => STATES()[g.stateId];
  const ci = g => (life(g).raw ? 1 : st(g).ci);
  const kit = g => ({ st: st(g), ci: ci(g), m: n => r10(n * ci(g)), R: () => rnd(g) });

  function words(g) {
    const s = st(g), p = g.player, L = life(g);
    const pr = { he: ["he", "his", "him"], she: ["she", "her", "her"], they: ["they", "their", "them"] }[p.pronoun] || ["they", "their", "them"];
    return {
      name: p.name, city: s.city, state: s.name, m: s.cast.m, v: s.cast.v, f: s.cast.f, p: s.cast.p,
      mentor: s.cast.m, rival: s.cast.v, friend: s.cast.f, parent: s.cast.p, league: "the state T20 league",
      food: s.food.item, stall: s.food.stall, craft: s.craft.item, film: s.film, festival: s.festival,
      sport: s.sport, buddy: s.buddy, greet: s.greet, lang: s.lang,
      start: Math.round(L.cash0 * (L.raw ? 1 : s.ci)).toLocaleString("en-IN"),
      he: pr[0], his: pr[1], him: pr[2]
    };
  }
  function fill(t, g, extra) {
    if (!t) return "";
    const w = Object.assign(words(g), extra || {});
    for (let i = 0; i < 2; i++) t = t.replace(/\{(\w+)\}/g, (m, k) => (w[k] !== undefined ? w[k] : m));
    return t;
  }

  function hashStr(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

  function newGame(player, lifeId, stateId, opts) {
    opts = opts || {};
    const L = LIVES().find(l => l.id === lifeId), S = STATES()[stateId];
    const seed = opts.seed != null ? opts.seed : (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0;
    const cash = Math.round(L.cash0 * (L.raw ? 1 : S.ci));
    return {
      v: 1, lifeId, stateId, seed, rs: seed, daily: opts.daily || null, player: Object.assign({}, player),
      chapter: 1, step: 0, cash, startCash: cash, minCash: cash, r: 20, h: 60, s: L.s0, x: L.x0,
      rel: { m: 0, v: -10, f: 30, p: 30 }, flags: [], used: [], log: [], shady: 0,
      talks: 2, talked: [], current: null, summary: null, ending: null, done: false, result: null,
      loc: stateId, missions: makeMissions(lifeId, stateId, seed), trips: 0,
      papers: [], pending: [], fake: [], loans: [], house: { lvl: 0, wall: 0, items: [] }, spouse: null, romance: null,
      lifeHistory: [lifeId], switches: 0, odd: null, oddDone: 0, missionsDone: 0, group: null, groupsDone: 0, shift: null, gifts: 0
    };
  }

  // ── away missions & travel ──
  function makeMissions(lifeId, stateId, seed) {
    if (!window.AE_MISSIONS || !window.AE_MISSIONS[lifeId]) return [];
    const others = Object.keys(STATES()).filter(k => k !== stateId);
    const a = others[seed % others.length], b = others[(Math.floor(seed / 7) + 1) % others.length];
    return [{ target: a, at: 2, step: 0, done: false }, { target: b === a ? others[(others.indexOf(a) + 1) % others.length] : b, at: 4, step: 0, done: false }];
  }
  function mwords(g, m) {
    const t = STATES()[m.target];
    return { tcity: t.city, tstate: t.name, tm: t.cast.m, tfood: t.food.item, tcraft: t.craft.item, tfilm: t.film, tspot: t.city + " Railway Station", tlandmark: t.city };
  }
  function activeMission(g) {
    if (!g.missions) return null;
    return g.missions.find(m => !m.done && g.chapter >= m.at) || null;
  }
  // What the player should do next for the active mission: { text, where: stateId, target: "station" | "m" | "f" ... , step }
  function missionGuide(g) {
    const m = activeMission(g); if (!m) return null;
    const T = window.AE_MISSIONS[g.lifeId], w = mwords(g, m), home = g.stateId, f = s => fill(s, g, w);
    if (m.step === 0) return { m, title: f(T.title), text: g.loc === home ? f("Walk to the {city} Railway Station and take a train to {tcity}") : f("Go to the station and travel to {tcity}"), where: g.loc, target: "station" };
    if (m.step === 1) return g.loc === m.target ? (m.step = 2, missionGuide(g)) : { m, title: f(T.title), text: f("Walk to the station and travel to {tcity}"), where: g.loc, target: "station" };
    if (m.step === 2) return g.loc === m.target ? { m, title: f(T.title), text: f(T.go) + ": walk to " + w.tm, where: m.target, target: "m" } : { m, title: f(T.title), text: f("Travel to {tcity} first"), where: g.loc, target: "station" };
    if (m.step === 3) return g.loc === home ? (m.step = 4, missionGuide(g)) : { m, title: f(T.title), text: f("Head to the {tcity} Railway Station and travel home to {city}"), where: g.loc, target: "station" };
    if (m.step === 4) return g.loc === home ? { m, title: f(T.title), text: f(T.back.go), where: home, target: T.back.who } : { m, title: f(T.title), text: f("Travel home to {city} to finish"), where: g.loc, target: "station" };
    return null;
  }
  function missionScene(g) {
    const m = activeMission(g); if (!m) return null;
    const T = window.AE_MISSIONS[g.lifeId], w = mwords(g, m);
    if (m.step === 2) return { kind: "scene", t: fill(T.scene.t, g, w), c: T.scene.c.map(c => Object.assign({}, c, { l: fill(c.l, g, w) })) };
    if (m.step === 4) return { kind: "back", t: fill(T.back.r, g, w) };
    return null;
  }
  function missionChoose(g, idx) {
    const m = activeMission(g); if (!m) return null;
    const T = window.AE_MISSIONS[g.lifeId], w = mwords(g, m);
    let res, passed = null;
    if (m.step === 2) {
      const ch = T.scene.c[idx]; res = ch;
      if (ch.ck) { passed = rnd(g) < chance(g, ch.ck); res = passed ? ch.ck.ok : ch.ck.no; }
      const d = apply(g, res.e || ch.e);
      m.step = 3;
      g.log.push({ c: g.chapter, id: "mission", t: fill(T.scene.t, g, w), l: fill(ch.l, g, w), r: fill(res.r, g, w), d, alt: [] });
      return { text: fill(res.r, g, w), d, passed };
    }
    if (m.step === 4) {
      const d = apply(g, T.back.e);
      m.step = 5; m.done = true;
      g.log.push({ c: g.chapter, id: "mission", t: fill(T.title, g, w) + " (complete)", l: fill(T.back.go, g, w), r: fill(T.back.r, g, w), d, alt: [] });
      return { text: fill(T.back.r, g, w), d, passed: null, complete: true };
    }
    return null;
  }
  function fare(g, dest) { return life(g).raw ? 600 : r10(600 * STATES()[g.stateId].ci); }
  function travel(g, dest) {
    if (dest === g.loc || !STATES()[dest]) return false;
    const cost = fare(g, dest);
    if (g.cash < cost) return false;
    g.cash -= cost; g.loc = dest; g.trips++;
    const m = activeMission(g);
    if (m && m.step <= 1 && dest === m.target) m.step = 2;
    if (m && m.step === 3 && dest === g.stateId) m.step = 4;
    if (m && m.step === 0) m.step = 1;
    return cost;
  }
  function score(g) {
    const L = life(g), rank = L.end.findIndex(e => e.id === g.result.id);
    const bonus = rank < 0 ? 0 : Math.max(0, (L.end.length - 1 - rank) * 120);
    const cash = Math.round(Math.max(0, g.cash) / (L.raw ? 100 : 100 * ci(g)));
    const done = (g.missions || []).filter(m => m.done).length + (g.missionsDone || 0);
    const debt = (g.loans || []).reduce((n, l) => n + l.left, 0);
    const extra = (g.house ? g.house.lvl * 150 + g.house.items.length * 15 : 0) + (g.spouse ? 200 : 0) + (g.kids || []).length * 200 + (g.goalsDone || []).length * 40 + (g.vehicle ? 1 + ["cycle", "scooter", "bike", "car", "suv"].indexOf(g.vehicle.id) : 0) * 60 + (g.groupsDone || 0) * 60 + (g.oddDone || 0) * 10;
    const raw = cash - Math.round(debt / (L.raw ? 100 : 100 * ci(g))) + g.r * 10 + g.x * 5 + bonus + done * 150 + extra - g.shady * 100;
    return Math.max(0, Math.min(20000, Math.round(raw)));
  }

  function allEvents(g) {
    return { life: life(g).ev, state: st(g).ev, common: COMMON().ev };
  }
  function findEvent(g, id) {
    const a = allEvents(g);
    return a.life.concat(a.state, a.common).find(e => e.id === id);
  }
  function ok(ev, g) {
    if (g.used.indexOf(ev.id) >= 0) return false;
    if (ev.at && ev.at !== g.chapter) return false;
    if (ev.min && g.chapter < ev.min) return false;
    if (ev.req && !has(g, ev.req)) return false;
    if (ev.not && has(g, ev.not)) return false;
    if (ev.cond && !ev.cond(g)) return false;
    if (ev.lives && ev.lives.indexOf(g.lifeId) < 0) return false;
    return true;
  }

  function nextEvent(g) {
    if (g.current) return findEvent(g, g.current);
    const a = allEvents(g);
    if (life(g).closed) { a.state = []; a.common = []; }
    const every = a.life.concat(a.state, a.common);
    let ev = every.find(e => e.at && ok(e, g));
    if (!ev) ev = every.find(e => e.req && e.w >= 9 && ok(e, g));
    if (!ev) {
      const bag = [];
      a.life.forEach(e => !e.at && ok(e, g) && bag.push([e, (e.w || 2) * 1.7]));
      a.state.forEach(e => ok(e, g) && bag.push([e, (e.w || 2) * 1.0]));
      a.common.forEach(e => ok(e, g) && bag.push([e, (e.w || 2) * 0.6]));
      const total = bag.reduce((s, b) => s + b[1], 0);
      let roll = rnd(g) * total;
      for (const b of bag) { roll -= b[1]; if (roll <= 0) { ev = b[0]; break; } }
      if (!ev && bag.length) ev = bag[bag.length - 1][0];
      if (!ev && g.sandbox && !g._recycled) { const keep = a.life.concat(a.state, a.common).filter(e => e.at || e.req).map(e => e.id); g.used = (g.used || []).filter(id => keep.indexOf(id) >= 0); g._recycled = true; const r = nextEvent(g); g._recycled = false; return r; }
    }
    if (!ev) ev = { id: "quiet_" + g.chapter + "_" + g.step, t: "A quiet stretch. Nothing dramatic, just steady work.", c: [{ l: "Keep going", e: { s: 2, h: 2 }, r: "Steady days build something too." }] };
    g.current = ev.id;
    if (ev.id.indexOf("quiet_") === 0) g._quiet = ev;
    return ev;
  }
  function currentEvent(g) {
    if (!g.current) return null;
    if (g._quiet && g._quiet.id === g.current) return g._quiet;
    return findEvent(g, g.current) || { id: g.current, t: "A quiet stretch. Nothing dramatic, just steady work.", c: [{ l: "Keep going", e: { s: 2, h: 2 }, r: "Steady days build something too." }] };
  }

  function needOf(g, ch) { return ch.need ? (life(g).raw ? ch.need : r10(ch.need * ci(g))) : 0; }
  function canChoose(g, ch) { if (ch.paper && !hasPaper(g, ch.paper)) return false; const n = needOf(g, ch); return n <= 0 || g.cash >= n; }

  function chance(g, ck) {
    const v = ck.k === "sx" ? (g.s + g.x) / 2 : g[ck.k];
    return clamp(0.5 + (v - ck.d) / 40, 0.05, 0.95);
  }

  function apply(g, e) {
    const d = { cash: 0 };
    if (!e) return d;
    const K = kit(g);
    if (e.c) d.cash += life(g).raw ? e.c : K.m(e.c);
    if (e.C) d.cash += e.C;
    g.cash += d.cash;
    ["r", "h", "s", "x"].forEach(k => { if (e[k]) { const b = g[k]; g[k] = clamp(g[k] + e[k], 0, 100); d[k] = g[k] - b; } });
    if (e.rel) Object.keys(e.rel).forEach(k => { const b = g.rel[k]; g.rel[k] = clamp(g.rel[k] + e.rel[k], -100, 100); d["rel_" + k] = g.rel[k] - b; });
    [].concat(e.set || []).forEach(f => { if (!has(g, f)) g.flags.push(f); });
    [].concat(e.unset || []).forEach(f => { g.flags = g.flags.filter(x => x !== f); });
    g.minCash = Math.min(g.minCash, g.cash);
    return d;
  }

  const mood = v => (v >= 30 ? "warm" : v <= -15 ? "cold" : "neutral");

  function choose(g, idx) {
    const ev = currentEvent(g);
    const ch = ev.c[idx];
    if (!ch || !canChoose(g, ch)) return null;
    let res = ch, passed = null;
    if (ch.ck) { passed = rnd(g) < chance(g, ch.ck); res = passed ? ch.ck.ok : ch.ck.no; }
    const d = apply(g, Object.assign({}, ch.e || {}, res.e || {}, ch.ck ? res.e : {}));
    if (ch.shady) g.shady++;
    let role = ev.who || null;
    const eff = res.e || ch.e || {};
    if (!role && eff.rel) role = Object.keys(eff.rel)[0];
    let reaction = null;
    if (role) { const rd = d["rel_" + role] || 0; const tone = rd > 0 ? "warm" : rd < 0 ? "cold" : mood(g.rel[role]); const L2 = line(g, "react", role, tone); reaction = { role, name: st(g).cast[role], line: L2.t, sub: L2.e }; }
    const text = fill(res.r, g);
    g.log.push({ c: g.chapter, id: ev.id, t: fill(ev.t, g), l: fill(ch.l, g), r: text, d, alt: ev.c.filter((_, i) => i !== idx).map(o => fill(o.l, g)) });
    if (g.used.indexOf(ev.id) < 0) g.used.push(ev.id);
    g.current = null; g._quiet = null;
    g.step++; g.clock = (g.clock || 0) + 1;
    let summary = null;
    if (g.step >= STEPS) summary = endChapter(g);
    return { text, d, reaction, passed, summary };
  }

  function endChapter(g) {
    const L = life(g), K = kit(g);
    const lines = (L.settle(g, K) || []).map(l => ({ label: l[0], amount: l[1], kind: l[2] || "money" })).concat(citySettle(g, K), window.AE_LIFE ? window.AE_LIFE.settleLines(g, K) : []);
    let net = 0;
    lines.forEach(l => { if (l.kind === "money") net += l.amount; });
    g.cash += net;
    g.minCash = Math.min(g.minCash, g.cash);
    if (g.cash < 0 && !g.ending) {
      if (!has(g, "bailout")) {
        const bail = L.raw ? Math.max(5000, -g.cash + 2000) : K.m(5000) + Math.max(0, -g.cash);
        g.cash += bail; g.flags.push("bailout"); g.rel.p = clamp(g.rel.p - 10, -100, 100);
        lines.push({ label: fill("{p} lent you money to stay afloat", g), amount: bail, kind: "money" });
        net += bail;
      } else if (g.sandbox) {
        const bail = L.raw ? Math.max(5000, -g.cash + 2000) : K.m(4000) + Math.max(0, -g.cash);
        g.cash += bail; g.h = clamp(g.h - 8, 0, 100); g.r = clamp(g.r - 3, 0, 100);
        lines.push({ label: "Family helped again (it was awkward)", amount: bail, kind: "money" }); net += bail;
      } else g.ending = L.id === "trader" ? "margincall" : "broke";
    }
    if (g.h <= 0 && !g.ending) { if (g.sandbox) { g.h = 25; g.energy = 0; lines.push({ label: "Burnout: you need rest", amount: 0, kind: "n" }); } else g.ending = "burnout"; }
    g.nets = (g.nets || []).concat(net);
    const s = { chapter: g.chapter, unit: L.unit, lines, net, cash: g.cash };
    g.summary = s;
    g.chapter++; g.step = 0; g.talks = 2;
    if (!g.sandbox && (g.ending || g.chapter > CHAPTERS)) finish(g);
    return s;
  }

  const GENERIC = {
    broke: { id: "broke", t: "Back to Square One", d: "The money ran out. It happens to most first attempts. What matters is what you do with the lesson." },
    burnout: { id: "burnout", t: "Burnt Out", d: "You gave it everything, including your health. Rest is not quitting." }
  };

  function finish(g) {
    const L = life(g), K = kit(g);
    let end = null;
    if (g.ending) end = L.end.find(e => e.id === g.ending) || GENERIC[g.ending];
    if (!end) end = L.end.find(e => e.c && e.c(g, K)) || L.end[L.end.length - 1];
    g.done = true;
    g.result = { id: end.id, t: fill(end.t, g), d: fill(end.d, g) };
    return g.result;
  }

  // Character speech in the player's chosen language (see data/dialogue.js)
  function langOf(g) {
    const D = window.AE_DIALOGUE, pref = (window.NS_PREFS && window.NS_PREFS.lang) || "auto";
    const code = pref === "auto" ? D.stateLang[g.loc || g.stateId] || "en" : pref;
    return D.packs[code] ? code : "en";
  }
  function line(g, kind, role, md, extra) {
    const D = window.AE_DIALOGUE, code = langOf(g), P = D.packs[code], E = D.packs.en;
    let raw, en;
    if (kind === "react") { const i = Math.floor(rnd(g) * 2); raw = P.react[role][md][i]; en = E.react[role][md][i]; }
    else if (kind === "advice" || kind === "city") {
      if (md === "cold") { raw = P[kind + "Cold"]; en = E[kind + "Cold"]; } else { raw = P[kind][role]; en = E[kind][role]; }
    } else { raw = P[kind][role][md]; en = E[kind][role][md]; }
    const t = Array.isArray(raw) ? raw[0] : raw;
    const sub = Array.isArray(raw) ? raw[1] : null;
    return { t: fill(t, g, extra), e: sub ? fill(sub, g, extra) : null, lang: code };
  }

  function talk(g, role, qi) {
    const C = COMMON(), away = g.loc && g.loc !== g.stateId;
    const m = away ? "neutral" : mood(g.rel[role]);
    let gain = false;
    const key = role + ":" + g.chapter;
    if (!away && g.talks > 0 && g.talked.indexOf(key) < 0) { g.talked.push(key); g.talks--; g.rel[role] = clamp(g.rel[role] + 3, -100, 100); gain = true; }
    const kind = ["howru", "advice", "city", "opinion"][qi] || "howru";
    const S = STATES()[g.loc || g.stateId];
    const L2 = line(g, kind, role, m, { tip: C.tips[g.lifeId], local: pick(g, C.local[g.loc || g.stateId]), city: S.city });
    return { text: L2.t, sub: L2.e, mood: m, gain };
  }

  function metric(g, v) {
    const L = life(g); v = v == null ? g.x : v;
    if (L.fmt === "followers") return Math.round(100 * Math.pow(1.1, v)).toLocaleString("en-IN");
    if (L.fmt === "users") return Math.round(v * v * 25).toLocaleString("en-IN");
    return Math.round(v) + "/100";
  }

  function dailyPick(dateStr) {
    const h = hashStr("ns-" + dateStr);
    const lives = LIVES().filter(l => !l.mature);
    return { lifeId: lives[h % lives.length].id, stateId: "KL", seed: h };
  }

  // ═══ City systems (data in data/city.js) ═══
  const C = () => window.AE_CITY;
  const money = (g, n) => (life(g).raw ? n : r10(n * ci(g)));
  const clockOf = g => g.clock || 0;
  function hasPaper(g, id) { return (g.papers || []).indexOf(id) >= 0; }
  function paperStatus(g, id) {
    const P = C().papers.find(p => p.id === id); if (!P) return "none";
    if (hasPaper(g, id)) return "have";
    const pe = (g.pending || []).find(x => x.id === id);
    if (pe) return clockOf(g) >= pe.ready ? "ready" : "processing";
    if (P.married && !(g.spouse && g.spouse.wed)) return "locked";
    if (P.needs.some(n => !hasPaper(g, n))) return "locked";
    return "none";
  }
  function paperFee(g, id) { const P = C().papers.find(p => p.id === id); return money(g, P.fee); }
  function applyPaper(g, id, method) {
    if (paperStatus(g, id) !== "none") return null;
    const fee = paperFee(g, id);
    if (method === "agent") {
      const cost = fee * 4; if (g.cash < cost) return null;
      g.cash -= cost; g.shady++; g.papers.push(id);
      const fake = rnd(g) < 0.35; if (fake) g.fake.push(id);
      return { text: "The agent comes back in an hour with a stamped paper. It cost four times the fee.", d: { cash: -cost }, now: true };
    }
    if (g.cash < fee) return null;
    g.cash -= fee; g.h = clamp(g.h - 3, 0, 100);
    g.pending.push({ id, ready: clockOf(g) + 1 });
    return { text: pick(g, C().officeLines) + " Your application is in. Come back to collect it after your next scene.", d: { cash: -fee, h: -3 } };
  }
  function collectPaper(g, id) {
    if (paperStatus(g, id) !== "ready") return false;
    g.pending = g.pending.filter(x => x.id !== id); g.papers.push(id); g.r = clamp(g.r + 1, 0, 100);
    return true;
  }
  // Loans
  function loanOk(g, id) { const Lo = C().loans.find(l => l.id === id); return Lo && Lo.needs.every(n => hasPaper(g, n)) && (g.loans || []).filter(l => l.left > 0).length < 3 && !(g.loans || []).some(l => l.id === id && l.left > 0); }
  function loanAmount(g, id) { return money(g, C().loans.find(l => l.id === id).amount); }
  function takeLoan(g, id, amount) {
    if (!loanOk(g, id)) return null;
    const Lo = C().loans.find(l => l.id === id); amount = Math.min(amount || loanAmount(g, id), loanAmount(g, id));
    const total = Math.round(amount * (1 + Lo.rate)), chaptersLeft = g.sandbox ? 6 : Math.max(2, CHAPTERS - g.chapter + 1);
    const loan = { id, name: Lo.name, principal: amount, left: total, emi: Math.ceil(total / chaptersLeft / 10) * 10 };
    g.loans.push(loan); if (!Lo.house && !Lo.vehicle) g.cash += amount;
    return loan;
  }
  // House
  function houseNext(g) { const H = C().houseLevels; return g.house.lvl + 1 < H.length ? H[g.house.lvl + 1] : null; }
  function upgradeHouse(g, withLoan) {
    const nx = houseNext(g); if (!nx) return false;
    const cost = money(g, nx.cost);
    if (withLoan) { const lo = takeLoan(g, "home", cost); if (!lo) return false; }
    else { if (g.cash < cost) return false; g.cash -= cost; }
    g.house.lvl++; g.h = clamp(g.h + 5, 0, 100); return true;
  }
  // Vehicles: buy with cash, or 20% down + vehicle loan. Your old vehicle is traded in at half price.
  function vehicleById(id) { return C().vehicles.find(v => v.id === id); }
  function tradeIn(g) { const V = g.vehicle && vehicleById(g.vehicle.id); return V ? Math.round(money(g, V.price) * 0.5) : 0; }
  function vehicleCost(g, id) { const V = vehicleById(id); return V ? Math.max(0, money(g, V.price) - tradeIn(g)) : 0; }
  function buyVehicle(g, id, color, withLoan) {
    const V = vehicleById(id); if (!V || (g.vehicle && g.vehicle.id === id)) return false;
    const cost = vehicleCost(g, id);
    if (withLoan) { const down = Math.round(cost * 0.2); if (g.cash < down || !loanOk(g, "vehicle") || cost - down > loanAmount(g, "vehicle")) return false; if (!takeLoan(g, "vehicle", cost - down)) return false; g.cash -= down; }
    else { if (g.cash < cost) return false; g.cash -= cost; }
    g.vehicle = { id, color: color || 0 }; g.riding = true; g.h = clamp(g.h + 4, 0, 100); g.vehiclesBought = (g.vehiclesBought || 0) + 1;
    return true;
  }
  function buyDecor(g, id) {
    const it = C().decor.find(d => d.id === id); if (!it || g.house.items.indexOf(id) >= 0) return false;
    const cost = money(g, it.cost); if (g.cash < cost) return false;
    g.cash -= cost; g.house.items.push(id); g.h = clamp(g.h + it.h, 0, 100); return true;
  }
  function paint(g, i) { const cost = money(g, 500); if (g.cash < cost) return false; g.cash -= cost; g.house.wall = i; return true; }
  // Marriage
  function profilesFor(g, want) { return C().profiles.filter(p => want === "any" || p.g === want); }
  function sendInterest(g, pid, site) {
    const P = C().profiles.find(p => p.id === pid); if (!P || g.spouse) return null;
    const tried = (g.romanceTried || []); if (tried.indexOf(pid) >= 0) return { ok: false, text: P.name + " has already replied to you." };
    g.romanceTried = tried.concat(pid);
    const ch = clamp(0.55 + (g.r + g.h) / 200 - P.pick / 100, 0.15, 0.9);
    if (rnd(g) < ch) { g.romance = { pid, site, stage: "date", score: 0 }; return { ok: true, text: P.name + " accepted your interest! Meet at Café Monsoon for a first chai." }; }
    return { ok: false, text: P.name + " replied: 'You seem nice, but I don't think we're a match.' Ouch, but polite." };
  }
  function dateScene(g) { return C().dates[(g.romance && g.romance.round) || 0]; }
  function dateChoose(g, idx) {
    const R = g.romance, D = dateScene(g), c = D.c[idx], P = C().profiles.find(p => p.id === R.pid);
    R.score += c.ok + Math.round((g.h - 50) / 10); R.round = (R.round || 0) + 1;
    const text = c.r.replace(/\{p\}/g, P.name);
    if (R.round >= C().dates.length) {
      if (R.score >= 10) { R.stage = C().sites.find(s => s.id === R.site).family ? "family" : "family"; return { text: text + " At the end, " + P.name + " says: 'Let's meet each other's families.' Walk home to introduce them.", ok: true }; }
      g.romance = null; g.h = clamp(g.h - 6, 0, 100);
      return { text: text + " Later, " + P.name + " messages: 'I had fun, but I don't feel a spark.' You can try another profile.", ok: false };
    }
    return { text, more: true };
  }
  function familyMeet(g, idx) {
    const R = g.romance, P = C().profiles.find(p => p.id === R.pid);
    const opts = [
      { r: P.name + "'s parents and yours discover they went to the same school. The meeting turns into a three-hour reunion. Engaged!", ok: true, h: 8 },
      { r: "Your uncle asks " + P.name + " about salary, horoscope and cooking in one breath. " + P.name + " handles it like a pro. Engaged!", ok: true, h: 4 }
    ];
    const o = opts[idx] || opts[0];
    R.stage = "engaged"; g.h = clamp(g.h + o.h, 0, 100);
    return { text: o.r + " Rent wedding wear on FXN and plan the wedding at the Town Hall." };
  }
  function wed(g, wid) {
    const R = g.romance, W = C().weddings.find(w => w.id === wid), P = C().profiles.find(p => p.id === R.pid);
    const cost = money(g, W.cost); if (g.cash < cost) return null;
    g.cash -= cost; g.h = clamp(g.h + W.h, 0, 100); g.r = clamp(g.r + W.r, 0, 100);
    g.spouse = { pid: P.id, name: P.name, job: P.job, wed: true, chapter: g.chapter }; g.romance = null;
    return { text: "You and " + P.name + " are married! " + (W.id === "grand" ? "Six hundred guests, four hundred selfies, one very tired couple." : W.id === "temple" ? "A beautiful ceremony and a sadya the relatives will discuss for years." : "Small, sweet and debt-free. Your favourite kind of wedding.") + " Register the marriage at the Government Office.", d: { cash: -cost, h: W.h, r: W.r } };
  }
  // Career switch / venture
  function switchLife(g, lifeId, cityId) {
    const L = LIVES().find(l => l.id === lifeId); if (!L || lifeId === g.lifeId) return false;
    g.missionsDone = (g.missionsDone || 0) + (g.missions || []).filter(m => m.done).length;
    g.lifeId = lifeId; if (cityId) g.stateId = cityId;
    g.x = L.x0; g.s = Math.max(L.s0, Math.round(g.s * 0.6));
    g.flags = g.flags.filter(f => f === "bailout");
    g.current = null; g._quiet = null; g.switches = (g.switches || 0) + 1; g.lifeHistory = (g.lifeHistory || []).concat(lifeId);
    g.missions = makeMissions(lifeId, g.stateId, g.seed + g.switches).filter(m => m.at > g.chapter).concat([]);
    if (!g.missions.length && g.chapter < CHAPTERS) g.missions = [{ target: Object.keys(STATES()).filter(k => k !== g.stateId)[g.seed % 4], at: g.chapter + 1, step: 0, done: false }];
    return true;
  }
  // Odd jobs & group tasks
  function oddPay(g, J) { return money(g, J.pay); }
  function finishOdd(g) {
    const J = C().oddJobs.find(j => j.id === g.odd.id); const pay = oddPay(g, J);
    g.cash += pay; if (J.r) g.r = clamp(g.r + J.r, 0, 100); if (J.h) g.h = clamp(g.h + J.h, 0, 100);
    g.odd = null; g.oddDone = (g.oddDone || 0) + 1; g.oddThis = (g.oddThis || 0) + 1;
    return { text: J.t + ": done! +" + inr(pay), pay };
  }
  function groupShare(g, T) { return money(g, Math.round(T.reward / T.size)); }
  function finishGroup(g, T, realOthers) {
    const share = groupShare(g, T), hired = Math.max(0, T.size - 1 - realOthers);
    g.cash += share; g.r = clamp(g.r + (T.r || 0), 0, 100); if (T.h) g.h = clamp(g.h + T.h, 0, 100);
    g.groupsDone = (g.groupsDone || 0) + 1; g.group = null;
    return { share, hired, text: T.t + ": done! You earned " + inr(share) + (hired ? ". " + hired + " hired helper" + (hired > 1 ? "s" : "") + " took their share." : ". The whole team was real players!") };
  }
  // FXN rider shift
  function riderPay(g) { return money(g, C().rider.pay); }
  function rateDrop(g, secs, ideal) {
    const ratio = secs / Math.max(8, ideal);
    let stars = ratio <= 1.15 ? 5 : ratio <= 1.5 ? 4 : ratio <= 2 ? 3 : ratio <= 2.8 ? 2 : 1;
    if (rnd(g) < 0.15 && stars > 1) stars--;
    const tip = stars >= 4 ? money(g, Math.round(C().rider.tipMax * (stars - 3) / 2 * (0.5 + rnd(g) / 2))) : 0;
    g.shift.ratings.push(stars); g.shift.tips += tip; g.cash += tip; g.shift.left--;
    const lines = stars >= 4 ? C().rate5 : stars === 3 ? C().rate3 : C().rate1;
    return { stars, tip, line: pick(g, lines), cust: pick(g, C().customers) };
  }
  function endShift(g) {
    const S = g.shift, avg = S.ratings.reduce((a, b) => a + b, 0) / S.ratings.length;
    const paid = avg >= C().rider.minAvg, pay = paid ? riderPay(g) * S.ratings.length : 0;
    g.cash += pay; if (paid) g.r = clamp(g.r + 2, 0, 100); else g.r = clamp(g.r - 2, 0, 100);
    g.shifts = (g.shifts || 0) + 1; g.shift = null; g.shiftThis = (g.shiftThis || 0) + 1;
    return { avg: Math.round(avg * 10) / 10, paid, pay, tips: S.tips };
  }
  // Extra settle lines at the end of each chapter
  function citySettle(g, K) {
    const out = [];
    (g.loans || []).forEach(l => { if (l.left > 0) { const emi = Math.min(l.emi, l.left); l.left -= emi; out.push({ label: l.name + " EMI", amount: -emi, kind: "money" }); } });
    const H = C().houseLevels[g.house ? g.house.lvl : 0];
    if (H && H.upkeep) { out.push({ label: H.name + " upkeep", amount: -money(g, H.upkeep), kind: "money" }); g.h = clamp(g.h + H.h, 0, 100); }
    const VH = g.vehicle && vehicleById(g.vehicle.id); if (VH && VH.fuel) out.push({ label: VH.name + ": petrol & service", amount: -money(g, VH.fuel), kind: "money" });
    if (g.spouse) { out.push({ label: g.spouse.name + "'s share of household costs", amount: money(g, 2500), kind: "money" }); g.h = clamp(g.h + 3, 0, 100); }
    if ((g.fake || []).length && rnd(g) < 0.5) {
      const id = g.fake.shift(), P = C().papers.find(p => p.id === id);
      g.papers = g.papers.filter(x => x !== id); g.r = clamp(g.r - 8, 0, 100);
      out.push({ label: "Fine: your " + P.name + " from the agent was fake", amount: -money(g, P.fee * 6), kind: "money" });
    }
    g.oddThis = 0; g.shiftThis = 0;
    return out;
  }

  const REALITY = {
    street: "Real street vendors need a food-safety registration and a vending spot from the local body. Margins swing with milk, oil and gas prices.",
    job: "Real appraisals reward documented impact. Switching jobs often raises pay faster, but tenure builds trust and skills.",
    govt: "Real government exams have lakhs of applicants for a few thousand posts. Use official notifications only; paper-leak offers are always scams or crimes.",
    creator: "Real creators in India must clearly label paid promotions. Most take a year or more of consistent posting to earn steadily.",
    startup: "Most real startups fail or pivot. Investors check your data; faking traction can end your career.",
    craft: "Real handloom and craft brands win on authenticity and artisan stories. Official handloom marks help buyers trust you.",
    film: "Real casting never requires paying a fee. Most actors build careers through theatre, ads, TV and small roles first.",
    cricket: "Real players are selected through district and state trials. Approaches to fix matches must be reported; corruption ends careers.",
    reality: "Real reality shows are produced entertainment. Contestants sign contracts, and much of the drama is shaped by editing.",
    nurse: "Real nursing jobs abroad go through registered recruiting agencies and the hospital's own process. Paying lakhs for a 'guaranteed job' is the most common nurse recruitment scam.",
    cab: "Real auto and taxi drivers need a permit, insurance and a fitness certificate for the vehicle. App commissions vary a lot, so compare before you sign up.",
    teacher: "Real tuition centres live on word of mouth. Never use students' photos or results in ads without the parents' permission.",
    kitchen: "Real home kitchens need a food-safety registration before selling, and delivery apps check it. Fake reviews break platform rules and can get you removed.",
    homestay: "Real homestays are registered with the state tourism department. Ratings and repeat guests matter more than fancy decor.",
    stylist: "Real stylists build portfolios first. Renting outfits for shoots keeps costs low and lets you show variety.",
    band: "Real musicians should never sign a contract they haven't fully read. Keep the rights to your songs whenever you can.",
    planner: "Real wedding planners earn on trust. Dowry is a crime in India under the Dowry Prohibition Act, 1961, for both giving and taking.",
    seafood: "Kerala has an annual monsoon trawling ban so fish can breed. Exporters need registrations and must follow strict quality rules.",
    gulf: "Many returnees lose savings to loans to relatives, oversized houses and chain-marketing schemes. Schemes that pay you mainly for recruiting people are a warning sign.",
    trader: "SEBI found over 91% of individual traders lost money in equity derivatives in FY25. Investing through diversified index funds over years is the slower, safer path. This game is not investment advice."
  };

  const CITY = { vehicleById, tradeIn, vehicleCost, buyVehicle, hasPaper, paperStatus, paperFee, applyPaper, collectPaper, loanOk, loanAmount, takeLoan, houseNext, upgradeHouse, buyDecor, paint, profilesFor, sendInterest, dateScene, dateChoose, familyMeet, wed, switchLife, oddPay, finishOdd, groupShare, finishGroup, riderPay, rateDrop, endShift, money };
  return { CITY, applyEffects: apply, missionGuide, missionScene, missionChoose, activeMission, travel, fare, score, line, langOf, CHAPTERS, STEPS, clamp, has, inr, fill, life, st, ci, kit, newGame, nextEvent, currentEvent, canChoose, needOf, chance, choose, talk, metric, mood, dailyPick, finish, REALITY, rnd };
})();
