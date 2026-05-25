# Page Layouts and Routing

## Hierarchy Matrix

- **`/` (Dashboard Main)**
  - At-a-glance telemetry map, active sessions, heatmaps, and mini-task queues.

- **`/agents`**
  - **Layout**: Grid-based display of Agent profiles (LLM allocations, token metrics).
  - **Purpose**: Manage heuristics and cognitive behavior nodes.

- **`/ai-models`**
  - **Layout**: Matrix grid showing models (`gemini-3.5-flash`, etc.).
  - **Purpose**: Endpoint management, latency verification.

- **`/apis`**
  - **Layout**: List format with expandable testing interfaces.
  - **Purpose**: System integration tests.

- **`/contacts` & `/contacts/[id]`**
  - **Layout**: Dynamic filter bar with toggleable Grid/Table switch. Nested routes show immersive Profile Cards with Tabbed data (Timeline, Notes).
  - **Purpose**: Identity resolution and knowledge tracking.

- **`/conversations`**
  - **Layout**: Dual-pane classic chat interface (Sidebar for histories, main window for interactive ChatBubbles).
  - **Purpose**: Real-time interactivity with agents.

- **`/memory`**
  - **Layout**: Left-heavy detail grid against right-rail analytics (MiniGraphs, TagClouds).
  - **Purpose**: Cognitive synthesis manipulation.

- **`/tasks`**
  - **Layout**: 3-column Kanban-style board (To-Do, In-Progress, Completed).
  - **Purpose**: Operational staging.

- **`/workflows`**
  - **Layout**: Canvas context (wip).
  - **Purpose**: DAG-based logic pipelines.
