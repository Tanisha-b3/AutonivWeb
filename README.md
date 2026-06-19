# Autoniv - AI Voice Agent Platform

## Concept & Vision

A professional multi-tenant SaaS platform for managing AI voice agents powered by Vapi. The system enables businesses to deploy intelligent voice assistants while administrators maintain full platform control. The experience should feel like a premium enterprise SaaS tool—clean, powerful, and trustworthy.

## Design Language

### Aesthetic Direction
Enterprise SaaS with a modern fintech feel. Dark sidebar navigation, clean card-based layouts, subtle gradients, and professional typography. Think Linear meets Vercel dashboard.

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Violet)
- **Accent**: `#22c55e` (Green for success/online)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)
- **Background**: `#0f172a` (Slate 900)
- **Surface**: `#1e293b` (Slate 800)
- **Surface Light**: `#334155` (Slate 700)
- **Text Primary**: `#f8fafc` (Slate 50)
- **Text Secondary**: `#94a3b8` (Slate 400)
- **Border**: `#475569` (Slate 600)

### Typography
- **Headings**: Inter (bold, semi-bold)
- **Body**: Inter (regular, medium)
- **Monospace**: JetBrains Mono (for IDs, timestamps)

### Spatial System
- Base unit: 4px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 8px (cards), 6px (buttons), 4px (inputs)

### Motion Philosophy
- Smooth transitions: 200ms ease-out
- Card hover: subtle lift with shadow
- Page transitions: fade-in 300ms
- Loading states: skeleton pulse animation
- Data updates: subtle highlight flash
## Data Models

### User
```javascript
{
  id: string (uuid),
  email: string,
  password: string (hashed),
  name: string,
  phoneNumber: string,
  role: 'admin' | 'user',
  plan: string,
  minutesUsed: number,
  minutesLimit: number,
  isActive: boolean,
  company: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Agent
```javascript
{
  id: string (uuid),
  userId: string (fk),
  vapiId: string,
  phoneNumberId: string,
  name: string,
  type: 'receptionist' | 'appointment' | 'faq',
  prompt: text,
  voiceId: string,
  isActive: boolean,
  callCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Call
```javascript
{
  id: string (uuid),
  agentId: string (fk),
  vapiCallId: string,
  callerNumber: string,
  duration: number,
  status: 'completed' | 'missed' | 'failed',
  recordingUrl: string,
  transcript: text,
  startedAt: timestamp,
  endedAt: timestamp
}
```

### Lead
```javascript
{
  id: string (uuid),
  agentId: string (fk),
  callId: string (fk),
  name: string,
  phone: string,
  email: string,
  purpose: string,
  notes: text,
  createdAt: timestamp
}
```

### Plan
```javascript
{
  id: string,
  name: string,
  minutesLimit: number,
  price: number,
  features: json
}
```

## Page Structure

### Public Pages

#### Landing Page (`/`)
- Hero section with value proposition
- Feature highlights (3 agents, dashboard, analytics)
- Pricing tiers
- Call to action: Login / Register

#### Login (`/login`)
- Email/password form
- Role-based redirect (admin → /admin, user → /dashboard)

#### Register (`/register`)
- Name, email, password, company
- Auto-assign to 'user' role

### Admin Dashboard (`/admin`)

#### Overview (`/admin`)
- Stats cards: Total Users, Active Agents, Calls Today, Revenue
- Recent activity feed
- Quick actions

#### Users (`/admin/users`)
- Table: Name, Email, Company, Plan, Status, Actions
- Create user modal
- Edit/delete actions
- Block/unblock toggle

#### Agents (`/admin/agents`)
- Table: Name, Type, Owner, Status, Calls
- View all agents across users
- Enable/disable agents
- Assign phone number to agent

#### Calls (`/admin/calls`)
- Table: Caller, Agent, Duration, Status, Date
- Filter by status, date range
- Click to view details

#### Billing (`/admin/billing`)
- User usage table
- Assign/update plans
- Usage visualization

### User Dashboard (`/dashboard`)

#### Overview (`/dashboard`)
- My stats: My Agents, My Calls, Minutes Used
- Recent calls list
- Quick create agent

#### My Agents (`/dashboard/agents`)
- Cards for each agent type
- Create new agent wizard
- Edit prompts and settings

#### Call History (`/dashboard/calls`)
- Table: Date, Agent, Duration, Status, Recording
- Filter and search

#### Leads (`/dashboard/leads`)
- Table: Name, Phone, Purpose, Agent, Date
- Export functionality

#### Billing (`/dashboard/billing`)
- Current plan display
- Usage meter
- Upgrade option

## Agent Configuration

### Receptionist Agent
```yaml
name: "Receptionist"
greeting: "Hello, you've reached {company}. How can I assist you today?"
collect:
  - name (required)
  - phone (required)
  - purpose (required)
actions:
  - capture_lead
  - route_call
system_prompt: |
  You are a professional receptionist for a business.
  Greet callers warmly and collect their information.
  Be friendly but efficient.
  After collecting details, ask if they want to speak with someone or leave a message.
```

### Appointment Booking Agent
```yaml
name: "Appointment Booking"
collect:
  - service_type (from options)
  - preferred_date
  - preferred_time
  - customer_name
  - customer_phone
actions:
  - create_appointment
  - send_confirmation
system_prompt: |
  You help customers book appointments.
  Collect service type, preferred date/time.
  Confirm the booking details before ending.
```

### FAQ Agent
```yaml
name: "FAQ Support"
knowledge_base:
  - pricing: "Our pricing starts at $99/month for the basic plan..."
  - services: "We offer AI voice agents, appointment booking, and FAQ support..."
  - hours: "We're available Monday to Friday, 9 AM to 6 PM..."
actions:
  - answer_question
  - escalate_to_human
system_prompt: |
  You are a helpful support agent.
  Answer common questions about pricing, services, and business hours.
  Keep responses concise and professional.
  If you don't know the answer, offer to connect them with a team member.
```

## Component Inventory

### Navigation
- **Sidebar**: Dark background, icon + label links, active state highlight
- **Header**: User name, role badge, logout button

### Cards
- **Stat Card**: Icon, value, label, trend indicator
- **Agent Card**: Avatar/icon, name, type, status badge, action buttons
- **Call Card**: Compact row with caller, duration, status

### Tables
- **Data Table**: Sortable headers, row hover, pagination
- **States**: Loading skeleton, empty state, error state

### Forms
- **Input**: Dark background, subtle border, focus ring
- **Select**: Custom styled dropdown
- **Toggle**: Slide switch for boolean settings

### Modals
- **Overlay**: Semi-transparent dark
- **Content**: Centered, max-width, slide-up animation
- **Actions**: Cancel (ghost), Submit (primary)

### Feedback
- **Toast**: Slide-in notifications, auto-dismiss
- **Badge**: Status indicators (online/offline, success/error)
- **Progress**: Usage meters, call duration bars

## API Endpoints

### Auth
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/block` - Block/unblock user

### Agents
- `GET /api/agents` - List user's agents (or all for admin)
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/test` - Test agent configuration
- `POST /api/agents/:id/assign-phone` - Assign phone number to agent (admin only)

### Calls
- `GET /api/calls` - List calls (filtered by user for users)
- `GET /api/calls/:id` - Get call details
- `GET /api/calls/:id/recording` - Get recording URL

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead (from webhook)
- `GET /api/leads/export` - Export as CSV

### Webhooks
- `POST /api/webhooks/vapi` - Vapi webhook endpoint

### Analytics
- `GET /api/analytics/overview` - Dashboard stats
- `GET /api/analytics/usage` - Usage by user/period

## Vapi Integration

### Configuration
```javascript
{
  apiKey: process.env.VAPI_API_KEY,
  assistantTemplate: {
    model: "gpt-4",
    voice: {
      provider: "elevenlabs",
      voiceId: "rachel"
    },
    behavior: {
      idleTimerInSeconds: 30,
      maxDurationInSeconds: 600
    }
  }
}
```

### Webhook Events
- `call.started` - Log call start
- `call.ended` - Log call end, update duration
- `transcript.complete` - Store transcript
- `recording.ready` - Store recording URL

## Technical Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with pg driver
- **Auth**: JWT with bcrypt
- **HTTP**: Axios
- **Build**: Vite

## Security Considerations

- JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt (12 rounds)
- Role-based middleware
- Multi-tenant data isolation
- CORS configuration
- Input sanitization

## File Structure

```
/Saas
├── SPEC.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── server/
│   ├── index.js
│   ├── db/
│   │   ├── schema.js
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── agents.js
│   │   ├── calls.js
│   │   ├── leads.js
│   │   └── webhooks.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── tenant.js
│   └── services/
│       └── vapi.js
# Autoniv - AI Voice Agent Platform

## Concept & Vision

A professional multi-tenant SaaS platform for managing AI voice agents powered by Vapi. The system enables businesses to deploy intelligent voice assistants while administrators maintain full platform control. The experience should feel like a premium enterprise SaaS tool—clean, powerful, and trustworthy.

## Design Language

### Aesthetic Direction
Enterprise SaaS with a modern fintech feel. Dark sidebar navigation, clean card-based layouts, subtle gradients, and professional typography. Think Linear meets Vercel dashboard.

### Color Palette
- **Primary**: `#6366f1` (Indigo)
- **Secondary**: `#8b5cf6` (Violet)
- **Accent**: `#22c55e` (Green for success/online)
- **Warning**: `#f59e0b` (Amber)
- **Danger**: `#ef4444` (Red)
- **Background**: `#0f172a` (Slate 900)
- **Surface**: `#1e293b` (Slate 800)
- **Surface Light**: `#334155` (Slate 700)
- **Text Primary**: `#f8fafc` (Slate 50)
- **Text Secondary**: `#94a3b8` (Slate 400)
- **Border**: `#475569` (Slate 600)

### Typography
- **Headings**: Inter (bold, semi-bold)
- **Body**: Inter (regular, medium)
- **Monospace**: JetBrains Mono (for IDs, timestamps)

### Spatial System
- Base unit: 4px
- Card padding: 24px
- Section gaps: 32px
- Border radius: 8px (cards), 6px (buttons), 4px (inputs)

### Motion Philosophy
- Smooth transitions: 200ms ease-out
- Card hover: subtle lift with shadow
- Page transitions: fade-in 300ms
- Loading states: skeleton pulse animation
- Data updates: subtle highlight flash

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Admin     │    │    User     │    │   Public    │     │
│  │  Dashboard  │    │  Dashboard  │    │    Pages    │     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Node.js/Express)                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │   Auth   │  │   Users  │  │  Agents  │  │  Calls   │     │
│  │  Routes  │  │  Routes  │  │  Routes  │  │  Routes  │     │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Database (SQLite)                       │
│  users | agents | calls | leads | plans | webhooks          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Vapi API                               │
│  - Create/manage assistants                                 │
│  - Fetch call logs                                          │
│  - Handle webhooks                                          │
│  - Access recordings                                        │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### User
```javascript
{
  id: string (uuid),
  email: string,
  password: string (hashed),
  name: string,
  phoneNumber: string,
  role: 'admin' | 'user',
  plan: string,
  minutesUsed: number,
  minutesLimit: number,
  isActive: boolean,
  company: string,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Agent
```javascript
{
  id: string (uuid),
  userId: string (fk),
  vapiId: string,
  phoneNumberId: string,
  name: string,
  type: 'receptionist' | 'appointment' | 'faq',
  prompt: text,
  voiceId: string,
  isActive: boolean,
  callCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Call
```javascript
{
  id: string (uuid),
  agentId: string (fk),
  vapiCallId: string,
  callerNumber: string,
  duration: number,
  status: 'completed' | 'missed' | 'failed',
  recordingUrl: string,
  transcript: text,
  startedAt: timestamp,
  endedAt: timestamp
}
```

### Lead
```javascript
{
  id: string (uuid),
  agentId: string (fk),
  callId: string (fk),
  name: string,
  phone: string,
  email: string,
  purpose: string,
  notes: text,
  createdAt: timestamp
}
```

### Plan
```javascript
{
  id: string,
  name: string,
  minutesLimit: number,
  price: number,
  features: json
}
```

## Page Structure

### Public Pages

#### Landing Page (`/`)
- Hero section with value proposition
- Feature highlights (3 agents, dashboard, analytics)
- Pricing tiers
- Call to action: Login / Register

#### Login (`/login`)
- Email/password form
- Role-based redirect (admin → /admin, user → /dashboard)

#### Register (`/register`)
- Name, email, password, company
- Auto-assign to 'user' role

### Admin Dashboard (`/admin`)

#### Overview (`/admin`)
- Stats cards: Total Users, Active Agents, Calls Today, Revenue
- Recent activity feed
- Quick actions

#### Users (`/admin/users`)
- Table: Name, Email, Company, Plan, Status, Actions
- Create user modal
- Edit/delete actions
- Block/unblock toggle

#### Agents (`/admin/agents`)
- Table: Name, Type, Owner, Status, Calls
- View all agents across users
- Enable/disable agents
- Assign phone number to agent

#### Calls (`/admin/calls`)
- Table: Caller, Agent, Duration, Status, Date
- Filter by status, date range
- Click to view details

#### Billing (`/admin/billing`)
- User usage table
- Assign/update plans
- Usage visualization

### User Dashboard (`/dashboard`)

#### Overview (`/dashboard`)
- My stats: My Agents, My Calls, Minutes Used
- Recent calls list
- Quick create agent

#### My Agents (`/dashboard/agents`)
- Cards for each agent type
- Create new agent wizard
- Edit prompts and settings

#### Call History (`/dashboard/calls`)
- Table: Date, Agent, Duration, Status, Recording
- Filter and search

#### Leads (`/dashboard/leads`)
- Table: Name, Phone, Purpose, Agent, Date
- Export functionality

#### Billing (`/dashboard/billing`)
- Current plan display
- Usage meter
- Upgrade option

## Agent Configuration

### Receptionist Agent
```yaml
name: "Receptionist"
greeting: "Hello, you've reached {company}. How can I assist you today?"
collect:
  - name (required)
  - phone (required)
  - purpose (required)
actions:
  - capture_lead
  - route_call
system_prompt: |
  You are a professional receptionist for a business.
  Greet callers warmly and collect their information.
  Be friendly but efficient.
  After collecting details, ask if they want to speak with someone or leave a message.
```

### Appointment Booking Agent
```yaml
name: "Appointment Booking"
collect:
  - service_type (from options)
  - preferred_date
  - preferred_time
  - customer_name
  - customer_phone
actions:
  - create_appointment
  - send_confirmation
system_prompt: |
  You help customers book appointments.
  Collect service type, preferred date/time.
  Confirm the booking details before ending.
```

### FAQ Agent
```yaml
name: "FAQ Support"
knowledge_base:
  - pricing: "Our pricing starts at $99/month for the basic plan..."
  - services: "We offer AI voice agents, appointment booking, and FAQ support..."
  - hours: "We're available Monday to Friday, 9 AM to 6 PM..."
actions:
  - answer_question
  - escalate_to_human
system_prompt: |
  You are a helpful support agent.
  Answer common questions about pricing, services, and business hours.
  Keep responses concise and professional.
  If you don't know the answer, offer to connect them with a team member.
```

## Component Inventory

### Navigation
- **Sidebar**: Dark background, icon + label links, active state highlight
- **Header**: User name, role badge, logout button

### Cards
- **Stat Card**: Icon, value, label, trend indicator
- **Agent Card**: Avatar/icon, name, type, status badge, action buttons
- **Call Card**: Compact row with caller, duration, status

### Tables
- **Data Table**: Sortable headers, row hover, pagination
- **States**: Loading skeleton, empty state, error state

### Forms
- **Input**: Dark background, subtle border, focus ring
- **Select**: Custom styled dropdown
- **Toggle**: Slide switch for boolean settings

### Modals
- **Overlay**: Semi-transparent dark
- **Content**: Centered, max-width, slide-up animation
- **Actions**: Cancel (ghost), Submit (primary)

### Feedback
- **Toast**: Slide-in notifications, auto-dismiss
- **Badge**: Status indicators (online/offline, success/error)
- **Progress**: Usage meters, call duration bars

## API Endpoints

### Auth
- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Login and get JWT
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/block` - Block/unblock user

### Agents
- `GET /api/agents` - List user's agents (or all for admin)
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/test` - Test agent configuration
- `POST /api/agents/:id/assign-phone` - Assign phone number to agent (admin only)

### Calls
- `GET /api/calls` - List calls (filtered by user for users)
- `GET /api/calls/:id` - Get call details
- `GET /api/calls/:id/recording` - Get recording URL

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead (from webhook)
- `GET /api/leads/export` - Export as CSV

### Webhooks
- `POST /api/webhooks/vapi` - Vapi webhook endpoint

### Analytics
- `GET /api/analytics/overview` - Dashboard stats
- `GET /api/analytics/usage` - Usage by user/period

## Vapi Integration

### Configuration
```javascript
{
  apiKey: process.env.VAPI_API_KEY,
  assistantTemplate: {
    model: "gpt-4",
    voice: {
      provider: "elevenlabs",
      voiceId: "rachel"
    },
    behavior: {
      idleTimerInSeconds: 30,
      maxDurationInSeconds: 600
    }
  }
}
```

### Webhook Events
- `call.started` - Log call start
- `call.ended` - Log call end, update duration
- `transcript.complete` - Store transcript
- `recording.ready` - Store recording URL

## Technical Stack

- **Frontend**: React 18, React Router, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with pg driver
- **Auth**: JWT with bcrypt
- **HTTP**: Axios
- **Build**: Vite

## Security Considerations

- JWT tokens stored in httpOnly cookies
- Password hashing with bcrypt (12 rounds)
- Role-based middleware
- Multi-tenant data isolation
- CORS configuration
- Input sanitization

## File Structure

```
/Saas
├── SPEC.md
├── package.json
├── vite.config.js
├── tailwind.config.js
├── index.html
├── server/
│   ├── index.js
│   ├── db/
│   │   ├── schema.js
│   │   └── database.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── agents.js
│   │   ├── calls.js
│   │   ├── leads.js
│   │   └── webhooks.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── tenant.js
│   └── services/
│       └── vapi.js
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── StatCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── Modal.jsx
│   │   ├── AgentCard.jsx
│   │   ├── CallRow.jsx
│   │   └── LeadRow.jsx
│   └── pages/
│       ├── public/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── admin/
│       │   ├── Dashboard.jsx
│       │   ├── Users.jsx
│       │   ├── AdminAgents.jsx
│       │   ├── AdminCalls.jsx
│       │   └── AdminBilling.jsx
│       └── user/
│           ├── UserDashboard.jsx
│           ├── MyAgents.jsx
│           ├── MyCalls.jsx
│           ├── MyLeads.jsx
│           └── UserBilling.jsx
└── Client/
|   ├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── contexts/
│   │   └── AuthContext.jsx
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Header.jsx
│   │   ├── StatCard.jsx
│   │   ├── DataTable.jsx
│   │   ├── Modal.jsx
│   │   ├── AgentCard.jsx
│   │   ├── CallRow.jsx
│   │   └── LeadRow.jsx
│   └── pages/
│       ├── public/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   └── Register.jsx
│       ├── admin/
│       │   ├── Dashboard.jsx
│       │   ├── Users.jsx
│       │   ├── AdminAgents.jsx
│       │   ├── AdminCalls.jsx
│       │   └── AdminBilling.jsx
│       └── user/
│           ├── UserDashboard.jsx
│           ├── MyAgents.jsx
│           ├── MyCalls.jsx
│           ├── MyLeads.jsx
│           └── UserBilling.jsx
```
"# AutonivWeb" 
