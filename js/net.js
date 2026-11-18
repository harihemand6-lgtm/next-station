// Live city presence and chat (Supabase Realtime). Players see each other's avatars and a random nickname.
// Typed chat is 18+ only, nearby only, filtered, rate-limited and never stored. Reports are saved only when a
// player taps Report, into the "reports" table (see SUPABASE_SETUP.md).
window.AE_NET = (function () {
  const CFG = window.NS_CONFIG || {};
  const PHRASES = ["Namaste! 👋", "Nice to meet you!", "Which life are you playing?", "Try the Trader life!", "I got a great ending!", "This city is fun", "Good luck!", "Need help?", "Haha 😂", "Thanks!", "See you at the station!", "Bye!"];
  const EMOTES = ["👋 Wave", "👏 Clap", "💃 Dance", "🙏 Namaste"];
  const ADJ = ["Chai", "Masala", "Monsoon", "Filter", "Express", "Lucky", "Mango", "Turbo", "Coconut", "Spicy", "Midnight", "Sunny", "Desi", "Royal", "Jolly", "Silent"];
  const NOUN = ["Tiger", "Rocket", "Peacock", "Elephant", "Cobra", "Panther", "Kite", "Lassi", "Samosa", "Falcon", "Monk", "Rickshaw", "Parrot", "Dosa", "Comet", "Banyan"];
  const HAIR = ["short", "long", "bun", "curly", "buzz", "bald"], TOP = ["tee", "shirt", "kurta"], ACC = ["none", "specs", "moustache", "beard", "cap"];
  const MAX = CFG.MAX_PLAYERS_SHOWN || 20, COLS = 128, ROWS = 96, MAXLEN = 80; // clamp bounds for positions (largest map; the world clamps again to its own grid)

  // Starter block list. Add words freely; matching ignores case, spacing, repeated letters and common l33t swaps.
  const BAD = ["fuck", "fuk", "shit", "bitch", "bastard", "asshole", "dick", "pussy", "slut", "whore", "cunt", "porn", "nude", "nudes", "sexy", "sex",
    "chutiya", "chutia", "madarchod", "maderchod", "bhenchod", "behenchod", "benchod", "bhosdi", "bsdk", "gandu", "gaandu", "randi", "harami", "lund", "lauda", "loda", "chut", "gaand", "jhatu", "kamina",
    "myre", "myru", "mairu", "mayir", "poorimon", "pooru", "thayoli", "kunna", "kunne", "punda", "pundachi", "oombi", "kundi",
    "thevidiya", "sule", "soole", "bolimaga", "bewarsi", "khanki", "bokachoda", "pencho", "bhadwa", "zavadya", "kill yourself", "kys"];
  const norm = s => s.toLowerCase().replace(/[0@]/g, m => (m === "0" ? "o" : "a")).replace(/1|!/g, "i").replace(/3/g, "e").replace(/4/g, "a").replace(/5|\$/g, "s").replace(/7/g, "t").replace(/(.)\1+/g, "$1");
  const BADN = BAD.map(norm);
  function check(text) {
    const t = String(text || "").trim();
    if (!t) return { ok: false, reason: "Type something first." };
    if (t.length > MAXLEN) return { ok: false, reason: "Keep it under " + MAXLEN + " characters." };
    if (/(\d[\s\-.]*){6,}/.test(t)) return { ok: false, reason: "Numbers that look like phone numbers or IDs can't be shared." };
    if (/https?:|www\.|\.(com|in|net|org|io|me|ly|gg|app|xyz)\b|wa\.me|t\.me/i.test(t)) return { ok: false, reason: "Links can't be shared in chat." };
    if (/\S+@\S+/.test(t)) return { ok: false, reason: "Emails and UPI IDs can't be shared." };
    if (/(^|\s)@\w{2,}|insta|snapchat|snap\s*id|telegram|whats\s*app|\bdm\s*me\b|\bmy\s*(number|no\.?|id)\b/i.test(t)) return { ok: false, reason: "Social handles and 'DM me' aren't allowed. Keep chat in the game." };
    let n = norm(t); for (let i = 0; i < 6; i++) n = n.replace(/\b([a-z])[\s._*-]+(?=[a-z]\b)/g, "$1");
    const squashed = n.replace(/[^a-z]/g, ""), words = n.split(/[^a-z]+/);
    if (BADN.some(b => (b.length >= 6 ? squashed.indexOf(b) >= 0 : words.indexOf(b) >= 0 || (b.indexOf(" ") > 0 && n.indexOf(b) >= 0)))) return { ok: false, reason: "That message breaks the chat rules." };
    return { ok: true, text: t };
  }

  let ch = null, client = null, myId = null, my = null, handlers = {}, lastSay = 0, lastMove = 0, muted = {}, peers = {}, heard = {}, loading = null, room = null;

  const int = (v, a, b) => { v = Math.round(+v); return isFinite(v) ? Math.max(a, Math.min(b, v)) : a; };
  const nickOf = n => (Array.isArray(n) ? ADJ[int(n[0], 0, ADJ.length - 1)] + " " + NOUN[int(n[1], 0, NOUN.length - 1)] + " " + int(n[2], 10, 99) : "Traveller");
  // avatars travel as a short array of indices (js/people.js); old-format arrays are still understood
  function packAv(c) { return window.AE_PEOPLE ? window.AE_PEOPLE.pack(c) : []; }
  function unpackAv(a) { return window.AE_PEOPLE ? window.AE_PEOPLE.unpack(a) : {}; }
  // family walking with a player: names only (looks are generated from names), max 3 kids
  const okName = n => typeof n === "string" && /^[A-Za-z][A-Za-z .]{0,17}$/.test(n);
  function famOf(f) { if (!f || typeof f !== "object") return null; const s = okName(f.s) ? f.s : "", k = Array.isArray(f.k) ? f.k.filter(x => Array.isArray(x) && okName(x[0])).slice(0, 3).map(x => [x[0], int(x[1], 0, 40)]) : []; return s || k.length ? { s, sf: f.sf ? 1 : 0, k } : null; }
  function myNick() {
    try { const s = JSON.parse(localStorage.getItem("ns.nick")); if (Array.isArray(s)) return s; } catch (e) { }
    const n = [Math.floor(Math.random() * ADJ.length), Math.floor(Math.random() * NOUN.length), 10 + Math.floor(Math.random() * 90)];
    try { localStorage.setItem("ns.nick", JSON.stringify(n)); } catch (e) { }
    return n;
  }
  const isLocal = () => /[?&]localnet=1/.test(location.search);
  const enabled = () => !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY) || isLocal();

  function loadSupabase() {
    if (window.supabase) return Promise.resolve(window.supabase);
    if (loading) return loading;
    loading = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.119.0/dist/umd/supabase.js";
      s.onload = () => res(window.supabase); s.onerror = rej;
      document.head.appendChild(s);
    });
    return loading;
  }

  // Test transport: ?localnet=1 links tabs of one browser with the same message format.
  function localChannel(name) {
    const bc = new BroadcastChannel(name), subs = {}, presence = {};
    let self = null;
    const emit = (type, payload) => (subs[type] || []).forEach(f => f(payload));
    bc.onmessage = e => {
      const m = e.data;
      if (m.t === "hello" || m.t === "track") { const fresh = !presence[m.key]; presence[m.key] = m.state; emit("sync"); if (fresh) emit("join", { key: m.key }); if (m.t === "hello" && self) bc.postMessage({ t: "track", key: self.key, state: self.state }); }
      else if (m.t === "bye") { delete presence[m.key]; emit("leave", { key: m.key }); emit("sync"); }
      else if (m.t === "b") emit("b:" + m.event, { payload: m.payload });
    };
    return {
      on(kind, filter, fn) { const k = kind === "presence" ? filter.event : "b:" + filter.event; (subs[k] = subs[k] || []).push(fn); return this; },
      subscribe(cb) { setTimeout(() => cb("SUBSCRIBED"), 10); return this; },
      track(state) { self = { key: myId, state }; presence[myId] = state; bc.postMessage({ t: "hello", key: myId, state }); emit("sync"); return Promise.resolve(); },
      presenceState() { const o = {}; Object.keys(presence).forEach(k => (o[k] = [presence[k]])); return o; },
      send(m) { bc.postMessage({ t: "b", event: m.event, payload: m.payload }); return Promise.resolve(); },
      unsubscribe() { bc.postMessage({ t: "bye", key: myId }); bc.close(); }
    };
  }

  // ── rooms: each city is split into rooms of ROOM_SIZE players so realtime traffic stays small ──
  const CAP = CFG.ROOM_SIZE || 8;
  let city = null, roomN = 1, hops = 0, lobbyReady = null;
  function roomCounts(c) {
    const out = {}; if (!lob) return out;
    const st = lob.presenceState();
    Object.keys(st).forEach(k => { if (k === myId) return; const s = (st[k] && st[k][0]) || {}; const n = int(s.n, 0, 999); if (s.c === c && n > 0) out[n] = (out[n] || 0) + 1; });
    return out;
  }
  function pickRoom(c, skip) { const cnt = roomCounts(c); for (let n = 1; n < 500; n++) if (n !== skip && (cnt[n] || 0) < CAP) return n; return 1; }
  function rooms(c) {
    const cnt = roomCounts(c || city), list = [], top = Math.max(roomN, ...Object.keys(cnt).map(Number), 1);
    for (let n = 1; n <= top + 1; n++) list.push({ n, count: (cnt[n] || 0) + (n === roomN && c === city ? 1 : 0), cap: CAP, mine: n === roomN && (c || city) === city });
    return list;
  }

  async function join(cityId, character, pos, h, extra, forceN) {
    leave(true);
    if (!enabled()) return false;
    handlers = h || {}; city = cityId; hops = 0;
    myId = myId || Math.random().toString(36).slice(2, 10);
    my = Object.assign({ nk: myNick(), av: packAv(character), x: pos.x, y: pos.y }, extra || {});
    try { muted = JSON.parse(sessionStorage.getItem("ns.muted") || "{}"); } catch (e) { muted = {}; }
    if (!lob) await lobby(lobMine ? lobMine.l : "");
    if (lobbyReady) await Promise.race([lobbyReady, new Promise(r => setTimeout(r, 1500))]);
    return openRoom(forceN && forceN > 0 ? forceN : pickRoom(cityId));
  }
  async function switchRoom(n) {
    if (!city || !my || n === roomN) return false;
    const cnt = roomCounts(city); if ((cnt[n] || 0) >= CAP) return false;
    hops = 0; return openRoom(n);
  }
  async function openRoom(n) {
    if (ch) { try { ch.unsubscribe(); } catch (e) { } }
    Object.keys(peers).forEach(k => handlers.onLeave && handlers.onLeave(k));
    ch = null; peers = {}; heard = {};
    roomN = n; my.t = Date.now();
    if (lobMine) { lobMine.c = city; lobMine.n = n; if (lob) { try { lob.track(lobMine); } catch (e) { } } }
    const name = "ns-city-" + city + "-" + n;
    if (isLocal()) ch = localChannel(name);
    else {
      const sb = await loadSupabase();
      client = client || sb.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 4 } } });
      ch = client.channel(name, { config: { presence: { key: myId }, broadcast: { self: false } } });
    }
    const c = ch;
    const from = p => (c === ch && p && !muted[p.id] && peers[p.id]) ? String(p.id) : null;
    c.on("presence", { event: "sync" }, () => { if (c === ch) { if (!overflow()) sync(); } })
      .on("presence", { event: "join" }, () => { if (c === ch) sendMove(true); })
      .on("presence", { event: "leave" }, ({ key, currentPresences }) => {
        // a player who just updated their state also fires "leave" for the old copy; only remove them if they're really gone
        if (c !== ch || (currentPresences && currentPresences.length) || (c.presenceState()[key] || []).length) return;
        delete peers[key]; handlers.onLeave && handlers.onLeave(key); sync();
      })
      .on("broadcast", { event: "mv" }, ({ payload }) => { const id = from(payload); if (id) { const x = int(payload.x, 0, COLS - 1), y = int(payload.y, 0, ROWS - 1); peers[id].x = x; peers[id].y = y; handlers.onMove && handlers.onMove(id, x, y); } })
      .on("broadcast", { event: "say" }, ({ payload }) => {
        const id = from(payload); if (!id) return;
        const list = payload.k === "e" ? EMOTES : PHRASES, i = int(payload.i, -1, list.length - 1);
        if (i >= 0) handlers.onSay && handlers.onSay(id, list[i], false);
      })
      .on("broadcast", { event: "tx" }, ({ payload }) => {
        const id = from(payload); if (!id) return;
        const r = check(payload.t); if (!r.ok) return; // receivers re-check everything
        (heard[id] = heard[id] || []).push({ t: r.text, at: new Date().toISOString() }); if (heard[id].length > 5) heard[id].shift();
        handlers.onSay && handlers.onSay(id, r.text, true);
      })
      .on("broadcast", { event: "gift" }, ({ payload }) => {
        const id = from(payload); if (!id || payload.to !== myId) return;
        const amt = int(payload.amt, 0, 100000); if (amt > 0) handlers.onGift && handlers.onGift(id, amt, payload.why === "tip");
      })
      .on("broadcast", { event: "party" }, ({ payload }) => {
        const id = from(payload); if (!id || (payload.to && payload.to !== myId)) return;
        handlers.onParty && handlers.onParty(id, { k: String(payload.k || ""), pid: String(payload.pid || "").slice(0, 16), task: String(payload.task || "").slice(0, 24) });
      })
      .on("broadcast", { event: "team" }, ({ payload: p }) => {
        const id = from(p); if (!id || !p || !Array.isArray(p.members) || p.members.indexOf(myId) < 0) return;
        const roles = {}; if (p.roles && typeof p.roles === "object") Object.keys(p.roles).slice(0, 6).forEach(k => { roles[String(k).slice(0, 12)] = int(p.roles[k], 0, 5); });
        handlers.onTeam && handlers.onTeam(id, { k: String(p.k || "").slice(0, 6), sid: String(p.sid || "").slice(0, 12), task: String(p.task || "").slice(0, 24), roles, score: int(p.score, 0, 100), real: int(p.real, 0, 6), names: Array.isArray(p.names) ? p.names.slice(0, 6).map(n => int(n, 0, 5)) : [] });
      })
      .on("broadcast", { event: "gdone" }, ({ payload }) => {
        const id = from(payload); if (!id || !Array.isArray(payload.members) || payload.members.indexOf(myId) < 0) return;
        handlers.onGroupDone && handlers.onGroupDone(id, String(payload.task || "").slice(0, 24), int(payload.real, 0, 6));
      })
      .subscribe(status => { if (status === "SUBSCRIBED" && c === ch) c.track(my); });
    return true;
  }
  // Two players can pick the same last seat at once. The newest arrivals move to the next room.
  function overflow() {
    if (!ch || hops >= 3) return false;
    const st = ch.presenceState(), all = Object.keys(st);
    if (all.length <= CAP) return false;
    const order = all.map(k => ({ k, t: k === myId ? my.t : +(((st[k] || [])[0] || {}).t) || 0 })).sort((a, b) => a.t - b.t || (a.k < b.k ? -1 : 1));
    if (order.findIndex(o => o.k === myId) < CAP) return false;
    hops++; openRoom(pickRoom(city, roomN)); return true;
  }
  function gift(to, amt, why) { if (!ch) return false; ch.send({ type: "broadcast", event: "gift", payload: { id: myId, to, amt: Math.round(amt), why: why || "" } }); return true; }
  function party(to, k, pid, task) { if (!ch) return false; ch.send({ type: "broadcast", event: "party", payload: { id: myId, to: to || "", k, pid: pid || "", task: task || "" } }); return true; }
  function team(members, data) { if (!ch) return; ch.send({ type: "broadcast", event: "team", payload: Object.assign({ id: myId, members }, data) }); }
  function groupDone(members, task, real) { if (!ch) return; ch.send({ type: "broadcast", event: "gdone", payload: { id: myId, members, task, real } }); }
  // only re-send presence when something actually changed: every re-track makes other players see a leave + join
  function setState(patch) { if (!my) return; let changed = false; Object.keys(patch || {}).forEach(k => { if (JSON.stringify(my[k]) !== JSON.stringify(patch[k])) { my[k] = patch[k]; changed = true; } }); if (changed && ch) { clearTimeout(setState._t); setState._t = setTimeout(() => { try { ch && ch.track(my); } catch (e) { } }, 250); } }
  function peerPos(id) { const p = peers[id]; return p ? { x: p.x, y: p.y } : null; }
  function updatePeerPos(id, x, y) { if (peers[id]) { peers[id].x = x; peers[id].y = y; } }

  // ── lobby: who is online in which life (for job locks) ──
  let lob = null, lobCb = null, lobMine = null;
  async function lobby(lifeId, cb) {
    if (cb) lobCb = cb;
    const same = lobMine && lobMine.l === (lifeId || "");
    lobMine = Object.assign(lobMine || {}, { l: lifeId || "", nk: myNick() });
    if (same && lob) return; // nothing changed: don't re-broadcast presence
    if (!enabled()) return;
    myId = myId || Math.random().toString(36).slice(2, 10);
    if (!lob) {
      try {
        if (isLocal()) lob = localChannel("ns-lobby");
        else { const sb = await loadSupabase(); client = client || sb.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 4 } } }); lob = client.channel("ns-lobby", { config: { presence: { key: myId } } }); }
        const L = lob; let ready; lobbyReady = new Promise(r => (ready = r));
        L.on("presence", { event: "sync" }, () => { if (L !== lob) return; ready(); if (lobCb) lobCb(); if (handlers.onRooms) handlers.onRooms(); }).subscribe(st => { if (st === "SUBSCRIBED" && L === lob) L.track(lobMine); });
      } catch (e) { lob = null; }
    } else { try { lob.track(lobMine); } catch (e) { } }
  }
  function takenLives() {
    const out = {}; if (!lob) return out;
    const st = lob.presenceState();
    Object.keys(st).forEach(k => { if (k === myId) return; const s = (st[k] && st[k][0]) || {}; if (/^[a-z]{2,10}$/.test(s.l || "")) out[s.l] = nickOf(s.nk); });
    return out;
  }

  function sync() {
    if (!ch) return;
    const st = ch.presenceState(), ids = Object.keys(st).filter(k => k !== myId);
    const shown = ids.filter(k => !muted[k]).slice(0, MAX);
    Object.keys(peers).forEach(k => { if (shown.indexOf(k) < 0) { delete peers[k]; handlers.onLeave && handlers.onLeave(k); } });
    shown.forEach(k => {
      const s = (st[k] && st[k][0]) || {};
      const data = { nick: nickOf(s.nk), av: unpackAv(s.av), x: int(s.x, 0, COLS - 1), y: int(s.y, 0, ROWS - 1), o: /^[a-z_]{1,24}$/.test(s.o || "") ? s.o : "", hs: /^[A-Z]{2}$/.test(s.hs || "") ? s.hs : "",
        l: /^[a-z]{2,10}$/.test(s.l || "") ? s.l : "", rd: typeof s.rd === "number" && s.rd >= 0 && s.rd <= 5 ? Math.round(s.rd * 10) / 10 : 0, pt: /^[a-z0-9]{1,16}$/.test(s.pt || "") ? s.pt : "", vh: /^[a-z]{2,10}$/.test(s.vh || "") ? s.vh : "", vc: int(s.vc, 0, 7), fam: famOf(s.fam), py: /^[a-z]{2,8}$/.test(s.py || "") ? s.py : "" };
      const prev = peers[k];
      if (prev && prev.x !== undefined) { data.x = prev.x; data.y = prev.y; }
      peers[k] = data;
      if (!prev) handlers.onJoin && handlers.onJoin(k, data);
      else if (prev.o !== data.o || prev.rd !== data.rd || prev.l !== data.l || prev.pt !== data.pt || prev.vh !== data.vh || prev.vc !== data.vc || prev.py !== data.py || JSON.stringify(prev.fam) !== JSON.stringify(data.fam)) handlers.onUpdate && handlers.onUpdate(k, data);
    });
    handlers.onCount && handlers.onCount(ids.length + 1, roomN);
  }

  // The world sends where you are heading (a tap target, or a point ~1 s ahead on the joystick), so other phones
  // can animate the walk themselves. That is one message per tap and at most about one a second while steering.
  let lastSent = "";
  function move(x, y) { if (!my) return; my.x = x; my.y = y; sendMove(false); }
  function sendMove(force) {
    if (!ch || !my) return;
    const now = Date.now(), k = my.x + "," + my.y;
    if (!force && k === lastSent) return;
    if (!force && now - lastMove < 900) { clearTimeout(sendMove._t); sendMove._t = setTimeout(() => sendMove(false), 920 - (now - lastMove)); return; }
    clearTimeout(sendMove._t); lastMove = now; lastSent = k;
    ch.send({ type: "broadcast", event: "mv", payload: { id: myId, x: my.x, y: my.y } });
  }
  function say(kind, i) {
    if (!ch) return null;
    const now = Date.now(); if (now - lastSay < 2500) return null; lastSay = now;
    ch.send({ type: "broadcast", event: "say", payload: { id: myId, k: kind === "e" ? "e" : "p", i } });
    return (kind === "e" ? EMOTES : PHRASES)[i];
  }
  function sendText(text) {
    if (!ch) return { ok: false, reason: "You're offline." };
    const r = check(text); if (!r.ok) return r;
    const now = Date.now(); if (now - lastSay < 3000) return { ok: false, reason: "Slow down: one message every 3 seconds." };
    lastSay = now;
    ch.send({ type: "broadcast", event: "tx", payload: { id: myId, t: r.text } });
    return r;
  }
  function mute(id) { muted[id] = 1; try { sessionStorage.setItem("ns.muted", JSON.stringify(muted)); } catch (e) { } delete peers[id]; handlers.onLeave && handlers.onLeave(id); }
  async function report(id, nick, reason) {
    const row = { room, reported_nick: nick, reason: String(reason || "").slice(0, 200), messages: heard[id] || [] };
    if (isLocal() || !client) { console.log("report (test mode)", row); return true; }
    try { const { error } = await client.from("reports").insert(row); return !error; } catch (e) { return false; }
  }
  function setOutfit(id) { if (!my) return; my.o = id || ""; if (ch) { try { ch.track(my); } catch (e) { } } }
  const configured = () => !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY);
  async function db() { if (!configured()) return null; const sb = await loadSupabase(); client = client || sb.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 4 } } }); return client; }
  async function submitScore(row) { try { const c = await db(); if (!c) return false; const { error } = await c.from("scores").insert(Object.assign({ nick: nickOf(myNick()) }, row)); return !error; } catch (e) { return false; } }
  async function topScores(f) {
    try {
      const c = await db(); if (!c) return null;
      let q = c.from("scores").select("nick,life,state,ending,score,daily,created_at").order("score", { ascending: false }).limit(20);
      if (f.daily) q = q.eq("daily", f.daily); if (f.life) q = q.eq("life", f.life);
      const { data, error } = await q; return error ? null : data;
    } catch (e) { return null; }
  }
  function leave(keepLobby) { if (ch) { try { ch.unsubscribe(); } catch (e) { } } clearTimeout(sendMove._t); ch = null; peers = {}; heard = {}; lastSent = ""; if (!keepLobby && lobMine && lobMine.c) { lobMine.c = ""; lobMine.n = 0; if (lob) { try { lob.track(lobMine); } catch (e) { } } } }

  // ── Squads: a private group joined with a 6-character code. Works across rooms and cities. Max 6 players.
  // Carries squad chat (same filter as city chat) and the signalling for push-to-talk voice (js/voice.js).
  const SQ_ALPHA = "ABCDEFGHJKMNPQRSTUVWXYZ23456789", SQ_MAX = 6;
  let sq = null, sqLast = 0;
  const okCode = c => new RegExp("^[" + SQ_ALPHA + "]{6}$").test(c);
  function newCode() { const a = new Uint8Array(6); crypto.getRandomValues(a); return Array.from(a, b => SQ_ALPHA[b % SQ_ALPHA.length]).join(""); }
  function sqMembers() {
    if (!sq) return [];
    const st = sq.ch.presenceState();
    return Object.keys(st).map(k => { const s = (st[k] && st[k][0]) || {}; return { id: k, nick: nickOf(s.nk), t: +s.t || 0, v: s.v ? 1 : 0, me: k === myId, muted: !!sq.mute[k] }; }).sort((a, b) => a.t - b.t);
  }
  async function squadJoin(code, h) {
    code = String(code || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!okCode(code)) return { ok: false, reason: "Squad codes are 6 letters and numbers, like K7QP4Z." };
    if (!enabled()) return { ok: false, reason: "Squads need the online mode." };
    squadLeave(true);
    myId = myId || Math.random().toString(36).slice(2, 10);
    let c;
    if (isLocal()) c = localChannel("ns-sq-" + code);
    else { const sb = await loadSupabase(); client = client || sb.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 4 } } }); c = client.channel("ns-sq-" + code, { config: { presence: { key: myId }, broadcast: { self: false } } }); }
    const me = { nk: myNick(), t: Date.now(), v: 0 };
    sq = { code, ch: c, h: h || {}, me, mute: {} };
    const cur = () => sq && sq.ch === c;
    const member = id => cur() && id && id !== myId && c.presenceState()[id];
    c.on("presence", { event: "sync" }, () => {
      if (!cur()) return;
      const list = sqMembers();
      if (list.length > SQ_MAX && list.findIndex(m => m.me) >= SQ_MAX) { const hh = sq.h; squadLeave(); hh.onFull && hh.onFull(); return; }
      sq.h.onMembers && sq.h.onMembers(list);
    })
      .on("broadcast", { event: "sm" }, ({ payload: p }) => { if (!p || !member(p.id) || sq.mute[p.id]) return; const r = p.k === "p" ? { ok: true, text: PHRASES[int(p.i, 0, PHRASES.length - 1)] } : check(p.text); if (r.ok) sq.h.onMsg && sq.h.onMsg(p.id, nickOf((c.presenceState()[p.id][0] || {}).nk), r.text); })
      .on("broadcast", { event: "rtc" }, ({ payload: p }) => { if (!p || p.to !== myId || !member(p.from) || sq.mute[p.from]) return; sq.h.onRtc && sq.h.onRtc(p); })
      .on("broadcast", { event: "talk" }, ({ payload: p }) => { if (p && member(p.id)) sq.h.onTalk && sq.h.onTalk(p.id, !!p.on); })
      .subscribe(st => { if (st === "SUBSCRIBED" && cur()) { try { c.track(me); } catch (e) { } } });
    try { localStorage.setItem("ns.squad", code); } catch (e) { }
    return { ok: true, code };
  }
  function squadCreate(h) { return squadJoin(newCode(), h); }
  function squadLeave(keepSaved) {
    if (sq) { try { sq.ch.unsubscribe(); } catch (e) { } }
    sq = null; if (!keepSaved) { try { localStorage.removeItem("ns.squad"); } catch (e) { } }
  }
  function squadSay(text, phrase) {
    if (!sq) return { ok: false, reason: "Join a squad first." };
    const now = Date.now(); if (now - sqLast < 1500) return { ok: false, reason: "Slow down a little." };
    let payload;
    if (phrase != null) payload = { id: myId, k: "p", i: int(phrase, 0, PHRASES.length - 1) };
    else { const r = check(text); if (!r.ok) return r; payload = { id: myId, k: "t", text: r.text }; }
    sqLast = now; sq.ch.send({ type: "broadcast", event: "sm", payload });
    return { ok: true, text: payload.k === "p" ? PHRASES[payload.i] : payload.text };
  }
  function squadSignal(to, data) { if (sq) sq.ch.send({ type: "broadcast", event: "rtc", payload: Object.assign({ to, from: myId }, data) }); }
  function squadTalk(on) { if (sq) sq.ch.send({ type: "broadcast", event: "talk", payload: { id: myId, on: !!on } }); }
  function squadVoice(on) { if (!sq) return; sq.me.v = on ? 1 : 0; try { sq.ch.track(sq.me); } catch (e) { } }
  function squadMute(id, on) { if (sq) { if (on) sq.mute[id] = 1; else delete sq.mute[id]; } }
  async function squadReport(id, nick, reason) {
    const row = { room: "squad", reported_nick: nick, reason: String(reason || "").slice(0, 200), messages: [] };
    if (isLocal() || !client) { console.log("report (test mode)", row); return true; }
    try { const { error } = await client.from("reports").insert(row); return !error; } catch (e) { return false; }
  }
  const squad = () => sq ? { code: sq.code, members: sqMembers(), myId } : null;
  const savedSquad = () => { try { const c = localStorage.getItem("ns.squad"); return c && okCode(c) ? c : null; } catch (e) { return null; } };

  return { team, squadJoin, squadCreate, squadLeave, squadSay, squadSignal, squadTalk, squadVoice, squadMute, squadReport, squad, savedSquad, phrases: () => PHRASES.slice(), db, cleanNick: n => nickOf(n), myNick, rooms, room: () => ({ city, n: roomN, cap: CAP }), switchRoom, configured, setOutfit, gift, party, groupDone, setState, peerPos, lobby, takenLives, peers: () => peers, myId: () => myId, submitScore, topScores, enabled, join, move, say, sendText, check, mute, report, leave: () => leave(false), PHRASES, EMOTES, nick: () => nickOf(myNick()), heardFrom: id => heard[id] || [] };
})();
