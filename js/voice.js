// Push-to-talk squad voice: browser-to-browser audio (WebRTC) between squad members, no audio server.
// The mic is only live while you hold the talk button. Signalling rides on the squad channel (js/net.js).
// Cloudflare and Google STUN are free; players on strict mobile networks may need a TURN relay
// (set NS_CONFIG.TURN_URL to an endpoint that returns { iceServers: [...] } to add one).
window.AE_VOICE = (function () {
  "use strict";
  const NET = () => window.AE_NET;
  let stream = null, track = null, on = false, pcs = {}, audios = {}, ice = null, talking = false, h = {};
  const STUN = [{ urls: "stun:stun.cloudflare.com:3478" }, { urls: "stun:stun.l.google.com:19302" }];
  async function iceServers() {
    if (ice) return ice; ice = STUN.slice();
    const u = (window.NS_CONFIG || {}).TURN_URL;
    if (u) { try { const r = await fetch(u); const j = await r.json(); if (j && Array.isArray(j.iceServers)) ice = STUN.concat(j.iceServers); } catch (e) { } }
    return ice;
  }
  const supported = () => !!(window.RTCPeerConnection && navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  async function enable(handlers) {
    h = handlers || {};
    if (on) return { ok: true };
    if (!supported()) return { ok: false, reason: "This browser can't do voice chat." };
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false }); }
    catch (e) { return { ok: false, reason: "Microphone permission was blocked. Allow it in your browser settings to talk." }; }
    track = stream.getAudioTracks()[0]; track.enabled = false; on = true;
    NET().squadVoice(true); sync();
    return { ok: true };
  }
  function disable() {
    on = false; talk(false);
    Object.keys(pcs).forEach(drop);
    if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; track = null;
    if (NET() && NET().squad()) NET().squadVoice(false);
  }
  function drop(id) {
    const pc = pcs[id]; delete pcs[id]; if (pc) { try { pc.close(); } catch (e) { } }
    const a = audios[id]; delete audios[id]; if (a) { a.srcObject = null; a.remove(); }
  }
  // wait until ICE candidates are gathered so one offer and one answer are enough (keeps signalling tiny)
  function gathered(pc) { return new Promise(res => { if (pc.iceGatheringState === "complete") return res(); const t = setTimeout(res, 2500); pc.addEventListener("icegatheringstatechange", () => { if (pc.iceGatheringState === "complete") { clearTimeout(t); res(); } }); }); }
  async function makePc(id) {
    drop(id);
    const pc = new RTCPeerConnection({ iceServers: await iceServers() }); pcs[id] = pc;
    if (track) pc.addTrack(track, stream);
    pc.ontrack = e => { let a = audios[id]; if (!a) { a = document.createElement("audio"); a.autoplay = true; a.setAttribute("playsinline", ""); a.style.display = "none"; document.body.appendChild(a); audios[id] = a; } a.srcObject = e.streams[0]; a.play().catch(() => { }); };
    pc.onconnectionstatechange = () => { if (h.onState) h.onState(id, pc.connectionState); if (pc.connectionState === "failed") drop(id); };
    return pc;
  }
  // connect to every squad member who has voice on; the member with the smaller id makes the offer
  async function sync() {
    const S = NET() && NET().squad(); if (!S) { if (on) disable(); return; }
    const want = S.members.filter(m => !m.me && m.v && !m.muted).map(m => m.id);
    Object.keys(pcs).forEach(id => { if (want.indexOf(id) < 0) drop(id); });
    if (!on) return;
    for (const id of want) {
      if (pcs[id] || S.myId > id) continue;
      const pc = await makePc(id);
      await pc.setLocalDescription(await pc.createOffer());
      await gathered(pc);
      NET().squadSignal(id, { type: "offer", sdp: pc.localDescription.sdp });
    }
  }
  async function signal(p) {
    if (!on || !p || typeof p.sdp !== "string" || p.sdp.length > 12000) return;
    try {
      if (p.type === "offer") {
        const pc = await makePc(p.from);
        await pc.setRemoteDescription({ type: "offer", sdp: p.sdp });
        await pc.setLocalDescription(await pc.createAnswer());
        await gathered(pc);
        NET().squadSignal(p.from, { type: "answer", sdp: pc.localDescription.sdp });
      } else if (p.type === "answer" && pcs[p.from] && pcs[p.from].signalingState === "have-local-offer") {
        await pcs[p.from].setRemoteDescription({ type: "answer", sdp: p.sdp });
      }
    } catch (e) { drop(p.from); }
  }
  function talk(v) {
    v = !!v && on; if (v === talking) return; talking = v;
    if (track) track.enabled = v;
    if (NET() && NET().squad()) NET().squadTalk(v);
  }
  function mute(id, m) { const a = audios[id]; if (a) a.muted = !!m; if (m) drop(id); }
  return { enable, disable, sync, signal, talk, mute, isOn: () => on, isTalking: () => talking, supported, peers: () => Object.keys(pcs).map(id => ({ id, state: pcs[id].connectionState, sig: pcs[id].signalingState, ice: pcs[id].iceConnectionState })) };
})();
