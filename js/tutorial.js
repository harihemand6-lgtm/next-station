// Onboarding: a skippable welcome for new players, a spotlight tour of the screen, a "welcome back" recap
// with what's new for returning players, and "How it works" notes for every feature (shown once, then on ❓).
window.AE_TUTOR = (function () {
  "use strict";
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const VERSION = 14; // bump when adding a "What's new" entry
  const NEWS = [
    { v: 14, i: "🤝", t: "Team tasks for 3, 4 and 5", d: "Snake-boat races, wedding sadyas, hackathons, fashion shows and more. Everyone plays a role." },
    { v: 13, i: "🌃", t: "FXN light shows", d: "LED skyscrapers, the new FXN Tower and a drone show over the backwaters every night from 7:30 pm." },
    { v: 12, i: "👥", t: "Squads", d: "Share a 6-letter code to play, chat and talk with friends anywhere in the game." },
    { v: 11, i: "🏡", t: "FXN Nagar homes", d: "Rent a flat, rent a house, or buy a plot by the lake and build your own." },
    { v: 10, i: "🗳️", t: "Ward politics", d: "Join a party, campaign door to door and stand for Ward Councillor." },
    { v: 9, i: "⛴️", t: "Water Metro and Infopark", d: "Electric boats to the islands and up the canal to Infopark in Kakkanad." },
    { v: 8, i: "🎮", t: "FXN Arcade", d: "Four quick mini-games that pay cash. Find them on your phone." },
    { v: 7, i: "💬", t: "Calmer messages", d: "One message at a time. Tap 💬 to read everything you missed." }
  ];
  const TOUR = [
    { sel: ".w-banner", t: "Your next step", d: "This card always tells you what to do next. Walk towards the glowing arrow in the city." },
    { sel: ".joy", t: "Walk", d: "Drag this joystick to walk, or just tap anywhere on the ground." },
    { sel: ".minimap", t: "Map", d: "Tap the map to see all of Kochi. Tap any pin or street and you'll walk there." },
    { sel: ".hud2 .meters", t: "Energy, hunger, mood", d: "Keep these up. Eat at a chayakkada ☕ and sleep at home 🏠 at night." },
    { sel: ".hud2 .cash", t: "Your money", d: "Earn it from your job, daily duties and quick jobs. Spend it on homes, rides and outfits." },
    { sel: '[data-act="phone"]', t: "Your phone", d: "Today's duties, life goals, jobs, homes, squads, the Metro and the FXN Arcade all live here." },
    { sel: '[data-act="fxnopen"]', t: "FXN outfits", d: "Some events have a dress code. Rent the look on FXN and a rider brings it in minutes." },
    { sel: ".cam-msg", t: "Messages", d: "Missed a message? Everything is saved here." },
    { sel: null, t: "You're ready!", d: "Every app explains itself the first time you open it. Replay this tour any time from ☰ menu → How to play." }
  ];
  // one short "How it works" per feature: [title, steps]
  const HELP = {
    phone: ["Your phone", ["Each tile is an app. Tap one to open it.", "Start with 🎯 Life goals: it lists easy things to do next.", "Daily duties pay extra for doing your job well."]],
    duties: ["Today's duties", ["You get 3 work tasks each day.", "Walk to the ⭐ on the map, then do the quick mini-task.", "Finish all 3 for a bonus. Do it every day for a streak."]],
    duty: ["Doing a duty", ["Follow the instructions on screen: tap, pick or hold.", "Faster and neater work pays more.", "Missed it? Just try again."]],
    goals: ["Life goals", ["A checklist that walks you through the game.", "Each goal pays a reward when done.", "Not sure what to do? Do the next goal."]],
    group: ["Team tasks", ["Gather your group at the marked spot (friends in your 👥 Squad count).", "Tap Start: everyone gets a role and a 10-second mini-game.", "The team's average sets everyone's pay. Empty roles go to hired helpers."]],
    team: ["Your part", ["Do your role's mini-game: tap, pick, hold or tap on the beat.", "Your score is added to the team's.", "Wait a moment for your teammates to finish."]],
    board: ["Notice board", ["Odd jobs: quick tasks for fast cash. Walk to the glowing door.", "Team tasks pay more with more players. Invite others or use a squad.", "Empty team spots are filled by hired helpers."]],
    metro: ["Kochi Metro", ["Pick a station and ride. It's faster than walking.", "The Kochi1 card gives a discount on every ride and boat.", "Metro tasks are little city adventures that pay."]],
    water: ["Water Metro", ["Electric boats between jetties.", "Island line: High Court ⇄ Vypeen, Bolgatty, Fort Kochi. Canal line: Vyttila ⇄ Infopark.", "Pick where you're going and enjoy the ride."]],
    infopark: ["Infopark", ["Bug bash (daytime): answer 3 quick fix-it questions, earn by score.", "Meetups (evening): grow skills and reputation.", "See jobs to switch to a tech career."]],
    politics: ["Ward politics", ["Join one of three made-up local parties.", "Earn party points: knock on doors, put up posters, go to rallies.", "With enough points, stand for Ward Councillor. The ward votes every 7 days."]],
    broker: ["FXN Homes", ["Flats: rent or buy in FXN Heights.", "Houses: rent a ready house. Plots: buy land and build your own.", "Better-paid jobs or more savings unlock bigger homes. Your house stays until you retire."]],
    squad: ["Squads", ["Create a squad and share the code with friends you know.", "They enter the code to join you from anywhere.", "Chat, and if you're 18+, hold 🎙️ to talk. You can mute or report anyone."]],
    house: ["Your home", ["Sleep here at night to get energy back and start a new day.", "Eat at home to save money.", "Make it nicer: furniture, paint, and outside upgrades for owned houses."]],
    garage: ["Vehicles", ["Buy a bicycle, scooter, bike, car or even a flying scooter.", "Pay cash or 20% down with a loan.", "Riding is much faster. Toggle Ride/Walk at the bottom."]],
    office: ["Government Office", ["Apply for papers like your address proof.", "Papers take time. Come back to collect them.", "Some loans and homes need papers first."]],
    bank: ["Bank", ["Take loans for a house, a vehicle or a business.", "EMIs are paid every pay period.", "Borrow only what you can repay."]],
    site: ["Matrimony and dating", ["Browse profiles and send interest.", "If they like you back, plan a date at the café.", "Then meet the families and plan the wedding."]],
    career: ["Career", ["Switch to a different life and job.", "You can switch only a couple of times, so choose well."]],
    kin: ["Family", ["Spend time with your partner and plan a family.", "Turn on 'family walks with me' so they join you outside."]],
    rooms: ["Rooms", ["Each city is split into rooms of 8 players.", "Move to a room where your friends are, or use a squad."]],
    status: ["My papers", ["Your papers, loans and house in one place."]],
    fxn: ["FXN app", ["Rent outfits for events and dress codes.", "An FXN rider delivers to you in minutes. Wait where you are.", "The FXN Arcade has quick games that pay cash."]]
  };
  let root = null, step = 0, onEnd = null;
  function close(done) { if (root) { root.remove(); root = null; } window.removeEventListener("resize", place); const f = onEnd; onEnd = null; if (f) f(done); }
  function shell(html, cls) { if (root) root.remove(); root = document.createElement("div"); root.className = "tut " + (cls || ""); root.innerHTML = html; document.body.appendChild(root); root.addEventListener("click", click); return root; }
  function click(e) {
    const b = e.target.closest("[data-tut]"); if (!b) return;
    const a = b.dataset.tut;
    if (a === "skip") return close(false);
    if (a === "next") { step++; return step >= TOUR.length ? close(true) : show(); }
    if (a === "back") { step = Math.max(0, step - 1); return show(); }
    if (a === "tour") { start(onEnd); return; }
    if (a === "done") return close(true);
  }
  // spotlight tour over the live game screen
  function visible(el) { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(el).visibility !== "hidden"; }
  function start(cb) { onEnd = cb || onEnd; step = 0; shell(`<div class="tut-spot"></div><div class="tut-tip" role="dialog" aria-live="polite"></div>`, "tour"); window.addEventListener("resize", place); show(); }
  function show() {
    let S = TOUR[step];
    while (S && S.sel && !visible(document.querySelector(S.sel))) { step++; S = TOUR[step]; }
    if (!S) return close(true);
    const tip = root.querySelector(".tut-tip");
    tip.innerHTML = `<span class="tut-n">${step + 1} / ${TOUR.length}</span><b>${esc(S.t)}</b><p>${esc(S.d)}</p><div class="tut-btns"><button class="tut-skip" data-tut="skip">Skip tour</button>${step ? `<button class="tut-ghost" data-tut="back">Back</button>` : ""}<button class="tut-go" data-tut="next">${step === TOUR.length - 1 ? "Start playing" : "Next"}</button></div>`;
    place();
  }
  function place() {
    if (!root || !root.classList.contains("tour")) return;
    const S = TOUR[step], spot = root.querySelector(".tut-spot"), tip = root.querySelector(".tut-tip"), el = S && S.sel && document.querySelector(S.sel);
    if (!el) { spot.style.cssText = `left:50%;top:45%;width:0;height:0`; tip.style.cssText = `left:50%;top:50%;transform:translate(-50%,-50%)`; return; }
    const r = el.getBoundingClientRect(), pad = 6;
    spot.style.cssText = `left:${r.left - pad}px;top:${r.top - pad}px;width:${r.width + pad * 2}px;height:${r.height + pad * 2}px`;
    const below = r.top + r.height / 2 < innerHeight / 2, w = Math.min(320, innerWidth - 24);
    const left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    tip.style.cssText = `width:${w}px;left:${left}px;` + (below ? `top:${r.bottom + 14}px` : `bottom:${innerHeight - r.top + 14}px`);
  }
  // first screen for brand-new players
  function intro(name, cb) {
    onEnd = cb;
    shell(`<div class="tut-card"><span class="tut-logo">NEXT STATION</span><h2>Welcome to Kochi 2030${name ? ", " + esc(name) : ""}!</h2>
      <ul class="tut-list"><li><span>🧑‍💼</span><div><b>Live a life</b><small>Work your job, earn, fall in love, buy a home and retire happy.</small></div></li>
      <li><span>➤</span><div><b>Just follow the card at the top</b><small>It always tells you the next thing to do.</small></div></li>
      <li><span>⚡</span><div><b>Eat and sleep</b><small>Keep your energy and hunger up so you can keep going.</small></div></li></ul>
      <button class="tut-go big" data-tut="tour">Show me around (30 sec)</button><button class="tut-skip" data-tut="skip">Skip, I'll explore</button></div>`, "intro");
  }
  // returning players: recap of their life plus what's new since they last played
  function welcomeBack(o, cb) {
    onEnd = cb;
    const fresh = NEWS.filter(n => n.v > (o.seenVer || 0)).slice(0, 4);
    shell(`<div class="tut-card"><span class="tut-logo">WELCOME BACK</span><h2>Good to see you, ${esc(o.name || "friend")}!</h2>
      <div class="tut-recap">${(o.recap || []).map(r => `<div><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join("")}</div>
      ${o.next ? `<p class="tut-next">🎯 Next: <b>${esc(o.next)}</b></p>` : ""}
      ${fresh.length ? `<h3>New since your last visit</h3><ul class="tut-list small">${fresh.map(n => `<li><span>${n.i}</span><div><b>${esc(n.t)}</b><small>${esc(n.d)}</small></div></li>`).join("")}</ul>` : ""}
      <button class="tut-go big" data-tut="done">Continue playing</button><button class="tut-skip" data-tut="tour">Replay the how-to-play tour</button></div>`, "intro");
  }
  // one-time pointer bubble next to a control ("Tap here to go inside")
  let hintEl = null, hintT = 0;
  function hint(sel, text) {
    const el = document.querySelector(sel); if (!el || !visible(el) || root) return false;
    if (hintEl) hintEl.remove(); clearTimeout(hintT);
    const r = el.getBoundingClientRect(); hintEl = document.createElement("div"); hintEl.className = "tut-hint";
    hintEl.innerHTML = esc(text) + "<i></i>"; document.body.appendChild(hintEl);
    const w = Math.min(240, innerWidth - 24), left = Math.max(12, Math.min(innerWidth - w - 12, r.left + r.width / 2 - w / 2));
    hintEl.style.cssText = `width:${w}px;left:${left}px;bottom:${innerHeight - r.top + 12}px`;
    hintEl.querySelector("i").style.left = Math.max(14, Math.min(w - 14, r.left + r.width / 2 - left)) + "px";
    const kill = () => { if (hintEl) { hintEl.remove(); hintEl = null; } document.removeEventListener("pointerdown", kill, true); };
    setTimeout(() => document.addEventListener("pointerdown", kill, true), 300); hintT = setTimeout(kill, 7000);
    return true;
  }
  return { hint, VERSION, NEWS, HELP, intro, welcomeBack, tour: start, close, isOpen: () => !!root };
})();
