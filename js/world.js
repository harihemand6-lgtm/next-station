// 3D city (Three.js r147). Kochi is built on its real layout: Arabian Sea and Fort Kochi in the west, Willingdon Island,
// Bolgatty and Vypeen in the backwaters, and the Ernakulam mainland (Marine Drive, MG Road, Kaloor, Kadavanthra, Vyttila).
// Other cities use a simpler grid with one famous landmark. Camera follows behind you; joystick, WASD or tap to walk.
window.AE_WORLD = (function () {
  const AV = window.AE_AVATAR;
  let COLS = 48, ROWS = 36;
  const SPEED = 3.3;
  const ROAD = 0, SIDE = 1, PLAZA = 2, GRASS = 3, BLD = 4, WATER = 5, TREE = 6, JETTY = 7, SAND = 8, BRIDGE = 9;
  const WALKABLE = [true, true, true, true, false, false, false, true, true, true];
  const LANDMARK = { street: "{stall}", job: "Infopark", govt: "Coaching Centre", creator: "Creator Café", startup: "Co-working Space", craft: "Weavers' Workshop", film: "Film Studio", cricket: "Kaloor Stadium", reality: "Spotlight House", trader: "Wi-Fi Café", nurse: "City Hospital", cab: "Auto Stand", teacher: "Tuition Centre", kitchen: "Your Kitchen", homestay: "Your Homestay", stylist: "Style Studio", band: "Rehearsal Room", planner: "Events Office", seafood: "Fishing Harbour", gulf: "Your Shop" };
  const BIGCOL = { garage: "#ff8a5c", life: "#f4a52b", rival: "#ef6a5f", home: "#c9b6ff", station: "#22b5a6", hall: "#f3efe6", fxn: "#ff4f9a", office: "#9fd3ff", bank: "#7fe0a8", cafe: "#ffcf7a", mall: "#d6c8f0", lm: "#e8dcc0" };
  const SKIN = AV.SKIN, HAIRC = AV.HAIR;

  // ── Kochi, on its real layout (1 tile ≈ 3 m, squeezed) ──
  const K = {
    land: [[1, 0, 8, 17], [2, 22, 17, 47], [21, 25, 31, 38], [23, 7, 29, 14], [36, 0, 63, 47]],
    sand: [[1, 0, 1, 17], [2, 22, 3, 36]],
    plaza: [[36, 0, 38, 47]],
    roads: [[39, 0, 40, 47], [46, 0, 47, 47], [53, 0, 54, 47], [59, 0, 60, 47], [39, 8, 63, 9], [39, 21, 63, 22], [39, 36, 63, 37], [39, 45, 63, 46],
      [9, 22, 10, 47], [15, 22, 16, 47], [4, 31, 17, 32], [4, 40, 17, 41], [26, 25, 26, 38], [21, 31, 31, 32], [23, 11, 29, 12], [4, 0, 5, 17], [2, 11, 8, 12]],
    bridges: [[9, 11, 22, 12], [30, 11, 35, 12], [18, 31, 20, 32], [32, 31, 35, 32]],
    jetties: [[18, 24, 19, 24], [33, 19, 35, 19]],
    parks: [[48, 16, 52, 20]],
    lots: {
      hall: { r: [48, 1, 52, 6], door: [50, 7], name: "Town Hall", kind: "hall" },
      NORTH: { r: [41, 1, 45, 6], door: [43, 7], name: "Kaloor Junction" },
      HOSP: { r: [55, 1, 58, 6], door: [56, 7], name: "City Hospital", kind: "hospital" },
      mall: { r: [61, 0, 63, 6], door: [62, 7], name: "Riverside Mall, Edappally", kind: "mall" },
      bank: { r: [41, 10, 45, 14], door: [40, 12], name: "Bank", kind: "bank" },
      cafe: { r: [41, 16, 45, 20], door: [40, 18], name: "Café Monsoon", kind: "cafe" },
      fxn: { r: [48, 10, 52, 14], door: [47, 12], name: "FXN Rentals", kind: "fxn" },
      STADIUM: { r: [55, 10, 58, 20], door: [56, 21], name: "Kaloor Stadium", kind: "stadium" },
      EAST: { r: [61, 10, 63, 20], door: [60, 15], name: "Infopark", kind: "tower" },
      BW: { r: [41, 23, 45, 28], door: [40, 25], name: "Broadway Market", kind: "market" },
      rival: { r: [41, 30, 45, 35], door: [40, 33] },
      office: { r: [48, 23, 52, 28], door: [47, 25], name: "Government Office", kind: "office" },
      MG: { r: [48, 30, 52, 35], door: [47, 33], name: "MG Road Offices", kind: "tower" },
      home: { r: [55, 30, 58, 35], door: [56, 29], name: "Home", kind: "home" },
      AUTO: { r: [41, 38, 45, 44], door: [43, 37], name: "Auto Stand", kind: "market" },
      station: { r: [48, 38, 52, 44], door: [50, 37], name: "Ernakulam Junction", kind: "station" },
      HARBOUR: { r: [4, 23, 8, 27], door: [6, 28], name: "Fishing Harbour", kind: "warehouse" },
      church: { r: [11, 23, 14, 28], door: [12, 29], name: "Old Church", kind: "church" },
      FK: { r: [11, 34, 14, 38], door: [12, 33], name: "Fort Kochi Heritage House", kind: "colonial" },
      WILL: { r: [27, 26, 31, 29], door: [28, 30], name: "Cochin Port Warehouse", kind: "warehouse" },
      SHOW: { r: [61, 38, 63, 44], door: [60, 41], name: "Vyttila Motors", kind: "showroom" }
    },
    blocks: [
      { r: [55, 23, 58, 28], style: "res" }, { r: [61, 23, 63, 35], style: "res" }, { r: [55, 38, 58, 44], style: "shop" },
      { r: [41, 47, 63, 47], style: "shop", low: true },
      { r: [4, 33, 8, 38], style: "colonial" }, { r: [4, 42, 8, 47], style: "colonial" }, { r: [11, 42, 14, 47], style: "colonial" }, { r: [17, 34, 17, 47], style: "colonial" },
      { r: [21, 26, 25, 29], style: "warehouse" }, { r: [21, 34, 25, 38], style: "warehouse" }, { r: [27, 34, 31, 38], style: "warehouse" },
      { r: [24, 7, 28, 9], style: "kerala" }, { r: [24, 13, 28, 14], style: "kerala" },
      { r: [6, 1, 8, 9], style: "kerala" }, { r: [6, 14, 8, 17], style: "kerala" }, { r: [2, 1, 3, 9], style: "kerala" }, { r: [2, 14, 3, 17], style: "kerala" }
    ],
    lifeLot: { street: "BW", job: "EAST", govt: "NORTH", creator: "FK", startup: "EAST", craft: "FK", film: "WILL", cricket: "STADIUM", reality: "WILL", trader: "EAST", nurse: "HOSP", cab: "AUTO", teacher: "NORTH", kitchen: "BW", homestay: "FK", stylist: "MG", band: "FK", planner: "MG", seafood: "HARBOUR", gulf: "BW" },
    board: [37, 23], park: [50, 18], start: [37, 26], ferry: { MD: [36, 19], FK: [17, 24] },
    areas: [["Arabian Sea", 0.6, 30], ["Vypeen", 4.5, 4], ["Fort Kochi", 6, 30], ["Mattancherry", 12, 45], ["Willingdon Island", 26, 36.5], ["Bolgatty", 26, 9.5], ["Marine Drive", 37.5, 9], ["MG Road", 46.5, 28], ["Kaloor", 56.5, 8.6], ["Edappally", 61.5, 8.6], ["Kadavanthra", 57, 25], ["Vyttila", 60, 41], ["Ernakulam South", 50, 46.4], ["Backwaters", 32.5, 22]],
    palms: [[2, 22, 3, 36, 0.5], [1, 0, 1, 17, 0.5], [36, 0, 38, 47, 0.18], [23, 7, 29, 14, 0.2], [21, 25, 31, 38, 0.05], [2, 22, 17, 47, 0.06], [55, 23, 63, 35, 0.06]],
    // real Ernakulam / Fort Kochi street names: [name, x, y, vertical]
    roadNames: [["Shanmugham Road", 40, 27, 1], ["MG Road", 47, 17, 1], ["Chittoor Road", 54, 30, 1], ["Kaloor–Kadavanthra Road", 60, 29, 1], ["Banerji Road", 51, 9, 0], ["Park Avenue", 57, 22, 0], ["Sahodaran Ayyappan Road", 50, 37, 0], ["Thevara Road", 52, 46, 0],
      ["Princess Street", 10, 36, 1], ["Bazaar Road", 16, 27, 1], ["Calvathy Road", 7, 32, 0], ["Jew Town Road", 12.5, 41, 0], ["Bristow Road", 26.5, 35, 1], ["Goshree Bridge", 16, 12, 0], ["Goshree Bridge", 32.5, 12, 0], ["BOT Bridge", 19.5, 32, 0], ["Venduruthy Bridge", 33.5, 32, 0], ["Vypeen Beach Road", 5, 6, 1]],
    major: [[39, 0, 40, 47], [46, 0, 47, 47], [39, 36, 63, 37], [39, 8, 63, 9]],
    signs: [[38.75, 30.5, "Shanmugham Rd", 1], [45.7, 15.5, "MG Road", 1], [52.7, 15.5, "Chittoor Rd", 1], [58.7, 7.5, "Kaloor–Kadavanthra Rd", 1], [41.6, 7.7, "Banerji Rd", 0], [38.6, 20.7, "Park Avenue", 0], [38.6, 35.7, "Sahodaran Ayyappan Rd", 0], [38.6, 44.7, "Thevara Rd", 0], [11.3, 30.6, "Princess St", 1], [14.7, 30.6, "Bazaar Rd", 1], [11.3, 39.4, "Jew Town Rd", 0]],
    metro: { x: 47, stations: [[3.5, "Kaloor"], [30.5, "MG Road"], [42.5, "Ernakulam South"]] },
    busStops: [[38.3, 12.5], [38.3, 33.5]],
    routes: [[[40, -2], [40, 50]], [[47, -2], [47, 50]], [[54, -2], [54, 50]], [[60, -2], [60, 50]], [[39, 9], [66, 9]], [[39, 22], [66, 22]], [[39, 37], [66, 37]], [[39, 46], [66, 46]], [[10, 22], [10, 50]], [[16, 22], [16, 50]], [[4, 32], [36, 32]], [[2, 12], [36, 12]], [[5, -2], [5, 17]]]
  };
  const CITY_MONUMENT = { KA: "Vidhana Soudha", TG: "Charminar", MH: "Gateway of India", DL: "India Gate" };

  let THREE, el, renderer, scene, camera, ray, groundMesh, grid, blds, trees, labels, spots, doors, figs = {}, me, raf = 0, last = 0, opts = {}, yaw = 0, lastDrag = 0, keys = {}, joy = { x: 0, y: 0, on: false }, nearKey = null, sceneMarker = null, guide = null, beacon, beaconRing, bang, labelLayer, banner, actBtn, logEl, toastQ = [], toastCur = null, toastT = 0, msgHist = [], msgUnread = 0, msgEl = null, msgTab = "all", ok3d = false, lastMoveSent = 0, extraSpots = {}, inside = {}, pitch = 0.42, dist = 2.9, follow = true, spin = 0, mini, miniCtx, mapEl, mapCv, mapBase, miniT = 0, pointers = {};
  let spinners = [], metroTrain = null, cine = null, sun, hemi, sky, skyU, stars, water, waterTex, facadeMats = [], lampMat, vehicles = [], boats = [], ferry, ride = null, areaLabels = [], ambientT = 0, lastAmb = 0, isKochi = false, palmsList = [];

  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function hashNum(s) { let h = 7; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; }
  function rng(seed) { return () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296); }
  const at = (x, y) => (x < 0 || y < 0 || x >= COLS || y >= ROWS ? BLD : grid[y * COLS + x]);
  const setT = (x, y, v) => { if (x >= 0 && y >= 0 && x < COLS && y < ROWS) grid[y * COLS + x] = v; };
  const walk = (x, y) => WALKABLE[at(x, y)];
  const tileOf = p => ({ x: Math.floor(p.x), y: Math.floor(p.z) });
  const fill = (r, v) => { for (let y = r[1]; y <= r[3]; y++) for (let x = r[0]; x <= r[2]; x++) setT(x, y, v); };

  // ═══ Layout ═══
  function reset() { grid = []; blds = []; labels = []; trees = []; spots = {}; doors = []; areaLabels = []; palmsList = []; }
  function lotName(o, id, def) {
    const w = o.words, homeName = o.house ? ["Home (rented room)", "Home (1BHK flat)", "Home (2BHK flat)", "Your House", "Your Villa"][o.house.lvl || 0] : "Home";
    if (id === "home") return o.base ? homeName : "Guesthouse";
    if (id === "rival") return w.v + "'s place";
    if (id === "station") return isKochi ? "Ernakulam Junction" : w.city + " Railway Station";
    return def;
  }
  function addBuilding(b) { for (let y = b.y; y < b.y + b.d; y++) for (let x = b.x; x < b.x + b.w; x++) setT(x, y, BLD); blds.push(b); return b; }
  function fillBlock(r, style, R, low) {
    const [x0, y0, x1, y1] = r, H = y1 - y0 + 1, rows = H >= 7 ? [[y0, y0 + Math.floor(H / 2) - 1, -1], [y0 + Math.floor(H / 2) + 1, y1, 1]] : [[y0, y1, H >= 3 ? 0 : 1]];
    rows.forEach(([ya, yb, face]) => {
      let x = x0;
      while (x <= x1) {
        const w = Math.min(x1 - x + 1, (style === "tower" ? 3 : 2) + Math.floor(R() * 2)), d = yb - ya + 1;
        if (w <= 0 || d <= 0) break;
        const floors = low ? 1 + Math.floor(R() * 2) : style === "tower" ? 5 + Math.floor(R() * 5) : style === "shop" ? 2 + Math.floor(R() * 3) : style === "warehouse" ? 1 + Math.floor(R() * 2) : style === "res" ? 2 + Math.floor(R() * 4) : 1 + Math.floor(R() * 2);
        addBuilding({ x, y: ya, w, d, h: floors * 1.0, floors, style, tint: R(), roof: style === "kerala" || style === "colonial" || (style === "res" && floors <= 2) });
        const dy = face < 0 ? ya - 1 : face > 0 ? yb + 1 : (walk(x, yb + 1) ? yb + 1 : ya - 1);
        doors.push({ x: x + Math.floor(w / 2), y: dy });
        x += w + (R() < 0.35 ? 1 : 0);
      }
    });
  }
  function buildKochi(o) {
    COLS = 64; ROWS = 48; reset(); grid = new Array(COLS * ROWS).fill(WATER);
    const R = rng(hashNum("kochi" + (o.house ? o.house.lvl : 0)));
    K.land.forEach(r => fill(r, SIDE)); K.sand.forEach(r => fill(r, SAND)); K.plaza.forEach(r => fill(r, PLAZA));
    K.roads.forEach(r => fill(r, ROAD)); K.bridges.forEach(r => fill(r, BRIDGE)); K.jetties.forEach(r => fill(r, JETTY));
    K.parks.forEach(r => { fill(r, GRASS); for (let y = r[1]; y <= r[3]; y++) for (let x = r[0]; x <= r[2]; x++) if ((x + y) % 3 === 0 && x !== K.park[0] && y !== K.park[1] && R() < 0.6) { setT(x, y, TREE); trees.push({ x, y, kind: "rain" }); } });
    const lifeLot = K.lifeLot[o.lifeId] || "BW";
    Object.keys(K.lots).forEach(id => {
      const L = K.lots[id], [x0, y0, x1, y1] = L.r;
      let big = { hall: "hall", bank: "bank", cafe: "cafe", fxn: "fxn", rival: "rival", office: "office", home: "home", station: "station", mall: "mall", SHOW: "garage" }[id] || (id === lifeLot ? "life" : "lm");
      let name = big === "life" ? (LANDMARK[o.lifeId] || "Market").replace("{stall}", o.words.stall) : lotName(o, id, L.name || "");
      const kind = big === "home" ? "home" : big === "rival" ? "shop" : L.kind || "shop";
      const floors = { showroom: 2, hall: 2, hospital: 6, mall: 4, bank: 3, cafe: 1, fxn: 3, stadium: 2, tower: 8, market: 1, office: 3, station: 2, warehouse: 2, church: 2, colonial: 2, home: [2, 3, 4, 2, 2][(o.house && o.house.lvl) || 0], shop: 3 }[kind] || 2;
      addBuilding({ x: x0, y: y0, w: x1 - x0 + 1, d: y1 - y0 + 1, h: floors, floors, style: kind, big, kind, name, door: L.door, tint: R(), roof: ["church", "colonial", "office", "hall"].indexOf(kind) >= 0 || (kind === "home" && (o.house && o.house.lvl >= 3)) });
      if (name) labels.push({ x: (x0 + x1 + 1) / 2, y: (y0 + y1 + 1) / 2, t: name, c: BIGCOL[big] || "#e8dcc0", h: floors + 0.6 });
      const d = { x: L.door[0], y: L.door[1], label: name };
      if (big === "life") spots.m = d; if (big === "rival") spots.v = d; if (big === "home") { spots.p = d; spots.house = { x: L.door[0] + 2, y: L.door[1], label: name }; }
      if (["station", "hall", "fxn", "office", "bank", "cafe", "mall", "garage"].indexOf(big) >= 0) spots[big] = d;
      if (big === "lm") doors.push({ x: L.door[0], y: L.door[1] });
      if (id === "HOSP") spots.hospital = { x: L.door[0], y: L.door[1], label: "City Hospital" };
    });
    K.blocks.forEach(B => fillBlock(B.r, B.style, R, B.low));
    spots.board = { x: K.board[0], y: K.board[1], label: "Notice Board" };
    spots.f = { x: K.park[0], y: K.park[1], label: "Subhash Park" };
    spots.food = { x: 37, y: 28, label: "Chayakkada" };
    spots.ferryMD = { x: K.ferry.MD[0], y: K.ferry.MD[1], label: "Boat Jetty", ride: "ferryFK", rideLabel: "Take the ferry to Fort Kochi" };
    spots.ferryFK = { x: K.ferry.FK[0], y: K.ferry.FK[1], label: "Boat Jetty", ride: "ferryMD", rideLabel: "Take the ferry to Marine Drive" };
    // Kochi Metro: stairs down to MG Road under each station
    K.metro.stations.forEach(([z, name], i) => { const k = METRO_KEYS[i]; spots[k] = { x: K.metro.x - 1, y: Math.floor(z), label: name + " Metro", metro: i, z }; });
    K.palms.forEach(([x0, y0, x1, y1, p]) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if ((at(x, y) === SAND || at(x, y) === SIDE || at(x, y) === PLAZA) && R() < p && !nearSpot(x, y)) palmsList.push({ x: x + 0.2 + R() * 0.6, z: y + 0.2 + R() * 0.6, s: 0.8 + R() * 0.5, r: R() * 6.3 }); });
    areaLabels = K.areas;
  }
  function nearSpot(x, y) { return Object.values(spots).some(s => Math.abs(s.x - x) <= 1 && Math.abs(s.y - y) <= 1); }

  function buildGrid(o) {
    COLS = 48; ROWS = 36; reset();
    const VROADS = [5, 17, 29, 41], HROADS = [5, 17, 29];
    const BX = [[0, 4], [7, 16], [19, 28], [31, 40], [43, 47]], BY = [[0, 4], [7, 16], [19, 28], [31, 35]];
    const waterWest = { MH: 1, TG: 1 }[o.stateId];
    grid = new Array(COLS * ROWS).fill(SIDE);
    const R = rng(hashNum(o.stateId + "city"));
    VROADS.forEach(c => { for (let y = 0; y < ROWS; y++) { setT(c, y, ROAD); setT(c + 1, y, ROAD); } });
    HROADS.forEach(r => { for (let x = 0; x < COLS; x++) { setT(x, r, ROAD); setT(x, r + 1, ROAD); } });
    BY.forEach(([y0, y1], by) => BX.forEach(([x0, x1], bx) => {
      const ix0 = x0 + 1, ix1 = x1 - 1, iy0 = y0 + 1, iy1 = y1 - 1, key = bx + "," + by, cx = Math.floor((x0 + x1) / 2), cy = Math.floor((y0 + y1) / 2);
      if (key === "2,1") { fill([ix0, iy0, ix1, iy1], PLAZA); spots.board = { x: cx, y: cy, label: "Notice Board" }; [[ix0, iy0], [ix1, iy0], [ix0, iy1], [ix1, iy1]].forEach(([x, y]) => { setT(x, y, TREE); trees.push({ x, y, kind: "rain" }); }); return; }
      if (key === "3,2") {
        for (let y = iy0; y <= iy1; y++) for (let x = ix0; x <= ix1; x++) { const p = x === cx || y === cy; setT(x, y, p ? PLAZA : GRASS); if (!p && Math.abs(x - cx) > 2 && R() < 0.2) { setT(x, y, TREE); trees.push({ x, y, kind: "rain" }); } }
        spots.f = { x: cx, y: y0, label: CITY_MONUMENT[o.stateId] || "City Park" };
        if (CITY_MONUMENT[o.stateId]) { for (let y = cy - 1; y <= cy + 1; y++) for (let x = cx - 1; x <= cx + 1; x++) setT(x, y, BLD); blds.push({ x: cx - 1, y: cy - 1, w: 3, d: 3, h: 3, monument: o.stateId, big: "lm", name: CITY_MONUMENT[o.stateId] }); labels.push({ x: cx + 0.5, y: cy + 0.5, t: CITY_MONUMENT[o.stateId], c: "#e8dcc0", h: 3.6 }); }
        return;
      }
      if (bx === 0 && waterWest) { for (let y = y0; y <= y1; y++) for (let x = 0; x <= 3; x++) setT(x, y, WATER); if (by === 1) for (let x = 1; x <= 3; x++) setT(x, 11, JETTY); return; }
      const big = { "1,1": "life", "3,1": "rival", "1,2": "home", "2,2": "station", "1,0": "hall", "2,0": "fxn", "3,0": "office", "1,3": "bank", "2,3": "cafe", "3,3": "garage" }[key];
      if (big) {
        const name = big === "life" ? (LANDMARK[o.lifeId] || "Market").replace("{stall}", o.words.stall) : lotName(o, big, { hall: "Town Hall", fxn: "FXN Rentals", office: "Government Office", bank: "Bank", cafe: "Café Monsoon", garage: "City Motors" }[big]);
        const kind = { life: "shop", rival: "shop", home: "home", station: "station", hall: "hall", fxn: "fxn", office: "office", bank: "bank", cafe: "cafe", garage: "showroom" }[big];
        const floors = kind === "home" ? [2, 3, 4, 2, 2][(o.house && o.house.lvl) || 0] : kind === "cafe" ? 1 : 3;
        addBuilding({ x: ix0, y: iy0, w: ix1 - ix0 + 1, d: iy1 - iy0, h: floors, floors, style: kind, kind, big, name, door: [cx, y1], tint: R(), roof: kind === "office" || kind === "hall" || (kind === "home" && o.house && o.house.lvl >= 3) });
        labels.push({ x: cx + 0.5, y: iy0 + (iy1 - iy0) / 2, t: name, c: BIGCOL[big], h: floors + 0.6 });
        const d = { x: cx, y: y1, label: name };
        if (big === "life") spots.m = d; else if (big === "rival") spots.v = d; else if (big === "home") { spots.p = d; spots.house = { x: ix1 - 1, y: y1, label: name }; } else spots[big] = d;
        return;
      }
      fillBlock([ix0, iy0, ix1, iy1 - 1], R() < 0.4 ? "tower" : R() < 0.6 ? "shop" : "res", R);
    }));
    if (waterWest) for (let y = 0; y < ROWS; y++) for (let x = 0; x <= 3; x++) if (at(x, y) !== JETTY) setT(x, y, WATER);
    for (let i = 0; i < 26; i++) { const x = Math.floor(R() * COLS), y = Math.floor(R() * ROWS); if (at(x, y) === SIDE && !nearSpot(x, y)) palmsList.push({ x: x + 0.5, z: y + 0.5, s: 0.8 + R() * 0.4, r: R() * 6.3 }); }
  }

  function nearestWalk(t) {
    if (walk(t.x, t.y)) return t;
    for (let r = 1; r < 8; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) if (walk(t.x + dx, t.y + dy)) return { x: t.x + dx, y: t.y + dy };
    return null;
  }
  function path(a, b) {
    b = nearestWalk(b); if (!b) return [];
    if (!walk(a.x, a.y)) { const n = nearestWalk(a); if (!n) return [b]; a = n; }
    const key = (x, y) => y * COLS + x, open = [{ x: a.x, y: a.y, g: 0, f: 0 }], came = {}, gs = { [key(a.x, a.y)]: 0 };
    let guard = 0;
    while (open.length && guard++ < 9000) {
      let bi = 0; for (let i = 1; i < open.length; i++) if (open[i].f < open[bi].f) bi = i;
      const c = open.splice(bi, 1)[0];
      if (c.x === b.x && c.y === b.y) { const out = []; let k = key(c.x, c.y); while (k !== key(a.x, a.y) && k !== undefined) { out.unshift({ x: k % COLS, y: Math.floor(k / COLS) }); k = came[k]; } return out; }
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = c.x + dx, ny = c.y + dy;
        if (!walk(nx, ny) || (dx && dy && (!walk(c.x + dx, c.y) || !walk(c.x, c.y + dy)))) continue;
        const g = c.g + (dx && dy ? 1.414 : 1), k = key(nx, ny);
        if (gs[k] === undefined || g < gs[k]) { gs[k] = g; came[k] = key(c.x, c.y); open.push({ x: nx, y: ny, g, f: g + Math.hypot(nx - b.x, ny - b.y) * 1.05 }); }
      }
    }
    return [];
  }
  const toPts = arr => arr.map(t => ({ x: t.x + 0.5, z: t.y + 0.5 }));

  // ═══ 3D helpers ═══
  let vcMat, vcMatRough;
  const col = c => new THREE.Color(c);
  function srgbTex(c, rep) { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; } return t; }
  // Merge many small geometries (each with one colour) into one draw call.
  function mergeGeos(items) {
    let n = 0; const parts = items.map(it => { const g = it.geo.index ? it.geo.toNonIndexed() : it.geo; n += g.attributes.position.count; return { g, c: it.color }; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), cl = new Float32Array(n * 3);
    let o = 0;
    parts.forEach(({ g, c }) => {
      const P = g.attributes.position, N = g.attributes.normal, U = g.attributes.uv, C = g.attributes.color;
      pos.set(P.array, o * 3); if (N) nor.set(N.array, o * 3); if (U) uv.set(U.array, o * 2);
      for (let i = 0; i < P.count; i++) { const j = (o + i) * 3; if (C) { cl[j] = C.getX(i); cl[j + 1] = C.getY(i); cl[j + 2] = C.getZ(i); } else { cl[j] = c.r; cl[j + 1] = c.g; cl[j + 2] = c.b; } }
      o += P.count;
    });
    const out = new THREE.BufferGeometry();
    out.setAttribute("position", new THREE.BufferAttribute(pos, 3)); out.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); out.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); out.setAttribute("color", new THREE.BufferAttribute(cl, 3));
    return out;
  }
  // P(geometry, colour, position, rotation, scale) → a part for mergeGeos
  function P(geo, c, x, y, z, rx, ry, rz, sx, sy, sz) {
    const m = new THREE.Matrix4().compose(new THREE.Vector3(x || 0, y || 0, z || 0), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx || 0, ry || 0, rz || 0)), new THREE.Vector3(sx || 1, sy || 1, sz || 1));
    geo.applyMatrix4(m); return { geo, color: c instanceof THREE.Color ? c : col(c) };
  }
  function textSprite(text, color, scale, light) {
    const c = document.createElement("canvas"), x = c.getContext("2d");
    x.font = "800 42px Mukta, sans-serif"; const w = Math.ceil(x.measureText(text).width) + 48;
    c.width = w; c.height = 68;
    x.font = "800 42px Mukta, sans-serif";
    const r = 30; x.beginPath(); x.moveTo(r, 2); x.arcTo(w - 2, 2, w - 2, 66, r); x.arcTo(w - 2, 66, 2, 66, r); x.arcTo(2, 66, 2, 2, r); x.arcTo(2, 2, w - 2, 2, r); x.closePath();
    x.fillStyle = light ? "rgba(255,255,255,.9)" : "rgba(20,17,34,.82)"; x.fill(); x.lineWidth = 4; x.strokeStyle = color; x.stroke();
    x.fillStyle = light ? "#1b1830" : color; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(text, w / 2, 36);
    const t = srgbTex(c); t.minFilter = THREE.LinearFilter;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false }));
    s.scale.set((w / 68) * (scale || 0.5), scale || 0.5, 1); s.renderOrder = 5;
    return s;
  }
  function signPlane(text, bg, fg, w, h) {
    const c = document.createElement("canvas"), x = c.getContext("2d"); c.width = 512; c.height = Math.round(512 * h / w);
    x.fillStyle = bg; x.fillRect(0, 0, c.width, c.height);
    x.fillStyle = fg; x.textAlign = "center"; x.textBaseline = "middle";
    let fs = Math.round(c.height * 0.62); x.font = `800 ${fs}px Mukta, sans-serif`;
    while (x.measureText(text).width > c.width * 0.9 && fs > 10) { fs -= 2; x.font = `800 ${fs}px Mukta, sans-serif`; }
    x.fillText(text, c.width / 2, c.height * 0.54);
    const m = new THREE.MeshStandardMaterial({ map: srgbTex(c), emissive: 0xffffff, emissiveMap: srgbTex(c), emissiveIntensity: 0.15, roughness: 0.6 });
    m.userData.sign = true; facadeMats.push(m);
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  }
  function noiseCanvas(size, base, amp, seed) {
    const c = document.createElement("canvas"); c.width = c.height = size; const x = c.getContext("2d"), img = x.createImageData(size, size), R = rng(seed || 7);
    const b = col(base); for (let i = 0; i < size * size; i++) { const n = (R() - 0.5) * amp; img.data[i * 4] = Math.max(0, Math.min(255, b.r * 255 + n)); img.data[i * 4 + 1] = Math.max(0, Math.min(255, b.g * 255 + n)); img.data[i * 4 + 2] = Math.max(0, Math.min(255, b.b * 255 + n)); img.data[i * 4 + 3] = 255; }
    x.putImageData(img, 0, 0); return c;
  }

  // ── ground texture: asphalt with wear, kerbs, interlocking pavers, grass, sand, contact shadows at building bases ──
  function tileCanvas(size, draw) { const c = document.createElement("canvas"); c.width = c.height = size; draw(c.getContext("2d"), size); return c; }
  function groundTexture() {
    const Pp = 32, c = document.createElement("canvas"); c.width = COLS * Pp; c.height = ROWS * Pp;
    const x = c.getContext("2d"), R = rng(11);
    const pat = (cv, k) => { const p2 = x.createPattern(cv, "repeat"); if (k && p2.setTransform) p2.setTransform(new DOMMatrix().scale(k)); return p2; };
    const asphalt = tileCanvas(128, (g, S) => { g.drawImage(noiseCanvas(128, "#3f4249", 30, 1), 0, 0); const r = rng(41); for (let i = 0; i < 260; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.08)"; g.fillRect(r() * S, r() * S, 1 + r() * 2, 1 + r() * 2); } g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = 1; for (let i = 0; i < 3; i++) { g.beginPath(); let px = r() * S, py = r() * S; g.moveTo(px, py); for (let k = 0; k < 6; k++) { px += (r() - 0.5) * 22; py += (r() - 0.5) * 22; g.lineTo(px, py); } g.stroke(); } g.fillStyle = "rgba(20,20,24,.25)"; g.beginPath(); g.ellipse(r() * S, r() * S, 18, 10, r(), 0, 7); g.fill(); });
    const pavers = (base, line) => tileCanvas(64, (g, S) => { g.drawImage(noiseCanvas(64, base, 16, 2), 0, 0); g.strokeStyle = line; g.lineWidth = 1.2; for (let yy = 0; yy < S; yy += 16) for (let xx = 0; xx < S; xx += 16) { const o2 = (yy / 16) % 2 ? 8 : 0; g.beginPath(); g.moveTo(xx + o2, yy); g.lineTo(xx + o2 + 6, yy + 4); g.lineTo(xx + o2 + 10, yy); g.lineTo(xx + o2 + 16, yy + 4); g.stroke(); g.strokeRect(xx + 0.5, yy + 0.5, 16, 16); } });
    const grass = tileCanvas(64, (g, S) => { g.drawImage(noiseCanvas(64, "#5f8e3c", 46, 4), 0, 0); const r = rng(9); for (let i = 0; i < 160; i++) { g.strokeStyle = r() < 0.5 ? "rgba(140,190,90,.6)" : "rgba(40,80,30,.5)"; g.beginPath(); const px = r() * S, py = r() * S; g.moveTo(px, py); g.lineTo(px + (r() - 0.5) * 3, py - 3 - r() * 3); g.stroke(); } for (let i = 0; i < 6; i++) { g.fillStyle = ["#f2e35b", "#ffffff", "#e8628a"][i % 3]; g.fillRect(r() * S, r() * S, 2, 2); } });
    const sand = tileCanvas(64, (g, S) => { g.drawImage(noiseCanvas(64, "#e2cc97", 30, 8), 0, 0); g.strokeStyle = "rgba(160,130,80,.18)"; for (let yy = 4; yy < S; yy += 9) { g.beginPath(); g.moveTo(0, yy); for (let xx = 0; xx <= S; xx += 8) g.quadraticCurveTo(xx + 4, yy + 3, xx + 8, yy); g.stroke(); } });
    const fills = { [ROAD]: pat(asphalt), [SIDE]: pat(pavers("#b9b2a5", "rgba(80,70,60,.22)"), 0.5), [PLAZA]: pat(pavers("#d4bf98", "rgba(120,90,50,.24)"), 0.5), [GRASS]: pat(grass), [BLD]: pat(noiseCanvas(64, "#77716a", 10, 5)), [TREE]: pat(grass), [JETTY]: pat(noiseCanvas(64, "#8a6a45", 22, 7)), [SAND]: pat(sand), [BRIDGE]: pat(noiseCanvas(64, "#8f8d86", 16, 9)) };
    for (let y = 0; y < ROWS; y++) for (let xx = 0; xx < COLS; xx++) {
      const t = at(xx, y); if (t === WATER) continue;
      x.fillStyle = fills[t]; x.fillRect(xx * Pp, y * Pp, Pp, Pp);
      if (t === JETTY) { x.strokeStyle = "rgba(0,0,0,.25)"; for (let i = 4; i < Pp; i += 6) { x.beginPath(); x.moveTo(xx * Pp + i, y * Pp); x.lineTo(xx * Pp + i, y * Pp + Pp); x.stroke(); } }
      [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([dx, dy]) => { const n = at(xx + dx, y + dy), inside = xx + dx >= 0 && y + dy >= 0 && xx + dx < COLS && y + dy < ROWS; if (!inside) return;
        if (n === WATER) { x.fillStyle = t === SAND ? "rgba(255,255,255,.4)" : "#5f5c55"; if (dx) x.fillRect(xx * Pp + (dx > 0 ? Pp - 5 : 0), y * Pp, 5, Pp); else x.fillRect(xx * Pp, y * Pp + (dy > 0 ? Pp - 5 : 0), Pp, 5); }
        // contact shadow where pavement meets a building
        if (n === BLD && t !== BLD) { const g2 = dx ? x.createLinearGradient(xx * Pp + (dx > 0 ? Pp : 0), 0, xx * Pp + (dx > 0 ? Pp - 12 : 12), 0) : x.createLinearGradient(0, y * Pp + (dy > 0 ? Pp : 0), 0, y * Pp + (dy > 0 ? Pp - 12 : 12)); g2.addColorStop(0, "rgba(0,0,0,.32)"); g2.addColorStop(1, "rgba(0,0,0,0)"); x.fillStyle = g2; x.fillRect(xx * Pp, y * Pp, Pp, Pp); }
        // kerb: black-and-white painted edge where pavement meets road
        if ((t === SIDE || t === PLAZA) && n === ROAD) { for (let k = 0; k < 4; k++) { x.fillStyle = (xx + y + k) % 2 ? "#f1efe8" : "#2a2a2c"; if (dx) x.fillRect(xx * Pp + (dx > 0 ? Pp - 4 : 0), y * Pp + k * 8, 4, 8); else x.fillRect(xx * Pp + k * 8, y * Pp + (dy > 0 ? Pp - 4 : 0), 8, 4); } }
      });
      if (t === ROAD && R() < 0.035) { x.fillStyle = "#2f3136"; x.beginPath(); x.arc(xx * Pp + 16, y * Pp + 16, 5, 0, 7); x.fill(); x.strokeStyle = "rgba(255,255,255,.15)"; x.stroke(); }
    }
    // lane markings, junction boxes and zebra crossings
    const isR = (a, b) => at(a, b) === ROAD || at(a, b) === BRIDGE;
    for (let y = 0; y < ROWS; y++) for (let xx = 0; xx < COLS; xx++) {
      if (!isR(xx, y)) continue;
      const horiz = isR(xx, y + 1) && !isR(xx, y - 1) && !isR(xx, y + 2), vert = isR(xx + 1, y) && !isR(xx - 1, y) && !isR(xx + 2, y);
      x.fillStyle = "rgba(245,240,225,.9)";
      if (horiz && !vert && (xx % 2 === 0)) x.fillRect(xx * Pp + 4, (y + 1) * Pp - 1.5, Pp - 10, 3);
      if (vert && !horiz && (y % 2 === 0)) x.fillRect((xx + 1) * Pp - 1.5, y * Pp + 4, 3, Pp - 10);
      if (horiz && vert) { x.fillStyle = "rgba(245,240,225,.7)"; for (let i = 0; i < 6; i++) { x.fillRect(xx * Pp - 14 + i * 7, y * Pp - 12, 4, 9); x.fillRect(xx * Pp - 14 + i * 7, (y + 2) * Pp + 3, 4, 9); } }
      if (at(xx, y) === BRIDGE) { x.fillStyle = "rgba(255,255,255,.15)"; x.fillRect(xx * Pp, y * Pp, Pp, 1); }
    }
    const t = srgbTex(c); t.anisotropy = 8; return t;
  }

  // ── building facades: one bay × one floor, repeated with baked UVs; lit windows at night via emissiveMap ──
  function facade(kind) {
    const S = 64, c = document.createElement("canvas"), e = document.createElement("canvas"); c.width = c.height = e.width = e.height = S * 2;
    const x = c.getContext("2d"), y = e.getContext("2d"); x.scale(2, 2); y.scale(2, 2);
    y.fillStyle = "#000"; y.fillRect(0, 0, S, S);
    const wall = { res: "#f2eee6", shop: "#ece6da", tower: "#e4e6e8", colonial: "#f4ead2", warehouse: "#c9c2b4", kerala: "#f6f1e6", glass: "#9fb6c6" }[kind] || "#eeeae2";
    x.fillStyle = wall; x.fillRect(0, 0, S, S);
    x.fillStyle = "rgba(0,0,0,.05)"; for (let i = 0; i < 40; i++) x.fillRect((i * 37) % S, (i * 53) % S, 3, 2);
    const win = (wx, wy, ww, wh, frame, glass) => { x.fillStyle = frame; x.fillRect(wx - 2, wy - 2, ww + 4, wh + 4); x.fillStyle = glass; x.fillRect(wx, wy, ww, wh); x.fillStyle = "rgba(255,255,255,.18)"; x.fillRect(wx, wy, ww / 3, wh); y.fillStyle = "#ffd58a"; y.fillRect(wx, wy, ww, wh); };
    if (kind === "tower") { x.fillStyle = "#7fa0b6"; x.fillRect(4, 6, 56, 46); x.fillStyle = "#e9edf0"; x.fillRect(31, 6, 2, 46); x.fillRect(4, 28, 56, 2); y.fillStyle = "#ffd58a"; y.fillRect(6, 8, 23, 18); y.fillRect(35, 32, 23, 18); x.fillStyle = "rgba(255,255,255,.25)"; x.fillRect(6, 8, 10, 42); }
    else if (kind === "warehouse") { x.strokeStyle = "rgba(0,0,0,.18)"; for (let i = 2; i < S; i += 6) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, S); x.stroke(); } x.fillStyle = "#8f877a"; x.fillRect(0, 54, S, 10); }
    else if (kind === "colonial") { x.fillStyle = "#3f6b4f"; x.beginPath(); x.moveTo(18, 52); x.lineTo(18, 24); x.arc(32, 24, 14, Math.PI, 0); x.lineTo(46, 52); x.closePath(); x.fill(); x.fillStyle = "#2a3a40"; x.fillRect(22, 24, 20, 26); y.fillStyle = "#ffd58a"; y.fillRect(22, 24, 20, 26); x.fillStyle = "#3f6b4f"; x.fillRect(31, 24, 2, 26); x.fillStyle = "#cbb88f"; x.fillRect(0, 58, S, 6); }
    else if (kind === "kerala" || kind === "res") { win(18, 18, 28, 26, "#6b4a2f", "#2e3b45"); x.fillStyle = "#3f7a5a"; x.fillRect(10, 18, 7, 26); x.fillRect(47, 18, 7, 26); x.fillStyle = "#cfc6b4"; x.fillRect(12, 10, 40, 4); if (kind === "res") { x.fillStyle = "#9a9384"; x.fillRect(4, 50, 56, 3); for (let i = 6; i < 60; i += 6) x.fillRect(i, 50, 2, 12); } }
    else { win(14, 14, 36, 30, "#5b5f66", "#355266"); x.fillStyle = "#d0c9bc"; x.fillRect(10, 8, 44, 4); x.fillStyle = "#b7b0a2"; x.fillRect(44, 48, 12, 8); }
    // monsoon weathering: soft streaks under sills and a darker band at the floor line
    if (kind !== "tower" && kind !== "glass") {
      const r = rng(kind.length * 7);
      for (let i = 0; i < 5; i++) { const sx2 = 8 + r() * 48, g = x.createLinearGradient(0, 44, 0, 64); g.addColorStop(0, "rgba(70,65,55,.14)"); g.addColorStop(1, "rgba(70,65,55,0)"); x.fillStyle = g; x.fillRect(sx2, 44, 2 + r() * 4, 20); }
      const gb = x.createLinearGradient(0, 56, 0, 64); gb.addColorStop(0, "rgba(0,0,0,0)"); gb.addColorStop(1, "rgba(60,55,45,.18)"); x.fillStyle = gb; x.fillRect(0, 56, 64, 8);
      if (kind !== "warehouse") { x.fillStyle = "rgba(255,255,255,.35)"; x.fillRect(10, 8, 44, 2); x.fillStyle = "rgba(0,0,0,.16)"; x.fillRect(12, 12, 40, 3); }
    }
    x.fillStyle = wall; x.fillRect(0, 0, 3, 3);
    const map = srgbTex(c, true), em = srgbTex(e, true);
    const m = new THREE.MeshStandardMaterial({ map, emissiveMap: em, emissive: 0xffffff, emissiveIntensity: 0, vertexColors: true, roughness: 0.88, metalness: kind === "tower" ? 0.15 : 0 });
    facadeMats.push(m); return m;
  }
  // a box whose side UVs repeat one texture tile per 0.8 m bay and per floor
  function facadeBox(w, h, d, bay, floorH) {
    const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
    for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
      const k = f * 4 + i; if (f === 2 || f === 3) { uv.setXY(k, 0.01, 0.01); continue; }
      const span = f < 2 ? d : w; uv.setXY(k, uv.getX(k) * Math.max(1, Math.round(span / bay)), uv.getY(k) * Math.max(1, Math.round(h / floorH)));
    }
    return g;
  }
  function hipRoof(w, d, h) { const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1); g.rotateY(Math.PI / 4); g.scale(w * 1.12, h, d * 1.12); g.translate(0, h / 2, 0); return g; }

  // ═══ People ═══
  // People are built by js/people.js (realistic proportions, textured faces, many hair and clothing styles).
  const PEOPLE = window.AE_PEOPLE;
  function personLook(av, outfit) {
    const a = PEOPLE.normalize(av || {});
    return { a, skin: SKIN[a.skin] || SKIN[3], hairC: HAIRC[a.hairColor] || HAIRC[0], height: a.height, weight: a.weight, small: !!(av && av.small), o: outfit || PEOPLE.basics(a), shoeAccent: PEOPLE.CLOTH[a.topC] };
  }
  function person(look, hi) { return PEOPLE.build({ THREE, P, mergeGeos, col, vcMat, srgbTex }, look, !!hi); }

  function addFig(id, kind, av, outfit, name, x, z) {
    const lab = document.createElement("div"); lab.className = "lab " + kind;
    lab.innerHTML = `<div class="bub" hidden></div><span>${esc(name)}</span>`;
    labelLayer.appendChild(lab);
    const f = { id, kind, av, outfit, name, x, z, path: [], heading: 0, ph: Math.random() * 6, moving: false, lab, H: 0.7 };
    if (ok3d) { f.mesh = person(personLook(av, outfit), id === "me"); f.mesh.group.userData.figId = id; f.H = f.mesh.H; scene.add(f.mesh.group); place(f); }
    figs[id] = f; return f;
  }
  function removeFig(id) { const f = figs[id]; if (!f) return; if (f.mesh && f.mesh.group.parent) f.mesh.group.parent.remove(f.mesh.group); if (f.veh) scene.remove(f.veh.group); if (f.parked) scene.remove(f.parked.group); if (f.box && f.box.parent) f.box.parent.remove(f.box); f.lab.remove(); delete figs[id]; }
  function setLookFig(id, av, outfit) {
    const f = figs[id]; if (!f) return;
    f.av = av || f.av; f.outfit = outfit;
    if (!ok3d) return;
    const parent = f.mesh.group.parent || scene; parent.remove(f.mesh.group);
    f.mesh = person(personLook(f.av, outfit), id === "me"); f.mesh.group.userData.figId = id; f.H = f.mesh.H;
    parent.add(f.mesh.group); if (f.veh) seatPerson(f); f.H = figH(f); place(f);
  }
  function place(f) {
    if (!f.mesh) return;
    if (f.veh) { const g = f.veh.group; g.position.set(f.x, f.ride || 0, f.z); g.rotation.y = f.heading; g.rotation.z = f.lean || 0; }
    else { f.mesh.group.position.set(f.x, f.y || 0, f.z); f.mesh.group.rotation.y = f.heading + (f.twirl || 0); }
  }

  // ═══ Vehicles you can own (and the FXN scooter) ═══
  // Speeds are multiples of walking speed. Two-wheelers carry the rider; in cars the label floats above the roof.
  const VEH = { cycle: { mult: 1.6, two: true, seat: 0.3, seatZ: -0.07, label: "Bicycle" }, scooter: { mult: 2.2, two: true, seat: 0.31, seatZ: -0.1, label: "Scooter" }, bike: { mult: 2.6, two: true, seat: 0.33, seatZ: -0.1, label: "Motorbike" }, car: { mult: 2.8, car: true, label: "Car" }, suv: { mult: 3.0, car: true, label: "SUV" },
    flyscooter: { mult: 3.4, two: true, seat: 0.31, seatZ: -0.1, fly: 1.8, label: "Flying scooter" }, hovercar: { mult: 3.9, car: true, fly: 2.2, label: "Hover car" } };
  const isFly = t => !!(t && VEH[t] && VEH[t].fly);
  // rooftop heights per tile, so flying vehicles rise over buildings
  let hmap = null;
  function roofAt(x, z) { if (!hmap) return 0; const tx = Math.floor(x), tz = Math.floor(z); return tx < 0 || tz < 0 || tx >= COLS || tz >= ROWS ? 0 : hmap[tz * COLS + tx]; }
  let glowMat = null;
  const glow = () => glowMat || (glowMat = new THREE.MeshBasicMaterial({ color: 0x5ff6ff }));
  const VCOL = ["#c0392b", "#2f73b8", "#f2f2f2", "#1b1b1b", "#f4a52b", "#2d8a55", "#8e44ad", "#ff4f9a"];
  const vehMult = t => (t && VEH[t] ? VEH[t].mult : 1);
  let wheelGeo = null, wheelMat = null, boxTexMat = null;
  function fxnBoxMesh() {
    if (!boxTexMat) {
      const c = document.createElement("canvas"); c.width = 128; c.height = 96; const x = c.getContext("2d");
      x.fillStyle = "#ff4f9a"; x.fillRect(0, 0, 128, 96); x.fillStyle = "#ffffff"; x.fillRect(0, 40, 128, 8);
      x.font = "900 34px Mukta, sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillStyle = "#ffffff"; x.fillText("FXN", 64, 24); x.font = "800 14px Mukta, sans-serif"; x.fillText("fashion in minutes", 64, 72);
      const t = srgbTex(c); boxTexMat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 });
    }
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.145, 0.17), boxTexMat); m.castShadow = true; return m;
  }
  function vehRig(type, color, box) {
    const V = VEH[type] || VEH.scooter, c = col(color || "#c0392b"), dark = col("#1e1e22"), chrome = col("#c9ccd2"), parts = [], grp = new THREE.Group(), wheels = [];
    grp.rotation.order = "YXZ";
    if (!wheelGeo) { wheelGeo = mergeGeos([P(new THREE.CylinderGeometry(1, 1, 0.5, 14), col("#151515"), 0, 0, 0, 0, 0, Math.PI / 2), P(new THREE.CylinderGeometry(0.55, 0.55, 0.52, 10), col("#8d9096"), 0, 0, 0, 0, 0, Math.PI / 2)]); wheelMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.6 }); }
    const wheel = (x, z, r, w) => { const m = new THREE.Mesh(wheelGeo, wheelMat); m.scale.set(w / 0.5, r, r); m.position.set(x, r, z); m.castShadow = true; grp.add(m); wheels.push(m); };
    if (type === "cycle") {
      wheel(0, 0.23, 0.12, 0.03); wheel(0, -0.23, 0.12, 0.03);
      parts.push(P(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 6), c, 0, 0.2, 0.02, 1.2, 0, 0), P(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 6), c, 0, 0.27, -0.03, 0, 0, 0), P(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), c, 0, 0.18, -0.13, -0.9, 0, 0), P(new THREE.CylinderGeometry(0.012, 0.012, 0.3, 6), c, 0, 0.24, 0.19, 0.25, 0, 0));
      parts.push(P(new THREE.BoxGeometry(0.07, 0.025, 0.12), dark, 0, 0.3, -0.07), P(new THREE.CylinderGeometry(0.01, 0.01, 0.3, 6), dark, 0, 0.37, 0.21, 0, 0, Math.PI / 2), P(new THREE.CylinderGeometry(0.035, 0.035, 0.02, 10), dark, 0, 0.11, 0, 0, 0, Math.PI / 2));
    } else if (type === "scooter") {
      wheel(0, 0.24, 0.085, 0.06); wheel(0, -0.22, 0.085, 0.06);
      parts.push(P(new THREE.BoxGeometry(0.16, 0.05, 0.3), dark, 0, 0.12, 0.02), P(new THREE.BoxGeometry(0.21, 0.19, 0.3), c, 0, 0.21, -0.15), P(new THREE.CapsuleGeometry(0.105, 0.12, 4, 10), c, 0, 0.2, -0.17, Math.PI / 2, 0, 0, 1, 1, 0.9));
      parts.push(P(new THREE.BoxGeometry(0.19, 0.045, 0.27), dark, 0, 0.31, -0.13), P(new THREE.BoxGeometry(0.2, 0.3, 0.05), c, 0, 0.26, 0.2, -0.22, 0, 0), P(new THREE.CylinderGeometry(0.018, 0.018, 0.22, 6), dark, 0, 0.37, 0.23, -0.2, 0, 0));
      parts.push(P(new THREE.BoxGeometry(0.32, 0.03, 0.04), dark, 0, 0.46, 0.25), P(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 12), col("#fff6d6"), 0, 0.42, 0.28, Math.PI / 2, 0, 0), P(new THREE.BoxGeometry(0.12, 0.04, 0.08), c, 0, 0.1, 0.26));
    } else if (type === "bike") {
      wheel(0, 0.28, 0.115, 0.06); wheel(0, -0.27, 0.115, 0.07);
      parts.push(P(new THREE.SphereGeometry(0.1, 12, 8), c, 0, 0.34, 0.07, 0, 0, 0, 0.8, 0.6, 1.3), P(new THREE.BoxGeometry(0.14, 0.13, 0.2), dark, 0, 0.2, 0.0), P(new THREE.BoxGeometry(0.15, 0.05, 0.24), col("#3a2a1e"), 0, 0.33, -0.12));
      parts.push(P(new THREE.CylinderGeometry(0.02, 0.025, 0.42, 6), chrome, 0.09, 0.14, -0.15, Math.PI / 2 - 0.15, 0, 0), P(new THREE.CylinderGeometry(0.016, 0.016, 0.28, 6), chrome, 0, 0.3, 0.24, -0.35, 0, 0), P(new THREE.BoxGeometry(0.34, 0.025, 0.03), dark, 0, 0.44, 0.22));
      parts.push(P(new THREE.CylinderGeometry(0.045, 0.045, 0.04, 14), chrome, 0, 0.38, 0.3, Math.PI / 2, 0, 0), P(new THREE.CylinderGeometry(0.04, 0.04, 0.042, 14), col("#fff6d6"), 0, 0.38, 0.31, Math.PI / 2, 0, 0), P(new THREE.BoxGeometry(0.16, 0.03, 0.18), c, 0, 0.25, -0.3));
    } else if (type === "flyscooter") {
      parts.push(P(new THREE.CapsuleGeometry(0.1, 0.42, 4, 12), c, 0, 0.2, -0.02, Math.PI / 2, 0, 0, 1, 1, 0.85), P(new THREE.BoxGeometry(0.19, 0.045, 0.27), dark, 0, 0.31, -0.12), P(new THREE.BoxGeometry(0.2, 0.26, 0.05), c, 0, 0.3, 0.2, -0.3, 0, 0), P(new THREE.BoxGeometry(0.32, 0.03, 0.04), dark, 0, 0.46, 0.25), P(new THREE.BoxGeometry(0.46, 0.03, 0.1), chrome, 0, 0.16, -0.05));
      [[-0.22, 0.18], [0.22, 0.18], [-0.22, -0.24], [0.22, -0.24]].forEach(([x, z]) => parts.push(P(new THREE.CylinderGeometry(0.07, 0.06, 0.06, 14), dark, x, 0.13, z)));
      [[-0.22, 0.18], [0.22, 0.18], [-0.22, -0.24], [0.22, -0.24]].forEach(([x, z]) => { const g2 = new THREE.Mesh(new THREE.CircleGeometry(0.06, 14), glow()); g2.rotation.x = Math.PI / 2; g2.position.set(x, 0.095, z); grp.add(g2); });
    } else if (type === "hovercar") {
      parts.push(P(new THREE.CapsuleGeometry(0.3, 0.75, 6, 16), c, 0, 0.24, 0, Math.PI / 2, 0, 0, 1.05, 1, 0.42), P(new THREE.BoxGeometry(0.03, 0.16, 0.22), c, 0, 0.36, -0.55, 0.4, 0, 0), P(new THREE.BoxGeometry(0.5, 0.02, 0.16), c, 0, 0.3, -0.6), P(new THREE.SphereGeometry(0.27, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), col("#1d2a36"), 0, 0.32, -0.05, 0, 0, 0, 1, 0.75, 1.5), P(new THREE.BoxGeometry(0.66, 0.03, 0.9), chrome, 0, 0.14, 0));
      [[-0.3, 0.4], [0.3, 0.4], [-0.3, -0.4], [0.3, -0.4]].forEach(([x, z]) => { parts.push(P(new THREE.CylinderGeometry(0.11, 0.09, 0.07, 16), dark, x, 0.12, z)); const g2 = new THREE.Mesh(new THREE.CircleGeometry(0.09, 16), glow()); g2.rotation.x = Math.PI / 2; g2.position.set(x, 0.08, z); grp.add(g2); });
      [-1, 1].forEach(sx => { const s2 = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.8), glow()); s2.position.set(sx * 0.31, 0.24, 0); grp.add(s2); });
    } else {
      const S = type === "suv" ? 1.12 : 1, W = 0.62 * S, L = 1.32 * S, r = 0.11 * S;
      [[1, 1], [-1, 1], [1, -1], [-1, -1]].forEach(([sx, sz]) => wheel(sx * (W / 2 - 0.02), sz * L * 0.32, r, 0.08));
      parts.push(P(new THREE.BoxGeometry(W, 0.26 * S, L), c, 0, r + 0.12 * S, 0), P(new THREE.BoxGeometry(W - 0.02, 0.06, L * 0.3), c, 0, r + 0.27 * S, L * 0.33, -0.08, 0, 0));
      parts.push(P(new THREE.BoxGeometry(W - 0.06, 0.24 * S, L * (type === "suv" ? 0.66 : 0.55)), col("#26323b"), 0, r + 0.37 * S, type === "suv" ? -0.08 : -0.06), P(new THREE.BoxGeometry(W - 0.04, 0.04, L * (type === "suv" ? 0.62 : 0.5)), c, 0, r + 0.5 * S, type === "suv" ? -0.09 : -0.07));
      [-1, 1].forEach(sx => { parts.push(P(new THREE.BoxGeometry(0.12, 0.05, 0.02), col("#fff6d6"), sx * W * 0.32, r + 0.15 * S, L / 2 + 0.005), P(new THREE.BoxGeometry(0.1, 0.05, 0.02), col("#d0302a"), sx * W * 0.34, r + 0.17 * S, -L / 2 - 0.005), P(new THREE.BoxGeometry(0.03, 0.03, 0.06), dark, sx * (W / 2 + 0.02), r + 0.32 * S, L * 0.12)); });
      parts.push(P(new THREE.BoxGeometry(W * 0.5, 0.05, 0.02), dark, 0, r + 0.08, L / 2 + 0.006), P(new THREE.BoxGeometry(W + 0.02, 0.05, 0.05), dark, 0, r + 0.02, L / 2), P(new THREE.BoxGeometry(W + 0.02, 0.05, 0.05), dark, 0, r + 0.02, -L / 2));
      if (type === "suv") parts.push(P(new THREE.BoxGeometry(0.03, 0.03, L * 0.55), dark, W * 0.38, r + 0.54 * S, -0.09), P(new THREE.BoxGeometry(0.03, 0.03, L * 0.55), dark, -W * 0.38, r + 0.54 * S, -0.09));
    }
    const body = new THREE.Mesh(mergeGeos(parts), vcMat); body.castShadow = true; grp.add(body);
    const sh = new THREE.Mesh(new THREE.PlaneGeometry(V.car ? 0.7 : 0.26, V.car ? 1.4 : 0.6), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false })); sh.rotation.x = -Math.PI / 2; sh.position.y = 0.012; grp.add(sh);
    if (V.fly) { sh.material.opacity = 0.18; sh.userData.ground = true; }
    let bx = null; if (box) { bx = fxnBoxMesh(); bx.position.set(0, (type === "scooter" ? 0.43 : 0.42), -0.32); grp.add(bx); }
    return { group: grp, wheels, type, spec: V, box: bx, roll: 0, shadow: sh };
  }
  function seatPerson(f) {
    if (!f.veh || !f.mesh) return;
    const V = f.veh.spec, M = f.mesh;
    M.group.position.set(0, V.car ? 0 : V.seat - M.legL, V.car ? 0 : V.seatZ); M.group.rotation.set(0, 0, 0);
    M.group.visible = !V.car; if (M.shadow) M.shadow.visible = false;
  }
  function setFigVehicle(f, spec) {
    const key = spec ? spec.type + (spec.color || "") + (spec.box ? "b" : "") : "";
    if ((f.vehKey || "") === key) return;
    f.vehKey = key; f.vehType = spec && VEH[spec.type] ? spec.type : null;
    if (f.veh) { scene.remove(f.veh.group); f.veh = null; }
    if (!ok3d || !f.mesh) return;
    if (f.mesh.group.parent && f.mesh.group.parent !== scene) f.mesh.group.parent.remove(f.mesh.group);
    if (!f.vehType) { scene.add(f.mesh.group); f.mesh.group.visible = true; if (f.mesh.shadow) f.mesh.shadow.visible = true; f.lean = 0; place(f); return; }
    f.veh = vehRig(spec.type, spec.color, spec.box); f.veh.group.add(f.mesh.group); seatPerson(f); scene.add(f.veh.group);
    f.H = f.veh.spec.car ? 0.72 : f.mesh.H + f.veh.spec.seat - f.mesh.legL; place(f);
  }
  function figH(f) { return f.veh ? (f.veh.spec.car ? 0.72 : f.mesh.H + f.veh.spec.seat - f.mesh.legL) : f.mesh ? f.mesh.H : 0.7; }

  // ═══ Scene ═══
  function makeSky() {
    skyU = { top: { value: col("#4f8fd8") }, bot: { value: col("#f6dcae") }, off: { value: 10 }, exp: { value: 0.7 }, sunDir: { value: new THREE.Vector3(0.3, 0.6, 0.4).normalize() }, sunC: { value: col("#fff1d8") }, sunK: { value: 1 } };
    const m = new THREE.ShaderMaterial({ uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
      vertexShader: "varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: "uniform vec3 top; uniform vec3 bot; uniform float off; uniform float exp; uniform vec3 sunDir; uniform vec3 sunC; uniform float sunK; varying vec3 vW; void main(){ vec3 d = normalize(vW - cameraPosition + vec3(0.0, off, 0.0)); float h = d.y; vec3 c = mix(bot, top, max(pow(max(h, 0.0), exp), 0.0)); float s = max(dot(d, sunDir), 0.0); c += sunC * (pow(s, 900.0) * 6.0 + pow(s, 12.0) * 0.35 + pow(s, 3.0) * 0.12) * sunK; c = mix(c, bot * 0.92, smoothstep(0.0, -0.25, h)); gl_FragColor = vec4(c, 1.0); }" });
    sky = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), m); sky.renderOrder = -1; scene.add(sky);
    makeClouds();
    const sp = new Float32Array(600 * 3), R = rng(5); for (let i = 0; i < 600; i++) { const t = R() * 6.28, p = R() * 1.3; sp[i * 3] = Math.cos(t) * Math.cos(p) * 170; sp[i * 3 + 1] = Math.sin(p) * 170 + 5; sp[i * 3 + 2] = Math.sin(t) * Math.cos(p) * 170; }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, sizeAttenuation: true, transparent: true, opacity: 0, fog: false, depthWrite: false })); scene.add(stars);
  }
  // soft cumulus clouds drifting over the backwaters (sprites, tinted by the time of day)
  let clouds = [], cloudMat = null;
  function makeClouds() {
    const c = document.createElement("canvas"); c.width = 256; c.height = 128; const x = c.getContext("2d"), R = rng(31);
    for (let i = 0; i < 26; i++) { const cx = 40 + R() * 176, cy = 70 - R() * 30 + Math.abs(cx - 128) * 0.12, r = 18 + R() * 30, g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, "rgba(255,255,255,.95)"); g.addColorStop(0.55, "rgba(255,255,255,.55)"); g.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); }
    const g2 = x.createLinearGradient(0, 40, 0, 110); g2.addColorStop(0, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(120,130,160,.35)"); x.globalCompositeOperation = "source-atop"; x.fillStyle = g2; x.fillRect(0, 0, 256, 128);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    cloudMat = new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, fog: false, opacity: 0.92 });
    const R2 = rng(57);
    for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(cloudMat); const a = R2() * 6.28, d = 70 + R2() * 80, sc = 22 + R2() * 30; s.position.set(COLS / 2 + Math.cos(a) * d, 26 + R2() * 26, ROWS / 2 + Math.sin(a) * d); s.scale.set(sc, sc * 0.45, 1); s.renderOrder = -0.5; scene.add(s); clouds.push(s); }
  }
  // image-based light: the sky is rendered into an environment map so water, glass, cars and skin pick up its colour
  let pmrem = null, envScene = null, envRT = null, envHour = -9;
  function updateEnv(h) {
    if (!renderer || Math.abs(h - envHour) < 0.75 && envHour >= 0) return; envHour = h;
    try {
      if (!pmrem) { pmrem = new THREE.PMREMGenerator(renderer); envScene = new THREE.Scene(); const sk = new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), sky.material); envScene.add(sk); const gr = new THREE.Mesh(new THREE.CircleGeometry(48, 24), new THREE.MeshBasicMaterial({ color: 0x6f6a5c })); gr.rotation.x = -Math.PI / 2; gr.position.y = -2; envScene.add(gr); envScene.userData.ground = gr; }
      envScene.userData.ground.material.color.copy(hemi.groundColor).multiplyScalar(0.6 + sun.intensity * 0.15);
      const old = envRT; envRT = pmrem.fromScene(envScene, 0.02); scene.environment = envRT.texture; if (old) old.dispose();
    } catch (e) { pmrem = null; }
  }
  function makeWater() {
    const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), img = x.createImageData(128, 128), R = rng(3);
    const hgt = new Float32Array(128 * 128); for (let i = 0; i < 40; i++) { const cx = R() * 128, cy = R() * 128, r = 6 + R() * 18; for (let y = 0; y < 128; y++) for (let xx = 0; xx < 128; xx++) { let dx = Math.abs(xx - cx); dx = Math.min(dx, 128 - dx); let dy = Math.abs(y - cy); dy = Math.min(dy, 128 - dy); hgt[y * 128 + xx] += Math.max(0, 1 - Math.hypot(dx, dy) / r); } }
    for (let y = 0; y < 128; y++) for (let xx = 0; xx < 128; xx++) { const hx = hgt[y * 128 + (xx + 1) % 128] - hgt[y * 128 + (xx + 127) % 128], hy = hgt[((y + 1) % 128) * 128 + xx] - hgt[((y + 127) % 128) * 128 + xx], i = (y * 128 + xx) * 4; img.data[i] = 128 + hx * 60; img.data[i + 1] = 128 + hy * 60; img.data[i + 2] = 255; img.data[i + 3] = 255; }
    x.putImageData(img, 0, 0);
    waterTex = new THREE.CanvasTexture(c); waterTex.wrapS = waterTex.wrapT = THREE.RepeatWrapping; waterTex.repeat.set(60, 60);
    water = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: isKochi ? 0x14545a : 0x1f5f78, roughness: 0.06, metalness: 0.1, envMapIntensity: 1.25, normalMap: waterTex, normalScale: new THREE.Vector2(0.55, 0.55) }));
    water.rotation.x = -Math.PI / 2; water.position.set(COLS / 2, -0.07, ROWS / 2); water.receiveShadow = true; scene.add(water);
  }
  function makeOuterLand(o) {
    const m = new THREE.MeshStandardMaterial({ map: srgbTex(noiseCanvas(64, "#7d8a5c", 30, 21), true), roughness: 1 });
    m.map.repeat.set(40, 40);
    const add = (x0, z0, x1, z1) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), m); p.rotation.x = -Math.PI / 2; p.position.set((x0 + x1) / 2, -0.015, (z0 + z1) / 2); p.receiveShadow = true; scene.add(p); };
    if (isKochi) { add(36, -160, 220, 0); add(36, ROWS, 220, 220); add(COLS, 0, 220, ROWS); }
    else { const w0 = ({ MH: 1, TG: 1 }[o.stateId]) ? 4 : -160; add(w0, -160, 220, 0); add(w0, ROWS, 220, 220); add(COLS, 0, 220, ROWS); if (w0 < 0) add(-160, 0, 0, ROWS); }
    // distant skyline so the city doesn't end abruptly
    const R = rng(77), parts = [];
    for (let i = 0; i < 140; i++) {
      const a = R(), x = isKochi ? 66 + R() * 50 : (a < 0.5 ? COLS + 3 + R() * 40 : 5 + R() * 40), z = isKochi ? -40 + R() * 130 : (a < 0.5 ? -30 + R() * 100 : (R() < 0.5 ? -4 - R() * 30 : ROWS + 4 + R() * 30));
      const h = 1 + R() * (R() < 0.15 ? 9 : 4), w = 1 + R() * 2.5;
      parts.push(P(new THREE.BoxGeometry(w, h, w), col("#c9c3b8").lerp(col("#8a93a0"), R()), x, h / 2, z));
    }
    const sky2 = new THREE.Mesh(mergeGeos(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 })); scene.add(sky2);
  }
  let lmParts = [];
  function renderCity(o) {
    lmParts = [];
    hmap = new Float32Array(COLS * ROWS);
    blds.forEach(b => { const top = (b.h || 1) + (b.roof ? 0.9 : 0.4); for (let y = b.y; y < b.y + b.d; y++) for (let x = b.x; x < b.x + b.w; x++) if (x >= 0 && y >= 0 && x < COLS && y < ROWS) hmap[y * COLS + x] = Math.max(hmap[y * COLS + x], top); });
    if (isKochi && K.metro) for (let y = 0; y < ROWS; y++) for (let x = K.metro.x - 1; x <= K.metro.x; x++) hmap[y * COLS + x] = Math.max(hmap[y * COLS + x], 3.1);
    const fac = {}, getFac = k => fac[k] || (fac[k] = { mat: facade(k), parts: [] }), roofParts = [], propParts = [];
    const R = rng(hashNum(o.stateId + "paint"));
    const pastel = ["#f3e6d2", "#e9d7c4", "#d9e6dd", "#e6dcef", "#f1e0b5", "#dbe9f3", "#f2d6cf", "#e8e4dc"];
    blds.forEach(b => {
      const cx = b.x + b.w / 2, cz = b.y + b.d / 2, w = b.w * 0.92, d = b.d * 0.92, h = b.h;
      if (b.monument) return monument(b, cx, cz);
      if (b.big && b.big !== "lm" || b.kind) return landmark(b, cx, cz, w, d, h, o);
      const style = b.style === "res" ? (b.floors >= 4 ? "res" : "kerala") : b.style;
      const tint = col(style === "tower" ? "#ffffff" : pastel[Math.floor(b.tint * pastel.length)]);
      getFac(style).parts.push(P(facadeBox(w, h, d, 0.8, 1.0), tint, cx, h / 2, cz));
      if (b.style === "shop" || (b.style === "res" && b.floors >= 3)) getFac("shopfront").parts.push(P(facadeBox(w + 0.04, 0.9, d + 0.04, 0.8, 0.9), col(["#c84b3c", "#2f6f8f", "#e0a530", "#4b8b3b", "#7a3f8f"][Math.floor(b.tint * 5)]), cx, 0.45, cz));
      const ledge = tint.clone().multiplyScalar(0.86);
      for (let k = 1; k < Math.round(h); k++) propParts.push(P(new THREE.BoxGeometry(w + 0.06, 0.035, d + 0.06), ledge, cx, k * 1.0, cz));
      if (b.roof) roofParts.push(P(hipRoof(w, d, 0.55 + b.w * 0.08), col(["#b5532f", "#a8472a", "#c0613a", "#8f3f26"][Math.floor(b.tint * 4)]), cx, h, cz));
      else {
        propParts.push(P(new THREE.BoxGeometry(w - 0.02, 0.05, d - 0.02), col("#8f897e"), cx, h + 0.025, cz));
        [[0, d / 2], [0, -d / 2], [w / 2, 0], [-w / 2, 0]].forEach(([ox, oz]) => propParts.push(P(new THREE.BoxGeometry(ox ? 0.06 : w + 0.06, 0.2, oz ? 0.06 : d + 0.06), ledge, cx + ox, h + 0.1, cz + oz)));
        if (R() < 0.65) { const tx = cx + (R() - 0.5) * w * 0.5, tz = cz + (R() - 0.5) * d * 0.5; propParts.push(P(new THREE.CylinderGeometry(0.17, 0.17, 0.34, 14), col("#1e1e1e"), tx, h + 0.22, tz), P(new THREE.CylinderGeometry(0.08, 0.17, 0.06, 14), col("#2a2a2a"), tx, h + 0.42, tz), P(new THREE.BoxGeometry(0.3, 0.05, 0.3), col("#7d776c"), tx, h + 0.05, tz)); }
        if (R() < 0.3) propParts.push(P(new THREE.BoxGeometry(0.3, 0.22, 0.2), col("#d9d9d4"), cx + (R() - 0.5) * w * 0.5, h + 0.16, cz + (R() - 0.5) * d * 0.5));
        if (R() < 0.25) propParts.push(P(new THREE.CylinderGeometry(0.16, 0.02, 0.06, 12), col("#e8e8e8"), cx + (R() - 0.5) * w * 0.4, h + 0.35, cz + (R() - 0.5) * d * 0.4, 0.6, 0, 0));
      }
    });
    Object.keys(fac).forEach(k => { if (k === "shopfront") return; const m = new THREE.Mesh(mergeGeos(fac[k].parts), fac[k].mat); m.castShadow = m.receiveShadow = true; scene.add(m); });
    if (fac.shopfront) { const sm = facadeShop(); const m = new THREE.Mesh(mergeGeos(fac.shopfront.parts), sm); m.receiveShadow = true; scene.add(m); }
    if (roofParts.length) { const m = new THREE.Mesh(mergeGeos(roofParts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8, map: roofTex() })); m.castShadow = true; m.receiveShadow = true; scene.add(m); }
    if (propParts.length || lmParts.length) { const m = new THREE.Mesh(mergeGeos(propParts.concat(lmParts)), vcMatRough); m.castShadow = true; m.receiveShadow = true; scene.add(m); }
  }
  function facadeShop() {
    const S = 64, c = document.createElement("canvas"), e = document.createElement("canvas"); c.width = c.height = e.width = e.height = S;
    const x = c.getContext("2d"), y = e.getContext("2d");
    x.fillStyle = "#ffffff"; x.fillRect(0, 0, S, 16); x.fillStyle = "#d6d2ca"; x.fillRect(0, 16, S, 48);
    x.fillStyle = "#3a3f46"; x.fillRect(4, 20, 56, 44); x.fillStyle = "#e8d9a8"; x.fillRect(8, 24, 48, 36); x.fillStyle = "rgba(0,0,0,.2)"; for (let i = 26; i < 60; i += 4) x.fillRect(8, i, 48, 1);
    y.fillStyle = "#000"; y.fillRect(0, 0, S, S); y.fillStyle = "#fff"; y.fillRect(0, 0, S, 16); y.fillStyle = "#ffcc80"; y.fillRect(8, 24, 48, 36);
    const m = new THREE.MeshStandardMaterial({ map: srgbTex(c, true), emissiveMap: srgbTex(e, true), emissive: 0xffffff, emissiveIntensity: 0, vertexColors: true, roughness: 0.8 });
    facadeMats.push(m); return m;
  }
  // Mangalore-tile roof: curved clay rows with soft shading and moss
  function roofTex() { const c = document.createElement("canvas"); c.width = c.height = 128; const x = c.getContext("2d"), r = rng(23); x.fillStyle = "#ffffff"; x.fillRect(0, 0, 128, 128); for (let j = 0; j < 128; j += 12) for (let i = 0; i < 128; i += 14) { const o = (j / 12) % 2 ? 7 : 0, g = x.createLinearGradient(i + o, 0, i + o + 14, 0); g.addColorStop(0, "rgba(0,0,0,.22)"); g.addColorStop(0.5, "rgba(255,255,255,.08)"); g.addColorStop(1, "rgba(0,0,0,.2)"); x.fillStyle = g; x.fillRect(i + o, j, 14, 12); x.fillStyle = "rgba(0,0,0,.28)"; x.fillRect(i + o, j + 10, 14, 2); if (r() < 0.06) { x.fillStyle = "rgba(60,90,40,.35)"; x.fillRect(i + o, j, 14, 12); } } const t = srgbTex(c, true); t.repeat.set(3, 3); return t; }

  // Landmark buildings get their own shape and a signboard
  function landmark(b, cx, cz, w, d, h, o) {
    const grp = new THREE.Group(); scene.add(grp);
    const add = (geo, c, x, y, z, mat) => { const m = new THREE.Mesh(geo, mat || new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 })); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; grp.add(m); return m; };
    const kind = b.kind || b.style, door = b.door || [Math.floor(cx), b.y + b.d];
    const face = door[1] >= b.y + b.d ? "s" : door[1] < b.y ? "n" : door[0] < b.x ? "w" : "e";
    const fp = { s: [cx, cz + d / 2 + 0.02, 0], n: [cx, cz - d / 2 - 0.02, Math.PI], w: [cx - w / 2 - 0.02, cz, -Math.PI / 2], e: [cx + w / 2 + 0.02, cz, Math.PI / 2] }[face];
    const fw = face === "s" || face === "n" ? w : d;
    const wallC = { showroom: "#e6edf2", hall: "#f4f1ea", hospital: "#f2f4f5", mall: "#d9e4ea", bank: "#e9e3d6", cafe: "#f3e3c8", fxn: "#2a1730", stadium: "#e9e6df", tower: "#cfd8df", market: "#e8d6b5", office: "#efe0b8", station: "#efe3c7", warehouse: "#c9c2b4", church: "#f7f5ef", colonial: "#f4e6c4", home: o.wallColor || "#efe4cf", shop: "#e7dccb" }[kind] || "#e7dccb";
    const fstyle = kind === "tower" || kind === "mall" || kind === "hospital" || kind === "showroom" ? "tower" : kind === "warehouse" ? "warehouse" : kind === "colonial" || kind === "church" ? "colonial" : kind === "home" ? (b.floors >= 3 ? "res" : "kerala") : "shop";
    const fm = facade(fstyle); fm.color = col(wallC); fm.vertexColors = false;
    if (kind === "stadium") {
      const bowl = add(new THREE.CylinderGeometry(Math.min(w, d) * 0.5, Math.min(w, d) * 0.42, 1.6, 28, 1, true), null, cx, 0.8, cz, new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.8, side: THREE.DoubleSide })); bowl.scale.set(w / Math.min(w, d), 1, d / Math.min(w, d));
      const pitch = add(new THREE.CircleGeometry(Math.min(w, d) * 0.38, 24), null, cx, 0.03, cz, new THREE.MeshStandardMaterial({ color: 0x4f8f3a, roughness: 1 })); pitch.rotation.x = -Math.PI / 2; pitch.scale.set(w / Math.min(w, d), d / Math.min(w, d), 1);
      for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; add(new THREE.CylinderGeometry(0.05, 0.05, 3, 6), "#999", cx + Math.cos(a) * w * 0.48, 1.5, cz + Math.sin(a) * d * 0.48); add(new THREE.BoxGeometry(0.5, 0.3, 0.1), "#fff", cx + Math.cos(a) * w * 0.48, 3, cz + Math.sin(a) * d * 0.48); }
    } else {
      const main = add(facadeBox(w, h, d, 0.8, 1.0), null, cx, h / 2, cz, fm);
      if (b.roof) { const r = add(hipRoof(w, d, 0.7 + w * 0.05), null, cx, h, cz, new THREE.MeshStandardMaterial({ color: kind === "church" ? 0x9c4a30 : 0xb5532f, roughness: 0.8, map: roofTex() })); }
      else { const pc = col(wallC).multiplyScalar(0.88); lmParts.push(P(new THREE.BoxGeometry(w - 0.02, 0.06, d - 0.02), col("#8f897e"), cx, h + 0.03, cz), P(new THREE.BoxGeometry(w + 0.06, 0.22, 0.07), pc, cx, h + 0.11, cz + d / 2), P(new THREE.BoxGeometry(w + 0.06, 0.22, 0.07), pc, cx, h + 0.11, cz - d / 2), P(new THREE.BoxGeometry(0.07, 0.22, d + 0.06), pc, cx + w / 2, h + 0.11, cz), P(new THREE.BoxGeometry(0.07, 0.22, d + 0.06), pc, cx - w / 2, h + 0.11, cz)); for (let k = 1; k < Math.round(h); k++) lmParts.push(P(new THREE.BoxGeometry(w + 0.06, 0.035, d + 0.06), pc, cx, k, cz)); }
      if (kind === "hall" || kind === "office") for (let i = -2; i <= 2; i++) { const px = fp[0] + (face === "s" || face === "n" ? i * fw * 0.18 : (face === "w" ? -0.25 : 0.25)), pz = fp[1] + (face === "s" ? 0.25 : face === "n" ? -0.25 : i * fw * 0.18); add(new THREE.CylinderGeometry(0.09, 0.1, Math.min(h, 2) * 0.95, 10), "#fbf9f4", px, Math.min(h, 2) * 0.475, pz); }
      if (kind === "church") { const gable = add(new THREE.ConeGeometry(fw * 0.4, 1.4, 3), "#f7f5ef", fp[0], h + 0.7, fp[1]); gable.rotation.y = fp[2]; add(new THREE.BoxGeometry(0.08, 0.6, 0.08), "#444", fp[0], h + 1.7, fp[1]); add(new THREE.BoxGeometry(0.35, 0.08, 0.08), "#444", fp[0], h + 1.75, fp[1]); }
      if (kind === "cafe") { const aw = add(new THREE.BoxGeometry(fw * 0.95, 0.06, 0.7), null, 0, 0, 0, new THREE.MeshStandardMaterial({ map: stripes("#e05a47", "#f7efe2"), roughness: 0.9 })); aw.position.set(fp[0] + (face === "w" ? -0.35 : face === "e" ? 0.35 : 0), 1.0, fp[1] + (face === "s" ? 0.35 : face === "n" ? -0.35 : 0)); aw.rotation.y = fp[2]; aw.rotation.x = 0.25 * (face === "s" ? 1 : -1); }
      if (kind === "station") { const back = face === "n" ? 1 : -1; add(new THREE.BoxGeometry(w * 1.6, 0.08, 1.6), "#8a2d2d", cx, 1.5, cz + back * (d / 2 + 0.8)); for (let i = -3; i <= 3; i++) add(new THREE.CylinderGeometry(0.04, 0.04, 1.5, 6), "#666", cx + i * w * 0.24, 0.75, cz + back * (d / 2 + 1.5)); add(new THREE.BoxGeometry(fw * 0.7, 0.25, 0.15), "#8a2d2d", fp[0], 0.9, fp[1] + (face === "n" ? -0.1 : 0.1)); }
      if (kind === "showroom") { const show = vehRig("car", "#d0302a"); show.group.position.set(cx, h + 0.14, cz); show.group.scale.setScalar(1.3); scene.add(show.group); spinners.push(show.group); const sc = vehRig("scooter", "#2f73b8"); sc.group.position.set(cx + w * 0.3, h + 0.14, cz + d * 0.3); sc.group.scale.setScalar(1.4); scene.add(sc.group); spinners.push(sc.group); add(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 24), "#cfd6dc", cx, h + 0.1, cz); }
      if (kind === "fxn") { const gl = add(new THREE.PlaneGeometry(fw * 0.8, 0.9), null, 0, 0, 0, new THREE.MeshStandardMaterial({ color: 0xffd1e6, emissive: 0xff4f9a, emissiveIntensity: 0.35, roughness: 0.2 })); gl.position.set(fp[0] + (face === "w" ? -0.01 : face === "e" ? 0.01 : 0), 0.55, fp[1] + (face === "s" ? 0.01 : face === "n" ? -0.01 : 0)); gl.rotation.y = fp[2]; }
      if (kind === "home" && o.base && o.house && o.house.lvl >= 3) { for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.06, 0.06, 1, 8), "#fbf9f4", fp[0] + (i - 1) * fw * 0.3 * (face === "s" || face === "n" ? 1 : 0), 0.5, fp[1] + (face === "s" ? 0.4 : -0.4)); add(new THREE.BoxGeometry(fw * 0.9, 0.08, 0.8), "#a8472a", fp[0], 1.05, fp[1] + (face === "s" ? 0.35 : -0.35)); }
    }
    const signText = b.name || "", sgW = Math.min(fw * 0.85, 3.4), sgH = 0.42;
    if (signText && kind !== "stadium") {
      const scheme = { showroom: ["#c0392b", "#ffffff"], fxn: ["#ff4f9a", "#ffffff"], bank: ["#1f4e8c", "#ffffff"], hospital: ["#ffffff", "#1f7a4d"], station: ["#f1c40f", "#1b1b1b"], cafe: ["#4b2e1e", "#ffd88a"], mall: ["#2b2140", "#ffffff"], office: ["#1f5f4a", "#ffffff"], hall: ["#7a2f2f", "#fff5e0"] }[kind] || ["#1b1830", "#f4c542"];
      const sg = signPlane(signText.toUpperCase(), scheme[0], scheme[1], sgW, sgH);
      const hy2 = Math.min(h, 2) - 0.3 + (kind === "cafe" ? -0.1 : 0.2);
      sg.position.set(fp[0] + (face === "w" ? -0.03 : face === "e" ? 0.03 : 0), hy2, fp[1] + (face === "s" ? 0.03 : face === "n" ? -0.03 : 0)); sg.rotation.y = fp[2]; grp.add(sg);
    }
    const dm = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.7), new THREE.MeshStandardMaterial({ color: kind === "fxn" ? 0xff4f9a : 0x4a3424, roughness: 0.7 }));
    dm.position.set(fp[0] + (face === "w" ? -0.025 : face === "e" ? 0.025 : 0), 0.35, fp[1] + (face === "s" ? 0.025 : face === "n" ? -0.025 : 0)); dm.rotation.y = fp[2]; grp.add(dm);
  }
  function stripes(a, b2) { const c = document.createElement("canvas"); c.width = 64; c.height = 8; const x = c.getContext("2d"); for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? b2 : a; x.fillRect(i * 8, 0, 8, 8); } const t = srgbTex(c, true); t.repeat.set(3, 1); return t; }
  function monument(b, cx, cz) {
    const parts = [], c1 = col("#e7d3a8"), c2 = col("#d8bf8c"), id = b.monument;
    if (id === "TG") { parts.push(P(new THREE.BoxGeometry(2.2, 2.2, 2.2), c1, cx, 1.1, cz)); for (let i = 0; i < 4; i++) { const ox = (i % 2 ? 1 : -1) * 1.05, oz = (i < 2 ? 1 : -1) * 1.05; parts.push(P(new THREE.CylinderGeometry(0.14, 0.18, 4.2, 10), c2, cx + ox, 2.1, cz + oz)); parts.push(P(new THREE.SphereGeometry(0.2, 10, 8), c2, cx + ox, 4.3, cz + oz)); } parts.push(P(new THREE.BoxGeometry(0.9, 1.4, 2.3), col("#5a4630"), cx, 0.7, cz)); parts.push(P(new THREE.BoxGeometry(2.3, 1.4, 0.9), col("#5a4630"), cx, 0.7, cz)); }
    else if (id === "DL") { parts.push(P(new THREE.BoxGeometry(0.7, 3.2, 1.2), c1, cx - 0.8, 1.6, cz)); parts.push(P(new THREE.BoxGeometry(0.7, 3.2, 1.2), c1, cx + 0.8, 1.6, cz)); parts.push(P(new THREE.BoxGeometry(2.4, 0.9, 1.3), c1, cx, 3.55, cz)); parts.push(P(new THREE.BoxGeometry(1.4, 0.35, 0.9), c2, cx, 4.15, cz)); }
    else if (id === "MH") { parts.push(P(new THREE.BoxGeometry(2.6, 2.6, 1.4), col("#d2b48c"), cx, 1.3, cz)); for (let i = 0; i < 4; i++) parts.push(P(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 10), c2, cx - 1.1 + i * 0.73, 3, cz)); parts.push(P(new THREE.BoxGeometry(0.9, 1.6, 1.5), col("#5a4630"), cx, 0.8, cz)); }
    else { parts.push(P(new THREE.BoxGeometry(2.8, 1.8, 2), col("#cdbfa3"), cx, 0.9, cz)); parts.push(P(new THREE.SphereGeometry(0.7, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), c2, cx, 1.8, cz)); for (let i = -2; i <= 2; i++) parts.push(P(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 8), col("#f0e8d8"), cx + i * 0.5, 0.7, cz + 1.05)); }
    const m = new THREE.Mesh(mergeGeos(parts), vcMat); m.castShadow = m.receiveShadow = true; scene.add(m);
  }

  // ── nature and street life ──
  // coconut palm: curved ringed trunk, feathered drooping fronds, coconuts
  let palmGeoC = null, rainGeoC = null;
  function palmGeometry() {
    if (palmGeoC) return palmGeoC;
    const parts = [], trunk = col("#7a5b3e"), R = rng(19);
    let tx = 0;
    for (let i = 0; i < 8; i++) { tx = i * i * 0.006; parts.push(P(new THREE.CylinderGeometry(0.043 - i * 0.0025, 0.05 - i * 0.0025, 0.4, 8), trunk.clone().multiplyScalar(0.82 + (i % 2) * 0.16), tx, 0.2 + i * 0.37, 0, 0, 0, -0.04 - i * 0.012)); }
    const topY = 3.0, topX = tx + 0.03;
    for (let f = 0; f < 13; f++) {
      const a = f / 13 * Math.PI * 2 + R() * 0.3, len = 1.05 + R() * 0.35, droop = 0.5 + R() * 0.35, pos = [], seg = 9;
      const leafC = col("#3f7d34").lerp(col("#7fae4a"), R() * 0.6);
      for (let k = 0; k < seg; k++) {
        const t0 = k / seg, t1 = (k + 1) / seg, pt = t => [t * len, -t * t * droop * len + t * 0.18, 0];
        const p0 = pt(t0), p1 = pt(t1), w = 0.17 * Math.sin(Math.PI * Math.min(1, t0 * 1.15 + 0.1));
        [-1, 1].forEach(sd => pos.push(p0[0], p0[1], p0[2], p1[0], p1[1], p1[2], p0[0] + 0.06, p0[1] - 0.09, sd * w));
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
      g.setAttribute("uv", new THREE.Float32BufferAttribute(new Array(pos.length / 3 * 2).fill(0), 2));
      g.rotateY(a); g.translate(topX, topY, 0); parts.push({ geo: g, color: leafC });
    }
    for (let i = 0; i < 4; i++) parts.push(P(new THREE.SphereGeometry(0.075, 8, 6), col("#7a6a2a").lerp(col("#4f6a24"), i % 2), topX + Math.cos(i * 1.6) * 0.09, topY - 0.1, Math.sin(i * 1.6) * 0.09));
    return (palmGeoC = mergeGeos(parts));
  }
  // rain tree: forked trunk, lumpy canopy, darker underneath
  function rainTreeGeometry() {
    if (rainGeoC) return rainGeoC;
    const parts = [P(new THREE.CylinderGeometry(0.07, 0.12, 0.9, 8), col("#5e4430"), 0, 0.45, 0)], R = rng(29);
    [[0.25, 0.4], [-0.25, -0.3], [0.05, 2.3]].forEach(([lean, rot]) => parts.push(P(new THREE.CylinderGeometry(0.035, 0.06, 0.6, 6), col("#5e4430"), Math.sin(rot) * 0.15, 1.05, Math.cos(rot) * 0.15, lean, rot, 0)));
    const blobs = [[0, 1.5, 0, 0.62], [0.5, 1.35, 0.2, 0.48], [-0.45, 1.4, -0.15, 0.5], [0.15, 1.75, -0.35, 0.45], [-0.2, 1.7, 0.35, 0.44], [0.35, 1.25, -0.45, 0.4], [-0.4, 1.2, 0.45, 0.4]];
    blobs.forEach(([x, y, z, r]) => {
      const g = new THREE.IcosahedronGeometry(r, 2), q = g.attributes.position, cl = [];
      for (let i = 0; i < q.count; i++) { const k = 1 + (R() - 0.5) * 0.22; q.setXYZ(i, q.getX(i) * k * 1.25, q.getY(i) * k * 0.78, q.getZ(i) * k * 1.25); const ny = q.getY(i) / (r * 0.8), c = col("#2f6b2a").lerp(col("#6ea84a"), Math.max(0, Math.min(1, 0.45 + ny * 0.5 + (R() - 0.5) * 0.2))); cl.push(c.r, c.g, c.b); }
      g.translate(x, y, z); g.computeVertexNormals(); g.setAttribute("color", new THREE.Float32BufferAttribute(cl, 3)); parts.push({ geo: g, color: col("#4a8a3a") });
    });
    return (rainGeoC = mergeGeos(parts));
  }
  function plantTrees() {
    const pm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide });
    const R = rng(13), list = palmsList.slice();
    trees.filter(t => t.kind !== "rain").forEach(t => list.push({ x: t.x + 0.5, z: t.y + 0.5, s: 1, r: R() * 6 }));
    if (list.length) {
      const im = new THREE.InstancedMesh(palmGeometry(), pm, list.length), m4 = new THREE.Matrix4();
      list.forEach((p, i) => { m4.compose(new THREE.Vector3(p.x, 0, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, p.r, 0)), new THREE.Vector3(p.s * 0.75, p.s * 0.75, p.s * 0.75)); im.setMatrixAt(i, m4); });
      im.castShadow = true; scene.add(im);
    }
    const rt = trees.filter(t => t.kind === "rain");
    if (rt.length) {
      const im = new THREE.InstancedMesh(rainTreeGeometry(), pm, rt.length), m4 = new THREE.Matrix4();
      rt.forEach((t, i) => { const s = 0.9 + R() * 0.4; m4.compose(new THREE.Vector3(t.x + 0.5, 0, t.y + 0.5), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, R() * 6, 0)), new THREE.Vector3(s, s, s)); im.setMatrixAt(i, m4); });
      im.castShadow = true; scene.add(im);
    }
  }
  function streetLamps() {
    const pos = [];
    for (let y = 0; y < ROWS; y += 3) for (let x = 0; x < COLS; x++) {
      const t = at(x, y);
      if ((t === PLAZA && at(x - 1, y) === WATER) || (t === SIDE && at(x + 1, y) === ROAD && at(x + 2, y) === ROAD && y % 6 === 0)) pos.push([x + 0.25, y + 0.5]);
    }
    if (!pos.length) return;
    const pole = mergeGeos([P(new THREE.CylinderGeometry(0.025, 0.035, 1.5, 6), col("#3a3a3a"), 0, 0.75, 0), P(new THREE.BoxGeometry(0.3, 0.03, 0.03), col("#3a3a3a"), 0.13, 1.5, 0)]);
    const im = new THREE.InstancedMesh(pole, vcMatRough, pos.length), m4 = new THREE.Matrix4();
    lampMat = new THREE.MeshStandardMaterial({ color: 0xfff1c9, emissive: 0xffd98a, emissiveIntensity: 0 });
    const bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.06, 8, 6), lampMat, pos.length);
    pos.forEach((p, i) => { m4.makeTranslation(p[0], 0, p[1]); im.setMatrixAt(i, m4); m4.makeTranslation(p[0] + 0.27, 1.47, p[1]); bulbs.setMatrixAt(i, m4); });
    scene.add(im); scene.add(bulbs);
  }
  function fishingNets() {
    [[0.6, 24], [0.6, 28.5], [0.6, 33]].forEach(([x, z], i) => {
      const parts = [P(new THREE.BoxGeometry(1.2, 0.15, 1.0), col("#6b4a2f"), x + 0.9, 0.05, z)];
      parts.push(P(new THREE.CylinderGeometry(0.04, 0.05, 4.2, 6), col("#7a5b3e"), x, 1.3, z - 0.5, 0.35, 0, 0.75));
      parts.push(P(new THREE.CylinderGeometry(0.04, 0.05, 4.2, 6), col("#7a5b3e"), x, 1.3, z + 0.5, -0.35, 0, 0.75));
      parts.push(P(new THREE.CylinderGeometry(0.02, 0.02, 2.4, 4), col("#5a4630"), x - 1.0, 2.2, z, Math.PI / 2, 0, 0));
      for (let k = 0; k < 5; k++) parts.push(P(new THREE.SphereGeometry(0.11, 6, 5), col("#c9c1ad"), x + 1.3, 0.25 + k * 0.05, z - 0.3 + k * 0.15));
      const m = new THREE.Mesh(mergeGeos(parts), vcMat); m.castShadow = true; scene.add(m);
      const c = document.createElement("canvas"); c.width = c.height = 64; const xx = c.getContext("2d"); xx.strokeStyle = "rgba(240,236,220,.8)"; for (let k = 0; k < 64; k += 8) { xx.beginPath(); xx.moveTo(k, 0); xx.lineTo(k, 64); xx.stroke(); xx.beginPath(); xx.moveTo(0, k); xx.lineTo(64, k); xx.stroke(); }
      const net = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.2), new THREE.MeshBasicMaterial({ map: srgbTex(c), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
      net.position.set(x - 1.9, 1.1 + i * 0.25, z); net.rotation.set(-Math.PI / 2 + 0.5, 0, 0); scene.add(net);
    });
  }
  function vehicleMesh(type, R) {
    const parts = [];
    if (type === "auto") {
      parts.push(P(new THREE.BoxGeometry(0.42, 0.32, 0.75), col("#1f1f1f"), 0, 0.3, 0)); parts.push(P(new THREE.BoxGeometry(0.44, 0.06, 0.8), col("#f2c230"), 0, 0.68, -0.02));
      parts.push(P(new THREE.BoxGeometry(0.4, 0.3, 0.05), col("#9ab8c8"), 0, 0.5, 0.36, -0.25)); parts.push(P(new THREE.BoxGeometry(0.02, 0.24, 0.6), col("#f2c230"), 0.21, 0.55, -0.05)); parts.push(P(new THREE.BoxGeometry(0.02, 0.24, 0.6), col("#f2c230"), -0.21, 0.55, -0.05));
      [[0, 0.33], [0.2, -0.28], [-0.2, -0.28]].forEach(([x, z]) => parts.push(P(new THREE.CylinderGeometry(0.1, 0.1, 0.06, 10), col("#111"), x, 0.1, z, 0, 0, Math.PI / 2)));
    } else if (type === "bus") {
      const c = ["#d13f2b", "#2f73b8", "#e08e1b", "#2d8a55"][Math.floor(R() * 4)];
      parts.push(P(new THREE.BoxGeometry(0.85, 0.95, 3.0), col(c), 0, 0.62, 0)); parts.push(P(new THREE.BoxGeometry(0.87, 0.3, 2.7), col("#2f3a42"), 0, 0.85, 0)); parts.push(P(new THREE.BoxGeometry(0.87, 0.1, 3.02), col("#f4efe0"), 0, 0.5, 0));
      [[0.36, 1.0], [-0.36, 1.0], [0.36, -1.0], [-0.36, -1.0]].forEach(([x, z]) => parts.push(P(new THREE.CylinderGeometry(0.16, 0.16, 0.12, 12), col("#111"), x, 0.16, z, 0, 0, Math.PI / 2)));
    } else {
      const c = ["#e8e8e8", "#c0392b", "#2c3e50", "#7f8c8d", "#f1c40f"][Math.floor(R() * 5)];
      parts.push(P(new THREE.BoxGeometry(0.62, 0.28, 1.3), col(c), 0, 0.26, 0)); parts.push(P(new THREE.BoxGeometry(0.56, 0.24, 0.7), col("#2f3a42"), 0, 0.5, -0.05)); parts.push(P(new THREE.BoxGeometry(0.58, 0.04, 0.72), col(c), 0, 0.63, -0.05));
      [[0.3, 0.42], [-0.3, 0.42], [0.3, -0.42], [-0.3, -0.42]].forEach(([x, z]) => parts.push(P(new THREE.CylinderGeometry(0.11, 0.11, 0.08, 10), col("#111"), x, 0.11, z, 0, 0, Math.PI / 2)));
    }
    const m = new THREE.Mesh(mergeGeos(parts), vcMat); m.castShadow = true; return m;
  }
  function spawnTraffic() {
    const R = rng(91), routes = isKochi ? K.routes : [5, 17, 29, 41].map(c => [[c + 1, -2], [c + 1, ROWS + 2]]).concat([5, 17, 29].map(r => [[-2, r + 1], [COLS + 2, r + 1]]));
    const n = isKochi ? 18 : 12;
    for (let i = 0; i < n; i++) {
      const rt = routes[i % routes.length], type = R() < 0.45 ? "auto" : R() < 0.75 ? "car" : "bus";
      const m = vehicleMesh(type, R); scene.add(m);
      vehicles.push({ m, a: rt[0], b: rt[1], t: R(), dir: R() < 0.5 ? 1 : -1, sp: (type === "bus" ? 1.8 : type === "auto" ? 2.6 : 3.2) / Math.hypot(rt[1][0] - rt[0][0], rt[1][1] - rt[0][1]), type, honk: 0 });
    }
    if (isKochi) {
      const hb = [P(new THREE.BoxGeometry(0.9, 0.3, 3.2), col("#5a3a22"), 0, 0.1, 0), P(new THREE.CylinderGeometry(0.55, 0.55, 2.4, 12, 1, false, 0, Math.PI), col("#c9a46a"), 0, 0.3, 0, Math.PI / 2, 0, 0, 1, 1, 0.8)];
      const houseboat = new THREE.Mesh(mergeGeos(hb), vcMat); houseboat.castShadow = true; scene.add(houseboat);
      boats.push({ m: houseboat, a: [33.2, 2], b: [33.2, 44], t: 0.3, dir: 1, sp: 0.012 });
      const canoe = new THREE.Mesh(mergeGeos([P(new THREE.CylinderGeometry(0.18, 0.18, 1.4, 8), col("#3b2a1c"), 0, 0.02, 0, Math.PI / 2, 0, 0, 1, 1, 0.5)]), vcMat); scene.add(canoe);
      boats.push({ m: canoe, a: [-2, 18], b: [-2, 40], t: 0.1, dir: 1, sp: 0.01 });
      const fp = [P(new THREE.BoxGeometry(1.1, 0.35, 2.6), col("#f2f2ee"), 0, 0.12, 0), P(new THREE.BoxGeometry(1.0, 0.5, 1.4), col("#2f73b8"), 0, 0.55, -0.1), P(new THREE.BoxGeometry(1.15, 0.06, 1.6), col("#e8e2d0"), 0, 0.82, -0.1)];
      ferry = { m: new THREE.Mesh(mergeGeos(fp), vcMat) }; ferry.m.castShadow = true; scene.add(ferry.m);
      ferry.m.position.set(20.2, 0, 24.5); ferry.m.rotation.y = Math.PI / 2;
    }
  }

  // ═══ mount ═══
  function mount(slot, o) {
    opts = o;
    if (!el || el.dataset.key !== o.key) {
      if (el) destroy();
      THREE = window.THREE;
      isKochi = o.stateId === "KL";
      if (isKochi) buildKochi(o); else buildGrid(o);
      el = document.createElement("section");
      el.className = "world w3d";
      el.dataset.key = o.key;
      el.innerHTML = `<div class="w-banner" hidden><span class="arrow" aria-hidden="true">➤</span><div class="w-banner-t"><b></b><span></span></div><div class="w-banner-a"></div></div>
        <div class="w3-view"><div class="w-labels"></div><div class="joy" aria-label="Joystick: drag to walk"><i></i></div>
          <canvas class="minimap" width="150" height="112" aria-label="City map. Tap to open."></canvas>
          <div class="cam-btns"><button class="w-btn small cam-spin" title="Look all around" aria-label="Look all around">⟳</button><button class="w-btn small cam-zoom" title="Zoom" aria-label="Zoom out">⤢</button><button class="w-btn small cam-snd" title="Sound: music and effects, effects only, or off" aria-label="Sound">${window.AE_SOUND ? window.AE_SOUND.icon() : "🔊"}</button><button class="w-btn small cam-msg" title="Messages" aria-label="Messages">💬<i hidden></i></button></div>
          <div class="map-full" hidden><div class="map-top"><div><b>${isKochi ? "Kochi 2030" : esc(o.words.city) + " 2030"}</b><span></span></div><button class="w-btn small map-close">Close</button></div><div class="map-area"><canvas></canvas><div class="map-zoom"><button class="mz-in" aria-label="Zoom in">+</button><button class="mz-out" aria-label="Zoom out">−</button><button class="mz-me" aria-label="Centre on me">◎</button></div></div><p class="map-hint">Tap a pin or any street to walk there · drag to move · pinch to zoom</p></div>
          <div class="w-ui"><button class="w-btn act" hidden></button><button class="w-btn say" hidden>Say…</button><button class="w-btn chat" hidden>Chat</button><span class="w-online" hidden></span></div>
          <div class="say-panel" hidden></div>
          <div class="ride-cap" hidden>On the ferry…</div>
          <div class="w-toast" aria-live="polite" hidden></div>
          <div class="msg-panel" hidden><div class="map-top"><div><b>Messages</b><span>Last 60 · tap a tab to filter</span></div><button class="w-btn small msg-close">Close</button></div><div class="msg-tabs"><button data-mt="all" class="on">All</button><button data-mt="game">Updates</button><button data-mt="chat">Players</button><button data-mt="town">Townsfolk</button></div><div class="msg-list"></div></div></div>
        <form class="chat-row" hidden><input maxlength="80" placeholder="Type a message (no numbers, links or handles)" aria-label="Chat message"><button class="w-btn">Send</button></form>`;
      labelLayer = el.querySelector(".w-labels"); banner = el.querySelector(".w-banner"); actBtn = el.querySelector(".act"); logEl = el.querySelector(".w-toast"); toastQ = []; toastCur = null; clearTimeout(toastT);
      figs = {}; spinners = []; metroTrain = null; extraSpots = {}; inside = {}; guide = null; sceneMarker = null; nearKey = null; yaw = Math.PI; pitch = 0.42; dist = 2.9; follow = true; spin = 0; vehicles = []; boats = []; facadeMats = []; ride = null; ferry = null;
      ok3d = false;
      try { if (THREE) { renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" }); ok3d = !!renderer.getContext(); } } catch (e) { ok3d = false; }
      const view = el.querySelector(".w3-view");
      if (ok3d) {
        if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
        renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));
        view.insertBefore(renderer.domElement, view.firstChild);
        scene = new THREE.Scene();
        vcMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 });
        vcMatRough = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 });
        scene.fog = new THREE.Fog(0xf6dcae, 22, 70);
        camera = new THREE.PerspectiveCamera(55, 1, 0.05, 260);
        ray = new THREE.Raycaster();
        hemi = new THREE.HemisphereLight(0xcfe2ff, 0x6b5a3a, 0.55); scene.add(hemi);
        sun = new THREE.DirectionalLight(0xffe2b8, 2.2); sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024); const sc = sun.shadow.camera; sc.left = sc.bottom = -13; sc.right = sc.top = 13; sc.near = 1; sc.far = 80; sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.02;
        scene.add(sun); scene.add(sun.target);
        makeSky(); makeWater(); makeOuterLand(o);
        groundMesh = new THREE.Mesh(new THREE.PlaneGeometry(COLS, ROWS), new THREE.MeshStandardMaterial({ map: groundTexture(), roughness: 0.95, alphaTest: 0.5 }));
        groundMesh.rotation.x = -Math.PI / 2; groundMesh.position.set(COLS / 2, 0, ROWS / 2); groundMesh.receiveShadow = true; scene.add(groundMesh);
        renderCity(o); plantTrees(); streetLamps(); spawnTraffic(); powerLines(); bushes();
        if (isKochi) { fishingNets(); bridgesRails(); chayaStall(36.45, 29.35); metro(); streetSigns(); busStops(); roadPalms(); }
        city2030(o);
        labels.forEach(l => { const s = textSprite(l.t, l.c, 0.42); s.position.set(l.x, l.h + 0.7, l.y); scene.add(s); });
        const bd = spots.board;
        const kiosk = mergeGeos([P(new THREE.BoxGeometry(1.1, 0.7, 0.08), col("#6b4a2f"), 0, 1.0, 0), P(new THREE.BoxGeometry(0.9, 0.5, 0.09), col("#f3efe6"), 0, 1.0, 0.01), P(new THREE.BoxGeometry(0.06, 1.0, 0.06), col("#4a3424"), -0.5, 0.5, 0), P(new THREE.BoxGeometry(0.06, 1.0, 0.06), col("#4a3424"), 0.5, 0.5, 0), P(new THREE.BoxGeometry(0.2, 0.12, 0.1), col("#e05a47"), -0.2, 1.15, 0.06), P(new THREE.BoxGeometry(0.18, 0.14, 0.1), col("#2f73b8"), 0.22, 0.9, 0.06)]);
        const km = new THREE.Mesh(kiosk, vcMat); km.position.set(bd.x + 0.5, 0, bd.y + 0.5); km.castShadow = true; scene.add(km);
        const bs = textSprite("Notice Board", "#22b5a6", 0.36); bs.position.set(bd.x + 0.5, 1.75, bd.y + 0.5); scene.add(bs);
        const bc = document.createElement("canvas"); bc.width = 4; bc.height = 128; const bx = bc.getContext("2d"), gr = bx.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, "rgba(34,181,166,0)"); gr.addColorStop(1, "rgba(34,181,166,.32)"); bx.fillStyle = gr; bx.fillRect(0, 0, 4, 128);
        beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 6, 20, 1, true), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(bc), transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
        beacon.visible = false; scene.add(beacon);
        beaconRing = new THREE.Mesh(new THREE.RingGeometry(0.45, 0.6, 32), new THREE.MeshBasicMaterial({ color: 0x22b5a6, transparent: true, opacity: 0.8, depthWrite: false }));
        beaconRing.rotation.x = -Math.PI / 2; beaconRing.visible = false; scene.add(beaconRing);
        bang = textSprite(" ! ", "#f4a52b", 0.6); bang.visible = false; scene.add(bang);
      } else {
        view.insertAdjacentHTML("afterbegin", `<p class="no3d">3D isn't available on this device or browser. You can still play: use the buttons on the mission bar instead of walking.</p>`);
      }
      const st = o.startPos && walk(o.startPos.x, o.startPos.y) ? o.startPos : (isKochi ? { x: K.start[0], y: K.start[1] } : { x: 8, y: 18 });
      me = addFig("me", "me", o.avatar, o.outfit, o.meLabel || "You", st.x + 0.5, st.y + 0.5);
      ["m", "f", "v", "p"].forEach(r => { const s = spots[r]; if (s) { const f = addFig("npc_" + r, "npc", npcLook(o.stateId, r), null, o.cast[r], s.x + 0.5 + (r === "f" ? 0.6 : 0), s.y + 0.5); f.role = r; f.heading = Math.PI; place(f); } });
      if (o.spouse && spots.house) { const f = addFig("npc_s", "npc", npcLook(o.spouse, "s", o.spouseFem), o.spouseOutfit || null, o.spouse, spots.house.x + 0.5, spots.house.y + 0.5); f.role = "s"; f.heading = Math.PI; place(f); }
      (o.kids || []).forEach((k, i) => { if (!spots.house) return; const av = PEOPLE.random(k.name + "|kid", { kid: true, set: { height: 140 + Math.min(40, k.age * 3) } }); av.small = k.age < 12; const f = addFig("kid_" + i, "walker", av, null, k.name, spots.house.x + 1.2 + i * 0.5, spots.house.y + 0.9); f.home = { x: spots.house.x, y: spots.house.y }; f.amb = "kid"; f.kid = true; place(f); });
      townsfolk(o);
      bindInput();
      el.querySelector(".cam-snd").addEventListener("click", e => { e.stopPropagation(); SND.cycle(); e.currentTarget.textContent = SND.icon(); });
      el.querySelector(".cam-msg").addEventListener("click", e => { e.stopPropagation(); msgPanel(true); });
      el.querySelector(".msg-close").addEventListener("click", e => { e.stopPropagation(); msgPanel(false); });
      el.querySelector(".msg-tabs").addEventListener("click", e => { const b = e.target.closest("[data-mt]"); if (!b) return; msgTab = b.dataset.mt; msgPanel(true); });
      logEl.addEventListener("click", e => { e.stopPropagation(); msgPanel(true); });
      mapBase = mapImage(); mini = el.querySelector(".minimap"); miniCtx = mini.getContext("2d");
      mapEl = el.querySelector(".map-full"); mapCv = mapEl.querySelector("canvas"); bindMap();
      window.addEventListener("resize", resize); window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
      last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
    } else if (JSON.stringify(o.outfit || null) !== JSON.stringify(figs.me.outfit || null)) setLookFig("me", o.avatar, o.outfit);
    slot.appendChild(el);
    resize();
    return el;
  }
  function chayaStall(x, z) {
    const parts = [P(new THREE.BoxGeometry(0.8, 0.55, 0.45), col("#2f6f8f"), 0, 0.28, 0), P(new THREE.BoxGeometry(0.84, 0.05, 0.5), col("#e8e2d0"), 0, 0.58, 0), P(new THREE.CylinderGeometry(0.035, 0.035, 0.6, 6), col("#555"), 0, 0.9, 0),
      P(new THREE.ConeGeometry(0.7, 0.3, 10), col("#e05a47"), 0, 1.25, 0), P(new THREE.CylinderGeometry(0.08, 0.08, 0.16, 10), col("#c0c0c0"), -0.22, 0.68, 0), P(new THREE.BoxGeometry(0.24, 0.1, 0.18), col("#d9a441"), 0.2, 0.65, 0)];
    const m = new THREE.Mesh(mergeGeos(parts), vcMat); m.position.set(x, 0, z); m.castShadow = true; scene.add(m);
    const lb = textSprite("Chayakkada", "#f4c542", 0.3); lb.position.set(x, 1.6, z); scene.add(lb);
  }
  function bridgesRails() {
    const parts = [];
    K.bridges.forEach(([x0, y0, x1, y1]) => {
      const horiz = x1 - x0 > y1 - y0, len = horiz ? x1 - x0 + 1 : y1 - y0 + 1;
      [y0, y1 + 1].forEach((yy, i) => { if (horiz) parts.push(P(new THREE.BoxGeometry(len, 0.25, 0.08), col("#d9d4c8"), x0 + len / 2, 0.12, yy + (i ? -0.04 : 0.04))); });
      if (horiz) for (let x = x0; x <= x1; x += 3) parts.push(P(new THREE.CylinderGeometry(0.18, 0.22, 1.2, 8), col("#a9a398"), x + 0.5, -0.6, y0 + 1));
      else [x0, x1 + 1].forEach((xx, i) => parts.push(P(new THREE.BoxGeometry(0.08, 0.25, len), col("#d9d4c8"), xx + (i ? -0.04 : 0.04), 0.12, y0 + len / 2)));
    });
    const m = new THREE.Mesh(mergeGeos(parts), vcMat); m.castShadow = true; scene.add(m);
  }
  // ── Kochi Metro: an elevated line over MG Road with three stations and a train that shuttles along it ──
  function metro() {
    const M = K.metro, X = M.x, deckY = 2.3, parts = [], conc = col("#bdb7ab"), conc2 = col("#a7a196");
    parts.push(P(new THREE.BoxGeometry(0.95, 0.2, ROWS + 8), conc, X, deckY - 0.1, ROWS / 2));
    [-1, 1].forEach(sd => parts.push(P(new THREE.BoxGeometry(0.06, 0.18, ROWS + 8), conc2, X + sd * 0.45, deckY + 0.09, ROWS / 2)));
    const junction = z => [[8, 10], [21, 23], [36, 38], [45, 47]].some(([a, b]) => z >= a && z <= b);
    for (let z = -2.5; z < ROWS + 4; z += 3) if (!junction(z)) { parts.push(P(new THREE.CylinderGeometry(0.085, 0.1, deckY - 0.2, 12), conc2, X, (deckY - 0.2) / 2, z)); parts.push(P(new THREE.BoxGeometry(0.75, 0.16, 0.3), conc2, X, deckY - 0.27, z)); }
    M.stations.forEach(([z]) => {
      parts.push(P(new THREE.BoxGeometry(1.9, 0.14, 3.4), conc, X, deckY - 0.08, z));
      parts.push(P(new THREE.CylinderGeometry(1.05, 1.05, 3.4, 16, 1, true, -Math.PI / 2, Math.PI), col("#9fd8d2"), X, deckY + 0.45, z, Math.PI / 2, 0, 0, 1, 0.42, 1));
      [-1, 1].forEach(sd => { parts.push(P(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6), col("#7a8288"), X + sd * 0.9, deckY + 0.42, z - 1.4)); parts.push(P(new THREE.CylinderGeometry(0.05, 0.05, 0.85, 6), col("#7a8288"), X + sd * 0.9, deckY + 0.42, z + 1.4)); parts.push(P(new THREE.BoxGeometry(0.06, 0.2, 3.2), col("#2a9d8f"), X + sd * 0.92, deckY + 0.05, z)); });
    });
    const m = new THREE.Mesh(mergeGeos(parts), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide })); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    M.stations.forEach(([z, name]) => [-1, 1].forEach(sd => { const sg = signPlane(name.toUpperCase() + " METRO", "#2a9d8f", "#ffffff", 1.7, 0.22); sg.position.set(X + sd * 0.96, deckY + 0.05, z); sg.rotation.y = sd * Math.PI / 2; scene.add(sg); }));
    const car = [];
    for (let i = 0; i < 3; i++) {
      const cp = [P(new THREE.BoxGeometry(0.62, 0.56, 1.75), col("#f4f6f7"), 0, 0.3, 0), P(new THREE.BoxGeometry(0.635, 0.16, 1.6), col("#27323a"), 0, 0.38, 0), P(new THREE.BoxGeometry(0.64, 0.06, 1.76), col("#22b5a6"), 0, 0.18, 0), P(new THREE.BoxGeometry(0.64, 0.03, 1.76), col("#22b5a6"), 0, 0.53, 0)];
      if (i === 0 || i === 2) cp.push(P(new THREE.BoxGeometry(0.5, 0.2, 0.03), col("#27323a"), 0, 0.4, (i === 0 ? 1 : -1) * 0.88));
      car.push(P(mergeGeos(cp), col("#ffffff"), 0, 0, (i - 1) * 1.82));
    }
    const train = new THREE.Mesh(mergeGeos(car), vcMat); train.castShadow = true; scene.add(train);
    metroTrain = { m: train, z: 10, dir: 1, wait: 0, y: deckY };
    train.position.set(X, deckY, 10);
  }
  function stepMetro(dt) {
    const T = metroTrain, st = K.metro.stations.map(s => s[0]);
    if (T.wait > 0) { T.wait -= dt; return; }
    const nz = T.z + T.dir * dt * 3.2;
    const hit = st.find(z => (T.z - z) * (nz - z) <= 0 && T.last !== z);
    if (hit !== undefined) { T.z = hit; T.wait = 3; T.last = hit; } else T.z = nz;
    if (T.z > ROWS + 6) { T.dir = -1; T.last = null; } if (T.z < -6) { T.dir = 1; T.last = null; }
    T.m.position.z = T.z;
  }
  function streetSigns() {
    const poles = [];
    K.signs.forEach(([x, z, name, vert]) => {
      poles.push(P(new THREE.CylinderGeometry(0.02, 0.025, 1.25, 6), col("#5b6168"), x, 0.62, z));
      [-1, 1].forEach(sd => { const sg = signPlane(name, "#1f7a4d", "#ffffff", Math.min(1.3, 0.24 + name.length * 0.055), 0.17); sg.position.set(x + (vert ? sd * 0.012 : 0), 1.2, z + (vert ? 0 : sd * 0.012)); sg.rotation.y = vert ? (sd > 0 ? Math.PI / 2 : -Math.PI / 2) : (sd > 0 ? 0 : Math.PI); scene.add(sg); });
    });
    const m = new THREE.Mesh(mergeGeos(poles), vcMat); scene.add(m);
  }
  // Bus shelters on Marine Drive, with FXN posters (the game is FXN's playground)
  function busStops() {
    K.busStops.forEach(([x, z]) => {
      const parts = [P(new THREE.BoxGeometry(0.5, 0.04, 1.3), col("#2f73b8"), 0, 0.95, 0), P(new THREE.BoxGeometry(0.03, 0.9, 1.2), col("#d9dde1"), -0.22, 0.47, 0), P(new THREE.BoxGeometry(0.2, 0.05, 1.0), col("#6b4a2f"), -0.1, 0.3, 0)];
      [-0.6, 0.6].forEach(dz => parts.push(P(new THREE.CylinderGeometry(0.02, 0.02, 0.95, 6), col("#7a8288"), 0.2, 0.47, dz)));
      const m = new THREE.Mesh(mergeGeos(parts), vcMat); m.position.set(x, 0, z); m.castShadow = true; scene.add(m);
      const ad = fxnPoster(0.8, 0.62); ad.position.set(x - 0.2, 0.55, z); ad.rotation.y = Math.PI / 2; scene.add(ad);
      const st = signPlane("BUS STOP", "#2f73b8", "#ffffff", 0.6, 0.12); st.position.set(x + 0.02, 1.05, z); st.rotation.y = Math.PI / 2; scene.add(st);
    });
    const hb = fxnPoster(3.2, 1.25); hb.position.set(41.0, 3.9, 17.5); hb.rotation.y = -Math.PI / 2; scene.add(hb);
    const legs = new THREE.Mesh(mergeGeos([P(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 6), col("#5b6168"), 41.1, 2.15, 16.6), P(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 6), col("#5b6168"), 41.1, 2.15, 18.4)]), vcMat); scene.add(legs);
  }
  function fxnPoster(w, h) {
    const c = document.createElement("canvas"); c.width = 512; c.height = Math.round(512 * h / w); const x = c.getContext("2d"), H = c.height;
    drawHolo(c, (fxnPoster.n = ((fxnPoster.n || 0) + 1)) % HOLO_SLIDES.length);
    const t = srgbTex(c), m = new THREE.MeshStandardMaterial({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.2, roughness: 0.5, side: THREE.DoubleSide });
    m.userData.sign = true; facadeMats.push(m);
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  }
  // ═══ Kochi 2030: neon trims, holographic FXN ads, flying traffic and FXN delivery drones ═══
  let neonMats = [], holos = [], flyers = [];
  function city2030(o) {
    const R = rng(2030), cols = ["#19e6ff", "#ff2fd0", "#9b6bff", "#ffcf4a"], buckets = cols.map(() => []);
    blds.forEach(b => {
      if (b.monument || R() > (b.h >= 3 ? 0.55 : 0.28)) return;
      const ci = Math.floor(R() * cols.length), w = b.w * 0.92, d = b.d * 0.92, cx = b.x + b.w / 2, cz = b.y + b.d / 2, h = b.h + (b.roof ? 0 : 0.2), t = 0.04;
      buckets[ci].push(P(new THREE.BoxGeometry(w + 0.08, t, t), "#ffffff", cx, h + 0.02, cz + d / 2 + 0.04), P(new THREE.BoxGeometry(w + 0.08, t, t), "#ffffff", cx, h + 0.02, cz - d / 2 - 0.04), P(new THREE.BoxGeometry(t, t, d + 0.08), "#ffffff", cx + w / 2 + 0.04, h + 0.02, cz), P(new THREE.BoxGeometry(t, t, d + 0.08), "#ffffff", cx - w / 2 - 0.04, h + 0.02, cz));
      if (b.h >= 3) [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([sx, sz]) => buckets[ci].push(P(new THREE.BoxGeometry(t, b.h, t), "#ffffff", cx + sx * (w / 2 + 0.035), b.h / 2, cz + sz * (d / 2 + 0.035))));
      if (b.h >= 2 && R() < 0.4) buckets[(ci + 1) % 4].push(P(new THREE.BoxGeometry(w + 0.07, t * 0.8, d + 0.07), "#ffffff", cx, 1.0, cz));
    });
    buckets.forEach((parts, i) => { if (!parts.length) return; const m = new THREE.MeshStandardMaterial({ color: 0x111111, emissive: col(cols[i]), emissiveIntensity: 1.2, roughness: 0.4 }); neonMats.push(m); scene.add(new THREE.Mesh(mergeGeos(parts), m)); });
    // holographic FXN billboards on the tallest buildings
    const tall = blds.filter(b => !b.monument && b.h >= 3).sort((a, b) => b.h - a.h).slice(0, isKochi ? 5 : 3);
    tall.forEach((b, i) => { const hb = holoBoard(2.6, 1.5, i); hb.position.set(b.x + b.w / 2, b.h + 1.3, b.y + b.d / 2); hb.rotation.y = i % 2 ? Math.PI / 2 : 0; scene.add(hb); });
    // the giant FXN hologram above the FXN store
    if (spots.fxn) holoLogo(spots.fxn.x + 0.5, spots.fxn.y - 1.5);
    // flying traffic lanes above the streets, and FXN drones
    const RL = rng(77), lanes = isKochi ? [[[40, -4], [40, 52]], [[47, 52], [47, -4]], [[54, -4], [54, 52]], [[30, 9], [66, 9]], [[66, 22], [30, 22]], [[14, 34], [62, 34]], [[2, 12], [36, 12]]] : [[[4, 4], [44, 4]], [[44, 30], [4, 30]], [[20, -4], [20, 40]], [[34, 40], [34, -4]]];
    lanes.forEach((ln, i) => { for (let k = 0; k < 2; k++) { const type = ["hovercar", "flyscooter", "hovercar"][(i + k) % 3], rig = vehRig(type, ["#f2f2f2", "#1b1b1b", "#ff4f9a", "#19e6ff", "#c0392b"][(i * 2 + k) % 5]); rig.shadow.visible = false; scene.add(rig.group); flyers.push({ rig, a: ln[0], b: ln[1], t: RL(), sp: 0.02 + RL() * 0.02, alt: 4.2 + (i % 3) * 0.9 + k * 0.4, dir: k ? -1 : 1 }); } });
    for (let i = 0; i < (isKochi ? 6 : 3); i++) { const d = drone(); scene.add(d); const s0 = spots.fxn || { x: 10, y: 10 }; flyers.push({ drone: d, home: [s0.x + 0.5, s0.y + 0.5], a: [s0.x + 0.5, s0.y + 0.5], b: [4 + RL() * (COLS - 8), 4 + RL() * (ROWS - 8)], t: RL(), sp: 0.05 + RL() * 0.03, alt: 3.2 + RL() * 1.2, dir: 1 }); }
  }
  function drone() {
    const g = new THREE.Group(), body = new THREE.Mesh(mergeGeos([P(new THREE.BoxGeometry(0.22, 0.05, 0.22), col("#202024"), 0, 0, 0), P(new THREE.BoxGeometry(0.5, 0.02, 0.03), col("#2a2a2e"), 0, 0.01, 0, 0, Math.PI / 4, 0), P(new THREE.BoxGeometry(0.5, 0.02, 0.03), col("#2a2a2e"), 0, 0.01, 0, 0, -Math.PI / 4, 0)]), vcMat);
    g.add(body); [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([x, z]) => { const r = new THREE.Mesh(new THREE.CircleGeometry(0.09, 12), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(x * 0.17, 0.04, z * 0.17); g.add(r); });
    const box = fxnBoxMesh(); box.scale.setScalar(0.8); box.position.y = -0.13; g.add(box);
    const l = new THREE.Mesh(new THREE.SphereGeometry(0.025, 8, 6), new THREE.MeshBasicMaterial({ color: 0xff2fd0 })); l.position.set(0, -0.02, 0.12); g.add(l);
    return g;
  }
  function stepFlyers(dt, time) {
    flyers.forEach((f, i) => {
      f.t += f.sp * dt * f.dir;
      if (f.drone) { if (f.t >= 1) { f.t = 1; f.dir = -1; } if (f.t <= 0) { f.t = 0; f.dir = 1; f.b = [4 + Math.random() * (COLS - 8), 4 + Math.random() * (ROWS - 8)]; } }
      else { if (f.t > 1) f.t -= 1; if (f.t < 0) f.t += 1; }
      const x = f.a[0] + (f.b[0] - f.a[0]) * f.t, z = f.a[1] + (f.b[1] - f.a[1]) * f.t, hd = Math.atan2((f.b[0] - f.a[0]) * f.dir, (f.b[1] - f.a[1]) * f.dir);
      const y = f.alt + Math.sin(time / 500 + i) * 0.08 + (f.drone ? Math.max(0, roofAt(x, z) + 0.8 - f.alt) : 0);
      const o = f.drone || f.rig.group; o.position.set(x, y, z); o.rotation.y = hd;
    });
    holos.forEach((h, i) => { if (h.spin) h.o.rotation.y += dt * 0.5; if (h.pulse) h.o.children.forEach(c => { if (c.material) c.material.opacity = 0.55 + Math.sin(time / 600 + i) * 0.15; }); if (h.tex && time - h.last > 5200) { h.last = time; h.slide = (h.slide + 1) % HOLO_SLIDES.length; drawHolo(h.cv, h.slide); h.tex.needsUpdate = true; } });
  }
  // premium FXN ad slides for the holographic boards
  const HOLO_SLIDES = [["FXN", "Wear the moment.", "Designer rentals · Kochi 2030"], ["FXN EXPRESS", "Drone delivery in 10 minutes", "From our sky-hub to your door"], ["FXN ATELIER", "Bridal · Party · Office", "Book a stylist in the app"], ["FXN", "Why buy? Rent the look.", "Return it, we clean it, you shine"]];
  function drawHolo(c, k) {
    const x = c.getContext("2d"), W = c.width, H = c.height, [a, b, d] = HOLO_SLIDES[k];
    x.clearRect(0, 0, W, H);
    const g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, "rgba(20,8,30,.82)"); g.addColorStop(1, "rgba(60,10,50,.82)"); x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.strokeStyle = "rgba(255,207,74,.95)"; x.lineWidth = 4; x.strokeRect(14, 14, W - 28, H - 28); x.strokeStyle = "rgba(255,47,208,.6)"; x.lineWidth = 2; x.strokeRect(24, 24, W - 48, H - 48);
    // a gown silhouette
    x.save(); x.translate(W * 0.8, H * 0.5); x.fillStyle = "rgba(255,255,255,.9)"; x.beginPath(); x.arc(0, -H * 0.3, H * 0.05, 0, 7); x.fill(); x.beginPath(); x.moveTo(-H * 0.05, -H * 0.24); x.lineTo(H * 0.05, -H * 0.24); x.lineTo(H * 0.035, -H * 0.06); x.quadraticCurveTo(H * 0.2, H * 0.2, H * 0.2, H * 0.34); x.lineTo(-H * 0.2, H * 0.34); x.quadraticCurveTo(-H * 0.2, H * 0.2, -H * 0.035, -H * 0.06); x.closePath(); x.fill(); x.restore();
    x.textBaseline = "middle"; x.fillStyle = "#ffcf4a"; x.font = `700 ${Math.round(H * 0.24)}px Georgia, "Times New Roman", serif`; x.fillText(a, W * 0.07, H * 0.32);
    x.fillStyle = "#ffffff"; x.font = `600 ${Math.round(H * 0.11)}px Mukta, sans-serif`; x.fillText(b, W * 0.07, H * 0.58);
    x.fillStyle = "rgba(255,180,230,.95)"; x.font = `500 ${Math.round(H * 0.075)}px Mukta, sans-serif`; x.fillText(d, W * 0.07, H * 0.76);
  }
  function holoBoard(w, h, k) {
    const c = document.createElement("canvas"); c.width = 768; c.height = Math.round(768 * h / w); drawHolo(c, k % HOLO_SLIDES.length);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    const m = new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity: 0.92, side: THREE.DoubleSide, depthWrite: false, fog: false });
    const g = new THREE.Group(), pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); g.add(pl);
    const base = new THREE.Mesh(new THREE.BoxGeometry(w * 0.7, 0.05, 0.15), new THREE.MeshStandardMaterial({ color: 0x111111, emissive: 0x19e6ff, emissiveIntensity: 1.5 })); base.position.y = -h / 2 - 0.25; g.add(base); neonMats.push(base.material);
    const beam = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.68, 0.45), new THREE.MeshBasicMaterial({ color: 0x19e6ff, transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); beam.position.y = -h / 2 - 0.02; g.add(beam);
    holos.push({ o: g, tex: t, cv: c, slide: k % HOLO_SLIDES.length, last: performance.now() + k * 900 });
    return g;
  }
  function holoLogo(x, z) {
    const c = document.createElement("canvas"); c.width = 1024; c.height = 128; const g2 = c.getContext("2d");
    g2.font = "700 92px Georgia, serif"; g2.textBaseline = "middle"; g2.fillStyle = "#ff4f9a"; for (let i = 0; i < 4; i++) { g2.fillText("FXN", 30 + i * 256, 64); g2.fillStyle = i % 2 ? "#ff4f9a" : "#ffcf4a"; }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding;
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.5, 48, 1, true), new THREE.MeshBasicMaterial({ map: t, transparent: true, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    const disc = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.2, 48), new THREE.MeshBasicMaterial({ color: 0xff2fd0, transparent: true, opacity: 0.5, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); disc.rotation.x = -Math.PI / 2; disc.position.y = -0.4;
    g.add(ring, disc); g.position.set(x, 5.2, z); scene.add(g);
    holos.push({ o: g, spin: true, pulse: true });
  }
  // KSEB power poles with sagging wires: the most Kerala thing on any street
  function powerLines() {
    const poles = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (at(x, y) !== SIDE || nearSpot(x, y) || doors.some(d => Math.abs(d.x - x) <= 1 && Math.abs(d.y - y) <= 1)) continue;
      const vRoad = at(x + 1, y) === ROAD || at(x - 1, y) === ROAD, hRoad = at(x, y + 1) === ROAD || at(x, y - 1) === ROAD;
      if ((vRoad && y % 6 === 2) || (hRoad && !vRoad && x % 6 === 4)) poles.push({ x: x + (at(x + 1, y) === ROAD ? 0.85 : at(x - 1, y) === ROAD ? 0.15 : 0.5), z: y + (at(x, y + 1) === ROAD ? 0.85 : at(x, y - 1) === ROAD ? 0.15 : 0.5), v: vRoad });
    }
    if (!poles.length) return;
    const parts = [], H = 2.1, pts = [];
    poles.forEach(p => { parts.push(P(new THREE.BoxGeometry(0.07, H, 0.07), col("#a9a59c"), p.x, H / 2, p.z, 0, 0, 0, 1, 1, 1), P(new THREE.BoxGeometry(p.v ? 0.05 : 0.5, 0.05, p.v ? 0.5 : 0.05), col("#6d6a64"), p.x, H - 0.12, p.z)); });
    const m = new THREE.Mesh(mergeGeos(parts), vcMatRough); m.castShadow = true; scene.add(m);
    poles.forEach((p, i) => {
      const q = poles.find((o2, j) => j > i && o2.v === p.v && (p.v ? Math.abs(o2.x - p.x) < 0.2 && o2.z > p.z && o2.z - p.z < 7.5 : Math.abs(o2.z - p.z) < 0.2 && o2.x > p.x && o2.x - p.x < 7.5));
      if (!q) return;
      [-0.2, 0.2].forEach(off => { const ax = p.x + (p.v ? 0 : 0), az = p.z, ox = p.v ? off : 0, oz = p.v ? 0 : off; for (let k = 0; k < 8; k++) { const t0 = k / 8, t1 = (k + 1) / 8, sag = t => Math.sin(Math.PI * t) * 0.22; pts.push(ax + ox + (q.x - p.x) * t0, H - 0.1 - sag(t0), az + oz + (q.z - p.z) * t0, ax + ox + (q.x - p.x) * t1, H - 0.1 - sag(t1), az + oz + (q.z - p.z) * t1); } });
    });
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    scene.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x1d1d1f, transparent: true, opacity: 0.75 })));
  }
  function bushes() {
    const R = rng(88), list = [];
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) { const t = at(x, y); if ((t === GRASS && R() < 0.22) || (t === PLAZA && at(x - 1, y) !== WATER && at(x + 1, y) === ROAD && y % 4 === 1)) if (!nearSpot(x, y)) list.push([x + 0.2 + R() * 0.6, y + 0.2 + R() * 0.6, 0.7 + R() * 0.6, R() * 6]); }
    if (!list.length) return;
    const parts = [], R2 = rng(5);
    for (let i = 0; i < 5; i++) parts.push(P(new THREE.IcosahedronGeometry(0.16, 1), col("#2f6b2a").lerp(col("#4f8a3a"), R2()), (R2() - 0.5) * 0.25, 0.14 + R2() * 0.08, (R2() - 0.5) * 0.25, 0, 0, 0, 1.1, 0.85, 1.1));
    for (let i = 0; i < 7; i++) parts.push(P(new THREE.SphereGeometry(0.03, 6, 4), col(i % 3 ? "#e0283a" : "#f2a33b"), (R2() - 0.5) * 0.36, 0.18 + R2() * 0.12, (R2() - 0.5) * 0.36));
    const im = new THREE.InstancedMesh(mergeGeos(parts), vcMat, list.length), m4 = new THREE.Matrix4();
    list.forEach(([x, z, sc, r], i) => { m4.compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, r, 0)), new THREE.Vector3(sc, sc, sc)); im.setMatrixAt(i, m4); });
    im.castShadow = true; scene.add(im);
  }
  // coconut palms along the mainland's pavements
  function roadPalms() {
    const R = rng(404), list = [];
    for (let y = 0; y < ROWS; y++) for (let x = 39; x < COLS; x++) {
      if (at(x, y) !== SIDE || (x + y * 3) % 5 || nearSpot(x, y) || doors.some(d => Math.abs(d.x - x) <= 1 && d.y === y)) continue;
      if (![[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => at(x + dx, y + dy) === ROAD)) continue;
      list.push({ x: x + 0.5, z: y + 0.5, s: 0.85 + R() * 0.3, r: R() * 6.3 });
    }
    if (!list.length) return;
    const im = new THREE.InstancedMesh(palmGeometry(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85, side: THREE.DoubleSide }), list.length), m4 = new THREE.Matrix4();
    list.forEach((p, i) => { m4.compose(new THREE.Vector3(p.x, 0, p.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, p.r, 0)), new THREE.Vector3(p.s * 0.75, p.s * 0.75, p.s * 0.75)); im.setMatrixAt(i, m4); });
    im.castShadow = true; scene.add(im);
  }
  const TOWN = {
    KL: [["Chaya chettan", "chaya", 1], ["Auto chettan", "auto"], ["Ammachi", "ammachi"], ["Lottery seller", "lottery", 1], ["Fisherman", "fisher"], ["College student", "student"], ["Techie", "techie"], ["Tourist", "tourist"], ["Uncle", "uncle"], ["Aunty", "aunty"], ["Fish seller", "fishseller", 1], ["FXN rider", "delivery"], ["Jogger", "jogger"], ["Tourist", "tourist"], ["Student", "student"], ["Ammachi", "ammachi"]],
    other: [["Shopkeeper", "generic", 1], ["Student", "student"], ["Commuter", "generic"], ["Office-goer", "techie"], ["Malayali tourist", "generic"], ["Auto driver", "auto"]]
  };
  function townsfolk(o) {
    const list = TOWN[o.stateId === "KL" ? "KL" : "other"], R = rng(hashNum(o.stateId + "folk"));
    const fixed = isKochi ? { chaya: [36, 28], lottery: [45, 22], fishseller: [7, 29] } : {};
    list.forEach(([nm, amb, stat], i) => {
      let t = stat && fixed[amb] ? { x: fixed[amb][0], y: fixed[amb][1] } : randomDoor(R());
      t = nearestWalk(t) || t;
      // each type of townsperson has a typical Kochi look; everything else (face, hair, colours) is random
      const T = {
        chaya: [false, true, { facial: "kerala", top: "tank" }, { top: "#f4f1e8", bottom: "#f4f1e8", style: "mundu", trim: "#c9a227" }],
        auto: [false, false, { top: "shirt", topC: 14, bottom: "trousers", botC: 14, facial: "moustache", shoes: "chappal" }],
        ammachi: [true, true, { hair: "bun", hairColor: 7, glasses: "round" }, { top: "#f7f3e8", bottom: "#f7f3e8", style: "mundu", trim: "#c9a227" }],
        lottery: [false, true, { top: "shirt", glasses: "square", shoes: "chappal" }, { top: "#e8d9b5", bottom: "#f4f1e8", style: "mundu", trim: "#c9a227" }],
        fisher: [false, false, { top: "tank", facial: "stubble", shoes: "chappal", hat: "none" }, { top: "#e8d9b5", bottom: "#2f6db0", style: "mundu", trim: "#1e4f86" }],
        student: [undefined, false, { shoes: "sneakers", bottom: "jeans", facial: "none", top: "tee" }],
        techie: [undefined, false, { top: "polo", bottom: "trousers", shoes: "sneakers" }],
        tourist: [undefined, false, { top: "tee", bottom: "shorts", hat: "cap", glasses: "shades", shoes: "sandals", skin: 8, hairColor: 8 }],
        uncle: [false, true, { facial: "kerala", hairColor: 4, top: "shirt" }, { top: ["#f7f3e8", "#7aa6c9", "#e8d9b5"][i % 3], bottom: "#f7f3e8", style: "mundu", trim: "#c9a227" }],
        aunty: [true, false, { hair: "braid", hat: "jasmine", bindi: "red" }, { top: ["#2a7f62", "#9b1c2c", "#e2574c"][i % 3], bottom: ["#2a7f62", "#9b1c2c", "#e2574c"][i % 3], style: "saree", trim: "#d4af37" }],
        fishseller: [true, false, { hair: "bun", ears: "studs" }, { top: "#3f5fc4", bottom: "#3f5fc4", style: "saree", trim: "#f4a52b" }],
        delivery: [false, false, { hat: "cap", hatC: 6 }, { top: "#ff4f9a", bottom: "#2a2742", style: "sport", trim: "#ffffff" }],
        jogger: [undefined, false, { shoes: "sneakers", hat: "none" }, { top: ["#22b5a6", "#e2574c"][i % 2], bottom: "#1b1b1f", style: "sport", trim: "#ffffff" }]
      }[amb] || [undefined, false, {}];
      const av = PEOPLE.random(o.stateId + nm + i, { fem: T[0], old: T[1], set: T[2] });
      const outfit = T[3] || null;
      const f = addFig("town_" + i, "walker", av, outfit, nm, t.x + 0.5, t.y + 0.5);
      f.amb = amb; f.stat = !!stat; f.cool = 0; f.heading = R() * 6; place(f);
    });
  }
  // cast roles: m/v are men, f (friend) and p (mother) are women; townsfolk vary
  function npcLook(seed, role, fem) {
    const F = fem != null ? fem : role === "f" || role === "p" ? true : role === "m" || role === "v" ? false : undefined;
    const set = role === "m" ? { glasses: "square", top: "shirt" } : role === "v" ? { hat: "cap", hatC: 10 } : role === "p" ? { hair: "bun" } : {};
    return PEOPLE.random(seed + "|" + role, { fem: F, old: role === "p", set });
  }
  function resize() {
    if (!el || !el.isConnected || !ok3d) return;
    const view = el.querySelector(".w3-view"), w = view.clientWidth || 360, h = view.clientHeight || 380;
    renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
    if (mapEl && !mapEl.hidden) { sizeMap(); clampMap(); drawFull(performance.now()); }
  }

  // ═══ input ═══
  function bindInput() {
    const view = el.querySelector(".w3-view");
    let down = null, pinch0 = 0;
    view.addEventListener("pointerdown", e => {
      if (e.target.closest(".joy,.minimap,.map-full,.cam-btns,.w-ui,.say-panel,.lab,.msg-panel,.w-toast")) return;
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (Object.keys(pointers).length === 2) { const p = Object.values(pointers); pinch0 = Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y); down = null; return; }
      down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, drag: false }; try { view.setPointerCapture(e.pointerId); } catch (er) { }
    });
    view.addEventListener("pointermove", e => {
      if (pointers[e.pointerId]) pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      const ps = Object.values(pointers);
      if (ps.length === 2 && pinch0) { const d = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y); dist = Math.max(1.6, Math.min(14, dist * pinch0 / d)); pinch0 = d; lastDrag = performance.now(); return; }
      if (!down) return;
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6 || down.drag) {
        down.drag = true;
        yaw -= (e.clientX - down.lx) * 0.008;
        pitch = Math.max(0.08, Math.min(1.45, pitch + (e.clientY - down.ly) * 0.006));
        down.lx = e.clientX; down.ly = e.clientY; lastDrag = performance.now();
      }
    });
    const up = e => { delete pointers[e.pointerId]; if (Object.keys(pointers).length < 2) pinch0 = 0; if (down && !down.drag && e.type === "pointerup") tap(e); down = null; };
    view.addEventListener("pointerup", up); view.addEventListener("pointercancel", up);
    view.addEventListener("wheel", e => { e.preventDefault(); dist = Math.max(1.6, Math.min(14, dist * (e.deltaY > 0 ? 1.1 : 0.9))); lastDrag = performance.now(); }, { passive: false });
    el.querySelector(".cam-spin").addEventListener("click", () => { spin = Math.PI * 2; lastDrag = performance.now(); });
    el.querySelector(".cam-zoom").addEventListener("click", () => { if (dist < 6) { dist = 9; pitch = 0.95; } else { dist = 2.9; pitch = 0.42; } });
    el.querySelector(".minimap").addEventListener("click", openMap);
    el.querySelector(".map-close").addEventListener("click", () => { mapEl.hidden = true; });
    const joyEl = el.querySelector(".joy"), knob = joyEl.querySelector("i");
    const jmove = e => { const r = joyEl.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2; let dx = (e.clientX - cx) / (r.width / 2), dy = (e.clientY - cy) / (r.height / 2); const n = Math.hypot(dx, dy); if (n > 1) { dx /= n; dy /= n; } joy.x = dx; joy.y = dy; knob.style.transform = `translate(${dx * 28}px, ${dy * 28}px)`; };
    joyEl.addEventListener("pointerdown", e => { e.stopPropagation(); joy.on = true; try { joyEl.setPointerCapture(e.pointerId); } catch (er) { } jmove(e); });
    joyEl.addEventListener("pointermove", e => { if (joy.on) jmove(e); });
    const jend = () => { if (!joy.on) return; joy.on = false; joy.x = joy.y = 0; knob.style.transform = ""; sendMe(true, null, true); };
    joyEl.addEventListener("pointerup", jend); joyEl.addEventListener("pointercancel", jend);
    actBtn.addEventListener("click", () => { if (!nearKey) return; const s = spots[nearKey]; if (s && s.ride && !(opts.spotLabel && opts.spotLabel(nearKey))) return startRide(nearKey); if (opts.onSpot) opts.onSpot(nearKey); });
    const sayPanel = el.querySelector(".say-panel"), chatRow = el.querySelector(".chat-row");
    el.querySelector(".say").addEventListener("click", () => { sayPanel.hidden = !sayPanel.hidden; chatRow.hidden = true; });
    el.querySelector(".chat").addEventListener("click", () => { if (opts.onChatOpen && !opts.onChatOpen()) return; chatRow.hidden = !chatRow.hidden; sayPanel.hidden = true; if (!chatRow.hidden) chatRow.querySelector("input").focus(); });
    sayPanel.addEventListener("click", e => { const b = e.target.closest("[data-say]"); if (!b) return; sayPanel.hidden = true; if (opts.onSay) opts.onSay(b.dataset.kind, +b.dataset.say); });
    chatRow.addEventListener("submit", e => { e.preventDefault(); const inp = chatRow.querySelector("input"); const v = inp.value.trim(); if (v && opts.onType && opts.onType(v) !== false) inp.value = ""; });
    banner.querySelector(".w-banner-a").addEventListener("click", e => { const b = e.target.closest("[data-gact]"); if (b && opts.onGuideAction) opts.onGuideAction(b.dataset.gact); });
  }
  const KEYMAP = { ArrowUp: "f", w: "f", W: "f", ArrowDown: "b", s: "b", S: "b", ArrowLeft: "l", a: "l", A: "l", ArrowRight: "r", d: "r", D: "r", q: "tl", Q: "tl", e: "tr", E: "tr" };
  function kd(e) { if (!el || !el.isConnected || /input|textarea|select/i.test((document.activeElement || {}).tagName || "")) return; const k = KEYMAP[e.key]; if (k) { keys[k] = true; e.preventDefault(); } }
  function ku(e) { const k = KEYMAP[e.key]; if (k) { keys[k] = false; if (!keys.f && !keys.b && !keys.l && !keys.r) sendMe(true, null, true); } }

  function tap(e) {
    if (!ok3d || ride) return;
    const r = renderer.domElement.getBoundingClientRect();
    const v = new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(v, camera);
    const remotes = Object.values(figs).filter(f => f.kind === "remote" && f.mesh).map(f => f.mesh.group);
    const hitR = ray.intersectObjects(remotes, true)[0];
    if (hitR) { let o = hitR.object; while (o && o.userData.figId === undefined) o = o.parent; const f = o && figs[o.userData.figId]; if (f && opts.onRemoteTap) opts.onRemoteTap(f.rid, f.name); return; }
    const hit = ray.intersectObject(groundMesh)[0];
    if (!hit) return;
    me.path = isFly(me.vehType) ? [{ x: hit.point.x, z: hit.point.z }] : toPts(path(tileOf(me), { x: Math.floor(hit.point.x), y: Math.floor(hit.point.z) }));
    sendMe(true, me.path.length ? me.path[me.path.length - 1] : null);
    tapMarker(hit.point.x, hit.point.z);
  }
  let tapFx = null;
  function tapMarker(x, z) {
    if (!tapFx) { tapFx = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.22, 24), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthWrite: false })); tapFx.rotation.x = -Math.PI / 2; scene.add(tapFx); }
    tapFx.position.set(x, 0.03, z); tapFx.userData.t = performance.now(); tapFx.visible = true;
  }
  // Tell others where you're heading: the tap target, or (joystick) the walkable point you'll reach in about a second.
  function sendMe(force, target, exact) {
    const now = performance.now();
    if (!force && now - lastMoveSent < 1000) return;
    lastMoveSent = now;
    let t = target ? { x: Math.floor(target.x), y: Math.floor(target.z) } : null;
    if (!t && !exact && me.free && me.vel) for (let k = 1; k >= 0 && !t; k -= 0.2) { const x = Math.floor(me.x + me.vel.x * k), y = Math.floor(me.z + me.vel.z * k); if (walk(x, y)) t = { x, y }; }
    t = t || tileOf(me);
    if (opts.onMove) opts.onMove(t.x, t.y);
  }

  // ═══ simulation ═══
  function stepPath(f, dt, speed) {
    if (!f.path.length) { f.moving = false; return; }
    const t = f.path[0], dx = t.x - f.x, dz = t.z - f.z, d = Math.hypot(dx, dz), s = (speed || SPEED) * dt;
    if (d > 0.001) f.heading = lerpAng(f.heading, Math.atan2(dx, dz), Math.min(1, dt * 12));
    if (d <= s) { f.x = t.x; f.z = t.z; f.path.shift(); } else { f.x += dx / d * s; f.z += dz / d * s; }
    f.moving = true;
  }
  const lerpAng = (a, b, t) => a + angDiff(a, b) * t;
  function freeMove(dt) {
    if (ride) return true;
    if (keys.tl) yaw += dt * 2; if (keys.tr) yaw -= dt * 2;
    let fwd = (keys.f ? 1 : 0) - (keys.b ? 1 : 0) - joy.y, str = (keys.r ? 1 : 0) - (keys.l ? 1 : 0) + joy.x;
    const n = Math.hypot(fwd, str);
    if (n < 0.15) return false;
    if (n > 1) { fwd /= n; str /= n; }
    const fx = Math.sin(yaw), fz = Math.cos(yaw), rx = -Math.cos(yaw), rz = Math.sin(yaw);
    const sp = SPEED * vehMult(me.vehType) * Math.min(1, n), vx = fx * fwd + rx * str, vz = fz * fwd + rz * str, s = sp * dt;
    me.vel = { x: vx * sp, z: vz * sp };
    me.path = [];
    const nx = me.x + vx * s, nz = me.z + vz * s;
    if (isFly(me.vehType)) { me.x = Math.max(0.3, Math.min(COLS - 0.3, nx)); me.z = Math.max(0.3, Math.min(ROWS - 0.3, nz)); }
    else { if (walk(Math.floor(nx), Math.floor(me.z))) me.x = nx; if (walk(Math.floor(me.x), Math.floor(nz))) me.z = nz; }
    me.heading = lerpAng(me.heading, Math.atan2(vx, vz), Math.min(1, dt * 14)); me.moving = true; me.free = true; me.speedK = n;
    sendMe(false);
    return true;
  }
  function animate(f, dt) {
    if (!f.mesh) return;
    const M = f.mesh;
    if (f.veh) {
      const V = f.veh.spec, d = Math.hypot(f.x - (f.px || f.x), f.z - (f.pz || f.z)); f.px = f.x; f.pz = f.z;
      f.veh.wheels.forEach(w => { w.rotation.x += d / Math.max(0.05, w.scale.y); });
      const turn = angDiff(f.ph2 || f.heading, f.heading) / Math.max(dt, 0.001); f.ph2 = f.heading;
      f.lean = (f.lean || 0) + ((V.two && f.moving ? Math.max(-0.3, Math.min(0.3, -turn * 0.06)) : 0) - (f.lean || 0)) * Math.min(1, dt * 6);
      if (V.two) {
        const ped = f.veh.type === "cycle" && f.moving ? Math.sin(f.ph += dt * 9) * 0.35 : 0;
        M.legs[0].rotation.x = -1.3 + ped; M.legs[1].rotation.x = -1.3 - ped; M.knees[0].rotation.x = 1.25 - ped * 0.6; M.knees[1].rotation.x = 1.25 + ped * 0.6;
        M.legs[0].rotation.z = -0.12; M.legs[1].rotation.z = 0.12;
        M.arms[0].rotation.x = M.arms[1].rotation.x = -1.05; M.arms[0].rotation.z = -0.22; M.arms[1].rotation.z = 0.22; M.elbows[0].rotation.x = M.elbows[1].rotation.x = -0.35;
      }
      if (V.fly && !(f === me && (ride || mride))) { const tgt = Math.max(V.fly, roofAt(f.x, f.z) + 0.7, roofAt(f.x + Math.sin(f.heading) * 0.8, f.z + Math.cos(f.heading) * 0.8) + 0.7); f.alt = (f.alt || 0) + (tgt - (f.alt || 0)) * Math.min(1, dt * 2.5); f.ride = f.alt + Math.sin(performance.now() / 400 + f.ph) * 0.04; if (f.veh.shadow) f.veh.shadow.position.y = -f.ride + 0.015 + roofAt(f.x, f.z); }
      M.head.rotation.y = f.look || 0; f.y = 0; place(f); return;
    }
    const k = f.moving ? 1 : 0;
    M.legs[0].rotation.z = M.legs[1].rotation.z = 0;
    f.ph += dt * (f.moving ? (f.kind === "walker" ? 7 : 10) : 0);
    f.blend = (f.blend || 0) + (k - (f.blend || 0)) * Math.min(1, dt * 8);
    const s = Math.sin(f.ph), b = f.blend;
    M.legs[0].rotation.x = -s * 0.6 * b; M.legs[1].rotation.x = s * 0.6 * b;
    M.knees[0].rotation.x = Math.max(0, Math.sin(f.ph - 1.2)) * 0.9 * b; M.knees[1].rotation.x = Math.max(0, -Math.sin(f.ph - 1.2)) * 0.9 * b;
    M.arms[0].rotation.x = s * 0.5 * b; M.arms[1].rotation.x = -s * 0.5 * b;
    M.arms[0].rotation.z = -0.08; M.arms[1].rotation.z = 0.08;
    M.elbows[0].rotation.x = -0.25 - Math.max(0, s) * 0.3 * b; M.elbows[1].rotation.x = -0.25 - Math.max(0, -s) * 0.3 * b;
    if (f.carry) { M.arms[0].rotation.x = M.arms[1].rotation.x = -0.95; M.arms[0].rotation.z = 0.12; M.arms[1].rotation.z = -0.12; M.elbows[0].rotation.x = M.elbows[1].rotation.x = -0.75; }
    if (f.wave) { M.arms[1].rotation.z = 2.5; M.arms[1].rotation.x = 0; M.elbows[1].rotation.x = -0.4 + Math.sin(performance.now() / 90) * 0.35; }
    const breathe = Math.sin(performance.now() / 700 + f.ph) * 0.006 * (1 - b);
    f.y = Math.abs(Math.cos(f.ph)) * 0.012 * b + (f.ride || 0);
    M.torso.scale.set(1 + breathe, 1 + breathe, 1 + breathe);
    M.head.rotation.y = f.look || 0;
    place(f);
  }
  const angDiff = (a, b) => { let d = b - a; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

  // ── ferry ride between Marine Drive and Fort Kochi ──
  function startRide(from) {
    const to = spots[from].ride; if (!ferry || ride) return;
    const A = from === "ferryMD" ? [35.4, 19.5] : [19.4, 24.5], B = from === "ferryMD" ? [19.4, 24.5] : [35.4, 19.5];
    ride = { A, B, t: 0, to, dur: 7 };
    me.path = []; el.querySelector(".ride-cap").hidden = false; actBtn.hidden = true;
    SND.sfx("ferryHorn");
    if (opts.onRide) opts.onRide(to);
  }
  function stepRide(dt) {
    ride.t += dt / ride.dur; const t = Math.min(1, ride.t), e = t * t * (3 - 2 * t);
    const x = ride.A[0] + (ride.B[0] - ride.A[0]) * e, z = ride.A[1] + (ride.B[1] - ride.A[1]) * e;
    ferry.m.position.set(x, Math.sin(performance.now() / 500) * 0.02, z); ferry.m.rotation.y = Math.atan2(ride.B[0] - ride.A[0], ride.B[1] - ride.A[1]);
    me.x = x; me.z = z; me.ride = 0.3; me.moving = false; me.heading = ferry.m.rotation.y;
    if (t >= 1) {
      const d = spots[ride.to]; me.x = d.x + 0.5; me.z = d.y + 0.5; me.ride = 0; inside[ride.to] = true;
      el.querySelector(".ride-cap").hidden = true; ride = null; sendMe(true);
    }
  }

  // ── Kochi Metro ride: you board at the station above MG Road and the camera rides along on the viaduct ──
  let mride = null;
  const SND = window.AE_SOUND || { sfx() { }, ambience() { }, engine() { }, setNight() { }, announce() { }, icon: () => "🔊", cycle() { } };
  function startMetro(fromKey, toKey) {
    if (!metroTrain || mride || ride || !spots[fromKey] || !spots[toKey]) return false;
    const A = spots[fromKey].z, B = spots[toKey].z, D = Math.abs(B - A);
    mride = { A, B, t: 0, dur: 2.5 + D / 4.2, to: toKey, d0: dist, p0: pitch };
    setVehicle(null); me.path = []; actBtn.hidden = true; if (me.mesh) me.mesh.group.visible = false; me.lab.style.visibility = "hidden";
    const cap = el.querySelector(".ride-cap"); cap.textContent = "🚇 Kochi Metro → " + spots[toKey].label.replace(" Metro", ""); cap.hidden = false;
    metroTrain.wait = 0; metroTrain.m.position.z = A; metroTrain.z = A;
    SND.sfx("doors"); setTimeout(() => { SND.sfx("metroChime"); SND.announce("Next station, " + spots[toKey].label.replace(" Metro", "")); }, 700);
    return true;
  }
  function stepMetroRide(dt) {
    const R2 = mride; R2.t += dt / R2.dur; const t = Math.min(1, R2.t), e = t * t * (3 - 2 * t), z = R2.A + (R2.B - R2.A) * e;
    metroTrain.z = z; metroTrain.m.position.z = z; metroTrain.dir = R2.B > R2.A ? 1 : -1;
    me.x = K.metro.x; me.z = z; me.ride = metroTrain.y + 0.05; me.moving = false; me.heading = R2.B > R2.A ? 0 : Math.PI;
    dist += (6.5 - dist) * Math.min(1, dt * 1.5); pitch += (0.42 - pitch) * Math.min(1, dt * 1.5); const side = Math.sin(me.heading + 0.95) > 0 ? 0.95 : -0.95; yaw += angDiff(yaw, me.heading + side) * Math.min(1, dt * 1.5); // camera on the backwaters side, above the rooftops
    if (t >= 1) {
      const d = spots[R2.to]; me.x = d.x + 0.5; me.z = d.y + 0.5; me.ride = 0; inside[R2.to] = true; dist = R2.d0; pitch = R2.p0;
      if (me.mesh) me.mesh.group.visible = true; me.lab.style.visibility = ""; el.querySelector(".ride-cap").hidden = true;
      metroTrain.last = R2.B; metroTrain.wait = 3; mride = null; sendMe(true); SND.sfx("metroChime"); SND.sfx("doors"); SND.engine(null);
      if (opts.onMetro) opts.onMetro(R2.to);
    }
  }

  // ── sound: footsteps, engine and the ambient mix follow you around ──
  let stepAcc = 0, stepK = 0, sndT = 0, lastPos = null;
  function soundTick(dt, time) {
    const moved = lastPos ? Math.hypot(me.x - lastPos.x, me.z - lastPos.z) : 0; lastPos = { x: me.x, z: me.z };
    if (!me.vehType && !ride && !mride && moved > 0.001 && moved < 0.5) { stepAcc += dt; if (stepAcc > 0.29) { stepAcc = 0; stepK = 1 - stepK; SND.sfx("step", stepK ? 1 : 0.7); } } else stepAcc = 0.2;
    if (time - sndT < 250) return; sndT = time;
    if (mride) SND.engine("metro", 0.8); else if (me.vehType && !ride) SND.engine(isFly(me.vehType) ? "metro" : me.vehType, me.moving || me.free ? 1 : 0.1); else SND.engine(null);
    const tx = Math.floor(me.x), ty = Math.floor(me.z); let w = 0, gr = 0, rd = 0, n = 0;
    for (let dy = -4; dy <= 4; dy += 2) for (let dx = -4; dx <= 4; dx += 2) { const t = at(tx + dx, ty + dy); n++; if (t === WATER || t === SAND || t === JETTY) w++; else if (t === GRASS || t === TREE) gr++; else if (t === ROAD || t === BRIDGE) rd++; }
    const h = dbgHour != null ? dbgHour : opts.hour ? opts.hour() : 12, nightK = h < 5.5 || h > 19 ? 1 : 0;
    SND.ambience({ water: Math.min(1, w / n * 2.5 + (ride ? 1 : 0)), park: Math.min(1, gr / n * 3), city: mride ? 0.2 : Math.min(1, 0.25 + rd / n * 2) * (nightK ? 0.4 : 1), night: nightK });
    SND.setNight(nightK);
  }

  // ── day and night ──
  const KEYS = [[0, "#0b1430", "#1c2340", 0.0, 0.18, "#2a3355"], [5, "#1c2a55", "#7a5a6a", 0.1, 0.25, "#556"], [6.5, "#5d86c8", "#f5b38a", 1.2, 0.5, "#f5b38a"], [9, "#4f8fd8", "#cfe3f4", 2.4, 0.7, "#dfe9f1"], [16, "#4f8fd8", "#e9e6da", 2.3, 0.7, "#ece5d3"], [18, "#3b5f9e", "#f7a96a", 1.4, 0.5, "#f2b98a"], [19.2, "#1c2a55", "#b5677a", 0.3, 0.3, "#7a5a72"], [21, "#0b1430", "#1c2340", 0.0, 0.18, "#2a3355"], [24, "#0b1430", "#1c2340", 0.0, 0.18, "#2a3355"]];
  let lastHour = -1;
  function applyTime(h) {
    if (Math.abs(h - lastHour) < 0.02) return; lastHour = h;
    let i = 0; while (i < KEYS.length - 2 && KEYS[i + 1][0] <= h) i++;
    const a = KEYS[i], b = KEYS[i + 1], t = (h - a[0]) / Math.max(0.001, b[0] - a[0]);
    skyU.top.value.copy(col(a[1])).lerp(col(b[1]), t); skyU.bot.value.copy(col(a[2])).lerp(col(b[2]), t);
    sun.intensity = a[3] + (b[3] - a[3]) * t; hemi.intensity = (a[4] + (b[4] - a[4]) * t) * 0.7 + 0.08;
    scene.fog.color.copy(col(a[5])).lerp(col(b[5]), t);
    const ang = (h - 6) / 12 * Math.PI; sun.userData.dir = new THREE.Vector3(-Math.cos(ang) * 0.8, Math.max(0.15, Math.sin(ang)), 0.45).normalize();
    sun.color.set(h < 8 || h > 16.5 ? "#ffc58a" : "#fff1d8");
    skyU.sunDir.value.set(-Math.cos(ang) * 0.8, Math.sin(ang), 0.45).normalize(); skyU.sunC.value.copy(sun.color); skyU.sunK.value = h > 5.5 && h < 19 ? 1 : 0;
    const night = h < 6 || h > 18.6 ? 1 : h < 7 ? 1 - (h - 6) : h > 17.8 ? (h - 17.8) / 0.8 : 0;
    facadeMats.forEach(m => { m.emissiveIntensity = m.userData.sign ? 0.15 + night * 0.8 : night * 0.9; });
    neonMats.forEach(m => { m.emissiveIntensity = 0.9 + night * 2.4; });
    if (lampMat) lampMat.emissiveIntensity = night * 2.2;
    stars.material.opacity = night * 0.85;
    renderer.toneMappingExposure = 0.94 + night * 0.4;
    if (cloudMat) { cloudMat.color.copy(col("#ffffff")).lerp(scene.fog.color, 0.35).lerp(col("#2a3050"), night * 0.75); cloudMat.opacity = 0.92 - night * 0.45; }
    updateEnv(h);
  }

  function tick(time) {
    const dt = Math.min(0.05, (time - last) / 1000); last = time;
    me.free = false;
    if (ride) stepRide(dt);
    else if (mride) stepMetroRide(dt);
    else if (me.lock && time < me.lock) { me.path = []; me.moving = false; }
    else if (!freeMove(dt)) stepPath(me, dt, SPEED * vehMult(me.vehType));
    if (me.twirlT) { me.twirlT = Math.max(0, me.twirlT - dt); me.twirl = (1 - me.twirlT / 0.9) * Math.PI * 2; if (!me.twirlT) me.twirl = 0; }
    stepFx(dt);
    soundTick(dt, time);
    Object.values(figs).forEach(f => {
      if (f.kind === "remote") { let rem = 0, px = f.x, pz = f.z; f.path.forEach(p => { rem += Math.hypot(p.x - px, p.z - pz); px = p.x; pz = p.z; }); const base = SPEED * vehMult(f.vehType); stepPath(f, dt, Math.min(base * 2.5, Math.max(base, rem / 0.95))); }
      if (f.lead || f.homeward) { stepFollow(f, dt, time); return; }
      if (f.kind === "walker" && !f.stat) {
        if (f.pause && time < f.pause) { f.moving = false; return; }
        stepPath(f, dt, f.kid ? 1.4 : 1.25);
        if (!f.path.length) { if (Math.random() < dt * 0.5) { const t = f.home ? { x: f.home.x + Math.floor(Math.random() * 3) - 1, y: f.home.y + Math.floor(Math.random() * 2) } : randomDoor(Math.random()); f.path = toPts(path(tileOf(f), t)); } }
      }
      if (f.kind === "courier") stepCourier(f, dt, time);
    });
    ambient(time);
    if (ok3d && el && el.isConnected) {
      applyTime(dbgHour != null ? dbgHour : opts.hour ? opts.hour() : 17);
      if (cine && time < cine.until) { yaw += angDiff(yaw, cine.yaw) * Math.min(1, dt * 2.5); dist += (cine.dist - dist) * Math.min(1, dt * 2); pitch += (0.3 - pitch) * Math.min(1, dt * 2); }
      else if (cine) { dist = cine.back; cine = null; }
      else if (spin > 0) { const st = Math.min(spin, dt * Math.PI * 0.55); yaw += st; spin -= st; }
      else if (follow && me.moving && !me.free && performance.now() - lastDrag > 1500) yaw += angDiff(yaw, me.heading) * Math.min(1, dt * 2.2);
      else if (follow && me.free && performance.now() - lastDrag > 2500 && joy.on && Math.abs(joy.y) > 0.5 && joy.y < 0) yaw += angDiff(yaw, me.heading) * Math.min(1, dt * 1.2);
      Object.values(figs).forEach(f => animate(f, dt));
      // traffic gives way: brake for anyone in front, and edge sideways if there's room in the lane
      const people = Object.values(figs).filter(f => f.mesh && (f.mesh.group.visible || f.veh) && !isFly(f.vehType));
      vehicles.forEach(v => {
        const dx = v.b[0] - v.a[0], dz = v.b[1] - v.a[1], L = Math.hypot(dx, dz), nx = dx / L, nz = dz / L;
        const fx0 = nx * v.dir, fz0 = nz * v.dir, look = v.type === "bus" ? 2.4 : 1.8, halfW = v.type === "bus" ? 0.5 : 0.38;
        const cx0 = v.a[0] + dx * v.t - nz * 0.45 * v.dir + (-fz0) * (v.side || 0), cz0 = v.a[1] + dz * v.t + nx * 0.45 * v.dir + fx0 * (v.side || 0);
        let block = null;
        people.forEach(p => { const rx = p.x - cx0, rz = p.z - cz0, along = rx * fx0 + rz * fz0, lat = -rx * fz0 + rz * fx0; if (along > 0.1 && along < look && Math.abs(lat) < halfW + 0.22 && (!block || along < block.along)) block = { along, lat }; });
        const wantSide = block ? Math.max(-0.3, Math.min(0.3, (block.lat > 0 ? -1 : 1) * 0.3)) : 0;
        v.side = (v.side || 0) + (wantSide - (v.side || 0)) * Math.min(1, dt * 2.5);
        const stillBlocked = block && Math.abs(block.lat - (v.side || 0)) < halfW + 0.12;
        v.k = (v.k == null ? 1 : v.k) + ((stillBlocked ? (block.along < 0.9 ? 0 : 0.25) : 1) - (v.k == null ? 1 : v.k)) * Math.min(1, dt * (stillBlocked ? 6 : 1.5));
        v.t += v.sp * dt * v.dir * v.k; if (v.t > 1) { v.t = 1; v.dir = -1; } if (v.t < 0) { v.t = 0; v.dir = 1; }
        const off = 0.45 * v.dir, x = v.a[0] + dx * v.t - nz * off - fz0 * (v.side || 0), z = v.a[1] + dz * v.t + nx * off + fx0 * (v.side || 0);
        if (stillBlocked && block.along < 1.2 && time > (v.honk || 0) - 6000 && Math.hypot(x - me.x, z - me.z) < 6 && time > (v.beep || 0)) { v.beep = time + 4000; SND.sfx(v.type === "bus" ? "honkBus" : v.type === "auto" ? "honkAuto" : "honkCar"); }
        v.m.position.set(x, 0, z); v.m.rotation.y = Math.atan2(nx * v.dir, nz * v.dir);
        if (Math.hypot(x - me.x, z - me.z) < 1.0 && time > v.honk) { v.honk = time + 9000; ambientLine(null, "honk", x, z); SND.sfx(v.type === "bus" ? "honkBus" : v.type === "auto" ? "honkAuto" : "honkCar"); }
      });
      boats.forEach(b => { b.t += b.sp * dt * b.dir; if (b.t > 1 || b.t < 0) { b.dir *= -1; b.t = Math.max(0, Math.min(1, b.t)); } b.m.position.set(b.a[0] + (b.b[0] - b.a[0]) * b.t, Math.sin(time / 600 + b.t * 9) * 0.03, b.a[1] + (b.b[1] - b.a[1]) * b.t); b.m.rotation.y = b.dir > 0 ? 0 : Math.PI; });
      if (ferry && !ride) ferry.m.position.y = Math.sin(time / 550) * 0.025;
      spinners.forEach(g => { g.rotation.y += dt * 0.5; });
      if (metroTrain && !mride) stepMetro(dt);
      stepFlyers(dt, time);
      waterTex.offset.set(time * 0.000012, time * 0.000008);
      clouds.forEach((c, i) => { c.position.x += dt * (0.25 + (i % 3) * 0.1); if (c.position.x > COLS / 2 + 160) c.position.x -= 320; });
      const fx = Math.sin(yaw), fz = Math.cos(yaw), hz = Math.cos(pitch) * dist, vy = Math.sin(pitch) * dist;
      const ty = 0.42 + (me.y || 0) + (me.veh ? (me.veh.spec.car ? 0.15 : 0.06) + (me.veh.spec.fly ? me.ride || 0 : 0) : 0);
      camera.position.set(me.x - fx * hz, ty + vy, me.z - fz * hz);
      if (camera.position.y < 0.15) camera.position.y = 0.15;
      camera.lookAt(me.x + fx * 0.35 * Math.cos(pitch), ty, me.z + fz * 0.35 * Math.cos(pitch));
      sky.position.copy(camera.position); stars.position.copy(camera.position);
      const sd = sun.userData.dir || new THREE.Vector3(-0.4, 0.8, 0.45);
      sun.position.set(me.x + sd.x * 30, sd.y * 30, me.z + sd.z * 30); sun.target.position.set(me.x, 0, me.z); sun.target.updateMatrixWorld();
      if (time - miniT > 120) { miniT = time; drawMini(time); if (!mapEl.hidden) drawFull(time); }
      const g = guide && guide.key !== "courier" && spotPos(guide.key);
      beacon.visible = beaconRing.visible = !!g; if (g) { beacon.position.set(g.x, 3, g.z); beaconRing.position.set(g.x, 0.03, g.z); const sc = 1 + Math.sin(time / 300) * 0.12; beaconRing.scale.set(sc, sc, sc); }
      const sm = sceneMarker && spotPos(sceneMarker);
      bang.visible = !!sm; if (sm) bang.position.set(sm.x, 1.5 + Math.sin(time / 200) * 0.1, sm.z);
      if (tapFx && tapFx.visible) { const a = (time - tapFx.userData.t) / 600; tapFx.material.opacity = Math.max(0, 0.9 - a); tapFx.scale.setScalar(1 + a * 1.5); if (a > 1) tapFx.visible = false; }
      renderer.render(scene, camera);
      projectLabels();
    }
    let best = null, bd = 1.6;
    if (!ride && !mride) Object.keys(Object.assign({}, spots, extraSpots)).forEach(k => { const p = spotPos(k); if (!p) return; const d = Math.hypot(p.x - me.x, p.z - me.z); if (d < bd) { bd = d; best = k; } });
    if (best !== nearKey) { nearKey = best; const s = best && spots[best]; const lbl = best ? ((opts.spotLabel && opts.spotLabel(best)) || (s && s.rideLabel) || null) : null; actBtn.hidden = !lbl; if (lbl) actBtn.textContent = lbl; }
    if (!ride) [guide && guide.key, sceneMarker].forEach(k => {
      if (!k) return; const p = spotPos(k); if (!p) return;
      const d = Math.hypot(p.x - me.x, p.z - me.z);
      if (d > 2.2) { inside[k] = false; return; }
      if (d < 1.3 && !inside[k]) { inside[k] = true; if (opts.onArrive) opts.onArrive(k); }
    });
    updateBanner();
    raf = requestAnimationFrame(tick);
  }

  // ── people talk as you pass (Manglish with English subtitles) ──
  function pickLine(kind) {
    const M = window.AE_MALLU; if (!M) return null;
    const pool = (M.ambient[kind] || []).concat(kind === "honk" ? [] : M.ambient.generic);
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  }
  function sayLine(f, line) {
    const mode = opts.langMode ? opts.langMode() : "ml";
    if (!line) return;
    if (mode === "en") bubble(f, line[1]); else bubble(f, line[0], mode === "ml" ? line[1] : null);
    log(f ? f.name : "", mode === "en" ? line[1] : line[0], "town");
  }
  function ambientLine(f, kind, x, z) {
    const line = pickLine(kind); if (!line) return;
    if (f) return sayLine(f, line);
    const near = Object.values(figs).filter(w => w.kind === "walker").sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0];
    if (near && Math.hypot(near.x - me.x, near.z - me.z) < 8) sayLine(near, line);
  }
  function ambient(time) {
    if (time - ambientT < 500) return; ambientT = time;
    if (time - lastAmb < 6000) return;
    const w = Object.values(figs).filter(f => f.kind === "walker" && f.amb && time > (f.cool || 0) && Math.hypot(f.x - me.x, f.z - me.z) < 2.6).sort((a, b) => Math.hypot(a.x - me.x, a.z - me.z) - Math.hypot(b.x - me.x, b.z - me.z))[0];
    if (!w) return;
    w.cool = time + 25000; lastAmb = time; w.pause = time + 2200; w.heading = Math.atan2(me.x - w.x, me.z - w.z);
    if (w.kid) { const n = (opts.kidLine && opts.kidLine(w.name)); if (n) { sayLine(w, n); return; } }
    sayLine(w, pickLine(w.amb));
  }
  // React to something the player did: a nearby person says a line from AE_MALLU.ev[cat]
  function react(cat) {
    const M = window.AE_MALLU; if (!M || !M.ev[cat] || !me) return;
    const line = M.ev[cat][Math.floor(Math.random() * M.ev[cat].length)];
    const near = Object.values(figs).filter(f => (f.kind === "walker" || f.kind === "npc") && Math.hypot(f.x - me.x, f.z - me.z) < 7).sort((a, b) => Math.hypot(a.x - me.x, a.z - me.z) - Math.hypot(b.x - me.x, b.z - me.z))[0];
    sayLine(near || me, line);
  }

  function spotPos(k) {
    if (["m", "f", "v", "p", "s"].indexOf(k) >= 0 && figs["npc_" + k]) return { x: figs["npc_" + k].x, z: figs["npc_" + k].z };
    if (k === "courier") return figs.courier ? { x: figs.courier.x, z: figs.courier.z } : null;
    const s = spots[k] || extraSpots[k]; return s ? { x: s.x + 0.5, z: s.y + 0.5 } : null;
  }
  function projectLabels() {
    const w = renderer.domElement.clientWidth, h = renderer.domElement.clientHeight, v = new THREE.Vector3(), now = performance.now();
    Object.values(figs).forEach(f => {
      v.set(f.x, (f.y || 0) + f.H + 0.12, f.z).project(camera);
      const d = Math.hypot(f.x - me.x, f.z - me.z);
      const hasBub = f.bubble && now < f.bubble.until;
      const vis = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2 && (d < (f.kind === "walker" ? (hasBub ? 12 : 6) : 16));
      f.lab.style.display = vis ? "" : "none";
      if (vis) { f.lab.style.transform = `translate(${(v.x + 1) / 2 * w}px, ${(1 - v.y) / 2 * h}px) translate(-50%, -100%)`; f.lab.style.opacity = d > 10 ? 0.6 : 1; }
      if (f.bubble && now > f.bubble.until) { f.bubble = null; f.lab.querySelector(".bub").hidden = true; }
    });
  }
  function updateBanner() {
    if (!banner) return;
    if (!guide) { banner.hidden = true; return; }
    banner.hidden = false;
    const p = guide.key && spotPos(guide.key), arrow = banner.querySelector(".arrow"), info = banner.querySelector(".w-banner-t span");
    if (p) {
      const ang = Math.atan2(p.x - me.x, p.z - me.z), rel = angDiff(yaw, ang), d = Math.hypot(p.x - me.x, p.z - me.z);
      arrow.style.transform = `rotate(${-rel - Math.PI / 2}rad)`; arrow.style.visibility = "visible";
      info.textContent = (guide.sub ? guide.sub + " · " : "") + Math.max(1, Math.round(d * 3)) + " m";
    } else { arrow.style.visibility = "hidden"; info.textContent = guide.sub || ""; }
  }

  let cap3d = null;
  function can3d() {
    if (el && el.isConnected && renderer) return ok3d;
    if (cap3d === null) { try { const c = document.createElement("canvas"); cap3d = !!(window.THREE && window.WebGLRenderingContext && (c.getContext("webgl") || c.getContext("experimental-webgl"))); } catch (e) { cap3d = false; } }
    return cap3d;
  }
  // ═══ maps: an illustrated city map (roads with names, pins, your route) for the minimap and the full map ═══
  const BP = 20; // base map pixels per tile
  const METRO_KEYS = ["metroKL", "metroMG", "metroES"];
  const PIN = { duty: ["⭐", "#f4a52b", 6], metroKL: ["🚇", "#16998c", 3], metroMG: ["🚇", "#16998c", 3], metroES: ["🚇", "#16998c", 3], m: ["💼", "#f4a52b", 3], house: ["🏠", "#8f6bff", 4], f: ["🌳", "#3f9b4a", 2], board: ["📋", "#16998c", 4], station: ["🚉", "#16998c", 3], hall: ["🏛️", "#8a3b3b", 3], fxn: ["👗", "#ff4f9a", 5], office: ["🏢", "#1f6b52", 3], bank: ["🏦", "#1f4e8c", 3], cafe: ["☕", "#8a5a3a", 2], mall: ["🛍️", "#6b4fa0", 2], hospital: ["🏥", "#d84343", 2], food: ["🍵", "#c98a2b", 2], ferryMD: ["⛴️", "#1f73b8", 2], ferryFK: ["⛴️", "#1f73b8", 2], garage: ["🛵", "#e0602b", 3], v: ["🏪", "#ef6a5f", 1], gig: ["📦", "#ff4f9a", 6], odd: ["🔧", "#e0a530", 6], grp: ["👥", "#16998c", 6] };
  let mv = { s: 12, cx: 0, cy: 0 }, route = null, routeT = 0;
  function mapImage() {
    const c = document.createElement("canvas"); c.width = COLS * BP; c.height = ROWS * BP;
    const x = c.getContext("2d"), R = rng(17), T = (tx, ty) => [tx * BP, ty * BP];
    const wg = x.createLinearGradient(0, 0, c.width, c.height); wg.addColorStop(0, "#9fd3e6"); wg.addColorStop(1, "#86c3dc"); x.fillStyle = wg; x.fillRect(0, 0, c.width, c.height);
    x.strokeStyle = "rgba(255,255,255,.35)"; x.lineWidth = 1.5;
    for (let i = 0; i < COLS * ROWS / 7; i++) { const tx = R() * COLS, ty = R() * ROWS; if (at(Math.floor(tx), Math.floor(ty)) !== WATER) continue; x.beginPath(); x.arc(tx * BP, ty * BP, 6, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); }
    const each = (fn) => { for (let y = 0; y < ROWS; y++) for (let xx = 0; xx < COLS; xx++) fn(xx, y, at(xx, y)); };
    // land with a soft shoreline
    x.save(); x.shadowColor = "rgba(20,70,90,.45)"; x.shadowBlur = 10; x.fillStyle = "#f2eee4"; x.beginPath();
    each((xx, y, t) => { if (t !== WATER) x.rect(xx * BP - 0.5, y * BP - 0.5, BP + 1, BP + 1); }); x.fill(); x.restore();
    const tileFill = { [SAND]: "#f5e3b3", [PLAZA]: "#f4e7cb", [GRASS]: "#bfe0a2", [TREE]: "#bfe0a2", [JETTY]: "#c9a77a" };
    each((xx, y, t) => { if (tileFill[t]) { x.fillStyle = tileFill[t]; x.fillRect(xx * BP, y * BP, BP, BP); } });
    x.fillStyle = "#8cc472"; trees.forEach(t => { x.beginPath(); x.arc((t.x + 0.5) * BP, (t.y + 0.5) * BP, BP * 0.38, 0, 7); x.fill(); });
    x.fillStyle = "rgba(90,150,70,.55)"; palmsList.forEach(p => { if (R() < 0.6) { x.beginPath(); x.arc(p.x * BP, p.z * BP, 3, 0, 7); x.fill(); } });
    // roads: casing, then fill; major roads in warm yellow; bridges darker casing
    const isMajor = (xx, y) => isKochi && K.major.some(r => xx >= r[0] && xx <= r[2] && y >= r[1] && y <= r[3]);
    const road = t => t === ROAD || t === BRIDGE;
    x.fillStyle = "#cfc6b4"; each((xx, y, t) => { if (road(t)) x.fillRect(xx * BP - 2, y * BP - 2, BP + 4, BP + 4); });
    x.fillStyle = "#9a9488"; each((xx, y, t) => { if (t === BRIDGE) x.fillRect(xx * BP - 2, y * BP - 2, BP + 4, BP + 4); });
    each((xx, y, t) => { if (road(t)) { x.fillStyle = isMajor(xx, y) ? "#ffe8a3" : "#ffffff"; x.fillRect(xx * BP, y * BP, BP, BP); } });
    // buildings
    const rr = (bx, by, bw, bh, r) => { x.beginPath(); x.moveTo(bx + r, by); x.arcTo(bx + bw, by, bx + bw, by + bh, r); x.arcTo(bx + bw, by + bh, bx, by + bh, r); x.arcTo(bx, by + bh, bx, by, r); x.arcTo(bx, by, bx + bw, by, r); x.closePath(); };
    blds.forEach(b => {
      const [px, py] = T(b.x, b.y), lm = b.big && b.big !== "lm";
      x.save(); x.shadowColor = "rgba(0,0,0,.18)"; x.shadowOffsetY = 2; x.shadowBlur = 3;
      rr(px + 2, py + 2, b.w * BP - 4, b.d * BP - 4, 4); x.fillStyle = lm ? BIGCOL[b.big] : b.big === "lm" ? "#ddd2bd" : "#e4ddcf"; x.globalAlpha = lm ? 0.55 : 1; x.fill(); x.restore();
      x.strokeStyle = lm ? BIGCOL[b.big] : "#cbc1ad"; x.lineWidth = 1.2; rr(px + 2, py + 2, b.w * BP - 4, b.d * BP - 4, 4); x.stroke();
    });
    // metro line
    if (isKochi) {
      const X = K.metro.x * BP; x.strokeStyle = "rgba(34,157,143,.85)"; x.lineWidth = 4; x.setLineDash([10, 6]); x.beginPath(); x.moveTo(X, 0); x.lineTo(X, c.height); x.stroke(); x.setLineDash([]);
      K.metro.stations.forEach(([z]) => { x.fillStyle = "#fff"; x.strokeStyle = "#229d8f"; x.lineWidth = 3; x.beginPath(); x.arc(X, z * BP, 7, 0, 7); x.fill(); x.stroke(); });
    }
    return c;
  }
  const pinList = () => {
    const out = [];
    Object.keys(Object.assign({}, spots, extraSpots)).forEach(k => { const P2 = PIN[k]; if (!P2) return; const p = spotPos(k); if (!p) return; const s0 = spots[k] || extraSpots[k]; out.push({ k, x: p.x, z: p.z, icon: P2[0], c: P2[1], pr: P2[2], name: k === "duty" ? "Duty" : k === "gig" ? "Drop-off" : k === "odd" ? "Odd job" : k === "grp" ? "Team task" : k === "house" ? "Home" : k === "f" && isKochi ? "Subhash Park" : (s0 && s0.label) || "" }); });
    return out.sort((a, b) => b.pr - a.pr);
  };
  function updateRoute(time) {
    const k = guide && guide.key; if (!k) { route = null; return; }
    if (route && route.k === k && time - routeT < 900) return;
    routeT = time; const p = spotPos(k); if (!p) { route = null; return; }
    const pts = path(tileOf(me), { x: Math.floor(p.x), y: Math.floor(p.z) });
    route = { k, pts: [{ x: me.x, z: me.z }].concat(toPts(pts)) };
  }
  function drawRoute(ctx, tx, ty, w) {
    if (!route || route.pts.length < 2) return;
    ctx.save(); ctx.lineCap = ctx.lineJoin = "round";
    [["rgba(255,255,255,.95)", w + 3], ["#16998c", w]].forEach(([c, lw], i) => { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.setLineDash(i ? [lw * 1.6, lw * 1.2] : []); ctx.beginPath(); route.pts.forEach((p, j) => (j ? ctx.lineTo : ctx.moveTo).call(ctx, tx(p.x), ty(p.z))); ctx.stroke(); });
    ctx.restore();
  }
  function drawMe(ctx, X, Y, s) {
    ctx.save(); ctx.translate(X, Y);
    ctx.fillStyle = "rgba(66,133,244,.18)"; ctx.beginPath(); ctx.arc(0, 0, s * 2.2, 0, 7); ctx.fill();
    ctx.rotate(-me.heading + Math.PI); ctx.fillStyle = "#e0451b"; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, -s * 1.2); ctx.lineTo(s * 0.85, s * 0.9); ctx.lineTo(0, s * 0.45); ctx.lineTo(-s * 0.85, s * 0.9); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  function drawPin(ctx, X, Y, p, r, pulse) {
    ctx.save(); ctx.translate(X, Y);
    if (pulse) { ctx.strokeStyle = p.c; ctx.globalAlpha = 0.6; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -r * 1.25, r * (1.5 + pulse * 0.5), 0, 7); ctx.stroke(); ctx.globalAlpha = 1; }
    ctx.fillStyle = p.c; ctx.strokeStyle = "#fff"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, -r * 1.25, r, Math.PI * 0.8, Math.PI * 2.2); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.font = `${Math.round(r * 1.15)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(p.icon, 0, -r * 1.22);
    ctx.restore();
  }
  function drawOthers(ctx, tx, ty, r) {
    Object.values(figs).forEach(f => {
      const c = f.kind === "remote" ? "#16998c" : f.kind === "courier" ? "#ff4f9a" : f.kind === "npc" ? "#3b2f5a" : null; if (!c) return;
      ctx.fillStyle = c; ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(tx(f.x), ty(f.z), f.kind === "npc" ? r * 0.7 : r, 0, 7); ctx.fill(); ctx.stroke();
    });
  }
  function drawMini(time) {
    if (!miniCtx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), cw = mini.clientWidth || 112, ch = mini.clientHeight || 84;
    if (mini.width !== Math.round(cw * dpr)) { mini.width = Math.round(cw * dpr); mini.height = Math.round(ch * dpr); }
    const s = 6.5 * dpr, w = mini.width, h = mini.height, c = miniCtx;
    const ox = me.x - w / 2 / s, oy = me.z - h / 2 / s, tx = X => (X - ox) * s, ty = Y => (Y - oy) * s;
    c.fillStyle = "#86c3dc"; c.fillRect(0, 0, w, h); outerLand(c, tx, w, h);
    c.drawImage(mapBase, ox * BP, oy * BP, w / s * BP, h / s * BP, 0, 0, w, h);
    updateRoute(time); drawRoute(c, tx, ty, 2.2 * dpr);
    pinList().forEach(p => { if (p.pr >= 3 || (guide && guide.key === p.k)) drawPin(c, tx(p.x), ty(p.z), p, 6 * dpr, guide && guide.key === p.k ? (Math.sin(time / 200) + 1) / 2 : 0); });
    drawOthers(c, tx, ty, 2.6 * dpr);
    drawMe(c, w / 2, h / 2, 5 * dpr);
  }
  // the city carries on past the edge of the playable map
  function outerLand(c, tx, W, H) { const x0 = isKochi ? tx(36) : ({ MH: 1, TG: 1 }[opts.stateId] ? tx(4) : -1); c.fillStyle = "#ebe5d8"; c.fillRect(Math.max(0, x0), 0, W, H); }
  function areaName() { let best = null, bd = 1e9; areaLabels.forEach(([t, x, y]) => { const d = Math.hypot(x - me.x, y - me.z); if (d < bd && !/Sea|Backwaters/.test(t)) { bd = d; best = t; } }); return best; }
  function openMap() {
    mapEl.hidden = false;
    const a = areaName(); mapEl.querySelector(".map-top span").textContent = a ? "You're in " + a : "Tap a pin to walk there";
    sizeMap(); mv.s = Math.max(mv.min, Math.min(16, mv.min * 1.9)); mv.cx = me.x; mv.cy = me.z; clampMap();
    drawFull(performance.now());
  }
  function sizeMap() {
    const dpr = Math.min(2, window.devicePixelRatio || 1), box = mapCv.parentNode.getBoundingClientRect();
    mapCv.style.width = box.width + "px"; mapCv.style.height = box.height + "px";
    mapCv.width = Math.round(box.width * dpr); mapCv.height = Math.round(box.height * dpr); mv.dpr = dpr;
    mv.min = Math.min(box.width / COLS, box.height / ROWS) * 0.98;
  }
  function clampMap() {
    mv.s = Math.max(mv.min, Math.min(40, mv.s));
    const w = mapCv.width / mv.dpr / mv.s, h = mapCv.height / mv.dpr / mv.s;
    mv.cx = w >= COLS ? COLS / 2 : Math.max(w / 2, Math.min(COLS - w / 2, mv.cx)); mv.cy = h >= ROWS ? ROWS / 2 : Math.max(h / 2, Math.min(ROWS - h / 2, mv.cy));
  }
  const mapToScreen = () => { const d = mv.dpr, W = mapCv.width / d, H = mapCv.height / d; return { tx: X => (X - mv.cx) * mv.s + W / 2, ty: Y => (Y - mv.cy) * mv.s + H / 2, W, H }; };
  function drawFull(time) {
    const c = mapCv.getContext("2d"), d = mv.dpr, { tx, ty, W, H } = mapToScreen(), s = mv.s;
    c.setTransform(d, 0, 0, d, 0, 0); c.fillStyle = "#86c3dc"; c.fillRect(0, 0, W, H); outerLand(c, tx, W, H);
    c.imageSmoothingQuality = "high"; c.drawImage(mapBase, tx(0), ty(0), COLS * s, ROWS * s);
    c.textAlign = "center"; c.textBaseline = "middle";
    // area names
    c.font = `italic 800 ${Math.round(Math.max(11, Math.min(18, s * 1.05)))}px Mukta, sans-serif`;
    areaLabels.forEach(([t, x, y]) => { c.lineWidth = 3; c.strokeStyle = "rgba(255,255,255,.7)"; c.strokeText(t.toUpperCase(), tx(x), ty(y)); c.fillStyle = /Sea|Backwaters/.test(t) ? "rgba(30,90,120,.75)" : "rgba(70,62,84,.7)"; c.fillText(t.toUpperCase(), tx(x), ty(y)); });
    // road names along the road
    if (isKochi && s >= 9) {
      c.font = `700 ${Math.round(Math.min(12, s * 0.62))}px Mukta, sans-serif`;
      K.roadNames.forEach(([t, x, y, v]) => { c.save(); c.translate(tx(x), ty(y)); if (v) c.rotate(-Math.PI / 2); c.lineWidth = 3; c.strokeStyle = "#fff"; c.strokeText(t, 0, 0); c.fillStyle = "#5c5547"; c.fillText(t, 0, 0); c.restore(); });
      c.font = `800 ${Math.round(Math.min(11, s * 0.6))}px Mukta, sans-serif`; K.metro.stations.forEach(([z, n]) => { c.lineWidth = 3; c.strokeStyle = "#fff"; c.strokeText("Ⓜ " + n, tx(K.metro.x) + 6 + s * 1.2, ty(z)); c.fillStyle = "#1c7f74"; c.fillText("Ⓜ " + n, tx(K.metro.x) + 6 + s * 1.2, ty(z)); });
    }
    updateRoute(time); drawRoute(c, tx, ty, 4);
    drawOthers(c, tx, ty, 5);
    // pins with names; names skip if they would overlap a higher-priority one
    const placed = [], r = Math.max(10, Math.min(15, s * 0.8));
    mv.pins = [];
    pinList().reverse().forEach(p => { const X = tx(p.x), Y = ty(p.z); drawPin(c, X, Y, p, r, guide && guide.key === p.k ? (Math.sin(time / 200) + 1) / 2 : 0); mv.pins.push({ p, X, Y: Y - r * 1.25, r: r + 4 }); });
    c.font = `800 ${Math.round(Math.max(10, Math.min(13, s * 0.7)))}px Mukta, sans-serif`;
    mv.pins.slice().reverse().forEach(({ p, X, Y }) => {
      if (!p.name) return; const tw = c.measureText(p.name).width + 10, box = [X - tw / 2, Y + r * 1.35, tw, 17];
      if (placed.some(b => box[0] < b[0] + b[2] && box[0] + box[2] > b[0] && box[1] < b[1] + b[3] && box[1] + box[3] > b[1])) return; placed.push(box);
      c.fillStyle = "rgba(255,255,255,.92)"; c.strokeStyle = p.c; c.lineWidth = 1.5; c.beginPath(); c.roundRect ? c.roundRect(box[0], box[1], box[2], box[3], 8) : c.rect(box[0], box[1], box[2], box[3]); c.fill(); c.stroke();
      c.fillStyle = "#1b1830"; c.fillText(p.name, X, box[1] + 9);
    });
    drawMe(c, tx(me.x), ty(me.z), 9);
  }
  function walkTo(tile) {
    if (ride || !tile) return;
    me.path = isFly(me.vehType) ? [{ x: tile.x + 0.5, z: tile.y + 0.5 }] : toPts(path(tileOf(me), tile)); mapEl.hidden = true;
    sendMe(true, me.path.length ? me.path[me.path.length - 1] : null);
  }
  function bindMap() {
    const cv = mapCv, pts = {}; let drag = null, pinch = 0;
    const local = e => { const r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const zoomAt = (k, at) => { const { W, H } = mapToScreen(), wx = mv.cx + (at.x - W / 2) / mv.s, wy = mv.cy + (at.y - H / 2) / mv.s; mv.s *= k; clampMap(); mv.cx = wx - (at.x - W / 2) / mv.s; mv.cy = wy - (at.y - H / 2) / mv.s; clampMap(); drawFull(performance.now()); };
    cv.addEventListener("pointerdown", e => { pts[e.pointerId] = local(e); try { cv.setPointerCapture(e.pointerId); } catch (er) { } const P2 = Object.values(pts); if (P2.length === 2) { pinch = Math.hypot(P2[0].x - P2[1].x, P2[0].y - P2[1].y); drag = null; } else drag = { x: pts[e.pointerId].x, y: pts[e.pointerId].y, moved: false }; });
    cv.addEventListener("pointermove", e => {
      if (!pts[e.pointerId]) return; const p = local(e), prev = pts[e.pointerId]; pts[e.pointerId] = p; const P2 = Object.values(pts);
      if (P2.length === 2 && pinch) { const dd = Math.hypot(P2[0].x - P2[1].x, P2[0].y - P2[1].y); zoomAt(dd / pinch, { x: (P2[0].x + P2[1].x) / 2, y: (P2[0].y + P2[1].y) / 2 }); pinch = dd; return; }
      if (!drag) return; if (Math.hypot(p.x - drag.x, p.y - drag.y) > 6) drag.moved = true;
      if (drag.moved) { mv.cx -= (p.x - prev.x) / mv.s; mv.cy -= (p.y - prev.y) / mv.s; clampMap(); drawFull(performance.now()); }
    });
    const up = e => {
      const p = pts[e.pointerId]; delete pts[e.pointerId]; if (Object.keys(pts).length < 2) pinch = 0;
      if (e.type !== "pointerup" || !drag || drag.moved || !p) { if (!Object.keys(pts).length) drag = null; return; }
      drag = null;
      const hit = (mv.pins || []).filter(q => Math.hypot(q.X - p.x, q.Y - p.y) < q.r).sort((a, b) => b.p.pr - a.p.pr)[0];
      if (hit) { const s0 = spots[hit.p.k] || extraSpots[hit.p.k]; return walkTo({ x: s0.x, y: s0.y }); }
      const { W, H } = mapToScreen(); walkTo({ x: Math.floor(mv.cx + (p.x - W / 2) / mv.s), y: Math.floor(mv.cy + (p.y - H / 2) / mv.s) });
    };
    cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
    cv.addEventListener("wheel", e => { e.preventDefault(); zoomAt(e.deltaY > 0 ? 0.88 : 1.14, local(e)); }, { passive: false });
    mapEl.querySelector(".mz-in").addEventListener("click", () => { const { W, H } = mapToScreen(); zoomAt(1.35, { x: W / 2, y: H / 2 }); });
    mapEl.querySelector(".mz-out").addEventListener("click", () => { const { W, H } = mapToScreen(); zoomAt(1 / 1.35, { x: W / 2, y: H / 2 }); });
    mapEl.querySelector(".mz-me").addEventListener("click", () => { mv.cx = me.x; mv.cy = me.z; clampMap(); drawFull(performance.now()); });
  }

  // ═══ character preview (creator screen) ═══
  let pv = null;
  // Character creator preview: drag to turn, "face" focus zooms in on the head.
  function preview(slot, av, outfit, focus) {
    if (!window.THREE) return false;
    THREE = window.THREE;
    try {
      if (!pv) {
        const r = new THREE.WebGLRenderer({ antialias: true, alpha: true }); if (!r.getContext()) return false;
        if (THREE.ColorManagement) THREE.ColorManagement.legacyMode = false;
        r.outputEncoding = THREE.sRGBEncoding; r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
        const s = new THREE.Scene(), c = new THREE.PerspectiveCamera(28, 0.75, 0.02, 20);
        s.add(new THREE.HemisphereLight(0xfff1e0, 0x3a3550, 0.95));
        const key = new THREE.DirectionalLight(0xfff0dc, 1.7); key.position.set(1.2, 2.2, 2.4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); Object.assign(key.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1 }); s.add(key);
        const rim = new THREE.DirectionalLight(0xa9c8ff, 0.9); rim.position.set(-2, 1.6, -1.8); s.add(rim);
        const fill = new THREE.DirectionalLight(0xffd6b0, 0.35); fill.position.set(-1.5, 0.6, 1.5); s.add(fill);
        const floor = new THREE.Mesh(new THREE.CircleGeometry(0.5, 40), new THREE.ShadowMaterial({ opacity: 0.25 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; s.add(floor);
        vcMat = vcMat || new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.7 });
        pv = { r, s, c, m: null, raf: 0, rot: 0.5, auto: true, cam: null, camT: null };
        const el2 = r.domElement; el2.style.touchAction = "none";
        let dx = null;
        el2.addEventListener("pointerdown", e => { dx = e.clientX; pv.auto = false; try { el2.setPointerCapture(e.pointerId); } catch (er) { } });
        el2.addEventListener("pointermove", e => { if (dx == null) return; pv.rot += (e.clientX - dx) * 0.012; dx = e.clientX; });
        const end = () => { dx = null; }; el2.addEventListener("pointerup", end); el2.addEventListener("pointercancel", end);
        const loop = () => {
          if (!pv) return;
          if (pv.m) { if (pv.auto) pv.rot += 0.006; pv.m.group.rotation.y = pv.rot; pv.t = (pv.t || 0) + 0.016; const k = Math.sin(pv.t * 1.4) * 0.006; pv.m.torso.scale.set(1 + k, 1 + k, 1 + k); pv.m.arms[0].rotation.z = -0.08; pv.m.arms[1].rotation.z = 0.08; }
          if (pv.camT) { pv.cam = pv.cam || pv.camT.slice(); for (let i = 0; i < 4; i++) pv.cam[i] += (pv.camT[i] - pv.cam[i]) * 0.15; pv.c.position.set(0, pv.cam[0], pv.cam[1]); pv.c.lookAt(0, pv.cam[2], 0); pv.c.fov = pv.cam[3]; pv.c.updateProjectionMatrix(); }
          pv.r.render(pv.s, pv.c); pv.raf = requestAnimationFrame(loop);
        }; loop();
      }
      if (pv.m) pv.s.remove(pv.m.group);
      pv.m = person(personLook(av, outfit), true); pv.m.group.traverse(o => { if (o.isMesh) o.castShadow = true; }); pv.m.shadow.visible = false; pv.s.add(pv.m.group);
      const H = pv.m.H, hy = pv.m.headY;
      if (pv.focus !== focus) { pv.focus = focus; pv.rot = 0.35; pv.auto = focus !== "face"; }
      pv.camT = focus === "face" ? [hy + pv.m.headR * 0.3, pv.m.headR * 8.5, hy - pv.m.headR * 0.35, 26] : [H * 0.58, H * 2.55, H * 0.49, 28];
      const w = slot.clientWidth || 180, h = Math.round(w / 0.75); pv.r.setSize(w, h); pv.c.aspect = w / h; pv.c.updateProjectionMatrix();
      if (pv.r.domElement.parentNode !== slot) slot.appendChild(pv.r.domElement);
      return true;
    } catch (e) { console.warn(e); return false; }
  }

  // ═══ public API ═══
  function setGuide(gd) {
    if (gd && gd.key && (!guide || guide.key !== gd.key || guide.text !== gd.text)) delete inside[gd.key];
    guide = gd ? Object.assign({}, gd) : null;
    if (!el) return;
    banner.querySelector(".w-banner-t b").textContent = gd ? gd.text : "";
    banner.querySelector(".w-banner-a").innerHTML = gd && gd.actions ? gd.actions.map(a => `<button class="w-btn small" data-gact="${esc(a[0])}">${esc(a[1])}</button>`).join("") : "";
    updateBanner();
  }
  function setMarker(k) { if (k && k !== sceneMarker) delete inside[k]; sceneMarker = k || null; }
  function setExtraSpot(k, pos) { if (pos) extraSpots[k] = pos; else delete extraSpots[k]; }
  function randomDoor(r) { const d = doors[Math.floor(r * doors.length) % Math.max(1, doors.length)]; const t = d ? nearestWalk({ x: d.x, y: d.y }) : null; return t || { x: 20, y: 18 }; }
  function bubble(f, t, s, typed) {
    if (!f) return;
    const b = f.lab.querySelector(".bub");
    b.innerHTML = esc(t) + (s ? `<small>${esc(s)}</small>` : ""); b.hidden = false; b.classList.toggle("typed", !!typed);
    f.bubble = { until: performance.now() + (s ? 7000 : 5000) };
  }
  // ---- messages: one toast at a time (queued, de-duplicated, by priority) + a history panel ----
  // kinds: game (notes, money, goals), chat (players), town (NPC chatter: bubble only, never a toast)
  function log(name, t, kind) {
    kind = kind || (name ? "chat" : "game");
    const now = Date.now(), last = msgHist[msgHist.length - 1];
    if (last && last.t === t && last.n === name && now - last.at < 4000) return;
    msgHist.push({ n: name || "", t, k: kind === "mine" ? "chat" : kind, at: now }); if (msgHist.length > 60) msgHist.shift();
    if (kind === "town" || kind === "mine") return msgRefresh();
    if (!(msgEl && !msgEl.hidden)) msgUnread++;
    msgRefresh();
    if (!logEl) return;
    const pri = /Goal complete|complete!|\+₹|Delivered|Welcome|👶|💍|Loan|joined|tipped|sent you/.test(t) ? 2 : kind === "chat" ? 0 : 1;
    if ((toastCur && toastCur.t === t) || toastQ.some(q => q.t === t)) return;
    toastQ.push({ n: name || "", t, pri });
    toastQ.sort((a, b) => b.pri - a.pri);
    while (toastQ.length > 3) toastQ.pop();
    if (!toastCur) nextToast();
    else { let m = logEl.querySelector("em"); if (!m) { m = document.createElement("em"); logEl.appendChild(m); } m.textContent = "+" + toastQ.length; }
  }
  function nextToast() {
    clearTimeout(toastT);
    if (!logEl) return;
    const q = toastQ.shift();
    if (!q) { toastCur = null; logEl.classList.add("out"); toastT = setTimeout(() => { if (logEl && !toastCur) logEl.hidden = true; }, 300); return; }
    toastCur = q;
    logEl.innerHTML = (q.n ? `<b>${esc(q.n)}</b> ` : "") + `<span>${esc(q.t)}</span>` + (toastQ.length ? `<em>+${toastQ.length}</em>` : "");
    logEl.hidden = false; logEl.classList.remove("out"); void logEl.offsetWidth; logEl.classList.remove("pop"); void logEl.offsetWidth; logEl.classList.add("pop");
    const ms = Math.min(5200, 2200 + q.t.length * 35) * (toastQ.length ? 0.75 : 1);
    toastT = setTimeout(nextToast, ms);
  }
  function msgRefresh() {
    if (!el) return;
    const badge = el.querySelector(".cam-msg i");
    if (badge) { badge.hidden = !msgUnread; badge.textContent = msgUnread > 9 ? "9+" : msgUnread; }
    if (!msgEl || msgEl.hidden) return;
    el.querySelectorAll(".msg-tabs button").forEach(b => b.classList.toggle("on", b.dataset.mt === msgTab));
    const list = msgHist.filter(m => msgTab === "all" || m.k === msgTab).slice().reverse();
    const ago = at => { const s = Math.round((Date.now() - at) / 1000); return s < 60 ? "now" : s < 3600 ? Math.round(s / 60) + "m" : Math.round(s / 3600) + "h"; };
    msgEl.querySelector(".msg-list").innerHTML = list.length ? list.map(m => `<p class="mk-${m.k}">${m.n ? `<b>${esc(m.n)}</b> ` : ""}${esc(m.t)}<small>${ago(m.at)}</small></p>`).join("") : `<p class="empty">Nothing here yet.</p>`;
  }
  function msgPanel(on) {
    msgEl = el && el.querySelector(".msg-panel"); if (!msgEl) return;
    msgEl.hidden = !on; if (on) { msgUnread = 0; toastQ = []; nextToast(); SND.sfx("open"); }
    msgRefresh();
  }
  function npcSay(role, t, s) { bubble(figs["npc_" + role], t, s); }
  function meSay(t, typed) { bubble(me, t, null, typed); log(me.name, t, "mine"); }
  function note(t) { log("", t); SND.sfx(/Goal complete|complete!/.test(t) ? "goal" : "notify"); }
  function upsertRemote(id, d) {
    const k = "r_" + id;
    if (figs[k]) {
      const f = figs[k];
      if (d.outfitKey !== f.outfitKey) { f.outfitKey = d.outfitKey; setLookFig(k, d.av, d.outfit); }
      if (d.nick && d.nick !== f.name) { f.name = d.nick; f.lab.querySelector("span").textContent = d.nick; }
      return;
    }
    const t = nearestWalk({ x: d.x, y: d.y }) || { x: 8, y: 18 };
    const f = addFig(k, "remote", d.av, d.outfit, d.nick, t.x + 0.5, t.y + 0.5); f.rid = id; f.outfitKey = d.outfitKey;
    const nameEl = f.lab.querySelector("span"); nameEl.setAttribute("role", "button"); nameEl.tabIndex = 0;
    nameEl.addEventListener("click", e => { e.stopPropagation(); if (opts.onRemoteTap) opts.onRemoteTap(f.rid, f.name); });
  }
  function moveRemote(id, x, y) { const f = figs["r_" + id]; if (f) f.path = isFly(f.vehType) ? [{ x: x + 0.5, z: y + 0.5 }] : toPts(path(tileOf(f), { x, y })); }
  function sayRemote(id, t, typed) { const f = figs["r_" + id]; if (!f || Math.hypot(f.x - me.x, f.z - me.z) > 14) return false; bubble(f, t, null, typed); log(f.name, t); SND.sfx("chat"); return true; }
  function removeRemote(id) { removeFig("r_" + id); remoteFamily(id, null); }
  function clearRemotes() { Object.keys(figs).filter(k => k.indexOf("r_") === 0 || k.indexOf("rf_") === 0).forEach(removeFig); }
  // another player's spouse and kids walking with them (looks are generated from their names, same as on the owner's phone)
  function remoteFamily(id, fam) {
    const pre = "rf_" + id + "_", have = Object.keys(figs).filter(k => k.indexOf(pre) === 0), lead = figs["r_" + id];
    const want = [];
    if (fam && lead) { if (fam.s) want.push({ k: pre + "s", av: npcLook(fam.s, "s", !!fam.sf), name: fam.s, slot: 1 }); (fam.k || []).slice(0, 3).forEach(([nm, age], i) => { const av = PEOPLE.random(nm + "|kid", { kid: true, set: { height: 140 + Math.min(40, age * 3) } }); av.small = age < 12; want.push({ k: pre + "k" + i, av, name: nm, slot: 2 + i }); }); }
    have.filter(k => !want.some(w => w.k === k)).forEach(removeFig);
    want.forEach(w => { if (figs[w.k]) return; const f = addFig(w.k, "rfam", w.av, null, w.name, lead.x - 0.5, lead.z - 0.5); f.lead = "r_" + id; f.slot = w.slot; });
  }
  // your own family: walk with you, or stay (and walk back) home
  let famWalk = false;
  function setFamilyWalk(on) {
    on = !!on; if (on === famWalk && Object.values(figs).some(f => (f.id === "npc_s" || f.kid) && !!f.lead === on)) return; famWalk = on;
    const fam = Object.values(figs).filter(f => f.id === "npc_s" || (f.kid && f.id.indexOf("kid_") === 0));
    fam.forEach((f, i) => {
      if (on) { f.lead = "me"; f.slot = f.id === "npc_s" ? 1 : 2 + i; f.homeward = false; f.x = me.x - Math.sin(me.heading) * (0.6 + f.slot * 0.4); f.z = me.z - Math.cos(me.heading) * (0.6 + f.slot * 0.4); place(f); }
      else if (f.lead) { f.lead = null; if (f.mesh) f.mesh.group.visible = true; f.lab.style.visibility = ""; const h = spots.house; if (h) { f.path = toPts(path(tileOf(f), { x: h.x, y: h.y })); f.homeward = true; } }
    });
  }
  function stepFollow(f, dt, time) {
    if (f.homeward) { stepPath(f, dt, 1.7); if (!f.path.length) { f.homeward = false; f.moving = false; } return; }
    const L = figs[f.lead]; if (!L) { f.moving = false; return; }
    const want = 0.55 + f.slot * 0.42, d = Math.hypot(L.x - f.x, L.z - f.z);
    const hide = !!L.veh || (L === me && (!!ride || !!mride)) || (L.mesh && !L.mesh.group.visible);
    if (f.mesh) f.mesh.group.visible = !hide; f.lab.style.visibility = hide ? "hidden" : "";
    if (hide || d > 10) { f.x = L.x - Math.sin(L.heading) * want; f.z = L.z - Math.cos(L.heading) * want; f.path = []; f.moving = false; f.heading = L.heading; place(f); return; }
    if (d > want + 0.3) {
      if (time - (f.repath || 0) > 450 || !f.path.length) { f.repath = time; const p = toPts(path(tileOf(f), tileOf(L))); f.path = p.length > 1 ? p.slice(0, -1) : [{ x: L.x - Math.sin(L.heading) * want, z: L.z - Math.cos(L.heading) * want }]; }
      stepPath(f, dt, SPEED * (d > 2.5 ? 1.3 : 1));
    } else { f.path = []; f.moving = false; f.heading += angDiff(f.heading, L.heading) * Math.min(1, dt * 3); }
  }
  function setOnline(n, phrases, emotes, canType, room) {
    if (!el) return;
    const on = el.querySelector(".w-online");
    if (n == null) { on.hidden = true; el.querySelector(".say").hidden = true; el.querySelector(".chat").hidden = true; return; }
    on.hidden = false; on.textContent = (room ? "Room " + room + " · " : "") + (n === 1 ? "only you" : n + " players") + (room ? " ▾" : "");
    on.classList.toggle("room", !!room);
    if (!on._b) { on._b = 1; on.addEventListener("click", () => { if (opts.onRoomTap) opts.onRoomTap(); }); }
    el.querySelector(".say").hidden = false; el.querySelector(".chat").hidden = !canType;
    el.querySelector(".say-panel").innerHTML = phrases.map((p, i) => `<button data-kind="p" data-say="${i}">${esc(p)}</button>`).join("") + `<div class="emo">${emotes.map((p, i) => `<button data-kind="e" data-say="${i}">${esc(p)}</button>`).join("")}</div>`;
  }
  // ── FXN delivery: the rider scoots over from the FXN store, parks, walks up with the pink box and hands it to you.
  // You open it, there's a sparkle and a twirl, and you're wearing the outfit. Then the rider waves and rides off.
  function spawnCourier(name, av, outfit, onArrive) {
    const s = spots.fxn || { x: 20, y: 4 };
    removeFig("courier");
    const st = nearestWalk({ x: s.x, y: s.y }) || s;
    const f = addFig("courier", "courier", av, outfit, name + " · FXN", st.x + 0.5, st.y + 0.5);
    f.cb = onArrive; f.rider = name;
    if (!ok3d) { setTimeout(() => { if (f.cb) { const cb = f.cb; f.cb = null; cb(); removeFig("courier"); } }, 1500); return f; }
    f.dl = { st: "ride", t: 0, t0: performance.now() };
    setFigVehicle(f, { type: "scooter", color: "#ff4f9a", box: true });
    f.path = toPts(path(tileOf(f), tileOf(me))); tracker(f); SND.sfx("vroom");
    return f;
  }
  function tracker(f) {
    const t = el && el.querySelector(".deliv"); if (!t) return;
    if (!f) { t.hidden = true; return; }
    const d = Math.hypot(f.x - me.x, f.z - me.z), st = f.dl.st;
    t.hidden = false;
    t.innerHTML = st === "ride" ? `<b>🛵 ${esc(f.rider)} is on the way</b><span>FXN dark store · ${Math.max(5, Math.round(d * 3 / 5) * 5)} m away</span>` : st === "walk" ? `<b>📦 ${esc(f.rider)} parked nearby</b><span>Bringing your box over</span>` : `<b>✨ Delivered</b><span>Rate ${esc(f.rider)} ★★★★★</span>`;
  }
  function stepCourier(f, dt, time) {
    const D = f.dl; if (!D) return;
    D.t += dt;
    const dMe = Math.hypot(f.x - me.x, f.z - me.z), face = (a, b) => Math.atan2(b.x - a.x, b.z - a.z);
    if (D.st === "ride") {
      stepPath(f, dt, SPEED * 2.3);
      if (time - (f.repath || 0) > 700) { f.repath = time; f.path = toPts(path(tileOf(f), tileOf(me))); }
      if (dMe < 1.7 || (D.t > 40)) {
        // park the scooter, take the box off the back and walk over
        D.st = "walk"; D.t = 0; f.path = []; f.moving = false;
        const rig = f.veh; f.veh = null; f.vehKey = ""; f.vehType = null; rig.group.remove(f.mesh.group); f.parked = rig; rig.group.rotation.z = 0;
        scene.add(f.mesh.group); f.mesh.group.visible = true; if (f.mesh.shadow) f.mesh.shadow.visible = true;
        const side = f.heading + Math.PI / 2; f.x += Math.sin(side) * 0.3; f.z += Math.cos(side) * 0.3; f.H = f.mesh.H;
        if (rig.box) { rig.group.remove(rig.box); f.box = rig.box; f.mesh.group.add(f.box); f.box.position.set(0, f.mesh.legL + 0.1, 0.2); f.box.rotation.set(0, 0, 0); }
        f.carry = true; place(f);
      }
    } else if (D.st === "walk") {
      if (time - (f.repath || 0) > 500) { f.repath = time; f.path = toPts(path(tileOf(f), tileOf(me))); if (f.path.length) f.path[f.path.length - 1] = { x: me.x + Math.sin(me.heading) * 0.55, z: me.z + Math.cos(me.heading) * 0.55 }; }
      stepPath(f, dt, 1.9);
      if (dMe < 0.8 || D.t > 12) {
        D.st = "give"; D.t = 0; f.path = []; f.moving = false;
        f.heading = face(f, me); me.heading = face(me, f); me.lock = time + 3600; me.path = [];
        cine = { yaw: me.heading + Math.PI / 2, dist: 2.2, back: dist, until: time + 3600 }; SND.sfx("doorbell");
      }
    } else if (D.st === "give") {
      f.heading = face(f, me);
      if (D.t > 0.6 && f.box && f.box.parent === f.mesh.group) { f.carry = false; me.carry = true; f.mesh.group.remove(f.box); me.mesh.group.add(f.box); f.box.position.set(0, me.mesh.legL + 0.1, 0.2); }
      if (D.t > 1.3 && f.box) { const k = Math.min(1, (D.t - 1.3) / 0.35); f.box.position.y = me.mesh.legL + 0.1 + k * 0.35; f.box.rotation.y = k * 5; f.box.scale.setScalar(1 + k * 0.4); }
      if (D.t > 1.65 && f.box) {
        me.mesh.group.remove(f.box); f.box = null; me.carry = false;
        burst(me.x, (me.mesh.H || 0.7) * 0.6, me.z); me.twirlT = 0.9; SND.sfx("sparkle");
        if (f.cb) { const cb = f.cb; f.cb = null; cb(); }
        f.wave = true; D.st = "bye"; D.t = 0; tracker(f);
      }
    } else if (D.st === "bye") {
      f.heading = face(f, me);
      if (D.t > 2.2) { f.wave = false; D.st = "back"; D.t = 0; tracker(null); }
    } else if (D.st === "back") {
      const P = f.parked.group.position;
      if (!f.path.length) f.path = [{ x: P.x, z: P.z }];
      stepPath(f, dt, 1.9);
      if (Math.hypot(f.x - P.x, f.z - P.z) < 0.15 || D.t > 6) {
        const rig = f.parked; f.parked = null; f.x = P.x; f.z = P.z; f.heading = rig.group.rotation.y;
        scene.remove(f.mesh.group); rig.group.add(f.mesh.group); f.veh = rig; f.vehKey = "fxn"; f.vehType = "scooter"; seatPerson(f); f.H = figH(f);
        const s = spots.fxn || { x: 2, y: 2 }; f.path = toPts(path(tileOf(f), { x: s.x, y: s.y })); D.st = "leave"; D.t = 0;
      }
    } else if (D.st === "leave") {
      stepPath(f, dt, SPEED * 2.3);
      if (!f.path.length || D.t > 9 || dMe > 16) removeFig(f.id);
    }
    if (D.st === "ride" && time - (D.tt || 0) > 400) { D.tt = time; tracker(f); }
  }
  // sparkles for the unboxing
  let fx = [];
  function burst(x, y, z) {
    if (!ok3d) return;
    const n = 90, pos = new Float32Array(n * 3), colr = new Float32Array(n * 3), vel = [], pal = [col("#ff4f9a"), col("#ffd27a"), col("#ffffff"), col("#c9b6ff")];
    for (let i = 0; i < n; i++) { pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; const a = Math.random() * 6.28, u = Math.random() * 2 - 1, sp = 0.6 + Math.random() * 1.4, r = Math.sqrt(1 - u * u); vel.push([Math.cos(a) * r * sp, Math.abs(u) * sp + 0.6, Math.sin(a) * r * sp]); const c = pal[i % 4]; colr.set([c.r, c.g, c.b], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(colr, 3));
    if (!burst.tex) { const c = document.createElement("canvas"); c.width = c.height = 32; const x = c.getContext("2d"), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.8)"); gr.addColorStop(1, "rgba(255,255,255,0)"); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); burst.tex = new THREE.CanvasTexture(c); }
    const m = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, map: burst.tex, vertexColors: true, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending }));
    scene.add(m); fx.push({ m, vel, t: 0 });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.28, 32), new THREE.MeshBasicMaterial({ color: 0xff4f9a, transparent: true, opacity: 0.9, depthWrite: false, side: THREE.DoubleSide }));
    ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.04, z); scene.add(ring); fx.push({ m: ring, ring: true, t: 0 });
  }
  function stepFx(dt) {
    fx = fx.filter(e => {
      e.t += dt;
      if (e.ring) { const k = e.t / 0.8; e.m.scale.setScalar(1 + k * 4); e.m.material.opacity = Math.max(0, 0.9 - k); }
      else { const p = e.m.geometry.attributes.position; e.vel.forEach((v, i) => { v[1] -= dt * 1.6; p.array[i * 3] += v[0] * dt; p.array[i * 3 + 1] = Math.max(0.02, p.array[i * 3 + 1] + v[1] * dt); p.array[i * 3 + 2] += v[2] * dt; }); p.needsUpdate = true; e.m.material.opacity = Math.max(0, 1 - e.t / 1.4); }
      if (e.t > 1.4) { scene.remove(e.m); e.m.geometry.dispose(); return false; }
      return true;
    });
  }
  // the vehicle you ride (null = walk), and the one parked at home while you walk
  let parkedHome = null;
  function setVehicle(spec) {
    if (!me || (ride && spec)) return;
    const before = me.vehKey || ""; setFigVehicle(me, spec);
    if ((me.vehKey || "") !== before) { dist = spec ? (VEH[spec.type] && VEH[spec.type].car ? 4 : 3.4) : 2.9; if (cine) cine.back = dist; }
    me.H = figH(me);
  }
  let parkedKey = "";
  function setParked(spec) {
    const key = spec ? spec.type + spec.color : ""; if (key === parkedKey && (parkedHome || !spec)) return; parkedKey = key;
    if (parkedHome) { scene.remove(parkedHome.group); parkedHome = null; }
    if (!spec || !ok3d || !spots.house) return;
    parkedHome = vehRig(spec.type, spec.color); const h = spots.house;
    parkedHome.group.position.set(h.x + 1.4, 0, h.y + 0.55); parkedHome.group.rotation.y = Math.PI / 2; scene.add(parkedHome.group);
  }
  function courierSay(t, s) { bubble(figs.courier, t, s); }
  function vehicleRemote(id, spec) { const f = figs["r_" + id]; if (f) { setFigVehicle(f, spec); f.H = figH(f); } }
  function teleport(k) { inside[k] = true; const p = spotPos(k); if (!p) return; const t = nearestWalk({ x: Math.floor(p.x), y: Math.floor(p.z) + 1 }) || { x: Math.floor(p.x), y: Math.floor(p.z) }; me.x = t.x + 0.5; me.z = t.y + 0.5; me.path = []; sendMe(true); }
  function position() { return me ? tileOf(me) : { x: 8, y: 18 }; }
  function destroy() {
    cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("resize", resize);
    SND.engine(null);
    if (renderer) { try { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); } catch (e) { } }
    if (el) el.remove(); el = null; fx = []; burst.tex = null; mride = null; famWalk = false; neonMats = []; holos = []; flyers = []; glowMat = null; hmap = null; clouds = []; palmGeoC = null; rainGeoC = null; cloudMat = null; if (pmrem) { pmrem.dispose(); pmrem = null; } if (envRT) { envRT.dispose(); envRT = null; } envScene = null; envHour = -9; lastHour = -1; parkedHome = null; parkedKey = ""; cine = null; boxTexMat = null; wheelGeo = null; figs = {}; extraSpots = {}; guide = null; sceneMarker = null; renderer = null; vehicles = []; boats = []; facadeMats = []; tapFx = null;
  }
  // test hook: place camera and clock
  let dbgHour = null;
  function __dbg(x, z, y, p, d, h) { me.x = x + 0.5; me.z = z + 0.5; yaw = y; pitch = p; dist = d; dbgHour = h; me.path = []; }
  // test hook: pan the open map to a point and return where it is on screen
  function mapPoint(x, z) { if (!mapEl || mapEl.hidden) return null; mv.cx = x; mv.cy = z; clampMap(); drawFull(performance.now()); const { tx, ty } = mapToScreen(), r = mapCv.getBoundingClientRect(); return { x: r.left + tx(x), y: r.top + ty(z) }; }
  const metroSpots = () => METRO_KEYS.filter(k => spots[k]).map(k => ({ key: k, name: spots[k].label.replace(" Metro", ""), z: spots[k].z }));
  const __stats = () => renderer ? { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, geos: renderer.info.memory.geometries, tex: renderer.info.memory.textures } : null;
  const __traffic = () => vehicles.map(v => ({ k: +(v.k == null ? 1 : v.k).toFixed(2), side: +(v.side || 0).toFixed(2), x: +v.m.position.x.toFixed(1), z: +v.m.position.z.toFixed(1), type: v.type }));
  return { __traffic, setFamilyWalk, remoteFamily, __stats, startMetro, metroSpots, metroRiding: () => !!mride, __figs: () => Object.values(figs).filter(f => f.kind === "remote" || f.kind === "me" || f.kind === "rfam" || f.lead).map(f => ({ id: f.id, x: +f.x.toFixed(1), z: +f.z.toFixed(1), veh: f.vehType || "" })), mapPoint, setVehicle, setParked, vehicleRemote, VEH, VCOL, __dbg, mount, setGuide, setMarker, setExtraSpot, randomDoor, npcSay, meSay, note, react, upsertRemote, moveRemote, sayRemote, removeRemote, clearRemotes, setOnline, spawnCourier, courierSay, setLook: (av, outfit) => setLookFig("me", av, outfit), teleport, position, destroy, available: can3d, preview, spotAt: k => { const p = spotPos(k); return p ? { x: p.x, z: p.z } : null; }, guideKey: () => guide && guide.key, mapOpen: () => !!(mapEl && !mapEl.hidden), cols: () => COLS, rows: () => ROWS, riding: () => !!ride };
})();
