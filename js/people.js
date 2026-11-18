// People: avatar options, defaults, network packing, random townsfolk looks, and the 3D body builder.
// Appearance is cosmetic only. It never changes any game outcome.
window.AE_PEOPLE = (function () {
  const AV = window.AE_AVATAR;
  // clothes palette: the first 8 are the old outfit colours, so old saves keep their colour
  const CLOTH = AV.OUTFIT.concat(["#8f8d9e", "#2a2742", "#1b1b1f", "#ffffff", "#3b5b8f", "#7a4a2e", "#c9b48f", "#9b1c2c", "#f2c6d4", "#a8d5e2", "#556b2f", "#f7e08a"]);
  const EYE = ["#3b2314", "#5a3a22", "#7a5a2e", "#4f6b3a", "#6e7c86", "#17110d"];
  const LIP = ["#b4675e", "#c96f7a", "#b3263a", "#7a2a3a", "#a8786a"];
  const O = {
    body: [["straight", "Straight"], ["balanced", "Balanced"], ["curvy", "Curvy"]],
    face: [["oval", "Oval"], ["round", "Round"], ["long", "Long"], ["square", "Square"], ["heart", "Heart"]],
    eyes: [["almond", "Almond"], ["round", "Round"], ["hooded", "Hooded"], ["narrow", "Narrow"]],
    brows: [["soft", "Soft"], ["straight", "Straight"], ["thick", "Thick"], ["arched", "Arched"]],
    nose: [["small", "Small"], ["straight", "Straight"], ["broad", "Broad"], ["long", "Long"]],
    lips: [["natural", "Natural"], ["full", "Full"], ["thin", "Thin"]],
    hair: [["buzz", "Buzz"], ["crew", "Crew cut"], ["short", "Short"], ["sidepart", "Side part"], ["spiky", "Spiky"], ["quiff", "Quiff"], ["wavy", "Wavy"], ["curly", "Curly"], ["afro", "Afro"], ["bob", "Bob"], ["long", "Long"], ["ponytail", "Ponytail"], ["braid", "Plait"], ["bun", "Bun"], ["bald", "Bald"]],
    facial: [["none", "None"], ["stubble", "Stubble"], ["moustache", "Moustache"], ["kerala", "Thick moustache"], ["goatee", "Goatee"], ["beard", "Beard"], ["longbeard", "Long beard"]],
    glasses: [["none", "None"], ["round", "Round"], ["square", "Square"], ["shades", "Shades"]],
    hat: [["none", "None"], ["cap", "Cap"], ["beanie", "Beanie"], ["turban", "Turban"], ["hijab", "Hijab"], ["jasmine", "Jasmine"]],
    bindi: [["none", "None"], ["red", "Red bindi"], ["black", "Black bindi"], ["sandal", "Chandanam"]],
    ears: [["none", "None"], ["studs", "Studs"], ["hoops", "Hoops"], ["jhumka", "Jhumka"]],
    noseJ: [["none", "None"], ["stud", "Nose stud"], ["ring", "Nose ring"]],
    top: [["tee", "T-shirt"], ["polo", "Polo"], ["shirt", "Shirt"], ["kurta", "Kurta"], ["hoodie", "Hoodie"], ["blouse", "Top"], ["tank", "Tank top"]],
    bottom: [["jeans", "Jeans"], ["trousers", "Trousers"], ["shorts", "Shorts"], ["mundu", "Mundu"], ["skirt", "Skirt"], ["leggings", "Leggings"]],
    shoes: [["sneakers", "Sneakers"], ["sandals", "Sandals"], ["formal", "Formal"], ["chappal", "Chappal"], ["boots", "Boots"]]
  };
  const ids = k => O[k].map(x => x[0]);
  const ENUMS = Object.keys(O);
  const NUMS = { skin: [0, AV.SKIN.length - 1, 3], hairColor: [0, AV.HAIR.length - 1, 0], eyeC: [0, EYE.length - 1, 0], lipC: [0, LIP.length - 1, 0], topC: [0, CLOTH.length - 1, 8], botC: [0, CLOTH.length - 1, 9], hatC: [0, CLOTH.length - 1, 10], height: [140, 200, 168], weight: [40, 120, 62] };
  const DEF = { body: "balanced", face: "oval", eyes: "almond", brows: "soft", nose: "straight", lips: "natural", hair: "short", facial: "none", glasses: "none", hat: "none", bindi: "none", ears: "none", noseJ: "none", top: "tee", bottom: "jeans", shoes: "sneakers" };
  const clampN = (v, a, b, d) => { v = Math.round(+v); return isFinite(v) ? Math.max(a, Math.min(b, v)) : d; };

  // Fill in every field, convert old-style avatars (acc: specs/moustache/beard/cap) and drop anything invalid.
  function normalize(src) {
    const a = Object.assign({}, src || {});
    if (a.acc && a.acc !== "none") {
      if (a.acc === "specs" && !a.glasses) a.glasses = "square";
      if ((a.acc === "moustache" || a.acc === "beard") && !a.facial) a.facial = a.acc;
      if (a.acc === "cap" && !a.hat) a.hat = "cap";
    }
    if (!a.body) a.body = a.pronoun === "he" ? "straight" : a.pronoun === "she" ? "curvy" : "balanced";
    ENUMS.forEach(k => { if (ids(k).indexOf(a[k]) < 0) a[k] = DEF[k]; });
    Object.keys(NUMS).forEach(k => { const [lo, hi, d] = NUMS[k]; a[k] = a[k] == null ? d : clampN(a[k], lo, hi, d); });
    return a;
  }
  // Network form: a short array of indices. Starts with 2 so old-format arrays (skin first) are recognised.
  const PACK = ["skin", "height", "weight", "hairColor", "eyeC", "lipC", "topC", "botC", "hatC"].concat(ENUMS);
  function pack(src) { const a = normalize(src); return [2].concat(PACK.map(k => ENUMS.indexOf(k) >= 0 ? ids(k).indexOf(a[k]) : a[k])); }
  function unpack(arr) {
    if (!Array.isArray(arr)) return normalize({});
    if (arr[0] !== 2) { // old clients: [skin, height, weight, hair, hairColor, top, outfit, acc]
      const OH = ["short", "long", "bun", "curly", "buzz", "bald"], OT = ["tee", "shirt", "kurta"], OA = ["none", "specs", "moustache", "beard", "cap"];
      return normalize({ skin: clampN(arr[0], 0, 7, 3), height: arr[1], weight: arr[2], hair: OH[clampN(arr[3], 0, 5, 0)], hairColor: clampN(arr[4], 0, 6, 0), top: OT[clampN(arr[5], 0, 2, 0)], acc: OA[clampN(arr[7], 0, 4, 0)] });
    }
    const a = {};
    PACK.forEach((k, i) => { const v = arr[i + 1]; if (ENUMS.indexOf(k) >= 0) a[k] = ids(k)[clampN(v, 0, ids(k).length - 1, 0)]; else a[k] = v; });
    return normalize(a);
  }
  // the clothes you wear when you're not in an FXN outfit
  function basics(a) { return { top: CLOTH[a.topC], bottom: CLOTH[a.botC], style: a.top, bstyle: a.bottom, trim: shade(CLOTH[a.topC], -40) }; }
  function shade(hex, amt) { const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v + amt)))); return "#" + c.map(v => v.toString(16).padStart(2, "0")).join(""); }

  // Random but believable Kochi people (seeded, so a townsperson looks the same every visit).
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) { let t = seed >>> 0; return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
  function random(seed, o) {
    o = o || {}; const R = rng(hash(String(seed))), pick = l => l[Math.floor(R() * l.length) % l.length], wpick = l => { let t = R() * l.reduce((s, x) => s + x[1], 0); for (const x of l) { t -= x[1]; if (t <= 0) return x[0]; } return l[0][0]; };
    const fem = o.fem != null ? o.fem : R() < 0.5, old = !!o.old;
    const a = {
      skin: pick([0, 1, 9, 2, 3, 10, 4, 5, 11, 6]), height: fem ? 150 + Math.floor(R() * 18) : 160 + Math.floor(R() * 20), weight: (fem ? 48 : 56) + Math.floor(R() * (old ? 30 : 24)),
      body: fem ? wpick([["curvy", 6], ["balanced", 4]]) : wpick([["straight", 7], ["balanced", 3]]),
      face: pick(ids("face")), eyes: pick(ids("eyes")), eyeC: wpick([[0, 6], [1, 4], [2, 1], [5, 2]]), brows: fem ? pick(["soft", "arched", "straight"]) : pick(["straight", "thick", "soft"]), nose: pick(ids("nose")), lips: pick(ids("lips")),
      lipC: fem ? wpick([[0, 4], [1, 2], [2, 1], [3, 1], [4, 1]]) : 0,
      hair: old ? (fem ? pick(["bun", "braid", "bun"]) : pick(["short", "bald", "crew", "sidepart"])) : fem ? wpick([["long", 3], ["braid", 3], ["bun", 2], ["ponytail", 2], ["bob", 1], ["wavy", 1], ["curly", 1]]) : wpick([["short", 3], ["sidepart", 3], ["crew", 2], ["quiff", 1], ["spiky", 1], ["wavy", 1], ["curly", 1], ["buzz", 1]]),
      hairColor: old ? pick([4, 7, 4, 1]) : wpick([[0, 7], [1, 3], [2, 1]]),
      facial: fem ? "none" : wpick([["moustache", 4], ["kerala", 2], ["beard", 2], ["stubble", 2], ["none", 2], ["goatee", 1]].concat(old ? [["longbeard", 1]] : [])),
      glasses: R() < (old ? 0.5 : 0.18) ? pick(["round", "square", "square"]) : "none",
      hat: "none", bindi: fem && R() < 0.55 ? pick(["red", "black", "sandal"]) : (!fem && R() < 0.12 ? "sandal" : "none"),
      ears: fem ? wpick([["studs", 4], ["jhumka", 3], ["hoops", 1], ["none", 1]]) : "none", noseJ: fem && R() < 0.3 ? pick(["stud", "ring"]) : "none",
      top: fem ? wpick([["kurta", 4], ["blouse", 3], ["tee", 2]]) : wpick([["shirt", 5], ["tee", 3], ["polo", 2], ["kurta", 1]]),
      bottom: fem ? wpick([["leggings", 3], ["jeans", 2], ["skirt", 1], ["trousers", 1]]) : wpick([["trousers", 4], ["jeans", 3], ["mundu", 3], ["shorts", 1]]),
      topC: Math.floor(R() * CLOTH.length), botC: pick([9, 10, 12, 13, 14, 8, 11]), hatC: Math.floor(R() * CLOTH.length),
      shoes: wpick([["sandals", 4], ["chappal", 3], ["sneakers", 2], ["formal", 1]])
    };
    if (a.hair === "bald" && fem) a.hair = "bun";
    if (o.kid) Object.assign(a, { facial: "none", glasses: "none", noseJ: "none", ears: fem ? "studs" : "none", lipC: 0, bindi: fem && R() < 0.4 ? "black" : "none", top: pick(["tee", "tee", "polo", "hoodie"]), bottom: pick(["shorts", "jeans", fem ? "skirt" : "shorts"]), shoes: pick(["sneakers", "sandals"]), hair: fem ? pick(["ponytail", "braid", "bob"]) : pick(["short", "crew", "spiky"]) });
    if (o.kid) return normalize(Object.assign(a, o.set || {}));
    if (!fem && R() < 0.08) a.hat = pick(["cap", "cap", "turban"]);
    if (fem && R() < 0.12) a.hat = "hijab";
    if (fem && (a.hair === "braid" || a.hair === "bun") && R() < 0.35 && a.hat === "none") a.hat = "jasmine";
    return normalize(Object.assign(a, o.set || {}));
  }

  // ═══ 3D builder ═══
  // K = { THREE, P, mergeGeos, col, vcMat, srgbTex }. Returns the same rig shape the world animates:
  // { group, legs[hip], knees[], arms[shoulder], elbows[], torso, head(group), H, legL, shadow }
  const FACE = { oval: [0.84, 1, 0.96, 0.24, 0.1], round: [0.9, 0.96, 0.96, 0.1, 0.05], long: [0.8, 1.07, 0.95, 0.2, 0.12], square: [0.89, 1, 0.96, 0.05, 0.08], heart: [0.87, 1, 0.96, 0.36, 0.12] };
  function deform(x, y, z, F) {
    if (y < 0) { const t = Math.pow(-y, 1.4); x *= 1 - t * F[3]; if (z > 0) z *= 1 - t * 0.1; }
    if (y < -0.55 && z > 0.3) z += (-y - 0.55) * F[4];
    if (z < 0) z *= 1.07;
    if (z > 0.2 && Math.abs(y) < 0.7) z *= 0.95;
    if (F === FACE.square && y < 0.1 && y > -0.8) x *= 1 + 0.06 * (1 - Math.min(1, Math.abs(y + 0.35) / 0.45));
    return [x, y, z];
  }
  // face texture: equirectangular, the face centred at u = 0.25 (three.js sphere front)
  const texCache = {};
  function faceTexture(K, a, L, hi) {
    const key = [hi, L.skin, L.hairC, a.eyes, a.eyeC, a.brows, a.lips, a.lipC, a.facial, a.bindi, a.hair, a.hat, a.body].join("|");
    if (texCache[key]) return texCache[key];
    const W = hi ? 512 : 256, H = W / 2, c = document.createElement("canvas"); c.width = W; c.height = H;
    const x = c.getContext("2d"), s = W / (2 * Math.PI), cx = W * 0.25, cy = H / 2;
    const X = ax => cx + ax * s, Y = ay => cy - ay * s, R = r => r * s;
    x.fillStyle = L.skin; x.fillRect(0, 0, W, H);
    const tint = (col, a2) => { x.fillStyle = col; x.globalAlpha = a2; };
    // soft shading: darker towards the sides and under the jaw, warm cheeks, light forehead and nose
    let g = x.createRadialGradient(cx, cy - R(0.1), R(0.2), cx, cy, R(1.6)); g.addColorStop(0, "rgba(255,240,225,.16)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(60,25,10,.1)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    g = x.createLinearGradient(0, Y(-0.55), 0, Y(-1.2)); g.addColorStop(0, "rgba(60,25,10,0)"); g.addColorStop(1, "rgba(60,25,10,.12)"); x.fillStyle = g; x.fillRect(0, Y(-0.55), W, H);
    [-1, 1].forEach(sd => { g = x.createRadialGradient(X(sd * 0.48), Y(-0.28), 0, X(sd * 0.48), Y(-0.28), R(0.26)); g.addColorStop(0, "rgba(214,90,80,.18)"); g.addColorStop(1, "rgba(214,90,80,0)"); x.fillStyle = g; x.fillRect(0, 0, W, H); });
    g = x.createRadialGradient(cx, Y(0.05), 0, cx, Y(0.05), R(0.6)); g.addColorStop(0, "rgba(40,15,5,0)"); g.addColorStop(1, "rgba(40,15,5,0)"); x.fillStyle = g;
    x.globalAlpha = 1;
    // stubble / beard shadow
    if (["stubble", "beard", "longbeard", "goatee", "moustache", "kerala"].indexOf(a.facial) >= 0) {
      tint(L.hairC, a.facial === "stubble" ? 0.32 : a.facial === "moustache" || a.facial === "kerala" ? 0.14 : 0.4);
      const al = x.globalAlpha; x.globalAlpha = 1;
      const gg = x.createRadialGradient(cx, Y(-0.72), R(0.2), cx, Y(-0.6), R(0.85)); gg.addColorStop(0, hexA(L.hairC, al)); gg.addColorStop(0.7, hexA(L.hairC, al * 0.8)); gg.addColorStop(1, hexA(L.hairC, 0));
      x.fillStyle = gg; x.beginPath(); x.ellipse(cx, Y(-0.7), R(0.95), R(0.5), 0, 0, 7); x.fill();
      x.fillStyle = hexA(L.hairC, al); x.beginPath(); x.ellipse(cx, Y(-0.41), R(0.2), R(0.06), 0, 0, 7); x.fill();
      x.globalAlpha = 1;
    }
    // hairline painted on the skin so short hair never shows a gap
    if (a.hair !== "bald" && a.hat !== "hijab") {
      const thin = a.hair === "buzz" || a.hair === "crew"; tint(L.hairC, thin ? 0.55 : 0.95);
      x.beginPath(); x.moveTo(0, 0); x.lineTo(W, 0); x.lineTo(W, Y(0.15)); x.lineTo(X(1.15), Y(0.15)); x.quadraticCurveTo(X(0.75), Y(0.42), X(0.5), Y(0.66)); x.quadraticCurveTo(cx, Y(0.74), X(-0.5), Y(0.66)); x.quadraticCurveTo(X(-0.75), Y(0.42), X(-1.15), Y(0.15)); x.lineTo(0, Y(0.15)); x.closePath(); x.fill();
      x.globalAlpha = 1;
    }
    // eyes
    const eh = { almond: 0.105, round: 0.135, hooded: 0.09, narrow: 0.07 }[a.eyes] || 0.1, ew = 0.19, eyY = 0.0, fem = a.body === "curvy";
    [-1, 1].forEach(sd => {
      const ex = X(sd * 0.36), ey = Y(eyY);
      tint("#4a2416", 0.18); x.beginPath(); x.ellipse(ex, ey - R(0.02), R(ew * 1.2), R(eh * 1.5), 0, 0, 7); x.fill(); x.globalAlpha = 1; // socket shadow
      x.save(); x.beginPath(); x.moveTo(ex - R(ew), ey); x.quadraticCurveTo(ex, ey - R(eh * 1.25), ex + R(ew), ey - R(sd * 0.01)); x.quadraticCurveTo(ex, ey + R(eh * 0.95), ex - R(ew), ey); x.closePath();
      x.fillStyle = "#f3eee6"; x.fill(); x.clip();
      x.fillStyle = EYE[a.eyeC]; x.beginPath(); x.arc(ex + R(sd * -0.01), ey + R(0.005), R(0.068), 0, 7); x.fill();
      x.fillStyle = "#0b0807"; x.beginPath(); x.arc(ex + R(sd * -0.01), ey + R(0.005), R(0.032), 0, 7); x.fill();
      x.fillStyle = "rgba(255,255,255,.9)"; x.beginPath(); x.arc(ex + R(sd * -0.01) - R(0.022), ey - R(0.022), R(0.016), 0, 7); x.fill();
      x.restore();
      // upper lid / lashes, lower lid, crease
      x.strokeStyle = "#1a0f0a"; x.lineCap = "round"; x.lineWidth = R(fem ? 0.034 : 0.024);
      x.beginPath(); x.moveTo(ex - R(ew * 1.02), ey + R(0.005)); x.quadraticCurveTo(ex, ey - R(eh * 1.3), ex + R(ew * 1.06), ey - R(0.012)); x.stroke();
      if (fem) { x.lineWidth = R(0.014); x.beginPath(); x.moveTo(ex + R(sd * ew * 0.95), ey - R(0.01)); x.lineTo(ex + R(sd * ew * 1.22), ey - R(0.05)); x.stroke(); }
      x.strokeStyle = "rgba(80,40,25,.45)"; x.lineWidth = R(0.012); x.beginPath(); x.moveTo(ex - R(ew * 0.8), ey + R(eh * 0.55)); x.quadraticCurveTo(ex, ey + R(eh * 1.05), ex + R(ew * 0.85), ey + R(eh * 0.45)); x.stroke();
      if (a.eyes !== "narrow") { x.strokeStyle = "rgba(80,40,25,.35)"; x.lineWidth = R(0.012); x.beginPath(); x.moveTo(ex - R(ew * 0.8), ey - R(eh * (a.eyes === "hooded" ? 1.15 : 1.6))); x.quadraticCurveTo(ex, ey - R(eh * (a.eyes === "hooded" ? 1.45 : 2.1)), ex + R(ew * 0.9), ey - R(eh * (a.eyes === "hooded" ? 1.1 : 1.5))); x.stroke(); }
      // brows
      const bw = { soft: 0.03, straight: 0.035, thick: 0.055, arched: 0.03 }[a.brows] || 0.035, arch = a.brows === "arched" ? 0.07 : a.brows === "straight" ? 0.01 : 0.04;
      x.strokeStyle = /#(e9e5dc|c9a36b|d65f9a|3f5fc4)/i.test(L.hairC) ? "#5a3a24" : L.hairC; x.lineWidth = R(bw); x.lineCap = "round";
      x.beginPath(); x.moveTo(X(sd * 0.17), Y(0.19)); x.quadraticCurveTo(X(sd * 0.36), Y(0.2 + arch), X(sd * 0.56), Y(0.16)); x.stroke();
    });
    // nose shading and nostrils
    tint("#5a2a18", 0.2); x.beginPath(); x.ellipse(X(-0.08), Y(-0.18), R(0.025), R(0.14), 0.1, 0, 7); x.fill(); x.beginPath(); x.ellipse(X(0.08), Y(-0.18), R(0.025), R(0.14), -0.1, 0, 7); x.fill();
    x.globalAlpha = 0.45; x.fillStyle = "#3a160c"; [-1, 1].forEach(sd => { x.beginPath(); x.ellipse(X(sd * 0.055), Y(-0.33), R(0.028), R(0.016), 0, 0, 7); x.fill(); }); x.globalAlpha = 1;
    // lips
    const lw = { natural: 0.17, full: 0.19, thin: 0.16 }[a.lips], lt = { natural: 0.045, full: 0.065, thin: 0.028 }[a.lips], my = Y(-0.5);
    const lc = a.lipC ? LIP[a.lipC] : mix(L.skin, LIP[0], 0.55);
    x.fillStyle = shadeRGB(lc, -18); x.beginPath(); x.moveTo(cx - R(lw), my); x.quadraticCurveTo(cx - R(lw * 0.5), my - R(lt * 1.3), cx - R(0.02), my - R(lt * 0.9)); x.quadraticCurveTo(cx, my - R(lt * 0.7), cx + R(0.02), my - R(lt * 0.9)); x.quadraticCurveTo(cx + R(lw * 0.5), my - R(lt * 1.3), cx + R(lw), my); x.closePath(); x.fill();
    x.fillStyle = lc; x.beginPath(); x.moveTo(cx - R(lw), my); x.quadraticCurveTo(cx, my + R(lt * 2.2), cx + R(lw), my); x.closePath(); x.fill();
    x.strokeStyle = "rgba(60,20,15,.7)"; x.lineWidth = R(0.012); x.beginPath(); x.moveTo(cx - R(lw), my); x.quadraticCurveTo(cx, my + R(0.012), cx + R(lw), my); x.stroke();
    tint("#fff", 0.18); x.beginPath(); x.ellipse(cx, my + R(lt * 1.1), R(lw * 0.4), R(lt * 0.4), 0, 0, 7); x.fill(); x.globalAlpha = 1;
    // chin dimple shadow
    tint("#5a2a18", 0.12); x.beginPath(); x.ellipse(cx, Y(-0.78), R(0.12), R(0.04), 0, 0, 7); x.fill(); x.globalAlpha = 1;
    // forehead marks
    if (a.bindi === "red" || a.bindi === "black") { x.fillStyle = a.bindi === "red" ? "#c1121f" : "#151012"; x.beginPath(); x.arc(cx, Y(0.2), R(0.035), 0, 7); x.fill(); }
    if (a.bindi === "sandal") { x.fillStyle = "#e9c98a"; x.beginPath(); x.roundRect ? x.roundRect(cx - R(0.03), Y(0.48), R(0.06), R(0.26), R(0.03)) : x.rect(cx - R(0.03), Y(0.48), R(0.06), R(0.26)); x.fill(); x.fillStyle = "#c1121f"; x.beginPath(); x.arc(cx, Y(0.24), R(0.018), 0, 7); x.fill(); }
    const t = K.srgbTex(c); t.anisotropy = 4; texCache[key] = t;
    return t;
  }
  function hexA(h, a) { return "rgba(" + hexRGB(h).join(",") + "," + a + ")"; }
  function hexRGB(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function mix(a, b, k) { const A = hexRGB(a), B = hexRGB(b); return "rgb(" + A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",") + ")"; }
  function shadeRGB(c, amt) { const m = c.match(/\d+/g); const v = m && c[0] !== "#" ? m.map(Number) : hexRGB(c); return "rgb(" + v.map(q => Math.max(0, Math.min(255, q + amt))).join(",") + ")"; }

  const headMats = {};
  function build(K, L, hi) {
    const { THREE, P, mergeGeos, col } = K, a = L.a, o = L.o;
    const sk = col(L.skin), skD = col(L.skin).multiplyScalar(0.9), top = col(o.top), bot = col(o.bottom), trim = col(o.trim || o.top), hairC = col(L.hairC), gold = col("#d4af37");
    const small = !!L.small, Hc = Math.max(140, Math.min(200, L.height));
    const TH = small ? 0.3 + (Hc - 140) / 40 * 0.18 : 0.54 + (Hc - 140) / 60 * 0.14;
    const bmi = L.weight / Math.pow(Hc / 100, 2), wf = Math.max(0.86, Math.min(1.4, 0.92 + (bmi - 21) / 12 * 0.42)), wl = Math.sqrt(wf);
    const B = { straight: [0.12, 0.1, 0.074, 0.084, 0], balanced: [0.108, 0.09, 0.068, 0.09, 0.35], curvy: [0.098, 0.086, 0.06, 0.102, 1] }[a.body];
    const headR = small ? TH * 0.095 : TH * 0.079, legL = TH * (small ? 0.43 : 0.48), neck = TH * 0.035, torsoL = TH - legL - neck - headR * 1.92;
    const shW = B[0] * TH * (0.8 + 0.2 * wf), chW = B[1] * TH * wf, waW = B[2] * TH * wf * wf, hpW = B[3] * TH * (0.85 + 0.15 * wf * wf), bust = small ? 0 : B[4];
    const st = o.style, FX = ["saree", "lehenga", "gown", "mundu", "suit", "sport"].indexOf(st) >= 0;
    const bstyle = st === "saree" || st === "lehenga" ? "drape" : st === "gown" ? "gown" : st === "mundu" ? "mundu" : o.bstyle || (FX ? "trousers" : "trousers");
    const topKind = st === "sport" ? "tee" : st;
    const sleeve = { tee: 0.45, polo: 0.45, blouse: 0.3, saree: 0.3, lehenga: 0.3, tank: 0, gown: 0, shirt: 1, kurta: 0.92, hoodie: 1, suit: 1 }[topKind] ?? 0.45;
    const mk = (parts, mat) => { const m = new THREE.Mesh(mergeGeos(parts), mat || K.vcMat); m.castShadow = true; return m; };
    const g = new THREE.Group(), legs = [], knees = [], arms = [], elbows = [];
    const lathe = (pts, c0, d0, d1) => { const c = c0 && c0.isColor ? c0 : col(c0); const geo = new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 20, Math.PI, Math.PI * 2); const pos = geo.attributes.position, y0 = pts[0][1], y1 = pts[pts.length - 1][1]; for (let i = 0; i < pos.count; i++) { const t = (pos.getY(i) - y0) / (y1 - y0 || 1); pos.setZ(i, pos.getZ(i) * (d0 + (d1 - d0) * t)); } geo.computeVertexNormals(); return { geo, color: c }; };

    // ── legs ──
    const thigh = legL * 0.5, shin = legL * 0.46, hipX = hpW * 0.5, thR = 0.05 * TH * wl * (bust ? 1.08 : 1), knR = 0.031 * TH * wl, ankR = 0.019 * TH;
    const legCover = bstyle === "shorts" ? 0.55 : bstyle === "skirt" || bstyle === "drape" || bstyle === "gown" || bstyle === "mundu" ? 0 : 1;
    const shoeKind = a.shoes;
    [-1, 1].forEach(sd => {
      const hip = new THREE.Group(); hip.position.set(sd * hipX, legL, 0);
      const tp = [P(new THREE.CylinderGeometry(thR, knR * 1.05, thigh, 12), legCover >= 1 || bstyle === "shorts" ? sk : sk, 0, -thigh / 2, 0)];
      if (legCover > 0) tp.push(P(new THREE.CylinderGeometry(thR * 1.06, (legCover >= 1 ? knR * 1.2 : thR * 0.95), thigh * Math.min(1, legCover * 1.8), 12), bot, 0, -thigh * Math.min(1, legCover * 1.8) / 2, 0));
      hip.add(mk(tp));
      const knee = new THREE.Group(); knee.position.y = -thigh;
      const calf = new THREE.LatheGeometry([[ankR, -shin], [ankR * 1.25, -shin * 0.82], [knR * 1.12, -shin * 0.45], [knR * 1.08, -shin * 0.18], [knR, 0], [knR * 0.6, knR * 0.5]].map(p => new THREE.Vector2(p[0], p[1])), 12, Math.PI, Math.PI * 2);
      const kp = [{ geo: calf, color: legCover >= 1 ? (bstyle === "leggings" ? bot : bot) : sk }, P(new THREE.SphereGeometry(knR * 1.02, 10, 8), legCover >= 1 ? bot : sk, 0, 0, 0)];
      if (legCover >= 1 && bstyle !== "leggings") kp.push(P(new THREE.CylinderGeometry(knR * 1.2, ankR * 1.85, shin * 1.02, 12), bot, 0, -shin * 0.5 + shin * 0.01, 0), P(new THREE.SphereGeometry(knR * 1.2, 10, 8), bot, 0, 0, 0));
      // footwear
      const fy = -shin, fl = TH * 0.085, fw = TH * 0.03;
      const sole = { sneakers: "#f2f2f2", sandals: "#5a3a22", formal: "#16110e", chappal: "#2f4f9a", boots: "#3a2416" }[shoeKind], upper = { sneakers: L.shoeUp || "#e8e8ee", formal: "#1d1714", boots: "#5a3a22" }[shoeKind];
      kp.push(P(new THREE.BoxGeometry(fw * 2.1, TH * 0.012, fl), sole, 0, fy - TH * 0.016, fl * 0.28));
      if (upper) { kp.push(P(new THREE.SphereGeometry(1, 12, 8), upper, 0, fy - TH * 0.004, fl * 0.3, 0, 0, 0, fw * 1.05, TH * 0.022, fl * 0.52)); if (shoeKind === "boots") kp.push(P(new THREE.CylinderGeometry(ankR * 1.6, ankR * 1.7, TH * 0.07, 10), upper, 0, fy + TH * 0.02, 0)); if (shoeKind === "sneakers") kp.push(P(new THREE.BoxGeometry(fw * 2.12, TH * 0.008, fl * 0.5), L.shoeAccent || "#22b5a6", 0, fy - TH * 0.003, fl * 0.28)); }
      else { kp.push(P(new THREE.SphereGeometry(1, 10, 6), sk, 0, fy - TH * 0.006, fl * 0.3, 0, 0, 0, fw * 0.9, TH * 0.012, fl * 0.48)); kp.push(P(new THREE.BoxGeometry(fw * 2, TH * 0.008, TH * 0.012), sole, 0, fy - TH * 0.0, fl * (shoeKind === "chappal" ? 0.45 : 0.3))); if (shoeKind === "sandals") kp.push(P(new THREE.TorusGeometry(ankR * 1.3, TH * 0.004, 4, 12), sole, 0, fy + TH * 0.01, 0, Math.PI / 2, 0, 0)); }
      knee.add(mk(kp)); hip.add(knee); g.add(hip); legs.push(hip); knees.push(knee);
    });

    // ── torso ──
    const y = f => legL + torsoL * f, nR = 0.03 * TH * wl;
    const prof = [[hpW * 0.6, legL - TH * 0.075], [hpW * 0.98, y(0)], [hpW, y(0.12)], [waW * 1.05, y(0.33)], [waW, y(0.45)], [chW * 0.96, y(0.65)], [chW, y(0.78)], [shW * 0.95, y(0.9)], [shW * 0.62, y(0.98)], [nR * 1.5, y(1.02)]];
    const body = [];
    const waistY = y(0.4), lowTop = { shirt: waistY, kurta: legL - TH * 0.01, tee: legL - TH * 0.005, polo: legL - TH * 0.005, sport: legL - TH * 0.005, hoodie: legL - TH * 0.02, tank: legL + TH * 0.01, blouse: legL + TH * 0.02, saree: y(0.5), lehenga: y(0.5), gown: waistY, suit: legL - TH * 0.03 }[topKind] ?? legL;
    // lower body (pants / skirt / drape tops) and skin underneath
    body.push(lathe(prof.slice(0, 5), bot, 0.72, 0.62));
    if (topKind === "saree" || topKind === "lehenga") body.push(lathe([[waW * 1.0, y(0.38)], [waW * 1.02, y(0.45)], [chW * 0.93, y(0.55)]], sk, 0.62, 0.6));
    const tPts = prof.filter(p => p[1] >= lowTop - 1e-6); if (tPts.length && tPts[0][1] > lowTop + 1e-4) { const i = prof.findIndex(p => p[1] > lowTop); const p0 = prof[i - 1], p1 = prof[i], k = (lowTop - p0[1]) / (p1[1] - p0[1]); tPts.unshift([p0[0] + (p1[0] - p0[0]) * k, lowTop]); }
    body.push(lathe(tPts.map(p => [p[0] * 1.035, p[1]]), top, 0.72, 0.6));
    if (bust > 0.5) { const tl = body[body.length - 1].geo, q = tl.attributes.position; for (let i = 0; i < q.count; i++) { const yy = q.getY(i), zz = q.getZ(i), d = (yy - y(0.68)) / (torsoL * 0.14); if (zz > 0 && Math.abs(d) < 1) { const xx = q.getX(i), side = 1 - Math.min(1, Math.abs(Math.abs(xx) - chW * 0.45) / (chW * 0.55)); q.setZ(i, zz + chW * 0.16 * bust * (1 - d * d) * side); } } tl.computeVertexNormals(); }
    if (topKind === "shirt" || topKind === "suit" || bstyle === "trousers") body.push(P(new THREE.CylinderGeometry(waW * 1.06, waW * 1.07, TH * 0.016, 20), "#2a1f18", 0, waistY - TH * 0.004, 0, 0, 0, 0, 1, 1, 0.64));
    if (topKind === "kurta") body.push(P(new THREE.CylinderGeometry(hpW * 1.04, hpW * 1.2, legL * 0.42, 18, 1, true), top, 0, legL - legL * 0.2, 0, 0, 0, 0, 1, 1, 0.74), P(new THREE.BoxGeometry(TH * 0.012, torsoL * 0.3, TH * 0.004), trim, 0, y(0.82), chW * 0.62));
    if (topKind === "suit") { body.push(P(new THREE.CylinderGeometry(hpW * 1.04, hpW * 1.1, legL * 0.12, 18, 1, true), top, 0, legL - legL * 0.05, 0, 0, 0, 0, 1, 1, 0.72)); [-1, 1].forEach(sd => body.push(P(new THREE.BoxGeometry(TH * 0.02, torsoL * 0.38, TH * 0.004), shadeC(top, 0.75), sd * chW * 0.22, y(0.74), chW * 0.6, 0, 0, sd * 0.32))); body.push(P(new THREE.BoxGeometry(chW * 0.3, torsoL * 0.3, TH * 0.004), "#f4f4f2", 0, y(0.8), chW * 0.6), P(new THREE.BoxGeometry(TH * 0.012, torsoL * 0.28, TH * 0.004), trim, 0, y(0.76), chW * 0.62)); }
    if (topKind === "shirt" || topKind === "polo") { [-1, 1].forEach(sd => body.push(P(new THREE.BoxGeometry(TH * 0.03, TH * 0.012, TH * 0.022), shadeC(top, 0.92), sd * nR * 1.3, y(1.0), nR * 0.8, 0.5, sd * 0.6, sd * 0.4))); body.push(P(new THREE.BoxGeometry(TH * 0.005, topKind === "shirt" ? torsoL * 0.55 : torsoL * 0.15, TH * 0.004), shadeC(top, 0.8), 0, topKind === "shirt" ? y(0.68) : y(0.9), chW * 0.6)); }
    if (topKind === "shirt") body.push(P(new THREE.BoxGeometry(TH * 0.028, TH * 0.028, TH * 0.004), shadeC(top, 0.88), -chW * 0.42, y(0.78), chW * 0.56));
    if (topKind === "hoodie") body.push(P(new THREE.TorusGeometry(nR * 1.9, nR * 0.75, 6, 14), top, 0, y(0.98), -nR * 0.6, Math.PI / 2 + 0.3, 0, 0, 1.2, 1, 1), P(new THREE.BoxGeometry(chW * 0.9, torsoL * 0.22, TH * 0.006), shadeC(top, 0.88), 0, y(0.18), hpW * 0.7), P(new THREE.CylinderGeometry(TH * 0.003, TH * 0.003, torsoL * 0.25, 4), "#f0f0f0", -nR * 0.8, y(0.84), chW * 0.6), P(new THREE.CylinderGeometry(TH * 0.003, TH * 0.003, torsoL * 0.25, 4), "#f0f0f0", nR * 0.8, y(0.84), chW * 0.6));
    if (topKind === "tee" || topKind === "sport") body.push(P(new THREE.TorusGeometry(nR * 1.25, TH * 0.005, 4, 16), trim, 0, y(1.0), 0, Math.PI / 2, 0, 0, 1, 0.8, 1));
    if (st === "sport") body.push(P(new THREE.CylinderGeometry(chW * 1.06, chW * 1.06, TH * 0.012, 20), trim, 0, y(0.62), 0, 0, 0, 0, 1, 1, 0.64));
    // skirts and drapes
    const hemY = TH * 0.03;
    if (bstyle === "drape" || bstyle === "gown" || bstyle === "mundu") {
      const r1 = bstyle === "mundu" ? hpW * 1.06 : bstyle === "gown" ? hpW * 1.7 : hpW * 1.38, from = bstyle === "gown" || topKind === "saree" || topKind === "lehenga" ? y(0.4) : waistY;
      body.push(lathe([[r1 * 0.98, TH * 0.012], [r1, hemY], [(hpW * 1.05 + r1) / 2, legL * 0.5], [hpW * 1.05, legL - TH * 0.02], [hpW * 1.02, legL]], bot, 0.86, 0.76));
      if (from > legL) body.push(lathe([[waW * 1.06, from], [hpW * 1.04, legL]].reverse(), bot, 0.72, 0.66));
      body.push(P(new THREE.CylinderGeometry(r1 * 1.01, r1 * 1.01, TH * 0.035, 20, 1, true), bstyle === "mundu" ? "#c9a227" : trim, 0, hemY + TH * 0.02, 0, 0, 0, 0, 1, 1, 0.86));
      if (bstyle === "mundu") body.push(P(new THREE.BoxGeometry(TH * 0.006, legL * 0.9, TH * 0.004), "#c9a227", hpW * 0.3, legL * 0.5, hpW * 0.86));
    }
    if (bstyle === "skirt") body.push(lathe([[hpW * 1.35, legL - thigh * 1.15], [hpW * 1.05, legL], [waW * 1.06, waistY]], bot, 0.8, 0.72));
    if (bstyle === "shorts") body.push(lathe([[hpW * 1.04, legL - TH * 0.06], [hpW * 1.0, legL + TH * 0.02]], bot, 0.72, 0.7));
    if (topKind === "saree") { body.push(P(new THREE.BoxGeometry(TH * 0.012, torsoL * 1.25, chW * 0.9), trim, -chW * 0.15, y(0.62), chW * 0.25, 0, 0, -0.6), P(new THREE.BoxGeometry(chW * 0.95, legL * 0.85, TH * 0.01), top, -shW * 0.55, y(0.5), -chW * 0.62, 0, 0, 0.05), P(new THREE.BoxGeometry(chW * 0.95, TH * 0.02, TH * 0.012), trim, -shW * 0.55, y(0.5) - legL * 0.42, -chW * 0.62)); }
    if (topKind === "lehenga") body.push(P(new THREE.BoxGeometry(TH * 0.01, torsoL * 1.1, chW * 0.9), trim, chW * 0.25, y(0.62), chW * 0.25, 0, 0, 0.55));
    // neck
    body.push(P(new THREE.CylinderGeometry(nR, nR * 1.2, neck + headR * 0.5, 12), sk, 0, y(0.99) + (neck + headR * 0.5) / 2 - TH * 0.01, -TH * 0.006));
    if (a.hat === "hijab") body.push(lathe([[shW * 0.92, y(0.72)], [shW * 0.98, y(0.86)], [nR * 2.2, y(1.0)], [nR * 1.5, y(1.0) + neck + headR * 0.2]], CLOTH[a.hatC], 0.8, 0.95));
    const torso = mk(body); g.add(torso);

    // ── arms ──
    const ua = TH * 0.165, fa = TH * 0.14, hand = TH * 0.085, uR = 0.025 * TH * wl * (a.body === "straight" ? 1.08 : 1), eR = 0.019 * TH * wl, wR = 0.0145 * TH;
    const armSkin = sk, slv = sleeve > 0 ? top : sk;
    [-1, 1].forEach(sd => {
      const sh = new THREE.Group(); sh.position.set(sd * shW * 0.86, y(0.87), 0);
      const up = [P(new THREE.SphereGeometry(uR * 1.08, 12, 8), sleeve > 0 ? top : sk, 0, 0, 0, 0, 0, 0, 1, 0.95, 0.95), P(new THREE.CylinderGeometry(uR, eR, ua, 10), armSkin, 0, -ua / 2, 0)];
      if (sleeve > 0) { const L2 = Math.min(1, sleeve / 0.55) * ua; up.push(P(new THREE.CylinderGeometry(uR * 1.18, (sleeve >= 0.9 ? eR : uR * 0.9) * 1.18, L2, 10), slv, 0, -L2 / 2, 0)); }
      sh.add(mk(up));
      const el = new THREE.Group(); el.position.y = -ua;
      const fp = [P(new THREE.SphereGeometry(eR * 1.02, 8, 6), sleeve >= 0.9 ? top : sk, 0, 0, 0), P(new THREE.CylinderGeometry(eR, wR, fa, 10), armSkin, 0, -fa / 2, 0)];
      if (sleeve >= 0.9) fp.push(P(new THREE.CylinderGeometry(eR * 1.16, wR * 1.25, fa * (sleeve >= 1 ? 0.96 : 0.6), 10), top, 0, -fa * (sleeve >= 1 ? 0.48 : 0.3), 0));
      // hand: palm + fingers block + thumb (a relaxed hand, palm facing the leg)
      fp.push(P(new THREE.SphereGeometry(1, 10, 8), sk, 0, -fa - hand * 0.32, 0, 0, 0, 0, wR * 0.62, hand * 0.38, wR * 1.25));
      fp.push(P(new THREE.CapsuleGeometry(wR * 0.5, hand * 0.38, 3, 8), skD, sd * -wR * 0.05, -fa - hand * 0.72, 0, 0, 0, 0, 0.85, 1, 1.6));
      fp.push(P(new THREE.CapsuleGeometry(wR * 0.3, hand * 0.3, 3, 6), sk, sd * -wR * 0.45, -fa - hand * 0.35, wR * 0.75, 0.5, 0, sd * 0.4));
      if (a.ears === "jhumka" && sd > 0 && !small) fp.push(P(new THREE.TorusGeometry(wR * 1.05, TH * 0.003, 4, 12), gold, 0, -fa * 0.92, 0, Math.PI / 2, 0, 0));
      el.add(mk(fp)); sh.add(el); g.add(sh); arms.push(sh); elbows.push(el);
    });

    // ── head ──
    const F = FACE[a.face], sx = F[0], sy = F[1], sz = F[2];
    const hy = y(1.0) + neck + headR * 0.92;
    const headG = new THREE.Group(); headG.position.set(0, hy, 0); g.add(headG);
    const surf = (ax, ay, out) => { const ce = Math.cos(ay); const [dx, dy, dz] = deform(Math.sin(ax) * ce, Math.sin(ay), Math.cos(ax) * ce, F); const k = 1 + (out || 0); return [dx * headR * sx * k, dy * headR * sy * k, dz * headR * sz * k]; };
    const skull = new THREE.SphereGeometry(1, hi ? 40 : 28, hi ? 30 : 20), sp = skull.attributes.position;
    for (let i = 0; i < sp.count; i++) { const [dx, dy, dz] = deform(sp.getX(i), sp.getY(i), sp.getZ(i), F); sp.setXYZ(i, dx * headR * sx, dy * headR * sy, dz * headR * sz); }
    skull.computeVertexNormals();
    const fkey = (hi ? "h" : "l") + L.skin + a.eyes + a.eyeC + a.brows + a.lips + a.lipC + a.facial + a.bindi + a.hair + a.hat + a.body + L.hairC;
    if (!headMats[fkey]) headMats[fkey] = new THREE.MeshStandardMaterial({ map: faceTexture(K, a, L, hi), roughness: 0.62 });
    const skullM = new THREE.Mesh(skull, headMats[fkey]); skullM.castShadow = true; headG.add(skullM);
    const hp = [];
    // nose
    const nz = { small: [0.85, 0.85, 0.9], straight: [1, 1, 1], broad: [1.35, 0.95, 1], long: [0.95, 1.22, 1.05] }[a.nose];
    const nb = surf(0, -0.16); hp.push(P(new THREE.SphereGeometry(1, 10, 8), sk, nb[0], nb[1], nb[2] - headR * 0.07, -0.25, 0, 0, headR * 0.085 * nz[0], headR * 0.24 * nz[1], headR * 0.12 * nz[2]));
    const nt = surf(0, -0.3); hp.push(P(new THREE.SphereGeometry(headR * 0.075 * nz[0], 10, 8), sk, nt[0], nt[1], nt[2] - headR * 0.025));
    [-1, 1].forEach(sd => { const nw = surf(sd * 0.1 * nz[0], -0.32); hp.push(P(new THREE.SphereGeometry(headR * 0.06 * nz[0], 8, 6), skD, nw[0], nw[1], nw[2] - headR * 0.04)); });
    // ears
    [-1, 1].forEach(sd => { const e = surf(sd * 1.5, -0.02); hp.push(P(new THREE.SphereGeometry(1, 10, 8), skD, e[0] * 0.98, e[1], e[2] - headR * 0.02, 0, sd * 0.35, 0, headR * 0.08, headR * 0.26, headR * 0.17)); });
    // jewellery
    if (a.ears !== "none") [-1, 1].forEach(sd => { const e = surf(sd * 1.5, -0.24); if (a.ears === "studs") hp.push(P(new THREE.SphereGeometry(headR * 0.05, 6, 4), gold, e[0] * 1.02, e[1], e[2])); if (a.ears === "hoops") hp.push(P(new THREE.TorusGeometry(headR * 0.13, headR * 0.018, 4, 14), gold, e[0] * 1.03, e[1] - headR * 0.12, e[2], 0, Math.PI / 2, 0)); if (a.ears === "jhumka") hp.push(P(new THREE.SphereGeometry(headR * 0.04, 6, 4), gold, e[0] * 1.02, e[1], e[2]), P(new THREE.ConeGeometry(headR * 0.09, headR * 0.14, 10, 1, true), gold, e[0] * 1.03, e[1] - headR * 0.14, e[2])); });
    if (a.noseJ !== "none") { const n = surf(-0.1 * nz[0], -0.3); if (a.noseJ === "stud") hp.push(P(new THREE.SphereGeometry(headR * 0.03, 6, 4), gold, n[0], n[1], n[2] - headR * 0.01)); else hp.push(P(new THREE.TorusGeometry(headR * 0.07, headR * 0.012, 4, 12), gold, n[0] - headR * 0.03, n[1] - headR * 0.05, n[2] - headR * 0.02, 0, Math.PI / 2, 0)); }
    // facial hair
    const fh = a.facial;
    if (fh === "moustache" || fh === "kerala" || fh === "goatee" || fh === "beard" || fh === "longbeard") {
      const k = fh === "kerala" ? 1.35 : 1; [-1, 1].forEach(sd => { const m = surf(sd * 0.11, -0.4); hp.push(P(new THREE.CapsuleGeometry(headR * 0.045 * k, headR * 0.17 * k, 3, 8), hairC, m[0], m[1], m[2] + headR * 0.015, 0, 0, Math.PI / 2 + sd * (fh === "kerala" ? 0.42 : 0.22))); });
    }
    if (fh === "goatee") { const c = surf(0, -0.78); hp.push(P(new THREE.SphereGeometry(1, 10, 8), hairC, c[0], c[1] - headR * 0.03, c[2], 0, 0, 0, headR * 0.15, headR * 0.17, headR * 0.12)); }
    if (fh === "beard" || fh === "longbeard") {
      // a shell over the jaw and chin (below the mouth), open at the back of the neck
      const geo = new THREE.SphereGeometry(1, 26, 12, -Math.PI / 2 + 1.15, Math.PI * 2 - 2.3, 0.6 * Math.PI, 0.36 * Math.PI), q = geo.attributes.position;
      for (let i = 0; i < q.count; i++) { const [dx, dy, dz] = deform(q.getX(i), q.getY(i), q.getZ(i), F); q.setXYZ(i, dx * headR * sx * 1.07, dy * headR * sy * 1.05, dz * headR * sz * 1.08); }
      geo.computeVertexNormals(); hp.push({ geo, color: hairC });
      if (fh === "longbeard") { const c = surf(0, -0.9); hp.push(P(new THREE.ConeGeometry(headR * 0.42, headR * 0.9, 12), hairC, c[0], c[1] - headR * 0.4, c[2] - headR * 0.1, Math.PI + 0.25, 0, 0, 1, 1, 0.6)); }
    }
    // hair
    const hat = a.hat, hs = hat === "hijab" || hat === "turban" ? "none" : a.hair;
    const smooth = (a0, b0, v) => { const t = Math.max(0, Math.min(1, (v - a0) / (b0 - a0))); return t * t * (3 - 2 * t); };
    const hairCap = (e, hl, c, face) => {
      const geo = new THREE.SphereGeometry(1, hi ? 48 : 30, hi ? 34 : 20), q = geo.attributes.position;
      for (let i = 0; i < q.count; i++) {
        const vx = q.getX(i), vy = q.getY(i), vz = q.getZ(i), az = Math.abs(Math.atan2(vx, vz)), el = Math.asin(Math.max(-1, Math.min(1, vy)));
        const line = az < 0.8 ? hl[0] + (hl[1] - hl[0]) * smooth(0, 0.8, az) : az < 1.5 ? hl[1] + (hl[2] - hl[1]) * smooth(0.8, 1.5, az) : hl[2] + (hl[3] - hl[2]) * smooth(1.5, Math.PI, az);
        let k = smooth(line - 0.14, line + 0.03, el);
        if (face && az < 0.85 && el > -0.95 && el < 0.48) k = 0;
        const r = 0.9 + (e - 0.9) * k, [dx, dy, dz] = deform(vx, vy, vz, F);
        q.setXYZ(i, dx * headR * sx * r, dy * headR * sy * r, dz * headR * sz * r);
      }
      geo.computeVertexNormals(); hp.push({ geo, color: c || hairC });
    };
    const cap = (e, theta, tilt, c) => { const geo = new THREE.SphereGeometry(1, 26, 14, 0, Math.PI * 2, 0, theta * Math.PI), q = geo.attributes.position; for (let i = 0; i < q.count; i++) { const v = new THREE.Vector3(q.getX(i), q.getY(i), q.getZ(i)).applyAxisAngle(new THREE.Vector3(1, 0, 0), tilt); const [dx, dy, dz] = deform(v.x, v.y, v.z, F); q.setXYZ(i, dx * headR * sx * e, dy * headR * sy * e + headR * 0.02, dz * headR * sz * e); } geo.computeVertexNormals(); hp.push({ geo, color: c || hairC }); };
    const shell = (e, t0, t1, gap, c, stretch) => { const geo = new THREE.SphereGeometry(1, 26, 14, Math.PI / 2 + gap, Math.PI * 2 - gap * 2, t0 * Math.PI, (t1 - t0) * Math.PI), q = geo.attributes.position; for (let i = 0; i < q.count; i++) { let px = q.getX(i), py = q.getY(i), pz = q.getZ(i); const [dx, dy, dz] = deform(px, Math.max(py, -0.2), pz, F); q.setXYZ(i, dx * headR * sx * e, (py < -0.2 ? (py + 0.2) * (stretch || 1) - 0.2 : py) * headR * sy * e, dz * headR * sz * e); } geo.computeVertexNormals(); hp.push({ geo, color: c || hairC }); };
    const blob = (ax, ay, out, s1, s2, s3, rx, rz, c) => { const p = surf(ax, ay, out); hp.push(P(new THREE.SphereGeometry(1, 12, 8), c || hairC, p[0], p[1], p[2], rx || 0, 0, rz || 0, headR * s1, headR * s2, headR * s3)); };
    const HL = { buzz: [0.62, 0.42, 0.08, -0.55], crew: [0.6, 0.4, 0.04, -0.6], short: [0.58, 0.38, 0.0, -0.62], wavy: [0.55, 0.3, -0.42, -0.85], bob: [0.52, 0.26, -0.78, -0.95], long: [0.55, 0.3, -0.62, -1.0], tight: [0.6, 0.38, -0.05, -0.68], curly: [0.56, 0.34, -0.2, -0.75] };
    if (hs === "buzz") hairCap(1.02, HL.buzz, hairC.clone().lerp(sk, 0.25));
    if (hs === "crew") hairCap(1.045, HL.crew);
    if (hs === "short" || hs === "sidepart" || hs === "spiky" || hs === "quiff") {
      hairCap(1.07, HL.short);
      [-1, 1].forEach(sd => blob(sd * 1.35, 0.15, 0.02, 0.1, 0.26, 0.16));
      if (hs === "sidepart") blob(0.3, 0.72, 0.0, 0.62, 0.22, 0.55, -0.35, -0.3);
      if (hs === "quiff") blob(0, 0.66, 0.02, 0.48, 0.24, 0.34, -0.9);
      if (hs === "spiky") for (let i = 0; i < 9; i++) { const p = surf((i % 3 - 1) * 0.42, 0.85 - Math.floor(i / 3) * 0.25 + 0.15, 0.02); hp.push(P(new THREE.ConeGeometry(headR * 0.13, headR * 0.34, 6), hairC, p[0], p[1] + headR * 0.08, p[2] - headR * 0.1 * Math.floor(i / 3), -0.6 - Math.floor(i / 3) * 0.35, 0, (i % 3 - 1) * -0.4)); }
    }
    if (hs === "wavy") { hairCap(1.1, HL.wavy); blob(0.3, 0.75, 0.04, 0.6, 0.22, 0.55, -0.3, -0.3); }
    if (hs === "curly") { hairCap(1.08, HL.curly); for (let i = 0; i < 18; i++) { const ax = -1.9 + (i % 6) * 0.76, ay = 0.25 + Math.floor(i / 6) * 0.3; if (Math.abs(ax) < 0.45 && ay < 0.6) continue; blob(ax, ay, 0.08, 0.28, 0.26, 0.28); } }
    if (hs === "afro") { hairCap(1.08, HL.curly); const p = surf(0, 0.55, 0.15); hp.push(P(new THREE.SphereGeometry(1, 18, 12), hairC, p[0], p[1], p[2] - headR * 0.25, 0, 0, 0, headR * 1.3 * sx, headR * 1.05, headR * 1.3)); }
    if (hs === "bob") hairCap(1.12, HL.bob);
    if (hs === "long") hairCap(1.1, HL.long); else if (hs === "ponytail" || hs === "braid" || hs === "bun") hairCap(1.05, HL.tight);
    if (hs === "long") { const b = surf(Math.PI, -0.4, 0.05); hp.push(P(new THREE.CapsuleGeometry(headR * 0.75, headR * 1.7, 4, 12), hairC, b[0], b[1] - headR * 0.75, b[2] + headR * 0.08, -0.12, 0, 0, 1.15, 1, 0.38)); [-1, 1].forEach(sd => { const f = surf(sd * 1.05, -0.5, 0.05); hp.push(P(new THREE.CapsuleGeometry(headR * 0.15, headR * 1.1, 3, 8), hairC, f[0], f[1] - headR * 0.5, f[2] + headR * 0.05, 0.15, 0, 0, 1, 1, 0.7)); }); }
    if (hs === "ponytail") { blob(Math.PI, 0.45, 0.06, 0.24, 0.24, 0.24); const b = surf(Math.PI, 0.3, 0.2); hp.push(P(new THREE.CapsuleGeometry(headR * 0.2, headR * 1.5, 4, 10), hairC, b[0], b[1] - headR * 0.85, b[2] - headR * 0.18, 0.28, 0, 0, 1, 1, 0.8)); }
    if (hs === "braid") { for (let i = 0; i < 9; i++) { const b = surf(Math.PI, -0.3, 0.02); hp.push(P(new THREE.SphereGeometry(headR * (0.2 - i * 0.012), 8, 6), hairC, b[0] + (i % 2 ? 0.25 : -0.25) * headR * 0.15, b[1] - i * headR * 0.3, b[2] - headR * 0.08 - i * headR * 0.02, 0, 0, 0, 1, 1.25, 0.9)); } }
    if (hs === "bun") blob(Math.PI, 0.32, 0.25, 0.46, 0.42, 0.42);
    // headwear
    const hc = col(CLOTH[a.hatC]);
    if (hat === "jasmine") { const base = hs === "braid" ? -0.15 : hs === "bun" ? 0.32 : 0.25; for (let i = 0; i < 11; i++) { const t = (i - 5) / 5, p = surf(Math.PI + t * 0.95, base + (1 - t * t) * 0.18, hs === "bun" ? 0.3 : 0.1); hp.push(P(new THREE.SphereGeometry(headR * 0.075, 6, 4), "#fbfbf3", p[0], p[1], p[2])); } if (hs === "braid") for (let i = 1; i < 7; i++) { const b = surf(Math.PI, -0.3, 0.12); hp.push(P(new THREE.SphereGeometry(headR * 0.065, 6, 4), "#fbfbf3", b[0], b[1] - i * headR * 0.32, b[2] - headR * 0.12)); } }
    if (hat === "cap") { cap(1.13, 0.5, -0.12, hc); const v = surf(0, 0.5, 0.12); hp.push(P(new THREE.CylinderGeometry(headR * 0.62, headR * 0.62, headR * 0.05, 16, 1, false, -Math.PI / 2, Math.PI), hc, v[0], v[1], v[2] + headR * 0.05, 0.12, 0, 0, 1.2, 1, 1.25)); }
    if (hat === "beanie") { cap(1.12, 0.55, -0.15, hc); const r = surf(0, 0.35, 0.12); hp.push(P(new THREE.TorusGeometry(headR * 0.98, headR * 0.09, 6, 22), shadeC(hc, 0.85), 0, r[1] - headR * 0.05, -headR * 0.05, Math.PI / 2 - 0.15, 0, 0, sx * 1.05, sz * 1.05, 1)); }
    if (hat === "turban") { hairCap(1.16, [0.48, 0.36, 0.12, -0.45], hc); for (let i = 0; i < 4; i++) hp.push(P(new THREE.TorusGeometry(headR * (0.92 - i * 0.14), headR * 0.15, 8, 22), i % 2 ? shadeC(hc, 0.88) : hc, 0, headR * (0.62 + i * 0.17), -headR * 0.1, Math.PI / 2 - 0.35 - i * 0.04, 0, 0, sx * 1.12, sz * 1.15, 1)); }
    if (hat === "hijab") hairCap(1.14, [0.5, 0.3, -1.3, -1.4], hc, true);
    // glasses
    if (a.glasses !== "none") {
      const gc = a.glasses === "shades" ? "#121214" : "#1b1418";
      [-1, 1].forEach(sd => {
        const e = surf(sd * 0.36, 0.02, 0.1);
        if (a.glasses === "round") hp.push(P(new THREE.TorusGeometry(headR * 0.17, headR * 0.022, 6, 18), gc, e[0], e[1], e[2]));
        if (a.glasses === "square") { const w = headR * 0.36, h = headR * 0.26, t = headR * 0.03; hp.push(P(new THREE.BoxGeometry(w, t, t), gc, e[0], e[1] + h / 2, e[2]), P(new THREE.BoxGeometry(w, t, t), gc, e[0], e[1] - h / 2, e[2]), P(new THREE.BoxGeometry(t, h, t), gc, e[0] - w / 2, e[1], e[2]), P(new THREE.BoxGeometry(t, h, t), gc, e[0] + w / 2, e[1], e[2])); }
        if (a.glasses === "shades") hp.push(P(new THREE.SphereGeometry(1, 12, 8), gc, e[0], e[1] - headR * 0.02, e[2], 0, 0, 0, headR * 0.2, headR * 0.15, headR * 0.05));
        const t2 = surf(sd * 1.3, 0.05, 0.08); hp.push(P(new THREE.BoxGeometry(headR * 0.02, headR * 0.02, Math.abs(e[2] - t2[2]) + headR * 0.1), gc, (e[0] + t2[0]) / 2 + sd * headR * 0.06, e[1] + headR * 0.02, (e[2] + t2[2]) / 2, 0, -sd * 0.25, 0));
      });
      const br = surf(0, 0.04, 0.1); hp.push(P(new THREE.BoxGeometry(headR * 0.16, headR * 0.025, headR * 0.025), gc, br[0], br[1], br[2]));
    }
    headG.add(mk(hp));
    headG.userData.pivotY = hy;
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(0.11 * wf * (TH / 0.6), 18), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.24, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.012; g.add(shadow);
    return { group: g, legs, knees, arms, elbows, torso, head: headG, H: hy + headR * 1.05, legL, shadow, headY: hy, headR };
  }
  function shadeC(c, k) { return c.clone().multiplyScalar(k); }

  return { O, ids, CLOTH, EYE, LIP, normalize, pack, unpack, basics, random, build };
})();
