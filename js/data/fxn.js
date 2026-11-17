// FXN in-game rentals, dress-code events and the delivery gig.
// FXN is a real fashion-rental startup owned by the game's creator. In-game prices and timings are for fun only.
window.AE_FXN = {
  disclosure: "FXN is a real fashion-rental startup from Kerala, owned by the creator of Next Station. In-game prices and delivery times are for fun and differ from real FXN.",
  basics: { top: "#8f8d9e", bottom: "#2a2742", style: "tee" },
  // style: tee | shirt | kurta | suit | saree | lehenga | mundu | sport | gown ; acc = dupatta/shawl colour
  catalogue: [
    { id: "kasavu_saree", name: "Kasavu saree set", tags: ["onam", "festival", "local:KL"], price: 199, buy: 4999, look: { top: "#f4ead2", bottom: "#f4ead2", style: "saree", trim: "#d4a62a" } },
    { id: "kasavu_mundu", name: "Kasavu mundu and shirt", tags: ["onam", "festival", "local:KL"], price: 149, buy: 2999, look: { top: "#f7f3e8", bottom: "#f4ead2", style: "mundu", trim: "#d4a62a" } },
    { id: "paithani", name: "Paithani silk saree", tags: ["festival", "wedding", "local:MH"], price: 299, buy: 14999, look: { top: "#7a1f6b", bottom: "#7a1f6b", style: "saree", trim: "#2f9e5b" } },
    { id: "phulkari", name: "Phulkari dupatta suit", tags: ["festival", "wedding", "local:PB"], price: 249, buy: 5999, look: { top: "#e94e3c", bottom: "#f1c232", style: "kurta", trim: "#f6a21a" } },
    { id: "kantha_kurta", name: "Kantha kurta and dhoti", tags: ["festival", "local:WB"], price: 199, buy: 3999, look: { top: "#f2efe4", bottom: "#f7f3e8", style: "kurta", trim: "#c0392b" } },
    { id: "bandhej", name: "Bandhej lehenga", tags: ["festival", "wedding", "local:RJ"], price: 299, buy: 8999, look: { top: "#e4572e", bottom: "#d81e5b", style: "lehenga", trim: "#f6c90e" } },
    { id: "mysore_silk", name: "Mysore silk saree", tags: ["festival", "wedding", "local:KA"], price: 279, buy: 11999, look: { top: "#1f6f8b", bottom: "#1f6f8b", style: "saree", trim: "#f4c542" } },
    { id: "sherwani", name: "Sherwani", tags: ["wedding"], price: 399, buy: 12999, look: { top: "#e9d9b0", bottom: "#efe7d2", style: "kurta", trim: "#b8860b" } },
    { id: "lehenga", name: "Wedding lehenga", tags: ["wedding"], price: 499, buy: 24999, look: { top: "#b3123d", bottom: "#b3123d", style: "lehenga", trim: "#f4c542" } },
    { id: "formal_suit", name: "Office formals (blazer)", tags: ["formal"], price: 179, buy: 6999, look: { top: "#24304a", bottom: "#24304a", style: "suit", trim: "#c0392b" } },
    { id: "party", name: "College-fest party wear", tags: ["party"], price: 129, buy: 2499, look: { top: "#111111", bottom: "#3b3b98", style: "shirt", trim: "#22b5a6" } },
    { id: "red_carpet", name: "Red-carpet look", tags: ["premiere", "party"], price: 449, buy: 19999, look: { top: "#0b0b0f", bottom: "#0b0b0f", style: "gown", trim: "#d4af37" } },
    { id: "cricket_whites", name: "Cricket whites", tags: ["sport"], price: 99, buy: 1999, look: { top: "#f7f7f7", bottom: "#f7f7f7", style: "sport", trim: "#1f6feb" } },
    { id: "ethnic_kurta", name: "Festive kurta set", tags: ["festival"], price: 149, buy: 2999, look: { top: "#f4a52b", bottom: "#f7f3e8", style: "kurta", trim: "#b3123d" } }
  ],
  passPrice: 999, passDiscount: 0.4,
  // City events: one opens each chapter. lives limits who gets it; dress = required tag; {festival} etc. from the city.
  events: [
    { id: "ev_fest", dress: "festival", title: "{festival} celebration at the Town Hall", t: "Lamps, music and the whole neighbourhood in their best. {m} spots you across the hall.",
      c: [ { l: "Join the dance circle", e: { h: 10, r: 5 }, r: "You can't dance. Nobody cares. Best night of the month." },
           { l: "Network with local business owners", e: { r: 8, x: 3 }, r: "Three visiting cards and one very long story about someone's uncle." } ] },
    { id: "ev_onam", dress: "onam", states: ["KL"], title: "Onam sadya at the Town Hall", t: "Twenty-six dishes on a banana leaf and a pookalam the size of a car.",
      c: [ { l: "Help serve the sadya", e: { r: 10, rel: { p: 8 } }, r: "Payasam on your sleeve, gratitude in everyone's eyes." },
           { l: "Enter the tug-of-war", e: { h: 8, x: 3 }, r: "Your team loses. Your team also has the best photo." } ] },
    { id: "ev_wedding", dress: "wedding", title: "{f}'s cousin's wedding reception at the Town Hall", t: "An 800-guest reception. The DJ has one setting: loud.",
      c: [ { l: "Give a heartfelt toast", e: { r: 6, rel: { f: 12 } }, r: "Two aunties cry. One asks if you're single." },
           { l: "Own the dance floor", e: { h: 10, x: 4 }, r: "You are now 'that dancer' in 40 family WhatsApp videos." } ] },
    { id: "ev_annual", dress: "formal", lives: ["job", "startup", "govt", "trader"], title: "Annual day and awards night at the Town Hall", t: "Formal dinner, awkward speeches and a buffet everyone pretends not to rush.",
      c: [ { l: "Talk to the senior leadership", e: { x: 8, rel: { m: 6 } }, r: "The director remembers your name. That's half a promotion." },
           { l: "Head straight for the buffet", e: { h: 8 }, r: "The paneer was worth it." } ] },
    { id: "ev_collegefest", dress: "party", title: "College fest night at the Town Hall", t: "A band, neon lights and 2,000 students who skipped class for this.",
      c: [ { l: "Volunteer for the stage show", e: { x: 7, r: 4 }, r: "Your mic moment goes semi-viral on campus." },
           { l: "Make new friends at the food stalls", e: { h: 8, rel: { f: 6 } }, r: "Five new friends, three new inside jokes." } ] },
    { id: "ev_premiere", dress: "premiere", lives: ["film", "creator", "reality"], title: "Film premiere red carpet at the Town Hall", t: "Flashbulbs, a red carpet and photographers shouting 'this side, this side!'",
      c: [ { l: "Pose like a pro", e: { x: 10, r: 4 }, r: "Your photo makes the entertainment page. Small font, still counts." },
           { l: "Chat up a casting assistant", e: { x: 5, rel: { m: 6 } }, r: "'Send your portfolio.' Progress!" } ] },
    { id: "ev_match", dress: "sport", lives: ["cricket"], title: "Charity cricket match at the city ground", t: "A friendly charity match. Whites only, rules strict, samosas unlimited.",
      c: [ { l: "Open the batting", ck: { k: "sx", d: 40, ok: { e: { x: 9, r: 6 }, r: "A breezy 45 for charity. Local paper mentions you." }, no: { e: { x: -3 }, r: "Bowled first ball. For charity, of course." } } },
           { l: "Bowl tight and save runs", e: { s: 5, r: 4 }, r: "Economy rate of 4. The coach writes something down." } ] }
  ],
  courierNames: { KL: "Ajmal", MH: "Rohit", PB: "Harjeet", WB: "Sourav", RJ: "Imran", KA: "Manju" },
  courierLines: ["FXN delivery! Tried to be faster than your mother's phone call.", "Here you go. Return it clean, my supervisor checks with a magnifying glass.", "Delivered! Rate me 5 stars or my scooter cries.", "Your outfit has arrived. You'll look 30% more successful."],
  gig: { pay: 150, drops: 3 }
};
