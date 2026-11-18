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
  standPoints: 60, standRep: 40, fee: 1000, posterCost: 300, honorarium: 6000
};
