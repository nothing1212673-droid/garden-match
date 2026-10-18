# Garden Match — verification

Verified on **18 October 2026** using installed Google Chrome with Playwright, headless browser sessions, offline mode, and direct `file://` navigation. Browser automation tools were used only for development; the delivered game has no dependencies.

## Passed

- Welcome, portfolio-demo label, rules, Escape dismissal, and focus return.
- Complete journeys through levels 1, 2, and 3 with exactly 8, 12, and 16 cards. A perfect journey totals **18 moves / 18 pairs**.
- Correct two-card move counting; mismatches add a move. Repeated activation of an open or matched card adds no move.
- Extra-card input blocked during both the 850 ms mismatch peek and the full 330 ms return interval. Input works again afterward.
- Restart clears revealed/matched cards, counters, and pending mismatch callbacks. Restart from levels 2 and 3 returns to level 1. Play again starts a fresh journey.
- Repeated restarts produce different shuffled layouts while retaining exactly two copies of each item.
- Timer remains at zero before the first card, advances after play starts, stops on completion, and pauses between levels. Each next level begins at zero.
- Level dialogs, Next garden, progress indicators, final victory, and cumulative scoring.
- Finishing a level while the rules are open closes the rules before presenting the completion dialog. Escape cannot accidentally dismiss the level checkpoint.
- Best result saved after a completed journey and retained after reload. A worse result cannot overwrite it. Fewer moves outrank a faster time; for equal moves, faster time wins. Equal or slower times leave an equally low move record intact.
- Denied storage: all levels still playable and victory explains that the best is only available for this visit. Malformed saved JSON is ignored.
- Tab, Enter, Space, arrows, Home, and End; visible focus; accessible labels with no hidden-card identity disclosure. Rules use native dialog focus handling. Reduced-motion preference removes transitions.
- Touch-emulated play, matching, progression, restart, and victory.
- Level-3 layout at widths **320, 360, 390, 600, 768, and 1440 px** without horizontal overflow. All cards remain at least 44 × 44 px.
- Welcome layout at **320, 390, 768, and 1440 px** without horizontal overflow.
- Visual inspection of desktop/mobile welcome, board, revealed/matched cards, completion dialog, and victory screenshots.
- No HTTP/HTTPS requests and no browser JavaScript exceptions during the primary verification run. `node --check game.js` passed.

## Fixes made during verification

- Contained a rotated decorative ellipse that extended 8 px outside the 320 px welcome viewport.
- Prevented overlapping rules and level-completion dialogs when the last pair is matched just before opening the rules.
- Kept the mismatch input lock active until the return animation has finished; restart cancels both stages of that delay.
- Set minimum hit areas for the rules and dialog-close controls.

## Scope

The modern visual refresh was rechecked with the primary offline browser verification: all three levels, restart, record persistence, mismatch locking, keyboard focus, reduced motion, and storage fallback passed. Desktop and mobile screenshots were visually inspected. A final targeted check confirmed that the welcome/header has no horizontal overflow at 320, 360, 390, 600, 768, 1024, and 1440 px, after keeping the header labels on one line. The game logic and storage key were retained.

Mobile checks use browser viewport/touch emulation, not physical devices. Chrome was tested; Firefox, Safari, physical devices, and screen-reader speech output were not tested. Semantic labels and live regions were inspected programmatically. Browser settings can block `file://` local storage; the fallback was tested and is documented in README. There is no claim that records sync between browsers, files, or devices.

The initial creation added only the `demo-garden-match` folder. The subsequent requested visual refresh updates that project's HTML, CSS, and documentation; other workspace projects remain untouched.
