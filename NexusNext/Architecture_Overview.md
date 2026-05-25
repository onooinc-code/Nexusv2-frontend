# Architecture Overview

## Tech Stack
- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand (`/store/index.ts`)
- **UI Architecture**: Component-driven with Custom `Nx` Components + Lucide React Icons
- **Animations**: Motion (framer-motion)

## Directory Structure
- `/app/`: Next.js App Router endpoints.
  - `/agents`: Agent workshop, configuration heuristics.
  - `/ai-models`: AI Model endpoints monitoring.
  - `/apis`: External services integration and tests.
  - `/contacts`: Intelligence relational databases and profile views.
  - `/conversations`: Agent chat interface.
  - `/memory`: Semantic, Episodic, and Working knowledge index.
  - `/tasks`: Objective tracking pipelines.
  - `/workflows`: Distributed pipeline configurations.
- `/components/`: Reusable UI elements (`AppLayout`, `GlobalJobMonitor`, bespoke `Nx` prefixed components).
- `/store/`: Global application state manager (Zustand) with local storage hydration.
- `/lib/` & `/utils/`: General utilities (Tailwind merges, classes).

## Design Philosophy
Uses a clean, dark-themed glassmorphism approach (Cosmic Slate style).
Prioritizes tech-focused visualizations and deep dark gradients interspersed with neon accents (`nexus-blue`, `hedral-purple`).
