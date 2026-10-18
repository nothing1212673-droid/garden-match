# Garden Match

A finished, cozy HTML5 memory game made as a **Fiverr portfolio demo**. All game UI is in English. Original inline SVG illustrations, system fonts, vanilla HTML/CSS/JavaScript. No packages, engine, build step, accounts, ads, payments, or network requests.

The visual style uses bold sans-serif typography, a soft mint background, deep green panels, lime accents, rounded controls, and pastel illustrated cards. The same visual system extends to the welcome screen, game dashboard, dialogs, and final results.

## Run

Hosted demo: [Play Garden Match](https://nothing1212673-droid.github.io/garden-match/).

Source repository: [nothing1212673-droid/garden-match](https://github.com/nothing1212673-droid/garden-match).

Open **index.html** in a modern browser (Chrome, Edge, Firefox, or Safari). Double-clicking the file is enough. Keep `styles.css` and `game.js` alongside it. The game works offline, including when opened using `file://`. JavaScript must be enabled.

You can also serve this folder with any static web server. No server is required to play.

## Play

- Choose **Let’s play**. Reveal two cards; each two-card attempt is one move.
- Matching cards stay visible. A nonmatching pair turns back after an 850 ms peek and a short return animation. Additional card input is blocked until both cards are face down.
- Complete **4 pairs**, then **6 pairs**, then **8 pairs**. Choose **Next garden** between levels. After all 18 pairs, the victory screen shows your total moves and time.
- Each level and every new game gets a Fisher–Yates shuffle. A shuffle can legitimately produce the same order by chance.
- **Restart game** starts the whole three-level journey again at level 1 and clears current totals. **Grow another garden** does the same after victory. The saved best remains.
- The timer starts on the first card of each level. It counts real elapsed time, including time in another browser tab or in the rules dialog; it stops immediately at the final match and pauses between levels. Total time is the sum of all three levels, rounded down once to whole seconds. Display: minutes:seconds, with no artificial time limit.
- Your best **completed three-level game** is saved using `localStorage` under `garden-match.best.v1`. Fewer moves wins; when moves are equal, fewer seconds wins. An equal score does not replace the record. Incomplete games are not saved.
- Records belong to this browser/profile and location. Private mode, clearing browser data, moving the folder, or a different browser can affect persistence. Storage policies for `file://` vary between browsers. If saving is blocked, the game remains playable and reports that the best is available only for this visit. For stable storage across visits, optionally use the same static-host address each time.

## Keyboard & accessibility

Use Tab / Shift+Tab to reach controls and cards, Enter / Space to activate, and arrow keys to move between cards. Home / End moves to the first / last card. Card labels reveal the item only while it is visible or matched. Matched and already open cards ignore repeated input. Screen readers receive match and level updates; the timer does not announce every tick. Rules use a native modal dialog, closeable with Escape. The level-complete dialog keeps focus until **Next garden** is chosen. Focus outlines, touch targets, text labels, and reduced-motion support are included.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Welcome screen, game board, dialogs, victory screen, inline SVG artwork |
| `styles.css` | Garden theme, responsive layouts, card animations, focus and reduced-motion styles |
| `game.js` | Deck shuffling, input lock, timer, scoring, level progression, local record |
| `README.md` | Launch instructions, rules, controls, file guide |
| `QA.md` | Browser verification results and limitations |
| `.nojekyll` | Publishes the static files directly on GitHub Pages |

Only the first three files are required to run the game. There are no external assets or dependencies. The project can be copied as one folder or published to any static host.
