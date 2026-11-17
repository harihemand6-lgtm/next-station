// Live street presence. Players see each other's avatars and a random nickname, and can only send
// preset phrases and emotes (by number). Nothing is stored; messages pass through live and disappear.
window.AE_NET = (function () {
  const CFG = window.NS_CONFIG || {};
  const PHRASES = ["Namaste! 👋", "Nice to meet you!", "Which life are you playing?", "Try the Trader life!", "I got a great ending!", "This city is fun", "Good luck!", "Need help?", "Haha 😂", "Thanks!", "See you at the station!", "Bye!"];
  const EMOTES = ["👋 Wave", "👏 Clap", "💃 Dance", "🙏 Namaste"];
  const ADJ = ["Chai", "Masala", "Monsoon", "Filter", "Express", "Lucky", "Mango", "Turbo", "Coconut", "Spicy", "Midnight", "Sunny", "Desi", "Royal", "Jolly", "Silent"];
  const NOUN = ["Tiger", "Rocket", "Peacock", "Elephant", "Cobra", "Panther", "Kite", "Lassi", "Samosa", "Falcon", "Monk", "Rickshaw", "Parrot", "Dosa", "Comet", "Banyan"];
  const HAIR = ["short", "long", "bun", "curly", "buzz", "bald"], TOP = ["tee", "shirt", "kurta"], ACC = ["none", "specs", "moustache", "beard", "cap"];
  const MAX = CFG.MAX_PLAYERS_SHOWN || 20;

  let ch = null, client = null, myId = null, my = null, handlers = {}, lastSay = 0, lastMove = 0, muted = {}, peers = {}, loading = null;

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

  function loadSupabase() {
    if (window.supabase) return Promise.resolve(window.supabase);
    if (loading) return loading;
    loading = new Promise((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
      s.onload = () => res(window.supabase); s.onerror = rej;
      document.head.appendChild(s);
    });
    return loading;
  }

  // Local test transport: ?localnet=1 links tabs of the same browser. Same message format as Supabase.
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

  const enabled = () => !!(CFG.SUPABASE_URL && CFG.SUPABASE_KEY) || /[?&]localnet=1/.test(location.search);

  async function join(room, character, pos, h) {
    leave();
    if (!enabled()) return false;
    handlers = h || {};
    myId = myId || (Math.random().toString(36).slice(2, 10));
    my = { nk: myNick(), av: packAv(character), x: pos.x, y: pos.y };
    try { muted = JSON.parse(sessionStorage.getItem("ns.muted") || "{}"); } catch (e) { muted = {}; }
    const name = "ns-street-" + room;
    if (/[?&]localnet=1/.test(location.search)) ch = localChannel(name);
    else {
      const sb = await loadSupabase();
      client = client || sb.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_KEY, { realtime: { params: { eventsPerSecond: 4 } } });
      ch = client.channel(name, { config: { presence: { key: myId }, broadcast: { self: false } } });
    }
    const c = ch;
    c.on("presence", { event: "sync" }, () => { if (c === ch) sync(); })
      .on("presence", { event: "join" }, () => { if (c === ch) sendMove(true); })
      .on("presence", { event: "leave" }, ({ key }) => { if (c === ch) { delete peers[key]; handlers.onLeave && handlers.onLeave(key); sync(); } })
      .on("broadcast", { event: "mv" }, ({ payload }) => {
        if (c !== ch || !payload || muted[payload.id] || !peers[payload.id]) return;
        handlers.onMove && handlers.onMove(String(payload.id), int(payload.x, 0, 1500), int(payload.y, 150, 260));
      })
      .on("broadcast", { event: "say" }, ({ payload }) => {
        if (c !== ch || !payload || muted[payload.id] || !peers[payload.id]) return;
        const list = payload.k === "e" ? EMOTES : PHRASES;
        const i = int(payload.i, -1, list.length - 1);
        if (i >= 0) handlers.onSay && handlers.onSay(String(payload.id), list[i]);
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
      const data = { nick: nickOf(s.nk), av: unpackAv(s.av), x: int(s.x, 0, 1500), y: int(s.y, 150, 260) };
      const isNew = !peers[k];
      peers[k] = data;
      if (isNew) handlers.onJoin && handlers.onJoin(k, data);
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
    const now = Date.now();
    if (now - lastSay < 2500) return null;
    lastSay = now;
    ch.send({ type: "broadcast", event: "say", payload: { id: myId, k: kind === "e" ? "e" : "p", i } });
    return (kind === "e" ? EMOTES : PHRASES)[i];
  }
  function mute(id) { muted[id] = 1; try { sessionStorage.setItem("ns.muted", JSON.stringify(muted)); } catch (e) { } delete peers[id]; handlers.onLeave && handlers.onLeave(id); }
  function leave() { if (ch) { try { ch.unsubscribe(); } catch (e) { } } ch = null; peers = {}; }

  return { enabled, join, move, say, mute, leave, PHRASES, EMOTES, nick: () => nickOf(myNick()) };
})();
