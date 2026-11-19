# SphereX Markets

**SphereX Labs** — open-source full-stack market intelligence for equities, crypto, FX/TRY rates, precious metals, financial news, portfolio tracking, and Turkish macro / economic calendar data.

[![CI](https://github.com/SphereXLabs/spherex-markets/actions/workflows/ci.yml/badge.svg)](https://github.com/SphereXLabs/spherex-markets/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

SphereX Markets is a production-ready monorepo:

- **Client** — React 18 + TypeScript (strict) + Vite + Tailwind
- **Server** — Express API with in-memory/stale caching, graceful fallbacks when Yahoo Finance, CoinGecko, Frankfurter, or RSS feeds rate-limit / go offline
- **Focus** — BIST & global equities, crypto, TRY crosses, metals, TR macro indicators, economic calendar, alerts, watchlist, portfolio, and daily reports

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SphereX Markets                         │
│                   (SphereX Labs · MIT)                      │
├──────────────────────┬──────────────────────────────────────┤
│   client/ (Vite)     │           server/ (Express)          │
│   React + TS         │                                      │
│                      │   /api/stocks  /api/bist  /api/banks │
│   Dashboard · BIST   │   /api/crypto  /api/forex /api/metals│
│   Crypto · Forex     │   /api/news    /api/economic         │
│   Metals · Portfolio │   /api/portfolio /api/calendar       │
│   News · Calendar    │   /api/macro/turkey /api/analysis    │
│   Alerts · Tools     │   /api/health  /api/meta             │
│         │            │            │                         │
│         └──── /api ──proxy────────┘                         │
│                           │                                 │
│           Yahoo Finance · CoinGecko · Frankfurter · RSS     │
│           (+ stale cache & offline fallback payloads)       │
└─────────────────────────────────────────────────────────────┘
```

---

## Features

- **Overview dashboard** — live summary across asset classes
- **BIST & global stocks** — sector filters, heatmap, bank index
- **Crypto** — top markets, dominance, detail charts
- **FX / TRY** — Frankfurter-backed major pairs + history
- **Precious & industrial metals** — USD and TRY/gram views
- **Economic indicators** — S&P, BIST, VIX, oil, bonds, DXY
- **TR macro + calendar** — Turkey indicators & upcoming events
- **News** — Turkish & global RSS aggregation
- **Portfolio / alerts / watchlist** — local + API-backed tracking
- **Analysis & tools** — signals, scenarios, daily report export
- **Resilience** — NodeCache + long-lived stale cache + static fallbacks

---

## Quickstart

### Prerequisites

- Node.js **18+** (20 LTS recommended)
- npm 9+

### Install

```bash
git clone https://github.com/SphereXLabs/spherex-markets.git
cd spherex-markets
npm run install:all
```

### Environment

```bash
cp .env.example .env
```

All variables in `.env.example` are **optional**. Defaults work for local development without API keys.

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | `3001` | API server port |
| `NODE_ENV` | `development` | Runtime mode |
| `CACHE_TTL` | `60` | Live cache TTL (seconds) |
| `SERVE_CLIENT` | `false` | Serve `client/dist` from Express |
| `COINGECKO_API_KEY` | _(empty)_ | Optional CoinGecko rate-limit boost |
| `USER_AGENT` | `SphereXMarkets/1.0` | Outbound request User-Agent |

### Development

```bash
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3001  

Vite proxies `/api` → `http://localhost:3001`.

### Production build

```bash
npm run build
npm start
# optional: SERVE_CLIENT=true npm start  (after build)
```

### Quality checks

```bash
npm run typecheck   # client tsc --noEmit
npm test            # server node:test API suite
npm run ci          # typecheck + test + vite build
```

---

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Liveness + service metadata |
| `GET` | `/api/meta` | Project branding / license |
| `GET` | `/api/stocks?market=` | Equities (`BIST` \| `global`) |
| `GET` | `/api/stocks/:symbol` | Stock detail + history |
| `GET` | `/api/bist?sector=` | BIST indices + stocks |
| `GET` | `/api/bist/all` | Extended BIST universe |
| `GET` | `/api/bist/heatmap` | Sector heatmap |
| `GET` | `/api/banks` | Turkish banks + bank index |
| `GET` | `/api/crypto/markets` | Top crypto markets |
| `GET` | `/api/crypto/global` | Global crypto stats |
| `GET` | `/api/crypto/:id` | Coin detail + chart |
| `GET` | `/api/forex` | FX rates incl. TRY pairs |
| `GET` | `/api/forex/:base/:quote/history` | FX history |
| `GET` | `/api/metals?category=` | Metals list |
| `GET` | `/api/metals/:id` | Metal detail |
| `GET` | `/api/economic` | Macro market indicators |
| `GET` | `/api/macro/turkey` | Turkey macro + outlook |
| `GET` | `/api/calendar` | Economic calendar |
| `GET` | `/api/news?region=&q=` | News feed |
| `GET` | `/api/news/turkey` | TR news shortcut |
| `GET` | `/api/search?q=` | Cross-asset search |
| `GET` | `/api/analysis` | Full investment analysis |
| `GET` | `/api/portfolio/:id` | Portfolio CRUD helper |
| `POST` | `/api/portfolio/:id` | Save portfolio |
| `GET` | `/api/portfolio/:id/value` | Mark-to-market values |
| `GET` | `/api/alerts` | Price alerts |
| `GET` | `/api/watchlist` | Watchlist |
| `GET` | `/api/tefas` | TEFAS fund snapshot |
| `GET` | `/api/report/daily` | Daily market report |
| `GET` | `/api/stream` | Live SSE tick stream |

When upstream APIs fail, many market routes return **stale** or **fallback** payloads with `X-SphereX-Data: stale|fallback` instead of hard 500s.

---

## Project structure

```
spherex-markets/
├── client/                 # React + Vite UI
│   └── src/
├── server/                 # Express API
│   ├── data/               # Static datasets + fallbacks
│   ├── lib/                # Cache / respond helpers
│   └── test/               # node:test API suite
├── .github/workflows/ci.yml
├── .env.example
├── LICENSE                 # MIT · Copyright (c) 2026 SphereX Labs
└── README.md
```

---

## Security notes

- No hardcoded API keys or personal machine paths are committed
- Secrets belong only in `.env` (gitignored); use `.env.example` as the template
- `server/data/store.json` (alerts/watchlist runtime store) is gitignored

---

## Disclaimer

SphereX Markets is provided for **educational and informational purposes only**. It is **not** investment advice, a brokerage, or a trading platform. Market data may be delayed, incomplete, or approximate (especially when fallback payloads are served). Always verify prices with licensed data providers before making financial decisions. SphereX Labs and contributors accept no liability for trading losses or decisions made using this software.

---

## License

[MIT](LICENSE) — Copyright (c) 2026 **SphereX Labs**
