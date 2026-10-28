# How to: Second Life-style desktop controls in the Gigas Garden game

## What changed, and why

1. On a computer, the game used to move Neon around the screen with W A S D. The camera sat in one spot behind
   her and could not turn, zoom or look around. Phones already had Second Life-style controls (stick, drag to
   look, pinch to zoom). Jasmine asked for the desktop set too, so a computer now plays like Second Life.
2. Neon now turns. W and S walk her forward and back the way she is facing, and A and D turn her. The camera
   stays behind her as she turns.
3. The mouse moves the camera. Hold a mouse button and drag to look around her. Scroll to zoom. Zoom all the way
   in for a first-person view, like the phone pinch.
4. Click the ground and Neon walks there. A small cyan ring marks the spot.
5. Game keys now stay quiet while you type in the chat box. Before this change, typing a "c" in chat closed the
   chat window.
6. Phones are not changed. The new controls switch off whenever the touch controls are showing.
7. You don't need to upload anything. The new code adds no image or model files.

## The desktop keys and mouse

| Do this | What happens |
| --- | --- |
| **W** or **Up arrow** | Walk forward, the way Neon is facing |
| **S** or **Down arrow** | Walk backward, a little slower |
| **A** or **Left arrow** | Turn Neon left |
| **D** or **Right arrow** | Turn Neon right |
| Hold **Shift** while walking | Run (about 1.8 times faster) |
| Hold the left or right mouse button and drag on the game | Look around Neon (orbit the camera). Zoomed all the way in, this looks around in first person. When she walks again, the camera eases back behind her. |
| **Scroll wheel** | Zoom in and out. All the way in is first person (Neon is hidden so she doesn't block the view). |
| **R**, **Home** or **Esc** | Put the camera back behind Neon. Esc still closes the Bridge Console menu too. |
| One left click on the ground (no drag) | Neon walks to that spot. Any walk key stops the walk. |
| One left click on something close enough to use | Same as pressing E: interact |
| **E** or **Space** | Interact (unchanged) |
| **V** | Switch Garden / Side view (unchanged; Side view keeps its old left-right lane controls) |
| **Q** | Cycle tools (unchanged) |
| **B** | Build menu (unchanged) |
| **C** | Chat (unchanged) |

Things to know:

- There is no flying. The game has no up-and-down movement, so Second Life's fly keys (E, C, Page Up and Page
  Down) are not used. E and C keep their game jobs.
- There is no sidestep (strafe). In Second Life that is Shift plus the arrows, but here Shift means run.
- Click-to-walk keeps to the same walk limits as the keys. Before the vines are cut, Neon stops at the vine gate.
- The on-screen arrow pad on a computer works as before.
- The "Move" tip in Hexa's opening lines now lists the desktop keys on a computer. On a phone it reads the same
  as before.

## Exact files and lines

Only one file changed: `web/public/gigas-garden/index.html`. Line numbers are from this branch.

1. Lines 949–958: `NV_DESKTOP_POINTER` picks the desktop or phone wording for the controls tip in the opening lines.
2. Lines 3064–3088: the keyboard section. Keys are ignored while typing in a text box (Esc leaves the box).
   R, Home and Esc reset the camera. Any walk key cancels click-to-walk. Keys are let go if the window loses
   focus, so Neon never keeps walking on her own.
3. Lines 3132–3145: in the render loop, Garden view on a computer uses the new walk and turn movement and keeps
   the camera behind Neon's facing. The old movement code still runs for the phone stick and the arrow pad.
4. Line 3250: "Play again" also turns Neon back to face up the path.
5. Lines 3547–3702: new section 12, "Desktop controls". It covers walk and turn, run, mouse orbit, wheel zoom,
   click-to-walk with its ring marker, and click-to-interact. It only acts when the touch controls are off.
6. Section 11 (phone touch controls) only had one comment line changed. Its code is the same.

## How to test it

The live game is locked right now. The Google client ID is still missing, so the sign-in page can't let anyone in.
Until that's fixed, test from the pull request on a computer. After the change is merged and the live page is
updated, test on the live site.

### On a computer

1. Open the game and tap the sigil. Click CONTINUE through Hexa's lines. The controls tip should read
   "W and S walk, A and D turn, Shift runs…".
2. Hold **W**. Neon walks up the path. Tap **D** a few times. She turns right and the camera swings around
   behind her.
3. Hold **Shift** and **W**. She runs.
4. Hold the right mouse button and drag left and right. The camera circles her. Let go, then press **W**. The
   camera slides back behind her.
5. Scroll up until the view goes first person and Neon disappears. Press **R**. The camera goes back to normal.
6. Click a spot on the ground ahead. A cyan ring appears and Neon walks there. Click again, then press **S**. The
   walk stops.
7. Walk up to a glowing node until the INTERACT button lights up, then click the node. It acts like pressing E.
8. Press **C** and type in the chat box (once you are signed in). Neon must not move, and the chat must stay
   open while you type "c". Press Esc to leave the box.
9. Press **V**, **Q** and **B** to check they still do what they did before.

### On a phone

1. Open the game on your phone. Use the stick, drag to look, pinch to zoom, and tap the reset button.
2. All of it should work exactly as before. The opening controls tip should still say
   "Move with WASD, the arrows or the pad…".

## How to undo it

Never force-push.

1. Before the pull request is merged, close it. Nothing changes.
2. After it's merged, open the pull request on GitHub and click **Revert**. That opens a new pull request that
   takes the change back out. Merge it, then update the live game page the usual safe way (see
   `docs/howto/restore-game-gate.md`, "Updating the live game page later").

## What was not touched

`gh-pages`, `deploy/build-pages.sh`, `remix.json` and Supabase were not touched, and no image or model files
were added.
