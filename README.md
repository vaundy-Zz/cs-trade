# Alerts & Workflows System

A comprehensive full-stack application for managing price, volatility, and ROI alerts with real-time notifications.

## Features

### ✨ Core Functionality
- **Alert Management**: Create, update, delete, and manage alert rules
- **Multiple Alert Types**: Price, Volatility, and ROI monitoring
- **Flexible Conditions**: Above, Below, Equals, Percentage Change Up/Down
- **Real-time Notifications**: Server-Sent Events (SSE) for instant in-app alerts
- **Rate Limiting**: Prevent notification spam with configurable limits
- **Deduplication**: Avoid duplicate alerts within configurable time windows
- **User Authentication**: Secure JWT-based authentication system

### 🎨 UI/UX Features
- **Responsive Design**: Works on desktop and mobile devices
- **Form Validation**: Client and server-side validation with helpful error messages
- **Interactive Dashboard**: Overview of alerts and recent notifications
- **Alert Filtering**: View all, active, or inactive alerts
- **Real-time Updates**: Live notification panel with unread count
- **Status Management**: Toggle alerts on/off without deleting

### 🔧 Technical Features
- **TypeScript**: Full type safety across frontend and backend
- **PostgreSQL**: Robust relational database with Prisma ORM
- **Bull Queue**: Background job processing for alert evaluation
- **Express.js**: Fast and minimal backend framework
- **React**: Modern frontend with hooks and state management
- **Zustand**: Lightweight state management for React

## Architecture

```
┌─────────────────┐
│   React UI      │
│  (TypeScript)   │
└────────┬────────┘
         │ HTTP/SSE
         ▼
┌─────────────────┐
│   Express API   │
│  (TypeScript)   │
└────────┬────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Prisma  │ │   Bull   │
│   ORM   │ │  Queue   │
└────┬────┘ └────┬─────┘
     │           │
     ▼           ▼
┌──────────┐ ┌───────┐
│PostgreSQL│ │ Redis │
└──────────┘ └───────┘
```

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+ (optional, for background jobs)

## Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd alerts-workflows-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up the backend
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Initialize the database
```bash
cd backend
npm run db:generate
npm run db:migrate
```

### 5. Start development servers
```bash
# From the root directory
npm run dev
```

This will start:
- Backend API: http://localhost:3001
- Frontend UI: http://localhost:3000

## Configuration

### Environment Variables

Backend `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/alerts_db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
NODE_ENV=development

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Rate limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100
NOTIFICATION_RATE_LIMIT_PER_HOUR=50
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Alerts
- `GET /api/alerts` - List all alerts
- `GET /api/alerts/:id` - Get alert details
- `POST /api/alerts` - Create new alert
- `PUT /api/alerts/:id` - Update alert
- `DELETE /api/alerts/:id` - Delete alert
- `GET /api/alerts/:id/triggers` - Get alert trigger history

### Notifications
- `GET /api/notifications/sse` - SSE connection for real-time notifications
- `GET /api/notifications/history` - Get notification history
- `POST /api/notifications/test` - Send test notification

## Database Schema

### Users
- id, email, password, name, timestamps

### AlertDefinitions
- id, userId, name, description, type, symbol, operator, threshold, isActive, timestamps

### AlertTriggers
- id, alertId, userId, triggeredValue, triggeredAt, notified, notifiedAt

### NotificationLog
- id, userId, alertId, channel, message, sentAt, success, error

### RateLimitTracker
- id, userId, count, windowStart

## Alert Types

### Price Alert
Monitor asset prices and trigger when they cross thresholds.

### Volatility Alert
Track price volatility and alert on significant changes.

### ROI Alert
Monitor return on investment and notify on target achievements.

## Condition Operators

- **ABOVE**: Trigger when value exceeds threshold
- **BELOW**: Trigger when value falls below threshold
- **EQUALS**: Trigger when value equals threshold
- **PERCENTAGE_CHANGE_UP**: Trigger on percentage increase
- **PERCENTAGE_CHANGE_DOWN**: Trigger on percentage decrease

## Background Jobs

The system uses Bull queue for background processing:

- **Alert Evaluation**: Runs every 30 seconds
- **Market Data Simulation**: Generates test market data
- **Notification Delivery**: Handles notification queue

## Rate Limiting

### API Rate Limiting
- 100 requests per minute per IP address (configurable)

### Notification Rate Limiting
- 50 notifications per hour per user (configurable)
- Prevents notification spam and overload

## Deduplication

Alerts use a 60-minute deduplication window to prevent duplicate notifications for the same condition within a short timeframe.

## Development

### Run backend only
```bash
npm run dev:backend
```

### Run frontend only
```bash
npm run dev:frontend
```

### Database operations
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
cd backend && npm run db:studio
```

## Building for Production

```bash
# Build both frontend and backend
npm run build

# Start production server
npm start
```

## Testing

### Test user registration/login
1. Navigate to http://localhost:3000
2. Click "Register" and create an account
3. Login with your credentials

### Test alert creation
1. Click "Alerts" in navigation
2. Click "Create Alert"
3. Fill in the form:
   - Name: "BTC Price Alert"
   - Type: Price
   - Symbol: BTC
   - Condition: Above
   - Threshold: 50000
4. Submit the form

### Test real-time notifications
1. Create an alert with achievable conditions
2. Wait for the evaluation job to run (every 30 seconds)
3. Watch for notifications in the notification panel (bell icon)

## Troubleshooting

### Redis not available
If Redis is not installed, the background job worker will gracefully fail and log a warning. The app will still work, but alerts won't be automatically evaluated. Install Redis to enable automatic evaluation.

### SSE connection issues
If notifications aren't appearing:
1. Check browser console for errors
2. Verify SSE connection in Network tab
3. Ensure you're logged in
4. Check backend logs for errors

### Database connection issues
1. Verify PostgreSQL is running
2. Check DATABASE_URL in .env
3. Ensure database exists
4. Run migrations: `npm run db:migrate`

## License

MIT

## Support

For issues and questions, please open an issue on the repository.
