# System Architecture

## Overview

The Alerts & Workflows system is a full-stack application designed to monitor financial metrics and deliver real-time notifications when conditions are met.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    React     │  │   Zustand    │  │     SSE      │      │
│  │  Components  │──│    Stores    │──│   Client     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │ HTTP/SSE
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                         API Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Express    │  │     JWT      │  │     Rate     │      │
│  │   Router     │──│     Auth     │──│   Limiter    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      Service Layer                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Alert     │  │Notification  │  │  Market Data │      │
│  │  Evaluation  │──│   Service    │──│   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│     Data Layer          │   │   Background Jobs       │
│  ┌────────────────┐     │   │  ┌────────────────┐    │
│  │    Prisma      │     │   │  │   Bull Queue   │    │
│  │      ORM       │     │   │  │   (Redis)      │    │
│  └────────┬───────┘     │   │  └────────┬───────┘    │
│           │             │   │           │             │
│  ┌────────▼───────┐     │   │  ┌────────▼───────┐    │
│  │  PostgreSQL    │     │   │  │  Job Workers   │    │
│  │   Database     │     │   │  │  - Evaluator   │    │
│  └────────────────┘     │   │  └────────────────┘    │
└─────────────────────────┘   └─────────────────────────┘
```

## Component Breakdown

### Frontend Layer

#### React Application
- **Technology**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Modules
- **Routing**: React Router v6

#### State Management
- **Zustand**: Lightweight state management
  - Auth Store: User authentication state
  - Notification Store: Real-time notifications

#### Real-time Updates
- **SSE Client**: EventSource API for server-sent events
- **Auto-reconnect**: Handles connection drops gracefully

### API Layer

#### Express Server
- **RESTful API**: Standard HTTP methods
- **Middleware Stack**:
  - CORS handling
  - JSON body parsing
  - Error handling
  - Authentication
  - Rate limiting

#### Authentication
- **JWT Tokens**: Stateless authentication
- **bcrypt**: Password hashing
- **Token Expiry**: 7 days default

#### Rate Limiting
- **express-rate-limit**: API rate limiting
- **Custom limiter**: Notification rate limiting
- **Storage**: In-memory and database

### Service Layer

#### Alert Evaluation Service
```typescript
evaluateAlert(alert: AlertDefinition) -> boolean
  ├─ Fetch market data
  ├─ Check condition (above/below/equals/etc)
  ├─ Check for duplicates (60min window)
  ├─ Create trigger record
  └─ Send notification
```

#### Notification Service
- **Event Emitter**: Broadcasts to SSE clients
- **Rate Limiting**: Per-user notification limits
- **Logging**: All notifications logged to database
- **Placeholder Services**: Email and push (for future implementation)

#### Market Data Service
- **Simulation**: Generates realistic market data
- **Cache**: In-memory caching for performance
- **Real-world Integration**: Ready for API integration

### Data Layer

#### Database Schema

**Users**
```sql
id          UUID PRIMARY KEY
email       VARCHAR UNIQUE NOT NULL
password    VARCHAR NOT NULL (bcrypt hashed)
name        VARCHAR
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

**AlertDefinitions**
```sql
id          UUID PRIMARY KEY
user_id     UUID FOREIGN KEY -> Users
name        VARCHAR(100) NOT NULL
description VARCHAR(500)
type        ENUM(PRICE, VOLATILITY, ROI)
symbol      VARCHAR(20)
operator    ENUM(ABOVE, BELOW, EQUALS, ...)
threshold   FLOAT
is_active   BOOLEAN DEFAULT true
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

**AlertTriggers**
```sql
id              UUID PRIMARY KEY
alert_id        UUID FOREIGN KEY -> AlertDefinitions
user_id         UUID FOREIGN KEY -> Users
triggered_value FLOAT
triggered_at    TIMESTAMP
notified        BOOLEAN
notified_at     TIMESTAMP
```

**NotificationLog**
```sql
id        UUID PRIMARY KEY
user_id   VARCHAR (not FK for flexibility)
alert_id  VARCHAR
channel   VARCHAR (sse, email, push)
message   TEXT
sent_at   TIMESTAMP
success   BOOLEAN
error     TEXT
```

#### Prisma ORM
- **Type Safety**: Generated TypeScript types
- **Migrations**: Version-controlled schema changes
- **Studio**: Visual database browser

### Background Jobs

#### Bull Queue
- **Redis**: Job queue storage
- **Worker**: Processes alert evaluations
- **Scheduling**: Cron-like job scheduling
- **Retry Logic**: Automatic retry on failure

#### Alert Evaluator Worker
```typescript
Job: Alert Evaluation
Frequency: Every 30 seconds
Process:
  1. Fetch all active alerts
  2. For each alert:
     a. Get current market data
     b. Evaluate condition
     c. Check deduplication
     d. Create trigger if needed
     e. Send notification
  3. Log results
```

## Data Flow

### User Registration/Login
```
User Input
  ↓
POST /api/auth/register
  ↓
Validate with Zod
  ↓
Hash password (bcrypt)
  ↓
Save to DB (Prisma)
  ↓
Generate JWT
  ↓
Return user + token
```

### Create Alert
```
User Input (Form)
  ↓
POST /api/alerts
  ↓
Authenticate (JWT)
  ↓
Validate (Zod)
  ↓
Save to DB
  ↓
Return alert definition
```

### Alert Evaluation (Background)
```
Cron Trigger (30s)
  ↓
Fetch Active Alerts
  ↓
For Each Alert:
  ├─ Get Market Data
  ├─ Evaluate Condition
  └─ If Met:
      ├─ Check Deduplication
      ├─ Create Trigger
      └─ Send Notification
          ├─ Check Rate Limit
          ├─ Log to DB
          └─ Emit SSE Event
              ↓
          Connected Clients
              ↓
          Frontend Update
```

### Real-time Notification
```
Backend Event
  ↓
Notification Service
  ↓
Event Emitter
  ↓
SSE Connection(s)
  ↓
EventSource (Browser)
  ↓
Zustand Store Update
  ↓
React Component Re-render
  ↓
UI Update (Bell + Panel)
```

## Security Considerations

### Authentication
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with expiry
- Token stored in localStorage (consider httpOnly cookies for production)

### Authorization
- User isolation: Users can only access their own alerts
- Database queries filtered by userId
- Middleware validates ownership

### Rate Limiting
- **API**: 100 req/min per IP (prevent abuse)
- **Notifications**: 50/hour per user (prevent spam)
- **SSE**: One connection per user

### Input Validation
- Zod schemas for all inputs
- SQL injection prevented by Prisma
- XSS prevented by React
- CSRF protection via JWT

## Scalability Considerations

### Horizontal Scaling
- **Stateless API**: Multiple backend instances
- **Redis**: Shared queue across instances
- **PostgreSQL**: Connection pooling
- **SSE**: Sticky sessions or Redis pub/sub

### Performance
- **Database Indexes**: On user_id, symbol, triggered_at
- **Query Optimization**: Includes/joins minimized
- **Caching**: Market data cached in memory
- **Rate Limiting**: Prevents overload

### Monitoring
- **Logs**: Console logging (upgrade to structured logging)
- **Health Check**: /health endpoint
- **Database**: Prisma query logging
- **Queue**: Bull dashboard integration ready

## Future Enhancements

### Phase 2
- Email notifications (SendGrid/AWS SES)
- Push notifications (Firebase/OneSignal)
- WebSocket alternative to SSE
- Alert templates
- Multi-asset alerts

### Phase 3
- Alert groups/folders
- Sharing alerts
- Analytics dashboard
- Mobile app
- Webhook integrations

### Phase 4
- Machine learning predictions
- Complex alert logic (AND/OR conditions)
- Alert marketplace
- Team collaboration
- Advanced scheduling

## Technology Choices

### Why TypeScript?
- Type safety reduces bugs
- Better IDE support
- Self-documenting code
- Easier refactoring

### Why Prisma?
- Type-safe database access
- Great migration system
- Excellent TypeScript integration
- Visual database browser

### Why SSE over WebSocket?
- Simpler implementation
- HTTP/2 multiplexing
- Better for server-to-client
- Automatic reconnection
- No binary data needed

### Why Bull Queue?
- Mature and reliable
- Redis-backed persistence
- Retry logic built-in
- Good dashboard options
- Graceful shutdown

### Why Zustand over Redux?
- Simpler API
- Less boilerplate
- Better TypeScript support
- Smaller bundle size
- Middleware support

## Deployment

### Development
- Local PostgreSQL/Redis (Docker)
- Node.js dev server
- Hot reload (tsx watch, Vite HMR)

### Staging
- Docker containers
- Cloud database (AWS RDS/Heroku Postgres)
- Redis Cloud
- Environment variables

### Production
- Kubernetes/Docker Swarm
- Managed PostgreSQL (AWS RDS, Google Cloud SQL)
- Managed Redis (ElastiCache, Redis Cloud)
- Load balancer
- CDN for frontend
- SSL/TLS encryption
- Monitoring (DataDog, New Relic)
- Log aggregation (ELK, CloudWatch)

## Maintenance

### Database Backups
- Automated daily backups
- Point-in-time recovery
- Backup retention policy

### Monitoring
- Uptime monitoring
- Error tracking (Sentry)
- Performance metrics (APM)
- Database query performance

### Updates
- Dependency updates (Dependabot)
- Security patches
- Database migrations tested in staging
- Zero-downtime deployments
