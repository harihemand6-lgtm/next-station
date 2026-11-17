# Next Station

An India-wide life simulator. Pick a state, pick a life, make choices and see where they lead.
Static web game: no server, no accounts, no API keys, ₹0 running cost.

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
js/app.js           screens and buttons (GAME_NAME is set at the top)
```

## Host it free (pick one)

- **Netlify Drop:** go to app.netlify.com/drop and drag this whole folder in. You get a link in seconds.
- **GitHub Pages:** create a public repo, upload these files, then Settings → Pages → Deploy from branch → main.

## Add a new state

Copy one state block in `js/data/states.js` (e.g. `KL`), give it the map code from `AE_MAP` (e.g. `TN`), and change the cast, food, craft, festival and 4 events. It becomes playable automatically.

## Rename the game

Change `GAME_NAME` at the top of `js/app.js` and the `<title>` in `index.html`.
