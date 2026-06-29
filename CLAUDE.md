# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Autoniv is a multi-tenant SaaS platform for managing AI voice agents (powered by Vapi) and chatbots. The system supports both voice and chat plans with distinct feature sets:
- **Voice plans**: AI voice agents with call handling, transcripts, recordings
- **Chat plans**: AI chatbots with conversations, WhatsApp integration, multi-channel support

The architecture is role-based with admin and user dashboards, designed with an enterprise SaaS aesthetic (dark theme, Indigo/Violet primary colors).

## Architecture

### Stack
- **Backend**: Node.js/Express with MongoDB (Mongoose ODM)
- **Frontend**: React 19 + TypeScript, Vite, TailwindCSS, Redux Toolkit, React Router v7
- **External Services**: Vapi (voice agents), OpenAI, ElevenLabs, Groq

### Directory Structure
```
backend/
├── db/
│   ├── models/        # Mongoose schemas (User, Agent, Call, Lead, etc.)
│   └── connection.js
├── routes/            # Express route handlers
├── middleware/        # Auth, rate limiting, security, error handling
├── services/          # Business logic (vapi, email, token, logger, etc.)
├── scripts/           # Utility scripts
└── index.js           # App entry point

Client/
├── src/
│   ├── pages/
│   │   ├── public/    # Landing, auth pages
│   │   ├── admin/     # Admin dashboard pages
│   │   └── user/      # User dashboard pages
│   ├── components/    # Reusable UI components
│   ├── store/         # Redux slices
│   ├── services/      # API client
│   ├── hooks/         # Custom React hooks
│   └── utils/         # Helper functions
```

## Development Commands

### Backend
```bash
cd backend

# Development with auto-reload
npm run dev

# Production start
npm start

# Seed database with test data
npm run seed
```

### Frontend
```bash
cd Client

# Development server (default: http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Environment Variables

### Backend (`backend/.env`)
Required:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret for access tokens
- `JWT_REFRESH_SECRET` - JWT signing secret for refresh tokens
- `VAPI_API_KEY` - Vapi API key for voice agents
- `FRONTEND_URL` - Frontend URL for CORS
- `WEBHOOK_URL` - Public webhook endpoint for Vapi callbacks

Optional:
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `ELEVENLABS_API_KEY` - ElevenLabs TTS
- `GROQ_API_KEY` - Groq LLM
- `ADMIN_SECRET` - Admin registration secret

### Frontend (`Client/.env`)
- `VITE_API_URL` - Backend API base URL

## Key Concepts

### Authentication & Authorization
- JWT-based auth with access tokens (cookies) and refresh tokens
- Two roles: `admin` and `user`
- Protected routes check role in `App.tsx` via `<ProtectedRoute>`
- Auth middleware in `backend/middleware/auth.js` validates tokens
- Token refresh handled by `backend/services/tokenService.js`

### Plan System
Plans are defined in `backend/db/models/User.js` with `PLAN_CONFIG`:
- **Chat plans**: `chat_free`, `chat_starter`, `chat_growth`, `chat_enterprise`
- **Voice plans**: `voice_free`, `voice_starter`, `voice_growth`, `voice_enterprise`

Each plan has:
- `limits`: { calls, minutes, chatbots, conversations }
- `features`: boolean flags (whatsapp, removeBranding, crmIntegration, etc.)

Helper functions:
- `isChatPlan(planId)` / `isVoicePlan(planId)` in `Client/src/utils/plan.ts`
- Plan config accessed via `User.getPlanConfig()`

### Data Models (Mongoose Schemas)
Core models in `backend/db/models/`:
- **User**: Multi-tenant users with role, plan, usage limits
- **Agent**: Voice/chat agents linked to users and Vapi
- **Call**: Call records with transcripts, recordings, duration
- **Lead**: Leads captured from calls
- **Appointment**: Scheduled appointments from booking agents
- **ChatSession**: Chat conversation sessions
- **AddOn**: Available add-ons (extra features)
- **UserAddOn**: User's purchased add-ons
- **UpgradeRequest**: User plan upgrade requests

### Vapi Integration
- Vapi service wrapper: `backend/services/vapi.js`
- Proxy endpoint: `backend/services/vapiProxy.js` at `/api/vapi/*`
- Webhook handler: `backend/routes/webhooks.js` at `/api/webhooks/vapi`
- Vapi events: `call.started`, `call.ended`, `end-of-call-report`
- Agents created/updated via Vapi API, calls tracked in MongoDB

### Frontend State Management
Redux Toolkit slices in `Client/src/store/slices/`:
- `authSlice`: User auth, login/logout, session management
- Other domain slices as needed

Session storage caches user and dashboard stats for persistence across page reloads.

### Feature Flags
Features gated by plan:
- **Voice features**: `isVoicePlan(user.plan)` → agents, calls, leads
- **Chat features**: `isChatPlan(user.plan)` → chatbots, conversations
- Frontend uses `<ProtectedRoute feature="chat">` to gate chat pages

### Routing Patterns
- Public: `/`, `/pricing`, `/login`, etc.
- User dashboard: `/dashboard`, `/dashboard/agents`, `/dashboard/calls`, etc.
- Admin dashboard: `/admin`, `/admin/users`, `/admin/agents`, etc.
- Role-based redirects after login (admin → `/admin`, user → `/dashboard`)

## Common Tasks

### Adding a New API Endpoint
1. Create route handler in `backend/routes/<resource>.js`
2. Add authentication middleware if needed: `requireAuth`, `requireAdmin`
3. Import and mount in `backend/index.js`: `app.use('/api/<resource>', <resource>Routes)`
4. Add corresponding API service method in `Client/src/services/api.ts`

### Adding a New Page
1. Create component in `Client/src/pages/<role>/<PageName>.tsx`
2. Export from `Client/src/pages/<role>/index.ts`
3. Add lazy import in `Client/src/App.tsx`
4. Add route in `AppRoutes` with `<ProtectedRoute>` wrapper

### Updating Plan Limits/Features
Modify `PLAN_CONFIG` in `backend/db/models/User.js`. Changes apply immediately to plan validation logic.

### Database Seeding
Run `npm run seed` in `backend/` to populate test data (admin user, sample users, agents, calls).

## Security & Middleware

Backend security stack (`backend/middleware/security.js`):
- **Helmet**: Security headers
- **CORS**: Cross-origin configuration
- **Rate limiting**: Global and per-route limiters
- **Mongo sanitization**: Prevent NoSQL injection
- **HPP**: HTTP Parameter Pollution protection

Request flow:
1. Request ID injection
2. Security headers (Helmet)
3. CORS
4. Body parsing (JSON/urlencoded)
5. Cookie parsing
6. Mongo sanitization + HPP
7. Rate limiting
8. Request logging
9. Route handlers
10. Error handler

## Testing Notes

- Backend uses MongoDB for persistence; tests should use a separate test database
- Frontend uses Vite's built-in testing setup
- No explicit test commands configured; add as needed

## Design System

Colors (from README):
- Primary: `#6366f1` (Indigo)
- Secondary: `#8b5cf6` (Violet)
- Accent: `#22c55e` (Green)
- Background: `#0f172a` (Slate 900)
- Typography: Inter (headings/body), JetBrains Mono (monospace)

Use TailwindCSS utilities matching these colors (e.g., `bg-indigo-600`, `text-violet-500`).
