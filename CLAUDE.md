# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Among Legends is a multiplayer social deduction game built with a TypeScript full-stack architecture. Players are assigned secret roles and must debate to identify the impostor while completing their role-specific objectives. The game features a lobby system, real-time chat, timed debate/voting phases, and a points-based scoring system.

## Tech Stack

- **Monorepo**: npm workspaces with `client/` and `server/` packages
- **Client**: React 18 + TypeScript, Vite, React Router v6, TailwindCSS, Socket.io-client, Axios
- **Server**: Node.js + Express, TypeScript, Socket.io, better-sqlite3, JWT authentication, bcryptjs

## Development Commands

```bash
# Install dependencies (run from root)
npm install

# Development - Run both client and server concurrently
npm run dev

# Development - Run individually
npm run dev:server  # Server only (tsx watch on port 3001)
npm run dev:client  # Client only (Vite dev server on port 5173)

# Build
npm run build       # Builds both client and server
npm run build -w client   # Client only (tsc + vite build)
npm run build -w server   # Server only (tsc)

# Production
npm run start -w server   # Start production server
```

## Environment Setup

Server requires `.env` file in root (see `.env.example`):
- `PORT`: Server port (default 3001)
- `JWT_SECRET`: Secret for JWT token signing
- `NODE_ENV`: development/production

Client requires `.env` in `client/` directory:
- `VITE_API_URL`: Backend API URL (http://localhost:3001)
- `VITE_WS_URL`: WebSocket URL (http://localhost:3001)

## Architecture Overview

### Database Layer
- SQLite database managed by better-sqlite3
- Schema initialized from [server/src/models/schema.sql](server/src/models/schema.sql)
- Database file stored at `server/data/among-legends.db`
- Foreign keys enabled via pragma
- Main tables: `users`, `games`, `game_players`, `votes`, `messages`

### Server Architecture

The server follows a layered architecture:

1. **Entry Point** ([server/src/index.ts](server/src/index.ts:1)): Creates HTTP server, initializes database, sets up Socket.io with CORS for localhost:5173 and localhost:3000
2. **Express App** ([server/src/app.ts](server/src/app.ts:1)): Defines REST API routes under `/api` prefix
3. **Socket.io Handler** ([server/src/socket/index.ts](server/src/socket/index.ts:1)): Real-time game events and chat

**Service Layer** (business logic):
- [authService](server/src/services/authService.ts:1): User registration, login, bcrypt password hashing, JWT generation
- [gameService](server/src/services/gameService.ts:1): Game lifecycle (create, join, leave, start, voting, end game), message/chat handling
- [roleService](server/src/services/roleService.ts:1): Role assignment (Fisher-Yates shuffle), points calculation based on voting outcomes

**Key Constants** ([server/src/utils/constants.ts](server/src/utils/constants.ts:1)):
- 5 roles: `imposteur`, `droide`, `serpentin`, `double_face`, `super_heros` with unique objectives and point values
- Game config: 5-10 players, 5min debate, 1min vote, 6-char game codes

### Client Architecture

React app with context-based state management:

1. **Routing** ([client/src/App.tsx](client/src/App.tsx:1)): React Router with protected/public route wrappers
   - Public: `/login`, `/register`
   - Protected: `/` (home), `/lobby/:code`, `/game/:code`

2. **Context Providers**:
   - [AuthContext](client/src/context/AuthContext.tsx:1): JWT auth state, login/register/logout, localStorage persistence
   - [SocketContext](client/src/context/SocketContext.tsx:1): Socket.io connection management, auto-connects with JWT token from auth context

3. **Page Components**:
   - Login/Register: Authentication forms
   - Home: Create/join game lobby
   - Lobby: Pre-game room with player list, ready status, chat
   - Game: Main game screen with role card, timer, chat, voting panel

4. **Custom Hooks**:
   - [useGame](client/src/hooks/useGame.ts:1): Game state management and socket event handlers

### Game Flow

1. **Lobby Phase**: Host creates game → generates 6-char code → players join → toggle ready → host starts when all ready (min 5 players)
2. **Debate Phase**: Roles assigned via [roleService.assignRoles](server/src/services/roleService.ts:16) (guarantees 1 impostor) → 5min timer → players debate in chat
3. **Vote Phase**: Phase changes to voting → 1min timer → each player votes once → ends when all voted or timer expires
4. **Results**: Points calculated via [roleService.calculatePoints](server/src/services/roleService.ts:42) → impostor wins if not majority-voted → others win if they voted for impostor and impostor caught → results broadcasted via `game:ended` event

### Real-time Communication

Socket.io events (see [server/src/types/index.ts](server/src/types/index.ts:77-99)):
- **Lobby**: `lobby:join`, `lobby:leave`, `lobby:ready`, `lobby:updated`, `lobby:player-joined`, `lobby:player-left`, `lobby:player-ready`
- **Chat**: `chat:message`, `chat:new-message`
- **Game**: `game:start`, `game:started`, `game:phase-change`, `game:ended`
- **Voting**: `vote:cast`, `vote:received`

Authentication middleware in [server/src/socket/index.ts](server/src/socket/index.ts:17-38) verifies JWT tokens on socket connection.

### Points System

Points awarded based on role completion:
- **Impostor**: 100 points if not caught (majority vote), 0 if caught
- **Other roles**: 75 points if voted for impostor AND impostor caught, 37 points if voted for impostor but impostor not caught, 10 participation points otherwise
- User stats (games_played, total_points) updated in database on game end

## Key Implementation Patterns

- **Socket Authentication**: JWT passed in `socket.handshake.auth.token`, verified before connection
- **Phase Management**: Server-side timers (setTimeout) auto-advance game phases, emit `game:phase-change` events
- **Room Management**: Socket.io rooms use game codes, `socket.join(gameCode)` for lobby/game isolation
- **Type Safety**: Shared type definitions between server types and client types (manually kept in sync)
- **ESM Modules**: Both client and server use `"type": "module"` in package.json, `.js` extensions in imports
