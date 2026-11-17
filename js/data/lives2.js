// Ten more lives (11–20). Same format as lives.js. Everyone starts in Kochi.
// ch.paper = a document from the Government Office the choice needs (see data/city.js PAPERS).
(function () {
  const has = (g, f) => g.flags.indexOf(f) >= 0;
  const P = (g, id) => (g.papers || []).indexOf(id) >= 0;

  window.AE_LIVES = window.AE_LIVES.concat([
    // 11 ─────────────────────────────────────────────
    {
      id: "nurse", title: "Night Shift Nurse", unit: "Month", tag: "Staff nurse at a busy hospital in {city}",
      blurb: "Twelve-hour shifts, impossible relatives, one abroad-placement slot and a ward that can't run without you.",
      cash0: 6000, s0: 30, x0: 20, sl: "Clinical skills", xl: "Patient trust",
      roles: { m: "the head nurse who has seen everything twice", v: "a batchmate chasing the same abroad slot", f: "your roommate from nursing college", p: "tells relatives you're 'almost a doctor'" },
      settle(g, k) {
        const lines = [["Salary", k.m(19000 + (has(g, "icu") ? 4000 : 0) + (has(g, "incharge") ? 6000 : 0))], ["Rent, food and bus", -k.m(9500)]];
        if (!has(g, "loanclear")) lines.push(["Nursing course loan EMI", -k.m(2500)]);
        if (has(g, "doubles")) { lines.push(["Extra shift pay", k.m(3000)]); g.h = Math.max(0, g.h - 4); }
        g.x = Math.min(100, g.x + 2);
        return lines;
      },
      ev: [
        { id: "nr_double", w: 3, who: "m", t: "Two nurses called in sick. {m} looks at you: 'Double shift tonight?'",
          c: [
            { l: "Take it, and keep taking extra shifts", e: { x: 6, h: -8, rel: { m: 8 }, set: "doubles" }, r: "More money every month. Your body has opinions about it." },
            { l: "Just tonight", e: { x: 4, h: -4, rel: { m: 5 } }, r: "The ward survives. You sleep for eleven hours." },
            { l: "Say you're too tired to be safe", e: { h: 3, rel: { m: -2 } }, r: "{m} nods. 'Tired nurses make mistakes. Good call.'" }
          ] },
        { id: "nr_relative", w: 3, t: "A patient's relative is shouting at you because the doctor is late. Half the ward is watching.",
          c: [
            { l: "Stay calm, explain, and get them a chair and water", e: { r: 6, x: 5, h: -2 }, r: "He apologises twenty minutes later and brings banana chips for the whole station." },
            { l: "Call security", e: { r: 1, h: 1 }, r: "Fair, but the ward stays tense all night." },
            { l: "Shout back", e: { r: -6, x: -4, rel: { m: -6 } }, r: "It feels good for four seconds. Then {m} calls you into her office." }
          ] },
        { id: "nr_mixup", w: 3, min: 2, t: "You notice you gave a patient the 10 pm medicine an hour early. Nothing happened, but it's a mistake.",
          c: [
            { l: "Report it to {m} and the doctor right away", e: { r: 4, s: 5, rel: { m: 10 } }, r: "No harm done. {m} says: 'Nurses who report mistakes are the ones I trust.'" },
            { l: "Quietly fix the chart", shady: true, e: { h: -6, set: "hid" }, r: "Nobody noticed. You did, though. You keep thinking about it." }
          ] },
        { id: "nr_hid_bad", min: 4, req: "hid", w: 9, t: "A chart audit finds the edited timing from months ago. The nursing superintendent wants an explanation.",
          c: [ { l: "Tell the truth and accept the warning", e: { r: -10, x: -6, unset: "hid" }, r: "A written warning. Hiding small mistakes turns them into big ones." } ] },
        { id: "nr_agency", w: 3, who: "v", t: "{v} found an agency promising a UK hospital job. 'Just ₹3 lakh fee and your job is guaranteed!'",
          c: [
            { l: "Check if the agency is government-registered and ask the hospital directly", e: { s: 4, r: 3 }, r: "Not registered. The 'hospital' has never heard of them. You warn {v} too." },
            { l: "Pay a ₹30,000 'registration' advance", e: { c: -30000, h: -10, set: "scammed" }, r: "The office is empty the next week. Real hospital recruiters don't sell jobs." },
            { l: "Focus on your English exam and apply directly", e: { s: 3, set: "abroadprep" }, r: "Slower, cheaper, legal. You download the official exam guide." }
          ] },
        { id: "nr_exam", req: "abroadprep", min: 3, w: 9, t: "The English language exam for nurses is next week. You've been studying after night shifts.",
          c: [
            { l: "Take leave for three days and revise", e: { c: -6000, h: 3, set: "examtried" }, ck: { k: "s", d: 45, ok: { e: { c: -6000, x: 8, set: "abroadok" }, r: "You clear it with a good score. A real hospital calls for an interview." }, no: { e: { c: -6000, h: -6 }, r: "Missed the score by half a band. You can retake it next time." } } },
            { l: "Postpone it", e: { h: 2 }, r: "Next season, maybe. The ward needs you anyway." }
          ] },
        { id: "nr_icu", w: 2, min: 2, who: "m", t: "{m} recommends you for six weeks of ICU training. It's hard, but ICU nurses earn more.",
          c: [
            { l: "Do the ICU training", e: { s: 10, h: -6, set: "icu", rel: { m: 6 } }, r: "Ventilators, alarms, very little sleep. You come out a different nurse." },
            { l: "Stay in the general ward", e: { h: 3 }, r: "Familiar faces, steady routine." }
          ] },
        { id: "nr_strike", w: 2, who: "f", t: "Nurses across private hospitals plan a one-day protest for fair pay. {f} is organising it.",
          c: [
            { l: "Join the protest, keep emergency duty covered", e: { r: 5, rel: { f: 10 }, set: "loanclear" }, r: "Management agrees to a pay revision. Your loan EMI suddenly feels manageable. (Loan cleared with arrears.)" },
            { l: "Stay out of it", e: { rel: { f: -6 } }, r: "Everyone gets the pay revision anyway. {f} notices you weren't there." }
          ] },
        { id: "nr_charge", min: 4, w: 4, t: "The ward in-charge post opens up. It means more responsibility and more paperwork.",
          c: [
            { l: "Apply for in-charge", ck: { k: "r", d: 50, ok: { e: { set: "incharge", x: 6 }, r: "You get it. Now you make the duty roster, so everyone loves and hates you." }, no: { e: { h: -3 }, r: "They pick someone more senior. Next time." } } },
            { l: "Not yet", e: { s: 2 }, r: "You keep learning on the floor." }
          ] }
      ],
      end: [
        { id: "abroad", t: "Hired Abroad, the Legal Way", d: "You cleared the exam and got a real hospital offer through a registered process. {city} will miss you on night shift.", c: g => has(g, "abroadok") && g.x >= 45 },
        { id: "incharge", t: "Ward In-Charge", d: "You run the ward now. Doctors come to you when they want things done.", c: g => has(g, "incharge") },
        { id: "icu", t: "ICU Specialist", d: "The nurse everyone wants on the hardest night.", c: g => has(g, "icu") && g.x >= 40 },
        { id: "steady", t: "The Backbone of the Ward", d: "Not glamorous, but patients remember your name. That's worth a lot." }
      ]
    },
    // 12 ─────────────────────────────────────────────
    {
      id: "cab", title: "Auto to Cab Fleet", unit: "Week", tag: "Drive a rented auto in {city} with ₹{start}",
      blurb: "Start with a rented auto at the stand. Learn every shortcut, fight for fares and try to own your wheels.",
      cash0: 2500, s0: 20, x0: 10, sl: "Driving", xl: "Rides",
      roles: { m: "a veteran auto driver who knows every shortcut in the city", v: "a driver who undercuts fares at your stand", f: "your cousin, a mechanic", p: "still thinks you should be a bank clerk" },
      settle(g, k) {
        const rides = Math.round(85 * (0.7 + g.r / 150) * (0.8 + g.x / 150) * (has(g, "cab") ? 1.3 : 1));
        const fare = has(g, "cab") ? 160 : 90;
        const lines = [["Rides this week", rides, "n"], ["Fares", k.m(rides * fare)], ["Fuel", -k.m(Math.round(rides * fare * 0.3))]];
        if (!has(g, "ownauto")) lines.push(["Auto rent", -k.m(1400)]);
        if (has(g, "app")) lines.push(["App commission", -k.m(Math.round(rides * fare * 0.15))]);
        if (has(g, "second")) lines.push(["Second vehicle (after driver's pay)", k.m(1800)]);
        g.x = Math.min(100, g.x + 2);
        return lines;
      },
      ev: [
        { id: "cb_meter", w: 3, t: "A passenger argues the meter is 'too high' and offers half the fare.",
          c: [
            { l: "Calmly show the fare chart", e: { r: 4, s: 1 }, r: "He grumbles and pays. The next passenger saw it and tips you." },
            { l: "Accept half to avoid a fight", e: { c: -50, h: -2 }, r: "Peace, at a price." },
            { l: "Charge everyone a 'night rate' all day", shady: true, e: { c: 300, r: -8 }, r: "More money this week. Fewer people choose your auto next week." }
          ] },
        { id: "cb_app", w: 3, t: "A ride-hailing app wants you on its platform. More rides, but it takes a cut of every fare.",
          c: [
            { l: "Join the app", e: { x: 10, set: "app" }, r: "Your phone buzzes nonstop. The commission stings, but the rides keep coming." },
            { l: "Stay with the stand and regulars", e: { r: 3 }, r: "Steady, familiar, a little slow." }
          ] },
        { id: "cb_lost", w: 3, t: "A passenger left an expensive phone in your auto. It's ringing.",
          c: [
            { l: "Answer it and return it", e: { r: 10, h: 6 }, r: "The owner runs a hotel. Now you're their regular airport driver." },
            { l: "Drop it at the police station", e: { r: 5 }, r: "Correct and safe. The owner sends a thank-you message." }
          ] },
        { id: "cb_rival", w: 3, who: "v", t: "{v} is offering ₹10 rides to steal passengers from your stand.",
          c: [
            { l: "Ignore him and keep your auto spotless", e: { s: 3, r: 3 }, r: "Clean seats and a polite driver beat cheap and grumpy." },
            { l: "Match his price", e: { c: -600, x: 3, rel: { v: -8 } }, r: "Both of you lose money. The passengers are delighted." },
            { l: "Talk it out at the tea shop", e: { rel: { v: 12 }, r: 2 }, r: "You split the routes. He even shares his best shortcut." }
          ] },
        { id: "cb_breakdown", w: 2, who: "f", t: "The engine dies on the bridge in the middle of rush hour.",
          c: [
            { l: "Call {f}", e: { c: -300, rel: { f: 6 } }, r: "{f} arrives with a toolbox and a lecture. Fixed in 20 minutes." },
            { l: "Push it to the side and wait for a tow", e: { c: -900, h: -5 }, r: "Expensive tow and a lost afternoon." }
          ] },
        { id: "cb_own", at: 2, w: 9, t: "The bank can give you a vehicle loan to own your auto if you have address proof. Down payment: ₹4,000.",
          c: [
            { l: "Pay the down payment and take the loan", need: 4000, paper: "id", e: { c: -4000, set: "ownauto" }, r: "Your name on the registration. No more rent." },
            { l: "Keep renting for now", e: { s: 2 }, r: "Next time, maybe." }
          ] },
        { id: "cb_cab", min: 3, w: 9, req: "ownauto", t: "A used taxi car is for sale. Airport and tourist rides pay much more. You'd need a taxi permit and ₹15,000 down payment.",
          c: [
            { l: "Buy the cab", need: 15000, paper: "permit", e: { c: -15000, set: "cab", x: 8 }, r: "Air conditioning, airport runs, tourists who tip. A big step up." },
            { l: "Not yet", e: { s: 2 }, r: "The auto is fine. For now." }
          ] },
        { id: "cb_second", min: 4, w: 9, req: "cab", t: "Your old auto is idle. A young driver wants to run it for a daily rent.",
          c: [
            { l: "Rent it out to him", e: { set: "second", r: 3 }, r: "Two vehicles earning. You're officially a 'fleet'. A small fleet." },
            { l: "Sell the auto", e: { c: 25000 }, r: "Cash in hand, one less headache." }
          ] }
      ],
      end: [
        { id: "fleet", t: "Fleet Owner", d: "Two vehicles, a permit and an airport client list. The stand calls you 'muthalali' now.", c: g => has(g, "second") && has(g, "cab") },
        { id: "cabbie", t: "Airport Regular", d: "Your own cab, your own regulars, and an air-conditioned office on wheels.", c: g => has(g, "cab") },
        { id: "own", t: "Own Wheels", d: "The auto is yours. Every rupee you earn now stays with you.", c: g => has(g, "ownauto") },
        { id: "driving", t: "Still Driving", d: "You know every shortcut in {city}. The next step is the bank, not the road." }
      ]
    },
    // 13 ─────────────────────────────────────────────
    {
      id: "teacher", title: "Tuition Master", unit: "Month", tag: "Start a tuition class in {city} with ₹{start}",
      blurb: "Ten students in your front room. Board exams, anxious parents, flashy coaching centres and the joy of a kid finally getting it.",
      cash0: 5000, s0: 30, x0: 15, sl: "Teaching", xl: "Results",
      roles: { m: "your old school teacher, retired but sharp", v: "a coaching centre with LED boards and loud ads", f: "a friend who teaches maths with you", p: "wants you to write the government teacher exam instead" },
      settle(g, k) {
        const students = Math.round(10 + g.x / 3 + g.r / 10 + (has(g, "hall") ? 20 : 0) + (has(g, "online") ? 15 : 0));
        const lines = [["Students", students, "n"], ["Fees", k.m(students * 1200)], ["Rent and books", -k.m(4000)]];
        if (has(g, "hall")) lines.push(["Hall rent", -k.m(9000)]);
        if (has(g, "partner")) lines.push(["Maths teacher's share", -k.m(6000)]);
        g.x = Math.min(100, g.x + 1);
        return lines;
      },
      ev: [
        { id: "tc_fees", w: 3, t: "A student's father lost his job. He asks if his daughter can continue without paying fees for two months.",
          c: [
            { l: "Let her continue for free", e: { c: -2400, r: 8, h: 6 }, r: "She tops the class test. Her father brings a jackfruit the size of a scooter." },
            { l: "Offer half fees", e: { c: -1200, r: 4 }, r: "Fair for both. She keeps coming." },
            { l: "No fees, no classes", e: { r: -6 }, r: "Business is business, but the whole street hears about it." }
          ] },
        { id: "tc_leak", w: 3, min: 2, t: "A student shows you a 'leaked question paper' for the board exam on his phone.",
          c: [
            { l: "Tell him it's probably fake, and report it to the school", e: { r: 6, s: 2 }, r: "It was fake. Spreading it could have got students into trouble. Parents thank you." },
            { l: "Teach from it 'just in case'", shady: true, e: { x: -6, r: -8 }, r: "The real paper is completely different. Your students are rattled." }
          ] },
        { id: "tc_rival", w: 3, who: "v", t: "{v} is offering 'first month free' and stealing your students.",
          c: [
            { l: "Publish your students' improvement (with parents' permission)", e: { x: 4, r: 5 }, r: "Real results, real names. Parents trust it more than LED boards." },
            { l: "Cut your fees", e: { c: -1500, x: 2 }, r: "You keep the students but earn less." },
            { l: "Put up banners with students' photos without asking", shady: true, e: { r: -6, x: 3 }, r: "Two parents complain. Using kids' photos without consent isn't okay." }
          ] },
        { id: "tc_slow", w: 3, t: "One quiet boy keeps failing maths. He's stopped asking questions.",
          c: [
            { l: "Give him free extra classes on Sundays", e: { h: -3, s: 6, r: 4, x: 4 }, r: "Six Sundays later he solves a problem on the board. The class claps. You might cry." },
            { l: "Suggest he joins a lower batch", e: { x: 1 }, r: "Practical. He looks relieved and a bit sad." }
          ] },
        { id: "tc_online", w: 2, min: 2, t: "Parents from Bengaluru and Dubai ask if you can teach online.",
          c: [
            { l: "Start an evening online batch", need: 6000, e: { c: -6000, set: "online", h: -4 }, r: "A cheap mic, a whiteboard and fifteen new students across three time zones." },
            { l: "Stick to offline", e: { h: 2 }, r: "You like seeing the 'aha' face in person." }
          ] },
        { id: "tc_hall", min: 3, w: 4, t: "A small hall above a shop is for rent. More students, but it needs a trade licence and the rent is serious.",
          c: [
            { l: "Rent the hall", paper: "trade", need: 10000, e: { c: -10000, set: "hall", x: 4 }, r: "A real classroom with a real board. You print your first proper banner." },
            { l: "Stay home-based", e: { s: 2 }, r: "Low cost, cosy, limited." }
          ] },
        { id: "tc_partner", w: 2, who: "f", t: "{f} offers to handle maths so you can focus on science and English.",
          c: [
            { l: "Partner up", e: { x: 6, set: "partner", rel: { f: 10 } }, r: "Better results, less stress, shared money." },
            { l: "Do it all yourself", e: { s: 4, h: -5 }, r: "You become very good at maths very fast." }
          ] },
        { id: "tc_results", min: 5, w: 9, t: "Board exam results day. Your phone won't stop buzzing.",
          c: [ { l: "Check the results", ck: { k: "x", d: 50, ok: { e: { r: 10, x: 6, set: "topper" }, r: "Your student is a district topper! The local paper wants a photo." }, no: { e: { r: 2 }, r: "Solid results, no headlines. Parents are happy anyway." } } } ] }
      ],
      end: [
        { id: "institute", t: "The Institute", d: "A hall, two teachers, online batches and a waiting list. Your tuition is a brand now.", c: g => has(g, "hall") && g.x >= 35 },
        { id: "topper", t: "Topper Factory", d: "A district topper from your class. Admissions for next year closed in a week.", c: g => has(g, "topper") },
        { id: "beloved", t: "Everyone's Favourite Teacher", d: "Former students still drop by to say hi. That's the real result.", c: g => g.r >= 50 },
        { id: "small", t: "Small Batch, Big Heart", d: "Not big, but every student who came to you got better." }
      ]
    },
    // 14 ─────────────────────────────────────────────
    {
      id: "kitchen", title: "Cloud Kitchen", unit: "Week", tag: "Cook from home and sell on delivery apps in {city}",
      blurb: "One stove, one sibling on packaging duty and a menu you believe in. Fight the algorithm, the reviews and the big brands.",
      cash0: 4000, s0: 25, x0: 10, sl: "Cooking", xl: "Rating",
      roles: { m: "a retired hotel chef who lives downstairs", v: "a big kitchen brand with ten outlets and giant ad budgets", f: "your sibling, in charge of packaging and complaints", p: "insists their recipe is better than yours" },
      settle(g, k) {
        const perDay = Math.round(20 * (0.6 + g.r / 120) * (0.7 + g.x / 100) * (has(g, "menu2") ? 1.3 : 1) * (has(g, "listed") ? 1 : 0.4));
        const orders = perDay * 7, price = 180;
        const lines = [["Orders this week", orders, "n"], ["Sales", k.m(orders * price)], ["Ingredients and packaging", -k.m(Math.round(orders * price * 0.45))], ["Gas and electricity", -k.m(700)]];
        if (has(g, "listed")) lines.push(["Delivery app commission", -k.m(Math.round(orders * price * (has(g, "ownsite") ? 0.12 : 0.25)))]);
        if (has(g, "kitchen")) lines.push(["Kitchen rent", -k.m(2000)]);
        g.x = Math.min(100, g.x + 1);
        return lines;
      },
      ev: [
        { id: "kt_list", at: 1, w: 9, t: "To list on the delivery apps, you need a food-safety registration. Until then you can only take orders from neighbours.",
          c: [
            { l: "Upload your registration and go live", paper: "food", e: { set: "listed", x: 4 }, r: "You're live on the apps. First order: one chicken biriyani, extra raita, 'please hurry'." },
            { l: "Take neighbour orders for now (get the paper at the Government Office)", e: { c: 300 }, r: "Neighbours love you. The app can wait a little." }
          ] },
        { id: "kt_list2", min: 2, not: "listed", w: 9, t: "Still not on the apps. Your sibling keeps asking when you'll be 'a real kitchen'.",
          c: [
            { l: "Upload your food registration and go live", paper: "food", e: { set: "listed", x: 4 }, r: "Finally live. The orders start slowly, then all at once." },
            { l: "Keep serving the building", e: { r: 2 }, r: "Loyal neighbours, small money." }
          ] },
        { id: "kt_review", w: 3, req: "listed", t: "A one-star review: 'Food was cold. Also, the rider was rude.' Your rating drops.",
          c: [
            { l: "Reply politely and send a free meal", e: { c: -200, r: 5, x: 3 }, r: "They update to four stars and write a whole paragraph about your kindness." },
            { l: "Argue in the reply", e: { r: -6, x: -3 }, r: "The internet sides with the customer. It always does." },
            { l: "Pay for fake five-star reviews", shady: true, e: { c: -800, x: 4, set: "fakereviews" }, r: "Your rating jumps. It feels hollow." }
          ] },
        { id: "kt_fake_bad", min: 4, req: "fakereviews", w: 9, t: "The app's fraud team removed your fake reviews and pushed your kitchen down the search results.",
          c: [ { l: "Start over honestly", e: { x: -10, r: -6, unset: "fakereviews" }, r: "Painful. Real reviews take longer but they stay." } ] },
        { id: "kt_bulk", w: 3, req: "listed", t: "An office wants 150 lunch boxes for Friday. Big money, but you have one stove.",
          c: [
            { l: "Take it and rope in the whole family", e: { c: 4500, h: -8, r: 5 }, r: "Four people, two borrowed stoves, 150 boxes at 12:59. Legendary." },
            { l: "Say yes to 60 boxes only", e: { c: 1800, r: 2 }, r: "Honest about your limits. They come back next month." },
            { l: "Say no", e: { h: 2 }, r: "Your sanity thanks you." }
          ] },
        { id: "kt_chef", w: 2, who: "m", t: "{m} tastes your fish curry and frowns. 'Good. But it could be great.'",
          c: [
            { l: "Ask him to teach you", e: { s: 8, rel: { m: 12 } }, r: "Two Sundays of tough love. Your curry is now the bestseller." },
            { l: "Thank him and change nothing", e: { rel: { m: -4 } }, r: "He shrugs and orders a biriyani from the big brand instead." }
          ] },
        { id: "kt_menu", min: 3, w: 3, req: "listed", t: "Customers keep asking for a breakfast menu: appam, stew, puttu.",
          c: [
            { l: "Add breakfast", e: { set: "menu2", h: -5, x: 3 }, r: "You now wake up at 4:30. Orders grow by a third." },
            { l: "Keep the menu tight", e: { s: 3 }, r: "Fewer dishes, better dishes." }
          ] },
        { id: "kt_rent", min: 4, w: 3, req: "listed", t: "The home kitchen is bursting. A small commercial kitchen is available for rent, and it needs a trade licence.",
          c: [
            { l: "Rent it and launch your own ordering page too", paper: "trade", need: 12000, e: { c: -12000, set: ["kitchen", "ownsite"], x: 5 }, r: "Steel counters, a big fridge, and customers who order from your own page with lower commission." },
            { l: "Stay at home", e: { h: -2 }, r: "Cosy and cramped." }
          ] }
      ],
      end: [
        { id: "brand", t: "Kitchen Brand", d: "A real kitchen, your own ordering page and a rating people screenshot. The big brands noticed.", c: g => has(g, "kitchen") && g.x >= 50 },
        { id: "favourite", t: "The Neighbourhood Favourite", d: "Not the biggest kitchen in {city}, but the one people recommend.", c: g => has(g, "listed") && g.r >= 55 },
        { id: "live", t: "Live on the Apps", d: "You made it onto the apps and kept the stove burning. Next: scale.", c: g => has(g, "listed") },
        { id: "home", t: "Home Cook", d: "Neighbours love your food. Paperwork first, then the world." }
      ]
    },
    // 15 ─────────────────────────────────────────────
    {
      id: "homestay", title: "Homestay Host", unit: "Month", tag: "Turn two rooms of the family house into a homestay",
      blurb: "Tourists, reviews, breakfast at 7, monsoon off-season and a boutique hotel down the lane.",
      cash0: 10000, s0: 20, x0: 20, sl: "Hospitality", xl: "Guest rating",
      roles: { m: "the neighbour who has run a homestay for 25 years", v: "a new boutique hotel down the lane", f: "a friend who runs walking tours", p: "lives downstairs and makes the breakfast" },
      settle(g, k) {
        const monsoon = g.chapter === 3 || g.chapter === 4;
        const rooms = has(g, "rooms4") ? 4 : 2;
        const occ = Math.max(0.05, Math.min(0.95, (0.25 + g.x / 160 + g.r / 300) * (monsoon ? 0.45 : 1) * (has(g, "registered") ? 1 : 0.5)));
        const nights = Math.round(30 * rooms * occ);
        const lines = [["Room nights", nights, "n"], ["Room income", k.m(nights * 1800)], ["Breakfast, laundry, staff", -k.m(4500 + nights * 250)]];
        if (has(g, "listedota")) lines.push(["Booking site commission", -k.m(Math.round(nights * 1800 * 0.18))]);
        if (monsoon) lines.push(["Monsoon", 0, "n"]);
        g.x = Math.min(100, g.x + 1);
        return lines;
      },
      ev: [
        { id: "hs_reg", at: 1, w: 9, t: "To list your homestay with tourism and on booking sites, you need a homestay registration from the Government Office.",
          c: [
            { l: "Show your homestay registration and list everywhere", paper: "homestay", e: { set: ["registered", "listedota"], x: 4 }, r: "Listed! Your first booking is a couple from Germany who 'love spicy'. They don't." },
            { l: "Take walk-in guests for now (get the paper at the Government Office)", e: { c: 1500 }, r: "A backpacker stays two nights. Good start." }
          ] },
        { id: "hs_reg2", min: 2, not: "registered", w: 9, t: "Booking sites keep rejecting your listing without a registration number.",
          c: [
            { l: "Add your registration and go live", paper: "homestay", e: { set: ["registered", "listedota"], x: 4 }, r: "Live at last. Bookings start rolling in." },
            { l: "Keep relying on walk-ins", e: { r: 1 }, r: "Fewer guests, but they're fun." }
          ] },
        { id: "hs_guest", w: 3, t: "A guest complains the Wi-Fi is too slow for his 'very important calls' and demands a 50% refund.",
          c: [
            { l: "Upgrade the router and offer a free dinner", e: { c: -1500, x: 6 }, r: "He leaves a five-star review mentioning the 'legendary fish fry'." },
            { l: "Refund 50%", e: { c: -2000, x: 1 }, r: "He leaves three stars and no comment. Hmm." },
            { l: "Tell him it's a homestay, not an office", e: { x: -5 }, r: "One-star review: 'Rude host.' Ouch." }
          ] },
        { id: "hs_tour", w: 3, who: "f", t: "{f} suggests a package: your stay plus her heritage walking tour and a ferry ride.",
          c: [
            { l: "Launch the package", e: { x: 6, r: 4, rel: { f: 10 } }, r: "Guests love it. Reviews mention 'like staying with family'." },
            { l: "Keep it simple", e: { s: 2 }, r: "Just rooms and breakfast. Fine." }
          ] },
        { id: "hs_cook", w: 2, who: "p", t: "Guests keep asking how {parent} makes the morning appam and stew. {parent} is suddenly a celebrity.",
          c: [
            { l: "Start paid cooking classes with {parent}", e: { c: 3000, x: 5, rel: { p: 12 } }, r: "Twelve tourists in the kitchen, one very proud {parent}." },
            { l: "Just share the recipe for free", e: { x: 3, rel: { p: 4 } }, r: "Guests are charmed. So is {parent}." }
          ] },
        { id: "hs_flood", w: 2, min: 3, t: "Heavy rain floods the lane. Two guests are stuck and a bit scared.",
          c: [
            { l: "Keep them safe, fed and entertained", e: { c: -800, x: 8, r: 5 }, r: "Board games by candlelight. They call it 'the most memorable night of the trip'." },
            { l: "Cancel future bookings for the week", e: { c: -2000, x: 1 }, r: "Safe, but the calendar looks empty." }
          ] },
        { id: "hs_rival", w: 2, who: "v", t: "The boutique hotel {v} is offering your regular guests a 'loyalty discount'.",
          c: [
            { l: "Compete on warmth, not price", e: { x: 4, s: 3 }, r: "Your guests come back. Hotels can't copy {parent}'s appam." },
            { l: "Cut prices", e: { c: -2000, x: 2 }, r: "Full rooms, thin margins." }
          ] },
        { id: "hs_expand", min: 4, req: "registered", w: 4, t: "Renovating the upstairs would give you two more rooms. Cost: ₹45,000.",
          c: [
            { l: "Renovate", need: 45000, e: { c: -45000, set: "rooms4", x: 3 }, r: "Four rooms, fresh paint and a balcony with a backwater view." },
            { l: "Not now", e: { h: 2 }, r: "Two rooms done right is enough for now." }
          ] }
      ],
      end: [
        { id: "superhost", t: "Superhost of {city}", d: "Four rooms, top ratings and guests who send postcards. Your homestay is on travel blogs.", c: g => has(g, "rooms4") && g.x >= 60 },
        { id: "family", t: "Home Away From Home", d: "Guests leave as family. Your reviews read like love letters.", c: g => has(g, "registered") && g.x >= 55 },
        { id: "listed", t: "Open for Guests", d: "Registered, listed and learning. The off-season tested you and you held on.", c: g => has(g, "registered") },
        { id: "walkins", t: "The Walk-In House", d: "A few happy backpackers. With the right papers, this could be much more." }
      ]
    },
    // 16 ─────────────────────────────────────────────
    {
      id: "stylist", title: "Personal Stylist", unit: "Month", tag: "Style brides, grooms and influencers in {city}",
      blurb: "Clients with big dreams and small budgets. Rent smart, shoot fast, and build a look people recognise.",
      cash0: 5000, s0: 25, x0: 10, sl: "Style sense", xl: "Clients",
      roles: { m: "a celebrity stylist who started in a small {city} boutique", v: "a stylist who copies your looks for her own page", f: "your best friend and first model", p: "thinks styling is 'just shopping'" },
      settle(g, k) {
        const clients = Math.round(2 + g.x / 9 + g.r / 25);
        const fee = has(g, "studio") ? 4500 : 2800;
        const lines = [["Clients this month", clients, "n"], ["Styling fees", k.m(clients * fee)], ["Outfits for shoots", -k.m(clients * (has(g, "fxnpartner") ? 400 : 1300))], ["Travel and phone", -k.m(3500)]];
        if (has(g, "studio")) lines.push(["Studio rent", -k.m(8000)]);
        g.x = Math.min(100, g.x + 1);
        return lines;
      },
      ev: [
        { id: "sy_bride", w: 3, t: "A bride wants a designer lehenga for her reception. Her budget covers about a tenth of the price.",
          c: [
            { l: "Rent a stunning lehenga from FXN and style it", e: { x: 8, r: 5 }, r: "She looks like a magazine cover and spent less than her makeup budget. Her cousins all want your number." },
            { l: "Tell her to increase the budget", e: { x: -3 }, r: "She finds another stylist. Budget clients talk too." }
          ] },
        { id: "sy_fxn", w: 3, min: 2, t: "FXN Rentals offers stylists a partner discount on every rental for shoots.",
          c: [
            { l: "Sign up as an FXN partner", e: { set: "fxnpartner", x: 3 }, r: "Your outfit costs drop by two thirds. Your options grow tenfold." },
            { l: "Keep buying outfits", e: { s: 2 }, r: "Your wardrobe grows. Your bank balance doesn't." }
          ] },
        { id: "sy_copy", w: 3, who: "v", t: "{v} posted a look you created last week, calling it 'her concept'.",
          c: [
            { l: "Post your behind-the-scenes with dates", e: { x: 6, r: 4, rel: { v: -6 } }, r: "Receipts posted. Your followers do the rest." },
            { l: "Ignore it and create something better", e: { s: 5 }, r: "Your next look is so good she can't copy it in time." },
            { l: "Start a public fight", e: { r: -4, x: 2, h: -5 }, r: "Drama gets views. It also gets exhausting." }
          ] },
        { id: "sy_confidence", w: 3, t: "A client keeps apologising for her body during the fitting.",
          c: [
            { l: "Change the plan to what makes her feel great, not 'slimmer'", e: { r: 8, s: 4, h: 4 }, r: "She walks out standing taller. Her review says 'first time I liked my photos'." },
            { l: "Stick to the plan", e: { x: 1 }, r: "The photos are fine. She seems quiet." }
          ] },
        { id: "sy_exposure", w: 2, t: "An influencer wants you to style her for free 'for exposure'.",
          c: [
            { l: "Offer a paid package with credit", e: { c: 2000, r: 2 }, r: "She pays. Professionals respect professionals." },
            { l: "Do it for free", e: { x: 4, c: -800 }, r: "She tags you once, in tiny letters." },
            { l: "Decline", e: { h: 2 }, r: "Exposure doesn't pay rent." }
          ] },
        { id: "sy_late", w: 2, who: "f", t: "Two hours before a shoot, the outfit hasn't arrived and {f} is already in makeup.",
          c: [
            { l: "Order an FXN rental with fast delivery", e: { c: -500, x: 3, rel: { f: 6 } }, r: "The rider arrives in 30 minutes. The shoot starts on time." },
            { l: "Improvise with what's in your bag", ck: { k: "s", d: 40, ok: { e: { x: 6 }, r: "A dupatta, a belt and a prayer. It becomes your most saved look." }, no: { e: { x: -3 }, r: "It looks improvised. Because it is." } } }
          ] },
        { id: "sy_studio", min: 4, w: 4, t: "A small studio space with mirrors and lights is for rent. Clients pay more in a real studio, and it needs a trade licence.",
          c: [
            { l: "Rent the studio", paper: "trade", need: 15000, e: { c: -15000, set: "studio", x: 5 }, r: "Ring lights, a rail of outfits and your name on the door." },
            { l: "Keep working on-location", e: { s: 2 }, r: "Flexible and cheap." }
          ] },
        { id: "sy_mentor", w: 2, who: "m", t: "{m} invites you to assist at a big film promotion shoot. Unpaid, but huge learning.",
          c: [
            { l: "Assist and watch everything", e: { s: 8, h: -3, rel: { m: 10 } }, r: "You learn how a ₹10 lakh shoot really works. Mostly, it's safety pins." },
            { l: "Skip it, you have paying clients", e: { c: 2000, rel: { m: -3 } }, r: "Money in the bank, a door slightly closed." }
          ] }
      ],
      end: [
        { id: "studio", t: "Studio Stylist", d: "Your own studio and a waiting list. Brides book you before the venue.", c: g => has(g, "studio") && g.x >= 45 },
        { id: "known", t: "The Look Everyone Copies", d: "Your style is recognisable now, and people pay for that.", c: g => g.x >= 35 },
        { id: "smart", t: "Smart Stylist", d: "You learned to deliver big looks on small budgets. That's rare.", c: g => has(g, "fxnpartner") },
        { id: "starting", t: "Rails and Dreams", d: "A few happy clients and a phone full of looks. The next step is a studio." }
      ]
    },
    // 17 ─────────────────────────────────────────────
    {
      id: "band", title: "Indie Musician", unit: "Month", tag: "Start a band in {city} with ₹{start}",
      blurb: "Original songs, cover gigs that pay the bills, a drummer who's always late and the dream of one big festival.",
      cash0: 3000, s0: 25, x0: 8, sl: "Music", xl: "Fans", fmt: "followers",
      roles: { m: "a sound engineer who has heard every band in the state", v: "a cover band that grabs all the paid gigs", f: "your drummer and best friend", p: "asks when you'll get a 'real job'" },
      settle(g, k) {
        const gigs = 1 + Math.floor(g.x / 20) + (has(g, "covers") ? 2 : 0);
        const lines = [["Gigs", gigs, "n"], ["Gig fees", k.m(gigs * 4500)], ["Streaming", k.m(Math.round(Math.pow(1.1, g.x) * 2))], ["Rehearsal room and rent", -k.m(4500)]];
        if (has(g, "gear")) lines.push(["Better sound, better bookings", k.m(1500)]);
        g.x = Math.min(100, g.x + 2);
        return lines;
      },
      ev: [
        { id: "mu_covers", w: 3, who: "v", t: "A pub wants a covers night every Friday. Good money, but no originals allowed.",
          c: [
            { l: "Play covers on Fridays, originals on weekends", e: { set: "covers", h: -3 }, r: "Fridays pay rent. Weekends feed your soul." },
            { l: "Originals only", e: { s: 4, x: 2 }, r: "Poorer, prouder." }
          ] },
        { id: "mu_label", w: 3, min: 2, t: "A 'label' offers to release your album. The contract gives them all rights to your songs forever.",
          c: [
            { l: "Get the contract checked and negotiate", e: { s: 4, r: 3 }, r: "They remove the 'forever' clause. Then they disappear. Still a lesson." },
            { l: "Sign it", e: { x: 6, set: "badcontract" }, r: "Your album is out! You'll find out what 'all rights' means later." },
            { l: "Release independently", e: { c: -1500, x: 4 }, r: "Your songs, your rules, your tiny budget." }
          ] },
        { id: "mu_contract_bad", min: 4, req: "badcontract", w: 9, t: "Your song goes viral in an ad. The label gets all the money. You get nothing.",
          c: [ { l: "Learn from it and write new songs", e: { h: -10, s: 3, unset: "badcontract" }, r: "Painful. Never sign without reading the whole thing." } ] },
        { id: "mu_wedding", w: 3, t: "A wealthy family wants your band for a wedding sangeet. They want three hours of film songs.",
          c: [
            { l: "Take it", e: { c: 8000, h: -2 }, r: "Three hours, 47 film songs, one dancing grandmother. Great money." },
            { l: "Take it, and sneak in one original", ck: { k: "s", d: 40, ok: { e: { c: 8000, x: 6 }, r: "The whole hall dances to your song. Three guests follow you that night." }, no: { e: { c: 6000 }, r: "Polite clapping, then back to film songs. The fee gets 'adjusted'." } } },
            { l: "Say no", e: { s: 2 }, r: "Artistic integrity: intact. Wallet: empty." }
          ] },
        { id: "mu_drummer", w: 2, who: "f", t: "{f} got a job offer in Bengaluru and might leave the band.",
          c: [
            { l: "Tell him to take it, and plan remote recordings", e: { rel: { f: 10 }, x: -2 }, r: "He cries a little, you cry a little, the band survives on weekends." },
            { l: "Beg him to stay", e: { rel: { f: -4 }, h: -4 }, r: "He stays, but he's not happy." }
          ] },
        { id: "mu_gear", w: 2, min: 2, t: "Your amp crackles at every gig. A good second-hand one costs ₹18,000.",
          c: [
            { l: "Buy the amp", need: 18000, e: { c: -18000, set: "gear", x: 3 }, r: "Clean sound. Organisers start calling you back." },
            { l: "Tape it and pray", e: { x: -2 }, r: "It crackles during the quietest song. Of course." }
          ] },
        { id: "mu_engineer", w: 2, who: "m", t: "{m} offers to record your best song properly, after hours, for the cost of food.",
          c: [
            { l: "Record with him", e: { s: 6, x: 6, c: -800, rel: { m: 12 } }, r: "The recording sounds like a real record. Because it is." },
            { l: "Record on your phone", e: { x: 2 }, r: "Raw. Some people like raw." }
          ] },
        { id: "mu_fest", min: 4, w: 9, t: "A big music festival is taking applications from new bands.",
          c: [ { l: "Send your best recording", ck: { k: "x", d: 45, ok: { e: { x: 15, r: 8, set: "festival" }, r: "You're on the lineup! Sunset slot, second stage. You don't sleep for a week." }, no: { e: { h: -4 }, r: "Not this year. The rejection email is very polite." } } } ] }
      ],
      end: [
        { id: "festival", t: "Festival Band", d: "A sunset slot at a real festival and fans who sing your lyrics back. This is the dream.", c: g => has(g, "festival") },
        { id: "working", t: "Working Musicians", d: "Gigs every week and a growing fanbase. You pay rent with music. That's rare.", c: g => g.x >= 35 && g.cash > 0 },
        { id: "cult", t: "Cult Following", d: "Not famous, but the people who know your songs really know them.", c: g => g.r >= 50 },
        { id: "garage", t: "Garage Days", d: "The band is still together and the songs are getting better. Keep going." }
      ]
    },
    // 18 ─────────────────────────────────────────────
    {
      id: "planner", title: "Wedding Planner", unit: "Month", tag: "Plan weddings in {city} with ₹{start}",
      blurb: "Caterers who cancel, monsoon forecasts, uncles with opinions and brides who want 'simple but grand'.",
      cash0: 8000, s0: 20, x0: 10, sl: "Planning", xl: "Weddings done",
      roles: { m: "an aunty who has planned 300 weddings and knows every caterer", v: "a big events company with glossy brochures", f: "your decorator friend", p: "volunteers you to plan every family function for free" },
      settle(g, k) {
        const events = 1 + Math.floor(g.x / 25) + (has(g, "team") ? 1 : 0);
        const margin = has(g, "destination") ? 22000 : 14000;
        const lines = [["Weddings this month", events, "n"], ["Planning fees and margins", k.m(events * margin)], ["Office, phone and travel", -k.m(6000)]];
        if (has(g, "team")) lines.push(["Team salaries", -k.m(12000)]);
        g.x = Math.min(100, g.x + 3);
        return lines;
      },
      ev: [
        { id: "wp_dowry", w: 3, t: "During planning, the groom's family hints that a 'car and some gold' are expected from the bride's side.",
          c: [
            { l: "Tell both families clearly you won't plan a wedding with dowry", e: { r: 8, x: -1 }, r: "Awkward silence. Then the groom says he agrees with you. The wedding goes ahead, without demands. Dowry is illegal in India." },
            { l: "Stay out of it, it's their business", e: { h: -4 }, r: "You plan the wedding. It doesn't sit right with you." }
          ] },
        { id: "wp_rain", w: 3, t: "The wedding is outdoors by the backwaters. The forecast says heavy rain on the day.",
          c: [
            { l: "Book a waterproof canopy as backup", e: { c: -4000, x: 6, r: 4 }, r: "It pours at 6 pm. Your canopy goes up in nine minutes. The bride's father hugs you." },
            { l: "Trust the weather", ck: { k: "s", d: 50, ok: { e: { x: 4 }, r: "The rain holds off. You age five years anyway." }, no: { e: { x: -8, r: -6 }, r: "Soggy sadya. The photos are... memorable." } } }
          ] },
        { id: "wp_outfit", w: 3, t: "Morning of the reception: the bride's outfit from the tailor doesn't fit. Panic.",
          c: [
            { l: "Rent a reception outfit from FXN with express delivery", e: { c: -600, x: 6, r: 3 }, r: "Delivered in 40 minutes, fits perfectly. The bride says it's better than the original." },
            { l: "Rush the tailor to alter it", ck: { k: "s", d: 45, ok: { e: { x: 3 }, r: "Fixed with 10 minutes to spare." }, no: { e: { x: -6, r: -3 }, r: "Safety pins. Many safety pins." } } }
          ] },
        { id: "wp_caterer", w: 3, who: "m", t: "The caterer cancels four days before a 500-guest wedding.",
          c: [
            { l: "Call {m}", e: { rel: { m: 8 }, x: 4 }, r: "One phone call. {m} knows a caterer who owes her a favour. Crisis over." },
            { l: "Pay double to a premium caterer", e: { c: -9000, x: 3 }, r: "Expensive, but nobody goes hungry." }
          ] },
        { id: "wp_kickback", w: 2, t: "A decorator offers you a 'commission' if you push his services to every client, even at inflated prices.",
          c: [
            { l: "Refuse and quote fair prices", e: { r: 6 }, r: "Clients trust your quotes. That's your real business." },
            { l: "Take the commission", shady: true, e: { c: 5000, r: -6 }, r: "Easy money. A client finds the real price online and posts about it." }
          ] },
        { id: "wp_family", w: 2, who: "p", t: "{parent} has volunteered you to plan a cousin's engagement. For free. This weekend.",
          c: [
            { l: "Do it, and use it as a portfolio shoot", e: { x: 4, rel: { p: 10 }, h: -3 }, r: "Free work, but great photos and three new leads from relatives." },
            { l: "Politely say you're booked", e: { rel: { p: -8 } }, r: "{parent} sulks for a week." }
          ] },
        { id: "wp_team", min: 3, w: 4, t: "You're turning down weddings. You could hire a small team, and a proper company needs a trade licence.",
          c: [
            { l: "Hire a team of three", paper: "trade", e: { set: "team", x: 4 }, r: "More weddings, less sleep for you, more salaries to pay." },
            { l: "Stay solo and pick the best clients", e: { s: 4 }, r: "Fewer weddings, higher quality." }
          ] },
        { id: "wp_destination", min: 4, w: 4, t: "A family from Delhi wants a three-day destination wedding on a backwater resort in {city}.",
          c: [
            { l: "Take it on", ck: { k: "s", d: 45, ok: { e: { c: 20000, x: 10, set: "destination" }, r: "Houseboats, sunset vows, a Punjabi DJ in Kerala. It goes viral among planners." }, no: { e: { c: 6000, x: 2, h: -8 }, r: "It happens, barely. You'll never forget the houseboat that went the wrong way." } } },
            { l: "Pass, too big for now", e: { h: 2 }, r: "Know your limits. For now." }
          ] }
      ],
      end: [
        { id: "destination", t: "Destination Wedding Pro", d: "Families fly in from across India to get married with you planning it.", c: g => has(g, "destination") && g.x >= 50 },
        { id: "company", t: "A Real Events Company", d: "A team, a licence and a calendar booked six months out.", c: g => has(g, "team") },
        { id: "trusted", t: "The Planner Aunties Trust", d: "Honest quotes and calm under pressure. Referrals keep coming.", c: g => g.r >= 48 },
        { id: "learning", t: "Weddings and Lessons", d: "Every wedding taught you something. Mostly about rain." }
      ]
    },
    // 19 ─────────────────────────────────────────────
    {
      id: "seafood", title: "Boat to Export", unit: "Month", tag: "Fish from {city} harbour and build a seafood business",
      blurb: "Start on your uncle's boat. Read the sea, survive the monsoon ban, beat the middleman and reach the exporters.",
      cash0: 6000, s0: 25, x0: 10, sl: "Sea sense", xl: "Buyers",
      roles: { m: "an old fisherman who reads the sea like a newspaper", v: "a middleman who controls harbour prices", f: "your cousin on the boat", p: "prays every time you go out to sea" },
      settle(g, k) {
        const ban = g.chapter === 3;
        const catchKg = ban ? 0 : Math.round(900 * (0.6 + g.s / 100) * (has(g, "ownboat") ? 1.4 : 1));
        const price = has(g, "export") ? 260 : has(g, "coldstore") ? 190 : has(g, "direct") ? 160 : 120;
        const lines = [["Catch (kg)", catchKg, "n"], ["Sales", k.m(catchKg * price / 4)], ["Diesel, ice and crew share", -k.m(Math.round(catchKg * price / 4 * 0.45) + 3000)]];
        if (ban) lines.push(["Monsoon fishing ban: net repair work", k.m(4000)]);
        if (has(g, "coldstore")) lines.push(["Cold storage rent", -k.m(5000)]);
        g.x = Math.min(100, g.x + 1);
        return lines;
      },
      ev: [
        { id: "sf_storm", w: 3, who: "m", t: "The weather warning says rough seas, but the fish are running. {m} looks at the sky and says nothing.",
          c: [
            { l: "Stay ashore. Respect the warning.", e: { h: 2, rel: { m: 8, p: 6 } }, r: "Two boats that went out had to be rescued. {m} pats your back." },
            { l: "Go out anyway", ck: { k: "s", d: 55, ok: { e: { c: 3000, h: -6 }, r: "Big catch, terrifying trip. Never again. Probably." }, no: { e: { c: -5000, h: -12, rel: { p: -6 } }, r: "Torn nets, a broken engine and a very long night. You're lucky to be back." } } }
          ] },
        { id: "sf_middle", w: 3, who: "v", t: "{v} pays you half what hotels pay for the same fish. 'Sell to me or take it home and eat it.'",
          c: [
            { l: "Start selling directly to restaurants", e: { set: "direct", x: 6, rel: { v: -10 } }, r: "More calls, more running around, much better prices." },
            { l: "Keep selling to him", e: { h: -3 }, r: "Easy and fast, and you earn less every time." }
          ] },
        { id: "sf_ban", at: 3, w: 9, t: "The monsoon fishing ban starts: 52 days with no trawling so fish can breed. The harbour goes quiet.",
          c: [
            { l: "Repair nets and service the engine", e: { s: 4, h: 3 }, r: "Boring but useful. The boat will be ready the day the ban lifts." },
            { l: "Learn the export side: grading, packing and paperwork", e: { s: 6, x: 3 }, r: "You spend two weeks at a processing unit. A whole new world." },
            { l: "Sneak out at night anyway", shady: true, e: { c: 2000, r: -10 }, r: "The coastal police catch two boats. Yours escaped this time. Others noticed." }
          ] },
        { id: "sf_cold", min: 2, w: 4, t: "A cold storage unit near the harbour has space. Fish that stays fresh sells for more.",
          c: [
            { l: "Rent space (needs food-safety registration)", paper: "food", e: { set: "coldstore", x: 4 }, r: "No more selling in a hurry at bad prices." },
            { l: "Not yet", e: { s: 1 }, r: "Ice boxes it is." }
          ] },
        { id: "sf_boat", min: 3, w: 4, t: "An old boat is for sale. With your own boat you keep a bigger share.",
          c: [
            { l: "Buy it with savings", need: 35000, e: { c: -35000, set: "ownboat", x: 3 }, r: "She needs paint and a name. You call her 'Amma's Prayer'." },
            { l: "Keep working on your uncle's boat", e: { rel: { f: 4 } }, r: "Family boat, family rules." }
          ] },
        { id: "sf_export", min: 4, w: 4, req: "coldstore", t: "An exporter wants regular supply of graded prawns. You need an export registration.",
          c: [
            { l: "Sign the supply deal", paper: "export", e: { set: "export", x: 10, r: 5 }, r: "Your prawns are going to Japan. Your cousin can't stop telling people." },
            { l: "Stay local", e: { s: 2 }, r: "Simpler, smaller." }
          ] },
        { id: "sf_plastic", w: 2, who: "f", t: "Your nets keep bringing up plastic. {f} suggests joining the harbour's clean-sea drive and bringing the plastic ashore.",
          c: [
            { l: "Join the drive", e: { r: 8, h: 4, rel: { f: 8 } }, r: "The local paper covers it. Restaurants want to buy from 'the clean-sea fishermen'." },
            { l: "Throw it back", e: { r: -2 }, r: "Easier. The sea gives it back next week." }
          ] },
        { id: "sf_hotel", w: 2, req: "direct", t: "A hotel chain wants daily fresh fish but pays only after 60 days.",
          c: [
            { l: "Accept, but ask for 30-day payment", ck: { k: "r", d: 45, ok: { e: { x: 8, c: 2000 }, r: "They agree to 30 days. A steady buyer at last." }, no: { e: { x: 4, c: -2000 }, r: "They insist on 60. Your cash gets tight for a month." } } },
            { l: "Decline", e: { s: 1 }, r: "Cash today beats promises." }
          ] }
      ],
      end: [
        { id: "exporter", t: "Harbour to the World", d: "Graded, packed and shipped. Your catch now crosses oceans.", c: g => has(g, "export") },
        { id: "owner", t: "Boat Owner", d: "Your own boat, your own buyers and a seat at the harbour association.", c: g => has(g, "ownboat") && g.cash >= 0 },
        { id: "direct", t: "No More Middleman", d: "You sell straight to restaurants. Fair prices for good fish.", c: g => has(g, "direct") },
        { id: "sea", t: "Child of the Sea", d: "You know the sea now. Next step: the buyers." }
      ]
    },
    // 20 ─────────────────────────────────────────────
    {
      id: "gulf", title: "Gulf Returnee", unit: "Month", tag: "Back from Dubai with ₹{start} in savings",
      blurb: "Eight years abroad, savings in the bank and every relative with a 'business idea'. Build something that lasts.",
      cash0: 100000, s0: 30, x0: 5, sl: "Business sense", xl: "Venture",
      roles: { m: "an uncle who came back 15 years ago and runs a supermarket", v: "a relative who keeps asking for 'small loans'", f: "your old school friend", p: "wants you to build the biggest house in the area first" },
      settle(g, k) {
        const lines = [["Family expenses", -k.m(7000)]];
        if (has(g, "shop")) lines.push(["Shop profit", k.m(Math.round(9000 + g.x * 250))]);
        if (has(g, "cafe")) lines.push(["Café profit", k.m(Math.round(7000 + g.x * 300))]);
        if (has(g, "rentalincome")) lines.push(["Rent from the shop space", k.m(6000)]);
        if (has(g, "fd")) lines.push(["Fixed deposit interest", k.m(1500)]);
        if (has(g, "shop") || has(g, "cafe")) g.x = Math.min(100, g.x + 4);
        return lines;
      },
      ev: [
        { id: "gf_loans", w: 3, who: "v", t: "{v} needs a 'small loan' of ₹25,000 for 'an urgent business opportunity'. Third time this year.",
          c: [
            { l: "Say no kindly but firmly", e: { rel: { v: -10 }, s: 3 }, r: "Awkward family lunch. Your savings survive." },
            { l: "Give the loan", e: { c: -25000, rel: { v: 10 } }, r: "The 'opportunity' was a new phone. You'll never see that money again." },
            { l: "Offer him a job at your venture instead", req: "shop", e: { rel: { v: 6 }, x: 2 }, r: "Surprisingly, he's great at billing." }
          ] },
        { id: "gf_house", w: 3, who: "p", t: "{parent} wants a two-storey house with pillars 'like the neighbours'. It would eat most of your savings.",
          c: [
            { l: "Fix up the current house modestly and invest the rest", e: { c: -8000, s: 4, rel: { p: -4 } }, r: "No pillars, but you can still afford to start a business." },
            { l: "Build the big house", e: { c: -45000, h: 6, rel: { p: 15 }, set: "bighouse" }, r: "Magnificent. Also very expensive to paint." }
          ] },
        { id: "gf_mlm", w: 3, t: "An old classmate invites you to a 'business seminar'. It's a chain-marketing scheme: recruit 6 people and get rich.",
          c: [
            { l: "Leave after the free tea", e: { s: 4, h: 2 }, r: "Schemes that pay you to recruit people, not to sell products, are how savings disappear." },
            { l: "Invest ₹20,000 to join", e: { c: -20000, h: -8, set: "scammed" }, r: "You recruit nobody. The 'starter kit' is 40 bottles of shampoo." }
          ] },
        { id: "gf_scheme", w: 3, min: 1, who: "m", t: "{m} says the state has a loan scheme for returnees starting businesses, with lower interest. You'd need a trade licence and a plan.",
          c: [
            { l: "Open a small supermarket", paper: "trade", need: 30000, e: { c: -30000, set: "shop", x: 10 }, r: "Shelves, a billing counter and one very proud {parent} at the opening." },
            { l: "Open a café near the college", paper: "trade", need: 30000, e: { c: -30000, set: "cafe", x: 10 }, r: "Fairy lights, cold coffee and students who stay for four hours on one drink." },
            { l: "Put the money in a fixed deposit and think", e: { c: -20000, set: "fd" }, r: "Safe and slow. You'll have time to decide." }
          ] },
        { id: "gf_scheme2", min: 3, w: 4, not: "shop", t: "A shop space in the busy junction is available. Others are already interested.",
          c: [
            { l: "Open a supermarket there", paper: "trade", need: 30000, e: { c: -30000, set: "shop", x: 8 }, r: "You open in time for the festival rush." },
            { l: "Rent it out to someone else", need: 20000, e: { c: -20000, set: "rentalincome" }, r: "Steady rent, zero stress." },
            { l: "Pass", e: { h: 1 }, r: "Maybe the next one." }
          ] },
        { id: "gf_back", w: 2, min: 2, t: "Your old employer in Dubai calls with an offer: come back, 30% more salary.",
          c: [
            { l: "Stay. You came home for a reason.", e: { h: 6, rel: { p: 8 } }, r: "{parent} makes your favourite fish curry three days in a row." },
            { l: "Think about it for a week", e: { h: -4 }, r: "You don't sleep well. Choices are heavy." }
          ] },
        { id: "gf_digital", w: 2, who: "f", t: "{f} says your venture needs online orders and a delivery option.",
          c: [
            { l: "Set it up", e: { c: -3000, x: 6, rel: { f: 6 } }, r: "WhatsApp orders, a delivery boy and a 30% jump in sales." },
            { l: "Customers can walk in", e: { s: 1 }, r: "Old-school. The youngsters go elsewhere." }
          ] },
        { id: "gf_help", w: 2, t: "A young man from your area wants to go to the Gulf and asks your honest advice.",
          c: [
            { l: "Tell him everything: the good, the lonely, the visa scams", e: { r: 6, h: 4 }, r: "He decides to apply through a registered agency only. His mother calls to thank you." },
            { l: "Tell him it's all great", e: { r: -2 }, r: "He'll find out the rest himself." }
          ] }
      ],
      end: [
        { id: "founder", t: "Home and Thriving", d: "The venture runs, the family is proud and nobody asks when you're going back.", c: g => (has(g, "shop") || has(g, "cafe")) && g.x >= 40 },
        { id: "business", t: "Started Something", d: "Your shop is open. It's harder than Dubai, but it's yours.", c: g => has(g, "shop") || has(g, "cafe") },
        { id: "careful", t: "Careful With the Savings", d: "You protected what you earned. That's harder than it sounds.", c: g => g.cash >= g.startCash * 0.6 },
        { id: "spent", t: "Where Did It All Go?", d: "Houses, loans, schemes. The Gulf money went fast. Lesson learned." }
      ]
    }
  ]);
})();
