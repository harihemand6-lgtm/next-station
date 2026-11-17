# Next Station

An India-wide life simulator. Pick a state, pick a life, make choices and see where they lead.
Static web game: no accounts, ₹0 running cost. Optional live players and chat via a free Supabase project (see SUPABASE_SETUP.md).

## What's inside

- 10 lives: Street Food Hustle, The 9–5, Government Job, Influencer, Startup Founder, Craft Brand, Film Star, Cricketer, Reality Show, The Trader
- 6 playable states: Kerala, Maharashtra, Punjab, West Bengal, Rajasthan, Karnataka (all 36 states/UTs on the map)
- Character creator (cosmetic only), tap-to-ask character chat, endings, badges, XP, daily challenge, share text
- Saves live in the player's own browser (localStorage). Nothing is collected.

## Files

```
index.html          page shell
css/style.css       all styling
js/data/states.js   map + state packs (cast, food, craft, festival, state events)
js/data/lives.js    the 10 lives (events, economics, endings)
js/data/common.js   shared events, dialogue, chat answers, badges
js/engine.js        game rules (deterministic, seeded)
js/avatar.js        character drawing
js/data/dialogue.js character speech in 7 languages (native speakers: edit lines here)
js/world.js         open city map: walking, characters, speech bubbles
js/net.js           live players, preset phrases, 18+ typed chat, filters, reports
js/config.js        Supabase URL + publishable key (empty = solo mode)
js/app.js           screens and buttons (GAME_NAME and GRIEVANCE contact at the top)
```

## Host it free (pick one)

- **Netlify Drop:** go to app.netlify.com/drop and drag this whole folder in. You get a link in seconds.
- **GitHub Pages:** create a public repo, upload these files, then Settings → Pages → Deploy from branch → main.

## Add a new state

Copy one state block in `js/data/states.js` (e.g. `KL`), give it the map code from `AE_MAP` (e.g. `TN`), and change the cast, food, craft, festival and 4 events. It becomes playable automatically.

## Rename the game

Change `GAME_NAME` at the top of `js/app.js` and the `<title>` in `index.html`.
