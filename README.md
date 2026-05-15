# 📰 The Commodity Wire — Next.js

Production-ready RSS news aggregator for commodity, shipping, energy, and grain professionals. Built on Next.js 15 with proper server-side API routes — no public proxy dependencies, secure API keys.

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Set up Marketaux API key (optional but recommended)
cp .env.local.example .env.local
# Edit .env.local and add your Marketaux key

# 3. Run dev server
npm run dev
```

Opens at `http://localhost:3000`. **`/api/feed-proxy` and `/api/marketaux` work natively** — no Vercel CLI needed.

---

## ✨ Why Next.js Over Vite

| Issue | Vite Version | Next.js Version |
|---|---|---|
| Local API routes | Custom plugin needed | Built-in `app/api/route.js` |
| Production deployment | Vercel adapter + config | Native, zero config |
| API key security | Exposed in browser bundle | Server-side only |
| RSS fetching | Public proxy fallback (unreliable) | Always your own server |
| LNG Prime / bot-blocked sites | Inconsistent | Reliable from Vercel IPs |
| Caching | Manual headers | Native `revalidate` |

---

## 📂 Project Structure

```
commodity-wire-next/
├── app/
│   ├── api/
│   │   ├── feed-proxy/
│   │   │   └── route.js        ← Server-side RSS fetcher
│   │   └── marketaux/
│   │       └── route.js        ← Server-side Marketaux proxy
│   ├── components/             ← All UI components
│   │   ├── Masthead.jsx
│   │   ├── TickerBar.jsx
│   │   ├── Filters.jsx
│   │   ├── ArticleGrid.jsx
│   │   ├── ArticleCard.jsx
│   │   ├── LoadMoreButton.jsx
│   │   └── LoadingState.jsx
│   ├── services/
│   │   └── dataSourceService.js  ← Source registry + transformers
│   ├── styles/
│   │   └── global.css
│   ├── layout.js               ← Root layout
│   └── page.js                 ← Home page (client component)
├── public/
├── .env.local.example          ← Template for Marketaux key
├── next.config.mjs
├── jsconfig.json
└── package.json
```

---

## 🔐 Security Improvements

### Before (Vite):
```js
// Client-side — visible in browser source!
const apiKey = import.meta.env.VITE_MARKETAUX_API_KEY;
fetch(`https://api.marketaux.com/...?api_token=${apiKey}`);
```
☝️ Anyone could see and steal the key.

### After (Next.js):
```js
// Client calls our endpoint (no key needed)
fetch('/api/marketaux?industries=Energy');

// Server handles the key (server-side only)
const apiKey = process.env.MARKETAUX_API_KEY;
// Never sent to browser
```
☝️ Key never leaves the server.

---

## 🚀 Deploy to Vercel

### Option 1: GitHub + Vercel Dashboard

```bash
# Initialize git
git init
git add .
git commit -m "Initial Next.js commit"

# Push to GitHub
git remote add origin https://github.com/YOUR_USER/your-repo.git
git push -u origin main

# Then on vercel.com:
# 1. New Project → Import from GitHub
# 2. Vercel auto-detects Next.js (no config needed)
# 3. Add Environment Variable:
#    - Name:  MARKETAUX_API_KEY
#    - Value: your_marketaux_key
# 4. Deploy
```

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel
# Follow prompts — it auto-detects Next.js

# Add env var
vercel env add MARKETAUX_API_KEY

# Production deploy
vercel --prod
```

**Deploy time: ~2 minutes.** Get a live URL.

---

## 🎯 Sources Configured

### LNG Prime (7 categories)
- All News, Breaking News, LNG Terminals, Vessels, Contracts & Tenders, Corporate, LNG as Fuel

### Hellenic Shipping News (11 categories)
- Top Stories, International Shipping, Dry Bulk, Piracy & Security, Port News, Shipbuilding, Oil & Companies, General Energy, World Economy, Commodity, Stock Market

### World Grain (1 topic)
- ABA — to add more topics, view source of world-grain.com/rss for topic IDs

### Marketaux API (2 endpoints)
- Energy (Sentiment), Basic Materials

---

## ⚙️ Adding More Sources

Edit `app/services/dataSourceService.js` and add to `SOURCES` array:

```js
{
  id: 'my-source',
  publisher: 'My Publisher',
  publisherColor: '#3b82f6',
  name: 'Tech News',
  type: 'rss',
  category: 'Technology',
  priority: 'lazy',  // or 'initial' to auto-load
  feedUrl: 'https://example.com/feed/',
},
```

UI automatically picks it up — no other code changes needed.

---

## 🛠 Available Scripts

```bash
npm run dev    # Start dev server on http://localhost:3000
npm run build  # Production build
npm start      # Run production build locally
```

---

## 🧠 The Architecture

### Source Priority System
- `priority: 'initial'` → Fetched on page load (parallel)
- `priority: 'lazy'` → Loaded via "Load More" button

### Normalized Article Shape
All sources produce the same article shape:
```js
{
  id, sourceId, publisher, publisherColor, sourceName,
  sourceType, category, title, description, url, imageUrl,
  publishedAt, categories,
  // Optional (Marketaux only):
  sentimentScore, entities, relevanceScore
}
```

### Caching
- Feed proxy: 10 minutes (`s-maxage=600`)
- Marketaux: 5 minutes (`s-maxage=300`)

Reduces upstream calls + speeds repeat visits.

---

## ❓ FAQ

**Q: LNG Prime/World Grain bot blocked in Vite. Will Next.js fix it?**
A: Mostly yes — Vercel's production IPs are aligned with major CDNs and are rarely blocked. If a specific site still blocks server-side fetches, you may need a residential proxy service for that specific source.

**Q: Free tier limits?**
A: Vercel Hobby plan: 100K API invocations/day. Your aggregator uses ~10-20 invocations per visit. You'll never hit the limit.

**Q: API key safe in `.env.local`?**
A: Yes — `.env.local` is in `.gitignore`, never committed. On Vercel, add it via Project Settings → Environment Variables.

**Q: Can I add database?**
A: Yes — recommended next step. Use Vercel Postgres, Supabase, or Neon. Cache articles, enable search, add user accounts.

---

Built for commodity professionals. Production-ready architecture.
