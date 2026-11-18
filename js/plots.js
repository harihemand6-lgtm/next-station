// FXN Nagar plot registry. Your own claim is kept on this device; when the Supabase "plots" table exists
// (see SUPABASE_SETUP.md) every player's houses are shared, so the whole township sees the same homes.
window.AE_PLOTS = (function () {
  "use strict";
  const CITY = "KL", LS = "ns.plots." + CITY, KEYLS = "ns.plotkey";
  let remote = {}, mine = load(), listeners = [], online = null, timer = 0, lastFetch = 0;
  function load() { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } }
  function store() { try { localStorage.setItem(LS, JSON.stringify(mine)); } catch (e) { } }
  function key() {
    try { let k = localStorage.getItem(KEYLS); if (!k || k.length < 24) { const a = new Uint8Array(18); crypto.getRandomValues(a); k = Array.from(a, b => b.toString(16).padStart(2, "0")).join(""); localStorage.setItem(KEYLS, k); } return k; } catch (e) { return "local-only-key-0000000000"; }
  }
  const T = () => window.AE_TOWN || { styles: [], extras: [], walls: [], roofs: [] };
  // only well-formed looks get drawn; names on signs are the generated multiplayer nicknames, never typed text
  function clean(st) {
    if (!st || typeof st !== "object") return null;
    const s = ["own", "rent", "resale"].indexOf(st.s) >= 0 ? st.s : null; if (!s) return null;
    const style = T().styles.some(x => x.id === st.st) ? st.st : null; if (!style) return null;
    const out = { s, st: style, w: Math.max(0, Math.min(T().walls.length - 1, st.w | 0)), rf: Math.max(0, Math.min(T().roofs.length - 1, st.rf | 0)), x: (Array.isArray(st.x) ? st.x : []).filter(id => T().extras.some(e => e.id === id)).slice(0, 10) };
    if (Array.isArray(st.nk) && st.nk.length === 3 && window.AE_NET && AE_NET.cleanNick) out.n = AE_NET.cleanNick(st.nk.map(v => v | 0));
    return out;
  }
  function all() {
    const out = {}; Object.keys(remote).forEach(k => { out[k] = remote[k]; });
    Object.keys(mine).forEach(k => { out[k] = Object.assign({}, mine[k].st); });
    return out;
  }
  function emit() { listeners.forEach(f => { try { f(all()); } catch (e) { } }); }
  async function client() { try { return window.AE_NET && AE_NET.configured && AE_NET.configured() ? await AE_NET.db() : null; } catch (e) { return null; } }
  async function refresh(force) {
    if (!force && Date.now() - lastFetch < 20000) return; lastFetch = Date.now();
    const c = await client(); if (!c) return;
    try {
      const { data, error } = await c.from("plots").select("plot,st,updated_at").eq("city", CITY);
      if (error) { online = false; return; }
      online = true; const r = {};
      (data || []).forEach(row => { if (!/^[TV][0-9]{2}$/.test(row.plot)) return; const st = clean(row.st); if (st) r[row.plot] = st; });
      Object.keys(mine).forEach(k => { delete r[k]; });
      remote = r; emit();
    } catch (e) { online = false; }
  }
  function forServer(st) { const o = Object.assign({}, st); delete o.n; if (window.AE_NET && AE_NET.myNick) o.nk = AE_NET.myNick(); return o; }
  // claim or update a plot. Fails if another player holds it (unless it's on resale or abandoned for 3 weeks).
  async function claim(id, st) {
    if (remote[id] && remote[id].s !== "resale" && !mine[id]) return { ok: false, reason: "Another player just took this one." };
    const c = await client();
    if (c && online !== false) {
      try {
        const { data, error } = await c.rpc("claim_plot", { p_city: CITY, p_plot: id, p_key: key(), p_st: forServer(st) });
        if (!error && data === false) { refresh(true); return { ok: false, reason: "Another player just took this one." }; }
        if (error) online = false;
      } catch (e) { online = false; }
    }
    mine[id] = { st, at: Date.now() }; delete remote[id]; store(); emit();
    return { ok: true };
  }
  async function release(id, resale) {
    const had = mine[id]; delete mine[id]; store();
    if (resale && had) remote[id] = Object.assign({}, had.st, { s: "resale" }); else delete remote[id];
    emit();
    const c = await client(); if (!c) return;
    try { await c.rpc("release_plot", { p_city: CITY, p_plot: id, p_key: key(), p_resale: !!resale }); } catch (e) { }
  }
  // keep your claims fresh on the server while you play, and pull everyone else's every couple of minutes
  function start() {
    clearInterval(timer); refresh(true);
    Object.keys(mine).forEach(id => claim(id, mine[id].st));
    timer = setInterval(() => refresh(false), 120000);
  }
  return { all, claim, release, refresh, start, onChange: f => { listeners.push(f); }, mine: () => Object.keys(mine), isShared: () => online === true, clean };
})();
