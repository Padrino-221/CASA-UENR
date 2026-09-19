# University Church Management System (U-CHMS)

An administrative platform for managing university church chapters across the national network. Features a command center UI with real-time analytics and role-based access control.

## 🚀 How to Run (Direct Deployment Guide)

### 1. Prerequisites
- **Node.js**: v18.x or v20.x
- **Database**: PostgreSQL (Recommended for production) or SQLite (Included for development).
- **Hosting Platform**: Vercel (Preferred) or Railway/Render.

### 2. Local Setup
1. **Clone the project** and install dependencies:
   ```bash
   npm install
   ```
2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in the details:
   ```bash
   cp .env.example .env
   ```
3. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Run the seed script to create admin accounts
   node prisma/seed-auth.js
   ```
4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deployment Guide (For Stakeholders Review)

### Step 1: Database (Neon.tech)
1. Sign up at [Neon.tech](https://neon.tech) and create a new project.
2. Copy the **Connection String** (PostgreSQL).
3. Set this as your `DATABASE_URL` in your hosting environment variables.

### Step 2: Hosting (Vercel)
1. Push your code to a GitHub repository.
2. Import the repository into **Vercel**.
3. Add the following **Environment Variables** in the Vercel Dashboard:
   - `DATABASE_URL`: (The string from Neon)
   - `NEXTAUTH_SECRET`: (Generate a random string: `openssl rand -base64 32`)
   - `NEXTAUTH_URL`: `https://your-app-name.vercel.app`
   - `AUTH_TRUST_HOST`: `true`
4. Click **Deploy**.

---

## 🔐 Default Administrative Credentials
*Used for the initial system review.*

| Role | Email | Password |
| :--- | :--- | :--- |
| **National Admin** | `national@u-chms.gov` | `admin123` |
| **Regional Admin** | `regional@u-chms.gov` | `admin123` |
| **Local Admin** | `local@u-chms.gov` | `admin123` |

---

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS + Premium Design Tokens
- **Database**: PostgreSQL (via Prisma ORM)
- **Identity**: NextAuth.js (v5)
- **Visuals**: Lucide Icons, Recharts (Modernized)
