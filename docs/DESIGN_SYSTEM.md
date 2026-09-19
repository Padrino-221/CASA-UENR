# U-CHMS Design System Guide

This document defines the visual identity and UI patterns for the University Church Management System. All developers should adhere to these standards to maintain the premium "FlowMail SaaS" aesthetic.

## 🎨 Color Palette
The system uses a sophisticated Indigo palette designed for an enterprise, modern SaaS experience.

- **Primary (Indigo)**: `#6366F1` (Used for primary actions, badges, and brand highlights)
- **Primary Hover**: `#4F46E5` (Used for interaction states)
- **Primary Light**: `#EEF2FF` (Used for active navigation backgrounds)
- **Background Main**: `#FCFCFD` (Pristine light canvas for reduced eye strain and premium feel)
- **Surface**: `#FFFFFF` (Card and container background)
- **Text Main**: `#111827` (High-contrast for supreme legibility)
- **Text Muted**: `#9CA3AF` (Secondary labels and placeholder text)

## 🔠 Typography
- **Primary Font**: [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) (Clean, geometric, and modern)
- **Hierarchy**:
  - **H1-H6**: Bold (800), tight letter-spacing `-0.04em`, used for system headers.
  - **Body**: Regular padding and tracking, optimally readable for data-heavy views.

## 🧱 Key Components

### 1. Dual-Tier Premium Top Navigation
We do **not** use sidebars. Navigation must be strictly Topbar-centric.
- **Rules**:
  - **Upper Tier**: Contains Brand Logo, Global System Search, Notifications, and User Profile.
  - **Lower Tier**: Contains primary system links. Items should scroll horizontally if they overflow on smaller viewports.
  - Active links in the secondary tier use the Primary Light (`#EEF2FF`) background with Primary (`#6366F1`) text and a bold stroke weight.
  - The entire header must remain elegantly flat or have a subtle bottom border (`#F3F4F6`), creating a clear demarcation without heavy shadows.

### 2. Premium Flow Cards
Use `.card-flow` for all main content containers, metrics, and data tables.
- **Rules**: Deeply rounded corners (`--radius-2xl`), very subtle base shadow (`--shadow-sm`), and animated hover elevation (`--shadow-xl`).

### 3. Buttons
- **Primary**: Pill-shaped `.btn-indigo` with hover elevation (`--shadow-lux`).
- **Icons**: Minimalist `lucide-react` icons. Do not over-saturate button interfaces.

## 📐 Layout Principles
- **Centralized Focus**: The layout main content area should generally be horizontally constrained (e.g., `max-w-7xl mx-auto`) to breathe, avoiding edge-to-edge stretching on ultra-wide screens.
- **Whitespace**: Maintain generous padding between navigation and content blocks to preserve an airy, "premium" feel.
- **Shadows**: Use the refined shadow variables (`--shadow-sm` up to `--shadow-lux`) specifically tuned for the Indigo aesthetic. Avoid generic dull grey shades.

---
*Last updated: 2026-04-17*
