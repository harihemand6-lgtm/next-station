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
      loc: stateId, missions: makeMissions(lifeId, stateId, seed), trips: 0
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
    const done = (g.missions || []).filter(m => m.done).length;
    const raw = cash + g.r * 10 + g.x * 5 + bonus + done * 150 - g.shady * 100;
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
  function canChoose(g, ch) { const n = needOf(g, ch); return n <= 0 || g.cash >= n; }

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
    g.step++;
    let summary = null;
    if (g.step >= STEPS) summary = endChapter(g);
    return { text, d, reaction, passed, summary };
  }

  function endChapter(g) {
    const L = life(g), K = kit(g);
    const lines = (L.settle(g, K) || []).map(l => ({ label: l[0], amount: l[1], kind: l[2] || "money" }));
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
      } else g.ending = L.id === "trader" ? "margincall" : "broke";
    }
    if (g.h <= 0 && !g.ending) g.ending = "burnout";
    g.nets = (g.nets || []).concat(net);
    const s = { chapter: g.chapter, unit: L.unit, lines, net, cash: g.cash };
    g.summary = s;
    g.chapter++; g.step = 0; g.talks = 2;
    if (g.ending || g.chapter > CHAPTERS) finish(g);
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
    const lives = LIVES(), states = Object.keys(STATES());
    return { lifeId: lives[h % lives.length].id, stateId: states[(h >>> 8) % states.length], seed: h };
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
    trader: "SEBI found over 91% of individual traders lost money in equity derivatives in FY25. Investing through diversified index funds over years is the slower, safer path. This game is not investment advice."
  };

  return { applyEffects: apply, missionGuide, missionScene, missionChoose, activeMission, travel, fare, score, line, langOf, CHAPTERS, STEPS, clamp, has, inr, fill, life, st, ci, kit, newGame, nextEvent, currentEvent, canChoose, needOf, chance, choose, talk, metric, mood, dailyPick, finish, REALITY, rnd };
})();
