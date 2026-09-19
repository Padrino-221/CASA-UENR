# Technical Architecture: U-CHMS

## Overview
The University Church Management System (U-CHMS) follows a modern, modular Next.js architecture designed for high maintainability, clear separation of concerns, and visual excellence.

## Design Principles
1. **Component Modularity**: No UI component should exceed 100 lines. Monolithic pages are decomposed into smaller, reusable functional units.
2. **Logic Separation (Hooks Pattern)**: All business logic, data fetching (API orchestration), and state management are encapsulated in custom React hooks located in `src/hooks/`.
3. **Type Centralization**: System-wide interfaces (Chapters, Regions, Students, etc.) are centralized in `src/types/models.ts` to ensure DRY (Don't Repeat Yourself) compliance and type safety.
4. **Service-Oriented Logic**: API interaction is handled through standardized hooks, making the UI layer purely presentational.

## Directory Structure
- `src/app/`: Next.js App Router pages (Orchestration Layer).
- `src/components/`:
  - `ui/`: Core design system components (Modals, Inputs, etc.).
  - `[module]/`: Feature-specific sub-components (Card, Table, Modals).
- `src/hooks/`: Custom hooks encapsulating feature logic (e.g., `useChapters`, `useCalendar`).
- `src/types/`: Centralized TypeScript interfaces.
- `scripts/utility/`: Maintenance and administrative tools.
- `docs/`: Technical documentation and API patterns.

## Data Layer
- **ORM**: Prisma for type-safe database access.
- **Authentication**: NextAuth.js v5 for secure session management and role-based access control (RBAC).

## Admin Tiers
- **NATIONAL_ADMIN**: Global network oversight and regional configuration.
- **REGIONAL_ADMIN**: Management of chapters within their region.
- **LOCAL_ADMIN**: Local chapter administration and member oversight.
