# Nexus Platform: Real‑Time Communication & Background Job Queues
*A comprehensive guide to WebSockets, Laravel Reverb, Laravel Echo, and Job Queues in the Nexus ecosystem.*

---

## 1. Architectural Definitions & Core Concepts

To build responsive, modern interfaces, the Nexus platform splits communication patterns into **synchronous request-response API cycles** and **asynchronous real-time telemetry pipelines**. The core technologies driving this telemetry are broken down below:

### 📡 WebSockets
**WebSockets** represent a communication protocol (standardized as RFC 6455) that provides a persistent, full-duplex, bidirectional communication channel over a single TCP connection.
*   **The Problem it Solves:** Traditional HTTP is unidirectional—the client must *ask* (request) before the server can *respond*. If the server has new data (e.g., an LLM finished generating text, or a WhatsApp message arrived), it has no way to push it to the client without the client constantly polling the server (which wastes battery, bandwidth, and database performance).
*   **How it Works:** The client starts with a standard HTTP request containing an `Upgrade: websocket` header. The server accepts this request and "upgrades" the connection. The socket remains open indefinitely, allowing both client and server to push raw messages (frames) instantly with virtually zero overhead.

### 🔊 Laravel Reverb
**Laravel Reverb** is a brand new, first-party, high-performance WebSocket server specifically designed for Laravel applications.
*   **Role in Nexus:** In traditional Laravel setups, implementing real-time features required third-party services like Pusher (expensive at scale) or running Node.js microservices like Soketi or Laravel Echo Server. Reverb is written entirely in PHP using ReactPHP, optimized for speed, and fully integrated with Laravel's native broadcasting system.
*   **How it Works:** Reverb runs as a daemon process in the backend listening on a dedicated port (e.g., `8080` in local dev, mapped to port `443` secure SSL in production). When the Laravel backend dispatches a broadcast event, it publishes the payload locally to a Redis server. Reverb reads from Redis and pushes that payload over the open WebSocket connections to all subscribed frontend clients.

### 📣 Laravel Echo
**Laravel Echo** is a lightweight client-side JavaScript library that makes it simple to subscribe to channels and listen for events broadcasted by your backend.
*   **Role in Nexus:** Instead of writing raw WebSocket event-listeners, parsing messages, handling reconnect logic, and signing authorization tokens for private channels manually, you use Laravel Echo.
*   **Supported Drivers:** Echo supports different "broadcasters" under the hood. In our Next.js frontend, Echo is configured with the `pusher` driver, which communicates with Laravel Reverb (since Reverb implements the Pusher protocol standard).

### ⚙️ Job Queues
**Job Queues** allow you to offload time-consuming, CPU-heavy, or high-latency tasks (like processing AI inferences, vectorizing text, saving to Pinecone, or importing contacts) to a separate background process.
*   **The Problem it Solves:** Web requests must complete quickly (typically under 1-2 seconds) to avoid frustrating the user and blocking server threads. If a user triggers a workflow that needs to call an LLM (takes 5s) and index vectors (takes 2s), running this inside the controller request will cause time-outs or terrible responsiveness.
*   **How it Works:** When a heavy task is requested, the application serializes the parameters into a "Job" class and pushes it into a persistent storage buffer (we use **Redis**). Separate worker daemons (`php artisan queue:work` or `queue:listen`) run constantly in the background, pop individual jobs from Redis, execute their logic, log progress, and handle errors resiliently without blocking web-traffic.

---

## 2. Platform Telemetry Flow (How It Fits Together)

Below is the execution flow demonstrating how a Next.js action transitions into a queued background job, which then feeds real-time updates back to the UI:

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser (Next.js)
    participant API as Laravel API Router
    participant Redis as Redis Server (Queue & Pub/Sub)
    participant Worker as Laravel Queue Worker
    participant Reverb as Laravel Reverb Server
    participant Echo as Laravel Echo Client

    User->>Echo: 1. Establish persistent secure WebSocket (WSS) connection

    Reverb-->>Echo: WebSocket Handshake Accepted

    Echo->>API: 2. Authenticate & Join Private Channel ("job.batch.XYZ")

    API-->>Echo: HMAC Authorization Token Granted
    --------


    User->>API: 3. Trigger Heavy AI Workflow (POST /api/v1/ai-models/execute)

    API->>Redis: 4. Push "ExecuteAiModelJob" to "llm-inference" Queue

    API-->>User: 5. Return fast HTTP 202 (Accepted) + Job ID: XYZ
    
    Note over Worker, Redis: Worker daemon pulls job when slot is free
    Redis->>Worker: 6. Hand job payload to Worker thread
    
    loop Job Execution
        Worker->>Worker: Execute LLM Inferences (Gemini/OpenAI)
        Worker->>Redis: 7. Publish progress event (BatchProgressUpdated) to Redis Channel
        Redis->>Reverb: 8. Trigger Pub/Sub notification to Reverb daemon
        Reverb->>Echo: 9. Push Real-Time Broadcast Payload via WebSocket
        Echo->>User: 10. Update Zustand Store & render progress bar (80%)
    end
    
    Worker->>API: 11. Complete Job & write results to database
```

---

## 3. Real Use-Cases in the Nexus Codebase

By auditing both repositories, we can map exactly where and how these technologies are applied:

### Case A: Real-Time AI Inference Jobs (`ExecuteAiModelJob`)
*   **The Problem:** Executing LLM prompts via API (Gemini, OpenAI, Anthropic) is highly high-latency. Keeping a standard HTTP connection open for 30+ seconds leads to timeouts, browser drops, and poor server thread allocation.
*   **The Job Queue Solution:** The backend defines `app/Jobs/ExecuteAiModelJob.php` which runs on a specialized `llm-inference` queue. It includes robust resilience patterns:

    *   **Idempotency:** Generates a unique key (`execute_ai_model:{userId}:{executionId}`) so that if a duplicate request is dispatched, it ignores it.

    *   **Failover Handling:** Resolves backup providers automatically.
    *   **Rate-Limit Safety:** If the external LLM throws an HTTP 429 (Rate Limit), instead of blocking the background thread with `sleep()`, it safely releases the job back to the queue with exponential backoff (`$this->release($delay)`).

*   **The WebSocket Broadcast:** Once execution completes, it dispatches the `AiModelExecutionCompleted` event (`app/Events/AiModelExecutionCompleted.php`), which implements 

`ShouldBroadcastNow`. Laravel broadcasts this payload through Reverb, pushing the finalized LLM output directly to the active user's screen.

### Case B: Multi-Stage Memory Pipelines (`ExtractMemoryJob` + Chains)
*   **The Problem:** When a conversation concludes, the system extracts memories, vectorizes them (generates embeddings), and indexes them in a Pinecone vector database. This requires three distinct API integrations. If any step fails, the system must recover without losing the memory data.
*   **The Job Queue Solution:** The backend dispatches `ExtractMemoryJob.php` (on the `default` queue). This job parses the conversation, isolates facts, preferences, and concerns, and creates memory records in SQL.
    *   **Job Chaining:** It then builds a pipeline chain:
        ```php
        $jobChain[] = new VectorizeMemoryJob($memory->id, $memoryData['content']);
        $jobChain[] = new SaveToPineconeJob($memory->id, [], ['source' => 'conversation']);
        Bus::chain($jobChain)->dispatch();
        ```
        The queue handles this sequentially. If `VectorizeMemoryJob` succeeds, it immediately fires `SaveToPineconeJob`. If either fails, the transaction is safely logged in the database for admin review.
*   **The WebSocket Broadcast:** When memories are successfully pulled, it dispatches the `MemoriesExtracted` event. The frontend intercepts this to instantly refresh the contact's relationship memory panel without requiring a manual page reload.

### Case C: WhatsApp Integration & Webhook Ingestion (`WAHA`)
*   **The Problem:** External WhatsApp messages flow in from the WAHA gateway. These webhook callbacks must be absorbed instantly, processed, stored, and displayed in the live chat screen.
*   **The Job Queue Solution:** The webhook controller receives a payload and pushes the ingestion task onto the queue immediately to release the WAHA server response.
*   **The WebSocket Broadcast:** The backend fires the `MessageSent` or `MessageReceived` events (`app/Events/MessageSent.php`). Reverb instantly pushes this new message frame to the client browser, maintaining a token-by-token or message-by-message live stream inside the `LiveChatStream` component.

---

## 4. Frontend Integration & Status Checkpoints

The Next.js client (`/var/www/os/nsf`) connects to the Laravel backend using two packages: `laravel-echo` and `pusher-js`.

### How Next.js Connects to Reverb
The frontend implements a custom React hook: [`/hooks/useWebSocket.ts`](file:///var/www/os/nsf/hooks/useWebSocket.ts).
1.  **Environment Variables:** It reads the configuration from `.env.local`:
    *   `NEXT_PUBLIC_REVERB_APP_KEY`: Public client credential.
    *   `NEXT_PUBLIC_REVERB_HOST`: Reverb service host domain (`os.square-ltd.com`).
    *   `NEXT_PUBLIC_REVERB_PORT`: Secure port (`443`).
    *   `NEXT_PUBLIC_REVERB_SCHEME`: Transport scheme (`https` / `wss`).
2.  **Instantiation:**
    It sets up `Pusher` in WebSocket-only mode (bypassing HTTP fallback protocols) and passes it to the `Echo` constructor:
    ```ts
    const echo = new Echo({
      broadcaster: 'pusher',
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || '',
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || '127.0.0.1',
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '6001', 10),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || '6001', 10),
      forceTLS: process.env.NEXT_PUBLIC_REVERB_FORCE_TLS === 'true',
      disableStats: true,
      enabledTransports: ['ws', 'wss'],
    });
    ```

### How to Check the Status of WebSockets & Queues

#### 1. Checking WebSocket Connection Status in the UI
In the bottom status bar ([`NxStatusBar.tsx`](file:///var/www/os/nsf/components/NxStatusBar.tsx)), the frontend hooks directly into the state of the socket:
```tsx
const { connectionStatus, error } = useWebSocket();
// ...
<NxConnectionDot status={connectionStatus === 'connected' ? 'online' : connectionStatus === 'connecting' ? 'connecting' : 'offline'} />
<span>Reverb</span>
```
*   🟢 **Green (Connected):** Reverb is connected and authenticated.
*   🟡 **Pulsing Blue/Yellow (Connecting):** Currently handshaking or recovering from a network drop.
*   🔴 **Red (Offline):** Reverb server is down, blocked by a firewall, or SSL cert is expired.

#### 2. Checking Real-Time Frames in the Browser
1.  Open **Chrome DevTools** (F12) -> Go to the **Network** tab.
2.  Select **WS** (WebSockets) to filter traffic.
3.  Find the active socket connection (e.g., `wss://os.square-ltd.com/app/viys1sd5...`).
4.  Click on the **Messages** sub-tab.
5.  You can see connection pings/pongs and the raw JSON payload of every broadcast event.

#### 3. Monitoring the Queue Worker Health (Laravel Horizon)
Since the backend has `laravel/horizon` installed (`composer.json`), you can access the admin dashboard:
*   **URL:** `https://os.square-ltd.com/ns/horizon` (requires admin auth).
*   **What to check:** Horizon gives deep metrics about queue congestion, throughput, active supervisors, completed jobs, and failed jobs.
*   **Failed Jobs (DLQ):** If a job fails continuously, it lands in the Dead Letter Queue (DLQ). The API provides access to retry or delete them via `Route::get('/admin/dlq', ...)`.

---

## 5. Security & Integration Code Audit
> [!IMPORTANT]
> **CRITICAL CODE AUDIT FINDINGS:**
> After analyzing both the backend and frontend code bases, there are **critical implementation mismatches and gaps** that prevent real-time features from functioning correctly. 

Below are the 5 major discrepancies identified between the frontend's static code and the backend's real broadcast events:

### ❌ Audit Finding 1: Mocked Job Pipeline Telemetry
*   **The Issue:** The frontend "Global Job Pipeline" sidebar UI ([`GlobalJobMonitor.tsx`](file:///var/www/os/nsf/components/GlobalJobMonitor.tsx)) displays active jobs, but it is **completely fake and simulated**.
*   **The Code Proof:** Inside [`/store/index.ts`](file:///var/www/os/nsf/store/index.ts#L174-L202), when you call `addJob`, it creates a simulated `setInterval` timer:
    ```typescript
    // Inside nsf/store/index.ts
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 5;
      if (progress >= 100) {
        get().updateJobProgress(id, 100, 'success');
      } else {
        get().updateJobProgress(id, progress);
      }
    }, 1500);
    ```
    This means the UI is completely decoupled from the actual backend queues and Reverb event broadcasts!
*   **Correct Fix Needed:** The frontend must use `useWebSocket` to listen on the private channel `job.batch.{batchId}` and update the Zustand store using the real backend `BatchProgressUpdated` event percentages.

### ❌ Audit Finding 2: Presence Channel Name Mismatch
*   **The Issue:** The frontend hook attempts to join a general presence channel named `'presence'`, but the backend authorization routes do not support it.
*   **The Code Proof:** 
    *   In the frontend hook [`useWebSocket.ts:L80`](file:///var/www/os/nsf/hooks/useWebSocket.ts#L80):
        ```ts
        echo.join('presence').here(...)
        ```
    *   In the backend config [`channels.php:L24`](file:///var/www/os/ns/routes/channels.php#L24):
        ```php
        Broadcast::channel('presence.users.{conversationId}', function ($user, $conversationId) { ... });
        ```
    Reverb will reject authorization for the `'presence'` subscription, returning an HTTP 403, because no channel pattern matches `'presence'`.

### ❌ Audit Finding 3: Placeholder/Broken Broadcast Authorization Callback
*   **The Issue:** When trying to connect to private/presence channels, Laravel Reverb requires signature verification. The frontend hook implements a mock authorizer that doesn't actually contact the Laravel server.
*   **The Code Proof:** In [`useWebSocket.ts:L49-L57`](file:///var/www/os/nsf/hooks/useWebSocket.ts#L49-L57):
    ```ts
    authorizer: (channel: any) => {
      return {
        authorize: (socketId: string, callback: any) => {
          // For now, we'll use a simple authorization
          // In a real app, you'd make an API call to your backend
          callback(false, { auth: `Bearer ${localStorage.getItem('token') || ''}` });
        }
      };
    }
    ```
    This mock will cause all private and presence channels to fail. Laravel Echo expects the authorizer to post the client `socket_id` and `channel_name` to the backend broadcast auth endpoint (`/api/v1/broadcasting/auth`), receive the encrypted HMAC signature, and pass that signature to Reverb.

### ❌ Audit Finding 4: Unused Event Listeners
*   **The Issue:** The frontend `useWebSocket.ts` hook exposes `subscribeToChannel`, but it is **never called or imported by any layout, page, or state manager in Next.js**. Real-time message streaming, memory indexing, and toast notifications are completely dead/dormant.

---

## 6. Action Plan & Code Remediation

To elevate the application from static simulations to real-time production status, implement the following two corrective code updates.

### Task A: Fix the Custom Authorizer & Presence Channel
Update the custom `Echo` configuration in [`/var/www/os/nsf/hooks/useWebSocket.ts`](file:///var/www/os/nsf/hooks/useWebSocket.ts) to correctly POST signatures back to the Laravel backend.

Replace lines `49-57` in `useWebSocket.ts` with this secure, operational implementation:

```ts
// Update in /var/www/os/nsf/hooks/useWebSocket.ts
authorizer: (channel: any) => {
  return {
    authorize: (socketId: string, callback: any) => {
      axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/broadcasting/auth`, {
        socket_id: socketId,
        channel_name: channel.name
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
          'Accept': 'application/json'
        }
      })
      .then(response => {
        // Pass signature verification to Pusher protocol client
        callback(false, response.data);
      })
      .catch(error => {
        console.error("Broadcasting auth failed:", error);
        callback(true, error);
      });
    }
  };
}
```

---

### Task B: Wire Real Background Jobs to the Zustand Store
Instead of a simulated `setInterval` timer, hook the Zustand store directly into the real-time websocket listener.

#### 1. Declare the Listener Action in the Store
Update [`/var/www/os/nsf/store/index.ts`](file:///var/www/os/nsf/store/index.ts):

```typescript
// 1. Add this action inside useGlobalStore definition in nsf/store/index.ts
// Remove the setInterval from addJob, and declare:

addJob: (name, backendJobId) => {
  const newJob: Job = { 
    id: backendJobId, // Use real backend job/batch UUID
    name, 
    status: 'running', 
    progress: 0 
  };
  set((state) => ({ jobs: [newJob, ...state.jobs], isJobMonitorOpen: true }));
  get().addNotification('info', `Workflow dispatched: ${name}`);
  return backendJobId;
},
```

#### 2. Bind the Real-Time Event Listener inside Next.js Page
In your core dashboard layout or main page component (e.g. [`/var/www/os/nsf/app/layout.tsx` or main page]), import your WebSocket hooks to update the store:

```tsx
import { useEffect } from 'react';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useGlobalStore } from '@/store';

export function RealTimeIntegrationWrapper() {
  const { echo, connectionStatus } = useWebSocket();
  const updateJobProgress = useGlobalStore((s) => s.updateJobProgress);
  const addNotification = useGlobalStore((s) => s.addNotification);
  const jobs = useGlobalStore((s) => s.jobs);

  useEffect(() => {
    if (!echo || connectionStatus !== 'connected') return;

    // Listen to real-time updates for each active background job in store
    const activeJobs = jobs.filter(j => j.status === 'running');
    
    activeJobs.forEach(job => {
      // Subscribe to private channel from Laravel Event: BatchProgressUpdated
      const channelName = `job.batch.${job.id}`;
      
      echo.private(channelName)
        .listen('.App\\Events\\BatchProgressUpdated', (data: any) => {
          // Update real progress directly from telemetry stream!
          updateJobProgress(job.id, data.percentage, data.status);
          
          if (data.status === 'success') {
            addNotification('success', `Completed: ${job.name}`);
            echo.leave(channelName); // Clean up socket connection
          } else if (data.status === 'failed') {
            addNotification('error', `Failed: ${job.name}`);
            echo.leave(channelName);
          }
        });
    });

    return () => {
      activeJobs.forEach(job => {
        echo.leave(`job.batch.${job.id}`);
      });
    };
  }, [echo, connectionStatus, jobs, updateJobProgress, addNotification]);

  return null;
}
```

---

## 7. Concept Reference Table

| Concept | Protocol / Technology | Backend Implementation | Frontend Integration | Primary Function in Nexus |
| :--- | :--- | :--- | :--- | :--- |
| **WebSockets** | RFC 6455 (TCP persistent) | Laravel Reverb server daemon | Browser native connection | Establish low-overhead bidirectional line |
| **Laravel Reverb** | Pusher WebSocket Protocol | daemon on port `8080` (SSL 443) | `pusher-js` Client | Publishes backend triggers to listeners |
| **Laravel Echo** | JavaScript Broadcaster Client | Laravel Broadcasting Engine | `laravel-echo` package | Subscribes to channels & parses event payloads |
| **Job Queue** | Queue Worker Daemon | `Horizon` supervisor / Redis buffer | REST API trigger + WS feedback | Handles async LLM Inference & Pinecone indexing |
