# 📖 Story of Cosen — Campus Marketplace

> *A student-first freelance marketplace built by a student, for students.*

---

## 🌱 The Idea

Every college campus is full of hidden talent. A student who can code websites sits in the same library as another who needs one. A design student who makes logos hasn't found the business student who needs a brand. Skills go to waste. Money goes to expensive freelancers outside campus. **Cosen** was born to fix this.

**Cosen** (short for **Cos**mos + **En**gineering / Campus + Sen) is a **university-verified peer-to-peer service marketplace** where students can:

- **Sell** their skills — coding, design, writing, tutoring, research, and more.
- **Hire** verified campus peers — with full payment protection via Razorpay escrow.
- **Chat in real-time** — both in order-specific rooms and direct peer-to-peer DMs.
- **Build a reputation** through a rating and review system.
- **Onboard properly** — student ID verification, profile photo, and social links.

The platform is inspired by Fiverr and Upwork, but laser-focused on the campus experience — trust, affordability, and community.

---

## 🏗️ Project Architecture

```
builder/
├── client/          → React + Vite frontend (Tailwind CSS)
└── server/          → Node.js + Express backend (Supabase PostgreSQL)
```

### Tech Stack

| Layer       | Technology                                                                  |
|-------------|-----------------------------------------------------------------------------|
| **Frontend**  | React 19, Vite 8, Tailwind CSS 3, Zustand (state), React Router v7        |
| **Backend**   | Node.js, Express 4, Socket.io 4 (real-time chat + DMs)                    |
| **Database**  | Supabase (PostgreSQL) — full schema with triggers & full-text search       |
| **Auth**      | JWT (JSON Web Tokens) + HTTP-only cookies + Google OAuth                   |
| **Payments**  | Razorpay (Indian payment gateway) + escrow payment flow                    |
| **Storage**   | Cloudinary (image uploads — avatars, service images, student ID cards)     |
| **Email**     | Nodemailer (email verification, password reset)                            |

---

## ✅ What's Been Built — Current State (April 2026)

### Phase 1 — Foundation & Auth *(Completed)*

- [x] **Project scaffolding** — monorepo with `client/` (Vite + React) and `server/` (Express)
- [x] **Supabase PostgreSQL schema** — all core tables defined with proper relations
  - `users`, `services`, `orders`, `reviews`, `messages`
  - `conversations`, `direct_messages` for peer-to-peer DM system
  - ENUMs for roles, categories, and order statuses
  - Auto `updated_at` triggers on all tables
  - Full-text search (FTS) vector on `services` for instant search
  - Auto rating recalculation trigger on `reviews` insert
  - Cascade deletes across all related tables
- [x] **User registration & login** — JWT auth with `bcryptjs` password hashing
- [x] **Google OAuth login** — `@react-oauth/google` on frontend, token verified server-side
- [x] **Email verification flow** — Nodemailer with token-based verification
- [x] **Password reset flow** — secure token with expiration (`/forgot-password`, `/reset-password/:token`)
- [x] **HTTP-only cookie sessions** — secure, XSS-proof authentication
- [x] **Auth middleware** — protected routes with JWT verification
- [x] **ProtectedRoute component** — redirects unauthenticated users to `/login`

---

### Phase 2 — Core Pages & UI *(Completed)*

- [x] **Global design system** — Stripe-inspired color palette, typography, and components
  - Custom CSS variables: `--stripe-purple`, `--stripe-slate`, `--stripe-steel`, etc.
  - Reusable component classes: `.btn-primary`, `.btn-ghost`, `.stripe-card`, `.stripe-input`
  - Smooth animations, hover effects, glassmorphism auth pages
  - Scroll-reveal `.fade-up` animation using `IntersectionObserver`
- [x] **Navbar** — fully responsive, auth-aware, with:
  - Transparent glassmorphism style on the Landing hero, solid white on scroll
  - Desktop: Categories mega-dropdown, Browse, How It Works, Dashboard links
  - Desktop: User avatar dropdown with name, email, profile links, sign out
  - Desktop: Messages icon with live unread DM badge (polled every 30s)
  - Mobile: Slide-in drawer with full navigation & category list
  - Mobile: Fixed bottom nav bar (Browse, Post, Messages) for logged-in users
- [x] **BrandLogo Component** — standalone reusable brand identity component with size & variant props
- [x] **Landing Page** (`/`) — full cinematic marketing page with:
  - **Hero section** — fullscreen background video (0.65× playback for cinematic feel), responsive with no letterboxing via CSS scale transform
  - Dark-to-transparent gradient overlay for legibility
  - Verified Peer Network badge with pulsing status dot
  - Animated headline with hero highlight spans
  - Glassmorphism search pill → navigates to `/browse?search=...`
  - Two CTAs (Start for free → `/signup`, Browse services → `/browse`) + trust badges
  - **How It Works** — 3-step interactive accordion with auto-play (4s intervals), live visualizer mockups per step (email verification, service cards, escrow animation)
  - **Categories section** — 6 category cards with icons, descriptions, peer counts, all linked to filtered browse
  - **Featured Services** — live DB data with mock padding (always 6 cards), horizontal scroll carousel with skeleton loading, left/right arrows
  - **Trending Services Marquee** — animated infinite scroll strip of 9 service types, pauses on hover
  - **CTA Banner** — dark gradient with radial glows, sign-up and browse CTAs
  - **Footer** — brand logo, copyright, quick navigation links
- [x] **Login Page** (`/login`) — glassmorphism auth card with:
  - Google OAuth (`GoogleLogin` button)
  - Email/password form with validation
  - Forgot password link
  - Animated background: grid, intersection dots, glowing orbs
- [x] **Signup Page** (`/signup`) — matching dark auth aesthetic with:
  - Google OAuth signup
  - Email/password/name form
  - `.edu` / `.ac.in` university email enforcement
- [x] **Forgot Password & Reset Password** pages — full token-based reset flow

---

### Phase 3 — Onboarding & Profiles *(Completed)*

- [x] **Onboarding Page** (`/onboarding`) — 4-step wizard after first sign-up:
  - **Step 1 – Basic Info**: Date of birth, department/major, year of study
  - **Step 2 – Verification Images**: Student ID card upload (required) + profile photo (optional) via Cloudinary
  - **Step 3 – Social Profiles**: Instagram, Facebook, YouTube, X (all optional)
  - **Step 4 – Platform Agreement**: Code of conduct, real identity, off-platform payment ban, content policy
  - Step progress indicator with icons and animated connector lines
- [x] **Profile Page** (`/profile`) — own user profile with avatar upload, bio, skills, department
- [x] **Seller Profile Page** (`/profile/:id`) — public view of any other user:
  - Cover banner image or gradient fallback
  - Avatar with email-verified badge
  - Stats row: rating, total reviews, services count, member since year
  - About, Education, Skills cards
  - All services listed with live data from DB
  - "**Contact Seller**" button → opens/creates a DM conversation + navigates to `/messages`

---

### Phase 4 — Services (Sell Your Skills) *(Completed)*

- [x] **Post a Service Page** (`/services/new`) — full form with:
  - Title, category, price (min ₹50), delivery days (1–30)
  - Description text area
  - Tags input (Enter/comma to add, click to remove)
  - Up to 5 image uploads (Cloudinary)
  - Real-time form validation
- [x] **Service Detail Page** (`/services/:id`) — individual service page with:
  - Service images display
  - Seller info and rating
  - Reviews and comments section
  - "Place Order" button → triggers Razorpay payment
- [x] **Services API** (`/api/services`) — full CRUD + user-specific:
  - `GET /api/services` — list with search, category, sort, pagination
  - `GET /api/services/:id` — single service with seller info
  - `GET /api/services/user/:id` — all services by a specific user (used in SellerProfile)
  - `POST /api/services` — create (authenticated, Cloudinary upload)
  - `PUT /api/services/:id` — edit (seller only)
  - `DELETE /api/services/:id` — delete (seller only)
- [x] **Browse Page** (`/browse`) — service listing with:
  - Live debounced search (waits 300ms before querying)
  - URL parameter sync (search + category preserved in URL)
  - Category filter chips
  - Sort by (Newest / Top Rated / Price Low–High / Price High–Low)
  - Real services from database, skeleton loading states

---

### Phase 5 — Orders & Payments *(Completed)*

- [x] **Razorpay Integration**:
  - `useRazorpay` hook — loads Razorpay script dynamically
  - Creates a Razorpay order on the backend
  - Verifies payment signature server-side
  - Platform fee calculation + seller earnings stored
- [x] **Payments API** (`/api/payments`):
  - `POST /api/payments/create-order` — creates Razorpay order
  - `POST /api/payments/verify` — verifies signature & marks order as paid
- [x] **Orders API** (`/api/orders`):
  - `GET /api/orders` — buyer's and seller's orders
  - `GET /api/orders/:id` — single order detail
  - `PATCH /api/orders/:id/deliver` — seller marks as delivered
  - `PATCH /api/orders/:id/complete` — buyer confirms completion
  - `PATCH /api/orders/:id/dispute` — raise a dispute
- [x] **Payment Success Page** (`/payment-success`) — confirmation page post-payment
- [x] **Order Detail Page** (`/orders/:id`) — combined order management + live chat:
  - Displays order status, buyer/seller info
  - Live order-scoped chat panel using Socket.io (`join_order` / `send_message` / `receive_message`)
  - WhatsApp button (if both parties have verified phone numbers)
  - Seller can mark as delivered; buyer can confirm/dispute

---

### Phase 6 — Real-Time Messaging *(Completed)*

Two separate real-time systems are live:

#### 6A — Order Chat (per-order room)
- [x] **Socket.io events**: `join_order` → `send_message` → `receive_message`
- [x] Messages persisted to `messages` table in Supabase
- [x] Sender info enriched via `users!sender_id` join before broadcast
- [x] **Messages API** (`/api/messages`): `GET /api/messages/:orderId`

#### 6B — Direct Messaging (peer-to-peer DMs)
- [x] **Socket.io DM events**: `join_dm` → `send_dm` → `receive_dm`
- [x] DMs persisted to `direct_messages` table; `conversations` table tracks previews (`last_message`, `last_message_at`)
- [x] **Conversations API** (`/api/conversations`):
  - `POST /api/conversations/start` — creates or retrieves conversation between two users
  - `GET /api/conversations/unread-count` — returns unread DM count (polled every 30s by Navbar)
- [x] **Messages Page** (`/messages`) — full inbox UI:
  - Contacts/conversations sidebar (left panel)
  - Live chat window (right panel) using Socket.io DM events
  - Unread badge on Navbar icon updates in real-time

---

### Phase 7 — Reviews & Dashboard *(Completed)*

- [x] **Reviews API** (`/api/reviews`):
  - `POST /api/reviews` — submit review (only after order is completed)
  - `GET /api/reviews/service/:id` — get reviews for a service
  - Auto-triggers DB function to recalculate service & seller ratings
- [x] **Dashboard Page** (`/dashboard`) — logged-in user sees:
  - Active orders as buyer
  - Incoming orders as seller
  - Earnings summary
  - Quick links to manage services
- [x] **Verify Email Page** (`/verify-email`) — token-based email confirmation landing

---

## 📊 Database Schema Overview

```
users ──────────┬──── services (seller_id)
                │         │
                │         └──── orders ──── reviews
                │                  │
                │                  └──── messages (order chat)
                │
                └──── conversations ──── direct_messages (peer DMs)
```

### Key Database Features:
- **UUID primary keys** everywhere (no integer IDs)
- **Row-level security** ready (via Supabase)
- **Full-text search** on `services.fts` (title + description + tags)
- **GIN index** on FTS vector for fast search
- **Auto ratings** — Postgres trigger recalculates seller & service ratings when a review is inserted
- **Cascade deletes** — deleting a user removes all their services, orders, messages, and conversations
- **Conversation previews** — `conversations.last_message` + `last_message_at` updated on every DM via Socket.io server

---

## 🔭 The Vision — What's Next

### Near-Term (Phase 8) — Polish & Trust
- [ ] **Admin panel** — view all users, services, orders; ban/suspend users
- [ ] **Dispute resolution** — admin mediates disputed orders
- [ ] **In-app notifications** — bell icon with notification feed for order updates, new messages, reviews
- [ ] **Email notifications** — Nodemailer triggers on order placed, delivered, and completed
- [ ] **Read receipts** — mark DMs as read when the other user opens the conversation

### Medium-Term (Phase 9) — Growth
- [ ] **Saved / Bookmarked services** — users can wishlist services
- [ ] **Seller levels** — Bronze / Silver / Gold based on completed orders
- [ ] **Portfolio section** — sellers attach past work samples to their profile
- [ ] **Advanced filters** — price range slider, delivery time filter, min rating filter
- [ ] **Service packages** — Basic / Standard / Premium tiers per service
- [ ] **Typing indicators** in DM chat
- [ ] **File attachments** in DM and order chat

### Long-Term (Phase 10) — Scale
- [ ] **University sub-marketplaces** — multi-tenant, one Cosen instance per university
- [ ] **Mobile app** — React Native version with push notifications
- [ ] **International payments** — Stripe integration for non-India campuses
- [ ] **AI service recommendations** — personalized feed based on browsing history
- [ ] **Campus leaderboard** — top earners per university per semester
- [ ] **Service analytics** — sellers see views, click-through rates, conversion data

---

## 💡 Core Principles We're Building By

| Principle | Implementation |
|-----------|----------------|
| **Campus Trust** | All users are verified students (university email + ID card upload) |
| **Payment Safety** | Escrow — money held until buyer confirms delivery |
| **Real Community** | Reviews, ratings, and reputation stay on-platform |
| **Affordable** | Peer prices, not agency rates |
| **Real-Time** | Socket.io for instant order chat + peer-to-peer DMs |
| **Developer-Friendly** | Clean REST API, type-safe schema, Supabase integration |

---

## 🚀 How to Run the Project

### Backend (Server)
```bash
cd server
npm install
# Add your .env (see .env.example)
npm run dev         # starts on http://localhost:5000
```

### Frontend (Client)
```bash
cd client
npm install
npm run dev         # starts on http://localhost:5173
```

### Environment Variables Required (server/.env)
```
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
SMTP_EMAIL=
SMTP_PASSWORD=
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=
```

---

## 📁 Project File Map

```
client/src/
├── components/
│   ├── Navbar.jsx            ← Global navbar (auth-aware, responsive, DM badge)
│   ├── BrandLogo.jsx         ← Reusable brand identity component
│   └── ProtectedRoute.jsx    ← Auth guard wrapper
├── pages/
│   ├── Landing.jsx           ← Full cinematic marketing page
│   ├── Login.jsx             ← Google OAuth + email/password login
│   ├── Signup.jsx            ← Google OAuth + email/password signup
│   ├── ForgotPassword.jsx    ← Password reset request
│   ├── ResetPassword.jsx     ← Token-based password reset
│   ├── VerifyEmail.jsx       ← Email verification landing
│   ├── Onboarding.jsx        ← 4-step new user profile wizard
│   ├── Browse.jsx            ← Service marketplace listing
│   ├── ServiceDetail.jsx     ← Individual service + buy flow
│   ├── PostService.jsx       ← Create/edit a service
│   ├── Dashboard.jsx         ← Buyer & seller overview
│   ├── Profile.jsx           ← Own user profile editor
│   ├── SellerProfile.jsx     ← Public seller profile viewer
│   ├── OrderDetail.jsx       ← Order management + order chat
│   ├── Messages.jsx          ← Inbox + peer-to-peer DM chat
│   └── PaymentSuccess.jsx    ← Post-payment confirmation
├── hooks/
│   └── useRazorpay.js        ← Dynamically loads Razorpay checkout script
├── store/
│   └── authStore.js          ← Zustand global auth state
└── lib/
    └── api.js                ← Axios instance with base URL & credentials

server/
├── server.js                 ← Express app + Socket.io (order chat + DMs)
├── routes/
│   ├── auth.js               ← Register, login, Google OAuth, verify, reset
│   ├── users.js              ← Get/update user profile
│   ├── services.js           ← Full CRUD + user-specific listing
│   ├── orders.js             ← Order lifecycle management
│   ├── reviews.js            ← Submit & fetch reviews
│   ├── messages.js           ← Order chat message history
│   ├── conversations.js      ← DM conversations + unread count
│   ├── payments.js           ← Razorpay create order + verify
│   └── upload.js             ← Cloudinary image upload
├── middleware/               ← Auth JWT middleware
├── config/
│   └── db.js                 ← Supabase client + connectDB()
└── supabase/                 ← SQL schema files
```

---

## 👤 About This Project

**Cosen** is being built as a full-stack production-grade application with real-world features:
payments, real-time messaging, authentication, image uploads, and a PostgreSQL database.

- **GitHub**: [ankitrajput15558/cosen_campaseMarket](https://github.com/ankitrajput15558/cosen_campaseMarket)
- **Stack**: React + Node.js + Supabase + Razorpay + Socket.io + Cloudinary + Google OAuth
- **Started**: April 2025
- **Last Updated**: April 2026
- **Status**: 🟡 In Active Development — Core platform feature-complete, polish & admin in progress

---

*"Every great campus product started as a student's weekend project."*
