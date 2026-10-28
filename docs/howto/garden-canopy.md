# Gigas Garden: green canopy and trees

Branch `neon-vigil/garden-canopy`. Nothing here is live. It reaches the public site only when you merge it and say to publish.

## What changed and why

1. **Giant trees now line the Garden walk.** You asked for a light to medium canopy in canon green with moss, so about
   45 trees (43 placed) now stand on both sides of the Garden, from the airlock ramp (z 0) to the edge of the Sutro
   Baths (z 52). They are not over the Infiniti 6 deck and not over Sutro Baths.
2. **What a tree has:** a dark trunk with faint cyan veins, buttress roots at the foot, green moss on the lower trunk
   and roots, a long limb that reaches out over the walk, and 2-3 leafy crowns. Hanging moss drips from the limb tips.
   Crossed-card ferns grow along the edges of the walkway and around the tree feet.
3. **Colors follow your look note (5:08 PM):** "Garden trees and foliage mix magenta and green lightly, with realism
   glimmering through and an anime feel over all of it." So the crowns are mostly green with light magenta mixed in:
   a few magenta leaves, some magenta-lit leaf tips, and a magenta lean on the undersides of the crowns. The moss,
   ferns and hanging moss stay green. The shading is flat cel shading (anime) with a light touch of painted bark and
   leaf detail (the realism). **Please confirm the mix on the PR**; it is easy to make more or less magenta.
4. **The walk stays clear.** Trunks and roots stand outside the walk limits, so Neon never walks into one. Only limbs
   and crowns reach in overhead, and the middle of the sky stays open. Ferns keep away from the walkway centre, the
   airlock vines, the pool, every interaction point and the Sutro area.
5. **It is light on phones.** The whole canopy is 4 draw calls on full graphics and 3 on lite graphics, about 33,000
   triangles on full and 12,000 on lite. Lite graphics shows 25 trees, fewer ferns and no hanging moss. If a phone
   drops below 45 fps, the game's automatic switch to lite graphics trims the canopy too.
6. **Nothing for you to upload.** Every texture is painted in code when the page loads. No pictures or model files
   were added. No lore, no new words on screen.
7. **Fog still goes on last.** The canopy is built before any fog or mist, so the fog-last change (branch
   `neon-vigil/fog-last-pass`) will lay its fog over the trees like everything else.
8. **Side view is unchanged.** The trees belong to the Garden view only and hide in Side view, like the other
   Garden scenery.

## Files

- `web/public/gigas-garden/index.html`: one new block, about lines 1658-1949. It starts with the comment
  `GREEN CANOPY + TREES` and ends with `const gardenCanopy = buildGardenCanopy();`. Nothing else in the file changed.
- `docs/howto/garden-canopy.md`: this guide.

## How to test it

Desktop:
1. On your computer, open a terminal in the repo, then run `cd web`, `npm install` (first time only) and `npm run dev`.
2. Open `http://localhost:5173/gigas-garden/` and sign in as usual.
3. Tap the sigil and skip the opening lines. Walk down the ramp and through the airlock vines.
4. Look for tall trees on both sides, limbs and green crowns overhead, moss at the tree feet and ferns along the edge.
   Drag to look up: the canopy should cover part of the sky, not all of it.
5. Walk the whole Garden to the Sutro Baths sign. You should never bump into a trunk, and nothing should cover the
   pool, the crystals or any glowing interaction point.
6. Switch to Side view. The trees should be gone there, same as before.
7. Add `?gfx=lite` to the link and reload: fewer trees, no hanging moss. `?gfx=hi` shows the full set.

Phone:
1. Open the same link on your phone (same Wi-Fi, use your computer's address instead of `localhost`), or test on the
   live site after you publish.
2. Walk with the left pad, drag with one finger to look up, and check the same things as above.
3. If the phone feels slow, the game will switch itself to lite graphics after a few seconds. That is expected.

What I tested (headless browser on the box, local server, a stand-in session in the test browser only, never in the
code): desktop 1280x800 and phone 390x844 on full graphics, and desktop on lite. No new console errors (only the two
"file not found" lines that main already has: `game-main.ts` and `assets/nwd-logo.glb`). Screenshots are on the box
in `/workspace/nvcode/screens/canopy-*.png`.

## How to undo it

- Before merging: close the PR. Nothing else changes.
- After merging: open the merge commit on GitHub and click **Revert**, then merge that revert PR. The trees come out
  in one step.
- If it was published to gh-pages: revert that gh-pages commit the same way. Never force-push.

## Steps only you can do

1. Look at the screenshots and confirm the magenta and green mix, then merge if you're happy.
2. Publishing happens only when you say so.

## Queries for you (held, not changed)

- **Q1. How much magenta?** Now it's light (a few leaves, tips, crown undersides). Say "more" or "less" and I'll tune it.
- **Q2. Tree count.** 43 trees on full graphics and 25 on lite. Want them thicker or sparser?
- **Q3. Flow trees later.** The reference trees in `/workspace/flow_refs_2026-10-25/` could replace some of these
  with Flow Studio models later, which would need your GitHub web upload. Keep these painted trees for now?
