# PlaysOut — Website Uplift · Developer Handoff

A first-pass redesign of four pages, built as **static HTML/CSS/JS** so they can be dropped into any stack or previewed straight in a browser. The visual identity (electric-indigo → navy gradient, Red Hat Display, dark pill buttons, colourful game cards) is matched to the current live site; the **narrative** is repositioned to be entertainment-first.

---

## What's in the folder

```
playsout-uplift/
├── index.html        ← Home (refreshed — same look & feel, new story)
├── drama.html        ← NEW: Drama & Live entertainment page
├── hub.html          ← Hub / Play (browse games · dramas · live, with filters)
├── dev-arena.html    ← Dev Arena (creators & developers)
├── assets/
│   ├── styles.css    ← One shared design system for all pages
│   └── script.js     ← Shared interactions (sticky nav, scroll reveals, Hub filter)
└── HANDOFF.md        ← This file
```

Open any `.html` file in a browser to preview. No build step, no dependencies. Fonts load from Google Fonts; everything else is self-contained.

---

## The repositioning (entertainment-first, Web3 quiet)

**Before** — the site led with infrastructure and crypto language: *"The Shopify of Mini-Games,"* *"Bridging worlds, one mini game at a time,"* plus Embedded Distribution Engine, Cross-Platform Runtime, Economic Engine, Developer Oracle, PLAY token, Base chain.

**After** — PlaysOut leads as an **interactive entertainment network**: bite-sized fun (quick games · live interactive play · short-form drama) dropped into the apps people already use, with rewards built in. The infrastructure and token story still exists but is quiet — surfaced through "Ecosystem & rewards" rather than headlines.

This direction follows the company's own newsroom signals: the platform overhaul "beyond mini-games into interactive entertainment," the bullet-chat + short-drama modules, and the end-to-end AI stack.

**New core line:** *"The home of bite-sized entertainment."*
**Hero:** *"Play it. Watch it. Can't put it down."*
**One-sentence positioning:** *PlaysOut makes the snackable stuff people can't stop tapping — quick games, live interactive play and short-form drama — and plugs it straight into the super-apps where billions already spend their time.*

### Key copy changes at a glance
| Old | New |
|---|---|
| "The Shopify of Mini-Games" | "The home of bite-sized entertainment" |
| "Bridging worlds — one mini game at a time" | "Play it. Watch it. Can't put it down." |
| Embedded Distribution Engine / Cross-Platform Runtime / Economic Engine / Super-App Native Architecture / Developer Oracle | Reframed as plain-language creator benefits in Dev Arena (instant distribution, data that finds your hits, monetise at the moment, one build/every surface, AI stack, rewards built in) |
| "For Super Apps" infra pitch | "Turn your app into an entertainment destination" |

---

## Design system notes (assets/styles.css)

All colours, type and spacing are CSS variables under `:root` — change them once, everything updates.

- `--po-indigo #3838FF` · `--po-navy #11112A` · `--po-navy-deep #0A0A1C` · `--po-cream #FEFEF9` · text `#E6E6EA` (sampled from the live site)
- Entertainment accents for the new formats: games = cyan `#38E1FF`, live = lime `#B6FF3C`, drama = pink `#FF4D9D`, rewards = gold `#FFC24B`
- Fonts: **Red Hat Display** (matches live) for UI/body, **Fredoka** for the playful display headlines (swap if you prefer the site's existing display face)
- Reusable components: `.btn` (dark/light/primary/ghost pills), `.tile` (game card), `.vcard` (vertical drama/live card), `.feat`, `.panel`, `.news-card`, `.cta-band`, nav + footer

---

## What the developer needs to swap in (placeholders)

These are intentionally faked so the layout is real but no copyrighted/real assets are shipped:

1. **Game & drama artwork** — cards currently use CSS gradients + an emoji. Replace the `.tile-art` / `.v-grad` backgrounds with real thumbnail `<img>`s.
2. **Logo** — an inline SVG approximation of the planet-ring mark sits in the nav/footer. Replace with the official logo asset.
3. **Links** — `href="#"` and `href="hub.html"` are placeholders pointing at the new pages; wire to real routes/CMS.
4. **Live data** — the Hub grid, live viewer counts and news cards are static; connect to the real catalog/news feed.
5. **Forms** — the subscribe input is non-functional (`onsubmit return false`); connect to the email provider.
6. **Partner logos** — currently text names; swap for real partner SVGs.

---

## Carried-over interactions
- Sticky nav that gains a blurred background on scroll
- Mobile hamburger menu (responsive < 980px)
- Scroll-reveal animations (IntersectionObserver, graceful fallback)
- Hub category filter (data-attribute driven, no library)
- Marquee of trending titles on the Home page

---

## Suggested next steps (not in this pass)
- News detail/article template and a full News index page
- "How to" and "WebView SDK" documentation pages
- Real motion design for the hero (the live site uses scroll-pinned animation)
- Light/illustration assets for the drama format
- Accessibility audit pass (focus states, reduced-motion, contrast on accent bands)
