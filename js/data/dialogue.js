// Character speech in 6 languages. Story text and choices stay in English.
// Each non-English line is [what the character says, English subtitle].
// Roles: m mentor, v rival, f friend, p parent. Moods: warm, neutral, cold.
// {name} = player name, {city} = city, {tip} = life tip (English), {local} = city fact (English).
// Native speakers: fix any line right here; no code changes needed.
window.AE_DIALOGUE = {
  langs: { auto: "Auto (each city's language)", en: "English", ml: "Malayalam", hi: "Hindi", mr: "Marathi", kn: "Kannada", te: "Telugu" },
  stateLang: { KL: "ml", MH: "mr", KA: "kn", TG: "te", DL: "hi" },
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
    },

    te: {
      react: {
        m: { warm: [["Baagundi {name}. Ninnu udyogamlo pettukuntaanu. Evvarikee cheppaku.", "Not bad, {name}. I'd hire you. Don't tell anyone."], ["Maa menalludi kanna fast ga nerchukuntunnav. Adi pedda goppa kaadu, ainaa.", "You learn faster than my nephew. Low bar, but still."]],
             neutral: [["Hmm. Oka vaaram aagi malli adugu.", "Hmm. Ask me again in a week."], ["Prathi nirnayaaniki oka dhara undi. Konni EMI lo.", "Every decision has a price. Some are on EMI."]],
             cold: [["Deeni kanna paavuram baaga decide chestundi.", "A pigeon decides better than this."], ["Edustu raaku. Sare raa, kaani samosalu techhuko.", "Don't come crying. Okay, come, but bring samosas."]] },
        v: { warm: [["Sare, adi smart move. Naaku konchem asooya ga undi.", "Fine, that was smart. I'm a little jealous."], ["Sandhi? Repu podduna varaku maatrame.", "Truce? Only till tomorrow morning."]],
             neutral: [["Manchi move. Somavaram varaku nilustundo choodaali.", "Nice move. Let's see if it lasts till Monday."], ["Ninnu gamanistunnaa, {name}. Vere pani ledu kaabatti.", "I'm watching you, {name}. Only because I'm free."]],
             cold: [["Enjoy cheyyi. Guruvaaram varaku.", "Enjoy it. Till Thursday."], ["Ee ooru manaiddariki saripodu. Naa ego ki kooda.", "This town isn't big enough for both of us. Or my ego."]] },
        f: { warm: [["Mama, adaragottav! Treat nuvve, obviously.", "Mama, you smashed it! Treat's on you, obviously."], ["Legend! Ee moment ki screenshot teeyi.", "Legend! Screenshot this moment."]],
             neutral: [["Sare... nee plan ardhamaindi ani natistaanu.", "Okay... I'll pretend I understood your plan."], ["Dhairyam undi. Pichi kooda kaavachu. Chooddaam.", "Brave. Could also be crazy. Let's see."]],
             cold: [["Nuvvu evaru? Naa friend ekkada?", "Who are you? Where's my friend?"], ["Nenu brathiki unnaanani gurthocchinappudu call cheyyi.", "Call me when you remember I'm alive."]] },
        p: { warm: [["Family group lo pettaanu. Appude 47 thumbs up!", "Posted in the family group. 47 thumbs up already!"], ["Chaala garvanga undi raa! Ippudu emaina tinu.", "So proud of you! Now eat something."]],
             neutral: [["Sare sare. Annam tinnava?", "Okay okay. Did you eat?"], ["Pakkinti abbayiki malli promotion vacchindi. Oorike cheptunnaa.", "The neighbour's boy got promoted again. Just saying."]],
             cold: [["Naaku kopam ledu. Moodu motivation videos pamputunnaa, anthe.", "I'm not angry. Just sending three motivation videos."], ["Nee vayasulo naaku phone ledu, problems kooda levu.", "At your age I had no phone and no problems."]] }
      },
      howru: {
        m: { warm: ["Busy ga unnaa, kaani nee progress choodatame naa rojulo best part.", "Busy, but your progress is the best part of my day."], neutral: ["Eppatilaage. Paniki selavulu undavu.", "Same as always. Work has no holidays."], cold: ["Baagunnaa. Emaina kaavaala, leka time waste aa?", "Fine. Need something, or just wasting time?"] },
        v: { warm: ["Nijam cheppaalante? Neetho potee nannu sharp ga unchutundi.", "Honestly? Competing with you keeps me sharp."], neutral: ["Super. Nee kanna better, obviously.", "Great. Better than you, obviously."], cold: ["Enduku? Naa life kooda copy kottadaanikaa?", "Why? Planning to copy my life too?"] },
        f: { warm: ["Ippudu better! Saayantram chai? Nuvve pay cheyyaali.", "Better now! Chai this evening? You're paying."], neutral: ["Aasa meeda, Maggi meeda brathukutunnaa.", "Surviving on hope and Maggi."], cold: ["Oh, ippudu naa number gurthocchindaa?", "Oh, now you remember my number?"] },
        p: { warm: ["Antha baagundi! Nee photo ippudu naa phone wallpaper.", "All good! Your photo is my phone wallpaper now."], neutral: ["Eppatilaage. Mee naanna fan baagu chesaaru. Inkaa sound chestundi.", "Same. Your father fixed the fan. It still makes noise."], cold: ["Nuvvu call chesthe telustundi kadaa.", "We'd know how you are if you called."] }
      },
      opinion: {
        m: { warm: ["Nee vayasulo nenu ilaage undevaadini. Idi compliment, waste cheyyaku.", "You remind me of me at your age. It's a compliment."], neutral: ["Potential undi. Results... inkaa loading.", "Potential, yes. Results... still loading."], cold: ["Nijam cheppaalante? Inko chedda vaaram vasthe lecture vintaav.", "Honestly? One more bad week and you get a lecture."] },
        v: { warm: ["Ikkada nenu respect chese okkadivi nuvve. Talaki ekkinchukoku.", "You're the only one here I respect. Don't let it go to your head."], neutral: ["Nuvvu competition. Personal kaadu. Sare, konchem personal.", "You're competition. Nothing personal. Okay, a little."], cold: ["Naa daariki addam vasthunnav. Konchem pakkaki jarugu.", "You're in my way. Kindly move aside."] },
        f: { warm: ["{city} lo naa favourite person nuvve. Migathavaallaki cheppaku.", "My favourite person in {city}. Don't tell the others."], neutral: ["Nuvvu okay. 7/10. Malli kalustaanu.", "You're okay. 7/10. Would meet again."], cold: ["Inkaa decide chestunnaa. Baagaa ledu.", "Still deciding. It's not looking good."] },
        p: { warm: ["Nuvve naa garvam. Naa retirement plan kooda. Pressure ledu.", "You're my pride. Also my retirement plan. No pressure."], neutral: ["Nuvvu naa biddavi. Neeku 60 ellochinaa nenu tension padathaa.", "You're my child. I'll worry even when you're 60."], cold: ["Paata nuvvu kaavaali. Aadivaaram call chese aa nuvvu.", "I want the old you back. The one who called on Sundays."] }
      },
      advice: { m: ["Free salaha: {tip}", "Free advice: {tip}"], v: ["Sare, okka tip, tarvaatha malli shatruvulam: {tip}", "Fine, one tip, then we're enemies again: {tip}"], f: ["Friend salaha: {tip} Inkaa, nidrapo.", "Friend advice: {tip} Also, sleep."], p: ["Peddala maata vinu: {tip} Sweater kooda vesuko.", "Listen to your elders: {tip} And wear a sweater."] },
      adviceCold: ["Mundu naa salaha sampaadinchu.", "Earn my advice first."],
      city: { m: ["Vinu: {local}", "Listen: {local}"], v: ["{local} Nuvvu tattukuntavo ledo telidu.", "{local} Not sure you'll survive it."], f: ["{local} Best part? Nenu.", "{local} Best part? Me."], p: ["{local} Pandagalaki intiki vacchey.", "{local} Just come home for festivals."] },
      cityCold: ["Google cheyyi.", "Google it."]
    }
  }
};
