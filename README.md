# Susegad — Goan coffee house & bakery

Marketing site for **Susegad**, a (fictional) Goan coffee house and bakery at 127 Greene Avenue in Fort Greene, Brooklyn. Its storefront is painted like a Portuguese-era house in Fontainhas, Panjim, with cobalt shutters and a tiled bench out front. It is a single page plus a 404 page. The page covers:

- story and menu
- latte art
- weekly specials
- bakery and roastery
- the art on the walls
- regulars and events
- visit details and reservations

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
  og-image-v2.png       1200×630 social share image
  fonts/                self-hosted WOFF2 files (Latin subset) + their OFL licenses
  illustrations/        small SVG drawings (bebinca, pour-over, roaster, latte…)
  art/                  the six works in "On the walls", plus the wall they hang on
```

Some drawings are inline in `index.html`, because they use the page's fonts, need accessible titles, or are animated: the storefront, the map, the rotating stamp and the six latte-art cups.

`script.js` handles:

- the "Open now / Closed · opens Tue 7:00 am" status, worked out in Brooklyn time (America/New_York), plus highlighting today in the hours table
- the sticky header and the mobile menu (focus is trapped while it is open, Esc closes it)
- the menu tabs (arrow keys, Home and End all work)
- reveal-on-scroll, including the latte-art "pour" (the foam blooms out of the crema once). Both are skipped when someone prefers reduced motion.
- the artwork lightbox: a native `<dialog>`. Esc or a click on the backdrop closes it, the arrow keys step through the works, and focus goes back to the frame you opened.
- validation and success states for the reservation and newsletter forms

Without JavaScript the page still works:

- every menu section is shown in full
- nothing is hidden behind animation
- each framed artwork links straight to its full-size image
- the forms fall back to native browser validation

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

`vercel.json` turns on clean URLs and caches everything in `/assets` for a year. Because of that cache, **rename an asset when you change it** (for example `og-image-v3.png`) so visitors get the new file.

Once you have the real domain, replace `https://susegad.coffee/` in the `<head>` of `index.html`: the canonical link, the Open Graph and Twitter tags, and the JSON-LD block. Social networks need absolute URLs for the share image. The phone number uses the 555-01xx range, which is reserved for fiction; replace it everywhere before launch.

## Customizing

**Colors and type.** All colors, fonts, the type scale and spacing are custom properties at the top of `style.css`:

```css
--cream, --paper            backgrounds
--cobalt, --cobalt-deep     the main accent (azulejo blue)
--terracotta, --ochre       secondary accents, used sparingly
--ink, --ink-soft, --ink-muted
--font-display: "Gloock"    headlines and the wordmark
--font-body: "Instrument Sans"
--font-mono: "DM Mono"      prices, hours, small labels
```

The fonts are self-hosted from `assets/fonts/`. Only the Latin subsets are included, declared with `@font-face` at the top of `style.css`, so the site makes no third-party requests. All three families are under the SIL Open Font License, and the license files sit next to the fonts.

To swap a font:

1. Drop the new `.woff2` files into `assets/fonts/`.
2. Update the `@font-face` blocks and the custom property.
3. Update the `<link rel="preload">` in the `<head>` of both HTML files.

The SVG drawings use hard-coded hex values that match the palette; search for the old hex value if you change a color.

**Menu and prices.** Prices are in US dollars, set in DM Mono. Use cents for drinks and bakes (`$4.50`) and whole dollars for plates (`$13`). Each section of the menu is a `<div role="tabpanel">` in `index.html`. An item looks like this:

```html
<li class="item">
  <p class="item__head"><span class="item__name">Cortado</span><span class="item__leader" aria-hidden="true"></span><span class="item__price">$4.50</span></p>
  <p class="item__desc">Equal parts espresso and warm milk.</p>
  <ul class="tags"><li class="tag tag--vegan">Vegan</li></ul>
</li>
```

Tags come in three styles: `tag--fav` (house favorite), `tag--vegan` and `tag--nuts`. To add a menu section, add a `<button role="tab">` to the tab list and a matching panel; the script picks it up automatically.

The scrolling ticker under the hero lists a few items too, so keep it in step with the menu. Its list appears twice; update both copies.

**Hours.** The opening time, closing time, closed day and time zone are set once at the top of `script.js` (`HOURS`, `TIME_ZONE`). The visible text appears in several places: the top bar, the hero, the hours table, the mobile menu, the footer, the reservation time slots and the JSON-LD block.

**Latte art.** The six cups in "The pour" are inline SVG. Each one is a saucer, a cup in its own glaze, the crema rings and a `<g class="latte__foam">` group holding the pattern. The pour animation scales and turns that group, so keep the class if you redraw a pattern.

**On the walls.** Each artwork is an `<li class="work">` in the gallery.

- **Position.** On the wall, set it with `--x`, `--y` and `--w`, in pixels of a 1320-wide wall. The thickness of the frame and the mat is set with `--f` and `--m`.
- **Frame.** The style comes from the modifier class, for example `work--oil` for the oval gilt frame.
- **Label.** The museum label underneath is plain markup. A sold work gets `work__dot--sold`, the red dot.

To hang a new show:

1. Replace the SVGs in `assets/art/`.
2. Update the labels and alt text.
3. If frames move, regenerate the wires on `assets/art/wall.svg`. They are simple lines from the picture rail to the top of each frame.

**Specials and events.** "This week at the counter" and "Small gatherings" are plain markup in `index.html`. Change the copy, prices and dates there.

**Forms.** The reservation and newsletter forms validate in the browser and show a success message. They do **not** send anything yet. Before launch, connect them to a form service, an email endpoint or a booking tool: replace the `preventDefault()` success path in `script.js` with a `fetch()` to your endpoint.

## Adding real photographs

The design is built to work without photos, but it has natural places for them if the client has good ones:

- **Hero.** Swap the inline storefront drawing in `.hero__art` for an `<img>` of the real front. Use a portrait image (about 4:5) and keep the rotating stamp, which is positioned over the image's corner.
- **This week at the counter.** Each `.special__art` block holds one illustration. Replace the `<img>` with a photo and add `object-fit: cover; width: 100%; height: 100%;` so it fills the colored panel.
- **The pour.** Overhead photos of real cups can replace the SVG cups. Crop them square, and drop the pour animation, because it only applies to the drawn foam.
- **On the walls.** Use photographs of the actual artworks (straight on, cropped to the edge of the work) in place of the SVGs in `assets/art/`. Keep the width and height attributes matched to each photo.
- **Bakery steps.** The round `.step__art` badges can take square photos; crop them to a circle with `border-radius: 50%`.
- **Our story.** A photo of Anika and Joel would sit well below the story text in `.story__body`.

Put photos in `assets/photos/` and export them as WebP or AVIF at about twice their display size. Give each one a descriptive `alt`, and add `width`, `height` and `loading="lazy"` (except in the hero).
