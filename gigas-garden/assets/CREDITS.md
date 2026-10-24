# Gigas Garden asset credits

## Creature stand-ins (until the Flow Studio chitin bug meshes land)

All four creatures use two CC0 bee models by Quaternius, cloned per creature and tinted at runtime into the Neon Vigil palette. CC0 means public domain, so no attribution is required. We credit the author anyway.

| File | Source | Author | License | Used for |
|---|---|---|---|---|
| `bug-armabee.glb` | "Armabee Evolved", https://poly.pizza/m/GcttdvsqsQ (GLB: https://static.poly.pizza/fb7d7a9e-5584-4e0b-a1bf-251fc9946696.glb), from the Quaternius "Ultimate Monsters" / Animated Animals set | Quaternius (https://quaternius.com) | CC0 1.0 Universal (Public Domain) | Hauler (Balt-Shell Carrier): cyan and largest. Warden (Thorn-Mantid Watcher): magenta. Both use its flying animations. |
| `bug-bee.glb` | "Bee", https://poly.pizza/m/HvfIku26CK (GLB: https://static.poly.pizza/1dbebe1f-7ef7-4886-ae25-4395b1dae452.glb) | Quaternius (https://quaternius.com) | CC0 1.0 Universal (Public Domain) | Lumen (Moth-Lantern Drifter): violet glow. Diver (Pelagic Chitin Skimmer): acid lime and smallest. |

Changes: both files were compressed with gltf-transform meshopt (183.8 KB to 70.7 KB, and 57.7 KB to 38.5 KB). Colours are tinted at runtime. If a model fails to load, its creature keeps the octahedron node.

## Environment

The jungle floor, First Water pool, basalt and crystal spires, and mega-city ruin towers are all procedural: they are drawn in code at boot, and no files are downloaded for them.

## Characters and plates

Neon Ultra, Praxia and VAL-17 GLBs are Autodesk Flow Studio exports owned by the creator. The backdrop plates and portraits are the creator's own Drive art.
