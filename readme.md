# KuriFlow - Premium Next.js Chit Fund & Auction Tracker

Welcome to **KuriFlow**, a state-of-the-art, high-fidelity Next.js web application designed to track and manage traditional savings/auction schemes, commonly referred to as **Kuries** or **Chit Funds** in South India (Kerala).

Organizers (forepersons) and subscribers can monitor active schemes, manage global contact lists, schedule monthly auctions, distribute dividends automatically, record installment collections, and simulate compound investment returns in real-time.

---

## 🌟 Core Features

1. **Secure Registration & JWT Sessions**:
   * Elegant glassmorphic **Sign In / Create Account** modal overlay on startup.
   * Secure password hashing using **Bcrypt** on Next.js backend.
   * HTTP-Only cookie verification via JWT tokens for robust stateless session preservation.
   * **Local Demo Bypass**: Skip sign-in to play around instantly with LocalStorage fallback!

2. **Transactional Cloud Synchronizer**:
   * Auto-detects session state on mount. If logged in, automatically pulls subscriber ledgers from Neon DB.
   * If a new account is registered, the DB is auto-seeded with standard chitty defaults to avoid blank slates.
   * Background auto-saves of scheme creation, payment collections, and auction records to AWS via serverless Postgres endpoints.

3. **High-Fidelity Dashboard**:
   * **Total Value Managed**: Sum of all active chit pools.
   * **Dividends Distributed**: Total profits shared back to subscribers.
   * **Gross Profit**: Total commission earned by the foreman.
   * **Collection Rate Tracker**: Beautiful linear bar indicator showing the ratio of paid contributions.
   * **Interactive Inflow Area Chart**: Custom-built responsive SVG chart plotting monthly expected vs. collected payments.

4. **Scheme Ledger Matrix**:
   * Circular progression of monthly milestones (e.g. Month 4 of 10).
   * **Payment Matrix**: A grid mapping all subscribers against monthly installments. Click a cell to toggle state (from `Pending` to `Paid`) instantly!
   * Non-prized subscribers automatically see a reduced payment amount for months in which dividends were distributed.

5. **Smart Auction Bidding & Dividends**:
   * Select candidate prized subscribers (those who have not won a bid yet).
   * Calculate foreman commission (e.g. 5% of total pool value).
   * Distribute the discount equally among subscribers as a dividend.
   * Auto-generate the next month's payment schedule in the ledger.

6. **ROI Chitty Simulator**:
   * Slide pool value, duration, foreman commission, and expected discount.
   * Instant calculations for average installment size, cumulative dividends earned, and net yield ROI (IRR).
   * Month-by-month projection schedule highlighting bid discount, net payable installment, and prized payout options.

---

## ⚙️ Architecture & Technical Stack

The codebase is built inside a clean, production-grade Next.js App Router structure:

* **Framework**: [Next.js](https://nextjs.org/) (App Router, Tailwind v4, TypeScript)
* **Database**: [Neon AWS Serverless PostgreSQL](https://neon.tech/) with pooled connections and SSL enforcement.
* **Authentication**: BcryptJS + JSONWebToken with secure HTTP-only cookies in server endpoints.
* **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) with a dark-mode glassmorphic theme defined in `globals.css` using glowing indicators, subtle grid lines, blur panels, and smooth float animations.
* **Icons**: [Lucide React](https://lucide.dev/) for crisp, scalable vectors.
* **Types & Schema**: Strict TypeScript definitions in `mockData.ts`.

---

## 🛠️ DB Connection & Table Schemas

All table schemas are auto-initialized upon the first server route call via `initDb()` inside `src/lib/db.ts`:

* **`users`**: Master credential storage.
* **`kuries`**: Basic details of chit pools sandboxed to specific user accounts.
* **`kuri_subscribers`**: Enrolled subscriber lists with their prized bid milestones.
* **`global_subscribers`**: The contacts index.
* **`auctions`**: History of conducted bidding iterations.
* **`payments`**: Track monthly payment installments.

---

## 🚀 How to Run Locally

To boot up the project in your local development environment:

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Run Dev Server**:
   ```bash
   npm run dev
   ```
3. **Open browser**: Open [http://localhost:3000](http://localhost:3000) in Chrome.

4. **Production Build**:
   ```bash
   npm run build
   ```
