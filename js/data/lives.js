// Ten lives. Each life runs 6 chapters x 3 decisions on the shared engine.
// settle(g, k) returns lines [label, amount, kind]; money lines are added to cash by the engine.
// k = { st: state pack, ci: cost index, m: n => scaled rupees, R: () => random 0..1 }
// Effects: c scaled cash, C raw cash, r rep, h happiness, s skill, x life metric, rel {m,v,f,p}, set/unset flags.

(function () {
  const has = (g, f) => g.flags.indexOf(f) >= 0;

  window.AE_LIVES = [
    // 1 ─────────────────────────────────────────────
    {
      id: "street", title: "Street Food Hustle", unit: "Week", tag: "Start a {stall} with ₹{start}",
      blurb: "Sell {food} on the busiest corner in {city}. Price it, cook it, fight for regulars.",
      cash0: 3000, s0: 15, x0: 10, sl: "Cooking", xl: "Regulars",
      roles: { m: "has run the oldest stall on the street for 20 years", v: "opened a stall right across from yours", f: "college friend and your first customer", p: "worried, but keeps sending food parcels" },
      settle(g, k) {
        let base = k.st.food.base * (has(g, "helper") ? 1.25 : 1) * (has(g, "expand") ? 1.7 : 1);
        const daily = Math.round(base * (0.6 + g.r / 100) * (0.8 + g.x / 120));
        const cust = daily * 7;
        const lines = [["Customers this week", cust, "n"], ["Sales", cust * k.st.food.price], ["Ingredients and gas", -cust * (k.st.food.price - k.st.food.margin)], ["Spot rent", -k.m(700)]];
        if (has(g, "helper")) lines.push(["Helper's wages", -k.m(1800)]);
        if (has(g, "expand")) lines.push(["Second stall rent", -k.m(1500)]);
        g.x = Math.min(100, g.x + 2);
        return lines;
      },
      ev: [
        { id: "st_price", w: 3, t: "Milk, oil and onion prices jump 15% this week. Your margin is shrinking.",
          c: [
            { l: "Raise prices by ₹5", e: { c: 700, r: -4, x: -3 }, r: "Some regulars grumble. Most stay." },
            { l: "Absorb it this month", e: { c: -600, r: 4, x: 3 }, r: "Customers notice you didn't raise prices. Loyalty grows." },
            { l: "Make portions smaller, same price", e: { c: 300, r: -7 }, r: "People notice. They always notice." }
          ] },
        { id: "st_rival", w: 3, who: "v", t: "{v} cuts his prices to half of yours to steal your customers.",
          c: [
            { l: "Match his price", e: { c: -900, x: 2, rel: { v: -10 } }, r: "A price war. Both of you bleed." },
            { l: "Compete on taste and service", e: { s: 5, r: 4 }, r: "Your regulars stay. His half-price crowd doesn't." },
            { l: "Talk to him over chai", e: { r: 2, rel: { v: 14 } }, r: "You agree to sell different specials. Rival turned neighbour." }
          ] },
        { id: "st_inspect", w: 3, t: "A food-safety inspector stops at your stall and asks for your food registration.",
          c: [
            { l: "Get the basic registration done properly", e: { c: -500, r: 5, set: "licensed" }, r: "One office visit and a small fee. Now you're legit." },
            { l: "Offer him ₹500 'chai-paani'", shady: true, e: { c: -500, set: "bribed" }, r: "He pockets it and leaves. You feel uneasy." },
            { l: "Argue that small stalls don't need it", e: { c: -1500, r: -5 }, r: "You get fined. Arguing rarely works." }
          ] },
        { id: "st_bribe_bad", min: 3, req: "bribed", w: 9, t: "The inspector you paid was suspended for taking bribes. Your stall is on his list.",
          c: [
            { l: "Pay the fine and register properly", e: { c: -2500, r: -8, unset: "bribed", set: "licensed" }, r: "Expensive lesson. Paying a bribe is a crime too." }
          ] },
        { id: "st_vlog", w: 3, who: "f", t: "A food vlogger with a big following wants to film at your stall. {f} is losing it.",
          c: [
            { l: "Serve your best plate and tell your story", e: { c: -150, x: 10, r: 6 }, r: "The reel does numbers. New faces show up all week." },
            { l: "Ask them to tag your stall's page", e: { x: 6 }, r: "A few hundred new followers. Nice." },
            { l: "Say no to filming", e: { x: -2 }, r: "Quiet week. Maybe too quiet." }
          ] },
        { id: "st_helper", w: 2, t: "You're doing everything alone and you're exhausted. Hire a helper?",
          c: [
            { l: "Hire a helper", e: { h: 8, s: 2, set: "helper" }, r: "Faster service, more customers, and you can finally sit for five minutes." },
            { l: "Stay solo for now", e: { h: -6, s: 3 }, r: "You learn every job at the stall. Your back is not happy." }
          ] },
        { id: "st_mentor", w: 2, who: "m", t: "{m} offers to teach you his secret masala if you help at his stall every morning for a week.",
          c: [
            { l: "Accept and learn", e: { s: 10, h: -5, rel: { m: 15 } }, r: "4 am starts. The masala is worth it." },
            { l: "Politely decline", e: { rel: { m: -5 } }, r: "He shrugs. 'Young people.'" }
          ] },
        { id: "st_expand", min: 4, w: 4, t: "A spot near the bus stand opens up. A second stall needs a ₹12,000 deposit.",
          c: [
            { l: "Take the second spot", need: 12000, e: { c: -12000, x: 8, set: "expand" }, r: "Two stalls. Double the work, double the reach." },
            { l: "Not yet. Strengthen the first.", e: { s: 3, r: 2 }, r: "Patience. The first stall gets even better." }
          ] }
      ],
      end: [
        { id: "legend", t: "Talk of the Town", d: "Your {stall} is the one people send visitors to. Steady money, loyal regulars, and a name in {city}.", c: (g, k) => g.cash >= k.m(25000) && g.r >= 65 },
        { id: "twostalls", t: "Two Stalls and Counting", d: "You took the risk and expanded. Next stop: a small chain.", c: (g, k) => has(g, "expand") && g.cash >= k.m(8000) },
        { id: "honest", t: "The Honest Hustle", d: "Not rich yet, but people trust your food and your word.", c: g => g.r >= 55 },
        { id: "lessons", t: "Lessons From the Street", d: "The stall didn't take off this time. You learned more about money in six weeks than in three years of college." }
      ]
    },

    // 2 ─────────────────────────────────────────────
    {
      id: "job", title: "The 9–5", unit: "Month", tag: "First private job in {city}",
      blurb: "Join a mid-size IT services firm in {city}. Deadlines, appraisals, office politics and rent day.",
      cash0: 8000, s0: 25, x0: 30, sl: "Work skills", xl: "Performance",
      roles: { m: "your team lead", v: "a colleague up for the same promotion", f: "your flatmate", p: "calls every Sunday about 'settling down'" },
      settle(g, k) {
        const promo = (has(g, "promo") ? 1 : 0) + (has(g, "hike30") ? 1.6 : 0);
        const lines = [["Salary", k.m(24000 * (1 + 0.18 * promo))], ["Rent, food and travel", -k.m(13000)]];
        if (has(g, "sendhome")) lines.push(["Sent home", -k.m(3000)]);
        if (!has(g, "balance")) g.h = Math.max(0, g.h - 3);
        return lines;
      },
      ev: [
        { id: "jb_overtime", w: 3, who: "m", t: "{m} needs you to stay late every night this week for a client launch.",
          c: [
            { l: "Stay late all week", e: { x: 8, h: -8, rel: { m: 8 } }, r: "The launch works. {m} notices." },
            { l: "Agree, but ask for a day off after", e: { x: 4, s: 2, rel: { m: 3 } }, r: "Fair deal. Everyone wins a little." },
            { l: "Say you can't", e: { x: -5, h: 4, rel: { m: -6 } }, r: "You protect your evenings. Your rating takes a hit." }
          ] },
        { id: "jb_credit", w: 3, who: "v", t: "In the client meeting, {v} presents your analysis as his own work.",
          c: [
            { l: "Calmly add details only the author would know", e: { x: 7, r: 4, rel: { v: -8 } }, r: "Everyone in the room understood. Smooth." },
            { l: "Let it go", e: { h: -6 }, r: "It eats at you for days." },
            { l: "Complain to HR", e: { x: 2, r: -2, rel: { v: -12 } }, r: "Process starts. Office gets awkward." }
          ] },
        { id: "jb_course", w: 3, t: "A ₹6,000 cloud certification could help your next appraisal.",
          c: [
            { l: "Pay and study on weekends", need: 6000, e: { c: -6000, s: 12, h: -4 }, r: "Six weekends later, you're certified." },
            { l: "Learn free from YouTube and docs", e: { s: 6, h: -2 }, r: "Slower, but it sticks." },
            { l: "Skip it, you're tired", e: { h: 3 }, r: "Rest is important too. Right?" }
          ] },
        { id: "jb_home", w: 2, who: "p", t: "{p} asks if you can send ₹3,000 home every month for household expenses.",
          c: [
            { l: "Yes, every month", e: { h: 4, rel: { p: 15 }, set: "sendhome" }, r: "It feels good to give back." },
            { l: "Explain your budget honestly", e: { rel: { p: -3 }, h: -2 }, r: "{p} understands, mostly." }
          ] },
        { id: "jb_appraisal", at: 4, w: 9, who: "m", t: "Appraisal season. {m} reviews your year.",
          c: [
            { l: "Present your wins with numbers", ck: { k: "x", d: 50, ok: { e: { h: 10, r: 6, set: "promo" }, r: "Promoted, with an 18% raise." }, no: { e: { h: -8 }, r: "'Meets expectations.' A 4% raise." } } },
            { l: "Ask what you need to improve", e: { s: 5, rel: { m: 8 } }, r: "Honest feedback. You leave with a clear plan." }
          ] },
        { id: "jb_offer", min: 4, w: 3, t: "A rival firm offers you 30% more. Their reviews mention 14-hour days.",
          c: [
            { l: "Take the offer", e: { h: -6, set: "hike30" }, r: "More money, longer days. You switch." },
            { l: "Use it to negotiate where you are", ck: { k: "x", d: 55, ok: { e: { set: "promo", rel: { m: 4 } }, r: "They match part of it. You stay, happier." }, no: { e: { rel: { m: -6 } }, r: "They say no, and now they know you're looking." } } },
            { l: "Decline", e: { h: 3 }, r: "You like your team. That counts for something." }
          ] },
        { id: "jb_dread", w: 3, cond: g => g.h < 45, t: "Sunday-night dread. You can't remember the last time you did something just for fun.",
          c: [
            { l: "Take two days of leave", e: { h: 12, x: -3 }, r: "Sleep, a long walk, your phone off. You feel human." },
            { l: "Set firm work hours from now on", e: { h: 6, set: "balance" }, r: "Logging off at 7 pm. Nobody died." },
            { l: "Push through", e: { h: -8, x: 3 }, r: "You're running on chai and stubbornness." }
          ] }
      ],
      end: [
        { id: "promoted", t: "Promoted and Saving", d: "A promotion, savings in the bank and a reputation for good work.", c: (g, k) => has(g, "promo") && g.cash >= k.m(45000) },
        { id: "hopper", t: "The Job-Hopper", d: "You chased the bigger salary. Your bank balance is happy. Your sleep schedule isn't.", c: g => has(g, "hike30") },
        { id: "balance", t: "Work-Life Balance Champ", d: "Not the fastest climber, but you still have hobbies, friends and your health.", c: g => g.h >= 60 },
        { id: "figuring", t: "Still Figuring It Out", d: "Six months in. You know what you don't want, which is half the answer." }
      ]
    },

    // 3 ─────────────────────────────────────────────
    {
      id: "govt", title: "Government Job", unit: "Month", tag: "Crack the State Service Commission exam",
      blurb: "Prepare for the State Service Commission Assistant exam in {city}. Coaching, mock tests, family pressure and one big exam day.",
      cash0: 15000, s0: 20, x0: 25, sl: "Exam prep", xl: "Mock score",
      roles: { m: "a senior who cleared the exam last year", v: "the coaching-class topper", f: "your study partner", p: "dreams of a 'permanent job' for you" },
      settle(g, k) {
        if (has(g, "joined")) return [["Salary (illustrative)", 30000], ["Living costs", -k.m(9000)]];
        const lines = [["Your share of costs at home", -k.m(2500)]];
        if (has(g, "coaching")) lines.push(["Coaching fees", -k.m(3000)]);
        if (has(g, "tuition")) lines.push(["Tuition income", k.m(4500)]);
        g.s = Math.min(100, g.s + (has(g, "tuition") ? 2 : 4));
        return lines;
      },
      ev: [
        { id: "gv_coaching", w: 4, t: "Your first big choice: how do you prepare?",
          c: [
            { l: "Join coaching (₹3,000/month)", e: { s: 6, set: "coaching" }, r: "Structure, mock tests and a lot of photocopied notes." },
            { l: "Self-study at the public library", e: { s: 4, h: -2 }, r: "Free, quiet and lonely." },
            { l: "Group study with {f}", e: { s: 3, rel: { f: 8 }, h: 3 }, r: "You quiz each other over chai. It works." }
          ] },
        { id: "gv_tuition", w: 3, t: "A neighbour wants tuition for her kids. ₹4,500 a month, three evenings a week.",
          c: [
            { l: "Take it", e: { h: -2, set: "tuition" }, r: "Money in hand, less time for your own books." },
            { l: "Stay focused on prep", e: { s: 2 }, r: "Every hour counts." }
          ] },
        { id: "gv_leak", w: 3, t: "A WhatsApp group claims to sell the 'leaked' question paper for ₹10,000.",
          c: [
            { l: "Report the group to the commission's helpline", e: { r: 8, s: 1 }, r: "Two weeks later the news says a fake-paper racket was busted." },
            { l: "Ignore it and study", e: { s: 3 }, r: "There are no shortcuts. You knew that." },
            { l: "Pay for the paper", shady: true, need: 10000, e: { c: -10000, set: "leak" }, r: "You pay. The 'paper' is useless and the admin stops replying." }
          ] },
        { id: "gv_leak_bad", req: "leak", min: 3, w: 9, t: "Police arrest the fake-paper racket. Your number is in their group and you're called in to give a statement.",
          c: [ { l: "Tell the truth", e: { h: -12, r: -8, unset: "leak" }, r: "You're let off with a warning. The fear doesn't leave quickly." } ] },
        { id: "gv_exam", at: 3, w: 9, t: "Exam day. Two hours, 150 questions, one shot this year.",
          c: [ { l: "Stay calm and attempt", ck: { k: "s", d: 45, ok: { e: { h: 15, r: 10, set: "passed" }, r: "Results are out. You cleared it!" }, no: { e: { h: -12, set: "failed1" }, r: "Missed the cut-off by 4 marks." } } } ] },
        { id: "gv_retry", at: 5, req: "failed1", not: "passed", w: 9, t: "The supplementary exam. Second chance.",
          c: [ { l: "Give it everything", ck: { k: "s", d: 40, ok: { e: { h: 15, set: "passed" }, r: "Cleared on the second attempt!" }, no: { e: { h: -10, set: "failed2" }, r: "Not this time either." } } } ] },
        { id: "gv_join", at: 4, req: "passed", w: 9, who: "p", t: "Your posting order arrives: a block office 300 km from home.",
          c: [
            { l: "Accept and join", e: { set: "joined", rel: { p: 12 }, h: 4 }, r: "{p} distributes sweets to the whole street." },
            { l: "Request a home posting through the official form", e: { set: "joined", h: 2 }, r: "Request filed. You join where posted, for now." }
          ] },
        { id: "gv_file", min: 5, req: "joined", w: 6, t: "At your desk, an agent slides ₹2,000 across to 'speed up' a file.",
          c: [
            { l: "Refuse and follow the queue", e: { r: 10, set: "cleanhands" }, r: "Word spreads: this one can't be bought." },
            { l: "Take it", shady: true, e: { C: 2000, set: "bribetaken" }, r: "Easy money. Easy trouble." }
          ] },
        { id: "gv_pressure", w: 3, who: "p", t: "At a family function, a relative compares you with a cousin who 'already got a government job'.",
          c: [
            { l: "Smile and say your exam is coming", e: { h: -2 }, r: "Polite. Exhausting." },
            { l: "Talk about how hard the exam really is", e: { rel: { p: 4 } }, r: "A few elders actually listen." }
          ] },
        { id: "gv_mock", w: 3, t: "Mock test results: you're in the middle of the pack.",
          c: [
            { l: "Analyse every wrong answer", e: { s: 6, x: 8 }, r: "Patterns appear. Weak topics get fixed." },
            { l: "Compare yourself with {v}", e: { h: -6, rel: { v: -3 } }, r: "Comparison is a thief." },
            { l: "Take a day off", e: { h: 6 }, r: "Rest is part of preparation." }
          ] }
      ],
      end: [
        { id: "suspended", t: "Suspended", d: "A vigilance check found the bribe. The job you worked so hard for is gone, maybe for good.", c: g => has(g, "bribetaken") },
        { id: "sarkari", t: "Sarkari Naukri Secured", d: "Exam cleared, posting joined, and your family can finally stop worrying.", c: g => has(g, "passed") },
        { id: "planb", t: "Plan B, With Dignity", d: "Two attempts, no luck. Thousands are in the same boat, and many build great careers elsewhere.", c: g => has(g, "failed2") },
        { id: "nextyear", t: "Next Year, Stronger", d: "Not yet. But your prep is much stronger than when you started." }
      ]
    },

    // 4 ─────────────────────────────────────────────
    {
      id: "creator", title: "Influencer", unit: "Week", tag: "Zero followers, one phone",
      blurb: "Build an audience from scratch in {city}. Trends, trolls, brand deals and the algorithm's mood swings.",
      cash0: 5000, s0: 15, x0: 5, sl: "Editing", xl: "Followers", fmt: "followers",
      roles: { m: "a creator with 2 lakh followers who answers your DMs", v: "a creator who copies your ideas", f: "your camera person and best friend", p: "asks when you'll get a 'real job'" },
      settle(g, k) {
        const lines = [["Data, props and travel", -k.m(400)]];
        if (g.x >= 35) lines.push(["Brand deals", k.m((g.x - 30) * 130)]);
        g.x = Math.min(100, g.x + 3 + Math.round(g.s / 15));
        return lines;
      },
      ev: [
        { id: "cr_niche", w: 4, t: "What's your content going to be about?",
          c: [
            { l: "Food reviews around {city}", e: { x: 7, s: 2 }, r: "People always want to know where to eat." },
            { l: "Comedy skits in {lang} and English", e: { x: 9, s: 3 }, r: "Local humour hits different." },
            { l: "Honest money tips for students", e: { x: 5, r: 8 }, r: "Slower growth, deeply loyal followers." }
          ] },
        { id: "cr_trend", w: 3, t: "A new audio is trending everywhere.",
          c: [
            { l: "Copy the trend exactly", e: { x: 5, r: -2 }, r: "Views come. Nobody remembers it was you." },
            { l: "Give it a {state} twist", e: { x: 9, s: 3 }, r: "Your version gets shared outside {state} too." },
            { l: "Skip it", e: { s: 1 }, r: "Your own ideas, your own pace." }
          ] },
        { id: "cr_troll", w: 3, t: "A reel goes viral, and so do the trolls in the comments.",
          c: [
            { l: "Reply with humour", e: { x: 6, r: 4 }, r: "Your reply gets more likes than the troll." },
            { l: "Block and report abusive comments", e: { h: 4 }, r: "Your comments section, your rules." },
            { l: "Read every comment at 2 am", e: { h: -8 }, r: "Never do this." }
          ] },
        { id: "cr_brand", w: 4, t: "A brand offers ₹8,000 to promote a 'fast weight-loss tea'. No proof it works, and they ask you not to label it as an ad.",
          c: [
            { l: "Decline", e: { r: 8 }, r: "Your followers trust you. That's the real asset." },
            { l: "Take it, without disclosing", shady: true, e: { C: 8000, set: "misled" }, r: "Easy money for one reel." },
            { l: "Counter-offer: only if clearly labelled as an ad and you can test it", e: { r: 4, s: 2 }, r: "They ghost you. Fine." }
          ] },
        { id: "cr_misled_bad", req: "misled", min: 3, w: 9, t: "Followers say the tea made them sick. An advertising-standards complaint names your reel.",
          c: [
            { l: "Apologise publicly and take it down", e: { r: 4, x: -6, unset: "misled", set: "apologised" }, r: "Some unfollow. Most respect the apology." },
            { l: "Stay silent", e: { r: -15, x: -10 }, r: "Silence reads as guilt." }
          ] },
        { id: "cr_collab", w: 3, who: "m", t: "{m} offers a collab, if you edit his videos for free for a month.",
          c: [
            { l: "Do it", e: { s: 8, x: 8, h: -4, rel: { m: 10 } }, r: "Hard month. Huge learning. The collab blows up." },
            { l: "Ask for fair pay instead", e: { C: 3000, rel: { m: -3 } }, r: "He agrees, a bit annoyed. No collab though." }
          ] },
        { id: "cr_copy", w: 3, who: "v", t: "{v} copies your format shot for shot.",
          c: [
            { l: "Call him out publicly", e: { x: 4, r: -3, rel: { v: -15 } }, r: "Drama gets views. It also gets messy." },
            { l: "Out-create him", e: { s: 5, x: 5 }, r: "By the time he copies, you've moved on." },
            { l: "DM him to collab", e: { rel: { v: 10 }, x: 3 }, r: "Turns out he's a decent guy." }
          ] },
        { id: "cr_gear", w: 2, t: "Your phone camera is holding you back.",
          c: [
            { l: "Buy a ₹1,500 mic and a ring light", need: 1500, e: { c: -1500, s: 4 }, r: "Audio quality matters more than you thought." },
            { l: "Use daylight and what you have", e: { s: 2 }, r: "Constraints make you creative." }
          ] }
      ],
      end: [
        { id: "lakh", t: "Lakh-Club Creator", d: "Over a lakh followers, paid collaborations and a voice people listen to.", c: g => g.x >= 75 && g.r >= 40 },
        { id: "trusted", t: "Trusted Voice", d: "Not the biggest page, but the one people actually believe.", c: g => g.r >= 65 },
        { id: "rising", t: "Rising Creator", d: "Real momentum. Keep going and the next six months could be big.", c: g => g.x >= 45 },
        { id: "drawing", t: "Back to the Drawing Board", d: "The algorithm wasn't kind this time. You learned editing, storytelling and patience." }
      ]
    },

    // 5 ─────────────────────────────────────────────
    {
      id: "startup", title: "Startup Founder", unit: "Month", tag: "An idea and ₹60,000 in savings",
      blurb: "Build an app that helps small shops in {city} take orders on WhatsApp. Validate, build, hire, pitch, survive.",
      cash0: 60000, s0: 20, x0: 5, sl: "Product", xl: "Users", fmt: "users",
      roles: { m: "an angel investor who mentors first-time founders", v: "the founder of a funded competitor", f: "your co-founder", p: "has already told relatives you're a 'CEO'" },
      settle(g, k) {
        const lines = [["Revenue", Math.round(g.x * g.x * 9)], ["Team and servers", -k.m(has(g, "team") ? 28000 : 7000)]];
        g.x = Math.min(100, g.x + Math.round(g.s / 25));
        return lines;
      },
      ev: [
        { id: "su_validate", w: 4, t: "Before writing code: do you talk to shopkeepers first?",
          c: [
            { l: "Interview 50 shopkeepers", e: { s: 6, x: 4, h: -3 }, r: "They want simpler billing more than ordering. You adjust." },
            { l: "Just build it", e: { s: 4, x: -2 }, r: "A beautiful app nobody asked for." },
            { l: "Copy the competitor's features", e: { x: 3, r: -4 }, r: "Fast, but forgettable." }
          ] },
        { id: "su_equity", w: 3, who: "f", t: "{f} wants a 50-50 equity split. You were thinking 60-40.",
          c: [
            { l: "50-50, with vesting over four years", e: { rel: { f: 12 }, s: 2 }, r: "Fair and protected. Smart founders do this." },
            { l: "Insist on 60-40", e: { rel: { f: -10 } }, r: "They agree, but something shifted." }
          ] },
        { id: "su_hire", w: 3, t: "You're drowning in work. Hire a small team?",
          c: [
            { l: "Hire two developers", e: { s: 10, x: 6, set: "team" }, r: "Speed triples. So does your burn." },
            { l: "Use freelancers for now", need: 15000, e: { c: -15000, s: 5 }, r: "Flexible and a bit chaotic." },
            { l: "Do it all yourself", e: { h: -8, s: 3 }, r: "Code by night, sales by day." }
          ] },
        { id: "su_fake", w: 3, t: "A 'growth hacker' offers to inflate your user numbers before the pitch for ₹20,000.",
          c: [
            { l: "Refuse. Real numbers only.", e: { r: 6 }, r: "Smaller numbers, but true ones." },
            { l: "Do it", shady: true, need: 20000, e: { c: -20000, x: 12, set: "faked" }, r: "The chart looks amazing. It isn't real." }
          ] },
        { id: "su_pitch", at: 4, w: 9, who: "m", t: "Pitch day with {m} and two other angel investors.",
          c: [ { l: "Show your traction honestly", ck: { k: "x", d: 30, ok: { e: { C: 1000000, r: 10, set: "funded" }, r: "They're in: ₹10 lakh seed cheque!" }, no: { e: { h: -8, s: 3 }, r: "'Come back with more users.' Ouch, but useful." } } } ] },
        { id: "su_caught", req: "faked", min: 5, w: 9, t: "During due diligence, the investors find the fake users.",
          c: [ { l: "Come clean", e: { r: -20, h: -12, unset: "funded", C: -500000, set: "busted" }, r: "The deal is cancelled and the money returned. Word travels fast in startup circles." } ] },
        { id: "su_bigclient", w: 3, t: "A supermarket chain wants a pilot, but demands custom features for free.",
          c: [
            { l: "Do it for free to win the logo", e: { x: 8, h: -5 }, r: "Great case study. Exhausted team." },
            { l: "Charge a small pilot fee", e: { C: 25000, x: 4 }, r: "They agree. Paying customers are the best validation." }
          ] },
        { id: "su_rival", w: 3, who: "v", t: "{v}'s startup raises ₹5 crore and starts copying your features.",
          c: [
            { l: "Go deeper into a niche they ignore", e: { s: 6, x: 5 }, r: "Kirana stores in smaller towns are all yours." },
            { l: "Cut prices to fight them", e: { c: -20000, x: 6 }, r: "You win users and lose sleep." }
          ] }
      ],
      end: [
        { id: "funded", t: "Funded Founder", d: "A real seed round on real numbers. Now the hard part starts.", c: g => has(g, "funded") && !has(g, "busted") },
        { id: "bootstrapped", t: "Bootstrapped and Growing", d: "No investors, but paying customers and a product people need.", c: g => g.x >= 55 },
        { id: "pivot", t: "Pivot Time", d: "The idea needs reshaping. Most successful startups pivoted at least once." }
      ]
    },

    // 6 ─────────────────────────────────────────────
    {
      id: "craft", title: "Craft Brand", unit: "Month", tag: "Take {state}'s craft to the country",
      blurb: "Build a fashion label around {craft}, made with local artisans in {state}.",
      cash0: 15000, s0: 20, x0: 10, sl: "Design", xl: "Brand buzz",
      roles: { m: "a master artisan with 30 years at the loom", v: "a seller of cheap machine-made copies", f: "your partner who handles Instagram orders", p: "thinks fashion is a 'risky line'" },
      settle(g, k) {
        const orders = Math.round(k.st.craft.base * (0.5 + g.r / 100) * (0.6 + g.x / 100));
        const lines = [["Orders", orders, "n"], ["Sales margin", orders * k.st.craft.margin], ["Artisan advances and materials", -k.m(has(g, "fairwage") ? 8000 : 6000)]];
        return lines;
      },
      ev: [
        { id: "cf_wage", w: 4, who: "m", t: "{m} asks: will you pay artisans a fair wage or the usual market rate?",
          c: [
            { l: "Fair wages, and say so on every label", e: { r: 8, rel: { m: 14 }, set: "fairwage" }, r: "Customers love the story. So do the artisans." },
            { l: "Market rate for now", e: { c: 2000, r: -4, rel: { m: -8 } }, r: "Cheaper. The workshop is quieter around you." }
          ] },
        { id: "cf_copy", w: 3, who: "v", t: "{v} sells machine-made copies labelled 'handmade' at half your price.",
          c: [
            { l: "Get official handloom certification", need: 2000, e: { c: -2000, r: 8 }, r: "Now you can prove you're the real thing." },
            { l: "Make reels showing the weaving process", e: { x: 8, s: 2 }, r: "Seeing the hands behind it changes everything." },
            { l: "Drop your prices", e: { c: -1500, x: 3, r: -2 }, r: "A race to the bottom you can't win." }
          ] },
        { id: "cf_expo", w: 3, t: "A national crafts exhibition in Delhi. Stall fee: ₹10,000.",
          c: [
            { l: "Book the stall", need: 10000, e: { c: -10000, x: 12, C: 14000 }, r: "You sell out, and a boutique owner takes your number." },
            { l: "Skip it this year", e: { s: 2 }, r: "Maybe next year." }
          ] },
        { id: "cf_design", w: 3, who: "m", t: "Young buyers want modern cuts. {m} wants to keep traditional patterns.",
          c: [
            { l: "Fusion: traditional weave, modern cut, with his blessing", e: { s: 7, x: 5, rel: { m: 5 } }, r: "Your best-selling line is born." },
            { l: "Go fully modern", e: { x: 6, rel: { m: -8 } }, r: "Sells well. Something feels lost." },
            { l: "Stay traditional", e: { r: 5, rel: { m: 8 } }, r: "Purists love it. The market is smaller." }
          ] },
        { id: "cf_bulk", w: 3, t: "A big retail chain wants 500 pieces in 3 weeks. That's impossible by hand.",
          c: [
            { l: "Negotiate a realistic 150 pieces", e: { C: 9000, r: 5 }, r: "They agree. A long-term buyer!" },
            { l: "Say yes and quietly use machine-made stock", shady: true, e: { C: 30000, set: "fakecraft" }, r: "Big cheque. Bigger secret." },
            { l: "Decline", e: { h: 2 }, r: "You know your limits." }
          ] },
        { id: "cf_fake_bad", req: "fakecraft", min: 3, w: 9, t: "A buyer's lab test proves the 'handloom' pieces were machine-made. They post it online.",
          c: [ { l: "Admit it and refund everyone", e: { C: -30000, r: -20, unset: "fakecraft" }, r: "It costs everything, but honesty is the only way back." } ] },
        { id: "cf_fest", w: 3, t: "{festival} season. Orders are flooding in.",
          c: [
            { l: "Work round the clock", e: { C: 6000, h: -6 }, r: "Best month ever. You sleep for two days after." },
            { l: "Cap orders, protect quality", e: { C: 3000, r: 5 }, r: "Every piece perfect. Waiting lists are good marketing." }
          ] }
      ],
      end: [
        { id: "loom", t: "Loom to Label", d: "A respected brand that pays artisans fairly and sells across India.", c: g => has(g, "fairwage") && g.r >= 60 },
        { id: "profit", t: "Profitable Label", d: "Real sales, real margins, a brand people search for.", c: (g, k) => g.cash >= k.m(30000) },
        { id: "smallbatch", t: "Small Batch, Big Heart", d: "Still small. Still yours. The craft lives on." }
      ]
    },

    // 7 ─────────────────────────────────────────────
    {
      id: "film", title: "Film Star", unit: "Month", tag: "From auditions to {film}",
      blurb: "Chase a career in {film}. Auditions, rejections, scams, small roles and one big break.",
      cash0: 15000, s0: 15, x0: 5, sl: "Acting", xl: "Fame",
      roles: { m: "a casting director who has seen a thousand hopefuls", v: "a fellow newcomer chasing the same roles", f: "your roommate and fellow struggler", p: "keeps forwarding government job notices" },
      settle(g, k) {
        const lines = [["Shared room and food", -k.m(6000)]];
        if (has(g, "lead")) lines.push(["Film fee", 60000]);
        else if (has(g, "serial")) lines.push(["TV serial pay", k.m(18000)]);
        else if (g.x >= 10) lines.push(["Small gigs", k.m(5000)]);
        return lines;
      },
      ev: [
        { id: "fm_train", w: 4, t: "How will you train?",
          c: [
            { l: "Paid acting workshop (₹8,000)", need: 8000, e: { c: -8000, s: 10 }, r: "A good teacher changes everything." },
            { l: "Join a theatre group (free)", e: { s: 7, h: 3, rel: { f: 5 } }, r: "Theatre people are the best people." },
            { l: "Learn from films and practise alone", e: { s: 3 }, r: "Slow, but it's something." }
          ] },
        { id: "fm_scam", w: 4, t: "A 'producer' says the role is yours if you pay ₹50,000 for a 'registration fee'.",
          c: [
            { l: "Refuse. Real producers don't charge actors.", e: { r: 4, s: 1 }, r: "You warn others in your WhatsApp group too." },
            { l: "Pay a ₹5,000 advance to 'hold' the role", shady: false, need: 5000, e: { c: -5000, h: -8 }, r: "He disappears. Painful, common lesson." }
          ] },
        { id: "fm_serial", w: 3, t: "A TV serial offers steady work. Some say it'll 'typecast' you.",
          c: [
            { l: "Accept the serial", e: { h: 2, x: 6, set: "serial" }, r: "Steady pay. Aunties recognise you at the market." },
            { l: "Hold out for films", e: { x: 1 }, r: "Bold. Your bank balance disagrees." }
          ] },
        { id: "fm_reject", w: 3, t: "Twenty auditions. Twenty rejections.",
          c: [
            { l: "Go home for a week", e: { h: 10, rel: { p: 8 } }, r: "Home food and old friends recharge you." },
            { l: "Make a short film with {f}", e: { s: 6, x: 6, rel: { f: 8 } }, r: "It gets selected for a small festival!" },
            { l: "Keep going, no break", e: { s: 3, h: -7 }, r: "Grit. And exhaustion." }
          ] },
        { id: "fm_audition", at: 4, w: 9, who: "m", t: "{m} calls you for the audition of the year: a lead role in {film}.",
          c: [ { l: "Give it everything", ck: { k: "s", d: 45, ok: { e: { x: 25, r: 10, set: "lead" }, r: "You got it. Your first lead role!" }, no: { e: { h: -10, rel: { m: 4 } }, r: "'Close. Really close.' {m} remembers you." } } } ] },
        { id: "fm_rival", w: 3, who: "v", t: "{v} lands the role you wanted.",
          c: [
            { l: "Congratulate him genuinely", e: { r: 5, rel: { v: 12 } }, r: "He recommends you for his next project." },
            { l: "Gossip about how he 'got it'", e: { r: -6, rel: { v: -10 } }, r: "The industry is small. Gossip travels." }
          ] },
        { id: "fm_ad", w: 3, t: "A local jewellery shop in {city} wants you for a print ad.",
          c: [
            { l: "Do it", e: { C: 6000, x: 4 }, r: "Your face on a hoarding! Small, but yours." },
            { l: "Hold out for screen work", e: { s: 1 }, r: "Principled. Broke." }
          ] }
      ],
      end: [
        { id: "lead", t: "Lead Role", d: "Your first lead in {film}. The poster has your name on it.", c: g => has(g, "lead") },
        { id: "household", t: "Household Face", d: "TV made you familiar in every home. Films may follow.", c: g => has(g, "serial") && g.x >= 30 },
        { id: "actors", t: "The Actor's Actor", d: "Not famous yet, but the people who matter say you can really act.", c: g => g.s >= 55 },
        { id: "auditioning", t: "Still Auditioning", d: "Every star has a chapter like this. Keep going, or choose another stage." }
      ]
    },

    // 8 ─────────────────────────────────────────────
    {
      id: "cricket", title: "Cricketer", unit: "Week", tag: "From club nets to the state T20 league",
      blurb: "Fight for a place in {league}. Form, fitness, coaches and one trial that decides everything.",
      cash0: 4000, s0: 25, x0: 25, sl: "Technique", xl: "Form",
      roles: { m: "your coach, strict and rarely impressed", v: "a teammate fighting for your spot", f: "your net-practice partner", p: "worries about injuries and your degree" },
      settle(g, k) {
        const lines = [["Kit and travel", -k.m(800)]];
        if (has(g, "club")) lines.push(["Club match fees", k.m(1500)]);
        if (has(g, "selected")) lines.push(["League contract (weekly)", 15000]);
        g.x = Math.max(0, Math.min(100, g.x + (has(g, "routine") ? 2 : -3) - (has(g, "injured") ? 4 : 0)));
        return lines;
      },
      ev: [
        { id: "ck_routine", w: 4, t: "{m} wants you at the ground at 5 am every day for fitness.",
          c: [
            { l: "Commit to it", e: { s: 4, h: -3, set: "routine", rel: { m: 8 } }, r: "Painful for two weeks. Then it becomes who you are." },
            { l: "Three days a week", e: { s: 2 }, r: "Something is better than nothing." }
          ] },
        { id: "ck_injury", w: 3, t: "A hamstring niggle before a big club match.",
          c: [
            { l: "Rest and see a physio (₹2,000)", need: 2000, e: { c: -2000, x: -2 }, r: "You miss one match and protect your season." },
            { l: "Play through it", e: { x: 4, set: "injured" }, r: "You score 40, then limp for a month." }
          ] },
        { id: "ck_club", w: 3, t: "A local club team offers ₹1,500 per match.",
          c: [ { l: "Join", e: { s: 3, set: "club" }, r: "Proper matches, proper pressure." }, { l: "Focus on nets", e: { s: 2 }, r: "Technique over match time." } ] },
        { id: "ck_fix", w: 3, t: "A stranger offers ₹10,000 if you get out cheaply in Sunday's match.",
          c: [
            { l: "Refuse and report it to {m}", e: { r: 12, rel: { m: 15 } }, r: "The association's anti-corruption officer thanks you." },
            { l: "Take the money", shady: true, e: { C: 10000, set: "fixed" }, r: "You get out for 3. It feels worse than any duck." }
          ] },
        { id: "ck_fix_bad", req: "fixed", min: 3, w: 9, t: "The anti-corruption unit calls. The stranger was under investigation, and your bank transfer is on record.",
          c: [ { l: "Confess", e: { r: -30, h: -15, set: "banned" }, r: "A ban. The game you love, gone." } ] },
        { id: "ck_tech", w: 3, who: "m", t: "{m} wants to change your batting stance. Your scores will dip at first.",
          c: [
            { l: "Trust the coach", e: { s: 9, x: -5, rel: { m: 10 } }, r: "Ugly for a while. Then the cover drive is unreal." },
            { l: "Stick to your natural game", e: { x: 4, rel: { m: -8 } }, r: "Scores stay up. The ceiling stays low." }
          ] },
        { id: "ck_trial", at: 4, w: 9, t: "Trials for {league}. 200 players, 15 spots.",
          c: [ { l: "Walk out to bat", ck: { k: "sx", d: 50, ok: { e: { r: 12, h: 15, set: "selected" }, r: "Selected! Your name is on the list." }, no: { e: { h: -10 }, r: "Not selected. The coach says 'next season'." } } } ] },
        { id: "ck_exams", w: 3, who: "p", t: "Your college exams clash with a tournament. {p} is firm.",
          c: [
            { l: "Write the exams", e: { rel: { p: 12 }, x: -3 }, r: "Degree safe. One tournament missed." },
            { l: "Play the tournament", e: { x: 6, rel: { p: -10 } }, r: "Two fifties. A very tense phone call home." }
          ] }
      ],
      end: [
        { id: "banned", t: "Banned", d: "Match-fixing ended your career. No match is worth that.", c: g => has(g, "banned") || has(g, "fixed") },
        { id: "league", t: "League Contract", d: "Selected for {league}. Floodlights, crowds and a real contract.", c: g => has(g, "selected") },
        { id: "clubhero", t: "Club Hero", d: "The best player at your club. Next season could be the one.", c: g => g.s >= 55 },
        { id: "nets", t: "Back to the Nets", d: "Not this season. Thousands try. The ones who keep trying sometimes make it." }
      ]
    },

    // 9 ─────────────────────────────────────────────
    {
      id: "reality", title: "Reality Show", unit: "Week", tag: "Six weeks inside Spotlight House",
      blurb: "Survive six weeks in Spotlight House, a fictional reality show. Tasks, alliances, nominations and the public vote.", closed: true,
      cash0: 2000, s0: 20, x0: 35, sl: "Charm", xl: "Public votes",
      roles: { m: "a fan-favourite housemate", v: "the house schemer", f: "your closest ally in the house", p: "watches every episode on the family TV" },
      settle(g, k) {
        const lines = [["Appearance fee", 5000]];
        const wk = g.chapter;
        g.x = Math.max(0, g.x - 3);
        if (wk >= 2 && wk <= 5 && !has(g, "immune") && g.x < 22 + wk * 8) g.ending = "evicted";
        g.flags = g.flags.filter(f => f !== "immune");
        if (wk === 6 && g.x >= 85) lines.push(["Winner's prize", 1000000]);
        return lines;
      },
      ev: [
        { id: "rl_task", w: 3, t: "Captaincy task: hold a bucket of water above your head the longest.",
          c: [
            { l: "Go all out to win", e: { s: 4, x: 5, rel: { v: -5 } }, r: "Arms shaking, you win. Captain!" },
            { l: "Drop out to help {f} win", e: { x: 3, rel: { f: 12 } }, r: "The audience sees loyalty." },
            { l: "Sit it out", e: { x: -4 }, r: "Invisible contestants get evicted." }
          ] },
        { id: "rl_alliance", w: 3, who: "v", t: "{v} offers an alliance: vote out {f} this week.",
          c: [
            { l: "Refuse", e: { r: 6, x: 3, rel: { v: -10 } }, r: "He's annoyed. The audience loves it." },
            { l: "Join him", e: { x: 4, rel: { f: -20, v: 10 }, r: -4 }, r: "Strategic. The viewers call you a traitor." },
            { l: "Tell {f} everything", e: { rel: { f: 12 }, x: 2 }, r: "Your alliance is now rock solid." }
          ] },
        { id: "rl_insult", w: 3, t: "A housemate mocks the way people from {city} talk.",
          c: [
            { l: "Reply with a witty comeback", e: { x: 9, r: 6 }, r: "The clip trends across {state}." },
            { l: "Shout back", e: { x: 4, r: -6, h: -4 }, r: "Big drama. Mixed reactions." },
            { l: "Ignore it", e: { x: -2 }, r: "Dignified, but the moment passes." }
          ] },
        { id: "rl_producers", w: 3, t: "A producer hints you should 'create some drama' with a housemate for ratings.",
          c: [
            { l: "Refuse to fake it", e: { r: 8 }, r: "You stay real. That's your brand now." },
            { l: "Stage a fake fight", e: { x: 6, r: -6 }, r: "Ratings spike. You feel cheap." }
          ] },
        { id: "rl_immunity", w: 3, t: "Immunity task: cook {food} for the whole house in 30 minutes.",
          c: [ { l: "Cook for your safety", ck: { k: "s", d: 35, ok: { e: { set: "immune", x: 4 }, r: "Immune this week!" }, no: { e: { x: -2 }, r: "Burnt. You're on your own." } } } ] },
        { id: "rl_letter", w: 3, who: "p", t: "Emotional task: a letter from {p}.",
          c: [
            { l: "Read it aloud and share your story", e: { x: 9, h: 6, rel: { p: 10 } }, r: "The whole house cries. So does half of {state}." },
            { l: "Read it quietly", e: { h: 4 }, r: "Some things are just for you." }
          ] },
        { id: "rl_cam", w: 3, t: "2 am. You forgot the cameras never sleep and sang {lang} songs to the fridge for twenty minutes.",
          c: [
            { l: "Own it at breakfast: 'The fridge loved it'", e: { x: 7, r: 3 }, r: "It's the clip of the week. Someone made a remix." },
            { l: "Beg the producers to cut it", e: { x: -2 }, r: "They don't. They never do." }
          ] },
        { id: "rl_ration", w: 3, t: "The house failed the ration task. Three days of rice and pickle for everyone.",
          c: [
            { l: "Invent something edible from rice and pickle", e: { s: 4, x: 5, rel: { f: 5 } }, r: "'Pickle rice risotto.' Chefs are crying. Housemates are not." },
            { l: "Share the biscuits hidden in your pillow", e: { x: 6, r: 5 }, r: "Hero of the hungry. Also, why were they in your pillow?" },
            { l: "Eat the hidden biscuits alone at night", e: { x: -7, r: -6 }, r: "Night vision cameras exist. The nation saw everything." }
          ] },
        { id: "rl_fest", w: 3, t: "{festival} inside the house. Decorations arrive, families don't.",
          c: [
            { l: "Lead the celebration for everyone", e: { x: 8, h: 5 }, r: "You turn a TV set into home for one evening." },
            { l: "Miss home quietly on camera", e: { x: 4, h: -3 }, r: "Half of {state} cries with you." }
          ] },
        { id: "rl_rumour", w: 3, who: "v", t: "{v} tells the house you're 'fake' and 'only playing for the camera'.",
          c: [
            { l: "Calmly ask for one example at dinner", e: { x: 6, r: 4, rel: { v: -6 } }, r: "He has none. The silence is delicious." },
            { l: "Roast him with a comedy routine", e: { x: 8, rel: { v: -4 } }, r: "Even he laughs. Then sulks." },
            { l: "Cry in the confession room", e: { x: 3, h: -4 }, r: "Real emotions, real votes. Some of them." }
          ] },
        { id: "rl_ship", w: 2, t: "Viewers have decided you and another housemate are a couple. The hashtag is trending.",
          c: [
            { l: "Politely clear it up on camera", e: { r: 5, x: 2 }, r: "Respect. The hashtag survives anyway." },
            { l: "Play along for votes", e: { x: 7, r: -3 }, r: "Votes up. Your parent's WhatsApp messages also up." }
          ] },
        { id: "rl_dance", w: 3, t: "Task: perform a traditional dance from {state} with zero rehearsal.",
          c: [
            { l: "Commit with full energy", e: { x: 9, s: 3 }, r: "Not perfect. Totally iconic." },
            { l: "Turn it into comedy", e: { x: 6, h: 4 }, r: "Two left feet, one standing ovation." }
          ] },
        { id: "rl_toilet", w: 2, t: "You've been assigned toilet duty for the whole week.",
          c: [
            { l: "Do it without complaining", e: { r: 6, x: 3 }, r: "The audience respects a clean-bathroom king or queen." },
            { l: "Trade it to {v} for your snacks", e: { s: 3, rel: { v: 6 } }, r: "Diplomacy, powered by chips." },
            { l: "Refuse", e: { x: -6, r: -5 }, r: "The whole house turns on you. Also, the smell." }
          ] },
        { id: "rl_host", w: 3, t: "On the weekend episode, the host calls out your 'lazy week' in front of everyone.",
          c: [
            { l: "Accept it and promise to step up", e: { r: 5, x: 3 }, r: "Mature. The host nods. Rare." },
            { l: "Argue back on live TV", e: { x: 5, r: -6 }, r: "Great TV. Terrible idea." }
          ] },
        { id: "rl_wildcard", w: 2, who: "f", t: "A wildcard contestant walks in and immediately targets {f}.",
          c: [
            { l: "Defend {f}", e: { x: 4, rel: { f: 12 } }, r: "Loyalty is the best content." },
            { l: "Stay neutral", e: { x: -1, rel: { f: -5 } }, r: "{f} noticed. Everyone noticed." }
          ] },
        { id: "rl_sponsor", w: 2, t: "Sponsored task: sell a fictional hair oil, 'Lustro Locks', on live TV.",
          c: [
            { l: "Do an honest, hilarious pitch", e: { x: 8, s: 3 }, r: "'It's oil. It goes on hair. That's it.' The sponsor loves it anyway." },
            { l: "Promise it regrows hair overnight", e: { x: 3, r: -5 }, r: "Viewers fact-check you in real time. Ouch." }
          ] },
        { id: "rl_sleep", w: 2, t: "The lights never fully go off. You haven't slept properly in days.",
          c: [
            { l: "Nap in the garden", e: { h: 8, x: -3 }, r: "Refreshed. Also, a meme now." },
            { l: "Push through", e: { h: -6, x: 2 }, r: "You call {f} by the wrong name twice." }
          ] },
        { id: "rl_fanmail", w: 2, t: "Fan mail: a kid from {city} drew your portrait. It looks like a potato with your hair.",
          c: [
            { l: "Pin it on the wall proudly", e: { x: 6, h: 8 }, r: "Best gift you've ever received. Potato and all." },
            { l: "Read the letter on camera", e: { x: 5, h: 5 }, r: "'You make my Amma laugh.' Okay, now you're crying." }
          ] },
        { id: "rl_nominate", w: 3, t: "Nominations. You have to name one housemate for eviction.",
          c: [
            { l: "Nominate {v}, honestly explaining why", e: { x: 4, r: 3, rel: { v: -10 } }, r: "Brave and clear." },
            { l: "Nominate the quietest housemate", e: { x: -2, r: -3 }, r: "Safe, and the audience notices." }
          ] }
      ],
      end: [
        { id: "evicted", t: "Evicted", d: "The public vote went against you. But you walk out with followers, stories and a few real friends." },
        { id: "winner", t: "Spotlight Winner", d: "Six weeks, one trophy, and the whole country knows your name.", c: g => g.x >= 85 },
        { id: "finalist", t: "Finalist", d: "So close. Finalists often get the best offers anyway.", c: g => g.x >= 65 },
        { id: "fanfav", t: "Fan Favourite", d: "You survived to the end on your own terms." }
      ]
    },

    // 10 ────────────────────────────────────────────
    {
      id: "trader", title: "The Trader", unit: "Week", tag: "₹10,000 and an options trading app", mature: true,
      blurb: "Open a demat account in {city}, join a tips group and try options trading. A story about risk, debt and knowing when to stop. Not investment advice.",
      cash0: 10000, s0: 10, x0: 50, sl: "Market knowledge", xl: "Discipline", raw: true,
      roles: { m: "a retired bank officer who invests through index funds", v: "a 'finfluencer' who posts profit screenshots", f: "your college friend who trades too", p: "doesn't know how much you've put in" },
      settle(g, k) {
        if (has(g, "quit")) return [["Index SIP growth (illustrative)", Math.round(Math.max(0, g.cash) * 0.01)]];
        if (g.cash <= 0) return [];
        const frac = has(g, "allin") ? 0.6 : has(g, "overtrade") ? 0.4 : 0.2;
        const stake = Math.round(g.cash * frac);
        const pWin = Math.min(0.46, 0.33 + g.s / 600 + (g.x - 50) / 700);
        const trades = has(g, "overtrade") ? 8 : 4;
        let pnl = 0;
        for (let i = 0; i < trades; i++) pnl += k.R() < pWin ? Math.round(stake / trades * 0.9) : -Math.round(stake / trades);
        const costs = -Math.round(stake * 0.02 * trades / 4);
        if (has(g, "tips")) g.x = Math.max(0, g.x - 3);
        return [["Options P&L this week", pnl], ["Brokerage, taxes and fees", costs]];
      },
      ev: [
        { id: "tr_first", at: 1, w: 9, t: "Your first options trade: ₹2,000 on a 'Desh 50' call option. An hour later it's worth ₹8,000.",
          c: [
            { l: "Book the profit and celebrate", e: { C: 6000, h: 6, x: 5 }, r: "₹6,000 in an hour. Your brain has just learned something dangerous." },
            { l: "Book it, and go bigger tomorrow", e: { C: 6000, x: -10, set: "overtrade" }, r: "Beginner's luck feels exactly like skill." }
          ] },
        { id: "tr_tips", w: 4, who: "v", t: "{v}'s Telegram group promises '300% returns' with premium calls for ₹2,999 a month.",
          c: [
            { l: "Check whether he's SEBI-registered", e: { s: 8, x: 5 }, r: "He isn't. Registered advisers don't promise returns." },
            { l: "Join the premium group", e: { C: -2999, x: -8, set: "tips" }, r: "Calls every hour. Your phone never stops buzzing." },
            { l: "Ignore it", e: { s: 2 }, r: "One less voice in your head." }
          ] },
        { id: "tr_revenge", w: 4, t: "A bad trade wipes out ₹5,000 by 11 am. You want to win it back today.",
          c: [
            { l: "Close the app for the day", e: { x: 10, h: -2 }, r: "The hardest trade is no trade. You made it." },
            { l: "Double the next trade to recover", ck: { k: "x", d: 75, ok: { e: { C: 4000, x: -6 }, r: "It worked, this time. Which makes it more dangerous." }, no: { e: { C: -8000, x: -8, set: "overtrade" }, r: "Down ₹13,000 in one day." } } }
          ] },
        { id: "tr_expiry", w: 3, t: "Expiry day. Far-out options at ₹2 'could become ₹50'. {f} is putting in ₹5,000.",
          c: [
            { l: "Put ₹5,000 in too", need: 5000, ck: { k: "s", d: 95, ok: { e: { C: 30000 }, r: "Somehow it hit. You'll chase this feeling for months." }, no: { e: { C: -5000, x: -5 }, r: "Expired worthless, like most of them do." } } },
            { l: "Sit out and watch", e: { x: 6, s: 2 }, r: "By 3:30 pm, {f} has lost it all." }
          ] },
        { id: "tr_loan", w: 3, cond: g => g.cash < 6000, t: "You're down. A loan app offers ₹25,000 instantly, no paperwork.",
          c: [
            { l: "Refuse. Never trade with borrowed money.", e: { x: 10 }, r: "The most important rule of all." },
            { l: "Take it and trade bigger", shady: true, e: { C: 25000, set: ["loan", "allin"], x: -12 }, r: "Fresh capital. Fresh pressure." }
          ] },
        { id: "tr_loan_bad", req: "loan", min: 3, w: 9, t: "The loan app wants ₹34,000 back. Recovery agents start messaging your contacts.",
          c: [ { l: "Repay everything you can", e: { C: -34000, h: -14, unset: "loan", rel: { p: -8 } }, r: "Humiliating, and very expensive." } ] },
        { id: "tr_family", w: 3, who: "p", t: "{p} asks why you're glued to your phone during dinner.",
          c: [
            { l: "Tell the truth about the losses", e: { h: 8, rel: { p: -4 }, set: "honest" }, r: "Hard conversation. A huge weight lifts." },
            { l: "Say it's office work", e: { h: -6, rel: { p: -2 } }, r: "The lie sits with you." }
          ] },
        { id: "tr_mentor", w: 3, who: "m", t: "{m} offers to show you how he's built wealth slowly through index-fund SIPs.",
          c: [
            { l: "Sit down and learn", e: { s: 12, x: 8, rel: { m: 12 } }, r: "Boring. Proven. Thirty years of compounding." },
            { l: "'That's too slow for me'", e: { rel: { m: -5 } }, r: "He smiles. He's heard it before." }
          ] },
        { id: "tr_stop", min: 4, w: 6, not: "quit", t: "You've seen the numbers. Most retail options traders lose money. What now?",
          c: [
            { l: "Stop options. Move what's left to an index SIP.", e: { x: 15, h: 8, set: "quit", unset: ["overtrade", "allin", "tips"] }, r: "You delete the app. The relief is physical." },
            { l: "One more month. You're close to cracking it.", e: { x: -6 }, r: "Everyone says that." }
          ] }
      ],
      end: [
        { id: "walked", t: "Walked Away", d: "You stopped while you were ahead of most. Your money now grows slowly and boringly, which is exactly right.", c: g => has(g, "quit") && g.cash >= 10000 },
        { id: "learned", t: "Learned the Hard Way", d: "You lost money, then made the hardest call: you stopped. That decision is worth more than any trade.", c: g => has(g, "quit") },
        { id: "margincall", t: "Margin Call", d: "The account is empty and there may be debt behind it. You're not alone, and it's not the end. Talk to someone you trust.", c: g => g.cash < 2000 },
        { id: "chasing", t: "Still Chasing the Next Trade", d: "Up some weeks, down others. The odds don't change just because you want them to." }
      ]
    }
  ];
})();
