"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  AppLayout, 
  NxContextBar, 
  NxMetricCard, 
  NxAgentCard, 
  NxGlassCard, 
  NxChatBubble, 
  NxChatInput, 
  NxThinkingIndicator,
  NxActionButton,
  NxEmptyState,
  NxActivityHeatmap
} from '@/components';
import { Users, Cpu, GitMerge, BrainCircuit, Sparkles, AlertCircle, RefreshCw, Terminal, Send } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface ActivityLog {
  id: string;
  time: string;
  level: 'info' | 'warning' | 'error';
  source: string;
  message: string;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I am Nexus, your central cognitive coordinator. I have compiled the status of your 8 active AI agents and connected work streams. How can I assist you with relationship intelligence or orchestration today?",
      timestamp: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  
  // Real-time metrics
  const [contactsCount, setContactsCount] = useState(14293);
  const [workflowsCount, setWorkflowsCount] = useState(892);
  const [activeAgentsCount, setActiveAgentsCount] = useState(8);
  const [memoryUsage, setMemoryUsage] = useState("1.2M");

  // Simulated activity logs
  const [logs, setLogs] = useState<ActivityLog[]>([
    { id: '1', time: '20:11:02', level: 'info', source: 'Ingestion Alpha', message: 'Ingesting batch payload from primary pipeline' },
    { id: '2', time: '20:11:05', level: 'info', source: 'Orchestrator', message: 'Assigned outbound outreach task to Agent outreach-coord' },
    { id: '3', time: '20:11:09', level: 'warning', source: 'Memory Bank', message: 'Token budget threshold reached 85% for model 3.5-flash' },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to chat end
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Periodic simulated log generator & dynamic metrics
  useEffect(() => {
    const logPool: Omit<ActivityLog, 'id' | 'time'>[] = [
      { level: 'info', source: 'Ingestion Alpha', message: 'Successfully parsed and cleaned metadata for 4 contacts' },
      { level: 'info', source: 'Outreach Coordinator', message: 'Synthesizing customized greeting for high-value partner' },
      { level: 'info', source: 'Memory Synthesizer', message: 'Archiving transaction summary to episodic memory' },
      { level: 'warning', source: 'Rate Limiter', message: 'Approaching token frequency limits on model gemini-3.5-flash' },
      { level: 'info', source: 'Orchestrator', message: 'Evaluating next workflow step: enrichment-pipeline' },
    ];

    const interval = setInterval(() => {
      // Add a log
      const randomLog = logPool[Math.floor(Math.random() * logPool.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      setLogs(prev => [
        { id: String(Date.now()), time: timeStr, ...randomLog } as ActivityLog,
        ...prev.slice(0, 7)
      ]);

      // Flutter metrics
      setContactsCount(prev => prev + (Math.random() > 0.6 ? 1 : 0));
      if (Math.random() > 0.8) {
        setWorkflowsCount(prev => prev + 1);
      }
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Handle Send Message to Gemini API Route
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // Create user message
    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    setChatError(null);

    try {
      // Gather system state context for "grounding"
      const systemContext = `
Active Contacts count: ${contactsCount}
Active Workflows run count: ${workflowsCount}
Active Agents count: ${activeAgentsCount}
Shared Memory bank usage: ${memoryUsage}
Current active agents listing:
- Data Ingestion Alpha (Role: Data Processing, Status: online)
- Outreach Coordinator (Role: Communications, Status: busy)
- Memory Synthesizer (Role: Archival, Status: offline)
      `;

      // API request to server-side Gemini endpoint
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
          history: messages.map(m => ({ role: m.role, content: m.content })),
          context: systemContext
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate model response.');
      }

      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (err: any) {
      console.error(err);
      setChatError(err.message || 'Error communicating with Nexus intelligence. Please verify API configuration.');
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: "Memory clear completed. Ready for fresh orchestration coordinates. What would you like to build or check?",
        timestamp: 'Just now'
      }
    ]);
    setChatError(null);
  };

  return (
    <AppLayout>
      <NxContextBar 
        title="Dashboard Overview" 
        breadcrumbs={[{ label: 'Nexus', href: '/' }]} 
      />
      
      <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto w-full max-w-7xl mx-auto">
        
        {/* Hero Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-gray-100 tracking-tight animate-in fade-in duration-500">
              Nexus Intelligence Center
            </h1>
            <p className="text-gray-400 mt-1 font-sans text-sm md:text-base">
              Central cognitive dashboard orchestrating multi-agent context databases and relations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NxActionButton 
              variant="secondary" 
              size="sm" 
              onClick={() => {
                setContactsCount(14293);
                setWorkflowsCount(892);
              }}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Reset Stream
            </NxActionButton>
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <NxMetricCard 
            title="Total Contacts" 
            value={contactsCount.toLocaleString()} 
            trend="up" 
            trendValue="12% this week" 
            icon={<Users className="w-5 h-5 text-nexus-blue" />} 
          />
          <NxMetricCard 
            title="Active Agents" 
            value={String(activeAgentsCount)} 
            trend="neutral" 
            trendValue="Stable" 
            icon={<Cpu className="w-5 h-5 text-hedral-purple" />} 
          />
          <NxMetricCard 
            title="Workflows Executed" 
            value={String(workflowsCount)} 
            trend="up" 
            trendValue="24% this week" 
            icon={<GitMerge className="w-5 h-5 text-emerald-400" />} 
          />
          <NxMetricCard 
            title="Memory Tokens" 
            value={memoryUsage} 
            trend="down" 
            trendValue="3% this week" 
            icon={<BrainCircuit className="w-5 h-5 text-amber-400" />} 
          />
        </div>

        {/* Main Split Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Columns - Telemetry + Activity (2/3 width) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Active Agents telemetries */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-nexus-blue" />
                  Active Agents Telemetry
                </h2>
                <span className="text-xs px-2.5 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-full font-mono">
                  3 core of 8 allocated
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NxAgentCard 
                  id="1" 
                  name="Ingestion Alpha" 
                  role="Data Processing" 
                  status="online" 
                  tokenUsage={450320} 
                />
                <NxAgentCard 
                  id="2" 
                  name="Outreach Coord" 
                  role="Communications" 
                  status="busy" 
                  tokenUsage={120500} 
                />
                <NxAgentCard 
                  id="3" 
                  name="Memory Synthesizer" 
                  role="Archival" 
                  status="offline" 
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
               <NxActivityHeatmap />
            </div>

            {/* Live activity feed from the virtual machine */}
            <div className="flex flex-col gap-3 flex-1">
              <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                Live Feed Tail
              </h2>
              
              <NxGlassCard className="flex-1 flex flex-col p-4 font-mono text-xs text-gray-300 min-h-[300px] gap-2.5 select-none bg-black/40 border-white/10">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-2 text-gray-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>Real-time platform telemetry streaming...</span>
                </div>
                
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[320px] pr-1 scrollbar-thin">
                  {logs.map((log) => (
                    <div key={log.id} className="flex gap-2.5 hover:bg-white/5 p-1.5 rounded transition-colors items-start">
                      <span className="text-gray-500 shrink-0 select-none">[{log.time}]</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold shrink-0 ${
                        log.level === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                        log.level === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-gray-400 font-semibold shrink-0">[{log.source}]</span>
                      <span className="text-gray-200 flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              </NxGlassCard>
            </div>

          </div>

          {/* Right Column - Gemini Assist Console (1/3 width) */}
          <div className="lg:col-span-1 flex flex-col gap-3 h-full">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-hedral-purple animate-pulse" />
                Nexus Central AI
              </h2>
              <button 
                onClick={clearChat}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors bg-white/5 px-2 py-1 rounded border border-white/5"
              >
                Clear History
              </button>
            </div>

            <NxGlassCard className="p-4 flex flex-col h-[520px] bg-black/20 border-white/10 relative overflow-hidden">
              
              {/* Messages Container */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4 pr-1 scrollbar-thin">
                {messages.map((msg) => (
                  <NxChatBubble 
                    key={msg.id}
                    id={msg.id}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                    agentName={msg.role === 'assistant' ? 'Nexus Coord' : undefined}
                  />
                ))}
                
                {isTyping && (
                  <div className="flex gap-4">
                    <NxThinkingIndicator label="Synthesizing response..." />
                  </div>
                )}

                {chatError && (
                  <div className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-200 text-xs p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{chatError}</span>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="shrink-0 border-t border-white/5 pt-3">
                <NxChatInput 
                  onSend={handleSendMessage}
                  isProcessing={isTyping}
                  placeholder="Ask Nexus anything..."
                />
              </div>

            </NxGlassCard>
          </div>

        </div>

      </div>
    </AppLayout>
  );
}
