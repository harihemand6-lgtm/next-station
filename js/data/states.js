// States and union territories. Playable ones have a full pack in AE_STATES.
// Map grid: [id, name, col, row]
window.AE_MAP = [
  ["JK","Jammu & Kashmir",3,0],["LA","Ladakh",4,0],
  ["CH","Chandigarh",2,1],["PB","Punjab",3,1],["HP","Himachal Pradesh",4,1],
  ["HR","Haryana",3,2],["DL","Delhi",4,2],["UK","Uttarakhand",5,2],["AR","Arunachal Pradesh",9,2],
  ["RJ","Rajasthan",3,3],["UP","Uttar Pradesh",4,3],["BR","Bihar",5,3],["SK","Sikkim",6,3],["AS","Assam",8,3],["NL","Nagaland",9,3],
  ["GJ","Gujarat",2,4],["MP","Madhya Pradesh",3,4],["CG","Chhattisgarh",4,4],["JH","Jharkhand",5,4],["WB","West Bengal",6,4],["ML","Meghalaya",8,4],["MN","Manipur",9,4],
  ["DD","Dadra & Nagar Haveli and Daman & Diu",1,5],["MH","Maharashtra",3,5],["OD","Odisha",5,5],["TR","Tripura",8,5],["MZ","Mizoram",9,5],
  ["GA","Goa",2,6],["KA","Karnataka",3,6],["TG","Telangana",4,6],["AP","Andhra Pradesh",5,6],
  ["LD","Lakshadweep",1,7],["KL","Kerala",3,7],["TN","Tamil Nadu",4,7],["PY","Puducherry",5,7],["AN","Andaman & Nicobar",8,7]
];

// Effects shorthand used everywhere:
// c cash (scaled by the state's cost index), r reputation, h happiness, s skill, x life metric,
// rel {m mentor, v rival, f friend, p parent}, set / unset flags.
window.AE_STATES = {
  KL: {
    name: "Kerala", city: "Kochi", ci: 1.0, hue: "#1fa39a",
    greet: "Namaskaram", buddy: "machane", lang: "Malayalam",
    cast: { m: "Varghese", v: "Shibu", f: "Anjali", p: "Amma" },
    food: { item: "chaya and pazhampori", stall: "chayakada", price: 25, margin: 12, base: 80 },
    craft: { item: "Kasavu handloom sarees and mundu", margin: 700, base: 26 },
    film: "Malayalam cinema", festival: "Onam", sport: "the district football league",
    blurb: "Backwaters, monsoon, chayakadas on every corner and relatives in the Gulf.",
    ev: [
      { id: "kl_monsoon", w: 3, t: "The edavapathi monsoon arrives a week early. Roads flood near {city} and half your plans wash out.",
        c: [
          { l: "Push on in the rain", e: { s: 4, h: -6, x: 3 }, r: "Soaked but stubborn. People notice who shows up in a downpour." },
          { l: "Take two days off and reset", e: { h: 8, x: -2 }, r: "You sleep, eat Amma's kanji and come back sharper." },
          { l: "Help clear a flooded lane with neighbours", e: { r: 8, h: 4, c: -200, rel: { f: 8 } }, r: "The whole street remembers that. {friend} brought tea for everyone." }
        ] },
      { id: "kl_onam", w: 3, t: "It's {festival} week. Everyone is spending, and {parent} wants you home for the sadya.", who: "p",
        c: [
          { l: "Go home for the sadya", e: { h: 12, c: -800, rel: { p: 15 } }, r: "Twenty-six dishes on a banana leaf. Worth every rupee of bus fare." },
          { l: "Work through the festival rush", e: { c: 1500, h: -8, rel: { p: -10 }, x: 3 }, r: "Good money, but the phone call home was quiet." },
          { l: "Do both: half day work, then home", e: { c: 600, h: 4, rel: { p: 6 } }, r: "Tired, but you made it before the payasam ran out." }
        ] },
      { id: "kl_gulf", w: 2, who: "f", t: "A visiting relative from the Gulf says he can get you a 'visa job' in Dubai. You just need to pay his agent ₹40,000 upfront.",
        c: [
          { l: "Ask for the company name and offer letter first", e: { s: 3, r: 2 }, r: "He goes vague. The 'agent' stops answering. You dodged a classic visa scam." },
          { l: "Pay the agent", e: { c: -4000, h: -10, set: "scammed" }, r: "You paid a ₹4,000 'processing fee' first. Then the agent vanished. Lesson learned the hard way." },
          { l: "Say no, you're building something here", e: { h: 3, rel: { p: -3 } }, r: "Amma sighs, but she's quietly proud." }
        ] },
      { id: "kl_football", w: 2, who: "f", t: "{friend} has two tickets to {sport} final tonight. Everyone's going.",
        c: [
          { l: "Go. You need this.", e: { h: 10, c: -300, rel: { f: 10 } }, r: "Last-minute winner. You lose your voice and gain a story." },
          { l: "Stay back and work", e: { x: 3, s: 2, rel: { f: -6 } }, r: "Productive night. {friend} sends you 14 videos of the goal." }
        ] }
    ]
  },
  MH: {
    name: "Maharashtra", city: "Mumbai", ci: 1.35, hue: "#f4a52b",
    greet: "Namaskar", buddy: "bhau", lang: "Marathi",
    cast: { m: "Sunil", v: "Bunty", f: "Priya", p: "Aai" },
    food: { item: "vada pav and cutting chai", stall: "vada pav stall", price: 20, margin: 9, base: 120 },
    craft: { item: "Paithani silk sarees", margin: 1200, base: 18 },
    film: "the Hindi film industry", festival: "Ganeshotsav", sport: "the Kanga League monsoon cricket",
    blurb: "Local trains, big dreams, small rooms and the fastest city in the country.",
    ev: [
      { id: "mh_ganesh", w: 3, t: "{festival} is here. The local mandal asks you to volunteer for ten days, and asks for a contribution.",
        c: [
          { l: "Volunteer every evening", e: { r: 10, h: 6, x: 2, rel: { f: 6 } }, r: "You meet half the neighbourhood. Useful people, too." },
          { l: "Give ₹1,000, skip the volunteering", e: { c: -1000, r: 4 }, r: "Polite and done. The mandal secretary nods." },
          { l: "Skip it this year", e: { r: -4, x: 2 }, r: "More time to work, a few raised eyebrows." }
        ] },
      { id: "mh_trains", w: 3, t: "Heavy rain stops the local trains. {city} is stuck.",
        c: [
          { l: "Wade through and keep going", e: { s: 3, h: -6, r: 4 }, r: "Three hours, wet socks, but you made it." },
          { l: "Work from wherever you are", e: { x: 2, h: 2 }, r: "Not ideal, but something got done." },
          { l: "Open your place to stranded people", e: { r: 10, c: -400, h: 5 }, r: "Chai and a dry floor for strangers. They don't forget." }
        ] },
      { id: "mh_rent", w: 2, who: "p", t: "Your landlord raises the rent by 20%. 'Market rate,' he says. {parent} says just come back home to Thane.",
        c: [
          { l: "Pay it", e: { c: -2500, h: -3 }, r: "Expensive, but your commute stays short." },
          { l: "Move back home, longer commute", e: { c: 1500, h: -6, rel: { p: 10 } }, r: "Aai's cooking is back. So is the 6:40 fast local." },
          { l: "Negotiate with a 11-month agreement", e: { s: 4, c: -800 }, r: "You meet him halfway. Small win." }
        ] },
      { id: "mh_lonavala", w: 2, who: "f", t: "{friend} plans a monsoon trip to Lonavala this Sunday.",
        c: [
          { l: "Go", e: { h: 12, c: -900, rel: { f: 10 } }, r: "Bhutta, waterfalls, one bad selfie angle. Perfect." },
          { l: "Skip it to work", e: { x: 3, rel: { f: -5 }, h: -3 }, r: "The group photo has a gap where you should be." }
        ] }
    ]
  },
  PB: {
    name: "Punjab", city: "Ludhiana", ci: 1.0, hue: "#e8c547",
    greet: "Sat Sri Akal", buddy: "yaara", lang: "Punjabi",
    cast: { m: "Gurdeep", v: "Lucky", f: "Simran", p: "Bebe" },
    food: { item: "parathas, dal and lassi", stall: "highway dhaba", price: 90, margin: 35, base: 35 },
    craft: { item: "hand-embroidered Phulkari dupattas", margin: 650, base: 28 },
    film: "Punjabi cinema", festival: "Baisakhi", sport: "the district kabaddi and cricket circuit",
    blurb: "Fields to the horizon, big-hearted food, and everyone's cousin is in Canada.",
    ev: [
      { id: "pb_canada", w: 3, who: "p", t: "An agent promises a Canada study visa 'guaranteed' for ₹12 lakh. Half the village has gone. {parent} is tempted.",
        c: [
          { l: "Check the college on the official government site", e: { s: 4, r: 2 }, r: "The 'college' isn't on the official list. You just saved the family a fortune." },
          { l: "Pay the agent's ₹20,000 'file fee'", e: { c: -2000, h: -8, set: "scammed" }, r: "The office is shut the next week. The fee is gone." },
          { l: "Tell {parent} you want to build something here", e: { rel: { p: 5 }, h: 4 }, r: "Bebe pats your head. 'Theek hai puttar, show me.'" }
        ] },
      { id: "pb_baisakhi", w: 3, t: "{festival}. The harvest is in, the dhol is out, and the whole town is celebrating.",
        c: [
          { l: "Dance at the mela all day", e: { h: 12, rel: { f: 8 }, c: -300 }, r: "Your legs hurt. Your heart doesn't." },
          { l: "Set up a stall at the mela", e: { c: 1800, h: 2, x: 3 }, r: "Festival crowds, festival money." }
        ] },
      { id: "pb_wedding", w: 2, who: "f", t: "{friend}'s cousin's wedding: 800 guests. They need extra hands and offer to pay.",
        c: [
          { l: "Help out for pay", e: { c: 2000, h: -2, r: 4 }, r: "Four days of work, a lot of food and a few new contacts." },
          { l: "Attend as a guest and network", e: { r: 6, c: -500, h: 6 }, r: "You leave with a full stomach and three phone numbers." }
        ] },
      { id: "pb_lohri", w: 2, who: "p", t: "At the Lohri bonfire, relatives ask the eternal question: 'Shaadi kab karni hai?'",
        c: [
          { l: "Laugh it off and change the topic", e: { h: 3 }, r: "Classic deflection. Works every time." },
          { l: "Talk about your goals instead", e: { r: 3, rel: { p: 5 } }, r: "One uncle is impressed. One is not. Progress." }
        ] }
    ]
  },
  WB: {
    name: "West Bengal", city: "Kolkata", ci: 0.95, hue: "#e2574c",
    greet: "Nomoshkar", buddy: "bondhu", lang: "Bengali",
    cast: { m: "Bapi-da", v: "Tutul", f: "Mou", p: "Maa" },
    food: { item: "phuchka and telebhaja", stall: "phuchka cart", price: 30, margin: 14, base: 90 },
    craft: { item: "Kantha-stitch stoles and tant sarees", margin: 550, base: 30 },
    film: "Bengali cinema", festival: "Durga Puja", sport: "the big Kolkata football derby",
    blurb: "Adda over cha, Durga Puja lights, trams, books and endless argument.",
    ev: [
      { id: "wb_puja", w: 3, t: "{festival}. Five days, millions of people, pandals everywhere.",
        c: [
          { l: "Go pandal-hopping all night", e: { h: 12, c: -500, rel: { f: 8 } }, r: "Twenty pandals, three kathi rolls, zero sleep." },
          { l: "Work the Puja crowds", e: { c: 2000, x: 4, h: -4 }, r: "The best five days of the year for anyone selling anything." },
          { l: "Volunteer at the para pandal", e: { r: 10, h: 5 }, r: "The para committee now considers you family." }
        ] },
      { id: "wb_adda", w: 2, who: "f", t: "{friend} drags you to an evening adda at the College Street coffee house.",
        c: [
          { l: "Stay for hours debating everything", e: { h: 8, s: 2, rel: { f: 6 } }, r: "You argued about cinema, politics and fish. Somehow you also got two good ideas." },
          { l: "Leave early to work", e: { x: 2, rel: { f: -4 } }, r: "Responsible. Slightly boring." }
        ] },
      { id: "wb_cyclone", w: 2, t: "A cyclone warning for the coast. Heavy rain is expected in {city} for two days.",
        c: [
          { l: "Shut down safely and stock up", e: { c: -600, h: 2 }, r: "Boring, safe and correct." },
          { l: "Keep going and hope for the best", e: { c: -1500, h: -6 }, r: "Your setup gets damaged. Should have listened." }
        ] },
      { id: "wb_derby", w: 2, who: "v", t: "Derby day. {rival} supports the other club and won't stop texting you about it.",
        c: [
          { l: "Bet him a plate of biryani", e: { h: 4, rel: { v: 5 } }, r: "You lose the bet, win a weird new friendship." },
          { l: "Ignore him and focus", e: { x: 2 }, r: "Mature. He sends 40 memes anyway." }
        ] }
    ]
  },
  RJ: {
    name: "Rajasthan", city: "Jaipur", ci: 0.9, hue: "#e4775a",
    greet: "Khamma Ghani", buddy: "bhai-sa", lang: "Rajasthani",
    cast: { m: "Bhanwar-ji", v: "Mohit", f: "Kavya", p: "Maa" },
    food: { item: "pyaaz kachori and masala chai", stall: "kachori stall", price: 30, margin: 13, base: 95 },
    craft: { item: "hand block-printed textiles from Sanganer", margin: 500, base: 32 },
    film: "film shoots in the Pink City", festival: "Teej", sport: "the inter-district cricket trials",
    blurb: "Forts, desert light, block prints, tourists from everywhere and 47°C summers.",
    ev: [
      { id: "rj_tourist", w: 3, t: "Tourist season is here. A tour guide offers to send foreign groups your way, for a 30% commission.",
        c: [
          { l: "Accept the deal", e: { c: 1500, x: 4, rel: { m: -3 } }, r: "More customers, thinner margins." },
          { l: "Build your own reviews instead", e: { s: 4, r: 6 }, r: "Slower, but the customers are yours." }
        ] },
      { id: "rj_heat", w: 3, t: "A heatwave: 47°C in {city}. Nobody wants to be outside after 11 am.",
        c: [
          { l: "Shift your hours to early morning and night", e: { s: 4, h: -3, x: 2 }, r: "Smart. You work when the city works." },
          { l: "Push through the afternoon", e: { h: -10, c: -300 }, r: "Dizziness, a doctor visit and a lesson about heatstroke." }
        ] },
      { id: "rj_pushkar", w: 2, who: "f", t: "{friend} wants to go to the Pushkar fair. Camels, music, traders from everywhere.",
        c: [
          { l: "Go and explore", e: { h: 10, c: -700, s: 2, rel: { f: 8 } }, r: "You came back with sunburn and big ideas." },
          { l: "Go and set up a small stall", e: { c: 1600, h: 3, x: 3 }, r: "Fair crowds buy everything." }
        ] },
      { id: "rj_shaadi", w: 2, who: "p", t: "Wedding season. {parent} wants you at three family weddings in one week.",
        c: [
          { l: "Attend all three", e: { h: 2, c: -1500, rel: { p: 12 } }, r: "Twelve kg of food, eight cousins and a very happy Maa." },
          { l: "Attend one, send gifts to two", e: { c: -900, rel: { p: 3 } }, r: "Diplomatic. Maa accepts it, mostly." }
        ] }
    ]
  },
  KA: {
    name: "Karnataka", city: "Bengaluru", ci: 1.25, hue: "#7b8cff",
    greet: "Namaskara", buddy: "maga", lang: "Kannada",
    cast: { m: "Ramesh", v: "Kiran", f: "Divya", p: "Amma" },
    food: { item: "idli-vada and filter coffee", stall: "darshini", price: 45, margin: 18, base: 70 },
    craft: { item: "Channapatna wooden toys and Mysore silk", margin: 600, base: 26 },
    film: "Kannada cinema", festival: "Mysuru Dasara", sport: "the state T20 league trials",
    blurb: "Filter coffee, tech parks, traffic legends and the best weather in India.",
    ev: [
      { id: "ka_traffic", w: 3, t: "Silk Board junction. You have been in the same spot for 50 minutes.",
        c: [
          { l: "Take calls and plan from the auto", e: { x: 2, h: -3 }, r: "The traffic is legendary. So is your multitasking." },
          { l: "Rearrange your life around off-peak hours", e: { s: 3, h: 4 }, r: "Every Bengalurean's rite of passage." }
        ] },
      { id: "ka_dasara", w: 3, who: "p", t: "{festival} in Mysuru. The palace is lit up and {parent} wants the whole family there.",
        c: [
          { l: "Go with family", e: { h: 10, c: -700, rel: { p: 12 } }, r: "The palace lights are worth the trip every single year." },
          { l: "Stay and work the long weekend", e: { c: 1500, x: 3, rel: { p: -6 } }, r: "Productive, but you miss the procession." }
        ] },
      { id: "ka_rain", w: 2, t: "One evening of rain and the Outer Ring Road turns into a lake.",
        c: [
          { l: "Wait it out at a darshini", e: { h: 5, c: -80 }, r: "Filter coffee fixes everything." },
          { l: "Drive through it", e: { c: -1200, h: -6 }, r: "Water in the engine. Expensive mistake." }
        ] },
      { id: "ka_techbro", w: 2, who: "v", t: "{rival} is now a 'founder' and wants you to join his startup. Equity only, no salary.",
        c: [
          { l: "Ask for his pitch deck and numbers", e: { s: 4 }, r: "There's a logo and a lot of buzzwords. You pass." },
          { l: "Join part-time for equity", e: { h: -4, x: 1, set: "sideequity" }, r: "Your evenings now belong to someone else's dream." },
          { l: "Politely decline", e: { rel: { v: -3 } }, r: "He calls you 'not visionary'. You'll live." }
        ] }
    ]
  }
};
