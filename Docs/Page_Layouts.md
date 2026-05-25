# Page Layout Designs

## Dashboard (DashboardView)
- Top bar with branding, user menu, and connection status.
- Left rail (`NxNavRail`) with hub links.
- Main area renders `DashboardCharts` and summary cards.

## Contacts (ContactsView)
- Grid list of `NxContactCard3D` with 3‑pane detail on click.
- `ContactList` with infinite scroll skeleton.

## Contact Detail (ContactDetail)
- Hero card with 3D avatar.
- Tabs for notes, timeline, analytics.
- `NxRelationTimeline` for interaction history.

## Workflows (WorkflowBuilder)
- Drag‑drop canvas skeleton with phase‑1 nodes.
- Right sidebar for node configuration.

## Agents (AgentsView)
- Team‑style grid with `NxAgentBadge`.
- Queue panel via `NxQueuePill`.

## Logs (LogsView)
- Flat list with `LogStream`.
- Modal viewer `NxLogViewerModal`.

## Settings (SettingsView)
- Form sections with `NxActionButton` save.
- Theme switcher (`NxThemeSwitcher`).

## AI Models (AIModelsView)
- Provider cards (`NxAddProviderForm`).
- Health modal (`NxProviderHealthModal`).

## Conversations (ConversationsView)
- Thread list with unread badge.
- Chat interface via `PeopleChat`.

## Tasks (TasksView)
- List with status pills.
- Detail in `TaskDetail`.

## Memory (MemoryView)
- Graph viewer `MemoryViewer`.
- Mini graph `NxMemoryMiniGraph`.

## General Patterns
- Breadcrumbs for hierarchy.
- Persistent loading skeleton across navigation.
- Toast notifications via `Toast`.