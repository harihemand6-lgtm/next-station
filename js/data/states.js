// Cities. Everyone starts in Kochi (KL); Bengaluru, Hyderabad, Mumbai and Delhi are reached by train.
// Packs are keyed by state code; the game talks about the city.
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
    blurb: "The hub of the game. Backwaters, metro and ferries, chayakadas on every corner and relatives in the Gulf.",
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
      { id: "kl_biennale", w: 2, who: "f", t: "The art biennale is on in Fort Kochi. {friend} wants to spend Saturday walking through the warehouse galleries.",
        c: [
          { l: "Go, and take the ferry there", e: { h: 10, c: -150, s: 2, rel: { f: 8 } }, r: "Ferry, art, a plate of fish curry rice by the sea. You come back with three new ideas." },
          { l: "Skip it, too busy", e: { x: 2, rel: { f: -4 } }, r: "You get work done. {friend}'s photos look unreal." }
        ] },
      { id: "kl_vyttila", w: 3, t: "A broken-down bus at Vyttila junction. The whole city is stuck and you're late for something important.",
        c: [
          { l: "Hop off and take the metro", e: { c: -60, s: 1 }, r: "Metro to the rescue. You make it with two minutes to spare." },
          { l: "Call ahead and reschedule", e: { r: 2, h: 2 }, r: "People appreciate the heads-up. In Kochi, everyone understands Vyttila." },
          { l: "Wait it out", e: { h: -5, r: -3 }, r: "Ninety minutes later you arrive. Nobody's impressed." }
        ] },
      { id: "kl_tourists", w: 2, t: "A group of foreign tourists near the Chinese fishing nets is lost and asking you for directions in very loud English.",
        c: [
          { l: "Walk them there yourself", e: { h: 6, r: 4 }, r: "They insist on a selfie and promise to tell everyone about 'the friendly local'." },
          { l: "Point and wish them luck", e: { h: 1 }, r: "They head the wrong way. You hope they find it." }
        ] },
      { id: "kl_market", w: 2, who: "m", t: "{mentor} takes you to the wholesale market at dawn. 'If you want to understand money in this city, watch how people bargain here.'",
        c: [
          { l: "Watch, listen and take notes", e: { s: 6, h: -2, rel: { m: 10 } }, r: "Three hours, forty deals, zero receipts. You learned more than a business course." },
          { l: "Try bargaining yourself", ck: { k: "s", d: 30, ok: { e: { c: 400, s: 4, rel: { m: 8 } }, r: "The trader laughs, then gives you the price. {mentor} looks proud." }, no: { e: { c: -200, h: -2 }, r: "You overpay so badly the trader gives you a free banana out of pity." } } }
        ] },
      { id: "kl_rain_rescue", w: 2, min: 3, t: "Heavy rain again. A neighbour's ground floor is flooding and the volunteers' group is asking for help moving things upstairs.",
        c: [
          { l: "Go help with the volunteers", e: { r: 8, h: 4, x: -1, rel: { f: 6 } }, r: "Two hours of lifting furniture in knee-deep water. The street won't forget it." },
          { l: "Send money to the relief fund", e: { c: -500, r: 3 }, r: "Not as dramatic, but it helps." },
          { l: "Stay dry inside", e: { h: -3 }, r: "You watch from the window and feel bad about it." }
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
    film: "the Hindi film industry", festival: "Ganeshotsav", sport: "the monsoon cricket tournament",
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
  KA: {
    name: "Karnataka", city: "Bengaluru", ci: 1.25, hue: "#7b8cff",
    greet: "Namaskara", buddy: "maga", lang: "Kannada",
    cast: { m: "Ramesh", v: "Kiran", f: "Divya", p: "Amma" },
    food: { item: "idli-vada and filter coffee", stall: "darshini", price: 45, margin: 18, base: 70 },
    craft: { item: "Channapatna wooden toys and Mysore silk", margin: 600, base: 26 },
    film: "Kannada cinema", festival: "Mysuru Dasara", sport: "the weekend cricket league",
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
  },
  TG: {
    name: "Telangana", city: "Hyderabad", ci: 1.15, hue: "#e0638a",
    greet: "Namaskaram", buddy: "mama", lang: "Telugu",
    cast: { m: "Srinivas", v: "Vikram", f: "Sravani", p: "Amma" },
    food: { item: "Irani chai and Osmania biscuits", stall: "Irani chai counter", price: 30, margin: 13, base: 95 },
    craft: { item: "Pochampally ikat and Nirmal paintings", margin: 900, base: 22 },
    film: "Telugu cinema", festival: "Bonalu", sport: "the colony cricket league",
    blurb: "Biryani wars, HITEC City towers, Old City lanes and first-day-first-show madness.",
    ev: [
      { id: "tg_biryani", w: 3, who: "f", t: "{friend} starts a war in the group chat: which biryani place in {city} is the real one? Everyone wants your vote.",
        c: [
          { l: "Defend the old family place", e: { h: 6, rel: { f: 6 } }, r: "Forty messages later, nobody changed their mind. A perfect Hyderabad evening." },
          { l: "Say 'all of them are good'", e: { rel: { f: -4 } }, r: "The group mutes you for being diplomatic. Unforgivable here." },
          { l: "Organise a blind taste test", e: { c: -600, h: 10, r: 3, rel: { f: 10 } }, r: "Six plates, five friends, one winner nobody expected. Legendary." }
        ] },
      { id: "tg_bonalu", w: 3, who: "p", t: "It's {festival} season. Drums in every lane, and {parent} wants you at the temple procession with the family.",
        c: [
          { l: "Go with family", e: { h: 10, c: -500, rel: { p: 12 } }, r: "The drums, the colours, the crowd. You come back hoarse and happy." },
          { l: "Work through it", e: { c: 1200, x: 2, rel: { p: -8 } }, r: "Productive day. The family photos without you sting a little." }
        ] },
      { id: "tg_fdfs", w: 2, who: "f", t: "A big star's film releases tonight. {friend} has tickets for the first-day-first-show at 4 am.",
        c: [
          { l: "Go. Whistles and all.", e: { h: 12, c: -400, x: -1, rel: { f: 10 } }, r: "Paper confetti, whistles, a hero entry at 4:15 am. Zero sleep, no regrets." },
          { l: "Sleep. Watch it next week.", e: { s: 2, rel: { f: -5 } }, r: "Well rested. Also spoiled by 37 status updates." }
        ] },
      { id: "tg_land", w: 2, who: "v", t: "{rival} says he can get you a plot near the outer ring road 'before prices double'. Cash only, papers later.",
        c: [
          { l: "Ask for the title papers and check them at the government office", e: { s: 4, r: 2 }, r: "The 'plot' belongs to three other people. You dodged a classic land scam." },
          { l: "Pay the token advance", e: { c: -3000, h: -8, set: "scammed" }, r: "The token advance vanished. So did {rival}'s phone number." }
        ] }
    ]
  },
  DL: {
    name: "Delhi", city: "Delhi", ci: 1.3, hue: "#e86f3c",
    greet: "Namaste", buddy: "bhai", lang: "Hindi",
    cast: { m: "Gupta ji", v: "Rohan", f: "Simran", p: "Mummy" },
    food: { item: "chole bhature and chai", stall: "chole bhature cart", price: 60, margin: 24, base: 85 },
    craft: { item: "zari embroidery and block-print textiles", margin: 800, base: 24 },
    film: "Delhi's indie film scene", festival: "Diwali", sport: "the park cricket league",
    blurb: "Metro rides, winter fog, paratha breakfasts, big weddings and bigger opinions.",
    ev: [
      { id: "dl_smog", w: 3, t: "The air quality index crosses 400. Schools shut, everyone's coughing, and your plans for the week look grim.",
        c: [
          { l: "Mask up and keep going", e: { x: 2, h: -6 }, r: "You get work done. Your lungs file a complaint." },
          { l: "Work from indoors for a few days", e: { h: 3, x: -1 }, r: "Slower week, but you stay healthy." },
          { l: "Buy an air purifier for home", e: { c: -1500, h: 6 }, r: "Expensive, but the family sleeps better." }
        ] },
      { id: "dl_wedding", w: 3, who: "p", t: "Wedding season. {parent} has accepted invitations to five weddings this month, all 'compulsory'.",
        c: [
          { l: "Attend all five", e: { h: 4, c: -1500, x: -2, rel: { p: 12 } }, r: "Five weddings, three sherwanis, one very tired you. Mummy is delighted." },
          { l: "Go to the two closest ones", e: { c: -600, rel: { p: 4 } }, r: "A fair compromise. You still dance to the same three songs." },
          { l: "Skip them for work", e: { c: 1200, rel: { p: -10 } }, r: "Productive month. Every relative now asks if you're 'too busy for family'." }
        ] },
      { id: "dl_contact", w: 2, who: "v", t: "{rival} says his uncle 'knows someone in the ministry' and can fast-track any permission you need. Just ₹20,000 for 'expenses'.",
        c: [
          { l: "Decline and apply through the official portal", e: { s: 3, r: 3 }, r: "It takes three weeks, but it's real. 'Contacts' like that are how people get cheated, or arrested." },
          { l: "Pay for the shortcut", shady: true, e: { c: -2000, set: "scammed" }, r: "The 'expenses' were spent. No permission ever came." }
        ] },
      { id: "dl_metro", w: 2, who: "f", t: "{friend} wants to explore Old Delhi on Sunday: parathas, the spice market and old lanes.",
        c: [
          { l: "Go. Metro at 8 am sharp.", e: { h: 10, c: -400, rel: { f: 10 } }, r: "Six parathas, one spice-sneezing fit, endless stories. Best Sunday in months." },
          { l: "Stay in and rest", e: { h: 4, rel: { f: -4 } }, r: "Rested, but the photos look amazing." }
        ] }
    ]
  }
};
