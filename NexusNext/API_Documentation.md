# API & Integrations Documentation

Currently, external fetch routes and service behaviors are centrally mocked/proxied in client interfaces to guarantee seamless preview functionality, bounded within the following specs:

## Active Integrations

### Gemini Core Interfaces
- **Model Endpoints**: `gemini-3.5-flash` for agent processing, `gemini-3.1-pro-preview` for complex structural reasoning.
- **Connection Pipeline**: Tested natively within `/ai-models` tracking simulated TTFB (Time to First Byte) latency metrics.

### System Utilities
- **Weather Services**: Fallback configured against `api.open-meteo.com` intended for generalized location context injection into the agent contexts.
- **Local Nexus Backend**: Endpoints like `https://api.nexus-core.local/v1/execute` form the architectural spine for background orchestration run loops once instantiated.

## Global Error Boundaries & Fallbacks
- Rate limiting (429) and Unauthorized (401) errors trigger Toast notifications utilizing `useAppStore().addNotification()`. 
- Global jobs report progress percentages dynamically. Abandoned or failed operations register distinct `XCircle` failure states within the Job Monitor overlay.
