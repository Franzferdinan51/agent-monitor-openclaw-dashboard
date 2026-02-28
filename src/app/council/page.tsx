"use client";

import { useState } from "react";

export default function CouncilPage() {
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-pixel text-2xl mb-4" style={{ color: 'var(--text-primary)' }}>
          🏛️ AI Council Chamber
        </h1>
        
        {!iframeLoaded && (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)]"></div>
          </div>
        )}
        
        <iframe
          src="http://localhost:3000"
          className={`w-full h-[calc(100vh-200px)] rounded-xl border border-[var(--border)] ${iframeLoaded ? 'block' : 'hidden'}`}
          onLoad={() => setIframeLoaded(true)}
          title="AI Council Chamber"
        />
      </div>
    </div>
  );
}
