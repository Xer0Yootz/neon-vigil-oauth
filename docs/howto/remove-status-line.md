# Remove the GRID OK status line

## 1. What changed and why

1. Jasmine asked on 10-25 to take out "GRID OK | IWW VIEWPORT | DEEP TIME 5150" completely.
2. The website's IWW desktop taskbar (the grey bar along the bottom) showed "GRID OK | IWW VIEWPORT | DEEP TIME 5150 | QUEEN: PRAXIA" next to the Start button. That text is gone. The Start button and your name on the right stay where they were.
3. The game file had "(DEEP TIME 5150)" in a code comment at the top. Players never saw it, but it is gone too.
4. Nothing else changed. The game's ONLINE | date | weather bar at the top is untouched, and other "5150" uses (Earth 5150, the 5150 app name, the score) are untouched.
5. The chat AI side (Hexa and Cyphr no longer posting or mentioning this line) is in PR #7, on its own branch.

## 2. Files

1. `web/src/pages/IWWDesktop.jsx`: removed the status text from the bottom taskbar.
2. `web/public/gigas-garden/index.html`: removed "(DEEP TIME 5150)" from the header comment.
3. `docs/howto/remove-status-line.md`: this guide.

## 3. How to check it

1. Wait until this pull request is merged and the site is published. Until then the live site still shows the old line.
2. On desktop: open the site, sign in, and open the IWW desktop. Look at the grey bar along the bottom. It should show "Start" on the left and your name on the right, with no GRID OK text between them.
3. On your phone: do the same in Safari. The bottom bar should look the same, with no GRID OK text, and nothing should overlap.
4. In the game: open Gigas Garden. The ONLINE bar at the top should look the same as before.

## 4. How to undo it

1. Open this pull request on GitHub.
2. Click the "Revert" button near the bottom of the page.
3. GitHub makes a new pull request that puts the line back. Merge that one, then publish as usual.
