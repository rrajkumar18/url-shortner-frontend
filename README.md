# SnipURL — Full-Stack URL Shortener & Analytics Platform with crypto fun

SnipURL is a modern, full-stack URL shortening and link management platform built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**. It provides fast link shortening, custom aliases, a protected dashboard, live click tracking powered by **Server-Sent Events (SSE)**, and a **Live Crypto Market Watch** feature.

---

## 🚀 Live Demo & Deployment

The application is deployed across free hosting tiers:
* **Frontend**: Deployed on **[Vercel](https://vercel.com/)**
* **URL Shortener Backend**: Deployed on **[Render](https://render.com/)**
* **Crypto Watch Backend**: Deployed on **[Render](https://render.com/)**

> [!IMPORTANT]
> ### ⏳ Cold Start Notice (Render Free Tier)
> Render's free web services automatically spin down after 15 minutes of inactivity. When spinning up from cold sleep, the first request can take **30 to 60 seconds** to respond.
>
> **Recommended Step before exploring:**
> 1. Click the **Backend URLs** below first to trigger the spin-up process:
>    * Click [URL Shortener Backend](https://url-shortener-api-yoqz.onrender.com/docs) for auth and link shortening.
>    * Click [Crypto Watch Backend](https://crypto-watch-backend.onrender.com/docs/) if you want to explore the live crypto market stream.
> 2. Once the backends respond, open the **Live Frontend URL** to enjoy a seamless experience without API timeouts.

| Service | Status | Link |
| :--- | :--- | :--- |
| 🌐 **Live Frontend (Vercel)** | Active | [https://url-shortner-frontend-nine-sigma.vercel.app/](https://url-shortner-frontend-nine-sigma.vercel.app/) |
| ⚙️ **URL Shortener API (Render)** | Active (Cold Start) | [https://url-shortener-api-yoqz.onrender.com/docs](https://url-shortener-api-yoqz.onrender.com/docs) |
| 📈 **Crypto Watch API (Render)** | Active (Cold Start) | [https://crypto-watch-backend.onrender.com/docs/](https://crypto-watch-backend.onrender.com/docs/) |

---

## ✨ Key Functionalities & Features

### 1. Fast URL Shortening
* **One-Click Link Generation**: Shorten long, cumbersome URLs into concise, branded links directly from the landing page or dashboard.
* **Instant Copy-to-Clipboard**: Quick copy action with visual feedback ("Copied!").
* **Custom Aliases**: Option to assign customized, memorable short codes (e.g. `/my-portfolio`, `/summer-sale`).

### 2. Comprehensive Analytics Dashboard
* **Dynamic KPI Stat Cards**:
  * **Total Links**: Real-time count of all created URLs.
  * **Total Clicks**: Aggregated click count across all user links.
  * **Active Links**: Instant visibility into active vs. inactive shortened URLs.
* **Links Management Table (`UrlTable`)**:
  * Real-time search and filtering by original URL or short code.
  * Click count badge, creation date, status tags, and direct destination previews.
  * Action menus for copying, editing, and managing links.
* **Interactive Create Link Modal**: Submit new destination URLs and receive the generated link inline with instant state update without page reloads.

### 3. Real-Time Click Streaming (Server-Sent Events)
* **Live SSE Updates**: Connects to the backend's `/urls/stats/clicks` SSE stream via a centralized `ClickStreamProvider`.
* **Zero-Reload Count Increments**: When someone clicks a shortened link anywhere on the web, both the **Total clicks** stat card and the corresponding row in the table update in real time without refreshing the browser.
* **Optimized Single Connection**: A shared React context ensures only one SSE stream is opened per session, avoiding browser connection limits and memory leaks.

### 4. Authentication & Security
* **JWT Session Management**: Authentication tokens (`access_token` and `refresh_token`) are stored in secure, **HTTP-only cookies**, preventing XSS token theft.
* **Silent Token Rotation**: Automatic token refresh handling via `backendFetch` ensures uninterrupted user sessions when tokens expire.
* **Route Protection via Next.js 16 `proxy.ts`**:
  * Unauthenticated users attempting to access `/dashboard/*` are redirected to `/login?callbackUrl=...`.
  * Authenticated users visiting `/login` or `/register` are redirected straight to `/dashboard`.
* **Defense-in-Depth**: Layout-level server component checks guarantee protected data is never rendered for unauthorized requests.

### 5. 🪙 Bonus: Live Crypto Market Watch (Fun Section)
* **Route**: `/dashboard/crypto`
* **Real-Time Financial Charts**: Candlestick and Line price charts powered by TradingView's `lightweight-charts` with multi-timeframe intervals (`1m`, `5m`, `15m`, `1h`).
* **Live SSE Trade Stream**: Consumes live price tick events from the Crypto Watch backend via `MarketStreamProvider`.
* **Coin Selector & Discoverability**: Dynamically discovers and switches between traded crypto pairs (e.g. BTC, ETH).
* **Recent Trades Feed**: Live order book stream displaying symbol, execution price, quantity, and timestamp.
* **Collector Controls**: Interactive start/stop triggers to control live market data collection sessions.
* **Dedicated Backend**: Powered by the standalone [Crypto Watch API on Render](https://crypto-watch-backend.onrender.com/docs/).

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack, Server Actions)
* **UI Library**: [React 19](https://react.dev/)
* **Language**: [TypeScript 5](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
* **Charts**: [Lightweight Charts](https://tradingview.github.io/lightweight-charts/) (TradingView)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Realtime Protocol**: Server-Sent Events (SSE) via native `EventSource`
* **Cookie Parser**: `set-cookie-parser`
* **Hosting**: Vercel (Frontend) & Render (Backend APIs)

---

## 📁 Project Architecture

```text
├── actions/                     # Server Actions ('use server')
│   ├── auth.ts                  # loginUser, registerUser, getAccessToken
│   ├── crypto.ts                # startMarketCollection, stopMarketCollection
│   └── urls.ts                  # createShortUrl, getUrls, getDashboardStats
│
├── app/                         # App Router (Pages, Layouts, Route Handlers)
│   ├── api/auth/logout/route.ts # Logout route handler
│   ├── dashboard/               # Protected dashboard routes
│   │   ├── analytics/page.tsx   # Analytics overview
│   │   ├── crypto/page.tsx      # Live Crypto Market Watch dashboard
│   │   ├── profile/page.tsx     # User profile
│   │   ├── layout.tsx           # Dashboard layout & Auth guards
│   │   └── page.tsx             # Dashboard home
│   ├── login/page.tsx           # User login page
│   ├── register/page.tsx        # User registration page
│   ├── globals.css              # Global styling & Tailwind directives
│   ├── layout.tsx               # Root application layout
│   └── page.tsx                 # Public landing page with shortener
│
├── components/                  # Reusable UI Components
│   └── dashboard/
│       ├── crypto/              # Crypto Market Watch widgets
│       │   ├── CryptoMarketDashboard.tsx
│       │   ├── LivePriceChart.tsx
│       │   ├── CoinSelector.tsx
│       │   └── RecentTradeTables.tsx
│       ├── CreateLinkModal.tsx  # Modal to create and copy new shortened links
│       ├── DashboardHeader.tsx  # Navigation, user profile & logout
│       ├── EditUrlModal.tsx     # Modal to update alias and destination
│       ├── StatsCard.tsx        # Reusable metric card
│       └── UrlTable.tsx         # Data table for managing URLs
│
├── context/                     # React Context Providers
│   ├── ClickStreamContext.tsx   # SSE connection for real-time link clicks
│   └── MarketStreamContext.tsx  # SSE connection for live crypto price ticks
│
├── hooks/                       # Custom React Hooks
│   └── useCreateShortUrl.ts     # Client submission & loading state hook
│
├── lib/                         # Server Utilities & Auth Helpers
│   ├── api.ts                   # backendFetch client (handles token refresh & cookies)
│   └── auth.ts                  # Cookie helpers (getAuthCookies, clearAuthCookies)
│
├── proxy.ts                     # Next.js 16 routing & proxy middleware
├── next.config.ts               # Next.js configuration
├── tsconfig.json                # TypeScript compiler configuration
└── package.json                 # Project dependencies & scripts
```

---

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory for local development:

```bash
# URL Shortener Backend API
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Crypto Watch Backend API
CRYPTO_BACKEND_URL=http://localhost:3002
NEXT_PUBLIC_CRYPTO_BACKEND_URL=http://localhost:3002
```

For **Production Deployment (Vercel)**, configure these environment variables in your Vercel Project Settings:

```bash
BACKEND_URL=https://url-shortener-api-yoqz.onrender.com
NEXT_PUBLIC_BACKEND_URL=https://url-shortener-api-yoqz.onrender.com

CRYPTO_BACKEND_URL=https://crypto-watch-backend.onrender.com
NEXT_PUBLIC_CRYPTO_BACKEND_URL=https://crypto-watch-backend.onrender.com
```

---

## 💻 Local Development Setup

### Prerequisites
* Node.js 20+ installed
* Running backend APIs:
  * URL Shortener API on port `3001`
  * Crypto Watch API on port `3002`

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/<your-username>/url-shortner-frontend.git
   cd url-shortner-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env.local
   # Update the backend URLs in .env.local
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the application:**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

* `npm run dev` — Starts the development server with Turbopack.
* `npm run build` — Builds the application for production.
* `npm run start` — Starts the production server.
* `npm run lint` — Runs ESLint checks.
