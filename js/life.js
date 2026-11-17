// Second-life layer: a real-time clock (1 real second = 3 game minutes, so a day lasts about 8 minutes),
// energy and hunger, sleeping, eating, relaxing, family, children and life goals. Saves inside the game state.
window.AE_LIFE = (function () {
  const MIN_PER_SEC = 3;
  const has = (g, f) => g.flags.indexOf(f) >= 0;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const r10 = n => Math.round(n / 10) * 10;
  const money = (g, n) => (window.AE.life(g).raw ? n : r10(n * window.AE.ci(g)));

  function init(g) {
    if (g.day) return g;
    Object.assign(g, { sandbox: true, day: 1, min: 8 * 60, energy: 90, hunger: 75, kids: [], goalsDone: [], ate: 0, rented: 0, relaxT: 0, babyDue: 0 });
    return g;
  }
  const hour = g => (g.min || 0) / 60;
  const clock = g => { const h = Math.floor(hour(g)), m = Math.floor(g.min % 60); return (h % 12 || 12) + ":" + String(m).padStart(2, "0") + (h < 12 ? " am" : " pm"); };
  const night = g => hour(g) >= 21 || hour(g) < 7;
  const canWork = g => !night(g) && g.energy >= 10;

  // advance real time; returns a list of things that just happened
  function tick(g, sec) {
    const out = [], dm = sec * MIN_PER_SEC, h0 = hour(g), e0 = g.energy, f0 = g.hunger;
    g.min += dm;
    if (g.min >= 24 * 60) { g.min -= 24 * 60; g.day++; out.push("midnight"); }
    g.hunger = clamp(g.hunger - dm * 0.075, 0, 100);
    g.energy = clamp(g.energy - dm * (night(g) ? 0.09 : 0.055), 0, 100);
    if (g.hunger < 15 || g.energy < 8) g.h = clamp(g.h - dm * 0.02, 0, 100);
    if (f0 >= 25 && g.hunger < 25) out.push("hungry");
    if (e0 >= 15 && g.energy < 15) out.push("tired");
    if (h0 < 21 && hour(g) >= 21) out.push("night");
    if (h0 < 7 && hour(g) >= 7) out.push("morning");
    if (g.babyDue && g.day >= g.babyDue && !g.babyReady) { g.babyReady = true; out.push("baby"); }
    return out;
  }
  // a scene (work moment) takes a few hours
  function afterScene(g) { g.min = Math.min(g.min + 150, 23 * 60 + 50); g.energy = clamp(g.energy - 9, 0, 100); g.hunger = clamp(g.hunger - 7, 0, 100); }

  function sleep(g) {
    const H = window.AE_CITY.houseLevels[g.house ? g.house.lvl : 0];
    const was = hour(g), early = was >= 7 && was < 21;
    if (early) { g.min = Math.min(g.min + 180, 23 * 60); g.energy = clamp(g.energy + 35, 0, 100); return { text: "A good nap. You feel fresher.", nap: true }; }
    if (was >= 7) g.day++;
    g.min = 7 * 60; g.energy = 100; g.hunger = clamp(g.hunger - 20, 0, 100);
    g.h = clamp(g.h + 2 + (H ? H.h : 0) / 3, 0, 100);
    const grew = ageKids(g);
    return { text: "You sleep well and wake up at 7 am. Day " + g.day + " begins.", grew };
  }
  const FOOD = {
    chaya: { name: "Chaaya and pazhampori", cost: 40, gain: 30, mood: 2 },
    cafe: { name: "Meal at Café Monsoon", cost: 220, gain: 60, mood: 5 },
    home: { name: "Home-cooked meal", cost: 90, gain: 55, mood: 3 },
    sadya: { name: "Full sadya on a banana leaf", cost: 300, gain: 90, mood: 8 }
  };
  function eat(g, where) {
    const F = FOOD[where]; const cost = money(g, F.cost);
    if (g.cash < cost) return null;
    g.cash -= cost; g.hunger = clamp(g.hunger + F.gain, 0, 100); g.h = clamp(g.h + F.mood, 0, 100); g.min = Math.min(g.min + 30, 23 * 60 + 50); g.ate = (g.ate || 0) + 1;
    return { text: F.name + " · " + window.AE.inr(cost), cost };
  }
  function relax(g, where) {
    if (g.relaxDay !== g.day) { g.relaxDay = g.day; g.relaxT = 0; }
    if (g.relaxT >= 2) return { text: "You've relaxed enough today. Go live a little!", none: true };
    g.relaxT++;
    const gain = where === "ferry" ? 6 : where === "beach" ? 7 : 5;
    g.h = clamp(g.h + gain, 0, 100); g.energy = clamp(g.energy + 4, 0, 100); g.min = Math.min(g.min + 60, 23 * 60 + 50);
    return { text: { park: "You sit under the rain trees and watch the city go by.", ferry: "The backwater breeze on the ferry clears your head.", beach: "Sunset at the beach. Worth it." }[where] || "A little break.", gain };
  }

  // ── family ──
  const NAMES = ["Aadhi", "Nila", "Ivan", "Diya", "Aryan", "Meera", "Ishaan", "Gauri", "Zara", "Kiran", "Anu", "Rohan", "Theertha", "Fida", "Joel", "Amaya"];
  const kidAge = (g, k) => Math.floor((g.day - k.born) / 2);
  function ageKids(g) { return (g.kids || []).filter(k => { const a = kidAge(g, k); const grew = a !== k.age; k.age = a; return grew && [3, 6, 13, 18].indexOf(a) >= 0; }).map(k => k.name); }
  function canPlanBaby(g) { return g.spouse && (g.kids || []).length < 3 && !g.babyDue && (g.house && g.house.lvl >= 1); }
  function planBaby(g) { if (!canPlanBaby(g)) return false; g.babyDue = g.day + 2; return true; }
  function nameBaby(g, name) {
    name = String(name || "").replace(/[^A-Za-z .'-]/g, "").trim().slice(0, 16) || NAMES[(g.day + g.kids.length) % NAMES.length];
    g.kids.push({ name, born: g.day, age: 0 }); g.babyDue = 0; g.babyReady = false; g.h = clamp(g.h + 12, 0, 100);
    return name;
  }
  const KIDLINES = {
    baby: [["Ba ba ba!", "Ba ba ba!"], ["Ngaa... ngaa!", "Waaah!"]],
    kid: [["Ice cream venam!", "I want ice cream!"], ["Innu school-il njaan first aayi!", "I came first at school today!"], ["Cartoon kaanatte, please!", "Can I watch cartoons, please?"], ["Ente kootukaaran-nte veettil puppy undu!", "My friend has a puppy at home!"]],
    teen: [["Phone tharo, onnu matram!", "Give me the phone, just once!"], ["Ellaarum trip-nu pokunnu, njaanum pokatte?", "Everyone's going on a trip, can I go too?"], ["Exam aanu, disturb cheyyalle.", "I have exams, don't disturb me."]],
    adult: [["College-il admission kitti!", "I got college admission!"], ["Njaan oru part-time job nokkunnu.", "I'm looking for a part-time job."]]
  };
  function kidLine(g, name) {
    const k = (g.kids || []).find(x => x.name === name); if (!k) return null;
    const a = kidAge(g, k), pool = KIDLINES[a < 3 ? "baby" : a < 13 ? "kid" : a < 18 ? "teen" : "adult"];
    return pool[Math.floor(Math.random() * pool.length)];
  }
  function stage(a) { return a < 3 ? "Baby" : a < 6 ? "Toddler" : a < 13 ? "Kid" : a < 18 ? "Teen" : "Grown up"; }

  // ── life goals: a gentle path through the game ──
  const GOALS = [
    { id: "work", t: "Finish your first work scene", hint: "Follow the arrow to the ! and make a choice", ok: g => (g.log || []).length >= 1, reward: 500 },
    { id: "eat", t: "Eat at a chayakkada", hint: "Find the Chaya chettan on Marine Drive", ok: g => (g.ate || 0) >= 1, reward: 300 },
    { id: "rent", t: "Rent an outfit on FXN", hint: "Open the FXN app and rent something", ok: g => (g.rented || 0) >= 1, reward: 500 },
    { id: "paper", t: "Get your address proof", hint: "Apply at the Government Office", ok: g => (g.papers || []).indexOf("id") >= 0, reward: 500 },
    { id: "home", t: "Move out of your rented room", hint: "Upgrade your house from Home", ok: g => g.house && g.house.lvl >= 1, reward: 1000 },
    { id: "match", t: "Find someone special", hint: "Use MangalyaMatch or ChaiDate on your phone", ok: g => !!(g.romance || g.spouse), reward: 500 },
    { id: "wed", t: "Get married", hint: "Date, meet the families, then the wedding", ok: g => !!g.spouse, reward: 2000 },
    { id: "kid", t: "Start a family", hint: "Talk to your partner at home", ok: g => (g.kids || []).length >= 1, reward: 2000 },
    { id: "house", t: "Own an independent house", hint: "Upgrade your home (a home loan helps)", ok: g => g.house && g.house.lvl >= 3, reward: 3000 },
    { id: "lakh", t: "Save ₹1 lakh", hint: "Keep working and spend wisely", ok: g => g.cash >= 100000, reward: 0 }
  ];
  function checkGoals(g) {
    const fresh = [];
    GOALS.forEach(G => { if ((g.goalsDone || []).indexOf(G.id) < 0 && G.ok(g)) { g.goalsDone.push(G.id); const r = money(g, G.reward); g.cash += r; fresh.push({ t: G.t, reward: r }); } });
    return fresh;
  }
  const nextGoal = g => GOALS.find(G => (g.goalsDone || []).indexOf(G.id) < 0);
  function settleLines(g, K) {
    const out = [];
    (g.kids || []).forEach(k => { const a = kidAge(g, k); if (a >= 18) return; out.push({ label: k.name + (a < 5 ? "'s care" : "'s school fees"), amount: -K.m(a < 5 ? 800 : 1500), kind: "money" }); g.h = clamp(g.h + 2, 0, 100); });
    return out;
  }
  return { init, tick, hour, clock, night, canWork, afterScene, sleep, eat, relax, FOOD, NAMES, kidAge, canPlanBaby, planBaby, nameBaby, kidLine, stage, GOALS, checkGoals, nextGoal, settleLines, money };
})();
