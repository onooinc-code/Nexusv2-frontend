# Routing & Navigation

## Route Definitions (router/index.js)
```js
{
  path: '/',
  name: 'Dashboard',
  component: () => import('@/Pages/DashboardView'),
},
{
  path: '/contacts',
  name: 'Contacts',
  component: () => import('@/Pages/ContactsView'),
},
{
  path: '/contacts/:id',
  name: 'ContactDetail',
  component: () => import('@/Pages/ContactDetail'),
},
{
  path: '/workflows',
  name: 'Workflows',
  component: () => import('@/Pages/WorkflowsView'),
},
{
  path: '/workflows/create',
  name: 'WorkflowCreate',
  component: () => import('@/Pages/TaskCreating'),
},
{
  path: '/tasks',
  name: 'Tasks',
  component: () => import('@/Pages/TasksView'),
},
{
  path: '/tasks/:id',
  name: 'TaskDetail',
  component: () => import('@/Pages/TaskDetail'),
},
{
  path: '/agents',
  name: 'Agents',
  component: () => import('@/Pages/AgentsView'),
},
{
  path: '/ai-models',
  name: 'AIModels',
  component: () => import('@/Pages/AIModelsView'),
},
{
  path: '/memory',
  name: 'Memory',
  component: () => import('@/Pages/MemoryView'),
},
{
  path: '/logs',
  name: 'Logs',
  component: () => import('@/Pages/LogsView'),
},
{
  path: '/conversations',
  name: 'Conversations',
  component: () => import('@/Pages/ConversationsView'),
},
{
  path: '/chat/:id',
  name: 'Chat',
  component: () => import('@/Pages/PeopleChat'),
},
{
  path: '/settings',
  name: 'Settings',
  component: () => import('@/Pages/SettingsView'),
},
{
  path: '/template-library',
  name: 'TemplateLibrary',
  component: () => import('@/Pages/TemplateLibrary'),
},
{
  path: '/analytics',
  name: 'ContactAnalytics',
  component: () => import('@/Pages/ContactAnalytics'),
},
```

## Navigation Components
- `NxNavRail` – Desktop left rail.
- `MobileHeader` – Mobile top bar with hamburger.
- `Breadcrumbs` – Hierarchical breadcrumb.
- `Navigation` – Top bar wrapper.

## Protected Routes
All routes require auth token via Sanctum guard; unauthenticated users redirected to `/login`.