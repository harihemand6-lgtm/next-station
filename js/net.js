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
  const MAX = CFG.MAX_PLAYERS_SHOWN || 20, COLS = 48, ROWS = 36, MAXLEN = 80;

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
  function packAv(c) { return [c.skin, c.height, c.weight, HAIR.indexOf(c.hair), c.hairColor, TOP.indexOf(c.top), c.outfit, ACC.indexOf(c.acc)]; }
  function unpackAv(a) {
    if (!Array.isArray(a)) a = [];
    return { skin: int(a[0], 0, 7), height: int(a[1], 140, 200), weight: int(a[2], 40, 120), hair: HAIR[int(a[3], 0, 5)], hairColor: int(a[4], 0, 6), top: TOP[int(a[5], 0, 2)], outfit: int(a[6], 0, 7), acc: ACC[int(a[7], 0, 4)] };
  }
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

  async function join(roomName, character, pos, h, extra) {
    leave();
    if (!enabled()) return false;
    handlers = h || {}; room = roomName;
    myId = myId || Math.random().toString(36).slice(2, 10);
    my = Object.assign({ nk: myNick(), av: packAv(character), x: pos.x, y: pos.y }, extra || {});
    try { muted = JSON.parse(sessionStorage.getItem("ns.muted") || "{}"); } catch (e) { muted = {}; }
    const name = "ns-city-" + roomName;
    if (isLocal()) ch = localChannel(name);
    else {
      const sb = await loadSupabase();
      client = client || sb.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 4 } } });
      ch = client.channel(name, { config: { presence: { key: myId }, broadcast: { self: false } } });
    }
    const c = ch;
    const from = p => (c === ch && p && !muted[p.id] && peers[p.id]) ? String(p.id) : null;
    c.on("presence", { event: "sync" }, () => { if (c === ch) sync(); })
      .on("presence", { event: "join" }, () => { if (c === ch) sendMove(true); })
      .on("presence", { event: "leave" }, ({ key }) => { if (c === ch) { delete peers[key]; handlers.onLeave && handlers.onLeave(key); sync(); } })
      .on("broadcast", { event: "mv" }, ({ payload }) => { const id = from(payload); if (id) handlers.onMove && handlers.onMove(id, int(payload.x, 0, COLS - 1), int(payload.y, 0, ROWS - 1)); })
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
      .subscribe(status => { if (status === "SUBSCRIBED" && c === ch) c.track(my); });
    return true;
  }

  function sync() {
    if (!ch) return;
    const st = ch.presenceState(), ids = Object.keys(st).filter(k => k !== myId);
    const shown = ids.filter(k => !muted[k]).slice(0, MAX);
    Object.keys(peers).forEach(k => { if (shown.indexOf(k) < 0) { delete peers[k]; handlers.onLeave && handlers.onLeave(k); } });
    shown.forEach(k => {
      const s = (st[k] && st[k][0]) || {};
      const data = { nick: nickOf(s.nk), av: unpackAv(s.av), x: int(s.x, 0, COLS - 1), y: int(s.y, 0, ROWS - 1), o: /^[a-z_]{1,24}$/.test(s.o || "") ? s.o : "", hs: /^[A-Z]{2}$/.test(s.hs || "") ? s.hs : "" };
      const prev = peers[k];
      peers[k] = data;
      if (!prev) handlers.onJoin && handlers.onJoin(k, data);
      else if (prev.o !== data.o) handlers.onUpdate && handlers.onUpdate(k, data);
    });
    handlers.onCount && handlers.onCount(ids.length + 1);
  }

  function move(x, y) { if (!my) return; my.x = x; my.y = y; sendMove(false); }
  function sendMove(force) {
    if (!ch || !my) return;
    const now = Date.now();
    if (!force && now - lastMove < 400) { clearTimeout(sendMove._t); sendMove._t = setTimeout(() => sendMove(true), 420); return; }
    lastMove = now;
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
  function leave() { if (ch) { try { ch.unsubscribe(); } catch (e) { } } ch = null; peers = {}; heard = {}; }

  return { configured, setOutfit, submitScore, topScores, enabled, join, move, say, sendText, check, mute, report, leave, PHRASES, EMOTES, nick: () => nickOf(myNick()), heardFrom: id => heard[id] || [] };
})();
