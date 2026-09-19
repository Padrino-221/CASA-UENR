# ⛪ University Church Management System (U-CHMS) Documentation

## 1. Overview
The **University Church Management System (U-CHMS)** is a centralized administration platform designed for the **Christ Apostolic Students and Associates (CASA)** and its campus ministries. It provides a unified data environment for managing national, regional, and local church chapters within the university landscape.

### Key Objectives
*   **Centralized Governance**: Unified portal for National Administrators to oversee regions and chapters.
*   **Data-Driven Ministry**: Transition from paper records to real-time digital tracking of spiritual growth.
*   **Financial Transparency**: Standardized recording and reporting of collections.
*   **Student Management**: Comprehensive database of student members across tertiary campuses.

---

## 2. Technical Stack
*   **Framework**: Next.js 15.1.4 (App Router)
*   **Language**: TypeScript
*   **Database**: Prisma ORM with SQLite (Development) / PostgreSQL (Production)
*   **Styling**: Vanilla CSS Modules with custom Design System
*   **Icons**: Lucide React
*   **Charts**: Recharts
*   **Authentication**: Auth.js v5 (In progress) with RBAC

---

## 3. Architecture & Project Structure
The project follows the Next.js App Router architecture, organized for scalability and maintainability.

### Key Directories
*   `src/app`: Contains all pages and API routes.
*   `src/components`: Reusable UI components, organized by domain (e.g., `charts/`, `ui/`).
*   `src/lib`: Utility functions and shared logic (e.g., `prisma.ts`, `utils.ts`).
*   `prisma/`: Database schema and migration files.
*   `public/`: Static assets such as logos and brand images.

### Role-Based Routing
The system implements Role-Based Access Control (RBAC):
*   `NATIONAL_ADMIN`: Access to all modules, including Regions and Reports.
*   `REGIONAL_ADMIN`: Access to chapters within their region, Members, and Financials.
*   `LOCAL_ADMIN`: Access to specific chapter data, Members, and Financials.

---

## 4. Data Model (Prisma)
The database schema is designed to reflect the hierarchical nature of the ministry.

*   **User**: Handles authentication and role-based scoping (National, Regional, Local).
*   **Region**: Represents geographical divisions.
*   **Chapter**: Local university chapter (e.g., UG, KNUST) linked to a Region.
*   **AcademicYear & Semester**: Manages timeframes for chapter activities.
*   **Student**: Detailed member profiles linked to a Chapter.
*   **Collection**: Financial records (Tithes, Offerings) linked to Students, Semesters, and Chapters.

---

## 5. Core Modules
### Dashboard
Dynamic overview with real-time stats and data visualization (Growth and Collections charts).
*   **API**: `/api/dashboard/stats`

### Regions & Chapters
Management interfaces for regions and local chapters.
*   **Features**: CRUD operations, search, and filtering.
*   **APIs**: `/api/regions`, `/api/chapters`

### Member Directory (Students)
Searchable database of all student members.
*   **Features**: Add new members, chapter linkage, and full-text search.
*   **API**: `/api/students`

### Financials & Collections
Secure tracking of all monetary contributions.
*   **Features**: Record-keeping for tithes/offerings, GHS calculations, and transaction history.
*   **API**: `/api/collections`

### Calendar & Semester Management
Tools for managing academic cycles across chapters.
*   **Features**: Start/Close semesters, historical tracking.
*   **API**: `/api/calendar`

---

## 6. Design System
The "Deep Ocean" aesthetic focuses on clarity, depth, and professionalism.

*   **Colors**: Primary Ocean Blue (`#0992C2`), Deep Navy (`#0B2D72`), Cyan (`#0AC4E0`), and Cream (`#F6E7BC`).
*   **Typography**: Manrope (Modern, professional font family).
*   **UI Patterns**:
    *   **Floating Sidebar**: Card-based navigation with `24px` border-radius.
    *   **Glassmorphic Containers**: `backdrop-filter: blur(10px)` for high-importance alerts.
    *   **Pill Badges**: Rounded status indicators for real-time feedback.

---

## 7. Getting Started
### Prerequisites
*   Node.js (LTS version)
*   npm or yarn

### Installation
1. Clone the repository.
2. Install dependencies: `npm install`
3. Initialize the database: `npx prisma migrate dev`
4. Run the development server: `npm run dev`

### Environment Variables
Ensure a `.env` file exists with the following (if applicable):
*   `DATABASE_URL`: Connection string for the database.
*   `NEXTAUTH_SECRET`: Secret key for authentication.

---

## 8. Implementation Roadmap
*   [x] **Phase 1: Foundation**: Core schemas and UI structure.
*   [x] **Phase 2: Functionality**: API integration for all main modules.
*   [ ] **Phase 3: Security**: Full Auth.js implementation and advanced RBAC.
*   [ ] **Phase 4: Intelligence**: Advanced analytics and report generation.
*   [ ] **Phase 5: Optimization**: Performance tuning and deployment readiness.

---
_Last updated: 2026-04-08_
