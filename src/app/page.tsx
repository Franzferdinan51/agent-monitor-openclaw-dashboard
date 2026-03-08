"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Navbar from "@/components/dashboard/Navbar";
import SystemStats from "@/components/dashboard/SystemStats";
import AgentGrid from "@/components/dashboard/AgentGrid";
import ActivityFeed from "@/components/dashboard/ActivityFeed";
import AutoworkPanel from "@/components/dashboard/AutoworkPanel";
import ChatWindow from "@/components/chat/ChatWindow";
import GlobalChatPanel from "@/components/chat/GlobalChatPanel";
import SettingsPanel from "@/components/settings/SettingsPanel";
import MiniOffice from "@/components/office/MiniOffice";
import TokenTracker from "@/components/TokenTracker";
import PerformanceMetrics from "@/components/PerformanceMetrics";
import AgentMeeting from "@/components/meeting/AgentMeeting";
import AchievementList from "@/components/achievements/AchievementList";
import Leaderboard from "@/components/achievements/Leaderboard";
import MetricsDashboard from "@/components/metrics/MetricsDashboard";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import { useAgents } from "@/hooks/useAgents";
import { useMetrics, useTokenTracking } from "@/hooks/useMetrics";
import { initialAchievementState, checkAchievements, getUnlockedAchievements } from "@/lib/achievements";
import { calculateLevel, calculateProgress, calculateTokenXP } from "@/lib/xp";
import type { AutoworkConfig, AutoworkPolicy, DashboardConfig } from "@/lib/types";
import { clearConfig, loadConfig, saveConfig } from "@/lib/config";

const DEFAULT_AUTOWORK: AutoworkConfig = {
  maxSendsPerTick: 0, // Disabled by default
  defaultDirective:
    "Check your memory and recent context, then continue the highest-impact task for your role. Do real work now and move the task forward.",
  policies: {},
};

type DashboardTab = 'overview' | 'achievements' | 'leaderboard' | 'metrics';

export default function DashboardPage() {
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [chatAgent, setChatAgent] = useState<string | null>(null);
  const [config, setConfig] = useState<DashboardConfig>(() => loadConfig());
  const [autoworkConfig, setAutoworkConfig] = useState<AutoworkConfig>(DEFAULT_AUTOWORK);
  const [autoworkLoading, setAutoworkLoading] = useState(true);
  const [autoworkSaving, setAutoworkSaving] = useState(false);
  const [autoworkRunning, setAutoworkRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  const {
    agents,
    agentStates,
    activityFeed,
    systemStats,
    demoMode,
    connected,
    chatMessages,
    globalChatMessages,
    sendChat,
    sendGlobalChat,
    restartSession,
    loadChatHistory,
  } = useAgents(config.demoMode);

  const displayAgents = useMemo(() => {
    const overrideMap = new Map(config.agents.map((agent) => [agent.id, agent]));
    return agents.map((agent) => {
      const override = overrideMap.get(agent.id);
      return override ? { ...agent, ...override } : agent;
    });
  }, [agents, config.agents]);

  const openAgent = chatAgent ? displayAgents.find((agent) => agent.id === chatAgent) : null;
  const ownerConfig = config.owner;
  const theme = config.theme;
  const tokenTotals = useTokenTracking(agentStates);
  const primaryModel = displayAgents.find((agent) => agentStates[agent.id])?.model || 'unknown';
  const metrics = useMetrics({
    agentStates,
    agentConfigs: displayAgents.map((agent) => ({ id: agent.id, name: agent.name, emoji: agent.emoji, model: agent.model })),
    activityFeed,
    enabled: true,
    refreshInterval: 30000,
  });

  const derivedTaskCompleted = useMemo(() => {
    const feedCompleted = activityFeed.filter((event) => event.type === 'task_complete' || event.type === 'message').length;
    return Math.max(systemStats.completedTasks || 0, metrics.taskMetrics.completed || 0, feedCompleted);
  }, [activityFeed, metrics.taskMetrics.completed, systemStats.completedTasks]);

  const derivedMeetings = useMemo(
    () => activityFeed.filter((event) => event.message.toLowerCase().includes('meeting')).length,
    [activityFeed],
  );

  const derivedMessages = useMemo(() => {
    const threadMessages = Object.values(chatMessages).reduce((sum, msgs) => sum + msgs.length, 0);
    return globalChatMessages.length + threadMessages;
  }, [chatMessages, globalChatMessages.length]);

  const achievementState = useMemo(() => checkAchievements(initialAchievementState, {
    tokens_sent: tokenTotals.totalTokens || 0,
    tasks_completed: derivedTaskCompleted,
    meetings_attended: derivedMeetings,
    messages_sent: derivedMessages,
    days_active: 1,
  }), [tokenTotals.totalTokens, derivedTaskCompleted, derivedMeetings, derivedMessages]);

  const unlockedAchievements = useMemo(() => getUnlockedAchievements(achievementState.achievements), [achievementState.achievements]);
  const derivedXP = useMemo(() => achievementState.totalXP + calculateTokenXP(tokenTotals.totalTokens || 0), [achievementState.totalXP, tokenTotals.totalTokens]);
  const derivedLevel = useMemo(() => calculateLevel(derivedXP), [derivedXP]);
  const currentLevelBase = useMemo(() => {
    let spent = 0;
    for (let level = 1; level < derivedLevel; level += 1) {
      spent += Math.floor(100 * Math.pow(1.5, level - 1));
    }
    return spent;
  }, [derivedLevel]);
  const derivedProgress = useMemo(() => calculateProgress(derivedXP - currentLevelBase, derivedLevel), [derivedXP, currentLevelBase, derivedLevel]);

  const productivityScore = useMemo(() => {
    if (metrics.agentProductivities.length === 0) return connected ? 100 : 0;
    const avg = metrics.agentProductivities.reduce((sum, entry) => sum + entry.productivityScore, 0) / metrics.agentProductivities.length;
    return Math.max(0, Math.min(100, Math.round(avg)));
  }, [metrics.agentProductivities, connected]);

  useEffect(() => {
    saveConfig(config);
  }, [config]);


  const loadAutowork = useCallback(async () => {
    try {
      setAutoworkLoading(true);
      const response = await fetch("/api/gateway/autowork");
      const data = await response.json();
      if (data.ok && data.config) {
        setAutoworkConfig(data.config);
      }
    } catch {
    } finally {
      setAutoworkLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAutowork();
  }, [loadAutowork, connected]);

  const saveAutoworkConfig = useCallback(async (patch: Partial<AutoworkConfig>) => {
    try {
      setAutoworkSaving(true);
      const response = await fetch("/api/gateway/autowork", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await response.json();
      if (data.ok && data.config) {
        setAutoworkConfig(data.config);
      }
    } finally {
      setAutoworkSaving(false);
    }
  }, []);

  const runAutoworkNow = useCallback(async (sessionKey?: string) => {
    try {
      setAutoworkRunning(true);
      await fetch("/api/gateway/autowork", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionKey ? { sessionKey } : {}),
      });
      await loadAutowork();
    } finally {
      setAutoworkRunning(false);
    }
  }, [loadAutowork]);

  const renderTab = () => {
    switch (activeTab) {
      case 'achievements':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                <div className="text-xs text-[var(--text-secondary)]">Unlocked</div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{achievementState.unlockedCount}/{achievementState.achievements.length}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                <div className="text-xs text-[var(--text-secondary)]">Achievement XP</div>
                <div className="text-2xl font-bold text-[var(--accent-primary)]">{achievementState.totalXP.toLocaleString()}</div>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                <div className="text-xs text-[var(--text-secondary)]">Level Progress</div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{derivedLevel} · {derivedProgress.toFixed(0)}%</div>
              </div>
            </div>
            <AchievementList achievements={achievementState.achievements} filter="all" />
          </div>
        );
      case 'leaderboard':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Leaderboard
              entries={[...displayAgents]
                .map((a, i) => ({
                  rank: i + 1,
                  agentId: a.id,
                  agentName: a.name || a.id,
                  agentEmoji: a.emoji || '🤖',
                  value: agentStates[a.id]?.totalTokens || 0,
                }))
                .sort((a, b) => b.value - a.value)
                .map((entry, index) => ({ ...entry, rank: index + 1 }))}
              title="Top Agents by Tokens"
              icon="📊"
            />
            <Leaderboard
              entries={[...displayAgents]
                .map((a, i) => ({
                  rank: i + 1,
                  agentId: a.id,
                  agentName: a.name || a.id,
                  agentEmoji: a.emoji || '🤖',
                  value: agentStates[a.id]?.totalTasks || 0,
                }))
                .sort((a, b) => b.value - a.value)
                .map((entry, index) => ({ ...entry, rank: index + 1 }))}
              title="Top Agents by Tasks"
              icon="✅"
            />
          </div>
        );
      case 'metrics':
        return (
          <MetricsDashboard
            data={{
              tokensSent: tokenTotals.totalTokens || 0,
              tasksCompleted: derivedTaskCompleted,
              meetingsAttended: derivedMeetings,
              messagesSent: derivedMessages,
              avgResponseTime: metrics.responseMetrics.avg || 0,
              productivityScore,
            }}
            period="weekly"
          />
        );
      default:
        return (
          <>
            {/* OFFICE VIEW - PROMINENT TOP POSITION */}
            <div className="mb-6">
              <MiniOffice agents={displayAgents} agentStates={agentStates} ownerConfig={ownerConfig} theme={theme} />
            </div>

            {/* AGENT GRID & SIDEBAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 mb-4 sm:mb-6">
              <div className="xl:col-span-2">
                <AgentGrid
                  agents={displayAgents}
                  agentStates={agentStates}
                  onChatClick={(id) => setChatAgent(id)}
                  onRestart={restartSession}
                  onUpdateAgent={(id, patch) => {
                    setConfig((prev) => {
                      const exists = prev.agents.some((agent) => agent.id === id);
                      return {
                        ...prev,
                        agents: exists
                          ? prev.agents.map((agent) => (agent.id === id ? { ...agent, ...patch } : agent))
                          : [...prev.agents, {
                              id,
                              name: patch.name ?? displayAgents.find((agent) => agent.id === id)?.name ?? id,
                              emoji: patch.emoji ?? displayAgents.find((agent) => agent.id === id)?.emoji ?? '🤖',
                              color: patch.color ?? displayAgents.find((agent) => agent.id === id)?.color ?? '#4FC3F7',
                              avatar: patch.avatar ?? displayAgents.find((agent) => agent.id === id)?.avatar ?? 'glasses',
                            }],
                      };
                    });
                  }}
                />
              </div>
              <div className="space-y-6">
                <TokenTracker
                  totalTokens={tokenTotals.totalTokens || 0}
                  inputTokens={tokenTotals.inputTokens || 0}
                  outputTokens={tokenTotals.outputTokens || 0}
                  model={primaryModel}
                />
                <PerformanceMetrics
                  tasksCompleted={derivedTaskCompleted}
                  avgResponseTime={metrics.responseMetrics.avg || 0}
                  successRate={metrics.taskMetrics.total > 0 ? (100 - metrics.taskMetrics.failureRate) : 100}
                  xp={derivedXP}
                  level={derivedLevel}
                  achievements={unlockedAchievements.map((achievement) => achievement.name)}
                />
                <AgentMeeting agents={displayAgents} />
              </div>
            </div>

            {/* BOTTOM SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
              <div className="xl:col-span-2 space-y-6">
                <ActivityFeed events={activityFeed} />
              </div>
              <div className="space-y-6">
                <AutoworkPanel agents={displayAgents} config={autoworkConfig} loading={autoworkLoading} saving={autoworkSaving} running={autoworkRunning} onSaveConfig={saveAutoworkConfig} onSavePolicy={async () => {}} onRunNow={runAutoworkNow} />
                <SystemStats stats={systemStats} />
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]" data-theme={theme}>
      <Navbar connected={connected} demoMode={demoMode} onSettingsClick={() => setShowSettings(true)} />

      <main className="mx-auto max-w-7xl px-4 pb-8 pt-24">
        {/* TAB NAVIGATION */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('overview')} className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${activeTab === 'overview' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-white/10'}`}>📊 Overview</button>
          <button onClick={() => setActiveTab('achievements')} className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${activeTab === 'achievements' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-white/10'}`}>🏆 Achievements ({achievementState.unlockedCount}/{achievementState.achievements.length})</button>
          <button onClick={() => setActiveTab('leaderboard')} className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${activeTab === 'leaderboard' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-white/10'}`}>🏅 Leaderboard</button>
          <button onClick={() => setActiveTab('metrics')} className={`px-4 py-2 rounded-lg font-mono text-sm transition-all ${activeTab === 'metrics' ? 'bg-[var(--accent-primary)] text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-white/10'}`}>📈 Metrics</button>
        </div>

        {/* TAB CONTENT */}
        {renderTab()}
      </main>

      {openAgent && <ChatWindow agentId={openAgent.id} agentName={openAgent.name} agentEmoji={openAgent.emoji} agentColor={openAgent.color} messages={chatMessages[openAgent.id] || []} onSend={sendChat} onClose={() => setChatAgent(null)} />}
      <GlobalChatPanel messages={globalChatMessages} connected={connected} demoMode={demoMode} totalAgents={displayAgents.length} onSend={sendGlobalChat} />
      {showSettings && <SettingsPanel config={config} connected={connected} sessionCount={1} onUpdate={setConfig} onReset={() => {}} onClose={() => setShowSettings(false)} />}
      {showShortcuts && <KeyboardShortcuts isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />}
    </div>
  );
}
