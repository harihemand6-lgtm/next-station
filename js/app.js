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
    Object.assign(ui, { view, sheet: null, msg: null, venture: false, outcome: null, eventOpen: false, mscene: null, cityEv: null, fxn: false, travel: false, courier: null, talk: null, talkRole: null, talkAnswer: null, muteTarget: null, reported: false, ageGate: false, confirmReset: false, copied: false }, extra || {});
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
  const footer = () => `<footer class="foot"><b>Presented by FXN India</b> · <a href="#rules" data-act="rules">Rules, privacy &amp; grievance contact</a><br>A fictional game. People, apps, shows and exams are made up; FXN is a real fashion-rental startup that presents this game. In-game money is pretend and can't be bought or cashed out. Not career, legal or investment advice. Your character and progress are saved only on this device.</footer>`;

  // ── HOME ──
  function vHome() {
    const d = AE.dailyPick(today()), dl = lifeById(d.lifeId);
    const cont = game && !game.done;
    const done = profile.dailies.indexOf(today()) >= 0;
    const order = ["KL", "KA", "TG", "MH", "DL"];
    return `${topbar()}
    <main class="wrap">
      <section class="hero">
        <p class="kicker">Kochi-first life simulator · 20 lives · 5 cities · Presented by FXN India</p>
        <h1>Live a thousand lives.<br><span class="hl">Start in Kochi.</span></h1>
        <p class="lede">Run a cloud kitchen, ride for FXN, find a partner on a matrimony app, upgrade your house, take a bank loan and open a business in Bengaluru, Hyderabad, Mumbai or Delhi. Every choice costs pretend rupees and has real consequences.</p>
        <div class="row">
          ${cont ? `<button class="btn primary" data-act="resume">Continue: ${esc(lifeById(game.lifeId).title)}, ${esc(STATES[game.loc || game.stateId].city)}</button>` : ""}
          <button class="btn ${cont ? "" : "primary"}" data-act="newlife">${char ? "Start a new life" : "Create your character"}</button>
          <button class="btn ghost" data-act="leaders">Leaderboard</button>
        </div>
      </section>
      <section class="ticket">
        <div class="ticket-l"><span class="tag">Today's challenge</span><h2>${esc(dl.title)}</h2><p>Kochi · same day for every player</p></div>
        <button class="btn ${done ? "" : "accent2"}" data-act="daily">${done ? "Played today ✓ Replay" : "Play today's challenge"}</button>
      </section>
      <h3 class="sec">The cities</h3>
      <div class="route">${order.map((k, i) => `<div class="stop ${i === 0 ? "hub" : ""}" style="--h:${STATES[k].hue}"><b>${esc(STATES[k].city)}</b><span>${i === 0 ? "Where every life starts" : esc(STATES[k].blurb)}</span></div>`).join("")}</div>
      <h3 class="sec">The lives</h3>
      <div class="life-rail">${LIVES.map(L => `<div class="life-pill"><b>${esc(L.title)}</b><span>${L.unit === "Week" ? "6 weeks" : "6 months"}${L.mature ? " · Mature" : ""}</span></div>`).join("")}</div>
      <section class="card fxn-card"><b class="fxn-logo">FXN</b><p>Next Station is presented by <b>FXN India</b>, a fashion-rental startup from Kochi. In the game, rent outfits for events, weddings and premieres, or ride for FXN as a part-time job.</p></section>
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
    const s = STATES.KL, taken = NET.takenLives ? NET.takenLives() : {};
    return `${topbar("home")}
    <main class="wrap">
      <p class="kicker">Kochi, Kerala · everyone starts here</p><h1 class="h1s">Choose a life</h1>
      <p class="hint">A life that another player is living right now is locked until they quit or switch. ${NET.enabled() ? "" : "(Locks work when the game is online.)"}</p>
      <div class="cards">${LIVES.map(L => { const t = taken[L.id]; return `
        <button class="life-card" data-act="picklife" data-arg="${L.id}" style="--h:${s.hue}" ${t ? "disabled" : ""}>
          <span class="lc-top"><b>${esc(L.title)}</b>${L.mature ? `<span class="pill warn">Mature</span>` : ""}${t ? `<span class="pill">Taken by ${esc(t)}</span>` : ""}</span>
          <span class="lc-tag">${esc(fillS(L.tag, "KL", L.id))}</span>
          <span class="lc-meta">6 ${unitPlural(L.unit)} · ${profile.lives.indexOf(L.id) >= 0 ? "Played" : "New"}</span>
        </button>`; }).join("")}</div>
    </main>${footer()}`;
  }
  function vIntro() {
    const s = STATES[ui.stateId], L = lifeById(ui.lifeId);
    return `${topbar(ui.daily ? "home" : "newlife")}
    <main class="wrap">
      <section class="panel intro" style="--h:${s.hue}">
        ${ui.daily ? `<span class="tag">Today's challenge</span>` : ""}
        <p class="kicker">${esc(s.city)}, ${esc(s.name)}</p>
        <h1 class="h1s">${esc(L.title)}</h1>
        <p class="lede">${esc(fillS(L.blurb, ui.stateId, L.id))}</p>
        ${L.mature ? `<p class="note warn">Mature theme: this life shows the real risks of speculative trading and debt. It contains no real money and is not investment advice.</p>` : ""}
        <h3 class="sec">Who you'll meet</h3>
        <ul class="cast">${["m", "v", "f", "p"].map(r => `<li><span class="init" data-role="${r}">${esc(s.cast[r][0])}</span><div><b>${esc(s.cast[r])}</b><span>${esc(L.roles[r])}</span></div></li>`).join("")}</ul>
        <p class="hint">6 ${unitPlural(L.unit)}, 3 decisions each. Between scenes, walk around Kochi: get papers signed at the Government Office, take loans at the Bank, upgrade your house, ride for FXN, take odd jobs and team up with other players.</p>
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
    } else if (g.shift) {
      body = `<section class="card next"><span class="tag fxn-tag">FXN rider shift</span><p class="ev-teaser">Deliver parcel ${CITY.rider.drops - g.shift.left + 1} of ${CITY.rider.drops} to <b>${esc(g.shift.cust)}</b> at the glowing door. Faster deliveries get better ratings and tips. If your average rating falls below ${CITY.rider.minAvg}★, FXN can't pay the shift. Your life's scenes wait until the shift is done.</p></section>`;
    } else if (g.stateId !== g.loc && !AE.missionGuide(g) && g.lifeHistory && g.lifeHistory.length > 1 && g._moved) {
      body = `<section class="card next"><p class="ev-teaser">Your new venture is in <b>${esc(s.city)}</b>. Walk to the Railway Station and take the train there to begin.</p></section>`;
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
          if (c.req && !AE.has(g, c.req)) return "";
          const can = AE.canChoose(g, c), need = AE.needOf(g, c), noPaper = c.paper && !CS.hasPaper(g, c.paper);
          const risk = c.ck ? `<span class="pill">${Math.round(AE.chance(g, c.ck) * 100)}% chance</span>` : "";
          return `<button class="choice" data-act="choose" data-arg="${i}" ${can ? "" : "disabled"}><span>${esc(AE.fill(c.l, g))}</span>${risk}${noPaper ? `<span class="pill bad">Needs ${esc(paperName(c.paper))} from the Government Office</span>` : !can ? `<span class="pill bad">Needs ${inr(need)}</span>` : ""}</button>`;
        }).join("")}</div>
      </section>`;
    }
    const tools = `<div class="row tools"><button class="btn ghost" data-act="talk" ${g.shift ? "disabled" : ""}>Talk to someone</button><button class="btn" data-act="phone">Phone</button><button class="btn fxn-btn" data-act="fxnopen">FXN app</button>${L.closed || WORLD.available() ? "" : `<button class="btn ghost" data-act="travelopen">Train</button>`}</div>`;
    return `${topbar("home")}<main class="wrap play" style="--h:${here.hue}">
      <p class="kicker">${esc(L.title)} · ${esc(here.city)}${away(g) ? ` (visiting, base: ${esc(s.city)})` : ""}${g.outfit ? ` · wearing ${esc(fxItem(g.outfit).name)}` : ""}${g.spouse ? ` · married to ${esc(g.spouse.name)}` : ""}</p>
      ${hud(g)}<div id="world-slot"></div>
      ${NET.enabled() ? `<p class="hint net-note">Other players see you as <b>${esc(NET.nick())}</b>, never your real name. Tap a player to mute or report them.</p>` : ""}
      ${body}${tools}${ui.talk ? talkSheet() : ""}${ui.muteTarget ? muteSheet() : ""}${ui.ageGate ? ageSheet() : ""}${ui.fxn ? fxnSheet() : ""}${ui.travel ? travelSheet() : ""}${ui.sheet ? citySheet() : ""}</main>`;
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
        <h3 class="sec">Ride for FXN (part-time)</h3>
        ${g.shift ? `<span class="pill">On shift: ${g.shift.left} parcels left</span>` : (g.shiftThis || 0) >= 2 ? `<span class="pill">Two shifts done this ${AE.life(g).unit.toLowerCase()}. Rest!</span>` : ui.atStore ? `<button class="btn accent2" data-act="shiftstart">Start a rider shift: ${CITY.rider.drops} deliveries, ${inr(CS.riderPay(g))} each + tips</button>` : `<p class="hint">Walk to FXN Rentals to pick up parcels and start a rider shift.</p>`}
        <p class="hint">Once you start, you must finish all ${CITY.rider.drops} deliveries. Customers rate every drop; if your average falls below ${CITY.rider.minAvg}★, the shift isn't paid. Your rating so far: ${profile.rider && profile.rider.shifts ? stars(profile.rider.avg) + " " + profile.rider.avg : "new rider"}.</p>
        <p class="hint">Rentals go back automatically at the end of each ${AE.life(g).unit.toLowerCase()}. ${esc(FX.disclosure)}</p>
      </div>
      <button class="btn" data-act="fxnclose">Close</button></section>`;
  }
  function travelSheet() {
    const g = game, fare = AE.fare(g), here = g.loc || g.stateId;
    return `<div class="sheet-bg" data-act="travelclose"></div><section class="sheet" role="dialog" aria-label="Train tickets">
      <h2>Train tickets from ${esc(locState(g).city)}</h2>
      <p class="hint">Each ticket costs ${inr(fare)}. Travelling doesn't use up any of your ${AE.life(g).unit.toLowerCase()}s.</p>
      ${(() => { const ok = travelTargets(g); return ok.length ? `<div class="cards">${ok.map(([k, why]) => `<button class="life-card" data-act="travel" data-arg="${k}" style="--h:${STATES_[k].hue}" ${g.cash >= fare ? "" : "disabled"}>
        <span class="lc-top"><b>${esc(STATES_[k].city)}</b>${k === g.stateId ? `<span class="pill good">Base</span>` : ""}</span><span class="lc-tag">${esc(why)}</span></button>`).join("")}</div>` : `<p>No reason to travel right now. Missions, group tasks and new ventures will send you to other cities.</p>`; })()}
      <button class="btn" data-act="travelclose">Not now</button></section>`;
  }

  function travelTargets(g) {
    const here = g.loc || g.stateId, out = [];
    if (here !== g.stateId) out.push([g.stateId, "Back to your base"]);
    const m = AE.activeMission(g);
    if (m && m.step <= 2 && m.target !== here) out.push([m.target, "Mission: " + AE.fill(window.AE_MISSIONS[g.lifeId].title, g, { tfood: STATES_[m.target].food.item, tcity: STATES_[m.target].city, tcraft: STATES_[m.target].craft.item })]);
    if (g.group) { const T = groupTask(g.group.id); if (T.city !== here) out.push([T.city, "Group task"]); }
    const seen = {}; return out.filter(o => !seen[o[0]] && (seen[o[0]] = 1));
  }
  function currentGuide() {
    const g = game; if (!g || g.done) return null;
    // No shortcuts: in 3D every place must be reached on foot. Buttons only appear if the device can't run 3D.
    const walk = !WORLD.available(), go = k => walk ? [["goto:" + k, "Go there"]] : [];
    const hints = sideHints(g), loc = g.loc || g.stateId;
    if (ui.courier) return { text: ui.courier + " from FXN is on the way", sub: "Stay where you are", key: null };
    if (g.shift) return { text: "FXN delivery: take the parcel to " + g.shift.cust, sub: g.shift.left + " of " + CITY.rider.drops + " left" + (g.shift.ratings.length ? " · rating " + avgOf(g.shift.ratings) + "★" : ""), key: "gig", actions: go("gig") };
    if (g.odd) { const J = CITY.oddJobs.find(j => j.id === g.odd.id); return { text: "Odd job: " + J.t, sub: "Walk to the glowing door · " + inr(CS.oddPay(g, J)), key: "odd", actions: go("odd") }; }
    if (g.group) {
      const T = groupTask(g.group.id);
      if (T.city !== loc) return { text: "Group task in " + STATES_[T.city].city + ": " + T.t, sub: "Walk to the Railway Station and travel there with your group", key: "station", actions: go("station") };
      return { text: "Group task: " + T.t, sub: "Bring your group to the marked spot. Empty spots are filled by hired helpers.", key: g.group.key, actions: go(g.group.key) };
    }
    const mg = AE.missionGuide(g);
    if (mg) return { text: mg.title + ": " + mg.text, sub: hints.join(" · "), key: mg.target, actions: go(mg.target) };
    if (!away(g)) {
      const ev = cityEvent(g), ok = ev && wearing(g, ev.dress);
      const evSub = ev ? "Also: " + AE.fill(ev.title, g) + " (dress code: " + dressName(ev.dress) + (ok ? " ✓" : "") + ")" : "";
      const evActs = ev ? (ok ? go("hall") : [["fxnopen", "Rent on FXN"]]) : [];
      const sub = [evSub].concat(hints).filter(Boolean).join(" · ");
      if (!ui.eventOpen && !ui.outcome && ui._marker) return { text: (ui._marker === "board" ? "Next scene: walk to the Notice Board" : "Next scene: walk to " + AE.st(g).cast[ui._marker]), sub, key: ui._marker, actions: (walk ? [["openev", "Open it now"]] : []).concat(evActs) };
      if (ev) return { text: AE.fill(ev.title, g), sub: ["Dress code: " + dressName(ev.dress) + (ok ? " ✓" : "")].concat(hints).join(" · "), key: "hall", actions: evActs.length ? evActs : go("hall") };
    } else return { text: g._moved ? "Start your venture in " + AE.st(g).city : "Your next scene is back in " + AE.st(g).city, sub: ["Walk to the Railway Station to buy a ticket"].concat(hints).join(" · "), key: "station", actions: go("station") };
    return null;
  }
  function refreshGuide() { if (ui.view === "play" && game && !game.done) WORLD.setGuide(currentGuide()); }

  function onArrive(k) {
    const g = game; if (!g || g.done || ui.outcome || ui.mscene || ui.cityEv || ui.sheet) return;
    if (g.shift) { if (k === "gig") riderDrop(); return; }
    if (k === "odd" && g.odd) { WORLD.setExtraSpot("odd", null); const r = CS.finishOdd(g); WORLD.note(r.text); save(); render(); return; }
    const mg = AE.missionGuide(g);
    if (mg && mg.target === k && k !== "station" && ((mg.m.step === 2 && away(g)) || (mg.m.step === 4 && !away(g)))) { ui.mscene = AE.missionScene(g); render(); return; }
    if (k === "station" && travelTargets(g).length) { ui.travel = true; render(); return; }
    if (g.group && k === g.group.key && groupTask(g.group.id).city === (g.loc || g.stateId)) { openSheet("group"); return; }
    if (k === "hall" && !away(g)) return enterHall();
    if (!away(g) && k === ui._marker && !ui.eventOpen) { ui.eventOpen = true; render(); }
  }
  function enterHall() {
    const g = game;
    if (g.romance && g.romance.stage === "engaged" && !away(g)) {
      if (!wearing(g, "wedding")) { WORLD.note("Your families are waiting! Rent wedding wear on the FXN app first."); return; }
      return openSheet("wedding");
    }
    const ev = cityEvent(g);
    if (!ev) { WORLD.note("Nothing on at the Town Hall right now."); return; }
    if (!wearing(g, ev.dress)) { WORLD.note("Bouncer: \"Dress code is " + dressName(ev.dress) + ". FXN delivers in minutes.\""); refreshGuide(); return; }
    ui.cityEv = ev; render();
  }
  function spotLabel(k) {
    const g = game, here = locState(g);
    if (["m", "f", "v", "p"].indexOf(k) >= 0) return "Talk to " + here.cast[k];
    if (k === "station") return AE.life(g).closed ? null : "Buy a train ticket";
    if (k === "fxn") return "Open FXN store";
    if (k === "hall") return away(g) ? null : "Enter the Town Hall";
    if (k === "gig") return "Deliver parcel";
    if (k === "odd") return "Do the odd job";
    if (k === "office") return "Enter the Government Office";
    if (k === "bank") return "Enter the Bank";
    if (k === "cafe") return g.romance && g.romance.stage === "date" ? "Meet " + profileById(g.romance.pid).name : null;
    if (k === "house") return away(g) ? null : g.romance && g.romance.stage === "family" ? "Introduce your families" : "Your house";
    if (k === "s") return g.spouse ? "Talk to " + g.spouse.name : null;
    if (k === "board") return "Notice Board: jobs and group tasks";
    return null;
  }
  function onSpot(k) {
    if (["m", "f", "v", "p"].indexOf(k) >= 0) { ui.talk = true; ui.talkRole = k; ui.talkAnswer = null; return render(); }
    if (k === "station") { if (game.shift) { WORLD.note("Finish your FXN shift first."); return; } ui.travel = true; return render(); }
    if (k === "fxn") { ui.fxn = true; ui.atStore = true; return render(); }
    if (k === "hall") return enterHall();
    if (k === "gig") return game.shift ? riderDrop() : null;
    if (k === "odd") return onArrive("odd");
    if (k === "office") return openSheet("office");
    if (k === "bank") return openSheet("bank", { venture: false });
    if (k === "cafe") return openSheet("date", { dateText: null });
    if (k === "house") return game.romance && game.romance.stage === "family" ? openSheet("family") : openSheet("house");
    if (k === "s") { const lines = ["Did you eat? I made extra.", "My office is chaos. Tell me something good.", "Should we repaint the kitchen? Don't answer, I've decided.", "Your mother called. Twice. About 'grandchildren'. I hung up.", "Proud of you. Now help me find the TV remote."]; WORLD.npcSay("s", lines[Math.floor(Math.random() * lines.length)], null); return; }
    if (k === "board") return openSheet("board");
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

  // ═══ City systems UI ═══
  const CITY = window.AE_CITY, CS = AE.CITY;
  const paperName = id => (CITY.papers.find(p => p.id === id) || {}).name || id;
  const unitOf = g => AE.life(g).unit.toLowerCase();
  const sheetBox = (title, inner, extra) => `<div class="sheet-bg" data-act="closesheet"></div><section class="sheet ${extra || ""}" role="dialog" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${ui.msg ? `<p class="note">${esc(ui.msg)}</p>` : ""}${inner}<button class="btn" data-act="closesheet">Close</button></section>`;
  const item = (title, sub, acts) => `<div class="ri"><div><b>${title}</b>${sub ? `<span class="hint">${sub}</span>` : ""}</div><div class="acts">${acts}</div></div>`;
  const avgOf = a => a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length * 10) / 10 : 0;
  const stars = n => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));
  const profileById = id => CITY.profiles.find(p => p.id === id);
  const groupTask = id => CITY.groupTasks.find(t => t.id === id);
  const myParty = () => ui.party || null;
  function partyHere() {
    const P = myParty(); if (!P) return [];
    const peers = NET.peers ? NET.peers() : {};
    return Object.keys(peers).filter(id => peers[id].pt === P.pid).map(id => ({ id, nick: peers[id].nick, x: peers[id].x, y: peers[id].y }));
  }

  function officeSheet() {
    const g = game;
    const rows = CITY.papers.map(P => {
      const st = CS.paperStatus(g, P.id), fee = CS.paperFee(g, P.id);
      let a;
      if (st === "have") a = `<span class="pill good">Have it${(g.fake || []).indexOf(P.id) >= 0 ? "?" : ""}</span>`;
      else if (st === "ready") a = `<button class="btn small primary" data-act="collect" data-arg="${P.id}">Collect it</button>`;
      else if (st === "processing") a = `<span class="pill">Processing</span>`;
      else if (st === "locked") a = `<span class="pill">${P.married ? "After your wedding" : "First get: " + esc(P.needs.filter(n => !CS.hasPaper(g, n)).map(paperName).join(", "))}</span>`;
      else a = `<button class="btn small primary" data-act="apply" data-arg="${P.id}" ${g.cash >= fee ? "" : "disabled"}>Apply · ${inr(fee)}</button><button class="btn small ghost" data-act="agent" data-arg="${P.id}" ${g.cash >= fee * 4 ? "" : "disabled"}>Agent · ${inr(fee * 4)}</button>`;
      return item(esc(P.name), esc(P.why), a);
    }).join("");
    return sheetBox("Government Office", `<p class="hint">Apply at the counter, then come back after your next scene to collect the signed paper. Agents are instant but cost 4×, count as a shady choice, and some of their papers turn out fake.</p><div class="list">${rows}</div>`);
  }

  function bankSheet() {
    const g = game, active = (g.loans || []).filter(l => l.left > 0);
    if (ui.venture) return ventureSheet();
    const avail = CITY.loans.filter(L => !L.house).map(L => {
      const ok = CS.loanOk(g, L.id), amt = CS.loanAmount(g, L.id), miss = L.needs.filter(n => !CS.hasPaper(g, n));
      const sub = `${esc(L.why)} You get ${inr(amt)} and repay ${inr(Math.round(amt * (1 + L.rate)))} in EMIs at the end of each ${unitOf(g)}.`;
      const a = ok ? `<button class="btn small primary" data-act="${L.venture ? "ventureopen" : "loan"}" data-arg="${L.id}">${L.venture ? "Plan a venture" : "Take loan"}</button>`
        : `<span class="pill">${miss.length ? "Needs " + esc(miss.map(paperName).join(", ")) : "You already have one"}</span>`;
      return item(esc(L.name), sub, a);
    }).join("");
    const mine = active.length ? active.map(l => item(esc(l.name), `${inr(l.left)} left · EMI ${inr(l.emi)} per ${unitOf(g)}`, `<button class="btn small" data-act="repay" data-arg="${g.loans.indexOf(l)}" ${g.cash >= l.left ? "" : "disabled"}>Repay all</button>`)).join("") : `<p class="hint">No active loans.</p>`;
    return sheetBox("Bank", `<p class="hint">Loans need papers from the Government Office. Missed EMIs come out of your cash, so borrow only what your plan can repay.</p><h3 class="sec">Your loans</h3>${mine}<h3 class="sec">Apply</h3><div class="list">${avail}</div>`);
  }
  function ventureSheet() {
    const g = game, taken = NET.takenLives ? NET.takenLives() : {};
    const cities = Object.keys(STATES).filter(k => k !== g.stateId);
    const lives = CITY.ventureLives.filter(id => id !== g.lifeId);
    const left = 2 - (g.switches || 0);
    return sheetBox("Venture loan", left <= 0 ? `<p>You've already changed lives twice this run. Finish this one first.</p>` : `
      <p class="hint">Take a ${inr(CS.loanAmount(g, "venture"))} business loan, quit ${esc(AE.life(g).title)} and start a new venture in another city. You keep your cash, papers, house, family and loans. Then walk to the station and move there.</p>
      <h3 class="sec">City</h3><div class="chips">${cities.map(k => `<button class="chip ${ui.vCity === k ? "on" : ""}" data-act="vcity" data-arg="${k}">${esc(STATES[k].city)}</button>`).join("")}</div>
      <h3 class="sec">Venture</h3><div class="chips">${lives.map(id => { const L = lifeById(id), t = taken[id]; return `<button class="chip ${ui.vLife === id ? "on" : ""}" data-act="vlife" data-arg="${id}" ${t ? "disabled" : ""}>${esc(L.title)}${t ? " (taken by " + esc(t) + ")" : ""}</button>`; }).join("")}</div>
      <div class="row"><button class="btn primary" data-act="venturego" ${ui.vCity && ui.vLife ? "" : "disabled"}>Take the loan and start${ui.vLife && ui.vCity ? ": " + esc(lifeById(ui.vLife).title) + " in " + esc(STATES[ui.vCity].city) : ""}</button><button class="btn ghost" data-act="ventureback">Back</button></div>`);
  }

  function houseSVG(h) {
    const wall = CITY.walls[h.wall || 0][1], has = id => h.items.indexOf(id) >= 0;
    let s = `<svg viewBox="0 0 320 170" width="320" height="170" class="house-svg" role="img" aria-label="Your house"><rect width="320" height="130" fill="${wall}"/><rect y="130" width="320" height="40" fill="#8a6a45"/><rect x="128" y="22" width="64" height="48" fill="#bfe3f7" stroke="#fff" stroke-width="4"/><line x1="160" y1="22" x2="160" y2="70" stroke="#fff" stroke-width="3"/>`;
    if (h.lvl >= 3) s += `<rect x="232" y="40" width="44" height="90" fill="#6b4a2f"/><circle cx="268" cy="88" r="3" fill="#f4c542"/>`;
    if (has("art")) s += `<rect x="40" y="28" width="46" height="32" fill="#f4a52b" stroke="#2a2742" stroke-width="3"/><circle cx="56" cy="44" r="7" fill="#22b5a6"/>`;
    if (has("lights")) s += Array.from({ length: 14 }, (_, i) => `<circle cx="${12 + i * 22}" cy="${10 + (i % 2) * 4}" r="3" fill="#ffe28a"/>`).join("");
    if (has("shelf")) s += `<rect x="14" y="66" width="40" height="64" fill="#6b4a2f"/>${[0, 1, 2].map(r => `<rect x="18" y="${72 + r * 20}" width="10" height="14" fill="#e0638a"/><rect x="30" y="${72 + r * 20}" width="8" height="14" fill="#7b8cff"/><rect x="40" y="${72 + r * 20}" width="10" height="14" fill="#22b5a6"/>`).join("")}`;
    if (has("sofa")) s += `<rect x="96" y="104" width="120" height="26" rx="6" fill="#7a1f6b"/><rect x="96" y="92" width="120" height="16" rx="6" fill="#8e2a7e"/>`;
    if (has("tv")) s += `<rect x="216" y="78" width="54" height="32" fill="#111"/><rect x="238" y="110" width="10" height="8" fill="#333"/>`;
    if (has("gaming")) s += `<rect x="276" y="104" width="34" height="26" fill="#2a2742"/><circle cx="293" cy="117" r="5" fill="#22b5a6"/>`;
    if (has("plants")) s += `<rect x="62" y="114" width="14" height="16" fill="#8a4b2f"/><circle cx="69" cy="104" r="12" fill="#3f8f55"/><rect x="290" y="62" width="10" height="12" fill="#8a4b2f"/><circle cx="295" cy="54" r="9" fill="#3f8f55"/>`;
    if (has("swing")) s += `<line x1="104" y1="0" x2="104" y2="80" stroke="#6b4a2f" stroke-width="2"/><line x1="148" y1="0" x2="148" y2="80" stroke="#6b4a2f" stroke-width="2"/><rect x="98" y="80" width="56" height="8" fill="#6b4a2f"/>`;
    if (has("aquarium")) s += `<rect x="62" y="70" width="34" height="22" fill="#9fd3ff" stroke="#2a2742" stroke-width="2"/><circle cx="74" cy="80" r="3" fill="#f4a52b"/>`;
    if (has("ac")) s += `<rect x="200" y="12" width="70" height="18" rx="4" fill="#f3efe6"/>`;
    return s + `</svg>`;
  }
  function houseSheet() {
    const g = game, h = g.house, H = CITY.houseLevels, nx = CS.houseNext(g);
    const cost = nx ? CS.money(g, nx.cost) : 0;
    const up = nx ? item("Upgrade to " + esc(nx.name), `${inr(cost)} · then ${inr(CS.money(g, nx.upkeep))} upkeep each ${unitOf(g)} · +${nx.h} happiness each ${unitOf(g)}`,
      `<button class="btn small primary" data-act="hupgrade" ${g.cash >= cost ? "" : "disabled"}>Pay cash</button><button class="btn small" data-act="hloan" ${CS.loanOk(g, "home") ? "" : "disabled"}>${CS.hasPaper(g, "id") ? "Home loan" : "Home loan (needs address proof)"}</button>`) : `<p class="hint">You have the best house in town.</p>`;
    const walls = `<div class="chips">${CITY.walls.map((w, i) => `<button class="sw ${h.wall === i ? "on" : ""}" style="background:${w[1]}" data-act="paint" data-arg="${i}" title="${esc(w[0])}" aria-label="Paint ${esc(w[0])}"></button>`).join("")}<span class="hint">Repaint: ${inr(CS.money(g, 500))}</span></div>`;
    const decor = CITY.decor.map(d => { const own = h.items.indexOf(d.id) >= 0, c = CS.money(g, d.cost); return `<button class="chip ${own ? "on" : ""}" data-act="decor" data-arg="${d.id}" ${own || g.cash < c ? "disabled" : ""}>${esc(d.name)}${own ? " ✓" : " · " + inr(c)}</button>`; }).join("");
    return sheetBox("Your house: " + H[h.lvl].name, `${houseSVG(h)}${up}<h3 class="sec">Wall colour</h3>${walls}<h3 class="sec">Furnish it</h3><div class="chips">${decor}</div>`);
  }

  function phoneSheet() {
    const g = game, P = myParty(), mates = partyHere();
    const apps = [["fxnopen", "FXN", "Rent outfits"], ["site:mangalya", "MangalyaMatch", "Matrimony"], ["site:chaidate", "ChaiDate", "Dating"], ["career", "Career", "Quit or switch life"], ["status", "My papers", "Papers, loans, house"]];
    const party = P ? `<p>Your group: you${mates.length ? ", " + mates.map(m => esc(m.nick)).join(", ") : " (waiting for players to join)"}.</p><button class="btn small ghost" data-act="partyleave">Leave group</button>` : `<p class="hint">Tap a player in the city to invite them to your group (up to 6).</p>`;
    return sheetBox("Phone", `<div class="apps">${apps.map(a => `<button class="app" data-act="${a[0].indexOf("site:") === 0 ? "site" : a[0]}" ${a[0].indexOf("site:") === 0 ? `data-arg="${a[0].slice(5)}"` : ""}><b>${esc(a[1])}</b><span>${esc(a[2])}</span></button>`).join("")}</div><h3 class="sec">Group</h3>${party}`);
  }
  function statusSheet() {
    const g = game;
    const papers = (g.papers || []).length ? g.papers.map(paperName).map(esc).join(", ") : "None yet";
    const pend = (g.pending || []).map(p => paperName(p.id) + (CS.paperStatus(g, p.id) === "ready" ? " (ready)" : " (processing)")).map(esc).join(", ");
    const loans = (g.loans || []).filter(l => l.left > 0).map(l => esc(l.name) + ": " + inr(l.left) + " left").join("<br>") || "None";
    return sheetBox("My papers", `<p><b>Papers:</b> ${papers}${pend ? `<br><b>At the office:</b> ${pend}` : ""}</p><p><b>Loans:</b><br>${loans}</p><p><b>House:</b> ${esc(CITY.houseLevels[g.house.lvl].name)} · ${g.house.items.length} items</p><p><b>Family:</b> ${g.spouse ? "Married to " + esc(g.spouse.name) : g.romance ? "Seeing " + esc(profileById(g.romance.pid).name) : "Single"}</p>`);
  }
  function siteSheet() {
    const g = game, S = CITY.sites.find(s => s.id === ui.site), seek = ui.seek || (char && char.pronoun === "she" ? "m" : char && char.pronoun === "he" ? "w" : "any");
    if (g.spouse) return sheetBox(S.name, `<p>You're married to <b>${esc(g.spouse.name)}</b>. ${esc(S.name)} sends you a cake emoji and deletes your profile.</p>`);
    if (g.romance) { const p = profileById(g.romance.pid); return sheetBox(S.name, `<p>You're seeing <b>${esc(p.name)}</b> (${esc(p.job)}). ${g.romance.stage === "date" ? "Meet at Café Monsoon for your first chai." : g.romance.stage === "family" ? "Walk home to introduce the families." : "You're engaged! Rent wedding wear on FXN and walk to the Town Hall."}</p>`); }
    const left = 3 - ((g.interestCh === g.chapter && g.interests) || 0);
    const list = CS.profilesFor(g, seek).map(p => `<div class="profile"><div class="pf-top"><span class="init">${esc(p.name[0])}</span><div><b>${esc(p.name)}, ${p.age}</b><span class="hint">${esc(p.job)} · ${esc(p.city)}</span></div></div><p>“${esc(p.bio)}”</p><p class="hint">Likes: ${esc(p.likes)}</p>
      ${(g.romanceTried || []).indexOf(p.id) >= 0 ? `<span class="pill">Replied</span>` : `<button class="btn small primary" data-act="interest" data-arg="${p.id}" ${left > 0 ? "" : "disabled"}>${S.family ? "Send interest" : "Say hi"}</button>`}</div>`).join("");
    return sheetBox(S.name + " · " + S.kind, `<p class="hint">${esc(S.blurb)} Profiles are fictional characters. ${left} ${left === 1 ? "try" : "tries"} left this ${unitOf(g)}.</p>
      <div class="chips"><span class="hint">Looking for:</span>${[["w", "Bride"], ["m", "Groom"], ["any", "Anyone"]].map(o => `<button class="chip ${seek === o[0] ? "on" : ""}" data-act="seek" data-arg="${o[0]}">${o[1]}</button>`).join("")}</div><div class="profiles">${list}</div>`);
  }
  function dateSheet() {
    const g = game, R = g.romance, p = profileById(R.pid), D = CS.dateScene(g);
    if (ui.dateText) return sheetBox("Café Monsoon", `<p class="result">${esc(ui.dateText)}</p>${ui.dateMore ? `<button class="btn primary" data-act="datenext">Continue the date</button>` : ""}`);
    return sheetBox("Café Monsoon · with " + p.name, `<p class="ev-text">${esc(D.t.replace(/\{p\}/g, p.name))}</p><div class="choices">${D.c.map((c, i) => `<button class="choice" data-act="datechoose" data-arg="${i}"><span>${esc(c.l.replace(/\{p\}/g, p.name))}</span></button>`).join("")}</div>`);
  }
  function familySheet() {
    const p = profileById(game.romance.pid);
    return sheetBox("Families meet", `<p class="ev-text">${esc(p.name)}'s family arrives at your home. Tea, banana chips, and every relative has three questions.</p><div class="choices"><button class="choice" data-act="family" data-arg="0">Let the parents talk; serve tea and smile</button><button class="choice" data-act="family" data-arg="1">Answer every question honestly, even the silly ones</button></div>`);
  }
  function weddingSheet() {
    const g = game, p = profileById(g.romance.pid);
    return sheetBox("Your wedding with " + p.name, `<p class="hint">Choose the wedding you can afford. Big weddings are fun, debt-free weddings are more fun later.</p><div class="list">${CITY.weddings.map(w => { const c = CS.money(g, w.cost); return item(esc(w.name), inr(c), `<button class="btn small primary" data-act="wed" data-arg="${w.id}" ${g.cash >= c ? "" : "disabled"}>Choose</button>`); }).join("")}</div>`);
  }
  function careerSheet() {
    const g = game, taken = NET.takenLives ? NET.takenLives() : {}, left = 2 - (g.switches || 0);
    if (left <= 0) return sheetBox("Career", `<p>You've changed lives twice this run. Finish this one first.</p>`);
    const cards = LIVES.filter(L => L.id !== g.lifeId && L.id !== "reality").map(L => { const t = taken[L.id]; return `<button class="life-card" data-act="switchlife" data-arg="${L.id}" ${t ? "disabled" : ""}><span class="lc-top"><b>${esc(L.title)}</b>${t ? `<span class="pill">Taken by ${esc(t)}</span>` : ""}</span><span class="lc-tag">${esc(fillS(L.tag, g.stateId, L.id))}</span></button>`; }).join("");
    return sheetBox("Quit and switch life", `<p class="hint">Quit ${esc(AE.life(g).title)} and start another life in ${esc(STATES[g.stateId].city)}. You keep your cash, papers, house, family and loans; your work skills partly carry over. ${left} switch${left > 1 ? "es" : ""} left this run. Jobs held by players online right now are locked until they quit.</p><div class="cards">${cards}</div>`);
  }
  function boardSheet() {
    const g = game, loc = g.loc || g.stateId, tab = ui.btab || "odd";
    let inner;
    if (tab === "odd") {
      if (loc !== "KL") inner = `<p class="hint">Odd jobs are posted on the Kochi Notice Board.</p>`;
      else {
        const offers = [0, 1, 2].map(i => CITY.oddJobs[(g.seed + g.chapter * 5 + i * 4) % CITY.oddJobs.length]);
        const left = 3 - (g.oddThis || 0);
        inner = g.odd ? `<p>You're on an odd job: <b>${esc(CITY.oddJobs.find(j => j.id === g.odd.id).t)}</b>. Walk to the glowing door.</p>` : `<p class="hint">Quick jobs around Kochi. ${left} left this ${unitOf(g)}.</p><div class="list">${offers.map(J => item(esc(J.t), inr(CS.oddPay(g, J)), `<button class="btn small primary" data-act="oddtake" data-arg="${J.id}" ${left > 0 ? "" : "disabled"}>Take it</button>`)).join("")}</div>`;
      }
    } else {
      const list = CITY.groupTasks;
      inner = `<p class="hint">Team tasks for groups of 2, 4 or 6. Invite players by tapping them in the city. Any empty spots are filled by hired helpers, who take their share of the reward. Tasks in other cities give you a reason to travel there together.</p>
        ${g.group ? `<p class="note">Active: <b>${esc(groupTask(g.group.id).t)}</b> <button class="btn small ghost" data-act="groupdrop">Drop it</button></p>` : ""}
        <div class="list">${list.map(T => item(`${esc(T.t)} <span class="pill">Group of ${T.size}</span>`, `${esc(STATES[T.city].city)} · your share ${inr(CS.groupShare(g, T))}`, `<button class="btn small primary" data-act="grouptake" data-arg="${T.id}" ${g.group ? "disabled" : ""}>Take it</button>`)).join("")}</div>`;
    }
    return sheetBox("Notice Board", `<div class="chips"><button class="chip ${tab === "odd" ? "on" : ""}" data-act="btab" data-arg="odd">Odd jobs</button><button class="chip ${tab === "group" ? "on" : ""}" data-act="btab" data-arg="group">Group tasks</button></div>${inner}`);
  }
  function groupSheet() {
    const g = game, T = groupTask(g.group.id), sp = WORLD.spotAt(g.group.key) || { x: 0, z: 0 };
    const here = partyHere().filter(m => Math.hypot(m.x + 0.5 - sp.x, m.y + 0.5 - sp.z) < 5).slice(0, T.size - 1);
    const hired = T.size - 1 - here.length, share = CS.groupShare(g, T);
    return sheetBox("Group task", `<p><b>${esc(T.t)}</b></p><p>Team of ${T.size}: you${here.length ? ", " + here.map(m => esc(m.nick)).join(", ") : ""}${hired ? ` + ${hired} hired helper${hired > 1 ? "s" : ""}` : ""}.</p><p class="hint">Everyone on the team earns ${inr(share)}. ${hired ? "Helpers take their own shares. Bring more friends next time for a bigger team bonus." : "All real players! +5 reputation team bonus."}</p><button class="btn primary" data-act="groupgo">Start the task</button>`);
  }
  function playerSheet() {
    const t = ui.target, p = (NET.peers ? NET.peers() : {})[t.id] || {}, g = game;
    const life = p.l && lifeById(p.l), amts = [100, 500, 1000, 5000];
    const inv = !myParty() || partyHere().length < 5;
    return sheetBox(t.nick, `<p class="hint">${life ? esc(life.title) : "Exploring"}${p.hs ? " · from " + esc((STATES[p.hs] || {}).city || p.hs) : ""}${p.rd ? " · FXN rider " + stars(p.rd) : ""}</p>
      <h3 class="sec">Send in-game money</h3><div class="chips">${amts.map(a => `<button class="chip" data-act="gift" data-arg="${a}" ${g.cash >= a ? "" : "disabled"}>${inr(a)}</button>`).join("")}</div>
      ${p.rd ? `<h3 class="sec">Tip your rider</h3><div class="chips">${[20, 50, 100].map(a => `<button class="chip" data-act="tip" data-arg="${a}" ${g.cash >= a ? "" : "disabled"}>${inr(a)}</button>`).join("")}</div>` : ""}
      <div class="row">${inv ? `<button class="btn accent2" data-act="invite">Invite to my group</button>` : ""}<button class="btn" data-act="mutep">Mute or report</button></div>`);
  }
  function inviteSheet() {
    const v = ui.invite;
    return sheetBox("Group invite", `<p><b>${esc(v.nick)}</b> invited you to their group for team tasks.</p><div class="row"><button class="btn primary" data-act="inviteyes">Join</button><button class="btn" data-act="inviteno">No thanks</button></div>`);
  }
  function shiftSheet() {
    const r = ui.shiftEnd;
    return sheetBox("FXN shift complete", `<p class="big-stars">${stars(r.avg)} <b>${r.avg}</b></p>${r.paid ? `<p>Customers were happy. FXN paid ${inr(r.pay)} for the shift, plus ${inr(r.tips)} in tips.</p>` : `<p>Your average rating fell below ${CITY.rider.minAvg}★, so FXN can't pay this shift. You keep ${inr(r.tips)} in tips. Faster deliveries next time!</p>`}`);
  }
  function citySheet() {
    const k = ui.sheet;
    if (k === "office") return officeSheet();
    if (k === "bank") return bankSheet();
    if (k === "house") return houseSheet();
    if (k === "phone") return phoneSheet();
    if (k === "status") return statusSheet();
    if (k === "site") return siteSheet();
    if (k === "date") return dateSheet();
    if (k === "family") return familySheet();
    if (k === "wedding") return weddingSheet();
    if (k === "career") return careerSheet();
    if (k === "board") return boardSheet();
    if (k === "group") return groupSheet();
    if (k === "player") return playerSheet();
    if (k === "invite") return inviteSheet();
    if (k === "shift") return shiftSheet();
    return "";
  }
  const openSheet = (k, extra) => { Object.assign(ui, { sheet: k, msg: null }, extra || {}); render(); };

  // Side hints shown under the main guide
  function sideHints(g) {
    const out = [];
    if ((g.pending || []).some(p => CS.paperStatus(g, p.id) === "ready")) out.push("A paper is ready at the Government Office");
    const R = g.romance;
    if (R) { const p = profileById(R.pid); out.push(R.stage === "date" ? "Date with " + p.name + " at Café Monsoon" : R.stage === "family" ? "Introduce " + p.name + " to your family at home" : "Wedding: rent wedding wear, then walk to the Town Hall"); }
    if (g.spouse && !CS.hasPaper(g, "marriage") && CS.paperStatus(g, "marriage") === "none") out.push("Register your marriage at the Government Office");
    return out;
  }

  function riderNext(g) {
    const t = WORLD.randomDoor(AE.rnd(g)); g.shift.target = t; g.shift.t0 = Date.now();
    const me = WORLD.position(), d = Math.hypot(t.x + 0.5 - me.x, t.y + 0.5 - me.y);
    g.shift.ideal = Math.max(8, d * 1.45 / 3.6 + 3); g.shift.cust = CITY.customers[Math.floor(AE.rnd(g) * CITY.customers.length)];
    WORLD.setExtraSpot("gig", t);
  }
  function startShift() {
    const g = game; if (g.shift || (g.shiftThis || 0) >= 2) return;
    g.shift = { left: CITY.rider.drops, ratings: [], tips: 0 }; riderNext(g);
    profile.rider = profile.rider || { shifts: 0, avg: 0 };
    NET.setState && NET.setState({ rd: profile.rider.avg || 5 });
    ui.fxn = false; save(); render();
    WORLD.note("Shift started! " + CITY.rider.drops + " parcels. Finish all of them to end the shift.");
  }
  function riderDrop() {
    const g = game, S = g.shift; if (!S) return;
    const secs = WORLD.available() ? (Date.now() - S.t0) / 1000 : S.ideal;
    const r = CS.rateDrop(g, secs, S.ideal);
    WORLD.note(r.cust + " " + stars(r.stars) + ": \"" + r.line + "\"" + (r.tip ? " Tip: " + inr(r.tip) : ""));
    if (S.left > 0) { riderNext(g); save(); render(); return; }
    WORLD.setExtraSpot("gig", null);
    const res = CS.endShift(g);
    const P = profile.rider = profile.rider || { shifts: 0, avg: 0 };
    P.avg = Math.round(((P.avg * P.shifts) + res.avg) / (P.shifts + 1) * 10) / 10; P.shifts++;
    if (res.avg >= 5) g.rider5 = true;
    NET.setState && NET.setState({ rd: 0 });
    save(); openSheet("shift", { shiftEnd: res });
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
      <h2>In-game money, gifts and jobs</h2>
      <ul><li>All money in Next Station is pretend. It can't be bought with real money and can't be cashed out, so gifts between players have no real value.</li>
        <li>Only send in-game money to players you trust. Gifts and tips can't be reversed.</li>
        <li>A life that another player is living right now is locked for others until they quit or switch. Locks only count players who are online.</li>
        <li>Matrimony and dating apps in the game (MangalyaMatch, ChaiDate) are fictional, and every profile is a made-up character. No real people are matched.</li></ul>
      <h2>Presented by FXN India</h2>
      <p class="hint">${esc(FX.disclosure)} FXN Rentals, FXN rider shifts and outfits in the game are an in-game version of FXN's real service and use in-game money only.</p>
      <p class="hint">Next Station is a free game. Its people, shows and exams are fictional. It is not career, legal or investment advice.</p>
      <button class="btn primary" data-act="home">Back to the game</button></section></main>${footer()}`;
  }

  function mountWorld() {
    const slot = document.getElementById("world-slot");
    if (!game || game.done) { NET.leave(); netKey = null; return; }
    if (!slot) return;
    const g = game, here = locState(g), loc = g.loc || g.stateId, isBase = loc === g.stateId;
    const key = [g.seed, g.lifeId, loc, isBase ? g.house.lvl + "." + g.house.wall : "", isBase && g.spouse ? g.spouse.name : ""].join(":");
    WORLD.mount(slot, {
      key, stateId: loc, lifeId: g.lifeId, hue: here.hue, cast: here.cast, avatar: char || g.player, meLabel: (char || g.player).name, outfit: outfitLook(g),
      base: isBase, house: isBase ? g.house : null, wallColor: CITY.walls[g.house.wall || 0][1], spouse: isBase && g.spouse ? g.spouse.name : null,
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
      onRemoteTap: (id, nick) => { const p = NET.peers()[id]; openSheet("player", { target: { id, nick: p ? p.nick : nick } }); }
    });
    WORLD.setExtraSpot("gig", g.shift ? g.shift.target : null);
    WORLD.setExtraSpot("odd", g.odd ? g.odd.target : null);
    WORLD.setExtraSpot("grp", g.group && g.group.key === "grp" ? g.group.target : null);
    if (NET.lobby) NET.lobby(g.lifeId);
    WORLD.setMarker(!away(g) && !ui.outcome && !ui.eventOpen && !ui.mscene && !ui.cityEv ? ui._marker : null);
    refreshGuide();
    const o = ui.outcome;
    if (o && o.reaction && !o._shown) { o._shown = true; WORLD.npcSay(o.reaction.role, o.reaction.line, prefs.subs ? o.reaction.sub : null); }
    if (NET.enabled() && netKey !== key) {
      netKey = key;
      WORLD.clearRemotes();
      const tag = d => d.nick + (d.rd ? " · ★" + d.rd + " rider" : d.l && lifeById(d.l) ? " · " + lifeById(d.l).title : "") + (ui.party && d.pt === ui.party.pid ? " · team" : "");
      NET.join(loc, char || g.player, WORLD.position(), {
        onJoin: (id, d) => WORLD.upsertRemote(id, Object.assign({}, d, { outfit: d.o && fxItem(d.o) ? fxItem(d.o).look : null, outfitKey: d.o || "", nick: tag(d) })),
        onUpdate: (id, d) => WORLD.upsertRemote(id, Object.assign({}, d, { outfit: d.o && fxItem(d.o) ? fxItem(d.o).look : null, outfitKey: d.o || "", nick: tag(d) })),
        onGift: (id, amt, tip) => { if (!game || game.done) return; game.cash += amt; save(); const p = NET.peers()[id]; WORLD.note((p ? p.nick : "A player") + (tip ? " tipped you " : " sent you ") + inr(amt) + "!"); render(); },
        onParty: (id, m) => {
          const p = NET.peers()[id], nick = p ? p.nick : "A player";
          if (m.k === "inv") { if (!ui.party) openSheet("invite", { invite: { id, nick, pid: m.pid } }); else NET.party(id, "busy", m.pid); }
          else if (m.k === "acc" && ui.party && m.pid === ui.party.pid) WORLD.note(nick + " joined your group!");
          else if (m.k === "dec" || m.k === "busy") WORLD.note(nick + (m.k === "busy" ? " is already in a group." : " said no thanks."));
        },
        onGroupDone: (id, taskId, real) => { const T = groupTask(taskId); if (!T || !game || game.done) return; const r = CS.finishGroup(game, T, Math.max(0, real - 1)); if (real >= T.size) game.r = Math.min(100, game.r + 5); save(); WORLD.note("Team task done with your group! +" + inr(r.share)); render(); },
        onMove: (id, x, y) => WORLD.moveRemote(id, x, y),
        onSay: (id, t, typed) => WORLD.sayRemote(id, t, typed),
        onLeave: id => WORLD.removeRemote(id),
        onCount: n => WORLD.setOnline(n, NET.PHRASES, NET.EMOTES, true)
      }, { o: g.outfit || "", hs: g.stateId, l: g.lifeId, rd: g.shift ? ((profile.rider && profile.rider.avg) || 5) : 0, pt: ui.party ? ui.party.pid : "" }).catch(() => { netKey = null; });
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
    if (profile.lives.length >= 20) B("all20");
    if (Object.keys(STATES).every(k => (g.visited || []).indexOf(k) >= 0 || k === g.stateId)) B("explorer");
    if (g.stateId === "KL") B("kerala");
    if (g.spouse && AE.CITY.hasPaper(g, "marriage")) B("married");
    if (g.house && g.house.lvl >= 3) B("homeowner");
    if (g.rider5) B("rider5");
    if (g.groupsDone) B("team");
    if (g.gifts) B("generous");
    if ((g.papers || []).length >= 4) B("paperwork");
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
      body = `<table class="ledger lb">${LIVES.map(L => { const b = best[L.id]; return `<tr><td>${esc(L.title)}</td><td>${b ? `${b.score} <span class="hint">${esc(b.ending)} · ${esc((STATES[b.state] || {}).city || b.state)}</span>` : `<span class="hint">Not played</span>`}</td></tr>`; }).join("")}</table>`;
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
        <div class="grid4"><div><span>Lives finished</span><b>${profile.lives.length}/${LIVES.length}</b></div><div><span>FXN rider rating</span><b>${profile.rider && profile.rider.shifts ? profile.rider.avg + "★" : "–"}</b></div><div><span>Endings found</span><b>${profile.endings.length}/${totalEnds}</b></div><div><span>Runs</span><b>${profile.runs}</b></div></div>
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
    const V = { leaders: vLeaders, rules: vRules, home: vHome, state: vLife, life: vLife, intro: vIntro, creator: vCreator, play: vPlay, summary: vSummary, profile: vProfile }[ui.view] || vHome;
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
      case "newlife": if (!char) { ui.after = "life"; go("creator", { draft: defaultDraft() }); } else { go("life", { stateId: "KL", daily: null }); if (NET.lobby) NET.lobby("", () => { if (ui.view === "life") render(); }); } break;
      case "editchar": ui.after = "profile"; go("creator", { draft: Object.assign({}, char) }); break;
      case "daily": { const d = AE.dailyPick(today()); ui.dailyPending = d; if (!char) { ui.after = "daily"; go("creator", { draft: defaultDraft() }); } else go("intro", { stateId: "KL", lifeId: d.lifeId, daily: today() }); break; }
      case "pickstate": ui.stateId = arg; render(); break;
      case "tolife": go("life", { stateId: ui.stateId || "KL", daily: null }); break;
      case "picklife": go("intro", { lifeId: arg, stateId: "KL" }); break;
      case "start": if ((NET.takenLives ? NET.takenLives() : {})[ui.lifeId] && !ui.daily) { go("life", { stateId: "KL" }); break; } startGame("KL", ui.lifeId, ui.daily ? { seed: AE.dailyPick(ui.daily).seed, daily: ui.daily } : {}); break;
      case "set": { const k = b.dataset.k, v = b.dataset.v; ui.draft[k] = isNaN(+v) ? v : +v; render(); break; }
      case "savechar": {
        const nm = (document.getElementById("f-name").value || "").replace(/[<>]/g, "").trim().slice(0, 18);
        ui.draft.name = nm || "Player"; char = Object.assign({}, ui.draft); save();
        if (ui.after === "daily") { const d = AE.dailyPick(today()); go("intro", { stateId: d.stateId, lifeId: d.lifeId, daily: today() }); }
        else if (ui.after === "profile") go("profile"); else { go("life", { stateId: "KL" }); if (NET.lobby) NET.lobby("", () => { if (ui.view === "life") render(); }); }
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
      case "fxnopen": ui.fxn = true; ui.sheet = null; render(); break;
      case "fxnclose": ui.fxn = false; ui.atStore = false; render(); break;
      case "fxntab": ui.fxnTab = arg; render(); break;
      case "rent": rent(arg); break;
      case "returnfit": game.outfit = null; save(); WORLD.setLook(char || game.player, null); if (NET.setOutfit) NET.setOutfit(""); ui.fxn = false; render(); break;
      case "buypass": if (game.cash >= FX.passPrice) { game.cash -= FX.passPrice; game.pass = true; save(); render(); } break;
      case "travelopen": ui.travel = true; render(); break;
      case "travelclose": ui.travel = false; render(); break;
      case "travel": {
        const g = game; if (g.shift) break;
        const cost = AE.travel(g, arg);
        if (cost) {
          ui.travel = false; g.visited = (g.visited || [g.stateId]).concat(g.visited && g.visited.indexOf(arg) >= 0 ? [] : [arg]);
          if (arg === g.stateId) g._moved = false;
          if (g.odd) { g.odd = null; }
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
      case "talk": if (game.shift) break; ui.talk = true; ui.talkRole = null; ui.talkAnswer = null; render(); break;
      case "closesheet": ui.sheet = null; ui.msg = null; ui.venture = false; ui.dateText = null; render(); refreshGuide(); break;
      case "phone": openSheet("phone"); break;
      case "status": openSheet("status"); break;
      case "career": openSheet("career"); break;
      case "site": openSheet("site", { site: arg }); break;
      case "seek": ui.seek = arg; render(); break;
      case "apply": { const r = CS.applyPaper(game, arg, "queue"); if (r) { ui.msg = r.text; save(); render(); } break; }
      case "agent": { const r = CS.applyPaper(game, arg, "agent"); if (r) { ui.msg = r.text; save(); render(); } break; }
      case "collect": if (CS.collectPaper(game, arg)) { ui.msg = "Signed and stamped: " + paperName(arg) + ". " + (CITY.officeLines[Math.floor(Math.random() * CITY.officeLines.length)]); save(); render(); } break;
      case "loan": { const lo = CS.takeLoan(game, arg); if (lo) { ui.msg = "Approved! " + inr(lo.principal) + " is in your account. EMI: " + inr(lo.emi) + " per " + unitOf(game) + "."; save(); render(); } break; }
      case "repay": { const l = game.loans[+arg]; if (l && game.cash >= l.left) { game.cash -= l.left; l.left = 0; ui.msg = "Loan closed. The bank manager smiles for the first time."; save(); render(); } break; }
      case "ventureopen": ui.venture = true; ui.vCity = null; ui.vLife = null; ui.msg = null; render(); break;
      case "ventureback": ui.venture = false; render(); break;
      case "vcity": ui.vCity = arg; render(); break;
      case "vlife": ui.vLife = arg; render(); break;
      case "venturego": {
        const g = game; if (!ui.vCity || !ui.vLife || (g.switches || 0) >= 2) break;
        const lo = CS.takeLoan(g, "venture"); if (!lo) break;
        AE.CITY.switchLife(g, ui.vLife, ui.vCity); g._moved = true; g.outfit = null;
        ui.sheet = null; ui.venture = false; save(); if (NET.lobby) NET.lobby(g.lifeId); netKey = null; render();
        WORLD.note("Loan approved! Walk to the station and take the train to " + STATES[ui.vCity].city + " to start.");
        break;
      }
      case "switchlife": { const g = game; if ((g.switches || 0) >= 2) break; if (AE.CITY.switchLife(g, arg)) { ui.sheet = null; ui.eventOpen = false; save(); if (NET.lobby) NET.lobby(g.lifeId); netKey = null; render(); WORLD.note("You quit and started: " + lifeById(arg).title); } break; }
      case "hupgrade": if (CS.upgradeHouse(game, false)) { ui.msg = "Moved in! Welcome to your " + CITY.houseLevels[game.house.lvl].name + "."; save(); render(); } break;
      case "hloan": if (CS.upgradeHouse(game, true)) { ui.msg = "Home loan approved. Welcome to your " + CITY.houseLevels[game.house.lvl].name + "!"; save(); render(); } break;
      case "paint": if (CS.paint(game, +arg)) { save(); render(); } break;
      case "decor": if (CS.buyDecor(game, arg)) { save(); render(); } break;
      case "interest": {
        const g = game; if (g.interestCh !== g.chapter) { g.interestCh = g.chapter; g.interests = 0; }
        if (g.interests >= 3) break; g.interests++;
        const r = CS.sendInterest(g, arg, ui.site); if (r) { ui.msg = r.text; save(); render(); } break;
      }
      case "datechoose": { const r = CS.dateChoose(game, +arg); ui.dateText = r.text; ui.dateMore = !!r.more; save(); render(); break; }
      case "datenext": ui.dateText = null; render(); break;
      case "family": { const r = CS.familyMeet(game, +arg); ui.sheet = null; save(); render(); WORLD.note(r.text); break; }
      case "wed": { const r = CS.wed(game, arg); if (r) { ui.sheet = null; game.log.push({ c: game.chapter, id: "wedding", t: "Your wedding", l: "Married " + game.spouse.name, r: r.text, d: r.d, alt: [] }); ui.outcome = { text: r.text, d: r.d }; save(); netKey = null; render(); } break; }
      case "btab": ui.btab = arg; render(); break;
      case "oddtake": { const g = game; if (g.odd || (g.oddThis || 0) >= 3) break; g.odd = { id: arg, target: WORLD.randomDoor(AE.rnd(g)) }; WORLD.setExtraSpot("odd", g.odd.target); ui.sheet = null; save(); render(); break; }
      case "grouptake": { const g = game, T = groupTask(arg); if (g.group) break; const key = T.where === "door" ? "grp" : T.where; g.group = { id: arg, key, target: key === "grp" ? WORLD.randomDoor(AE.rnd(g)) : null }; ui.sheet = null; save(); render(); if (key === "grp" && T.city === (g.loc || g.stateId)) WORLD.setExtraSpot("grp", g.group.target); break; }
      case "groupdrop": game.group = null; WORLD.setExtraSpot("grp", null); save(); render(); break;
      case "groupgo": {
        const g = game, T = groupTask(g.group.id), sp = WORLD.spotAt(g.group.key) || { x: 0, z: 0 };
        const here = partyHere().filter(m => Math.hypot(m.x + 0.5 - sp.x, m.y + 0.5 - sp.z) < 5).slice(0, T.size - 1);
        const r = CS.finishGroup(g, T, here.length);
        if (here.length) NET.groupDone(here.map(m => m.id), T.id, here.length + 1);
        if (!r.hired) g.r = Math.min(100, g.r + 5);
        WORLD.setExtraSpot("grp", null); ui.sheet = null; ui.outcome = { text: r.text, d: { cash: r.share, r: T.r } }; save(); render(); break;
      }
      case "gift": case "tip": { const g = game, amt = +arg, t = ui.target; if (!t || g.cash < amt) break; if (NET.gift(t.id, amt, act === "tip" ? "tip" : "")) { g.cash -= amt; g.gifts = (g.gifts || 0) + 1; ui.msg = "Sent " + inr(amt) + " to " + t.nick + "."; save(); render(); } break; }
      case "invite": { if (!ui.party) { ui.party = { pid: Math.random().toString(36).slice(2, 10) }; NET.setState({ pt: ui.party.pid }); } NET.party(ui.target.id, "inv", ui.party.pid); ui.msg = "Invite sent to " + ui.target.nick + "."; render(); break; }
      case "inviteyes": { const v = ui.invite; ui.party = { pid: v.pid }; NET.setState({ pt: v.pid }); NET.party(v.id, "acc", v.pid); ui.sheet = null; render(); WORLD.note("You joined " + v.nick + "'s group."); break; }
      case "inviteno": NET.party(ui.invite.id, "dec", ui.invite.pid); ui.sheet = null; render(); break;
      case "partyleave": ui.party = null; NET.setState({ pt: "" }); render(); break;
      case "mutep": ui.muteTarget = ui.target; ui.sheet = null; render(); break;
      case "shiftstart": startShift(); break;
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
      case "again": startGame("KL", game.lifeId, {}); break;
      case "askreset": ui.confirmReset = true; render(); break;
      case "reset": store.del("ns.char"); store.del("ns.profile"); store.del("ns.game"); char = null; profile = blankProfile(); game = null; go("home"); break;
    }
  });
  function selectShare() { const el = document.getElementById("sharetext"); if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
  function defaultDraft() { return { name: "", pronoun: "they", skin: 3, height: 168, weight: 62, hair: "short", hairColor: 0, acc: "none" }; }

  // old saves from before the Kochi update can't continue
  if (game && (!STATES[game.stateId] || !lifeById(game.lifeId) || !STATES[game.loc || game.stateId])) { game = null; store.del("ns.game"); }
  if (game) game = Object.assign({ papers: [], pending: [], fake: [], loans: [], house: { lvl: 0, wall: 0, items: [] }, spouse: null, romance: null, lifeHistory: [game.lifeId], switches: 0, missionsDone: 0 }, game);
  // resume into the right screen on load
  if (game && !game.done && game._showSummary) ui.view = "summary";
  render();
})();
