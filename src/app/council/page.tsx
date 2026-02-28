"use client";

import React, { useState, useEffect } from 'react';

export default function CouncilChamber() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Council app is running
    const checkCouncil = async () => {
      try {
        const response = await fetch('http://localhost:5174');
        if (!response.ok) throw new Error('Council app not running');
      } catch (e) {
        setError('AI Council app is not running. Start it with: cd ~/AI-Bot-Council-Concensus && npm run dev');
      }
    };
    checkCouncil();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 max-w-md">
          <h2 className="font-pixel text-xl mb-4" style={{ color: 'var(--text-primary)' }}>
            🏛️ Council Chamber
          </h2>
          <p className="text-[var(--text-secondary)] mb-4">{error}</p>
          <button
            onClick={() => window.open('http://localhost:5174', '_blank')}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90"
          >
            Open Council in New Tab
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-pixel text-2xl" style={{ color: 'var(--text-primary)' }}>
            🏛️ AI Council Chamber
          </h1>
          <button
            onClick={() => window.open('http://localhost:5174', '_blank')}
            className="px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:opacity-90 text-sm"
          >
            Open Full Screen ↗
          </button>
        </div>
        
        {!iframeLoaded && (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)]"></div>
            <p className="ml-4 text-[var(--text-secondary)]">Loading Council Chamber...</p>
          </div>
        )}
        
        <iframe
          src="http://localhost:5174"
          className={`w-full h-[calc(100vh-200px)] rounded-xl border border-[var(--border)] shadow-2xl ${iframeLoaded ? 'block' : 'hidden'}`}
          onLoad={() => setIframeLoaded(true)}
          title="AI Council Chamber"
          allow="microphone; speakers"
        />
        
        <div className="mt-4 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl">
          <h3 className="font-pixel text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
            📋 Council Modes
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1">
              <span>⚖️</span> Legislative
            </div>
            <div className="flex items-center gap-1">
              <span>🔍</span> Deep Research
            </div>
            <div className="flex items-center gap-1">
              <span>🐝</span> Swarm Coding
            </div>
            <div className="flex items-center gap-1">
              <span>🔮</span> Prediction Market
            </div>
            <div className="flex items-center gap-1">
              <span>🗣️</span> Inquiry
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
