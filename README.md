# Ivy Homes Property Explorer

A production-grade Next.js frontend built for the Ivy Homes engineering internship assignment, acting as a robust client over a highly undocumented and shifting API.

## 🚀 How to Run It

1. **Clone and Install:**
   ```bash
   git clone https://github.com/Ayush-216/ivy-homes-frontend.git
   cd ivy-homes-frontend
   npm install
   ```

2. **Environment Variables:**
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_API_BASE_URL=https://solve.ivy.homes
   NEXT_PUBLIC_API_KEY=IVY26-3F9AD1C6793C
   ```

3. **Run the Development Server:**

   ```bash
   npm run dev
   ```

   Open http://localhost:3000 to view the application.

## 🤖 LLM & Tooling Disclosure

As permitted by the assignment rules, I utilized an LLM as a collaborative thought partner. It was primarily used to quickly scaffold React UI components, write boilerplate Tailwind CSS, and generate data-parsing scripts for the `submission.json` calculations. The architectural decisions, API discrepancy hypotheses, and overall debugging strategy were driven by me. The stack is Next.js (App Router), React, Tailwind CSS, and Lucide React.

## 🕵️‍♂️ Navigating the API Lies

I quickly realized the provided `API_REFERENCE.md` was effectively a "hallucination." My strategy for discovering the truth relied on observing actual network payloads rather than assuming documentation accuracy.

- **Auth & Session Drops:** The docs stated tokens lasted 24 hours with no refresh flow, but my sessions kept dropping. By observing the 401 error payloads, I discovered the API demanded an undocumented `/auth/refresh` cycle, which I implemented via a centralized API utility.
- **Pagination Constraints:** The documentation claimed a `page` and `limit` (max 200) system. When sweeping the data, I noticed the server stubbornly returning 50 items and ignoring `page`. I inspected the headers/responses and mapped the logic to an `offset` system capped at 50.
- **The "Missing" Favourites Endpoint:** `POST /v1/favourites` threw a 404. Instead of guessing manually, I wrote a brute-force prober script into the frontend that iteratively fired POST requests at common variations (`/v1/favorites`, `/v1/saved`, `/v1/me/favourites`). It automatically caught a `200 OK` at `/v1/saved` and revealed it needed `listing_id` in the body.
- **Unit Discrepancies:** Project prices displayed as single-digit values. Contextual logic dictated that a luxury project does not cost "1.66 rupees," so I multiplied the payload by 1 Crores (10,000,000) to render accurate INR values.

## 🧪 Hypotheses That Turned Out to Be Fine

The most interesting part of the analysis was testing assumptions that ultimately proved the API was actually telling the truth (or my assumptions were too cynical):

1. **The Rate Limit Trap:** Given the API's deceptive nature, I hypothesized that the "1200 requests/minute" limit was a trap, and that sweeping the entire dataset of 3,500 listings quickly would trigger a shadow-ban or a 429 error. I wrote a script to aggressively page through all records. The hypothesis failed: the API was entirely honest about its generous limit, and the ingest completed flawlessly.
2. **The "Unique Properties" Duplicate Theory:** I assumed agents heavily duplicate the exact same physical property to spam the platform. I hypothesized that cross-referencing `latitude`, `longitude`, `floor`, and `carpet_area` would reveal hundreds of duplicate listings for the exact same physical space. However, my unique signature analysis returned exactly 3,500 distinct signatures for 3,500 records. The API's uniqueness constraints were perfectly healthy.
3. **The Fake Description Farm:** To answer the `fake_listing_ids` question, I hypothesized that fraudulent brokers would be lazy and copy-paste the exact same `description` string across dozens of listings in different localities. When I mapped description frequencies, I found zero collisions. The fake listings hypothesis did not pan out via description matching.

## 🔮 What I Would Do With Another Two Days

1. **Spatial Polygon Mapping:** I would integrate Leaflet or Mapbox to plot all 3,500 listings visually. This would allow me to instantly spot "locality lies" (e.g., properties claiming to be in "DLF Phase 3" but plotting coordinates 50km away).
2. **Client-Side Caching Engine:** Given the missing analytics endpoints, I would implement a robust IndexedDB or Redis caching layer to store the initial data sweep. This would prevent the app from re-fetching all pages every time the user refreshes, drastically speeding up the analytics dashboard.
3. **Anomaly Detection UI:** I would build an automated outlier-detection overlay that flags properties where the price-per-square-foot deviates by more than 40% from the locality median, instantly highlighting potentially corrupt or fake records to the user.
