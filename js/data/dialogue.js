// Character speech in 7 languages. Story text and choices stay in English.
// Each non-English line is [what the character says, English subtitle].
// Roles: m mentor, v rival, f friend, p parent. Moods: warm, neutral, cold.
// {name} = player name, {city} = city, {tip} = life tip (English), {local} = city fact (English).
// Native speakers: fix any line right here; no code changes needed.
window.AE_DIALOGUE = {
  langs: { auto: "Auto (each state's language)", en: "English", ml: "Malayalam", hi: "Hindi", mr: "Marathi", pa: "Punjabi", bn: "Bengali", kn: "Kannada" },
  stateLang: { KL: "ml", MH: "mr", PB: "pa", WB: "bn", RJ: "hi", KA: "kn" },
  packs: {
    en: {
      react: {
        m: { warm: ["Not bad, {name}. I'd hire you. Don't tell anyone I said that.", "You're learning faster than my nephew. Low bar, but still."],
             neutral: ["Hmm. Ask me again in a week.", "Every choice has a price. Some are just on EMI."],
             cold: ["I've seen better decisions from a pigeon.", "Don't come crying to me. Okay, come, but bring snacks."] },
        v: { warm: ["Fine. That was smart. I'm only a little jealous.", "Truce? Until tomorrow morning, at least."],
             neutral: ["Cute move. Let's see if it survives Monday.", "I'm watching you, {name}. Mostly out of boredom."],
             cold: ["Enjoy it while it lasts. Which is till Thursday.", "This town isn't big enough for both of us. Or my ego."] },
        f: { warm: ["Proud of you! Treat is on you, obviously.", "Legend behaviour. Screenshot this moment."],
             neutral: ["Okay... I'll pretend I understand your plan.", "Bold. Very bold. Possibly dumb. We'll see."],
             cold: ["Who are you, and where's my friend?", "Call me when you remember I exist."] },
        p: { warm: ["I posted it in the family group. 47 thumbs up already.", "So proud! Now eat something, please."],
             neutral: ["Fine, fine. Did you eat?", "The neighbour's son got promoted again. Just saying."],
             cold: ["I'm not angry. I'm just forwarding you three motivational videos.", "At your age I had no phone and no problems."] }
      },
      howru: {
        m: { warm: "Busy, but your progress is the best part of my day.", neutral: "Same as always. Work doesn't take holidays.", cold: "Fine. Need something, or just wasting my time?" },
        v: { warm: "Honestly? Competing with you keeps me sharp.", neutral: "Great. Better than you, obviously.", cold: "Why? Planning to copy my life too?" },
        f: { warm: "Better now! Chai later? You're paying.", neutral: "Surviving on hope and Maggi.", cold: "Oh, now you remember my number?" },
        p: { warm: "All good! Your photo is my phone wallpaper now.", neutral: "Same. Your father fixed the fan. It still makes noise.", cold: "We'd know how you are if you called." }
      },
      opinion: {
        m: { warm: "You remind me of me at your age. It's a compliment, don't waste it.", neutral: "Potential, yes. Results... still loading.", cold: "Honestly? One more bad week and you get a lecture." },
        v: { warm: "You're the only one here I respect. Don't let it go to your head.", neutral: "You're competition. Nothing personal. Okay, a little personal.", cold: "You're in my way. Politely, please move." },
        f: { warm: "My favourite person in {city}. Don't tell my other friends.", neutral: "You're okay. 7/10. Would hang out again.", cold: "Still deciding. It's not looking good." },
        p: { warm: "You're my pride. Also my retirement plan. No pressure.", neutral: "You're my child. I'll worry even when you're 60.", cold: "I want the old you back. The one who called on Sundays." }
      },
      advice: { m: "Free gyaan: {tip}", v: "Fine, one tip, then we're enemies again: {tip}", f: "Friend advice: {tip} Also, sleep.", p: "Listen to your elders: {tip} And wear a sweater." },
      adviceCold: "Earn my advice first.",
      city: { m: "Listen: {local}", v: "{local} Not sure you'll survive it.", f: "{local} Best part? Me.", p: "{local} Just come home for festivals." },
      cityCold: "Google it."
    },

    ml: {
      react: {
        m: { warm: [["Kollaam {name}, ninne njan joliku edukkum. Aarodum parayanda.", "Not bad, {name}. I'd hire you. Don't tell anyone."], ["Ente aniyante makanekkal speedil padikkunnundu. Athu valiya karyam alla, ennaalum.", "Faster than my nephew. Low bar, but still."]],
             neutral: [["Hmm. Oru aazhcha kazhinju chodikku.", "Hmm. Ask me again in a week."], ["Ella decisionum oru vila undu. Chilathu EMI-il aanu.", "Every decision has a price. Some are on EMI."]],
             cold: [["Ithilum nalla decision oru pravu edukkum.", "A pigeon makes better decisions than this."], ["Karanju varanda. Okay vaa, pakshe pazhampori kondu vaa.", "Don't come crying. Okay, come, but bring pazhampori."]] },
        v: { warm: [["Sheri, athu smart aayirunnu. Enikku kurachu asooya undu.", "Fine, that was smart. I'm a little jealous."], ["Truce? Naale raavile vare maathram.", "Truce? Only till tomorrow morning."]],
             neutral: [["Nalla move. Monday vare nilkkumo ennu nokkaam.", "Nice move. Let's see if it lasts till Monday."], ["Njan ninne nokkunnundu, {name}. Vere pani illaathathu kondaanu.", "I'm watching you, {name}. Only because I'm free."]],
             cold: [["Aaswadhicho. Vyazhazhcha vare.", "Enjoy it. Till Thursday."], ["Ee naattil nammal randuperkkum sthalam illa. Ente egokku polum illa.", "No room here for both of us. Not even for my ego."]] },
        f: { warm: [["Machane, polichu! Treat ninte vaka, ofcourse.", "Bro, you nailed it! Treat's on you, of course."], ["Legend! Ee nimisham screenshot edukkanam.", "Legend! Screenshot this moment."]],
             neutral: [["Okay... ninte plan manassilaayi ennu njan abhinayikkaam.", "Okay... I'll pretend I understood your plan."], ["Dhairyam aanu. Mandatharam aakam. Nokkaam.", "Brave. Could be stupid. Let's see."]],
             cold: [["Nee aaraa? Ente friend evide?", "Who are you? Where's my friend?"], ["Njan jeevichirippundennu orma varumbol vilikku.", "Call me when you remember I'm alive."]] },
        p: { warm: [["Family groupil ittu. 47 thumbs up already!", "Posted in the family group. 47 thumbs up already!"], ["Ente ponne, abhimaanam! Ini enthenkilum kazhikku.", "My dear, so proud! Now eat something."]],
             neutral: [["Sheri sheri. Nee kazhicho?", "Okay okay. Did you eat?"], ["Appurathe veettile payyanu pinnem promotion kitti. Veruthe paranjathaa.", "The neighbour's boy got promoted again. Just saying."]],
             cold: [["Enikku deshyam onnum illa. Moonnu motivation video ayakkunnu, athre ullu.", "I'm not angry. Just sending three motivation videos."], ["Ninte praayathil enikku phone illa, problemsum illa.", "At your age I had no phone and no problems."]] }
      },
      howru: {
        m: { warm: ["Thirakkaanu, pakshe ninte progress kaanunnathaanu ente divasathile best part.", "Busy, but your progress is the best part of my day."], neutral: ["Pathivu pole. Jolikku avadhi illallo.", "Same as always. Work has no holidays."], cold: ["Sukham. Enthenkilum venamo, atho samayam kalayaano?", "Fine. Need something, or just wasting time?"] },
        v: { warm: ["Sathyam paranjaal? Ninnodu matsarikkunnathu enne sharp aakkunnu.", "Honestly? Competing with you keeps me sharp."], neutral: ["Adipoli. Ninnekkaal better, obviously.", "Great. Better than you, obviously."], cold: ["Enthina? Ente lifeum copy adikkaano?", "Why? Planning to copy my life too?"] },
        f: { warm: ["Ippo sheri aayi! Chaya kudikkaam? Kaasu nee.", "Better now! Tea? You're paying."], neutral: ["Pratheekshayum Maggiyum kondu jeevikkunnu.", "Surviving on hope and Maggi."], cold: ["Oh, ippo ente number orma vanno?", "Oh, now you remember my number?"] },
        p: { warm: ["Ellaam sukham! Ninte photo aanu ippo ente phone wallpaper.", "All good! Your photo is my phone wallpaper now."], neutral: ["Pathivu pole. Achan fan nannakki. Ippozhum shabdham undu.", "Same. Your father fixed the fan. It still makes noise."], cold: ["Nee vilichaal ariyaamaayirunnu.", "We'd know if you called."] }
      },
      opinion: {
        m: { warm: ["Ninne kaanumbol ente cheruppam orma varum. Athu compliment aanu, kalayaruthu.", "You remind me of my younger self. It's a compliment, don't waste it."], neutral: ["Kazhivu undu. Result... loading aanu.", "Potential, yes. Results... loading."], cold: ["Sathyam? Oru mosham aazhcha koodi, pinne lecture.", "Honestly? One more bad week and you get a lecture."] },
        v: { warm: ["Ivide njan respect cheyyunna ore aal nee aanu. Thalakku pidikkanda.", "You're the only one here I respect. Don't let it go to your head."], neutral: ["Nee competition aanu. Personal alla. Okay, kurachu personal aanu.", "You're competition. Not personal. Okay, a bit personal."], cold: ["Nee ente vazhiyil aanu. Onnu maarumo, please?", "You're in my way. Move, please?"] },
        f: { warm: ["{city}-il ente favourite aal. Matte friendsnodu parayaruthu.", "My favourite person in {city}. Don't tell my other friends."], neutral: ["Kuzhappam illa. 7/10. Veendum hang out cheyyaam.", "Not bad. 7/10. Would hang out again."], cold: ["Theerumanichittilla. Athra nalla lakshanam alla.", "Haven't decided. Not a good sign."] },
        p: { warm: ["Nee ente abhimaanam aanu. Ente retirement planum. Pressure illa.", "You're my pride. Also my retirement plan. No pressure."], neutral: ["Nee ente kunju aanu. Ninakku 60 vayassu aayaalum njan tension adikkum.", "You're my child. I'll worry even when you're 60."], cold: ["Pazhaya ninne aanu enikku vendathu. Sunday vilikkunna aal.", "I want the old you back. The one who called on Sundays."] }
      },
      advice: { m: ["Free aayi oru upadesham: {tip}", "Free advice: {tip}"], v: ["Sheri, oru tip, pinne nammal veendum shathrukkal: {tip}", "Fine, one tip, then we're enemies again: {tip}"], f: ["Machan advice: {tip} Pinne, onnu urangu.", "Bro advice: {tip} Also, sleep."], p: ["Mootha aalukal parayunnathu kelkku: {tip} Pinne sweater idu.", "Listen to your elders: {tip} And wear a sweater."] },
      adviceCold: ["Ente upadesham venamenkil aadyam athu sambaadikku.", "Earn my advice first."],
      city: { m: ["Kelkku: {local}", "Listen: {local}"], v: ["{local} Nee pidichu nilkkumo ennu samshayam aanu.", "{local} Not sure you'll survive it."], f: ["{local} Ettavum nalla bhaagam? Njan.", "{local} Best part? Me."], p: ["{local} Utsavathinu veettil vaa.", "{local} Just come home for festivals."] },
      cityCold: ["Google cheyyu.", "Google it."]
    },

    hi: {
      react: {
        m: { warm: [["Bura nahi, {name}. Main tumhe naukri de deta. Kisi ko batana mat.", "Not bad, {name}. I'd hire you. Don't tell anyone."], ["Mere bhatije se tez seekh rahe ho. Bar neeche hai, phir bhi.", "Learning faster than my nephew. Low bar, but still."]],
             neutral: [["Hmm. Ek hafte baad poochna.", "Hmm. Ask me in a week."], ["Har faisle ki keemat hoti hai. Kuch EMI pe hote hain.", "Every decision has a price. Some are on EMI."]],
             cold: [["Isse achhe faisle toh kabootar le leta hai.", "A pigeon makes better decisions."], ["Rote hue mat aana. Theek hai, aana, par samose leke.", "Don't come crying. Fine, come, but bring samosas."]] },
        v: { warm: [["Theek hai, smart tha. Thoda jealous hoon bas.", "Fine, that was smart. I'm only a little jealous."], ["Sulah? Kal subah tak.", "Truce? Till tomorrow morning."]],
             neutral: [["Cute move. Dekhte hain Monday tak tikta hai ya nahi.", "Cute move. Let's see if it lasts till Monday."], ["Main nazar rakh raha hoon, {name}. Khaali baitha hoon isliye.", "I'm watching you, {name}. Only because I'm free."]],
             cold: [["Maze le lo. Guruvaar tak.", "Enjoy it. Till Thursday."], ["Is shehar mein hum dono ke liye jagah nahi. Mere ego ke liye bhi nahi.", "No room in this city for both of us. Not even for my ego."]] },
        f: { warm: [["Yaar, faad diya! Party tu dega, obviously.", "You smashed it! Party's on you, obviously."], ["Legend! Is pal ka screenshot le.", "Legend! Screenshot this moment."]],
             neutral: [["Okay... main act karti hoon ki plan samajh aaya.", "Okay... I'll act like I understood the plan."], ["Himmat hai. Bewakoofi bhi ho sakti hai. Dekhte hain.", "Brave. Could be stupid. Let's see."]],
             cold: [["Tu kaun? Mera dost kahan gaya?", "Who are you? Where's my friend?"], ["Jab yaad aaye ki main zinda hoon, call kar lena.", "Call when you remember I'm alive."]] },
        p: { warm: [["Family group mein daal diya. 47 thumbs up aa gaye!", "Posted in the family group. 47 thumbs up already!"], ["Bahut garv hai! Ab pehle kuch kha le.", "So proud! Now eat something first."]],
             neutral: [["Theek hai theek hai. Khana khaya?", "Okay okay. Did you eat?"], ["Sharma ji ke bete ka phir promotion hua. Bas bata rahi hoon.", "Sharma ji's son got promoted again. Just saying."]],
             cold: [["Main naraz nahi hoon. Bas teen motivational video bhej rahi hoon.", "I'm not angry. Just sending three motivational videos."], ["Tumhari umar mein na phone tha, na problem.", "At your age I had no phone and no problems."]] }
      },
      howru: {
        m: { warm: ["Busy hoon, par tumhari progress din ka best part hai.", "Busy, but your progress is the best part of my day."], neutral: ["Wahi roz ka. Kaam ki chhutti nahi hoti.", "Same as always. Work takes no holiday."], cold: ["Theek. Kuch chahiye ya time khoti karna hai?", "Fine. Need something, or just wasting time?"] },
        v: { warm: ["Sach bolun? Tumse competition mujhe sharp rakhta hai.", "Honestly? Competing with you keeps me sharp."], neutral: ["Badhiya. Tumse behtar, obviously.", "Great. Better than you, obviously."], cold: ["Kyun? Meri life bhi copy karni hai?", "Why? Want to copy my life too?"] },
        f: { warm: ["Ab achha hai! Chai chalein? Paise tu dega.", "Better now! Tea? You're paying."], neutral: ["Umeed aur Maggi pe zinda hoon.", "Surviving on hope and Maggi."], cold: ["Oh, ab mera number yaad aaya?", "Oh, now you remember my number?"] },
        p: { warm: ["Sab badhiya! Teri photo ab mere phone ka wallpaper hai.", "All good! Your photo is my phone wallpaper now."], neutral: ["Wahi sab. Papa ne pankha theek kiya. Ab bhi awaaz karta hai.", "Same. Papa fixed the fan. It still makes noise."], cold: ["Phone karta toh pata hota.", "If you called, you'd know."] }
      },
      opinion: {
        m: { warm: ["Tumhe dekh ke apni jawani yaad aati hai. Compliment hai, barbaad mat karna.", "You remind me of my youth. It's a compliment, don't waste it."], neutral: ["Potential hai. Result... loading.", "Potential, yes. Results... loading."], cold: ["Sach? Ek aur bura hafta, phir lecture.", "Honestly? One more bad week, then a lecture."] },
        v: { warm: ["Yahan sirf tumhari izzat karta hoon. Sar pe mat chadhna.", "You're the only one I respect here. Don't let it go to your head."], neutral: ["Tum competition ho. Personal nahi. Achha, thoda personal.", "You're competition. Not personal. Okay, a bit personal."], cold: ["Tum mere raaste mein ho. Hato, please.", "You're in my way. Move, please."] },
        f: { warm: ["{city} mein mera favourite insaan. Baaki doston ko mat batana.", "My favourite person in {city}. Don't tell my other friends."], neutral: ["Theek hai. 7/10. Phir milenge.", "Okay. 7/10. Would hang out again."], cold: ["Abhi decide nahi kiya. Lakshan achhe nahi hain.", "Haven't decided. The signs aren't good."] },
        p: { warm: ["Tu mera garv hai. Aur meri retirement plan bhi. Koi pressure nahi.", "You're my pride. Also my retirement plan. No pressure."], neutral: ["Tu mera bachcha hai. 60 ka bhi hoga toh tension lungi.", "You're my child. I'll worry even when you're 60."], cold: ["Mujhe purana wala tu chahiye. Jo Sunday ko call karta tha.", "I want the old you back. The one who called on Sundays."] }
      },
      advice: { m: ["Muft ka gyaan: {tip}", "Free wisdom: {tip}"], v: ["Chalo, ek tip, phir wapas dushman: {tip}", "Fine, one tip, then we're enemies again: {tip}"], f: ["Dost ki salaah: {tip} Aur so ja.", "Friend advice: {tip} And sleep."], p: ["Bado ki baat suno: {tip} Aur sweater pehno.", "Listen to your elders: {tip} And wear a sweater."] },
      adviceCold: ["Pehle meri salaah kamaao.", "Earn my advice first."],
      city: { m: ["Suno: {local}", "Listen: {local}"], v: ["{local} Tum tik paoge, shak hai.", "{local} Doubt you'll survive it."], f: ["{local} Sabse achhi baat? Main.", "{local} Best part? Me."], p: ["{local} Bas tyohaar pe ghar aa jaana.", "{local} Just come home for festivals."] },
      cityCold: ["Google kar le.", "Google it."]
    },

    mr: {
      react: {
        m: { warm: [["Vait nahi, {name}. Mi tula naukri dein. Konala sangu nakos.", "Not bad, {name}. I'd hire you. Don't tell anyone."], ["Tujhi progress majhya putanyapeksha fast aahe. Bar khali aahe, tari pan.", "Faster than my nephew. Low bar, but still."]],
             neutral: [["Hmm. Ek aathavdyane vichar.", "Hmm. Ask me in a week."], ["Pratyek nirnayachi kimmat aste. Kahi EMI var astat.", "Every decision has a price. Some are on EMI."]],
             cold: [["Yapeksha changle nirnay tar kabutar gheto.", "A pigeon makes better decisions."], ["Radat yeu nakos. Bara, ye, pan vada pav gheun ye.", "Don't come crying. Fine, come, but bring vada pav."]] },
        v: { warm: [["Thik aahe, smart hota. Mala thodi jalan hotey.", "Fine, that was smart. I'm a bit jealous."], ["Tah? Udya sakalparyant.", "Truce? Till tomorrow morning."]],
             neutral: [["Chhan move. Baghuya Monday paryant tikto ka.", "Nice move. Let's see if it lasts till Monday."], ["Mi tujhyavar laksh thevtoy, {name}. Rikama aahe mhanun.", "I'm watching you, {name}. Only because I'm free."]],
             cold: [["Majja kar. Guruvar paryant.", "Enjoy it. Till Thursday."], ["Ya shaharat aapan doghansathi jaaga nahi. Majhya ego sathi pan nahi.", "No room in this city for both of us. Not even my ego."]] },
        f: { warm: [["Bhau, ekdum jhakaas! Party tujhyakadun, obviously.", "Superb! Party's on you, obviously."], ["Legend! Ha kshan screenshot kar.", "Legend! Screenshot this moment."]],
             neutral: [["Okay... mi samajla asa natak karte.", "Okay... I'll pretend I understood."], ["Dhaadas aahe. Murkhpana pan asu shakto. Baghuya.", "Brave. Could be foolish. Let's see."]],
             cold: [["Tu kon? Majha mitra kuthe gela?", "Who are you? Where's my friend?"], ["Mi jivant aahe he aathavla ki phone kar.", "Call when you remember I'm alive."]] },
        p: { warm: [["Family group var takla. 47 thumbs up aale suddha!", "Posted in the family group. 47 thumbs up already!"], ["Khup abhimaan vatato! Aata kahi tari kha.", "So proud! Now eat something."]],
             neutral: [["Bara bara. Jevlas ka?", "Okay okay. Have you eaten?"], ["Shejarchya Joshi kakunchya mulala parat promotion milala. Sahaj sangitla.", "Mrs Joshi's son next door got promoted again. Just saying."]],
             cold: [["Mi ragavleli nahi. Fakt teen motivational video pathavtey.", "I'm not angry. Just sending three motivational videos."], ["Tujhya vayat mala phone navhta ani problem pan navhte.", "At your age I had no phone and no problems."]] }
      },
      howru: {
        m: { warm: ["Vyast aahe, pan tujhi pragati baghna divasacha best part aahe.", "Busy, but your progress is the best part of my day."], neutral: ["Nehmi sarkha. Kamala sutti naste.", "Same as always. Work takes no holiday."], cold: ["Thik. Kahi hava aahe ka, ki vel ghalvaycha aahe?", "Fine. Need something, or just wasting time?"] },
        v: { warm: ["Khara sangu? Tujhyashi spardha mala sharp thevte.", "Honestly? Competing with you keeps me sharp."], neutral: ["Mast. Tujhyapeksha bara, obviously.", "Great. Better than you, obviously."], cold: ["Ka? Majha aayushya pan copy karaycha aahe?", "Why? Want to copy my life too?"] },
        f: { warm: ["Aata bara! Cutting chaha? Paise tu de.", "Better now! Cutting chai? You pay."], neutral: ["Aasha ani Maggi var jagtey.", "Surviving on hope and Maggi."], cold: ["Oh, aata majha number aathavla?", "Oh, now you remember my number?"] },
        p: { warm: ["Sagla chhan! Tujha photo aata majha wallpaper aahe.", "All good! Your photo is my wallpaper now."], neutral: ["Tech te. Babanni pankha durusta kela. Ajun aavaj karto.", "Same. Baba fixed the fan. It still makes noise."], cold: ["Phone kela astas tar kalla asta.", "If you called, you'd know."] }
      },
      opinion: {
        m: { warm: ["Tula baghun mala majhe tarunpanache divas aathavtat. Compliment aahe, vaaya ghalvu nakos.", "You remind me of my youth. It's a compliment, don't waste it."], neutral: ["Kshamata aahe. Result... loading.", "Potential, yes. Results... loading."], cold: ["Khara? Ajun ek vait aathavda, mag lecture.", "Honestly? One more bad week, then a lecture."] },
        v: { warm: ["Ithe mi fakt tujha aadar karto. Doksyavar basu deu nakos.", "You're the only one I respect here. Don't let it go to your head."], neutral: ["Tu competition aahes. Personal nahi. Bara, thoda personal.", "You're competition. Not personal. Okay, a bit personal."], cold: ["Tu majhya vaatet aahes. Baajula ho, please.", "You're in my way. Move aside, please."] },
        f: { warm: ["{city} madhla majha favourite manus. Itar mitranna sangu nakos.", "My favourite person in {city}. Don't tell my other friends."], neutral: ["Theek aahe. 7/10. Parat bhetuya.", "Okay. 7/10. Would meet again."], cold: ["Ajun tharavla nahi. Lakshane changli nahit.", "Haven't decided. The signs aren't good."] },
        p: { warm: ["Tu majha abhimaan aahes. Ani majha retirement plan pan. Pressure nahi.", "You're my pride. And my retirement plan. No pressure."], neutral: ["Tu majha bal aahes. 60 varshancha jhalas tari kaalji karen.", "You're my child. I'll worry even when you're 60."], cold: ["Mala junya tu parat hava. Ravivari phone yaycha.", "I want the old you back. Sunday calls used to come."] }
      },
      advice: { m: ["Phukatcha salla: {tip}", "Free advice: {tip}"], v: ["Bara, ek tip, mag parat shatru: {tip}", "Fine, one tip, then enemies again: {tip}"], f: ["Mitrachi salla: {tip} Ani jhop.", "Friend advice: {tip} And sleep."], p: ["Mothyanche aik: {tip} Ani sweater ghal.", "Listen to your elders: {tip} And wear a sweater."] },
      adviceCold: ["Aadhi majha salla kamav.", "Earn my advice first."],
      city: { m: ["Aik: {local}", "Listen: {local}"], v: ["{local} Tu tikshil yachi shanka aahe.", "{local} Doubt you'll last."], f: ["{local} Sarvat changli goshta? Mi.", "{local} Best part? Me."], p: ["{local} Fakt sanala ghari ye.", "{local} Just come home for festivals."] },
      cityCold: ["Google kar.", "Google it."]
    },

    pa: {
      react: {
        m: { warm: [["Maada nahi, {name}. Main tainu naukri de dinda. Kise nu dassi na.", "Not bad, {name}. I'd hire you. Don't tell anyone."], ["Tera progress mere bhateeje ton tez aa. Bar neeva aa, phir vi.", "Faster than my nephew. Low bar, but still."]],
             neutral: [["Hmm. Ik hafte baad puchhin.", "Hmm. Ask me in a week."], ["Har faisle di keemat hundi aa. Kujh EMI te hunde ne.", "Every decision has a price. Some are on EMI."]],
             cold: [["Is ton changge faisle taan kabootar kar lainda.", "A pigeon makes better decisions."], ["Ronda na aayin. Chal, aa ja, par samose lai ke.", "Don't come crying. Fine, come, but bring samosas."]] },
        v: { warm: [["Theek aa, smart si. Thoda jealous haan bas.", "Fine, that was smart. Just a bit jealous."], ["Sulah? Kal savere tak.", "Truce? Till tomorrow morning."]],
             neutral: [["Vadiya move. Dekhde aan Monday tak chalda ke nahi.", "Nice move. Let's see if it lasts till Monday."], ["Main nazar rakh reha haan, {name}. Vehla haan is layi.", "I'm watching you, {name}. Only because I'm free."]],
             cold: [["Mauj kar lai. Veervaar tak.", "Enjoy it. Till Thursday."], ["Is shehar ch sadde dona layi jagah nahi. Mere ego layi vi nahi.", "No room in this city for both of us. Not even my ego."]] },
        f: { warm: [["Oye hoye, kamaal kar ditti! Party teri, obviously.", "Wow, amazing! Party's on you, obviously."], ["Legend! Is pal da screenshot lai.", "Legend! Screenshot this moment."]],
             neutral: [["Okay... main eda kardi aan jive plan samajh aa gaya.", "Okay... I'll act like I understood the plan."], ["Himmat aa. Bewakoofi vi ho sakdi aa. Dekhde aan.", "Brave. Could be silly. Let's see."]],
             cold: [["Tu kaun? Mera yaar kithe gaya?", "Who are you? Where's my friend?"], ["Jado yaad aave main zinda haan, phone kar layin.", "Call when you remember I'm alive."]] },
        p: { warm: [["Family group ch paa ditta. 47 thumbs up aa gaye!", "Posted in the family group. 47 thumbs up already!"], ["Bada maan aa puttar! Hun kujh kha lai.", "So proud, child! Now eat something."]],
             neutral: [["Theek aa theek aa. Roti khaadi?", "Okay okay. Did you eat?"], ["Gwaandiyan de munde di phir promotion ho gayi. Bas dass rahi aan.", "The neighbours' son got promoted again. Just saying."]],
             cold: [["Main naraz nahi aan. Bas tinn motivational video bhej rahi aan.", "I'm not angry. Just sending three motivational videos."], ["Teri umar ch na phone si, na problem.", "At your age there was no phone and no problem."]] }
      },
      howru: {
        m: { warm: ["Busy aan, par tera progress din da best hissa aa.", "Busy, but your progress is the best part of my day."], neutral: ["Ohi roz da. Kamm di chhutti nahi hundi.", "Same as always. Work takes no holiday."], cold: ["Theek. Kujh chahida ya time barbaad karna?", "Fine. Need something, or just wasting time?"] },
        v: { warm: ["Sach dassan? Tere naal muqabla mainu sharp rakhda.", "Honestly? Competing with you keeps me sharp."], neutral: ["Vadiya. Tere ton changga, obviously.", "Great. Better than you, obviously."], cold: ["Kyon? Meri zindagi vi copy karni?", "Why? Want to copy my life too?"] },
        f: { warm: ["Hun vadiya! Lassi peeyiye? Paise teri jeb ton.", "Better now! Lassi? Out of your pocket."], neutral: ["Umeed te Maggi te zinda haan.", "Surviving on hope and Maggi."], cold: ["Oh, hun mera number yaad aaya?", "Oh, now you remember my number?"] },
        p: { warm: ["Sab vadiya! Teri photo hun mere phone da wallpaper aa.", "All good! Your photo is my phone wallpaper now."], neutral: ["Ohi sab. Tere papa ne pakha theek kita. Hale vi awaaz karda.", "Same. Papa fixed the fan. It still makes noise."], cold: ["Phone aunda taan pata hunda.", "If you called, we'd know."] }
      },
      opinion: {
        m: { warm: ["Tainu dekh ke apni jawani yaad aundi aa. Compliment aa, zaya na karin.", "You remind me of my youth. It's a compliment, don't waste it."], neutral: ["Kaabliyat hai. Result... loading.", "Potential, yes. Results... loading."], cold: ["Sach? Ik hor maada hafta, phir lecture.", "Honestly? One more bad week, then a lecture."] },
        v: { warm: ["Ithe main sirf teri izzat karda haan. Sir te na chadh.", "You're the only one I respect here. Don't let it go to your head."], neutral: ["Tu competition aa. Personal nahi. Accha, thoda personal.", "You're competition. Not personal. Okay, a bit personal."], cold: ["Tu mere raah ch aa. Paase ho ja, please.", "You're in my way. Move aside, please."] },
        f: { warm: ["{city} ch mera favourite banda. Baaki dostan nu na dassin.", "My favourite person in {city}. Don't tell my other friends."], neutral: ["Theek aa. 7/10. Phir milange.", "Okay. 7/10. Would meet again."], cold: ["Hale faisla nahi kita. Lakshan changge nahi.", "Haven't decided. The signs aren't good."] },
        p: { warm: ["Tu mera maan aa. Te meri retirement plan vi. Koi pressure nahi.", "You're my pride. And my retirement plan. No pressure."], neutral: ["Tu mera bachcha aa. 60 saal da vi hoyein, chinta karangi.", "You're my child. I'll worry even when you're 60."], cold: ["Mainu purana tu chahida. Aitvaar nu phone aunda si.", "I want the old you back. Sunday calls used to come."] }
      },
      advice: { m: ["Muft da gyaan: {tip}", "Free wisdom: {tip}"], v: ["Chal, ik tip, phir dushman: {tip}", "Fine, one tip, then enemies again: {tip}"], f: ["Yaar di salaah: {tip} Te so ja.", "Friend advice: {tip} And sleep."], p: ["Vaddeyan di gall sun: {tip} Te sweater paa.", "Listen to your elders: {tip} And wear a sweater."] },
      adviceCold: ["Pehlan meri salaah kamaa.", "Earn my advice first."],
      city: { m: ["Sun: {local}", "Listen: {local}"], v: ["{local} Tere ton nahi hona.", "{local} Not your cup of tea."], f: ["{local} Sab ton vadiya gall? Main.", "{local} Best part? Me."], p: ["{local} Bas tyohaar te ghar aa jaayin.", "{local} Just come home for festivals."] },
      cityCold: ["Google kar lai.", "Google it."]
    },

    bn: {
      react: {
        m: { warm: [["Kharap na, {name}. Ami tomake chakri ditam. Kauke bolo na.", "Not bad, {name}. I'd hire you. Don't tell anyone."], ["Tomar progress amar bhaipor theke fast. Bar niche, tobuo.", "Faster than my nephew. Low bar, but still."]],
             neutral: [["Hmm. Ek hapta pore jiggesh koro.", "Hmm. Ask me in a week."], ["Protyek siddhanter daam ache. Kichu EMI te.", "Every decision has a price. Some are on EMI."]],
             cold: [["Er cheye bhalo siddhanto payra-o ney.", "Even a pigeon decides better."], ["Kaadte kaadte esho na. Accha esho, kintu telebhaja niye.", "Don't come crying. Fine, come, but bring telebhaja."]] },
        v: { warm: [["Thik ache, smart chilo. Ektu hingshe hocche shudhu.", "Fine, that was smart. Just a little jealous."], ["Shandhi? Kaal shokal porjonto.", "Truce? Till tomorrow morning."]],
             neutral: [["Bhalo chaal. Dekhi Shombar porjonto tike kina.", "Nice move. Let's see if it lasts till Monday."], ["Ami nojor rakhchi, {name}. Kaaj nei bole.", "I'm watching you, {name}. Only because I'm free."]],
             cold: [["Moja koro. Brihoshpotibar porjonto.", "Enjoy it. Till Thursday."], ["Ei shohore amader dujoner jaayga nei. Amar ego-r-o nei.", "No room in this city for both of us. Not even my ego."]] },
        f: { warm: [["Darun! Treat tomar, obviously.", "Brilliant! Treat's on you, obviously."], ["Legend! Ei muhurter screenshot nao.", "Legend! Screenshot this moment."]],
             neutral: [["Accha... bhaab korchi plan ta bujhechi.", "Okay... I'll pretend I understood the plan."], ["Shahosh ache. Bokami-o hote pare. Dekha jak.", "Brave. Could be silly. Let's see."]],
             cold: [["Tumi ke? Amar bondhu kothay?", "Who are you? Where's my friend?"], ["Mone porle je ami bneche achi, phone koro.", "Call when you remember I'm alive."]] },
        p: { warm: [["Family group e diyechi. 47 ta thumbs up already!", "Posted in the family group. 47 thumbs up already!"], ["Khub gorbo hocche! Ebar kichu khao.", "So proud! Now eat something."]],
             neutral: [["Accha accha. Kheyecho?", "Okay okay. Did you eat?"], ["Paasher barir chheler abar promotion holo. Emni bollam.", "The neighbour's son got promoted again. Just saying."]],
             cold: [["Ami raag kori ni. Shudhu tinte motivational video pathachhi.", "I'm not angry. Just sending three motivational videos."], ["Tomar boyeshe amar phone-o chhilo na, problem-o na.", "At your age I had no phone and no problems."]] }
      },
      howru: {
        m: { warm: ["Byasto, kintu tomar progress din-er shera ongsho.", "Busy, but your progress is the best part of my day."], neutral: ["Shei eki. Kaajer chhuti nei.", "Same as always. Work takes no holiday."], cold: ["Bhalo. Kichu lagbe, naki shudhu shomoy noshto?", "Fine. Need something, or just wasting time?"] },
        v: { warm: ["Shotti bolbo? Tomar shathe protijogita amake sharp rakhe.", "Honestly? Competing with you keeps me sharp."], neutral: ["Darun. Tomar cheye bhalo, obviously.", "Great. Better than you, obviously."], cold: ["Keno? Amar jibon-o copy korbe?", "Why? Want to copy my life too?"] },
        f: { warm: ["Ekhon bhalo! Cha khabe? Taka tumi debe.", "Better now! Tea? You're paying."], neutral: ["Asha aar Maggi diye bneche achi.", "Surviving on hope and Maggi."], cold: ["Oh, ekhon amar number mone porlo?", "Oh, now you remember my number?"] },
        p: { warm: ["Shob bhalo! Tomar chhobi ekhon amar phone-er wallpaper.", "All good! Your photo is my phone wallpaper now."], neutral: ["Shei eki. Baba pakha thik koreche. Ekhono awaaz kore.", "Same. Baba fixed the fan. It still makes noise."], cold: ["Phone korle jaante.", "If you called, you'd know."] }
      },
      opinion: {
        m: { warm: ["Tomake dekhe amar jouboner kotha mone pore. Compliment, noshto koro na.", "You remind me of my youth. It's a compliment, don't waste it."], neutral: ["Khomota ache. Result... loading.", "Potential, yes. Results... loading."], cold: ["Shotti? Aar ekta kharap hapta, tarpor lecture.", "Honestly? One more bad week, then a lecture."] },
        v: { warm: ["Ekhane shudhu tomake shomman kori. Mathay uthe jeo na.", "You're the only one I respect here. Don't let it go to your head."], neutral: ["Tumi protidwondi. Personal na. Accha, ektu personal.", "You're competition. Not personal. Okay, a bit personal."], cold: ["Tumi amar raastay. Shoro, please.", "You're in my way. Move, please."] },
        f: { warm: ["{city}-te amar favourite manush. Onno bondhuder bolo na.", "My favourite person in {city}. Don't tell my other friends."], neutral: ["Thik ache. 7/10. Abar adda debo.", "Okay. 7/10. Would adda again."], cold: ["Ekhono thik kori ni. Lokkhon bhalo na.", "Haven't decided. The signs aren't good."] },
        p: { warm: ["Tumi amar gorbo. Aar amar retirement plan-o. Kono chap nei.", "You're my pride. And my retirement plan. No pressure."], neutral: ["Tumi amar shontan. 60 bochor holeo chinta korbo.", "You're my child. I'll worry even when you're 60."], cold: ["Purono tomake chai. Je Robibar phone korto.", "I want the old you back. The one who called on Sundays."] }
      },
      advice: { m: ["Free te gyan: {tip}", "Free wisdom: {tip}"], v: ["Accha, ekta tip, tarpor abar shotru: {tip}", "Fine, one tip, then enemies again: {tip}"], f: ["Bondhur poramorsho: {tip} Aar ghumao.", "Friend advice: {tip} And sleep."], p: ["Boro der kotha shono: {tip} Aar sweater poro.", "Listen to your elders: {tip} And wear a sweater."] },
      adviceCold: ["Age amar poramorsho arjon koro.", "Earn my advice first."],
      city: { m: ["Shono: {local}", "Listen: {local}"], v: ["{local} Tumi tikte parbe, shondeho ache.", "{local} Doubt you'll last."], f: ["{local} Shobcheye bhalo jinish? Ami.", "{local} Best part? Me."], p: ["{local} Shudhu Pujor shomoy bari esho.", "{local} Just come home for Puja."] },
      cityCold: ["Google koro.", "Google it."]
    },

    kn: {
      react: {
        m: { warm: [["Kettadilla, {name}. Ninage kelsa kodtidde. Yaarigu helbeda.", "Not bad, {name}. I'd hire you. Don't tell anyone."], ["Nin progress nan aliyanigintha fast ide. Bar kelage ide, aadru.", "Faster than my nephew. Low bar, but still."]],
             neutral: [["Hmm. Ondu vaara aadmele kelu.", "Hmm. Ask me in a week."], ["Prati nirdhaarakkoo bele ide. Kelavu EMI alli.", "Every decision has a price. Some are on EMI."]],
             cold: [["Idakkintha olle nirdhaara paarivaala tagolutte.", "A pigeon makes better decisions."], ["Allkonde baarbeda. Sari, baa, aadre bonda tagondu baa.", "Don't come crying. Fine, come, but bring bonda."]] },
        v: { warm: [["Sari, smart aagittu. Swalpa hotte urithide ashte.", "Fine, that was smart. Just a little jealous."], ["Rajee? Naale beligge tanaka.", "Truce? Till tomorrow morning."]],
             neutral: [["Chennagide move. Monday tanaka uLiyutta nodona.", "Nice move. Let's see if it lasts till Monday."], ["Ninna mele kannittiddini, {name}. Kelsa illa adakke.", "I'm watching you, {name}. Only because I'm free."]],
             cold: [["Enjoy maadu. Guruvaara tanaka.", "Enjoy it. Till Thursday."], ["Ee oorinalli namma ibbarigu jaaga illa. Nan ego-gu illa.", "No room in this city for both of us. Not even my ego."]] },
        f: { warm: [["Maga, sakkath! Treat ninde, obviously.", "Awesome! Treat's on you, obviously."], ["Legend! Ee kshanada screenshot tago.", "Legend! Screenshot this moment."]],
             neutral: [["Sari... plan arthaa aaythu anta naatka maadtini.", "Okay... I'll pretend I understood the plan."], ["Dhairya ide. Huchchu kooda aagbahudu. Nodona.", "Brave. Could be crazy. Let's see."]],
             cold: [["Neenu yaaru? Nan friend elli?", "Who are you? Where's my friend?"], ["Naanu badukiddini anta nenapaadaaga call maadu.", "Call when you remember I'm alive."]] },
        p: { warm: [["Family group ge haakidini. 47 thumbs up bandide!", "Posted in the family group. 47 thumbs up already!"], ["Thumba hemme aagthide! Eega enaadru oota maadu.", "So proud! Now eat something."]],
             neutral: [["Sari sari. Oota aayta?", "Okay okay. Have you eaten?"], ["Pakkada maneya hudugange matte promotion. Summane helde.", "The neighbour's boy got promoted again. Just saying."]],
             cold: [["Nanage kopa illa. Bari mooru motivational video kalistidini.", "I'm not angry. Just sending three motivational videos."], ["Nin vayassalli nange phone irlilla, problem-u irlilla.", "At your age I had no phone and no problems."]] }
      },
      howru: {
        m: { warm: ["Busy, aadre nin progress dinada best bhaaga.", "Busy, but your progress is the best part of my day."], neutral: ["Yaavaglu haage. Kelsakke raje illa.", "Same as always. Work takes no holiday."], cold: ["Chennagide. Enaadru beka, illa time waste maadbeka?", "Fine. Need something, or just wasting time?"] },
        v: { warm: ["Nija hella? Nin jothe spardhe nanna sharp aagi idutte.", "Honestly? Competing with you keeps me sharp."], neutral: ["Sakkath. Ninginta chennagi, obviously.", "Great. Better than you, obviously."], cold: ["Yaake? Nan life-nu copy maadbeka?", "Why? Want to copy my life too?"] },
        f: { warm: ["Eega okay! Filter coffee? Duddu neene kodu.", "Better now! Filter coffee? You're paying."], neutral: ["Aase mattu Maggi mele badukthiddini.", "Surviving on hope and Maggi."], cold: ["Oh, eega nan number nenapaaytha?", "Oh, now you remember my number?"] },
        p: { warm: ["Ella chennagide! Nin photo eega nan phone wallpaper.", "All good! Your photo is my phone wallpaper now."], neutral: ["Ade. Appa fan sari maadidru. Innu shabda maadutte.", "Same. Appa fixed the fan. It still makes noise."], cold: ["Phone maadidre gottagtittu.", "If you called, you'd know."] }
      },
      opinion: {
        m: { warm: ["Ninna nodidre nan yauvana nenapaagutte. Compliment, waste maadbeda.", "You remind me of my youth. It's a compliment, don't waste it."], neutral: ["Saamarthya ide. Result... loading.", "Potential, yes. Results... loading."], cold: ["Nija? Innondu kettha vaara, aamele lecture.", "Honestly? One more bad week, then a lecture."] },
        v: { warm: ["Illi naanu gaurava koduvudu ninge maatra. Thale mele hattbeda.", "You're the only one I respect here. Don't let it go to your head."], neutral: ["Neenu competition. Personal alla. Sari, swalpa personal.", "You're competition. Not personal. Okay, a bit personal."], cold: ["Neenu nan daariyalli iddiya. Sarko, please.", "You're in my way. Move, please."] },
        f: { warm: ["{city} alli nan favourite vyakti. Bere friends ge helbeda.", "My favourite person in {city}. Don't tell my other friends."], neutral: ["Okay. 7/10. Matte sigona.", "Okay. 7/10. Would meet again."], cold: ["Innu decide maadilla. Lakshana chennagilla.", "Haven't decided. The signs aren't good."] },
        p: { warm: ["Neenu nanna hemme. Mattu nanna retirement plan kooda. Pressure illa.", "You're my pride. And my retirement plan. No pressure."], neutral: ["Neenu nanna magu. 60 varsha aadru chinte maadtini.", "You're my child. I'll worry even when you're 60."], cold: ["Nange haLe ninna bekagide. Bhaanuvaara call barta ittu.", "I want the old you back. Sunday calls used to come."] }
      },
      advice: { m: ["Free salahe: {tip}", "Free advice: {tip}"], v: ["Sari, ondu tip, aamele matte shatru: {tip}", "Fine, one tip, then enemies again: {tip}"], f: ["Maga advice: {tip} Mattu malko.", "Friend advice: {tip} And sleep."], p: ["Doddavara maatu kelu: {tip} Mattu sweater haako.", "Listen to your elders: {tip} And wear a sweater."] },
      adviceCold: ["Modalu nan salahe sampaadisu.", "Earn my advice first."],
      city: { m: ["Kelu: {local}", "Listen: {local}"], v: ["{local} Neenu uLiyteeya anta anumaana.", "{local} Doubt you'll last."], f: ["{local} Best part? Naanu.", "{local} Best part? Me."], p: ["{local} Habbakke manege baa.", "{local} Come home for festivals."] },
      cityCold: ["Google maadu.", "Google it."]
    }
  }
};
