# Next Station

A Kochi-first life simulator, presented by FXN India. Everyone starts in Kochi; missions, team tasks and new ventures take you to Bengaluru, Hyderabad, Mumbai and Delhi.
Static web game: no accounts, ₹0 running cost. Optional live players and chat via a free Supabase project (see SUPABASE_SETUP.md).

## What's inside

- 20 lives: Street Food Hustle, The 9–5, Government Job, Influencer, Startup Founder, Craft Brand, Film Star, Cricketer, Reality Show, The Trader, Night Shift Nurse, Auto to Cab Fleet, Tuition Master, Cloud Kitchen, Homestay Host, Personal Stylist, Indie Musician, Wedding Planner, Boat to Export, Gulf Returnee
- 5 cities: Kochi (hub), Bengaluru, Hyderabad, Mumbai, Delhi
- City systems: Government Office papers, bank loans and venture loans, upgradeable house, matrimony/dating apps and weddings, odd jobs, team tasks for 2/4/6 players (hired helpers fill gaps), FXN rider shifts with ratings and tips, money gifts between players, job locks while another player is online in that life, career switching
- Character creator (cosmetic only), endings, badges, XP, daily challenge, leaderboard
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
js/avatar.js        character drawing
js/data/dialogue.js character speech in 6 languages (native speakers: edit lines here)
js/world.js         3D city (Three.js): third-person camera, joystick/WASD/tap walking, characters, mission beacons, FXN courier
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
