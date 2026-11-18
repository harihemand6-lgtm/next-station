// Daily duties: hands-on work for each life. Three a day, picked from these five.
// at: where it happens (spot key; "door" = a random customer's door). type:
//   go   — just get there (deliveries, pickups)
//   tap  — tap fast: n taps in secs seconds
//   seq  — tap the steps in the right order
//   pick — choose the right answer, one or more rounds
//   hold — hold the button and let go when the bar is in the green zone
// pay is in rupees before the city's cost scaling.
window.AE_DUTIES = {
  street: [
    { t: "Pick up bananas from the wholesaler", at: "door", type: "go", pay: 120, done: "Nendran pazham, fresh from Thrissur!" },
    { t: "Fry a batch of pazhampori", at: "m", type: "hold", verb: "Fry", zone: [0.62, 0.82], pay: 200, done: "Golden and crispy!" },
    { t: "Make meter chaya for the morning rush", at: "m", type: "seq", steps: ["Boil water", "Add tea dust", "Pour milk", "Add sugar", "Pull the chaya high"], pay: 180, done: "The froth is perfect." },
    { t: "Serve the lunch crowd", at: "m", type: "pick", rounds: [{ q: "A techie wants something quick and spicy", o: ["Mulaku bajji", "Payasam", "Plain rice", "Ice cream"], a: 0 }, { q: "An ammachi wants something sweet", o: ["Chilli chicken", "Unniyappam", "Black coffee", "Omelette"], a: 1 }, { q: "School kids want a crunchy snack", o: ["Fish curry", "Kanji", "Banana chips", "Pickle"], a: 2 }], pay: 220, done: "Everyone's happy, the box is full." },
    { t: "Scrub the stall clean before closing", at: "m", type: "tap", n: 16, secs: 6, verb: "Scrub", pay: 140, done: "Spotless. The health inspector would be proud." }
  ],
  job: [
    { t: "Morning stand-up at the office", at: "office", type: "pick", rounds: [{ q: "Manager: \"What did you finish yesterday?\"", o: ["The login page fix, tested and merged", "I was busy", "Ask someone else", "Nothing, the Wi-Fi was slow"], a: 0 }, { q: "\"Any blockers?\"", o: ["I need API access from the infra team", "My chair is bad", "No idea", "Too many meetings"], a: 0 }], pay: 220, done: "Stand-up done in 9 minutes. A record." },
    { t: "Squash the bugs before the release", at: "office", type: "tap", n: 18, secs: 7, verb: "Fix 🐞", pay: 260, done: "Zero open bugs. For now." },
    { t: "Ship the new feature", at: "office", type: "seq", steps: ["Write the code", "Run the tests", "Code review", "Merge", "Deploy"], pay: 300, done: "Deployed. Nobody got paged." },
    { t: "Client call at Café Monsoon", at: "cafe", type: "pick", rounds: [{ q: "Client: \"Can you add three features by Friday?\"", o: ["Let's agree on the one that matters most for Friday", "Sure, all of them!", "No.", "Hang up"], a: 0 }], pay: 240, done: "The client loved the honest plan." },
    { t: "Help a new joiner set up their laptop", at: "office", type: "seq", steps: ["Log in", "Connect Wi-Fi", "Install the tools", "Clone the code", "Run it"], pay: 180, done: "They owe you a chaaya." }
  ],
  govt: [
    { t: "Solve a PSC mock test", at: "board", type: "pick", rounds: [{ q: "Capital of Kerala?", o: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"], a: 1 }, { q: "Kerala's longest river?", o: ["Bharathapuzha", "Pamba", "Periyar", "Chaliyar"], a: 2 }, { q: "Kerala's state bird?", o: ["Peacock", "Great hornbill", "Kingfisher", "Crow"], a: 1 }], pay: 200, done: "Full marks! Rank list, here you come." },
    { t: "Process a file at the Government Office", at: "office", type: "seq", steps: ["Receive the file", "Check the documents", "Put the seal", "Sign", "Send it up"], pay: 240, done: "File moved in one day. A miracle." },
    { t: "Help citizens at the counter", at: "office", type: "pick", rounds: [{ q: "\"I lost my ration card\"", o: ["Here's the form for a duplicate, and the documents you need", "Come back next year", "Not my section", "Pay me first"], a: 0 }, { q: "\"Where do I pay the land tax?\"", o: ["Counter 3, or online on the portal", "No idea", "Lunch time, come later", "Go home"], a: 0 }], pay: 220, done: "The queue actually moved today." },
    { t: "Stamp the pending certificates", at: "office", type: "tap", n: 15, secs: 6, verb: "Stamp", pay: 180, done: "Thak thak thak. Done." },
    { t: "Deliver a notice to a house", at: "door", type: "go", pay: 150, done: "Notice delivered, signature taken." }
  ],
  creator: [
    { t: "Shoot a reel at Subhash Park", at: "f", type: "seq", steps: ["Set up the ring light", "Check the frame", "Record", "Add music", "Post"], pay: 220, done: "Posted! The views are climbing." },
    { t: "Reply to comments", at: "m", type: "pick", rounds: [{ q: "\"Your outfit was 🔥 where's it from?\"", o: ["Rented it on FXN, link in bio!", "Ignore", "Block", "Not telling"], a: 0 }, { q: "A troll says your video is fake", o: ["Stay calm, pin the behind-the-scenes clip", "Fight back in capitals", "Delete the account", "Cry"], a: 0 }], pay: 160, done: "The comments section is wholesome today." },
    { t: "Do the trending dance on Marine Drive", at: "board", type: "tap", n: 16, secs: 6, verb: "Dance 💃", pay: 200, done: "Nailed every beat." },
    { t: "Pick an outfit for the brand shoot at FXN", at: "fxn", type: "pick", rounds: [{ q: "The brand wants \"Kerala festive\"", o: ["Kasavu set", "Gym wear", "Raincoat", "Pyjamas"], a: 0 }], pay: 240, done: "Brand approved the look." },
    { t: "Film a café review", at: "cafe", type: "hold", verb: "Record", zone: [0.55, 0.8], pay: 200, done: "Perfect take. The café wants to sponsor you." }
  ],
  startup: [
    { t: "Pitch to an investor at the bank", at: "bank", type: "pick", rounds: [{ q: "Investor: \"Why will you win?\"", o: ["We already have 200 paying users and grow 20% a month", "Trust me", "Our logo is nice", "My uncle likes it"], a: 0 }, { q: "\"What will you do with the money?\"", o: ["Hire two engineers and double sales", "Buy a car", "A big launch party", "Not sure yet"], a: 0 }], pay: 300, done: "They asked for a second meeting!" },
    { t: "Build the next feature", at: "office", type: "seq", steps: ["Talk to users", "Sketch it", "Build it", "Test it", "Launch"], pay: 260, done: "Users love it." },
    { t: "Interview a candidate", at: "office", type: "pick", rounds: [{ q: "Best sign of a great hire?", o: ["Shows real work and learns fast", "Fancy college only", "Agrees with everything", "Wants the biggest title"], a: 0 }], pay: 200, done: "You found a gem." },
    { t: "Answer support tickets", at: "m", type: "tap", n: 15, secs: 6, verb: "Reply", pay: 180, done: "Inbox zero." },
    { t: "Meet a customer at their office", at: "door", type: "go", pay: 220, done: "They signed for a year!" }
  ],
  craft: [
    { t: "Weave a kasavu border", at: "m", type: "tap", n: 18, secs: 7, verb: "Weave 🧵", pay: 240, done: "The gold border is straight and neat." },
    { t: "Dye the threads", at: "m", type: "seq", steps: ["Wash the yarn", "Boil the dye", "Dip the yarn", "Rinse", "Dry in the sun"], pay: 200, done: "Lovely even colour." },
    { t: "Buy cotton yarn from the supplier", at: "door", type: "go", pay: 120, done: "Good yarn at a fair price." },
    { t: "Sell at the Riverside Mall pop-up", at: "mall", type: "pick", rounds: [{ q: "A customer asks why it costs more than machine-made", o: ["It's handwoven, takes three days, and lasts years", "Because I said so", "It doesn't", "Ask the mall"], a: 0 }], pay: 260, done: "Sold out by evening!" },
    { t: "Pack the online orders", at: "m", type: "hold", verb: "Seal", zone: [0.6, 0.85], pay: 160, done: "Packed beautifully." }
  ],
  film: [
    { t: "Shoot a scene at the Town Hall", at: "hall", type: "seq", steps: ["Makeup", "Costume", "Rehearse", "Action!", "Cut, okay!"], pay: 320, done: "One take! The director clapped." },
    { t: "Rehearse your lines", at: "m", type: "pick", rounds: [{ q: "The scene: your character hears their mother is back home", o: ["Joy, with tears", "Bored", "Angry", "Sleepy"], a: 0 }, { q: "The scene: the villain insults your friend", o: ["Quiet, controlled anger", "Giggles", "Yawning", "Dancing"], a: 0 }], pay: 220, done: "Award-level performance." },
    { t: "Dub your voice in the studio", at: "m", type: "hold", verb: "Speak", zone: [0.58, 0.8], pay: 240, done: "Lip sync is perfect." },
    { t: "Take selfies with fans", at: "f", type: "tap", n: 14, secs: 6, verb: "Smile 📸", pay: 160, done: "The fans are thrilled." },
    { t: "Pick a look for the audio launch at FXN", at: "fxn", type: "pick", rounds: [{ q: "Audio launch, evening, stage lights", o: ["A sharp kurta or a statement suit", "Lungi and slippers", "Raincoat", "Gym vest"], a: 0 }], pay: 200, done: "Trending look of the night." }
  ],
  cricket: [
    { t: "Batting practice in the nets", at: "m", type: "tap", n: 18, secs: 7, verb: "Hit 🏏", pay: 220, done: "Middle of the bat every time." },
    { t: "Catching drill", at: "f", type: "hold", verb: "Catch", zone: [0.65, 0.82], pay: 200, done: "Safe hands!" },
    { t: "Team meeting", at: "m", type: "pick", rounds: [{ q: "Pitch is dry and spinning. Toss won. You…", o: ["Bat first", "Bowl first", "Skip the match", "Ask the umpire"], a: 0 }, { q: "Last over, 6 to win, a quick single is on", o: ["Take it, keep strike rotating", "Stand still", "Leave the field", "Argue"], a: 0 }], pay: 180, done: "Coach liked your thinking." },
    { t: "Fitness session", at: "f", type: "tap", n: 20, secs: 8, verb: "Sprint", pay: 160, done: "Fitter than ever." },
    { t: "Sign bats for a charity", at: "hall", type: "seq", steps: ["Wipe the bat", "Sign", "Add the date", "Pose for a photo", "Hand it over"], pay: 200, done: "Raised money for the kids' academy." }
  ],
  reality: [
    { t: "Today's house task", at: "m", type: "tap", n: 18, secs: 7, verb: "Build", pay: 240, done: "Your team won the task!" },
    { t: "Confession room", at: "m", type: "pick", rounds: [{ q: "\"Who's the most fake contestant?\"", o: ["Say it kindly, with a reason", "Shout", "Cry for 10 minutes", "Say nothing ever"], a: 0 }], pay: 200, done: "The audience liked your honesty." },
    { t: "Rehearse the weekend dance", at: "hall", type: "seq", steps: ["Warm up", "Learn the steps", "Practise with partner", "Full run", "Costume check"], pay: 240, done: "Standing ovation in rehearsal." },
    { t: "Meet fans at the mall", at: "mall", type: "tap", n: 14, secs: 6, verb: "Wave 👋", pay: 180, done: "Huge crowd today!" },
    { t: "Pick your elimination-night look at FXN", at: "fxn", type: "pick", rounds: [{ q: "Elimination night: you want to look confident", o: ["A bold party look", "Old T-shirt", "Pyjamas", "Raincoat"], a: 0 }], pay: 200, done: "You looked like a winner." }
  ],
  trader: [
    { t: "Morning routine before the market opens", at: "m", type: "seq", steps: ["Read the news", "Check the global markets", "Mark key levels", "Set stop-losses", "Wait for the open"], pay: 220, done: "Ready, calm, and prepared." },
    { t: "Stick to your trading rules", at: "m", type: "pick", rounds: [{ q: "A stock drops 8% on bad news. Your rule says…", o: ["Respect the stop-loss", "Average down and pray", "Borrow money to buy more", "Close your eyes"], a: 0 }, { q: "A WhatsApp tip promises 10x returns", o: ["Ignore it", "Put all savings in", "Forward to everyone", "Take a loan"], a: 0 }], pay: 240, done: "Discipline is the real edge." },
    { t: "Time your entry", at: "m", type: "hold", verb: "Enter", zone: [0.6, 0.78], pay: 260, done: "Clean entry at your level." },
    { t: "Deposit profits at the bank", at: "bank", type: "go", pay: 150, done: "Profits safe. Not touching them." },
    { t: "Teach a friend about risk at Café Monsoon", at: "cafe", type: "pick", rounds: [{ q: "\"How much should I risk on one trade?\"", o: ["A small part of your capital", "Everything", "Your parents' savings", "Whatever feels lucky"], a: 0 }], pay: 160, done: "Your friend thanks you." }
  ],
  nurse: [
    { t: "Ward rounds at City Hospital", at: "hospital", type: "seq", steps: ["Wash hands", "Check BP", "Check temperature", "Write the chart", "Update the doctor"], pay: 260, done: "Every patient checked and charted." },
    { t: "Answer the call bells", at: "hospital", type: "pick", rounds: [{ q: "Bed 4: the drip bag is nearly empty", o: ["Change it as per the chart", "Ignore it", "Unplug it", "Call security"], a: 0 }, { q: "Bed 7 feels cold and anxious", o: ["Bring a blanket and talk to them", "Turn up the AC", "Leave", "Tell them to sleep"], a: 0 }], pay: 220, done: "The ward is calm." },
    { t: "Sanitise the station", at: "hospital", type: "tap", n: 15, secs: 6, verb: "Wipe", pay: 160, done: "Germ-free zone." },
    { t: "Hand over to the next shift", at: "hospital", type: "pick", rounds: [{ q: "What goes in a good handover?", o: ["Each patient's status, medicines given, and what to watch", "Just say 'all fine'", "Nothing, go home", "Gossip"], a: 0 }], pay: 180, done: "Smooth handover." },
    { t: "Visit a patient at home", at: "door", type: "go", pay: 200, done: "Uncle is recovering well." }
  ],
  cab: [
    { t: "Pick up a passenger", at: "door", type: "go", pay: 180, done: "\"Station, please!\"" },
    { t: "Drop them at Ernakulam Junction", at: "station", type: "go", pay: 220, done: "On time for the train. Good tip!" },
    { t: "Choose the best route", at: "m", type: "pick", rounds: [{ q: "Vyttila is jammed at 6 pm. To reach Kaloor…", o: ["Take the Banerji Road side", "Wait in the jam", "Turn back home", "Honk until it clears"], a: 0 }, { q: "Passenger asks for the meter", o: ["Switch it on, of course", "Quote double", "Pretend it's broken", "Argue"], a: 0 }], pay: 200, done: "Five stars for the honest driver." },
    { t: "Fill up the CNG", at: "garage", type: "hold", verb: "Fill", zone: [0.7, 0.88], pay: 120, done: "Tank full." },
    { t: "Wash the auto", at: "m", type: "tap", n: 16, secs: 6, verb: "Wash", pay: 140, done: "Shining like new." }
  ],
  teacher: [
    { t: "Take the maths tuition class", at: "m", type: "pick", rounds: [{ q: "12 × 8 = ?", o: ["86", "96", "108", "92"], a: 1 }, { q: "25% of 360 = ?", o: ["80", "90", "72", "100"], a: 1 }, { q: "Next prime after 29?", o: ["31", "33", "35", "30"], a: 0 }], pay: 220, done: "The class finally gets percentages!" },
    { t: "Correct the homework", at: "m", type: "tap", n: 15, secs: 6, verb: "✔ Mark", pay: 160, done: "All corrected, with smiley stickers." },
    { t: "Prepare tomorrow's notes", at: "m", type: "seq", steps: ["Pick the topic", "Write examples", "Add practice questions", "Make the answer key", "Print copies"], pay: 180, done: "Notes ready." },
    { t: "Parent meeting", at: "cafe", type: "pick", rounds: [{ q: "A parent is upset about low marks", o: ["Show the progress and a plan to improve", "Blame the child", "Blame the parent", "Leave"], a: 0 }], pay: 200, done: "The parent left smiling." },
    { t: "Home tuition visit", at: "door", type: "go", pay: 220, done: "One-on-one class done." }
  ],
  kitchen: [
    { t: "Cook a batch of Malabar biryani", at: "m", type: "seq", steps: ["Wash the rice", "Fry onions", "Cook the masala", "Layer rice and masala", "Seal and dum"], pay: 280, done: "The whole street smells amazing." },
    { t: "Pack the lunch orders", at: "m", type: "tap", n: 18, secs: 7, verb: "Pack 🥡", pay: 220, done: "Every order packed on time." },
    { t: "Check the orders", at: "m", type: "pick", rounds: [{ q: "Order says \"no onion, extra raita\"", o: ["Pack it exactly like that", "Add onion anyway", "Skip the raita", "Cancel it"], a: 0 }, { q: "A customer is allergic to nuts", o: ["Cook separately, label it", "Pick the nuts out", "Ignore it", "Charge extra"], a: 0 }], pay: 200, done: "Zero complaints today." },
    { t: "Buy fresh chicken from the market", at: "door", type: "go", pay: 120, done: "Fresh stock in." },
    { t: "Pressure-cook the beef ularthiyathu", at: "m", type: "hold", verb: "Cook", zone: [0.62, 0.8], pay: 220, done: "Three whistles. Perfect." }
  ],
  homestay: [
    { t: "Welcome guests at the Fort Kochi jetty", at: "ferryFK", type: "go", pay: 200, done: "\"Welcome to Kochi!\"" },
    { t: "Make a Kerala breakfast", at: "m", type: "seq", steps: ["Ferment the batter", "Make appam", "Cook the stew", "Brew coffee", "Serve with a smile"], pay: 220, done: "Guests asked for the recipe." },
    { t: "Clean the guest room", at: "m", type: "tap", n: 16, secs: 6, verb: "Clean", pay: 160, done: "Fresh towels, fresh flowers." },
    { t: "Guide a Fort Kochi walking tour", at: "f", type: "pick", rounds: [{ q: "Guest: \"Who was first buried at St. Francis Church?\"", o: ["Vasco da Gama", "Marco Polo", "Columbus", "Magellan"], a: 0 }, { q: "\"What are those big nets on the shore?\"", o: ["Chinese fishing nets", "Volleyball nets", "Bird traps", "Sun shades"], a: 0 }], pay: 240, done: "Five-star review incoming." },
    { t: "Reply to an online review", at: "m", type: "pick", rounds: [{ q: "\"The Wi-Fi was slow\"", o: ["Thank them, say it's being upgraded", "Call them a liar", "Ignore", "Delete the listing"], a: 0 }], pay: 140, done: "Good host energy." }
  ],
  stylist: [
    { t: "Client consultation", at: "m", type: "pick", rounds: [{ q: "Client: \"Church wedding, afternoon\"", o: ["Pastel gown or a light silk saree", "Gym wear", "Black hoodie", "Pyjamas"], a: 0 }, { q: "Client: \"Office presentation\"", o: ["Sharp blazer or formal kurta", "Party sequins", "Shorts", "Raincoat"], a: 0 }], pay: 240, done: "The client trusts you completely." },
    { t: "Pick the outfits at the FXN store", at: "fxn", type: "go", pay: 200, done: "Rented the perfect pieces on FXN." },
    { t: "Style the client", at: "m", type: "seq", steps: ["Outfit", "Accessories", "Hair", "Makeup check", "Final photo"], pay: 260, done: "Stunning!" },
    { t: "Steam the outfits", at: "m", type: "hold", verb: "Steam", zone: [0.6, 0.82], pay: 160, done: "No creases." },
    { t: "Photo shoot at Subhash Park", at: "f", type: "tap", n: 15, secs: 6, verb: "Click 📸", pay: 200, done: "Portfolio-worthy." }
  ],
  band: [
    { t: "Band rehearsal", at: "m", type: "tap", n: 20, secs: 8, verb: "Strum 🎸", pay: 200, done: "Tight and in time." },
    { t: "Soundcheck at the Town Hall", at: "hall", type: "hold", verb: "Tune", zone: [0.62, 0.78], pay: 180, done: "Sounds great." },
    { t: "Write a new verse", at: "f", type: "pick", rounds: [{ q: "Pick the line that rhymes with \"mazha\" (rain)", o: ["\"…oru puzha\" (a river)", "\"…oru kaattu\" (a breeze)", "\"…oru veedu\" (a house)", "\"…oru vandi\" (a car)"], a: 0 }], pay: 160, done: "That's going on the album." },
    { t: "Play the evening gig", at: "hall", type: "seq", steps: ["Line check", "Open with a fast one", "Slow song", "Crowd sing-along", "Encore"], pay: 300, done: "The crowd wants more!" },
    { t: "Busk on Marine Drive", at: "board", type: "tap", n: 15, secs: 6, verb: "Sing 🎤", pay: 140, done: "Coins and smiles." }
  ],
  planner: [
    { t: "Check the venue at the Town Hall", at: "hall", type: "go", pay: 180, done: "Hall booked, stage size noted." },
    { t: "Set up the decor", at: "hall", type: "seq", steps: ["Stage frame", "Flowers", "Lights", "Seating", "Welcome board"], pay: 260, done: "Looks like a dream." },
    { t: "Call the vendors", at: "m", type: "pick", rounds: [{ q: "The caterer is late", o: ["Call the backup and give a clear deadline", "Panic", "Cancel the wedding", "Cook yourself"], a: 0 }, { q: "It's going to rain", o: ["Book the covered area and extra umbrellas", "Hope for the best", "Move to the beach", "Ignore"], a: 0 }], pay: 220, done: "Crisis handled." },
    { t: "Get the bride's outfit from FXN", at: "fxn", type: "go", pay: 220, done: "Picked up in 30 minutes, perfect fit." },
    { t: "Balance the budget", at: "bank", type: "pick", rounds: [{ q: "₹50,000 over budget. Cut…", o: ["Fewer imported flowers", "The food", "The photographer", "The bride"], a: 0 }], pay: 200, done: "Under budget!" }
  ],
  seafood: [
    { t: "Go to the harbour for the catch", at: "door", type: "go", pay: 150, done: "Fresh karimeen and prawns." },
    { t: "Sort the fish", at: "m", type: "tap", n: 18, secs: 7, verb: "Sort 🐟", pay: 220, done: "Grade A, all of it." },
    { t: "Pack with ice for export", at: "m", type: "hold", verb: "Ice", zone: [0.6, 0.82], pay: 220, done: "Cold chain intact." },
    { t: "Export papers at the Government Office", at: "office", type: "seq", steps: ["Health certificate", "Invoice", "Packing list", "Customs form", "Submit"], pay: 260, done: "Container cleared!" },
    { t: "Buyer call", at: "m", type: "pick", rounds: [{ q: "Buyer wants a bigger discount", o: ["Offer a small discount for a bigger order", "Double the price", "Hang up", "Give it free"], a: 0 }], pay: 200, done: "Deal closed." }
  ],
  gulf: [
    { t: "Open an NRI account at the bank", at: "bank", type: "seq", steps: ["Passport copy", "Visa copy", "Address proof", "Photo", "Sign"], pay: 180, done: "Account active." },
    { t: "Family dinner decisions", at: "house", type: "pick", rounds: [{ q: "Relatives ask for a loan for a new car", o: ["Help with what you can afford, kindly", "Give everything", "Shout", "Move back to Dubai"], a: 0 }], pay: 140, done: "Peace at home." },
    { t: "Plan your Kochi business", at: "cafe", type: "pick", rounds: [{ q: "Best first step?", o: ["Start small and test demand", "Spend all savings on day one", "Copy a neighbour", "Wait for a sign"], a: 0 }], pay: 220, done: "Smart plan." },
    { t: "Help a neighbour with visa papers", at: "office", type: "seq", steps: ["Fill the form", "Attach photos", "Attest documents", "Pay the fee", "Book the slot"], pay: 200, done: "The neighbour is grateful." },
    { t: "Evening walk on Marine Drive", at: "board", type: "tap", n: 14, secs: 6, verb: "Walk", pay: 100, done: "Missed this breeze in the desert." }
  ]
};
