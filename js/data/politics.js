// Ward politics in Next Station. Every party here is fictional and runs on local civic issues only.
// Any resemblance to a real party, symbol or person is unintended.
window.AE_POL = {
  disclaimer: "These parties are made up for the game. They don't represent any real party, person or ideology.",
  ward: "Ward 42",
  cycle: 7, // an election every 7 game days
  parties: [
    { id: "tide", name: "Tide Party", short: "TIDE", icon: "🌊", color: "#0fa3b8", slogan: "Clean backwaters. Boats every 10 minutes.", plank: ["Clean the canals", "More Water Metro boats", "Flood-proof roads"] },
    { id: "chakka", name: "Chakka Party", short: "CHAKKA", icon: "🍈", color: "#e0a526", slogan: "Local food, local markets, local pride.", plank: ["Weekly farmers' markets", "Bigger Onam and Vishu fairs", "Fair rent for small shops"] },
    { id: "spark", name: "Spark Party", short: "SPARK", icon: "⚡", color: "#8f6bff", slogan: "Jobs, startups and free Wi-Fi on every bus.", plank: ["Startup grants for Kakkanad", "Free Wi-Fi in buses and boats", "Night skill classes"] }
  ],
  // NPC candidates the ward sees every cycle (the player's own party fields the player when they stand)
  npc: { tide: "Adv. Leena Varghese", chakka: "Kuttan Pillai", spark: "Riya Kurian" },
  canvassLines: [
    "Aunty at the gate: \"Fix the drain on our road first, then we'll talk.\"",
    "A retired teacher offers you chaaya and a 20-minute lecture on footpaths.",
    "A college student: \"Will there be Wi-Fi? Then I'm in.\"",
    "A shopkeeper: \"Rent is too high. Write that down. In big letters.\"",
    "Grandpa on the verandah: \"I've voted in every election since 1975. Impress me.\"",
    "A techie on a call waves you in and nods at everything. Probably a yes."
  ],
  rallyLines: [
    "The crowd chants your party's name. The sound system dies twice. Nobody minds.",
    "You give a two-minute speech. Someone in the back shouts \"Correct!\"",
    "Free chaaya and pazhampori for everyone. Turnout doubles.",
    "A drizzle starts. Umbrellas go up. The rally carries on."
  ],
  projects: [
    { id: "lights", t: "Solar streetlights on dark lanes", r: 6, h: 4 },
    { id: "park", t: "A new children's park", r: 5, h: 6 },
    { id: "drain", t: "Clean every drain before the monsoon", r: 8, h: 2 },
    { id: "market", t: "A Sunday farmers' market", r: 5, h: 5 },
    { id: "wifi", t: "Free Wi-Fi at the bus stops", r: 6, h: 3 }
  ],
  // what it takes
  standPoints: 60, standRep: 40, fee: 1000, posterCost: 300, honorarium: 6000,
  // places in Kochi: party offices on the Marine Drive walkway and in Kakkanad, the rally ground, and the polling booth (next to the Government Office)
  offices: { tide: [37, 36], chakka: [37, 4], spark: [68, 27] }, rallyAt: [37, 16],
  // the ladder: ward councillor, then MLA (assembly election every 21 days), then minister
  ranks: ["Party member", "Ward Councillor", "MLA", "Minister"],
  mla: { wins: 1, points: 120, rep: 60, fee: 5000, honorarium: 15000 },
  minister: { wins: 2, honorarium: 30000, portfolios: ["Tourism", "Water Transport", "IT", "Culture", "Youth Affairs", "Fisheries"] },
  // the issue everyone talks about this week; parties whose promises cover it gain support
  issues: [
    { id: "roads", t: "Potholes on MG Road", fixes: ["tide", "chakka"] },
    { id: "water", t: "Flooding after every rain", fixes: ["tide"] },
    { id: "jobs", t: "Jobs for young people", fixes: ["spark"] },
    { id: "prices", t: "Vegetable prices", fixes: ["chakka"] },
    { id: "transport", t: "Last bus is too early", fixes: ["tide", "spark"] },
    { id: "festival", t: "Funding for the Onam fair", fixes: ["chakka"] },
    { id: "wifi", t: "Slow internet in the ward", fixes: ["spark"] }
  ],
  // manifesto promises a candidate can pick (any 3)
  promises: [
    { id: "roads", t: "Fix every pothole in 100 days" }, { id: "water", t: "Clean drains before the monsoon" }, { id: "jobs", t: "A skills centre for 1,000 youngsters" },
    { id: "prices", t: "Weekly farmers' market" }, { id: "transport", t: "Night buses and boats till midnight" }, { id: "festival", t: "A bigger Onam fair" }, { id: "wifi", t: "Free Wi-Fi at bus stops" }
  ],
  // TV debate: the first option is the strong, respectful answer
  debate: [
    ["The anchor asks: \"Your rival says your plan is too expensive.\"", ["Show the costs and where the money comes from", "Call your rival a liar", "Walk off the set"]],
    ["\"What will you do in your first week?\"", ["Meet residents and fix the worst road first", "Throw a party", "Rest after the campaign"]],
    ["A caller complains about garbage on her street.", ["Promise a pickup schedule and give your number", "Blame the previous councillor", "Hang up"]],
    ["\"Why should young people vote?\"", ["Because the ward's jobs and buses are decided here", "They shouldn't", "Free biryani"]],
    ["Your rival makes a good point about flooding.", ["Agree and offer to work together on it", "Shout over them", "Change the topic to cricket"]],
    ["\"How will you stay honest?\"", ["Publish every rupee of the ward fund online", "Trust me", "No comment"]]
  ],
  voterLines: [
    "A fisherman at the chayakkada: \"Fix the jetty lights and you have my vote.\"",
    "A student: \"Will there be night buses? I finish classes at 9.\"",
    "Two retired teachers argue about drains. You take notes. They approve.",
    "A shop owner gives you a free vada and a list of complaints."
  ],
  socialLines: ["Your reel about the potholes got 12,000 views.", "A meme about your rally went viral. In a good way.", "Your live Q&A trended in Kochi for an hour."],
  fundLines: ["A fundraising dinner at the café raised money for the campaign.", "Local shop owners chipped in for banners and chairs."]
};
