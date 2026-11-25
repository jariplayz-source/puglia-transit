# Shards credits

**3D monsters:** Grab3D (https://grab3d.com), CC0 1.0 (public domain). Grab3D says the
models were made with AI help (an image-to-3D tool) and then cleaned up in Blender.
They were collected via https://github.com/oosawak/cc0-monsters. For this app they are
simplified, given smaller textures and quantised (`tools/shards-models-compress.mjs`).
The card pictures are rendered from the same models (`tools/shards-card-art.py`).

**3D engine:** three.js (https://threejs.org), MIT licence, © 2010-2024 three.js authors.
It is bundled as `app/assets/three3d.js` (`tools/three3d-entry.js`, built with esbuild).
