"use client";

import React, { useState } from 'react';
import type { AgentConfig } from '@/lib/types';

interface CouncilChamberProps {
  agents: AgentConfig[];
  activeAgents: string[];
}

interface CouncilMotion {
  id: string;
  title: string;
  proposer: string;
  description: string;
  votes: Record<string, 'for' | 'against' | 'abstain'>;
  status: 'proposed' | 'debating' | 'voting' | 'passed' | 'rejected';
}

export default function CouncilChamber({ agents, activeAgents }: CouncilChamberProps) {
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const [motions, setMotions] = useState<CouncilMotion[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);

  const startCouncilSession = () => {
    setIsSessionOpen(true);
    // Initialize council with active agents
    setSelectedAgents(activeAgents);
  };

  const proposeMotion = (title: string, description: string) => {
    const newMotion: CouncilMotion = {
      id: `motion-${Date.now()}`,
      title,
      proposer: 'DuckBot',
      description,
      votes: {},
      status: 'proposed',
    };
    setMotions([...motions, newMotion]);
  };

  const voteOnMotion = (motionId: string, agentId: string, vote: 'for' | 'against' | 'abstain') => {
    setMotions(motions.map(m => {
      if (m.id === motionId) {
        return { ...m, votes: { ...m.votes, [agentId]: vote } };
      }
      return m;
    }));
  };

  if (!isSessionOpen) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-lg" style={{ color: 'var(--text-primary)' }}>
            🏛️ AI Council Chamber
          </h2>
          <button
            onClick={startCouncilSession}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 font-mono text-sm"
          >
            Start Council Session
          </button>
        </div>
        <p className="text-[var(--text-secondary)] text-sm">
          The Council Chamber allows your agents to deliberate on important decisions together.
          Start a session to enable multi-agent consensus building.
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span>⚖️</span> Legislative Debates
          </div>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span>🔍</span> Deep Research
          </div>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span>🐝</span> Swarm Coding
          </div>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span>🔮</span> Prediction Markets
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-lg" style={{ color: 'var(--text-primary)' }}>
          🏛️ Council Session in Progress
        </h2>
        <button
          onClick={() => setIsSessionOpen(false)}
          className="px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg hover:bg-white/10 text-sm"
        >
          End Session
        </button>
      </div>

      {/* Council Members */}
      <div className="mb-6">
        <h3 className="text-sm font-mono text-[var(--text-secondary)] mb-3">
          Council Members ({selectedAgents.length})
        </h3>
        <div className="flex flex-wrap gap-2">
          {selectedAgents.map(agentId => {
            const agent = agents.find(a => a.id === agentId);
            return (
              <div
                key={agentId}
                className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]"
              >
                <span className="text-lg">{agent?.emoji || '🤖'}</span>
                <span className="text-xs font-mono text-[var(--text-primary)]">
                  {agent?.name || agentId}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Motions */}
      <div>
        <h3 className="text-sm font-mono text-[var(--text-secondary)] mb-3">
          Active Motions ({motions.length})
        </h3>
        {motions.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
            No active motions. Propose a motion to begin deliberation.
          </div>
        ) : (
          <div className="space-y-3">
            {motions.map(motion => (
              <div
                key={motion.id}
                className="p-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-[var(--text-primary)]">{motion.title}</h4>
                  <span className="text-xs px-2 py-1 rounded bg-[var(--accent-primary)] text-white">
                    {motion.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-3">{motion.description}</p>
                <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                  <span>👍 {Object.values(motion.votes).filter(v => v === 'for').length}</span>
                  <span>👎 {Object.values(motion.votes).filter(v => v === 'against').length}</span>
                  <span>🤷 {Object.values(motion.votes).filter(v => v === 'abstain').length}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Propose Motion Button */}
      <button
        onClick={() => proposeMotion('New Motion', 'Describe the motion here...')}
        className="mt-4 w-full px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 font-mono text-sm"
      >
        + Propose Motion
      </button>
    </div>
  );
}
