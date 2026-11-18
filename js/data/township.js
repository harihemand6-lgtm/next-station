// FXN Nagar: the township on Kochi's eastern outskirts, by Vembanad Lake.
// Flats in FXN Heights, rental houses, open plots to buy and build on, and lakeside villa plots.
// Prices are pretend, before the city's cost scaling.
window.AE_TOWN = (function () {
  // plot geometry on the Kochi map: r = [x0, y0, x1, y1], door = gate tile on the road, face = side the gate is on
  const plots = [];
  const cols = [[71, 74], [75, 78], [81, 84], [85, 88], [91, 95]];
  let n = 0;
  [[47, 53], [56, 62]].forEach(([a, b]) => cols.forEach(([x0, x1]) => {
    plots.push({ id: "T" + String(++n).padStart(2, "0"), kind: "house", r: [x0, a, x1, a + 2], door: [x0 + 1, a - 1], face: "n" });
    plots.push({ id: "T" + String(++n).padStart(2, "0"), kind: "house", r: [x0, b - 2, x1, b], door: [x0 + 1, b + 1], face: "s" });
  }));
  cols.forEach(([x0, x1], i) => plots.push({ id: "V0" + (i + 1), kind: "villa", r: [x0, 65, x1, 68], door: [x0 + 1, 64], face: "n" }));

  return {
    name: "FXN Nagar",
    plots,
    // houses already standing when the township opens: FXN Rentals (to let) and a few neighbour families
    seed: {
      T01: { s: "rent", st: "kerala", w: 0, rf: 0 }, T04: { s: "rent", st: "modern", w: 2, rf: 2 }, T07: { s: "rent", st: "kerala", w: 3, rf: 1 },
      T10: { s: "rent", st: "modern", w: 1, rf: 3 }, T13: { s: "rent", st: "kerala", w: 5, rf: 0 }, T16: { s: "rent", st: "modern", w: 4, rf: 2 }, T19: { s: "rent", st: "kerala", w: 1, rf: 1 },
      T02: { s: "npc", st: "kerala", w: 4, rf: 1, x: ["garden", "wall"], n: "The Menons" }, T09: { s: "npc", st: "modern", w: 0, rf: 3, x: ["solar", "porch"], n: "The D'Souzas" },
      T15: { s: "npc", st: "kerala", w: 2, rf: 0, x: ["garden"], n: "The Kunjus" }, V02: { s: "npc", st: "villa", w: 0, rf: 3, x: ["pool", "garden", "lights"], n: "Dr. Fathima's villa" }
    },
    styles: [
      { id: "kerala", name: "Kerala house", desc: "Sloping tiled roof, verandah with pillars", cost: 60000, villa: false },
      { id: "modern", name: "Modern box", desc: "Flat roof, big glass windows, wood accents", cost: 75000, villa: false },
      { id: "villa", name: "Lakeside villa", desc: "Two floors, balcony, glass railings", cost: 150000, villa: true }
    ],
    walls: [["Cream", "#efe4cf"], ["Mint", "#bfe3d0"], ["Sky", "#bcd7f0"], ["Peach", "#f6c7a8"], ["Lavender", "#d6c8f0"], ["Kerala green", "#7fb77e"], ["Charcoal", "#4a4d55"], ["White", "#f7f7f4"]],
    roofs: [["Terracotta", "#b5532f"], ["Deep red", "#8f2f26"], ["Slate", "#4d5866"], ["Forest", "#3f6b45"]],
    extras: [
      { id: "garden", name: "Garden and coconut trees", cost: 4000, h: 2 },
      { id: "wall", name: "Compound wall and gate with nameplate", cost: 6000, h: 1 },
      { id: "porch", name: "Car porch", cost: 8000, h: 1 },
      { id: "solar", name: "Solar roof panels", cost: 10000, h: 1 },
      { id: "lights", name: "Festive lights", cost: 1500, h: 1 },
      { id: "floor", name: "Extra floor", cost: 30000, h: 3 },
      { id: "pool", name: "Swimming pool", cost: 25000, h: 3, villa: true },
      { id: "neon", name: "FXN neon nameplate", cost: 3000, h: 1 }
    ],
    // what each option costs; rent is charged every pay period in place of the old upkeep
    flats: [
      { id: "f1", name: "1BHK in FXN Heights", lvl: 1, rent: 2200, buy: 150000, tier: 0 },
      { id: "f2", name: "2BHK in FXN Heights", lvl: 2, rent: 3800, buy: 260000, tier: 1 },
      { id: "f3", name: "3BHK sky flat in FXN Heights", lvl: 2, rent: 6500, buy: 450000, tier: 2 }
    ],
    houseRent: 5000, plotPrice: { house: 80000, villa: 160000 }, resaleMult: 1.1,
    upkeep: { own: 1500, villa: 3000 },
    // how far a profession's pay reaches: 0 starter, 1 steady, 2 professional, 3 high earner
    tiers: { street: 0, cab: 0, kitchen: 1, craft: 1, band: 1, creator: 1, homestay: 1, seafood: 1, teacher: 1, reality: 1, cricket: 2, film: 2, stylist: 1, planner: 1, nurse: 2, govt: 2, job: 2, startup: 2, gulf: 2, trader: 3 },
    tierNames: ["Starter", "Steady income", "Professional", "High earner"],
    // savings that unlock a tier no matter the job (before scaling)
    tierCash: [0, 30000, 100000, 300000],
    brokerLines: [
      "Broker Babu: \"Sir, lake view, east-facing, Vaastu perfect. Very rare.\"",
      "Broker Babu: \"FXN Nagar prices only go up. Like petrol.\"",
      "Broker Babu: \"This one? Previous owner retired. Good vibes only.\"",
      "Broker Babu: \"Ten minutes to Infopark by Water Metro. Techies are queueing.\""
    ]
  };
})();
