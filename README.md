# The Plumb Doctor Ltd — website

Static one-page site. Plain HTML + compiled Tailwind CSS + a little vanilla JS. No framework, no build step needed to host it.

## Folder layout

```
index.html              ← all page content (sections are labelled with big comment banners)
assets/css/styles.css   ← compiled Tailwind (don't edit by hand — rebuild instead)
assets/js/main.js       ← menu, hero patient animation, symptom checker, gallery, lightbox, booking form
assets/fonts/           ← Bricolage Grotesque + Figtree + Caveat (self-hosted, OFL licence)
images/brand/           ← vector logo: mark, wordmark, full stacked logo (navy + white versions)
images/work/            ← job photos (name.webp 1600px + name-sm.webp 800px)
images/                 ← favicons + OG share image
src/input.css           ← Tailwind source, hero state animations, keyframes
tailwind.config.js      ← brand colours + fonts
```

## Brand

| Name    | Hex       | Used for                                         |
|---------|-----------|--------------------------------------------------|
| Navy    | `#073556` | Logo ink, text, dark sections                    |
| Scrubs  | `#D5E7F3` | Logo background, hero graph paper                |
| Sunny   | `#FFC93C` | Buttons (from the oil boiler servicing flyer)    |
| Pulse   | `#2ED39B` | "Healthy" heartbeat, ticks                       |
| Copper  | `#C97A3F` | Pipe graphics                                    |
| Coral   | `#FF6A55` | "Poorly" state and the emergency prescription only |

The logo in `images/brand/` was traced to SVG from the supplied 480px JPG, so it's sharp at any size. Fonts: Bricolage Grotesque (headings), Figtree (body), Caveat ("doctor's handwriting" notes only).

## Editing

- **Text** → edit `index.html`, save, done.
- **Symptom checker answers** → `assets/js/main.js` → `SYMPTOMS`. Each entry's `book` value must match an option in the form's "What's the problem?" dropdown.
- **New Tailwind classes** → run `npm install` once, then `npm run build` (or `npm run watch` while editing). If a class you added doesn't show up, it's because CSS wasn't rebuilt.
- **Brand colours** → `tailwind.config.js` → rebuild.

### Adding a gallery photo
1. Export it as two `.webp` files into `images/work/`: `name.webp` (~1600px long side) and `name-sm.webp` (~800px).
2. In `index.html` find the `CASE NOTES` section and copy one `<li>…</li>`.
3. Change the image `src`/`srcset`, `data-full`, `alt`, `data-caption` and the title + note text.

## Before going live — checklist

- [ ] Replace `https://www.example.gg` with the real domain (canonical, `og:url`, `og:image`, JSON-LD in `<head>`).
- [ ] **Confirm the email address.** The newer services flyer says `the.plumb.doctor@outlook.com` (used everywhere on the site); the older Facebook banner says `the_plumb_doctor@hotmail.com`. Swap if needed.
- [ ] **Activate the form:** submit the booking form once on the live site. FormSubmit emails an activation link to the address above — click it once and every request after that lands in the inbox.
- [ ] Optional: after activation FormSubmit gives a random alias for the email. Swap it into the form `action` so the address isn't in the page source.
- [ ] Confirm the photo captions with the client, especially the standby generator one.
- [ ] Get the client to sign off the symptom checker first-aid tips and the service descriptions. Everything else is taken from their own flyers (free quotes, fully insured, breakdown cover, the rhyme).

## Images

- The red service sticker on the cylinder photo (another company's phone numbers) has been blurred.
- Clutter cropped: plastic bag (plant room), drink can and boxes (sink), drink can (generator).

## Hosting (Cloudflare Pages)

Push this folder to the GitHub repo → Cloudflare Pages → Connect to Git → framework preset **None**, build command **empty**, output directory **/**. (`node_modules/` is git-ignored and isn't needed to host.)
