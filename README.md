# Next Station

A second-life simulator set in Kochi, presented by FXN India. Arrive in Kochi, get a job, eat, sleep, build a home, marry and raise children, in a 3D Kochi built on its real layout (Fort Kochi, Willingdon Island, Marine Drive, MG Road, Kaloor, Kadavanthra, Vyttila). Missions, team tasks and new ventures take you to Bengaluru, Hyderabad, Mumbai and Delhi.
Static web game: no accounts, ₹0 running cost. Optional live players and chat via a free Supabase project (see SUPABASE_SETUP.md).

## What's inside

- 20 lives: Street Food Hustle, The 9–5, Government Job, Influencer, Startup Founder, Craft Brand, Film Star, Cricketer, Reality Show, The Trader, Night Shift Nurse, Auto to Cab Fleet, Tuition Master, Cloud Kitchen, Homestay Host, Personal Stylist, Indie Musician, Wedding Planner, Boat to Export, Gulf Returnee
- 5 cities: Kochi (hub), Bengaluru, Hyderabad, Mumbai, Delhi
- City systems: Government Office papers, bank loans and venture loans, upgradeable house, matrimony/dating apps and weddings, odd jobs, team tasks for 2/4/6 players (hired helpers fill gaps), FXN rider shifts with ratings and tips, money gifts between players, job locks while another player is online in that life, career switching
- Vehicles: buy a bicycle, scooter, motorbike, car or SUV at Vyttila Motors (cash or 20% down + vehicle loan), ride 1.6–3× faster than walking, petrol on payday; other players see what you ride
- FXN delivery: rent an outfit and an FXN rider scoots over from the dark store, parks, hands you the box, and you unbox it with a sparkle and a twirl. FXN rider shifts put you on the pink FXN scooter
- Map: illustrated Kochi map with real street names (Shanmugham Road, MG Road, Banerji Road, Princess Street…), the Kochi Metro line, pins, your route to the next goal, pinch-zoom and pan; tap a pin to walk there
- Clock: 1 real second = 1.5 game minutes (a day lasts about 16 minutes); kids grow a year per game day
- Multiplayer rooms: each city is split into rooms of 8 (ROOM_SIZE in js/config.js). Players fill Room 1, then Room 2… Tap the room pill to see rooms and join friends. Movement sends where you're heading (about 1 message per tap, at most ~1/s while steering), so the free Supabase plan (100 messages/s, 200 connections) holds roughly 100+ live players
- People: realistic proportions, painted faces (eyes, brows, lips), 15 hairstyles, beards and moustaches, glasses, headwear (cap, beanie, turban, hijab, jasmine), bindi/chandanam, earrings, nose jewellery, 3 body shapes, 7 tops, 6 bottoms (incl. mundu with kasavu border), 5 footwear types; townsfolk each get a typical Kochi look (chaya chettan, auto driver in khaki, ammachi in settu-mundu, aunty in saree)
- Daily duties (js/data/duties.js): every job has 5 hands-on duties, 3 a day — walk to the spot and do a quick mini-game (tap fast, put steps in order, pick the right answer, hold-and-release timing) or a pickup/drop-off. Pay per duty, a bonus for all three, and a streak bonus (up to +50%) for doing them daily. Phone app "Today's duties"
- Family walks with you: in the Family sheet choose "Family walks with me" or "They stay home". Your spouse and kids follow you (and ride along, hidden, when you're in a vehicle, on the ferry or the metro); other players see them walking with you
- Love: 6 apps (MangalyaMatch, KalyanaVeedu, NRI Rishta matrimony; ChaiDate, SunsetSwipe, Paperback dating) with 36 fictional profiles
- Notice Board nudge every 2 minutes of play (quick jobs and team tasks, with a "Show me" button). Team tasks now pay 2.5x, plus 20% per real player in your team
- Traffic gives way: autos, cars and buses brake for anyone in front of them and edge sideways when there's room, honking if they have to stop
- Bigger Kochi: the map now runs east across the Chilavannur canal to Kakkanad (96 × 48 tiles). Infopark Phase 1 and 2, SmartCity, the Infopark Hub, Food Street and a lake garden; the Civil Station and Kakkanad Junction. Tech lives (job, startup, trader) now work at Infopark
- Kochi Water Metro: electric catamarans that shuttle on their own. Island line from High Court (Marine Drive) to Vypeen, Bolgatty and Fort Kochi; canal line from Vyttila to Kakkanad (Infopark). Board at any ⛴ jetty, ₹20–30, Kochi1 card discount, announcements, new life goal
- Infopark Hub: daytime freelance bug bash (3-question fix-it quiz, pays by score), evening tech meetups (skills and reputation), tech job switch, Food Street
- Ward politics (🗳️ phone app): three fictional parties running on local civic issues (Tide 🌊, Chakka 🍈, Spark ⚡). Join, go door-to-door (3 glowing doors a day), print posters, attend evening rallies, file a nomination and stand for Ward Councillor. The ward votes every 7 days (results when you wake up); councillors get an honorarium and pick a ward project. Other players see your party icon on your name tag
- FXN Arcade (phone app, FXN app banner, or the pop-up every few minutes): Style Match (dress the client for the occasion), Pack Rush (memorise and pack the order), Delivery Dash (lane-switching scooter run through Kochi traffic), Drone Drop (Kochi 2030 parcel drops on balcony pads). Two paid plays per game per day, pay scales with score; high scores saved on the device. Premium FXN lobby with picks and taglines. The 3D city pauses while you play
- Messages: one message at a time under the guide card (queued, de-duplicated, important ones first, tap to open history). Townsfolk chatter stays as speech bubbles only. The 💬 button opens the last 60 messages with All / Updates / Players / Townsfolk tabs and an unread badge
- Kochi 2030: neon trims on buildings (brighter at night), premium holographic FXN billboards that change slides, a giant spinning FXN hologram over the FXN store, hover cars and flying scooters in air lanes, FXN delivery drones with pink boxes. Buy a flying scooter (₹8L) or hover car (₹25L) at Vyttila Motors: they fly over rooftops and the backwaters (vehicle loan now up to ₹20L)
- Kochi Metro: stations at Kaloor, MG Road and Ernakulam South; ride along the elevated line (fares ₹20–30, Kochi1 card for 20% off) and do 6 metro tasks (lost bag, lost tourist, FXN metro express, night ride…)
- World look: sky with sun glow and drifting clouds, sky reflections on water and glass, detailed asphalt, interlocking pavers, painted kerbs, floor ledges and parapets, Mangalore-tile roofs, rooftop water tanks, coconut palms, rain trees, hibiscus bushes, KSEB power poles and wires
- Sound (js/sound.js, all synthesised with Web Audio, no files): footsteps, auto/car/bus horns, scooter and car engines, metro chime and spoken "Next station" announcement, ferry horn, waves, crows, birds, night crickets, coins, goals, payday, doorbell and sparkle for FXN deliveries, wedding and baby jingles, and a soft generative background tune in Mohanam. Speaker button (🔊 → 🔉 effects only → 🔇 off) under the minimap
- Character creator (cosmetic only) with tabs: Body, Face, Hair, Clothes, Extras; endings, badges, XP, daily challenge, leaderboard
- Saves live in the player's own browser (localStorage). Only leaderboard scores and chat reports go to Supabase.

## Files

```
index.html          page shell
css/style.css       all styling
js/data/states.js   city packs (cast, food, craft, festival, city events)
js/data/lives.js    lives 1–10 (events, economics, endings)
js/data/lives2.js   lives 11–20
js/data/city.js     papers, loans, house, matrimony profiles, odd jobs, team tasks, FXN rider settings
js/data/common.js   shared events, dialogue, chat answers, badges
js/engine.js        game rules (deterministic, seeded)
js/people.js        avatar options, network packing, random townsfolk, 3D person builder (faces are canvas textures)
js/life.js          second-life layer: clock, energy, hunger, sleep, food, family, children, life goals
js/data/mallu.js    Manglish lines for people in the city and reactions (native speakers: edit here)
js/avatar.js        character drawing
js/data/dialogue.js character speech in 6 languages (native speakers: edit lines here)
js/world.js         3D city (Three.js r147): Kochi on its real layout, day/night, water, palms, traffic, ferry, people, mini map
js/data/missions.js away missions that send you to other cities and back
js/data/fxn.js      FXN rental catalogue, dress-code events, delivery gig (FXN is real; in-game prices are not)
js/net.js           live players, phrases, 18+ typed chat, filters, reports, gifts, groups, job-lock lobby
js/config.js        Supabase URL + publishable key (empty = solo mode)
js/app.js           screens and buttons (GAME_NAME and GRIEVANCE contact at the top)
```

## Host it free (pick one)

- **Netlify Drop:** go to app.netlify.com/drop and drag this whole folder in. You get a link in seconds.
- **GitHub Pages:** create a public repo, upload these files, then Settings → Pages → Deploy from branch → main.

## Add a new city

Copy one city block in `js/data/states.js` (e.g. `KA`), give it a state code (e.g. `TN`), and change the cast, food, craft, festival and events. Add its local facts in `js/data/common.js`, a courier name in `js/data/fxn.js`, and its language in `js/data/dialogue.js` (`stateLang`). Also add the code to the leaderboard's `state` check in Supabase.

## Rename the game

Change `GAME_NAME` at the top of `js/app.js` and the `<title>` in `index.html`.
