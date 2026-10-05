# Susegad — coffee house & bakery

Marketing site for **Susegad**, a (fictional) coffee house and bakery in an old Portuguese-era house in Fontainhas, Panaji, Goa. It is a single page — story, menu, specials, bakery, regulars, events, visit and reservations — plus a 404 page.

The site is plain HTML, CSS and vanilla JavaScript. There is no framework, no build step and no dependencies. Every illustration is hand-drawn SVG, so the site looks finished without any photography.

## Structure

```
index.html              the whole site, section by section
404.html                not-found page (Vercel serves it automatically)
style.css               all styles; design tokens live in :root at the top
script.js               progressive enhancements (see below)
vercel.json             clean URLs + long-lived caching for /assets
assets/
  tile.svg              the azulejo tile, used as a repeating background
  favicon.svg           tile mark
  apple-touch-icon.png  180×180 home-screen icon
  fonts/                self-hosted WOFF2 files (Latin subset) + their OFL licences
  og-image.png          1200×630 social share image
  illustrations/        small SVG drawings (bebinca, pour-over, roaster…)
```

The large drawings (house front, map, rotating stamp) are inline in `index.html`, because they use the page's fonts and need accessible titles.

`script.js` handles:

- the "Open now / Closed · opens Tue 8:00 am" status, worked out in Goa time (Asia/Kolkata), plus highlighting today in the hours table
- the sticky header and the mobile menu (focus is trapped while it is open, Esc closes it)
- the menu tabs (arrow keys, Home and End all work)
- reveal-on-scroll, which is skipped when someone prefers reduced motion
- validation and success states for the reservation and newsletter forms

Without JavaScript the page still works: every menu section is shown in full, nothing is hidden behind animation, and the forms fall back to native browser validation.

## Run it locally

```bash
npx serve .
```

Then open the address it prints (usually http://localhost:3000). Any static file server works.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the repository.
3. Set **Framework Preset** to **Other**. Leave the build command empty and the output directory as the repository root.
4. Click **Deploy**.

`vercel.json` turns on clean URLs and caches everything in `/assets` for a year. Because of that cache, **rename an asset when you change it** (for example `og-image-v2.png`) so visitors get the new file.

Once you have the real domain, replace `https://susegadcoffee.in/` in the `<head>` of `index.html` (the canonical link, the Open Graph and Twitter tags, and the JSON-LD block). Social networks need absolute URLs for the share image.

## Customising

**Colours and type.** All colours, fonts, the type scale and spacing are custom properties at the top of `style.css`:

```css
--cream, --paper            backgrounds
--cobalt, --cobalt-deep     the main accent (azulejo blue)
--terracotta, --ochre       secondary accents, used sparingly
--ink, --ink-soft, --ink-muted
--font-display: "Gloock"    headlines and the wordmark
--font-body: "Instrument Sans"
--font-mono: "DM Mono"      prices, hours, small labels
```

The fonts are self-hosted from `assets/fonts/` (Latin subsets only, declared with `@font-face` at the top of `style.css`), so the site makes no third-party requests. All three families are under the SIL Open Font License; the licence files sit next to the fonts. To swap a font, drop the new `.woff2` files into `assets/fonts/`, update the `@font-face` blocks and the custom property, and update the `<link rel="preload">` in the `<head>` of both HTML files. None of the three fonts has a rupee glyph, so `₹` falls back to the system font, which every current OS supports. The SVG drawings use hard-coded hex values that match the palette; search for the old hex value if you change a colour.

**Menu.** Each section of the menu is a `<div role="tabpanel">` in `index.html`. An item looks like this:

```html
<li class="item">
  <p class="item__head"><span class="item__name">Cortado</span><span class="item__leader" aria-hidden="true"></span><span class="item__price">₹190</span></p>
  <p class="item__desc">Equal parts espresso and warm milk.</p>
  <ul class="tags"><li class="tag tag--vegan">Vegan</li></ul>
</li>
```

Tags come in three styles: `tag--fav` (house favourite), `tag--vegan` and `tag--nuts`. To add a menu section, add a `<button role="tab">` to the tab list and a matching panel; the script picks it up automatically. The scrolling ticker under the hero lists a few items too — keep it in step with the menu. Its list appears twice, so update both copies.

**Hours.** The opening time, closing time and closed day are set once at the top of `script.js` (`HOURS`). The visible text appears in the top bar, the hero, the hours table, the mobile menu, the footer and the JSON-LD block.

**Specials and events.** "This week at the counter" and "Small gatherings" are plain markup in `index.html`. Change the copy, prices and dates there.

**Forms.** The reservation and newsletter forms validate in the browser and show a success message. They do **not** send anything yet. Before launch, connect them to a form service, an email endpoint or a booking tool: replace the `preventDefault()` success path in `script.js` with a `fetch()` to your endpoint.

## Adding real photographs

The design is built to work without photos, but it has natural places for them if the client has good ones:

- **Hero** — swap the inline house drawing in `.hero__art` for an `<img>` of the real front. Use a portrait image (about 4:5) and keep the rotating stamp, which is positioned over the image's corner.
- **This week at the counter** — each `.special__art` block holds one illustration. Replace the `<img>` with a photo and add `object-fit: cover; width: 100%; height: 100%;` so it fills the coloured panel.
- **Bakery steps** — the round `.step__art` badges can take square photos (crop them to a circle with `border-radius: 50%`).
- **Our story** — a photo of Anika and Joel would sit well below the story text in `.story__body`.

Put photos in `assets/photos/`, export them as WebP or AVIF at about twice their display size, give each one a descriptive `alt`, and add `width`, `height` and `loading="lazy"` (except in the hero).
