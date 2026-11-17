// City systems: Government Office papers, bank loans, your house, marriage, odd jobs and group tasks.
// All money is pretend, in-game money. Amounts are scaled by the city's cost index unless noted.
window.AE_CITY = {
  // ── Government Office ──
  papers: [
    { id: "id", name: "Address proof update", fee: 100, needs: [], why: "Needed for any bank loan or vehicle loan." },
    { id: "food", name: "Food-safety registration", fee: 500, needs: ["id"], why: "Needed to sell food: stalls, cloud kitchens, cold storage." },
    { id: "trade", name: "Trade licence", fee: 1500, needs: ["id"], why: "Needed to rent a shop, hall, studio or kitchen, and for business loans." },
    { id: "homestay", name: "Homestay registration", fee: 2000, needs: ["trade"], why: "Needed to list a homestay with tourism and booking sites." },
    { id: "permit", name: "Taxi permit", fee: 3000, needs: ["id"], why: "Needed to run a taxi." },
    { id: "export", name: "Export registration", fee: 5000, needs: ["trade", "food"], why: "Needed to sell seafood or crafts to exporters." },
    { id: "marriage", name: "Marriage certificate", fee: 200, needs: ["id"], married: true, why: "Register your marriage after the wedding." }
  ],
  officeLines: [
    "The officer adjusts his glasses, reads every page twice and stamps it like a drumbeat.",
    "'Form 4B, not 4A,' says the clerk. You fill it again. She smiles. Approved.",
    "Three stamps, two signatures, one 'come back after lunch'. Lunch is from 1 to 2:30.",
    "The token display jumps from 41 to 87 for no reason. Somehow, yours gets called.",
    "A retired uncle in the queue helps you fill the form and tells you his whole life story. Approved."
  ],

  // ── Bank ──
  loans: [
    { id: "personal", name: "Personal loan", amount: 30000, rate: 0.14, needs: ["id"], why: "For anything. Highest interest." },
    { id: "business", name: "Business loan", amount: 120000, rate: 0.11, needs: ["id", "trade"], why: "For your shop, vehicle, stock or kitchen." },
    { id: "home", name: "Home loan", amount: 250000, rate: 0.09, needs: ["id"], house: true, why: "Only for upgrading your house. Lowest interest." },
    { id: "venture", name: "Venture loan: start something new in another city", amount: 100000, rate: 0.11, needs: ["id", "trade"], venture: true, why: "Quit your current life and start a business in Bengaluru, Hyderabad, Mumbai or Delhi." }
  ],
  ventureLives: ["street", "kitchen", "startup", "craft", "stylist", "planner", "cab", "teacher"],

  // ── Your house ──
  houseLevels: [
    { name: "Rented room", cost: 0, upkeep: 0, h: 0, floors: 1 },
    { name: "1BHK flat", cost: 15000, upkeep: 2000, h: 2, floors: 2 },
    { name: "2BHK flat", cost: 45000, upkeep: 3500, h: 4, floors: 3 },
    { name: "Independent house", cost: 120000, upkeep: 5000, h: 6, floors: 2, house: true },
    { name: "Villa by the backwaters", cost: 300000, upkeep: 8000, h: 9, floors: 3, house: true }
  ],
  walls: [["Cream", "#efe4cf"], ["Mint", "#bfe3d0"], ["Sky", "#bcd7f0"], ["Peach", "#f6c7a8"], ["Lavender", "#d6c8f0"], ["Kerala green", "#7fb77e"]],
  decor: [
    { id: "plants", name: "Indoor plants", cost: 800, h: 1 },
    { id: "lights", name: "Fairy lights", cost: 600, h: 1 },
    { id: "shelf", name: "Bookshelf", cost: 2500, h: 1 },
    { id: "swing", name: "Wooden swing (oonjal)", cost: 3500, h: 2 },
    { id: "sofa", name: "Sofa set", cost: 6000, h: 2 },
    { id: "aquarium", name: "Aquarium", cost: 3000, h: 1 },
    { id: "tv", name: "Big TV", cost: 9000, h: 2 },
    { id: "gaming", name: "Gaming setup", cost: 12000, h: 2 },
    { id: "art", name: "Wall art from Fort Kochi", cost: 1500, h: 1 },
    { id: "ac", name: "Air conditioner", cost: 15000, h: 3 }
  ],

  // ── Marriage ──
  // Fictional apps. Profiles are made-up characters.
  sites: [
    { id: "mangalya", name: "MangalyaMatch", kind: "Matrimony", blurb: "Families, horoscopes optional, and an aunty who checks your 'settled' status.", family: true },
    { id: "chaidate", name: "ChaiDate", kind: "Dating app", blurb: "Swipe, chat, meet for chai. Families come later.", family: false }
  ],
  profiles: [
    { id: "b1", g: "w", name: "Meera", age: 26, job: "Software tester at Infopark", city: "Kochi", bio: "Finds bugs for a living. Will find yours too.", likes: "Long drives, short meetings", pick: 30 },
    { id: "b2", g: "w", name: "Ayesha", age: 27, job: "Dentist", city: "Kochi", bio: "Will judge your smile. Professionally.", likes: "Biriyani, bad puns", pick: 45 },
    { id: "b3", g: "w", name: "Lakshmi", age: 25, job: "Bank officer", city: "Thrissur", bio: "Looking for someone with a stable EMI-to-income ratio.", likes: "Pooram, spreadsheets", pick: 40 },
    { id: "b4", g: "w", name: "Neha", age: 28, job: "Architect", city: "Bengaluru", bio: "Designs houses. Wants one with a big window and no in-laws on the first floor.", likes: "Filter coffee, sketching", pick: 50 },
    { id: "b5", g: "w", name: "Anu", age: 26, job: "Physiotherapist", city: "Kochi", bio: "Can fix your back. Can't fix your attitude.", likes: "Football, sunsets at Marine Drive", pick: 25 },
    { id: "b6", g: "w", name: "Fathima", age: 29, job: "Runs a bakery", city: "Kozhikode", bio: "Will feed you. Do not touch the last plum cake.", likes: "Baking, old Malayalam songs", pick: 35 },
    { id: "b7", g: "w", name: "Divya", age: 27, job: "Journalist", city: "Hyderabad", bio: "Asks a lot of questions. Expects honest answers.", likes: "Debates, Irani chai", pick: 55 },
    { id: "b8", g: "w", name: "Sneha", age: 24, job: "Classical dancer and teacher", city: "Kochi", bio: "Graceful on stage. Competitive at board games.", likes: "Temple festivals, ludo", pick: 30 },
    { id: "g1", g: "m", name: "Arjun", age: 28, job: "Civil engineer", city: "Kochi", bio: "Builds bridges. Emotionally, still under construction.", likes: "Cricket, his mother's fish curry", pick: 30 },
    { id: "g2", g: "m", name: "Rahul", age: 29, job: "Chartered accountant", city: "Kochi", bio: "Will do your taxes. Will not do your dishes. Negotiable.", likes: "Numbers, Netflix", pick: 45 },
    { id: "g3", g: "m", name: "Nikhil", age: 27, job: "Chef", city: "Mumbai", bio: "Cooks for 200 people a night. Burns toast at home.", likes: "Street food tours, jazz", pick: 35 },
    { id: "g4", g: "m", name: "Faisal", age: 30, job: "Doctor", city: "Kochi", bio: "On call 24/7, except during football matches.", likes: "Football, travel", pick: 50 },
    { id: "g5", g: "m", name: "Vishnu", age: 26, job: "Government clerk", city: "Thiruvananthapuram", bio: "Permanent job. Permanent moustache.", likes: "Kathakali, tea at 4 pm sharp", pick: 30 },
    { id: "g6", g: "m", name: "Kiran", age: 28, job: "Product manager", city: "Bengaluru", bio: "Has a roadmap for everything, including this date.", likes: "Trekking, gadgets", pick: 50 },
    { id: "g7", g: "m", name: "Joel", age: 27, job: "Musician and music teacher", city: "Kochi", bio: "Will write you a song. It'll be about traffic.", likes: "Guitars, beach walks", pick: 25 },
    { id: "g8", g: "m", name: "Aditya", age: 29, job: "Pilot", city: "Delhi", bio: "Frequent flyer. Looking for someone to land with.", likes: "Travel, terrible jokes", pick: 55 }
  ],
  dates: [
    { t: "{p} arrives exactly on time and orders a black coffee. 'So. Tell me something that isn't on your profile.'",
      c: [
        { l: "Tell a funny, honest story about your worst day at work", ok: 14, r: "{p} laughs so hard the waiter comes to check. Good sign." },
        { l: "List your achievements", ok: -4, r: "{p} nods politely. It feels like a job interview." },
        { l: "Ask {p} about their dreams and actually listen", ok: 12, r: "{p} talks for twenty minutes, then says 'Sorry, I never talk this much.' Great sign." }
      ] },
    { t: "Halfway through the date, {p}'s phone rings. It's their mother. Video call. She wants to see you.",
      c: [
        { l: "Wave and say a polite hello in Malayalam", ok: 12, r: "Mother approves of your manners. {p} looks relieved." },
        { l: "Hide behind the menu", ok: -6, r: "{p} laughs, but the mother saw. She definitely saw." },
        { l: "Take the phone and charm her", ok: 6, r: "Ten minutes about your family tree. {p} is amused and a bit scared." }
      ] }
  ],
  weddings: [
    { id: "registry", name: "Simple registered wedding and lunch", cost: 15000, h: 6, r: 2 },
    { id: "temple", name: "Traditional ceremony with sadya for 150", cost: 60000, h: 10, r: 5 },
    { id: "grand", name: "Grand wedding with reception for 600", cost: 200000, h: 12, r: 8 }
  ],

  // ── Odd jobs (Notice Board, Kochi) ──
  oddJobs: [
    { id: "cake", t: "Deliver a birthday cake before the candles are lit", pay: 300, r: 1 },
    { id: "sacks", t: "Help a shop owner unload rice sacks", pay: 400, h: -2 },
    { id: "dog", t: "Walk a neighbour's very energetic dog", pay: 250, h: 2 },
    { id: "phone", t: "Fix an ammachi's phone (she pressed something)", pay: 200, r: 2 },
    { id: "flyers", t: "Hand out flyers for the new theatre play", pay: 300 },
    { id: "tiffin", t: "Deliver a tiffin box someone forgot at home", pay: 200, r: 1 },
    { id: "boat", t: "Help push a stuck boat back into the water", pay: 350, h: 1 },
    { id: "tutor", t: "Help a kid with a science project due tomorrow", pay: 400, r: 2 },
    { id: "queue", t: "Hold a place in the ration shop queue for an elderly man", pay: 150, r: 2 },
    { id: "plants", t: "Water the plants of a family on holiday", pay: 200 },
    { id: "photo", t: "Take photos at a small house-warming", pay: 500 },
    { id: "cat", t: "Find a lost cat named 'Tiger' (it's very small)", pay: 300, h: 3 }
  ],

  // ── Group tasks (2, 4 or 6 players). Missing players are filled by hired helpers who take their share. ──
  groupTasks: [
    { id: "fridge", size: 2, t: "Carry a fridge up three floors for a family moving in", city: "KL", where: "door", reward: 2000, r: 3 },
    { id: "tyre", size: 2, t: "Change a bus tyre at the station before the evening rush", city: "KL", where: "station", reward: 1600, r: 2 },
    { id: "pandal", size: 4, t: "Set up a wedding pandal at the Town Hall", city: "KL", where: "hall", reward: 6000, r: 4 },
    { id: "wall", size: 4, t: "Paint a mural on a government school wall", city: "KL", where: "office", reward: 5000, r: 6 },
    { id: "beach", size: 6, t: "Clean up the shore after the festival weekend", city: "KL", where: "f", reward: 9000, r: 8 },
    { id: "boatrace", size: 6, t: "Practise rowing for the snake-boat race team", city: "KL", where: "board", reward: 10000, r: 8, h: 6 },
    { id: "blrfest", size: 4, t: "Run a stall at a Bengaluru tech-fest", city: "KA", where: "board", reward: 8000, r: 4 },
    { id: "hydfood", size: 2, t: "Help a Hyderabad caterer serve biryani at a big Iftar", city: "TG", where: "hall", reward: 3000, r: 3 },
    { id: "bomshoot", size: 6, t: "Work as extras for a film shoot in Mumbai", city: "MH", where: "station", reward: 12000, r: 3, h: 6 },
    { id: "delwed", size: 4, t: "Help run the decorations at a big Delhi wedding", city: "DL", where: "hall", reward: 9000, r: 4 }
  ],

  // ── FXN rider shifts ──
  rider: { pay: 180, drops: 3, minAvg: 3, tipMax: 60 },
  customers: ["Mrs. Thomas", "Rafeeq", "Divya chechi", "Mr. Menon", "Sanjay", "Ammini amma", "Joseph sir", "Rinsha", "Pramod", "Aswathy"],
  rate5: ["Super fast! ⭐⭐⭐⭐⭐", "Rider was so polite. Five stars.", "Earlier than the food I ordered from the other app. Wow."],
  rate3: ["Took a while, but okay.", "Fine. My outfit is fine. I am fine."],
  rate1: ["The party started without me.", "Did you go via Thrissur?", "I've aged waiting for this parcel."]
};
