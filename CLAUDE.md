# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static marketing website (no build step, no framework, no package manager) for **KARA PREMIUM GOLF & BAR**, a golf-simulator bar in Takasaki, Gunma, Japan, ahead of its planned October 2026 grand opening. All content is in Japanese.

## Running / previewing

There is no build or dev-server tooling in this repo. Preview by opening the HTML files directly or serving the directory statically, e.g.:

```bash
python3 -m http.server 8000
```

Then visit `index.html` or `menu.html`. There is no lint, test, or CI setup — verify changes by opening the pages in a browser.

## Structure

- `index.html` — the main landing page (hero, simulator pitch, play menu/pricing, recommendations, gallery, party/event pitch, open-campaign CTA, access/map).
- `menu.html` — the drinks & food menu, organized into numbered categories (`#beer`, `#whisky`, `#sour`, `#shochu`, `#sake`, `#tequila`, `#other`, `#champagne`, `#nonalcohol`, `#softdrink`, `#cocktail`, `#food`) with an in-page category nav (`.menu-catnav`) that jumps to `.menu-cat-card` sections.
- `css/style.css` — shared site-wide styles (design tokens, layout, header/footer, hero, all `index.html` sections). Loaded by both pages.
- `css/menu.css` — additional styles specific to `menu.html` (category cards, price rows), loaded after `style.css`.
- `js/main.js` — single IIFE handling all interactivity for both pages: loader screen, sticky header + mobile nav toggle, floating LINE/reservation CTA visibility (IntersectionObserver on `#hero`), the slot-machine-style countdown timer, and all GSAP ScrollTrigger scroll animations (including `.menu-cat-card` reveal on `menu.html`).
- `images/` — site images. `images/KARA_split_images/` holds numbered source images (`01_simulator_1.png`, `08_scene_01.png`, etc.) split out from source art. Many referenced images are `*-placeholder.jpg/svg` — temporary stand-ins awaiting real photos.
- `scripts/gen-placeholders.sh` and `scripts/gen-scene-images.sh` — bash scripts that generate the placeholder SVGs in `images/` (photo placeholders, icon placeholders, illustrated simulator/gallery scenes). Re-run these to regenerate placeholders; when real photos arrive, replace the same filenames in `images/` rather than editing these scripts.
- `プレーメニュー.key` / `メニュー.pptx` — source Keynote/PowerPoint decks that the menu content was authored from.

## Conventions

- No JS framework, no bundler, no CSS preprocessor — plain HTML/CSS/vanilla JS only. Keep changes dependency-free and consistent with that.
- External deps loaded via CDN `<script>` tags in the HTML: GSAP + ScrollTrigger (`cdnjs`), Google Fonts (`RocknRoll One` for headings, `Noto Sans JP` for body text).
- Design tokens live in `:root` in `css/style.css` (`--color-bg`, `--color-gold`, `--color-red`, `--color-green`, `--font-heading`, `--font-body`, etc.) — use these variables rather than hardcoding colors/fonts.
- Scroll-triggered animations are wired declaratively via `data-anim="..."` attributes on elements in the HTML; `js/main.js` (`initScrollAnimations`) queries these attributes/classes to build the corresponding GSAP timelines. When adding a new animated section, add the `data-anim` attribute (or reuse an existing class like `.stagger-item`) and register the matching GSAP call in `main.js` rather than inlining animation logic in HTML.
- Both pages share the same header/footer/floating-CTA markup and rely on `js/main.js` being loaded after the GSAP CDN scripts, at the end of `<body>`.
- Content across both pages is placeholder/in-progress in places (e.g. `※価格は準備中です` price-pending notes, placeholder testimonials marked `仮テキスト`, a placeholder phone number, an `example.com` canonical URL) — check with the user before treating these as final when editing nearby content.
- CTA links point to an external LINE registration URL (`https://lin.ee/...`) and a reservation URL (`https://reserva.be/karagolf1`); keep these two links in sync if either changes, since both are duplicated across `index.html` and `menu.html`.
