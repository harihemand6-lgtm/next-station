// Player avatar drawn as SVG. Appearance is cosmetic only: it never changes any game outcome.
window.AE_AVATAR = (function () {
  const SKIN = ["#f6d9c4", "#ecc09c", "#d9a37e", "#c58964", "#a96f4b", "#8a5638", "#6b3f28", "#4b2b1b"];
  const HAIR = ["#16110e", "#3b2416", "#6b4127", "#a8723f", "#8f8f96", "#b8473f", "#3f5fc4"];
  const OUTFIT = ["#f4a52b", "#22b5a6", "#e2574c", "#7b8cff", "#f3efe6", "#2f9e5b", "#c64fa0", "#2b2a44"];
  const STYLES = { hair: ["short", "long", "bun", "curly", "buzz", "bald"], top: ["tee", "shirt", "kurta"], acc: ["none", "specs", "moustache", "beard", "cap"] };

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.max(0, Math.min(255, Math.round(v + amt))));
    return "#" + c.map(v => v.toString(16).padStart(2, "0")).join("");
  }

  function svg(p, size) {
    p = Object.assign({ skin: 3, height: 168, weight: 62, hair: "short", hairColor: 0, top: "tee", outfit: 0, acc: "none" }, p || {});
    const skin = SKIN[p.skin] || SKIN[3], hc = HAIR[p.hairColor] || HAIR[0], oc = OUTFIT[p.outfit] || OUTFIT[0];
    const H = 112 + (Math.max(140, Math.min(200, p.height)) - 140) / 60 * 70;
    const bmi = p.weight / Math.pow(p.height / 100, 2);
    const wf = Math.max(0.74, Math.min(1.45, 0.78 + (bmi - 18) / 14 * 0.55));
    const cx = 60, ground = 214, top = ground - H, hr = 12.5;
    const hy = top + hr, sh = hy + hr + 3, hip = sh + H * 0.36;
    const tw = 30 * wf, aw = 7.5 * Math.sqrt(wf), lw = 10 * Math.sqrt(wf);
    const pants = "#2a2742", shoe = "#151320";
    const topLen = p.top === "kurta" ? (ground - hip) * 0.45 : 0;
    let s = `<svg viewBox="0 0 120 220" width="${size || 120}" height="${(size || 120) * 220 / 120}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Your character">`;
    s += `<ellipse cx="${cx}" cy="${ground + 2}" rx="${tw * 0.9}" ry="3.5" fill="#000" opacity=".25"/>`;
    // long hair behind head
    if (p.hair === "long") s += `<rect x="${cx - hr - 2}" y="${hy - 4}" width="${hr * 2 + 4}" height="${hr * 2 + 12}" rx="9" fill="${hc}"/>`;
    // legs
    s += `<rect x="${cx - lw - 1}" y="${hip - 2}" width="${lw}" height="${ground - hip - 2}" rx="4" fill="${pants}"/>`;
    s += `<rect x="${cx + 1}" y="${hip - 2}" width="${lw}" height="${ground - hip - 2}" rx="4" fill="${pants}"/>`;
    s += `<rect x="${cx - lw - 3}" y="${ground - 6}" width="${lw + 3}" height="6" rx="3" fill="${shoe}"/><rect x="${cx + 1}" y="${ground - 6}" width="${lw + 3}" height="6" rx="3" fill="${shoe}"/>`;
    // arms
    const armLen = (hip - sh) * 0.95;
    s += `<rect x="${cx - tw / 2 - aw + 1}" y="${sh + 2}" width="${aw}" height="${armLen}" rx="${aw / 2}" fill="${shade(oc, -18)}"/>`;
    s += `<rect x="${cx + tw / 2 - 1}" y="${sh + 2}" width="${aw}" height="${armLen}" rx="${aw / 2}" fill="${shade(oc, -18)}"/>`;
    s += `<circle cx="${cx - tw / 2 - aw / 2 + 1}" cy="${sh + armLen + 3}" r="${aw / 2 + 0.6}" fill="${skin}"/><circle cx="${cx + tw / 2 + aw / 2 - 1}" cy="${sh + armLen + 3}" r="${aw / 2 + 0.6}" fill="${skin}"/>`;
    // torso
    s += `<rect x="${cx - tw / 2}" y="${sh}" width="${tw}" height="${hip - sh + topLen + 2}" rx="8" fill="${oc}"/>`;
    if (p.top === "shirt") s += `<path d="M${cx} ${sh + 1} L${cx} ${hip}" stroke="${shade(oc, -40)}" stroke-width="1.2"/><path d="M${cx - 6} ${sh} L${cx} ${sh + 7} L${cx + 6} ${sh}" fill="none" stroke="${shade(oc, -40)}" stroke-width="1.5"/>`;
    if (p.top === "kurta") s += `<path d="M${cx} ${sh + 1} L${cx} ${sh + 16}" stroke="${shade(oc, -45)}" stroke-width="1.4"/>`;
    // neck and head
    s += `<rect x="${cx - 4}" y="${hy + hr - 3}" width="8" height="7" fill="${shade(skin, -14)}"/>`;
    s += `<circle cx="${cx}" cy="${hy}" r="${hr}" fill="${skin}"/>`;
    // hair on top
    if (p.hair === "short" || p.hair === "long") s += `<path d="M${cx - hr - 0.5} ${hy - 1} Q${cx - hr} ${hy - hr - 5} ${cx} ${hy - hr - 2} Q${cx + hr} ${hy - hr - 5} ${cx + hr + 0.5} ${hy - 1} Q${cx + 4} ${hy - hr + 3} ${cx - hr - 0.5} ${hy - 1}Z" fill="${hc}"/>`;
    if (p.hair === "bun") s += `<circle cx="${cx}" cy="${hy - hr - 4}" r="6" fill="${hc}"/><path d="M${cx - hr} ${hy - 1} Q${cx} ${hy - hr - 8} ${cx + hr} ${hy - 1} Q${cx} ${hy - hr + 2} ${cx - hr} ${hy - 1}Z" fill="${hc}"/>`;
    if (p.hair === "curly") for (let i = -2; i <= 2; i++) s += `<circle cx="${cx + i * 5.2}" cy="${hy - hr + 1 + Math.abs(i) * 2}" r="5.2" fill="${hc}"/>`;
    if (p.hair === "buzz") s += `<path d="M${cx - hr} ${hy - 2} Q${cx} ${hy - hr - 4} ${cx + hr} ${hy - 2} Q${cx} ${hy - hr + 1} ${cx - hr} ${hy - 2}Z" fill="${hc}" opacity=".7"/>`;
    // face
    s += `<circle cx="${cx - 4.3}" cy="${hy + 1}" r="1.5" fill="#1b1622"/><circle cx="${cx + 4.3}" cy="${hy + 1}" r="1.5" fill="#1b1622"/>`;
    s += `<path d="M${cx - 3.5} ${hy + 6} Q${cx} ${hy + 8.6} ${cx + 3.5} ${hy + 6}" fill="none" stroke="#1b1622" stroke-width="1.2" stroke-linecap="round"/>`;
    if (p.acc === "specs") s += `<g fill="none" stroke="#1b1622" stroke-width="1.1"><circle cx="${cx - 4.5}" cy="${hy + 1}" r="3.4"/><circle cx="${cx + 4.5}" cy="${hy + 1}" r="3.4"/><path d="M${cx - 1.1} ${hy + 1} H${cx + 1.1}"/></g>`;
    if (p.acc === "moustache") s += `<path d="M${cx - 5} ${hy + 5.2} Q${cx} ${hy + 2.6} ${cx + 5} ${hy + 5.2} Q${cx} ${hy + 4.2} ${cx - 5} ${hy + 5.2}Z" fill="${hc}"/>`;
    if (p.acc === "beard") s += `<path d="M${cx - hr + 1.5} ${hy + 2} Q${cx - hr + 2} ${hy + hr + 3} ${cx} ${hy + hr + 4} Q${cx + hr - 2} ${hy + hr + 3} ${cx + hr - 1.5} ${hy + 2} Q${cx} ${hy + 10} ${cx - hr + 1.5} ${hy + 2}Z" fill="${hc}"/>`;
    if (p.acc === "cap") s += `<path d="M${cx - hr - 1} ${hy - 3} Q${cx} ${hy - hr - 9} ${cx + hr + 1} ${hy - 3}Z" fill="${shade(oc, -30)}"/><rect x="${cx}" y="${hy - 4.5}" width="${hr + 7}" height="3" rx="1.5" fill="${shade(oc, -45)}"/>`;
    s += `</svg>`;
    return s;
  }
  return { svg, SKIN, HAIR, OUTFIT, STYLES };
})();
