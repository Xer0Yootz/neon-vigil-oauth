# Neon Vigil v18 — editable, private working web Bible

**Status:** This is a transcription and navigation build of the supplied v18 HTML, not a canon ruling. Do not publish or commit without owner approval.

## Contents
- `bible/index.html`: standalone static viewer, open directly as a local file.
- `bible/bible.json`: **single editable source of truth** for all content and image references.
- `bible/bible-data.js`: generated data bundle for local `file://` access (browsers often block `fetch` on local JSON). Do not edit it.
- `bible/viewer.js` and `bible/style.css`: viewer and visual styling.
- `bible/assets/`: extracted, byte-for-byte images from the supplied HTML.
- `render.py`: rebuild and validate the JS data bundle. Python 3 standard library only.
- `notion-import/`: section Markdown files for import.
- `ANCHORS.md`: complete anchor inventory.

## Edit and re-render
1. Unzip the package. Open `bible/bible.json` in any UTF-8 editor.
2. Find the desired entry in `entries` by its `id`. Edit its `title`, `section`, or `html` fields. The `html` value contains the original source-page markup. Keep its JSON escaping valid.
3. To add an entry, add an object with a unique `id`, `title`, `section`, `source_page`, and `html`. For an existing entry, **do not change its `id`** or existing game links will break.
4. To change a picture, put a verified image in `bible/assets/`, edit the matching `<img src="assets/filename.ext">` in the entry's `html`, and keep its `alt` and visible `<figcaption>`. Do not map the unnamed fauna grid by guesswork.
5. Run `python3 render.py` in the package root. This validates anchors and preserves the 90 original source pages; it regenerates `bible/bible-data.js`.
6. Double-click `bible/index.html` in a browser. **No server, dependency install, or build tool is required for viewing.** Reload after each re-render.
7. For Markdown import, regenerate the section Markdown from the edited JSON before importing; the included Markdown files are snapshots of the delivered build, not a live sync.
8. Review every correction against the approved source and obtain the owner's exact wording approval before treating anything as canon.

## Source audit
- Supplied HTML: **90 source pages**, retained in original order.
- Supplied HTML: **92 image occurrences**, all encoded as data URLs. Images are extracted and deduplicated by content hash; repeated images may point to one asset file.
- All image references are captioned. The source does not independently establish owner approval for every image.
- Fauna and Flora receive individual alphabetically navigable entries **derived from the existing v18 tables**; no species facts were invented. Portraits without an individually verified match have explicit gaps.
- The original v18 source contains statements and labels that may conflict with later locks. This package preserves the source for review rather than silently revising canon.
- The original build.py uses private machine-specific paths. It is **not included as an executable build dependency** and is not needed for this repo. No credentials are included.

## Game links
When hosted under the repository's `/bible/` path, link to `/bible/#neon`, `/bible/#praxia`, `/bible/#fauna-assassin`, etc. See `ANCHORS.md` for **all** exact IDs. Direct browser navigation and reload preserve hashes.

## Notion-native route
In Notion, choose **Import → Markdown & CSV** and import the files in `notion-import/` into a private page in the Neon Vigil Canon Hub. Notion imports text, headings and many simple tables; it may not resolve the relative image paths. Upload images from `bible/assets/` manually where necessary, retaining captions. Importing does not make the content canon.

Notion cannot reproduce the source's exact A4 pagination, custom fonts, CSS gradients/borders, interactive tab bar, or pixel-exact image positions. The Markdown is a content mirror, not a pixel match.

## Notion live embed route — only after explicit publishing approval
1. Commit the `bible/` directory to `xer0yootz/neon-vigil-oauth` only after the owner approves publication and the exact content. This package does not do that.
2. Configure the site's static hosting so the repository's `/bible/index.html` is reachable at `https://YOUR-ACTUAL-DEPLOYED-DOMAIN/bible/`. **Replace the domain with the verified deployed domain; no live URL has been verified.**
3. Open the private Canon Hub page in Notion, type `/embed`, select **Embed**, paste `https://YOUR-ACTUAL-DEPLOYED-DOMAIN/bible/`, and select **Embed link**. Drag the block edges to resize its height/width.
4. If Notion refuses to embed, the site may send `X-Frame-Options` or a restrictive `Content-Security-Policy frame-ancestors` header. Fix framing only with the site owner's approval, or use a plain link/bookmark block instead. If the frame is clipped, resize the block or use the **Open as page** link.
5. The embed reflects the live hosted site and retains its styling **inside the iframe**, but Notion's surrounding page remains Notion-styled.

## Security and approval
Relative file paths only inside the viewer. No keys, tokens, private links, analytics, external scripts, or publishing commands. Keep the site private until explicitly authorized.
