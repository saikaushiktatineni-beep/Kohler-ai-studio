# KOHLER AI Studio — AI Bathroom Designer & Planner

An AI-assisted bathroom design and planning tool built for the **KOHLER–MITWPU AI Research Lab Program** case study challenge (Track 1: AI Bathroom Designer & Planner).

Given a room size, budget, and style preference, the app generates tiered product recommendations, an itemized cost breakdown, and an interactive spatial floor plan — with a built-in AI chat that can parse free-text requests ("I have $8000, an 8 by 12 room, and want ambient lighting") into a full recommendation on the spot.

## Demo Video

[Add your video link here — YouTube (unlisted) or Google Drive]

## Features

- **Tiered recommendation engine** — Value, Balanced, and Premium product bundles generated from room size and budget inputs
- **AI chat parser** — free-text input is scanned for budget, dimensions, and add-on keywords, and matched to a full costed recommendation, including a "no available options" response when the budget can't cover any tier
- **Style-aware matching** — informal style language ("old money", "minimalist", "imperial") is mapped to the app's architectural themes (Classic Luxury, Modern, Japanese Zen)
- **Interactive floor plan viewport** — zoom, 90° rotation, and click-and-drag panning over a generated top-view spatial schematic
- **Per-product detail view** — click any vanity, shower, toilet, or faucet card to open a detail modal with finish, eco-status, and description
- **Side-by-side comparison mode** — configure two independent setups (size, theme, tier) and view both floor plans plus an auto-generated list of each configuration's advantages
- **Light/dark mode** with a consistent, monochrome utility bar
- **Background music with volume control**
- **Water-saving and sustainable product callouts**, aligned with Kohler's sustainability focus

## Tech Stack

- HTML5, CSS3, vanilla JavaScript — no frameworks or build step required
- `products.json` — the product catalog data
- Static assets (PNG images, MP3 background audio)

## File Structure

```
Kohler-ai-studio/
├── index.html          # Main app markup
├── app.js              # Core logic: recommendation engine, AI chat parser,
│                        #   viewport interactivity, comparison engine
├── styles.css           # Styling, including light/dark mode variables
├── products.json         # Product catalog (vanities, showers, toilets, faucets, etc.)
├── *.png                # Product images and UI assets
├── jazz.mp3              # Background audio
├── README.md
└── docs/
    ├── AI_Prompt_Documentation.pdf   # Key prompts used to build the app
    └── Pitch_Deck.pdf                 # 4-slide project pitch deck
```

## Running Locally

No installation or build step needed — this is a static site.

1. Clone or download this repository
2. Open the folder in VS Code
3. Install the **Live Server** extension (if not already installed)
4. Right-click `index.html` → **Open with Live Server**
5. The app opens at `http://127.0.0.1:5500` (or similar) in your browser

Alternatively, open `index.html` directly in any modern browser, or serve the folder with any static file server (e.g. `python -m http.server`).

## How It Works

1. **Input** — the user enters room dimensions, budget, and (optionally) a style preference, either through the UI controls or by describing it in plain text to the AI chat
2. **Parsing** — for chat input, a regex-based parser extracts the budget, dimensions, style keywords, and requested add-ons
3. **Recommendation** — the engine calculates a size-based cost multiplier, tallies add-ons, and evaluates all three tiers against the remaining budget, returning every tier that qualifies
4. **Visualization** — the matching floor plan is rendered in an interactive, zoomable/rotatable viewport
5. **Comparison (optional)** — users can open Comparison Mode to configure and view two options side by side, with an automatically generated summary of each one's advantages

## Design Decisions

- Built with a rule-based (regex) parser instead of a live LLM API call, so the app runs entirely client-side with no API key or backend required — while still feeling conversational and intelligent in the demo
- Prioritized visual polish (glassmorphism UI, smooth transitions, interactive viewport) alongside functional depth, since the evaluation criteria for this track directly reward design sensibility
- Included multiple product tiers rather than a single recommendation, to better reflect real-world purchasing decisions

## Submission Contents

- `/` — working web app source
- `/docs/AI_Prompt_Documentation.pdf` — key AI prompts used during development
- `/docs/Pitch_Deck.pdf` — 4-slide project pitch deck
- Demo video — linked above

## Author

Sai Kaushik Tatineni
Prn-1262241272
Panel I
B.Tech Computer Science and Engineering
MIT-WPU
