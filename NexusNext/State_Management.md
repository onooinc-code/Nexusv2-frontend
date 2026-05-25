# State Management

## Setup
We utilize **Zustand** as our core client-side state provider, resolving Next.js App Router context boundaries via the `useAppStore` initialized inside a `StoreProvider`.

## State Slices (`/store/index.ts`)

1. **Global Jobs Pipeline (`jobs`)**
   - Monitors asynchronous task executions (simulated and real).
   - Variables: `id`, `name`, `progress`, `status`.
   - Used heavily by `GlobalJobMonitor` and accessed across `/tasks` and `/memory`.

2. **Notifications (`notifications`)**
   - Transient toast-style updates.

3. **Contacts Intelligence (`contacts`)**
   - Full CRUD logic for intelligence profiles.
   - Tied into `localStorage` across reloads (`hydrateContacts`).

4. **Tasks & Objectives (`tasks`)**
   - Status (TODO, In-Progress, Completed) and Priority logic.
   - Synchronizes UI dashboards smoothly with internal workflows.

5. **Memory Index (`memories`)**
   - Separates learned facts into: Semantic, Episodic, and Working states.
   - Computes relevance and contextual meta-tags.

6. **Workflows (`workflows`)**
   - Stores visual DAG topologies (future integration).

## Best Practices Implemented
- **Hydration**: Next.js requires bypassing SSR mismatches; all slices use a `hydrate()` function typically executed on component mount (`useEffect`) to load safe data from `localStorage`.
- **Decoupling**: Views subscribe solely to their sliced contexts (e.g. `const tasks = useAppStore(s => s.tasks)`).
