// Next Station — UI layer. All game rules live in engine.js; this file only renders and routes.
(function () {
  const GAME_NAME = "Next Station";
  const GRIEVANCE = { name: "Hemand Hari", email: "hemandhari15@gmail.com" };
  const AE = window.AE, AV = window.AE_AVATAR, LIVES = window.AE_LIVES, STATES = window.AE_STATES, MAP = window.AE_MAP, COMMON = window.AE_COMMON;
  const $app = document.getElementById("app");

  // ── storage (browser only, never leaves the device) ──
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } }
  };
  const blankProfile = () => ({ xp: 0, lives: [], states: [], endings: [], badges: [], dailies: [], runs: 0 });
  let char = store.get("ns.char", null);
  let profile = store.get("ns.profile", blankProfile());
  let game = store.get("ns.game", null);
  let prefs = store.get("ns.prefs", { lang: "auto", subs: true });
  window.NS_PREFS = prefs;
  const NET = window.AE_NET, WORLD = window.AE_WORLD, DLG = window.AE_DIALOGUE;
  let netKey = null;
  let ui = { view: "home", stateId: null, lifeId: null, daily: null, outcome: null, talk: null, talkRole: null, talkAnswer: null, confirmReset: false, draft: null, copied: false, newBadges: [], xpGain: 0 };

  const save = () => { store.set("ns.char", char); store.set("ns.profile", profile); store.set("ns.game", game); store.set("ns.prefs", prefs); };
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const inr = AE.inr;
  const level = xp => Math.floor(Math.sqrt(xp / 60)) + 1;
  const today = () => { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  const lifeById = id => LIVES.find(l => l.id === id);
  const unitPlural = u => u.toLowerCase() + "s";
  const fillS = (t, stateId, lifeId) => {
    const s = STATES[stateId], L = lifeById(lifeId);
    const w = { city: s.city, state: s.name, stall: s.food.stall, food: s.food.item, craft: s.craft.item, film: s.film, sport: s.sport, lang: s.lang,
      start: L ? Math.round(L.cash0 * (L.raw ? 1 : s.ci)).toLocaleString("en-IN") : "" };
    return t.replace(/\{(\w+)\}/g, (m, k) => (w[k] !== undefined ? w[k] : m));
  };

  function go(view, extra) {
    if (view !== "play") { NET.leave(); netKey = null; }
    Object.assign(ui, { view, outcome: null, eventOpen: false, mscene: null, cityEv: null, fxn: false, travel: false, courier: null, talk: null, talkRole: null, talkAnswer: null, muteTarget: null, reported: false, ageGate: false, confirmReset: false, copied: false }, extra || {});
    render(); window.scrollTo(0, 0);
  }
  const speech = (t, sub) => `<p>“${esc(t)}”</p>${prefs.subs && sub ? `<p class="sub">${esc(sub)}</p>` : ""}`;
  function langPicker() {
    return `<div class="f"><span>Character language</span>
      <select id="f-lang">${Object.keys(DLG.langs).map(k => `<option value="${k}" ${prefs.lang === k ? "selected" : ""}>${esc(DLG.langs[k])}</option>`).join("")}</select>
      <label class="check"><input type="checkbox" id="f-subs" ${prefs.subs ? "checked" : ""}> Show English subtitles</label>
      <span class="hint">Characters speak this language. Story text stays in English.</span></div>`;
  }

  // ── shared bits ──
  const topbar = (back) => `
    <header class="topbar">
      ${back ? `<button class="icon-btn" data-act="${back}" aria-label="Back">←</button>` : `<span class="brand"><span class="brand-dot"></span>${GAME_NAME}</span>`}
      ${back ? `<span class="brand small">${GAME_NAME}</span>` : ""}
      <button class="chip-btn" data-act="profile" aria-label="Your profile">${char ? `<span class="mini-av">${AV.svg(char, 22)}</span>` : ""}Lv ${level(profile.xp)}</button>
    </header>`;
  const footer = () => `<footer class="foot"><a href="#rules" data-act="rules">Rules, privacy &amp; grievance contact</a><br>A fictional game. People, shows and exams are made up; FXN is a real startup owned by the game's creator. Not career, legal or investment advice. Your character and progress are saved only on this device.</footer>`;

  // ── HOME ──
  function vHome() {
    const d = AE.dailyPick(today()), dl = lifeById(d.lifeId), ds = STATES[d.stateId];
    const cont = game && !game.done;
    const done = profile.dailies.indexOf(today()) >= 0;
    return `${topbar()}
    <main class="wrap">
      <section class="hero">
        <p class="kicker">India-wide life simulator · 10 lives · 36 stations</p>
        <h1>Live a thousand lives.<br><span class="hl">Discover your own.</span></h1>
        <p class="lede">Run a ${esc(STATES.KL.food.stall)} in Kochi, crack a government exam in Kolkata or survive Spotlight House. Every choice costs pretend rupees and has real consequences.</p>
        <div class="row">
          ${cont ? `<button class="btn primary" data-act="resume">Continue: ${esc(lifeById(game.lifeId).title)}, ${esc(STATES[game.stateId].city)}</button>` : ""}
          <button class="btn ${cont ? "" : "primary"}" data-act="newlife">${char ? "Start a new life" : "Create your character"}</button>
          <button class="btn ghost" data-act="leaders">Leaderboard</button>
        </div>
      </section>
      <section class="ticket">
        <div class="ticket-l"><span class="tag">Today's challenge</span><h2>${esc(dl.title)}</h2><p>${esc(ds.city)}, ${esc(ds.name)} · same day for every player</p></div>
        <button class="btn ${done ? "" : "accent2"}" data-act="daily">${done ? "Played today ✓ Replay" : "Play today's challenge"}</button>
      </section>
      <h3 class="sec">The lives</h3>
      <div class="life-rail">${LIVES.map(L => `<div class="life-pill"><b>${esc(L.title)}</b><span>${L.unit === "Week" ? "6 weeks" : "6 months"}${L.mature ? " · Mature" : ""}</span></div>`).join("")}</div>
      <h3 class="sec">The route</h3>
      ${mapHTML(null, true)}
    </main>${footer()}`;
  }

  // ── MAP ──
  function mapHTML(sel, mini) {
    const cells = MAP.map(([id, name, c, r]) => {
      const live = !!STATES[id];
      return `<button class="tile ${live ? "live" : ""} ${sel === id ? "sel" : ""}" style="grid-column:${c + 1};grid-row:${r + 1};${live ? `--h:${STATES[id].hue}` : ""}" ${mini ? "tabindex='-1'" : `data-act="pickstate" data-arg="${id}"`} title="${esc(name)}${live ? "" : " (coming soon)"}" aria-label="${esc(name)}${live ? "" : ", coming soon"}">${id}</button>`;
    }).join("");
    return `<div class="map ${mini ? "mini" : ""}" role="group" aria-label="Map of Indian states">${cells}</div>`;
  }
  function vState() {
    const s = ui.stateId && STATES[ui.stateId];
    const m = ui.stateId && MAP.find(x => x[0] === ui.stateId);
    return `${topbar("home")}
    <main class="wrap">
      <h1 class="h1s">Choose your station</h1>
      <p class="lede">Six states are open now: Kerala, Maharashtra, Punjab, West Bengal, Rajasthan and Karnataka. The rest of India is on the route and coming soon.</p>
      ${mapHTML(ui.stateId, false)}
      ${s ? `<section class="panel state-panel" style="--h:${s.hue}">
          <p class="kicker">${esc(s.greet)} · ${esc(s.city)}</p><h2>${esc(s.name)}</h2><p>${esc(s.blurb)}</p>
          <ul class="facts"><li><span>Street food</span>${esc(s.food.item)}</li><li><span>Craft</span>${esc(s.craft.item)}</li><li><span>Festival</span>${esc(s.festival)}</li></ul>
          <button class="btn primary" data-act="tolife">Choose a life in ${esc(s.name)}</button></section>`
        : m ? `<section class="panel"><h2>${esc(m[1])}</h2><p>This station isn't open yet. Its storyline is coming in a future update.</p></section>`
        : `<p class="hint">Tap a highlighted state.</p>`}
    </main>${footer()}`;
  }

  // ── LIFE PICK ──
  function vLife() {
    const s = STATES[ui.stateId];
    return `${topbar("newlife")}
    <main class="wrap">
      <p class="kicker">${esc(s.city)}, ${esc(s.name)}</p><h1 class="h1s">Choose a life</h1>
      <div class="cards">${LIVES.map(L => `
        <button class="life-card" data-act="picklife" data-arg="${L.id}" style="--h:${s.hue}">
          <span class="lc-top"><b>${esc(L.title)}</b>${L.mature ? `<span class="pill warn">Mature</span>` : ""}</span>
          <span class="lc-tag">${esc(fillS(L.tag, ui.stateId, L.id))}</span>
          <span class="lc-meta">6 ${unitPlural(L.unit)} · ${profile.lives.indexOf(L.id) >= 0 ? "Played" : "New"}</span>
        </button>`).join("")}</div>
    </main>${footer()}`;
  }

  function vIntro() {
    const s = STATES[ui.stateId], L = lifeById(ui.lifeId);
    return `${topbar(ui.daily ? "home" : "tolife")}
    <main class="wrap">
      <section class="panel intro" style="--h:${s.hue}">
        ${ui.daily ? `<span class="tag">Today's challenge</span>` : ""}
        <p class="kicker">${esc(s.city)}, ${esc(s.name)}</p>
        <h1 class="h1s">${esc(L.title)}</h1>
        <p class="lede">${esc(fillS(L.blurb, ui.stateId, L.id))}</p>
        ${L.mature ? `<p class="note warn">Mature theme: this life shows the real risks of speculative trading and debt. It contains no real money and is not investment advice.</p>` : ""}
        <h3 class="sec">Who you'll meet</h3>
        <ul class="cast">${["m", "v", "f", "p"].map(r => `<li><span class="init" data-role="${r}">${esc(s.cast[r][0])}</span><div><b>${esc(s.cast[r])}</b><span>${esc(L.roles[r])}</span></div></li>`).join("")}</ul>
        <p class="hint">6 ${unitPlural(L.unit)}, 3 decisions each. Talk to people between decisions to build relationships.</p>
        <button class="btn primary big" data-act="start">Start this life</button>
      </section>
    </main>${footer()}`;
  }

  // ── CHARACTER CREATOR ──
  function vCreator() {
    const d = ui.draft;
    const sw = (key, arr) => arr.map((c, i) => `<button class="sw ${d[key] === i ? "on" : ""}" style="background:${c}" data-act="set" data-k="${key}" data-v="${i}" aria-label="Colour ${i + 1}"></button>`).join("");
    const chips = (key, arr, labels) => arr.map((v, i) => `<button class="chip ${d[key] === v ? "on" : ""}" data-act="set" data-k="${key}" data-v="${v}">${labels ? labels[i] : v}</button>`).join("");
    return `${topbar("home")}
    <main class="wrap creator">
      <h1 class="h1s">Create your character</h1>
      <div class="creator-grid">
        <div class="preview"><div id="avatar">${AV.svg(d, 150)}</div><p class="pv-name">${esc(d.name || "Your name")}</p><p class="hint">${d.height} cm · ${d.weight} kg</p></div>
        <div class="fields">
          <label class="f"><span>Name</span><input id="f-name" maxlength="18" value="${esc(d.name)}" placeholder="e.g. Arjun" autocomplete="off"></label>
          <div class="f"><span>Pronouns</span><div class="chips">${chips("pronoun", ["he", "she", "they"], ["He/him", "She/her", "They/them"])}</div></div>
          <div class="f"><span>Skin tone</span><div class="sws">${sw("skin", AV.SKIN)}</div></div>
          <label class="f"><span>Height: <b id="hv">${d.height} cm</b></span><input type="range" id="f-height" min="140" max="200" value="${d.height}"></label>
          <label class="f"><span>Weight: <b id="wv">${d.weight} kg</b></span><input type="range" id="f-weight" min="40" max="120" value="${d.weight}"></label>
          <div class="f"><span>Hair</span><div class="chips">${chips("hair", AV.STYLES.hair)}</div></div>
          <div class="f"><span>Hair colour</span><div class="sws">${sw("hairColor", AV.HAIR)}</div></div>
          <p class="note">Everyone starts in plain basics. Rent outfits for events from the <b>FXN app</b> inside the game.</p>
          <div class="f"><span>Extras</span><div class="chips">${chips("acc", AV.STYLES.acc)}</div></div>
          ${langPicker()}
          <p class="note">Looks are just for fun. They never change your story, chances or results.</p>
          <button class="btn primary big" data-act="savechar">Save character</button>
        </div>
      </div>
    </main>${footer()}`;
  }

  // ── PLAY ──
  function hud(g) {
    const L = AE.life(g);
    const bar = (label, v, cls) => `<div class="stat ${cls || ""}"><span>${label}</span><div class="bar"><i style="width:${v}%"></i></div><b>${Math.round(v)}</b></div>`;
    return `<section class="hud">
      <div class="hud-top"><div class="cash"><span>Cash</span><b class="${g.cash < 0 ? "neg" : ""}">${inr(g.cash)}</b></div>
        <div class="prog"><span>${L.unit} ${Math.min(g.chapter, 6)} of 6</span><div class="dots">${[0, 1, 2].map(i => `<i class="${i < g.step ? "on" : ""}"></i>`).join("")}</div></div></div>
      <div class="stats">${bar("Reputation", g.r)}${bar("Happiness", g.h, g.h < 30 ? "low" : "")}${bar(esc(L.sl), g.s)}
        <div class="stat metric"><span>${esc(L.xl)}</span><b>${AE.metric(g)}</b></div></div>
    </section>`;
  }
  function deltaPills(d, g) {
    const L = AE.life(g), out = [];
    if (d.cash) out.push(`<span class="dp ${d.cash > 0 ? "up" : "down"}">${d.cash > 0 ? "+" : ""}${inr(d.cash)}</span>`);
    const names = { r: "Reputation", h: "Happiness", s: L.sl, x: L.xl };
    ["r", "h", "s", "x"].forEach(k => { if (d[k]) out.push(`<span class="dp ${d[k] > 0 ? "up" : "down"}">${esc(names[k])} ${d[k] > 0 ? "+" : ""}${d[k]}</span>`); });
    ["m", "v", "f", "p"].forEach(k => { const v = d["rel_" + k]; if (v) out.push(`<span class="dp ${v > 0 ? "up" : "down"}">${esc(AE.st(g).cast[k])} ${v > 0 ? "♥" : "↓"}</span>`); });
    return out.join("");
  }
  // ── PLAY ──
  const FX = window.AE_FXN, STATES_ = STATES;
  const locState = g => STATES_[g.loc || g.stateId];
  const away = g => (g.loc || g.stateId) !== g.stateId;
  const fxItem = id => FX.catalogue.find(i => i.id === id) || null;
  const outfitLook = g => { const it = g && g.outfit && fxItem(g.outfit); return it ? it.look : null; };
  const rentPrice = (g, it) => Math.round(it.price * (g.pass ? 1 - FX.passDiscount : 1) * (AE.life(g).raw ? 1 : AE.ci(g)) / 10) * 10;
  function cityEvent(g) {
    if (AE.life(g).closed) return null;
    const list = FX.events.filter(e => (!e.lives || e.lives.indexOf(g.lifeId) >= 0) && (!e.states || e.states.indexOf(g.stateId) >= 0));
    if (!list.length) return null;
    const ev = list[(g.seed + g.chapter * 7) % list.length];
    return (g.eventsDone || []).indexOf(g.chapter + ":" + ev.id) >= 0 ? null : ev;
  }
  const dressName = tag => ({ festival: "festive wear", onam: "Kasavu", wedding: "wedding wear", formal: "office formals", party: "party wear", premiere: "red-carpet look", sport: "cricket whites" }[tag] || tag);
  const wearing = (g, tag) => { const it = g.outfit && fxItem(g.outfit); return !!(it && it.tags.indexOf(tag) >= 0); };

  function vPlay() {
    const g = game, s = AE.st(g), L = AE.life(g), here = locState(g);
    if (g.done) return vEnding();
    let body;
    if (ui.outcome) {
      const o = ui.outcome;
      body = `<section class="card outcome">
        ${o.passed === true ? `<span class="pill good">It worked</span>` : o.passed === false ? `<span class="pill bad">Didn't work out</span>` : ""}
        ${o.complete ? `<span class="pill good">Mission complete</span>` : ""}
        <p class="result">${esc(o.text)}</p>
        <div class="deltas">${deltaPills(o.d, g)}</div>
        ${o.reaction ? `<div class="bubble"><span class="init" data-role="${o.reaction.role}">${esc(o.reaction.name[0])}</span><div><b>${esc(o.reaction.name)}</b>${speech(o.reaction.line, o.reaction.sub)}</div></div>` : ""}
        <button class="btn primary big" data-act="next">${o.summary ? (g.done ? "See how it ended" : `End of ${L.unit.toLowerCase()} ${o.summary.chapter}`) : "Continue"}</button>
      </section>`;
    } else if (ui.mscene) {
      const m = ui.mscene;
      body = `<section class="card event"><span class="tag">Mission</span><p class="ev-text">${esc(m.t)}</p>
        <div class="choices">${m.kind === "scene" ? m.c.map((c, i) => `<button class="choice" data-act="mchoose" data-arg="${i}"><span>${esc(c.l)}</span>${c.ck ? `<span class="pill">${Math.round(AE.chance(g, c.ck) * 100)}% chance</span>` : ""}</button>`).join("") : `<button class="choice" data-act="mchoose" data-arg="0"><span>Finish the mission</span></button>`}</div></section>`;
    } else if (ui.cityEv) {
      const ev = ui.cityEv;
      body = `<section class="card event"><span class="tag">${esc(AE.fill(ev.title, g))}</span><p class="ev-text">${esc(AE.fill(ev.t, g))}</p>
        <div class="choices">${ev.c.map((c, i) => `<button class="choice" data-act="evchoose" data-arg="${i}"><span>${esc(AE.fill(c.l, g))}</span>${c.ck ? `<span class="pill">${Math.round(AE.chance(g, c.ck) * 100)}% chance</span>` : ""}</button>`).join("")}</div></section>`;
    } else if (away(g)) {
      body = `<section class="card next"><p class="ev-teaser">You're visiting <b>${esc(here.city)}</b>. Your next scene is waiting back home in <b>${esc(s.city)}</b>. Explore and meet players, then <b>walk to the Railway Station</b> to buy a ticket home. Follow the arrow, or tap the mini map to see where it is.</p>
        ${WORLD.available() ? "" : `<button class="btn primary" data-act="travelopen">Train tickets</button>`}</section>`;
    } else if (!ui.eventOpen) {
      const ev = AE.nextEvent(g); save();
      const who = ev.who;
      ui._marker = who || "board";
      body = `<section class="card next"><p class="ev-teaser">${who ? `<b>${esc(s.cast[who])}</b> wants a word. Walk to the <span class="bang">!</span> in the city.` : `Something's up at the <b>Notice Board</b>. Walk to the <span class="bang">!</span>.`} Follow the arrow, or tap the mini map to see the way.</p>
        ${WORLD.available() ? "" : `<button class="btn primary" data-act="openev">Open it now</button>`}</section>`;
    } else {
      const ev = AE.nextEvent(g); save();
      const who = ev.who;
      body = `<section class="card event">
        ${who ? `<div class="speaker"><span class="init" data-role="${who}">${esc(s.cast[who][0])}</span><b>${esc(s.cast[who])}</b><span>${esc(L.roles[who])}</span></div>` : ""}
        <p class="ev-text">${esc(AE.fill(ev.t, g))}</p>
        <div class="choices">${ev.c.map((c, i) => {
          const can = AE.canChoose(g, c), need = AE.needOf(g, c);
          const risk = c.ck ? `<span class="pill">${Math.round(AE.chance(g, c.ck) * 100)}% chance</span>` : "";
          return `<button class="choice" data-act="choose" data-arg="${i}" ${can ? "" : "disabled"}><span>${esc(AE.fill(c.l, g))}</span>${risk}${!can ? `<span class="pill bad">Needs ${inr(need)}</span>` : ""}</button>`;
        }).join("")}</div>
      </section>`;
    }
    const tools = `<div class="row tools"><button class="btn ghost" data-act="talk">Talk to someone</button><button class="btn fxn-btn" data-act="fxnopen">FXN app</button>${L.closed || WORLD.available() ? "" : `<button class="btn ghost" data-act="travelopen">Train</button>`}</div>`;
    return `${topbar("home")}<main class="wrap play" style="--h:${here.hue}">
      <p class="kicker">${esc(L.title)} · ${esc(here.city)}${away(g) ? ` (visiting, home: ${esc(s.city)})` : ""}${g.outfit ? ` · wearing ${esc(fxItem(g.outfit).name)}` : ""}</p>
      ${hud(g)}<div id="world-slot"></div>
      ${NET.enabled() ? `<p class="hint net-note">Other players see you as <b>${esc(NET.nick())}</b>, never your real name. Tap a player to mute or report them.</p>` : ""}
      ${body}${tools}${ui.talk ? talkSheet() : ""}${ui.muteTarget ? muteSheet() : ""}${ui.ageGate ? ageSheet() : ""}${ui.fxn ? fxnSheet() : ""}${ui.travel ? travelSheet() : ""}</main>`;
  }

  function fxnSheet() {
    const g = game, tab = ui.fxnTab || "all", ev = !away(g) && cityEvent(g), here = g.loc || g.stateId;
    const tabs = [["all", "All"], ev ? ["event", "Tonight's dress code"] : null, ["local", "Local wear: " + locState(g).name], ["wedding", "Wedding"], ["festival", "Festival"], ["formal", "Formal"], ["party", "Party"], ["sport", "Sport"]].filter(Boolean);
    const items = FX.catalogue.filter(it => tab === "all" || (tab === "event" ? it.tags.indexOf(ev.dress) >= 0 : tab === "local" ? it.tags.indexOf("local:" + here) >= 0 : it.tags.indexOf(tab) >= 0));
    const gigDone = g.gig && g.gig.chapter === g.chapter;
    return `<div class="sheet-bg" data-act="fxnclose"></div><section class="sheet fxn" role="dialog" aria-label="FXN app">
      <div class="fxn-head"><b class="fxn-logo">FXN</b><span>Rent it. Wear it. Return it.</span></div>
      ${ui.courier ? `<p class="note">${esc(ui.courier)} is on the way with your outfit. Stay where you are.</p>` : ""}
      <div class="chips">${tabs.map(t => `<button class="chip ${tab === t[0] ? "on" : ""}" data-act="fxntab" data-arg="${t[0]}">${esc(t[1])}</button>`).join("")}</div>
      <div class="fxn-grid">${items.map(it => {
        const price = rentPrice(g, it), mine = g.outfit === it.id, can = g.cash >= price && !ui.courier;
        return `<div class="fxn-item"><span class="sw2" style="--a:${it.look.top};--b:${it.look.bottom};--c:${it.look.trim || it.look.top}"></span>
          <b>${esc(it.name)}</b><span class="price">${inr(price)} <s>${inr(Math.round(it.buy * (AE.life(g).raw ? 1 : AE.ci(g)) / 10) * 10)}</s></span>
          ${it.tags.filter(t => t.indexOf("local:") === 0).map(t => `<span class="pill">${esc(STATES_[t.slice(6)].name)} wear</span>`).join("")}
          ${mine ? `<span class="pill good">Wearing</span>` : `<button class="btn small ${can ? "primary" : ""}" data-act="rent" data-arg="${it.id}" ${can ? "" : "disabled"}>Rent</button>`}</div>`;
      }).join("")}</div>
      <div class="fxn-foot">
        ${g.outfit ? `<button class="btn ghost" data-act="returnfit">Return my outfit now</button>` : ""}
        ${g.pass ? `<span class="pill good">FXN Pass active: ${Math.round(FX.passDiscount * 100)}% off</span>` : `<button class="btn" data-act="buypass" ${g.cash >= FX.passPrice ? "" : "disabled"}>Get FXN Pass for ${inr(FX.passPrice)} (${Math.round(FX.passDiscount * 100)}% off all rentals this life)</button>`}
        ${gigDone ? `<span class="pill">Delivery shift done this ${AE.life(g).unit.toLowerCase()}</span>` : g.gig && g.gig.left > 0 && g.gig.chapter === g.chapter ? "" : `<button class="btn accent2" data-act="gigstart" ${away(g) ? "disabled" : ""}>Work an FXN delivery shift (${FX.gig.drops} drops, ${inr(Math.round(FX.gig.pay * (AE.life(g).raw ? 1 : AE.ci(g)) / 10) * 10)} each)</button>`}
        <p class="hint">Rentals go back automatically at the end of each ${AE.life(g).unit.toLowerCase()}. ${esc(FX.disclosure)}</p>
      </div>
      <button class="btn" data-act="fxnclose">Close</button></section>`;
  }
  function travelSheet() {
    const g = game, fare = AE.fare(g), here = g.loc || g.stateId;
    return `<div class="sheet-bg" data-act="travelclose"></div><section class="sheet" role="dialog" aria-label="Train tickets">
      <h2>Train tickets from ${esc(locState(g).city)}</h2>
      <p class="hint">Each ticket costs ${inr(fare)}. Travelling doesn't use up any of your ${AE.life(g).unit.toLowerCase()}s.</p>
      <div class="cards">${Object.keys(STATES_).filter(k => k !== here).map(k => `<button class="life-card" data-act="travel" data-arg="${k}" style="--h:${STATES_[k].hue}" ${g.cash >= fare ? "" : "disabled"}>
        <span class="lc-top"><b>${esc(STATES_[k].city)}</b>${k === g.stateId ? `<span class="pill good">Home</span>` : ""}</span><span class="lc-tag">${esc(STATES_[k].name)}</span></button>`).join("")}</div>
      <button class="btn" data-act="travelclose">Not now</button></section>`;
  }

  function currentGuide() {
    const g = game; if (!g || g.done) return null;
    // No shortcuts: in 3D every place must be reached on foot. Buttons only appear if the device can't run 3D.
    const walk = !WORLD.available(), go = k => walk ? [["goto:" + k, "Go there"]] : [];
    if (ui.courier) return { text: ui.courier + " from FXN is on the way", sub: "Stay where you are", key: null };
    if (g.gig && g.gig.chapter === g.chapter && g.gig.left > 0) return { text: "FXN delivery: drop the parcel at the glowing house", sub: g.gig.left + " left", key: "gig", actions: go("gig") };
    const mg = AE.missionGuide(g);
    if (mg) return { text: mg.title + ": " + mg.text, key: mg.target, actions: go(mg.target) };
    if (!away(g)) {
      const ev = cityEvent(g), ok = ev && wearing(g, ev.dress);
      const evSub = ev ? "Also: " + AE.fill(ev.title, g) + " (dress code: " + dressName(ev.dress) + (ok ? " ✓" : "") + ")" : "";
      const evActs = ev ? (ok ? go("hall") : [["fxnopen", "Rent on FXN"]]) : [];
      if (!ui.eventOpen && !ui.outcome && ui._marker) return { text: (ui._marker === "board" ? "Next scene: walk to the Notice Board" : "Next scene: walk to " + AE.st(g).cast[ui._marker]), sub: evSub, key: ui._marker, actions: (walk ? [["openev", "Open it now"]] : []).concat(evActs) };
      if (ev) return { text: AE.fill(ev.title, g), sub: "Dress code: " + dressName(ev.dress) + (ok ? " ✓" : ""), key: "hall", actions: evActs.length ? evActs : go("hall") };
    } else return { text: "Your next scene is back in " + AE.st(g).city, sub: "Walk to the Railway Station to buy a ticket home", key: "station", actions: go("station") };
    return null;
  }
  function refreshGuide() { if (ui.view === "play" && game && !game.done) WORLD.setGuide(currentGuide()); }

  function onArrive(k) {
    const g = game; if (!g || g.done || ui.outcome || ui.mscene || ui.cityEv) return;
    const mg = AE.missionGuide(g);
    if (mg && mg.target === k) {
      if (k === "station") { ui.travel = true; render(); return; }
      if ((mg.m.step === 2 && away(g)) || (mg.m.step === 4 && !away(g))) { ui.mscene = AE.missionScene(g); render(); return; }
    }
    if (k === "gig" && g.gig && g.gig.left > 0) return gigDrop();
    if (k === "hall" && !away(g)) return enterHall();
    if (!away(g) && k === ui._marker && !ui.eventOpen) { ui.eventOpen = true; render(); }
  }
  function enterHall() {
    const g = game, ev = cityEvent(g);
    if (!ev) { WORLD.note("Nothing on at the Town Hall right now."); return; }
    if (!wearing(g, ev.dress)) { WORLD.note("Bouncer: \"Dress code is " + dressName(ev.dress) + ". FXN delivers in minutes.\""); refreshGuide(); return; }
    ui.cityEv = ev; render();
  }
  function gigDrop() {
    const g = game, pay = Math.round(FX.gig.pay * (AE.life(g).raw ? 1 : AE.ci(g)) / 10) * 10;
    g.cash += pay; g.gig.left--;
    WORLD.note("Parcel delivered: +" + inr(pay) + (g.gig.left ? ". Next drop is marked." : ". Shift complete!"));
    if (g.gig.left > 0) { g.gig.target = WORLD.randomDoor(AE.rnd(g)); WORLD.setExtraSpot("gig", g.gig.target); }
    else { WORLD.setExtraSpot("gig", null); g.r = Math.min(100, g.r + 3); }
    save(); render();
  }
  function spotLabel(k) {
    const g = game, here = locState(g);
    if (["m", "f", "v", "p"].indexOf(k) >= 0) return "Talk to " + here.cast[k];
    if (k === "station") return AE.life(g).closed ? null : "Buy a train ticket";
    if (k === "fxn") return "Open FXN store";
    if (k === "hall") return away(g) ? null : "Enter the Town Hall";
    if (k === "gig") return "Deliver parcel";
    return null;
  }
  function onSpot(k) {
    if (["m", "f", "v", "p"].indexOf(k) >= 0) { ui.talk = true; ui.talkRole = k; ui.talkAnswer = null; return render(); }
    if (k === "station") { ui.travel = true; return render(); }
    if (k === "fxn") { ui.fxn = true; return render(); }
    if (k === "hall") return enterHall();
    if (k === "gig") return gigDrop();
  }
  function rent(id) {
    const g = game, it = fxItem(id), price = rentPrice(g, it);
    if (!it || g.cash < price || ui.courier) return;
    g.cash -= price; save();
    const st = locState(g), name = FX.courierNames[g.loc || g.stateId] || "Rider";
    ui.courier = name; ui.fxn = false; render();
    WORLD.spawnCourier(name, { skin: 4, height: 172, weight: 64, hair: "short", hairColor: 0, acc: "cap" }, { top: "#ff4f9a", bottom: "#1b1830", style: "tee", trim: "#1b1830" }, () => {
      g.outfit = id; ui.courier = null; save();
      WORLD.setLook(char || g.player, it.look);
      WORLD.courierSay(FX.courierLines[Math.floor(AE.rnd(g) * FX.courierLines.length)]);
      WORLD.note("Delivered: " + it.name + ". Looking sharp!");
      if (away(g) && it.tags.indexOf("local:" + g.loc) >= 0 && !(g.localBonus || []).includes(g.loc)) { g.localBonus = (g.localBonus || []).concat(g.loc); g.r = Math.min(100, g.r + 5); WORLD.note("Locals in " + st.city + " love your " + it.name + "! +5 reputation"); }
      NET.setOutfit && NET.setOutfit(id);
      render();
    });
  }

  function talkSheet() {
    const g = game, s = locState(g), L = AE.life(g), visiting = away(g);
    const role = ui.talkRole;
    let inner;
    if (!role) {
      inner = `<h2>Who do you want to talk to?</h2><ul class="cast pick">${["m", "v", "f", "p"].map(r => {
        const md = visiting ? "neutral" : AE.mood(g.rel[r]);
        return `<li><button data-act="talkto" data-arg="${r}"><span class="init" data-role="${r}">${esc(s.cast[r][0])}</span><div><b>${esc(s.cast[r])}</b><span>${visiting ? "local in " + esc(s.city) : esc(L.roles[r])}</span></div><span class="pill ${md === "warm" ? "good" : md === "cold" ? "bad" : ""}">${md === "warm" ? "Friendly" : md === "cold" ? "Cold" : "Neutral"}</span></button></li>`;
      }).join("")}</ul>`;
    } else {
      inner = `<div class="speaker"><span class="init" data-role="${role}">${esc(s.cast[role][0])}</span><b>${esc(s.cast[role])}</b></div>
        ${ui.talkAnswer ? `<div class="bubble big">${speech(ui.talkAnswer.text, ui.talkAnswer.sub)}${ui.talkAnswer.gain ? `<span class="pill good">You grew closer</span>` : ""}</div>` : ""}
        <div class="choices">${COMMON.talk.map((t, i) => `<button class="choice small" data-act="ask" data-arg="${i}">${esc(AE.fill(t.q, g))}</button>`).join("")}</div>
        <button class="btn ghost" data-act="talkback">Talk to someone else</button>`;
    }
    return `<div class="sheet-bg" data-act="closetalk"></div><section class="sheet" role="dialog" aria-label="Talk">${inner}<button class="btn" data-act="closetalk">Back to your day</button></section>`;
  }

  function muteSheet() {
    return `<div class="sheet-bg" data-act="closemute"></div><section class="sheet" role="dialog" aria-label="Mute player">
      <h2>${esc(ui.muteTarget.nick)}</h2>
      ${ui.reported ? `<p>Report sent. We've also muted this player for you. Reports are reviewed within 24 hours.</p><button class="btn" data-act="closemute">Close</button>`
      : `<p class="hint">Mute hides this player and their messages for the rest of your visit. Report sends their last few messages to the game's grievance officer for review.</p>
      <label class="f"><span>Reason (for reports)</span><select id="f-reason"><option>Abuse or bullying</option><option>Sexual or vulgar messages</option><option>Asking for personal details</option><option>Scam or spam</option><option>Hate speech</option><option>Other</option></select></label>
      <div class="row"><button class="btn" data-act="mute">Mute</button><button class="btn danger" data-act="report">Report and mute</button><button class="btn ghost" data-act="closemute">Cancel</button></div>`}</section>`;
  }
  function ageSheet() {
    return `<div class="sheet-bg" data-act="closeage"></div><section class="sheet" role="dialog" aria-label="Age check">
      <h2>Typed chat is for players 18 and over</h2>
      <p class="hint">Under 18? You can still talk to everyone with the Say… phrases and emotes. Never share your phone number, address, school or social handles with anyone in a game.</p>
      <div class="row"><button class="btn primary" data-act="adult">I'm 18 or older</button><button class="btn" data-act="notadult">I'm under 18</button></div></section>`;
  }
  function vRules() {
    return `${topbar("home")}<main class="wrap"><section class="card rules">
      <h1 class="h1s">Rules, privacy &amp; contact</h1>
      <h2>Chat rules</h2>
      <ul><li>Typed chat is only for players 18 and over. Everyone can use the preset Say… phrases and emotes.</li>
        <li>Be decent: no abuse, bullying, hate speech, sexual or vulgar messages, threats, scams or spam.</li>
        <li>No personal details: phone numbers, links, emails, UPI IDs and social handles are blocked automatically. Never share your address or school.</li>
        <li>Messages only reach players near you in the same city. They are not saved and vanish after a few seconds.</li>
        <li>Tap any player to <b>Mute</b> or <b>Report</b> them. Breaking these rules can get you blocked from chat.</li></ul>
      <h2>Privacy</h2>
      <ul><li>No sign-up. Your character, name and progress stay in this browser only. Other players see a random nickname, never your name.</li>
        <li>When you report someone, their last few chat messages, their nickname and your reason are saved for review, then deleted after the complaint is closed.</li></ul>
      <h2>Grievance officer</h2>
      <p><b>${esc(GRIEVANCE.name)}</b><br>Email: <b>${esc(GRIEVANCE.email)}</b><br><a href="mailto:${esc(GRIEVANCE.email)}?subject=Next%20Station%20grievance">Send an email</a></p>
      <p class="hint">Complaints are acknowledged within 24 hours and resolved within 15 days. Reports of sexual content or impersonation are acted on within 24 hours. Include the player's nickname, the city and the time.</p>
      <h2>About FXN in the game</h2>
      <p class="hint">${esc(FX.disclosure)} Renting in the game uses in-game money only. Nothing here can be bought with real money.</p>
      <p class="hint">Next Station is a free game. Its people, shows and exams are fictional. It is not career, legal or investment advice.</p>
      <button class="btn primary" data-act="home">Back to the game</button></section></main>${footer()}`;
  }

  function mountWorld() {
    const slot = document.getElementById("world-slot");
    if (!game || game.done) { NET.leave(); netKey = null; return; }
    if (!slot) return;
    const g = game, here = locState(g), loc = g.loc || g.stateId, key = g.seed + ":" + g.lifeId + ":" + loc;
    WORLD.mount(slot, {
      key, stateId: loc, lifeId: g.lifeId, hue: here.hue, cast: here.cast, avatar: char || g.player, meLabel: (char || g.player).name, outfit: outfitLook(g),
      words: { stall: here.food.stall, city: here.city, v: here.cast.v },
      onArrive, spotLabel, onSpot,
      onGuideAction: a => {
        if (a.indexOf("goto:") === 0) { if (WORLD.available()) return; const k = a.slice(5); onArrive(k); }
        else if (a === "openev") { ui.eventOpen = true; render(); }
        else if (a === "fxnopen") { ui.fxn = true; render(); }
      },
      onMove: (x, y) => NET.move(x, y),
      onSay: (k, i) => { const t = NET.say(k, i); if (t) WORLD.meSay(t); },
      onChatOpen: () => { if (prefs.adult === true) return true; if (prefs.adult === false) { WORLD.note("Typed chat is for 18+. Use Say… phrases instead."); return false; } ui.ageGate = true; render(); return false; },
      onType: v => { const r = NET.sendText(v); if (r.ok) { WORLD.meSay(r.text, true); return true; } WORLD.note(r.reason); return false; },
      onRemoteTap: (id, nick) => { ui.muteTarget = { id, nick }; render(); }
    });
    if (g.gig && g.gig.chapter === g.chapter && g.gig.left > 0) WORLD.setExtraSpot("gig", g.gig.target);
    WORLD.setMarker(!away(g) && !ui.outcome && !ui.eventOpen && !ui.mscene && !ui.cityEv ? ui._marker : null);
    refreshGuide();
    const o = ui.outcome;
    if (o && o.reaction && !o._shown) { o._shown = true; WORLD.npcSay(o.reaction.role, o.reaction.line, prefs.subs ? o.reaction.sub : null); }
    if (NET.enabled() && netKey !== key) {
      netKey = key;
      WORLD.clearRemotes();
      NET.join(loc, char || g.player, WORLD.position(), {
        onJoin: (id, d) => WORLD.upsertRemote(id, Object.assign({}, d, { outfit: d.o && fxItem(d.o) ? fxItem(d.o).look : null, outfitKey: d.o || "", nick: d.nick + (d.hs ? " · " + d.hs : "") })),
        onUpdate: (id, d) => WORLD.upsertRemote(id, Object.assign({}, d, { outfit: d.o && fxItem(d.o) ? fxItem(d.o).look : null, outfitKey: d.o || "", nick: d.nick + (d.hs ? " · " + d.hs : "") })),
        onMove: (id, x, y) => WORLD.moveRemote(id, x, y),
        onSay: (id, t, typed) => WORLD.sayRemote(id, t, typed),
        onLeave: id => WORLD.removeRemote(id),
        onCount: n => WORLD.setOnline(n, NET.PHRASES, NET.EMOTES, true)
      }, { o: g.outfit || "", hs: g.stateId }).catch(() => { netKey = null; });
    }
  }

  // ── CHAPTER SUMMARY ──
  function vSummary() {
    const g = game, sm = g.summary, L = AE.life(g);
    return `${topbar("home")}<main class="wrap" style="--h:${AE.st(g).hue}">
      <section class="card">
        <p class="kicker">${esc(L.title)} · ${esc(AE.st(g).city)}</p>
        <h1 class="h1s">${L.unit} ${sm.chapter} wrap-up</h1>
        <table class="ledger">${sm.lines.map(l => `<tr><td>${esc(l.label)}</td><td class="${l.kind === "money" ? (l.amount >= 0 ? "up" : "down") : ""}">${l.kind === "money" ? (l.amount > 0 ? "+" : "") + inr(l.amount) : l.amount.toLocaleString("en-IN")}</td></tr>`).join("")}
          <tr class="tot"><td>Net this ${L.unit.toLowerCase()}</td><td class="${sm.net >= 0 ? "up" : "down"}">${sm.net > 0 ? "+" : ""}${inr(sm.net)}</td></tr>
          <tr class="tot"><td>Cash now</td><td>${inr(sm.cash)}</td></tr></table>
        <p class="hint">${esc(L.xl)}: ${AE.metric(g)} · Reputation ${g.r} · Happiness ${g.h}</p>
        <button class="btn primary big" data-act="aftersummary">${g.done ? "See how your life turned out" : `Start ${L.unit.toLowerCase()} ${g.chapter}`}</button>
      </section></main>`;
  }

  // ── ENDING ──
  function award(g) {
    if (g.awarded) return;
    g.awarded = true;
    const before = profile.badges.slice(), xp0 = profile.xp;
    profile.runs++;
    let xp = 100;
    if (profile.lives.indexOf(g.lifeId) < 0) { profile.lives.push(g.lifeId); xp += 30; }
    if (profile.states.indexOf(g.stateId) < 0) profile.states.push(g.stateId);
    const ek = g.lifeId + ":" + g.result.id;
    if (profile.endings.indexOf(ek) < 0) { profile.endings.push(ek); xp += 40; }
    if (g.daily && profile.dailies.indexOf(g.daily) < 0) { profile.dailies.push(g.daily); xp += 50; }
    profile.xp += xp;
    const B = id => { if (profile.badges.indexOf(id) < 0) profile.badges.push(id); };
    B("first");
    if (profile.lives.length >= 5) B("five");
    if (profile.lives.length >= 10) B("all10");
    if (Object.keys(STATES).every(k => profile.states.indexOf(k) >= 0)) B("explorer");
    if (g.stateId === "KL") B("kerala");
    if (g.shady === 0) B("honest");
    if (g.cash >= 100000) B("lakh");
    if (g.minCash < 1000 && g.cash >= 10000) B("comeback");
    if (["m", "v", "f", "p"].every(r => g.rel[r] >= 30)) B("friends");
    if (profile.endings.length >= 12) B("endings");
    if (g.daily) B("daily");
    if (g.lifeId === "trader" && AE.has(g, "quit")) B("walked");
    if (AE.has(g, "emergencyfund")) B("rainy");
    const sc = AE.score(g);
    g.scoreVal = sc;
    profile.best = profile.best || {};
    const pb = profile.best[g.lifeId];
    ui.newBest = !pb || sc > pb.score;
    if (ui.newBest) profile.best[g.lifeId] = { score: sc, ending: g.result.t, state: g.stateId, date: today() };
    if (g.daily) { profile.dailyBest = profile.dailyBest || {}; if (!profile.dailyBest[g.daily] || sc > profile.dailyBest[g.daily]) profile.dailyBest[g.daily] = sc; }
    if (NET.configured()) NET.submitScore({ life: g.lifeId, state: g.stateId, ending: g.result.id, score: sc, daily: g.daily || null });
    ui.newBadges = profile.badges.filter(b => before.indexOf(b) < 0);
    ui.xpGain = profile.xp - xp0;
    save();
  }
  function shareText(g) {
    const L = AE.life(g), s = AE.st(g);
    const row = (g.nets || []).map(n => (n >= 0 ? "▲" : "▼")).join("");
    return `${GAME_NAME.toUpperCase()} · ${L.title} · ${s.city}${g.daily ? " · Daily " + g.daily : ""}\n${L.unit} 6 · ${inr(g.cash)} · Rep ${g.r} · Ending: ${g.result.t}\n${row}\n(simulation achievement, not real money)`;
  }
  function vEnding() {
    const g = game, L = AE.life(g), s = AE.st(g);
    award(g);
    const bad = ["margincall", "broke", "burnout", "banned", "suspended"].indexOf(g.result.id) >= 0;
    const key = g.log.slice().sort((a, b) => (Math.abs(b.d.cash || 0) / 1000 + Math.abs(b.d.r || 0) + Math.abs(b.d.x || 0)) - (Math.abs(a.d.cash || 0) / 1000 + Math.abs(a.d.r || 0) + Math.abs(a.d.x || 0))).slice(0, 3);
    const badgeById = id => COMMON.badges.find(b => b.id === id);
    return `${topbar("home")}<main class="wrap" style="--h:${s.hue}">
      <section class="card ending">
        <div class="end-head"><div class="end-av">${AV.svg(g.player, 96)}</div><div><p class="kicker">${esc(L.title)} · ${esc(s.city)}, ${esc(s.name)}</p><h1 class="h1s">${esc(g.result.t)}</h1><p>${esc(g.result.d)}</p></div></div>
        <div class="grid4"><div><span>Final cash</span><b>${inr(g.cash)}</b></div><div><span>Reputation</span><b>${g.r}</b></div><div><span>${esc(L.xl)}</span><b>${AE.metric(g)}</b></div><div><span>Happiness</span><b>${g.h}</b></div></div>
        ${ui.xpGain ? `<p class="xp">Score ${g.scoreVal}${ui.newBest ? " · New personal best!" : ""} · +${ui.xpGain} XP · Level ${level(profile.xp)}</p>` : ""}
        ${ui.newBadges.length ? `<div class="badges new">${ui.newBadges.map(b => `<span class="badge on"><b>${esc(badgeById(b).t)}</b>${esc(badgeById(b).d)}</span>`).join("")}</div>` : ""}
        ${bad && (g.lifeId === "trader" || g.result.id === "burnout" || g.result.id === "broke") ? `<p class="note warn">If money stress or anxiety is affecting you in real life, Tele-MANAS is the government's free, 24/7 mental health helpline: <b>14416</b> or <b>1-800-891-4416</b>.</p>` : ""}
      </section>
      <section class="card"><h2>The moments that mattered</h2>
        <ol class="key">${key.map(k => `<li><p class="q">${esc(k.t)}</p><p><b>You chose:</b> ${esc(k.l)}</p><p class="hint">${esc(k.r)}</p>${k.alt.length ? `<p class="what">What if you'd chosen: ${k.alt.map(esc).join(" / ")}?</p>` : ""}</li>`).join("")}</ol></section>
      <section class="card"><h2>Your journey</h2>
        <ol class="timeline">${g.log.map(e => `<li><span>${L.unit[0]}${e.c}</span><div><b>${esc(e.l)}</b><p>${esc(e.r)}</p></div></li>`).join("")}</ol></section>
      <section class="card"><h2>Reality check</h2><p>${esc(AE.REALITY[g.lifeId])}</p></section>
      <section class="card"><h2>Share your result</h2><pre class="share" id="sharetext">${esc(shareText(g))}</pre>
        <button class="btn accent2" data-act="copy">${ui.copied ? "Copied ✓" : "Copy result"}</button><p class="hint">Paste it on WhatsApp or Instagram and challenge friends to beat you.</p></section>
      <div class="row center"><button class="btn primary" data-act="again">Play this life again</button><button class="btn" data-act="newlife">Try another life</button><button class="btn" data-act="leaders">Leaderboard</button></div>
    </main>${footer()}`;
  }

  // ── LEADERBOARD ──
  function vLeaders() {
    const tab = ui.ltab || "daily", d = today(), live = NET.configured();
    const tabs = [["daily", "Today's challenge"], ["life", "Best by life"], ["mine", "My bests"]];
    let body = "";
    if (tab === "mine") {
      const best = profile.best || {};
      body = `<table class="ledger lb">${LIVES.map(L => { const b = best[L.id]; return `<tr><td>${esc(L.title)}</td><td>${b ? `${b.score} <span class="hint">${esc(b.ending)} · ${esc(STATES[b.state].city)}</span>` : `<span class="hint">Not played</span>`}</td></tr>`; }).join("")}</table>`;
    } else if (!live) {
      body = `<p class="note">The global leaderboard switches on once the game is connected to its online service. Until then, here are your own scores.</p>
        ${tab === "daily" ? `<p>Your best in today's challenge: <b>${(profile.dailyBest || {})[d] != null ? profile.dailyBest[d] : "not played yet"}</b></p>` : ""}`;
    } else if (!ui.lrows) body = `<p class="hint">Loading…</p>`;
    else if (!ui.lrows.length) body = `<p class="hint">No scores yet. Be the first!</p>`;
    else body = `<table class="ledger lb">${ui.lrows.map((r, i) => `<tr><td>#${i + 1} ${esc(r.nick)}</td><td>${r.score} <span class="hint">${esc((lifeById(r.life) || {}).title || r.life)} · ${esc((STATES[r.state] || {}).city || r.state)}</span></td></tr>`).join("")}</table>`;
    const lifePick = tab === "life" && live ? `<div class="chips">${LIVES.map(L => `<button class="chip ${ui.llife === L.id ? "on" : ""}" data-act="llife" data-arg="${L.id}">${esc(L.title)}</button>`).join("")}</div>` : "";
    return `${topbar("home")}<main class="wrap"><section class="card"><h1 class="h1s">Leaderboard</h1>
      <div class="chips">${tabs.map(t => `<button class="chip ${tab === t[0] ? "on" : ""}" data-act="ltab" data-arg="${t[0]}">${t[1]}</button>`).join("")}</div>
      ${lifePick}${body}
      <p class="hint">Score = final cash, reputation, your life's main stat, how good your ending was and missions completed, minus shady choices. Players are shown by random nickname only.</p>
      <button class="btn primary" data-act="home">Back</button></section></main>${footer()}`;
  }
  async function loadLeaders() {
    if (!NET.configured() || ui.view !== "leaders") return;
    const tab = ui.ltab || "daily";
    if (tab === "mine") return;
    const rows = await NET.topScores(tab === "daily" ? { daily: today() } : { life: ui.llife || "street" });
    ui.lrows = rows || []; if (ui.view === "leaders") render();
  }

  // ── PROFILE ──
  function vProfile() {
    const lv = level(profile.xp), next = Math.pow(lv, 2) * 60, prev = Math.pow(lv - 1, 2) * 60;
    const totalEnds = LIVES.reduce((n, L) => n + L.end.length, 0);
    return `${topbar("home")}<main class="wrap">
      <section class="card prof">
        <div class="end-head"><div class="end-av">${char ? AV.svg(char, 90) : ""}</div><div><h1 class="h1s">${esc(char ? char.name : "No character yet")}</h1><p>Level ${lv} · ${profile.xp} XP</p>
          <div class="bar wide"><i style="width:${Math.min(100, (profile.xp - prev) / (next - prev) * 100)}%"></i></div></div></div>
        <div class="grid4"><div><span>Lives finished</span><b>${profile.lives.length}/10</b></div><div><span>States played</span><b>${profile.states.length}/6</b></div><div><span>Endings found</span><b>${profile.endings.length}/${totalEnds}</b></div><div><span>Runs</span><b>${profile.runs}</b></div></div>
        <button class="btn" data-act="editchar">Edit character</button>
      </section>
      <section class="card"><h2>Badges</h2><div class="badges">${COMMON.badges.map(b => `<span class="badge ${profile.badges.indexOf(b.id) >= 0 ? "on" : ""}"><b>${esc(b.t)}</b>${esc(b.d)}</span>`).join("")}</div></section>
      <section class="card"><h2>Language</h2>${langPicker()}</section>
      <section class="card"><h2>Your data</h2><p class="hint">Everything is stored only in this browser. Nothing is sent anywhere.</p>
        ${ui.confirmReset ? `<p>Delete your character and all progress? This can't be undone.</p><div class="row"><button class="btn danger" data-act="reset">Yes, delete everything</button><button class="btn" data-act="profile">Cancel</button></div>`
        : `<button class="btn ghost" data-act="askreset">Reset all data</button>`}</section>
    </main>${footer()}`;
  }

  // ── render & events ──
  function render() {
    const V = { leaders: vLeaders, rules: vRules, home: vHome, state: vState, life: vLife, intro: vIntro, creator: vCreator, play: vPlay, summary: vSummary, profile: vProfile }[ui.view] || vHome;
    $app.innerHTML = V();
    if (ui.view === "creator") bindCreator();
    if (ui.view === "play") mountWorld();
    const fl = document.getElementById("f-lang"), fs = document.getElementById("f-subs");
    if (fl) fl.addEventListener("change", e => { prefs.lang = e.target.value; save(); });
    if (fs) fs.addEventListener("change", e => { prefs.subs = e.target.checked; save(); });
  }
  function bindCreator() {
    const d = ui.draft, upd = () => { document.getElementById("avatar").innerHTML = AV.svg(d, 150); document.getElementById("hv").textContent = d.height + " cm"; document.getElementById("wv").textContent = d.weight + " kg"; document.querySelector(".pv-name").textContent = d.name || "Your name"; };
    document.getElementById("f-name").addEventListener("input", e => { d.name = e.target.value.replace(/[<>]/g, "").slice(0, 18); upd(); });
    document.getElementById("f-height").addEventListener("input", e => { d.height = +e.target.value; upd(); });
    document.getElementById("f-weight").addEventListener("input", e => { d.weight = +e.target.value; upd(); });
  }
  function startGame(stateId, lifeId, opts) {
    game = AE.newGame(char, lifeId, stateId, opts);
    save(); go("play");
  }

  $app.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b || b.disabled) return;
    const act = b.dataset.act, arg = b.dataset.arg;
    switch (act) {
      case "home": go("home"); break;
      case "profile": go("profile"); break;
      case "resume": go(game._showSummary ? "summary" : "play"); break;
      case "newlife": if (!char) { ui.after = "state"; go("creator", { draft: defaultDraft() }); } else go("state", { daily: null }); break;
      case "editchar": ui.after = "profile"; go("creator", { draft: Object.assign({}, char) }); break;
      case "daily": { const d = AE.dailyPick(today()); ui.dailyPending = d; if (!char) { ui.after = "daily"; go("creator", { draft: defaultDraft() }); } else go("intro", { stateId: d.stateId, lifeId: d.lifeId, daily: today() }); break; }
      case "pickstate": ui.stateId = arg; render(); break;
      case "tolife": go("life", { stateId: ui.stateId || "KL", daily: null }); break;
      case "picklife": go("intro", { lifeId: arg }); break;
      case "start": startGame(ui.stateId, ui.lifeId, ui.daily ? { seed: AE.dailyPick(ui.daily).seed, daily: ui.daily } : {}); break;
      case "set": { const k = b.dataset.k, v = b.dataset.v; ui.draft[k] = isNaN(+v) ? v : +v; render(); break; }
      case "savechar": {
        const nm = (document.getElementById("f-name").value || "").replace(/[<>]/g, "").trim().slice(0, 18);
        ui.draft.name = nm || "Player"; char = Object.assign({}, ui.draft); save();
        if (ui.after === "daily") { const d = AE.dailyPick(today()); go("intro", { stateId: d.stateId, lifeId: d.lifeId, daily: today() }); }
        else if (ui.after === "profile") go("profile"); else go("state");
        break;
      }
      case "choose": { const o = AE.choose(game, +arg); if (o) { ui.outcome = o; ui.eventOpen = false; save(); render(); } break; }
      case "openev": ui.eventOpen = true; render(); break;
      case "mchoose": { const r = AE.missionChoose(game, +arg); if (r) { ui.outcome = r; ui.mscene = null; save(); render(); } break; }
      case "evchoose": {
        const g = game, ev = ui.cityEv, ch = ev.c[+arg]; let res = ch, passed = null;
        if (ch.ck) { passed = AE.rnd(g) < AE.chance(g, ch.ck); res = passed ? ch.ck.ok : ch.ck.no; }
        const d = AE.applyEffects(g, res.e || ch.e);
        const it = g.outfit && fxItem(g.outfit);
        if (it && it.tags.indexOf("local:" + g.stateId) >= 0) { g.r = Math.min(100, g.r + 3); d.r = (d.r || 0) + 3; }
        g.eventsDone = (g.eventsDone || []).concat(g.chapter + ":" + ev.id);
        g.log.push({ c: g.chapter, id: ev.id, t: AE.fill(ev.title, g), l: AE.fill(ch.l, g), r: AE.fill(res.r, g), d, alt: ev.c.filter(x => x !== ch).map(x => AE.fill(x.l, g)) });
        ui.outcome = { text: AE.fill(res.r, g), d, passed }; ui.cityEv = null; save(); render(); break;
      }
      case "fxnopen": ui.fxn = true; render(); break;
      case "fxnclose": ui.fxn = false; render(); break;
      case "fxntab": ui.fxnTab = arg; render(); break;
      case "rent": rent(arg); break;
      case "returnfit": game.outfit = null; save(); WORLD.setLook(char || game.player, null); if (NET.setOutfit) NET.setOutfit(""); ui.fxn = false; render(); break;
      case "buypass": if (game.cash >= FX.passPrice) { game.cash -= FX.passPrice; game.pass = true; save(); render(); } break;
      case "gigstart": { const g = game; g.gig = { chapter: g.chapter, left: FX.gig.drops, target: WORLD.randomDoor(AE.rnd(g)) }; WORLD.setExtraSpot("gig", g.gig.target); ui.fxn = false; save(); render(); break; }
      case "travelopen": ui.travel = true; render(); break;
      case "travelclose": ui.travel = false; render(); break;
      case "travel": {
        const g = game, cost = AE.travel(g, arg);
        if (cost) {
          ui.travel = false;
          const it = g.outfit && fxItem(g.outfit);
          if (arg !== g.stateId && it && it.tags.indexOf("local:" + arg) >= 0 && !(g.localBonus || []).includes(arg)) { g.localBonus = (g.localBonus || []).concat(arg); g.r = Math.min(100, g.r + 5); setTimeout(() => WORLD.note("Locals love your " + it.name + "! +5 reputation"), 400); }
          save(); render(); setTimeout(() => WORLD.note("Welcome to " + STATES[arg].city + "! Ticket: " + inr(cost)), 300);
        }
        break;
      }
      case "leaders": ui.lrows = null; go("leaders"); loadLeaders(); break;
      case "llife": ui.llife = arg; ui.lrows = null; render(); loadLeaders(); break;
      case "ltab": ui.ltab = arg; ui.lrows = null; render(); loadLeaders(); break;
      case "mute": NET.mute(ui.muteTarget.id); WORLD.removeRemote(ui.muteTarget.id); ui.muteTarget = null; render(); break;
      case "closemute": ui.muteTarget = null; ui.reported = false; render(); break;
      case "report": { const t = ui.muteTarget, reason = (document.getElementById("f-reason") || {}).value; NET.report(t.id, t.nick, reason).then(() => { NET.mute(t.id); WORLD.removeRemote(t.id); ui.reported = true; render(); }); break; }
      case "adult": prefs.adult = true; save(); ui.ageGate = false; render(); setTimeout(() => { const b = document.querySelector(".world .chat"); if (b) b.click(); }, 50); break;
      case "notadult": prefs.adult = false; save(); ui.ageGate = false; render(); break;
      case "closeage": ui.ageGate = false; render(); break;
      case "rules": e.preventDefault(); go("rules"); break;
      case "next": { const o = ui.outcome; ui.outcome = null; ui.eventOpen = false; if (o && o.summary && game.outfit) { game.outfit = null; if (NET.setOutfit) NET.setOutfit(""); } if (o && o.summary) { game._showSummary = true; save(); go("summary"); } else { render(); window.scrollTo(0, 0); } break; }
      case "aftersummary": game._showSummary = false; save(); go("play"); break;
      case "talk": ui.talk = true; ui.talkRole = null; ui.talkAnswer = null; render(); break;
      case "talkto": ui.talkRole = arg; ui.talkAnswer = null; render(); break;
      case "talkback": ui.talkRole = null; ui.talkAnswer = null; render(); break;
      case "ask": ui.talkAnswer = AE.talk(game, ui.talkRole, +arg); save(); render(); break;
      case "closetalk": ui.talk = null; render(); break;
      case "copy": {
        const t = shareText(game);
        const done = () => { ui.copied = true; render(); };
        try { navigator.clipboard.writeText(t).then(done, () => selectShare()); } catch (err) { selectShare(); }
        break;
      }
      case "again": startGame(game.stateId, game.lifeId, {}); break;
      case "askreset": ui.confirmReset = true; render(); break;
      case "reset": store.del("ns.char"); store.del("ns.profile"); store.del("ns.game"); char = null; profile = blankProfile(); game = null; go("home"); break;
    }
  });
  function selectShare() { const el = document.getElementById("sharetext"); if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
  function defaultDraft() { return { name: "", pronoun: "they", skin: 3, height: 168, weight: 62, hair: "short", hairColor: 0, acc: "none" }; }

  // resume into the right screen on load
  if (game && !game.done && game._showSummary) ui.view = "summary";
  render();
})();
