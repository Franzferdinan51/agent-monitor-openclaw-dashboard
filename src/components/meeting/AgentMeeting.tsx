"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  agentId: string;
  agentName: string;
  agentEmoji: string;
  content: string;
  timestamp: number;
  isSubAgent: boolean;
}

interface AgentMeetingProps {
  agents?: any[];
}

export default function AgentMeeting({ agents = [] }: AgentMeetingProps) {
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startMeeting = () => {
    setIsMeetingActive(true);
    setMessages([{
      id: 'system-1',
      agentId: 'system',
      agentName: 'System',
      agentEmoji: '🤖',
      content: 'Meeting started! All agents can now collaborate.',
      timestamp: Date.now(),
      isSubAgent: false,
    }]);
  };

  const endMeeting = () => {
    setIsMeetingActive(false);
    setMessages([]);
  };

  const sendMessage = () => {
    if (!inputMessage.trim() || !isMeetingActive) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      agentId: 'user',
      agentName: 'You',
      agentEmoji: '👤',
      content: inputMessage.trim(),
      timestamp: Date.now(),
      isSubAgent: false,
    };
    
    setMessages([...messages, newMessage]);
    setInputMessage('');
    
    // Simulate agent responses
    setTimeout(() => {
      const randomAgent = agents[Math.floor(Math.random() * agents.length)];
      if (randomAgent) {
        const responses = [
          'I can help with that!',
          'Working on it now...',
          'Great idea! Let me contribute.',
          'I have some insights on this.',
          'Agreed! Let\'s move forward.',
        ];
        const agentMessage: Message = {
          id: `agent-${Date.now()}`,
          agentId: randomAgent.id,
          agentName: randomAgent.name || 'Agent',
          agentEmoji: randomAgent.emoji || '🤖',
          content: responses[Math.floor(Math.random() * responses.length)],
          timestamp: Date.now(),
          isSubAgent: randomAgent.isSubagent || false,
        };
        setMessages(prev => [...prev, agentMessage]);
      }
    }, 1500);
  };

  if (!isMeetingActive) {
    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-pixel text-lg" style={{ color: 'var(--text-primary)' }}>
            💬 Agent Meeting Room
          </h2>
          <button
            onClick={startMeeting}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 font-mono text-sm"
          >
            Start Meeting
          </button>
        </div>
        <p className="text-[var(--text-secondary)] text-sm mb-4">
          Bring all your agents together for collaborative discussions, brainstorming, and decision-making.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span>🧠</span> Brainstorming
          </div>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span>🤝</span> Collaboration
          </div>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span>📋</span> Planning
          </div>
          <div className="flex items-center gap-1 text-[var(--text-secondary)]">
            <span>✅</span> Decision Making
          </div>
        </div>
        {agents.length > 0 && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <p className="text-xs text-[var(--text-secondary)] mb-2">
              Available Agents ({agents.length}):
            </p>
            <div className="flex flex-wrap gap-1">
              {agents.slice(0, 8).map(agent => (
                <span key={agent.id} className="text-xs px-2 py-1 bg-[var(--bg-secondary)] rounded">
                  {agent.emoji || '🤖'} {agent.name || agent.id}
                </span>
              ))}
              {agents.length > 8 && (
                <span className="text-xs px-2 py-1 bg-[var(--bg-secondary)] rounded">
                  +{agents.length - 8} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-pixel text-lg" style={{ color: 'var(--text-primary)' }}>
          💬 Agent Meeting
        </h2>
        <button
          onClick={endMeeting}
          className="px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-secondary)] rounded-lg hover:bg-white/10 text-sm"
        >
          End Meeting
        </button>
      </div>

      {/* Messages */}
      <div className="mb-4 bg-[var(--bg-secondary)] rounded-lg border border-[var(--border)] p-4 h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="text-center text-[var(--text-secondary)] text-sm py-8">
            Meeting started. Send a message to begin!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex items-start gap-2 ${msg.agentId === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <span className="text-lg">{msg.agentEmoji}</span>
                <div className={`flex-1 ${msg.agentId === 'user' ? 'text-right' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[var(--text-primary)]">
                      {msg.agentName}
                    </span>
                    {msg.isSubAgent && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[var(--accent-primary)] text-white rounded">
                        Sub-Agent
                      </span>
                    )}
                    <span className="text-[10px] text-[var(--text-secondary)]">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] bg-[var(--bg-card)] px-3 py-2 rounded-lg inline-block">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 font-mono text-sm"
        >
          Send
        </button>
      </div>

      {/* Participants */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-secondary)] mb-2">
          Participants ({agents.length + 1}):
        </p>
        <div className="flex flex-wrap gap-1">
          <span className="text-xs px-2 py-1 bg-[var(--bg-card)] rounded">
            👤 You
          </span>
          {agents.slice(0, 6).map(agent => (
            <span key={agent.id} className="text-xs px-2 py-1 bg-[var(--bg-card)] rounded">
              {agent.emoji || '🤖'} {agent.name || agent.id}
            </span>
          ))}
          {agents.length > 6 && (
            <span className="text-xs px-2 py-1 bg-[var(--bg-card)] rounded">
              +{agents.length - 6} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
