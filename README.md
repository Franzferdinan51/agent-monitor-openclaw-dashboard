# 🏢 AgentMonitor

Real-time AI agent visualization and monitoring dashboard for [OpenClaw](https://github.com/openclaw/openclaw).

Watch your AI agents work in a pixel-art office, monitor their status, chat with them, and customize everything.

## ✨ Features

### 🖥️ Dashboard
- **Agent Cards** — Real-time status, token usage, current task for each agent
- **System Stats** — Total agents, active count, token usage, uptime
- **Activity Feed** — Live event stream across all agents
- **Mini Office** — Preview of the pixel office on the dashboard

### 🏢 Office View
- **Pixel Art Office** — Isometric office with furniture, zones, and decorations
- **Agent Behaviors** — Agents walk between zones based on their real status
  - `coding` → desk (typing), `thinking` → whiteboard, `meeting` → meeting room
  - `sleeping` → lounge (zzZ), `coffee` → break room, `toilet` → bathroom
  - `dead` → collapsed (crash), `panicking` → running around (error)
  - `overloaded` → smoking head (context full), `reviving` → sparkle (restart)
- **Day/Night Cycle** — Ambient lighting changes
- **Particles & Bubbles** — Visual effects for different states

### 💬 Chat
- Click any agent to open a chat window
- Send messages directly to agents (via OpenClaw Gateway)
- Demo mode simulates responses

### 🎨 Customization
- **4 Themes** — Midnight (default), Void (dark), Warm (cozy), Neon (cyberpunk)
- **Agent Avatars** — glasses, hoodie, suit, casual, robot, cat, dog
- **Agent Colors** — 6 preset colors per agent
- **Settings Panel** — Gateway config, agent management, theme selection

### ⚙️ Architecture
- **Config-driven** — Everything stored in localStorage, supports URL params
- **Demo Mode** — Works without OpenClaw Gateway connection
- **Gateway Polling** — HTTP polling for agent status (WebSocket planned)
- **Cross-platform** — Pure web tech, no native dependencies

## 🚀 Quick Start

```bash
# Clone and install
cd agent-monitor
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🔌 OpenClaw Integration

Connect to your OpenClaw Gateway:

1. Open Settings (⚙️)
2. Enter Gateway URL (default: `http://localhost:18789`)
3. Enter Auth Token (if configured)
4. Toggle off Demo Mode

Or use URL params:
```
http://localhost:3000?gateway=http://localhost:18789&token=YOUR_TOKEN
```

## 🗺️ Roadmap

- [ ] **Phase 2** — WebSocket real-time updates (replace HTTP polling)
- [ ] **Phase 3** — Cloudflare Tunnel for external access
- [ ] **Phase 4** — OpenClaw Plugin (`openclaw plugins install @openclaw/agent-monitor`)
- [ ] **Phase 5** — npm package (`npx agent-monitor`)

## 🛠️ Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **HTML5 Canvas** — Pixel art rendering engine
- **Tailwind CSS** — Styling with CSS variable theming
- **OpenClaw Gateway** — Agent status via HTTP/WebSocket

## 📁 Project Structure

```
src/
├── app/                    # Pages (dashboard, office, agent detail)
├── components/
│   ├── dashboard/          # AgentCard, AgentGrid, ActivityFeed, SystemStats, Navbar
│   ├── office/             # OfficeCanvas, MiniOffice, OfficeControls
│   ├── agent/              # AgentDetail, TokenUsage, SessionLog, TaskList
│   ├── chat/               # ChatWindow
│   ├── settings/           # SettingsPanel (Gateway, Agents, Theme)
│   └── shared/             # StatusBadge, ConnectionStatus
├── engine/                 # Isometric rendering, pathfinding, animation
├── sprites/                # Character, furniture, decoration, effect renderers
├── office/                 # Layout, zones, behavior mapping
├── hooks/                  # useGateway, useAgents, useOffice
└── lib/                    # Types, config, gateway client, state mapper
```

## 📄 License

MIT
