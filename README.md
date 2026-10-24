# The Plumb Doctor Ltd — website

Static one-page site. Plain HTML + compiled Tailwind CSS + a little vanilla JS. No framework, no build step needed to host it.

## Folder layout

```
index.html              ← all page content (sections are labelled with big comment banners)
assets/css/styles.css   ← compiled Tailwind (don't edit by hand — rebuild instead)
assets/js/main.js       ← menu, looping hero animation, treatment tabs, case notes slider, lightbox, booking form
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
- **Treatments** → `index.html` → `TREATMENTS` section. Each service is one tab `<button>` plus one matching panel. The `data-book` on a panel's "Book this treatment" button must match an option in the form's "What do you need?" dropdown.
- **Hero animation timing** → `assets/js/main.js` → `LOOP` (milliseconds for each state).
- **New Tailwind classes** → run `npm install` once, then `npm run build` (or `npm run watch` while editing). If a class you added doesn't show up, it's because CSS wasn't rebuilt.
- **Brand colours** → `tailwind.config.js` → rebuild.

### Adding a case (job photo)
1. Export it as two `.webp` files into `images/work/`: `name.webp` (~1600px long side) and `name-sm.webp` (~800px).
2. In `index.html` find the `CASE NOTES` section and copy one `<li class="case-slide">…</li>`.
3. Change the image `src`/`srcset`, `data-full`, `alt`, `data-caption`, the title, "Patient" and "Treatment".
4. The "Case 1 of 5" counters and the dots update themselves.

### Treatment picture tiles
Each treatment panel has an `rx-tile`: either a photo from `images/work/` or a small inline SVG scene. Swap any SVG tile for a real photo once the client sends one (e.g. a finished bathroom).

## Before going live — checklist

- [ ] Replace `https://www.example.gg` with the real domain (canonical, `og:url`, `og:image`, JSON-LD in `<head>`).
- [ ] **Point the form at the client.** For testing, the booking form currently sends to `toby1@greggs.org` (`action` on `#book-form`). Before handover, change it to the client's address.
- [ ] **Confirm the client's email address.** The newer services flyer says `the.plumb.doctor@outlook.com` (shown on the site); the older Facebook banner says `the_plumb_doctor@hotmail.com`. Swap if needed.
- [ ] **Activate the form:** FormSubmit emails an activation link the first time a form is submitted to a new address — click it once and every request after that lands in the inbox. This happens again when you switch the form to the client's email.
- [ ] Optional: after activation FormSubmit gives a random alias for the email. Swap it into the form `action` so the address isn't in the page source.
- [ ] Confirm the case notes with the client, especially the standby generator and the 500 litre cylinder (did he fit it, or service it?).
- [ ] Get the client to sign off the treatment descriptions and "what's involved" lists. The rest comes from their own flyers (free quotes, fully insured, breakdown cover, the servicing benefits).

## Images

- The red service sticker on the cylinder photo (another company's phone numbers) has been blurred.
- Clutter cropped: plastic bag (plant room), drink can and boxes (sink), drink can (generator).

## Hosting (Cloudflare Pages)

Push this folder to the GitHub repo → Cloudflare Pages → Connect to Git → framework preset **None**, build command **empty**, output directory **/**. (`node_modules/` is git-ignored and isn't needed to host.)
