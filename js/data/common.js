// Events that can happen in any life, character dialogue pools, chat topics and badges.
window.AE_COMMON = {
  ev: [
    { id: "cm_loanapp", w: 2, t: "An instant-loan app pings you: '₹10,000 in 5 minutes. No documents.'",
      c: [
        { l: "Ignore it", e: { s: 1 }, r: "Good call. Many such apps charge huge interest and harass borrowers." },
        { l: "Take the ₹10,000", e: { C: 10000, set: "appdebt" }, r: "Money arrives instantly. So does the fine print." }
      ] },
    { id: "cm_appdebt", req: "appdebt", min: 2, w: 9, t: "The loan app wants ₹14,000 back within a week, and threatens to message your contacts.",
      c: [ { l: "Pay it back", e: { C: -14000, h: -8, unset: "appdebt" }, r: "₹4,000 for borrowing ₹10,000 for a month. Never again." } ] },
    { id: "cm_phone", w: 2, t: "Your phone slips and the screen shatters.",
      c: [
        { l: "Repair it properly (₹2,500)", e: { c: -2500 }, r: "Good as new. Your wallet isn't." },
        { l: "Live with the cracks", e: { h: -3 }, r: "Every swipe is a small adventure." }
      ] },
    { id: "cm_wedding", w: 2, who: "f", t: "{f}'s sister is getting married out of town. You're invited.",
      c: [
        { l: "Go for all three days", e: { h: 9, c: -2000, rel: { f: 10 } }, r: "Dancing, biryani and terrible uncle jokes. Perfect." },
        { l: "Send a gift and your wishes", e: { c: -800, rel: { f: 2 } }, r: "Polite. {f} understands, a bit sad." }
      ] },
    { id: "cm_health", w: 2, who: "p", t: "{p} needs a medical test that costs ₹6,000.",
      c: [
        { l: "Pay for it immediately", e: { c: -6000, rel: { p: 15 }, h: 2 }, r: "Everything's fine. You're glad you didn't wait." },
        { l: "Share the cost with a sibling", e: { c: -3000, rel: { p: 8 } }, r: "Family teamwork." }
      ] },
    { id: "cm_bet", w: 2, t: "An ad promises you can 'double your money daily' with a betting app.",
      c: [
        { l: "Scroll past", e: { s: 1 }, r: "Real-money betting apps are banned in India for a reason." },
        { l: "Try it with ₹500", e: { c: -500, h: -3 }, r: "Gone in four minutes. The house always wins." }
      ] },
    { id: "cm_sleep", w: 2, t: "You've slept five hours a night for two weeks.",
      c: [
        { l: "Fix your sleep this week", e: { h: 8, s: -1 }, r: "Everything feels easier after real sleep." },
        { l: "Push through, coffee helps", e: { h: -6, s: 2 }, r: "Productive. Fragile." }
      ] },
    { id: "cm_rd", w: 2, who: "f", t: "{f} suggests saving ₹2,000 a month in a recurring deposit as an emergency fund.",
      c: [
        { l: "Start one", e: { c: -2000, h: 3, set: "emergencyfund" }, r: "Future you says thanks." },
        { l: "Not now", e: {}, r: "Maybe next month." }
      ] }
  ],

  // Reactions after a choice, by role and mood
  pool: {
    m: {
      warm: ["Good. You're learning faster than I did, {buddy}.", "I've seen many come and go. You might stay.", "Keep this up and people will start asking you for advice."],
      neutral: ["Hmm. We'll see.", "Every choice has a cost. Remember that.", "Don't celebrate yet. Do it again next week."],
      cold: ["You're not listening to anyone, are you?", "Don't come to me when this goes wrong.", "I expected better, {name}."]
    },
    v: {
      warm: ["Okay, I'll admit it. That was smart.", "Maybe there's room for both of us here.", "Truce? For now."],
      neutral: ["Interesting move. Let's see how long it lasts.", "Don't get comfortable.", "I'm watching, {name}."],
      cold: ["You'll regret that.", "Enjoy it while it lasts.", "This town isn't big enough for both of us."]
    },
    f: {
      warm: ["I'm so proud of you, {buddy}!", "This is why I believe in you.", "We're doing this together, okay?"],
      neutral: ["Hope you know what you're doing.", "Okay... your call.", "Tell me if you need help."],
      cold: ["You've changed, {name}.", "Call me when you have time for friends again.", "Whatever. Do what you want."]
    },
    p: {
      warm: ["Eat properly, okay? I'm proud of you.", "Your father would be so happy to see this.", "Come home soon. I'll make your favourite."],
      neutral: ["Just be careful, that's all I'm saying.", "Have you eaten?", "Everyone in the family is asking about you."],
      cold: ["When will you get serious about life?", "Don't hide things from me.", "I'm worried about you, {name}."]
    }
  },

  // Tap-to-ask chat. Answers depend on mood (warm / neutral / cold); {tip} comes from the life.
  talk: [
    { q: "How are things with you?", a: {
      m: { warm: "Busy, but good. Seeing you grow makes the day better.", neutral: "Same as always. Work doesn't wait.", cold: "Fine. Did you need something?" },
      v: { warm: "Honestly? Competing with you makes me better.", neutral: "Great. Better than you, probably.", cold: "Why do you care?" },
      f: { warm: "Better now that you asked! Let's get chai soon.", neutral: "Surviving, {buddy}. You?", cold: "Oh, now you have time for me?" },
      p: { warm: "All good here. The neighbours keep asking about you!", neutral: "We're fine. Are you eating on time?", cold: "We'd know more if you called." } } },
    { q: "Any advice for me?", a: {
      m: { warm: "{tip}", neutral: "{tip} Think about it.", cold: "Earn my advice first." },
      v: { warm: "Fine, one tip: {tip}", neutral: "Why would I help my competition?", cold: "Advice? Quit." },
      f: { warm: "Don't forget why you started. And sleep, please.", neutral: "Take it one week at a time.", cold: "You don't listen anyway." },
      p: { warm: "Be honest and work hard. The rest follows.", neutral: "Save a little every month. Always.", cold: "Listen to your elders for once." } } },
    { q: "What's {city} really like?", a: {
      m: { warm: "{local}", neutral: "{local}", cold: "Figure it out yourself." },
      v: { warm: "{local}", neutral: "Big enough for winners. Not for everyone.", cold: "Too small for both of us." },
      f: { warm: "{local}", neutral: "{local}", cold: "Ask someone else." },
      p: { warm: "{local}", neutral: "Just stay safe there.", cold: "Too far from home, that's what." } } },
    { q: "What do you think of me?", a: {
      m: { warm: "You remind me of myself at your age. That's a compliment.", neutral: "You have potential. Potential isn't results.", cold: "Honestly? You're wasting your chances." },
      v: { warm: "You're the only one here I actually respect.", neutral: "You're competition. Nothing more.", cold: "You're in my way." },
      f: { warm: "You're my favourite person in {city}. Don't tell anyone.", neutral: "You're okay. Mostly.", cold: "I'm not sure anymore." },
      p: { warm: "You're my pride, {name}.", neutral: "You're my child. I'll always worry.", cold: "I just want the old you back." } } }
  ],

  tips: {
    street: "Regulars are everything. A new customer tries you once; a regular comes 300 times a year.",
    job: "Write down your wins every month. At appraisal time, nobody remembers them but you.",
    govt: "Previous years' papers tell you what the exam actually cares about.",
    creator: "Post consistently for 90 days before you judge anything.",
    startup: "Talk to customers before you write a single line of code.",
    craft: "Tell the story of the hands that made it. That's what people pay for.",
    film: "Real producers never ask actors for money. Never.",
    cricket: "Fitness keeps you in the team when form doesn't.",
    reality: "The audience can smell fake from a mile away.",
    trader: "If someone promises guaranteed returns, they're selling you something."
  },

  local: {
    KL: ["Kochi rewards patience. Nothing happens fast here, but when it does, everyone knows.", "Rain for half the year and people still show up. That's Kerala.", "Half the town has a relative in the Gulf. Everyone has an opinion on your future."],
    MH: ["Mumbai never sleeps, and neither will you if you want to make it here.", "The local train will teach you more about people than any book.", "Rent is brutal, but opportunity is everywhere."],
    PB: ["Ludhiana works hard and eats harder.", "Punjab gives everyone a big welcome and bigger portions.", "Everyone here is either in business or planning one."],
    WB: ["Kolkata runs on adda, cha and strong opinions.", "Durga Puja is when the whole city becomes one big family.", "People here respect ideas, books and a good argument."],
    RJ: ["Jaipur's tourists keep half the city going.", "Summers here test everyone. Plan your days around the heat.", "Every craft here has hundreds of years behind it."],
    KA: ["Bengaluru: great weather, terrible traffic, endless startups.", "Filter coffee is a love language here.", "Half the city is from somewhere else, so everyone's welcome."]
  },

  badges: [
    { id: "first", t: "First Life", d: "Finish any life" },
    { id: "five", t: "Five Lives", d: "Finish five different lives" },
    { id: "all10", t: "Lived Them All", d: "Finish all ten lives" },
    { id: "explorer", t: "State Hopper", d: "Finish a life in all six playable states" },
    { id: "kerala", t: "God's Own Player", d: "Finish a life in Kerala" },
    { id: "honest", t: "Clean Hands", d: "Finish a life without one shady choice" },
    { id: "lakh", t: "Lakhpati (in game)", d: "End a life with ₹1 lakh or more" },
    { id: "comeback", t: "Comeback", d: "Go below ₹1,000 and still finish above ₹10,000" },
    { id: "friends", t: "People Person", d: "End a life with every character on your side" },
    { id: "endings", t: "Ending Hunter", d: "Discover 12 different endings" },
    { id: "daily", t: "Daily Commuter", d: "Finish a daily challenge" },
    { id: "walked", t: "Walked Away", d: "Quit options trading in The Trader" },
    { id: "rainy", t: "Rainy Day Fund", d: "Start an emergency fund in any life" }
  ]
};
