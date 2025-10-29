# Alerts Workflow System

A comprehensive alert management system with real-time notifications, rate limiting, and duplicate detection.

## Features

### User Interface
- **Alert Configuration UI**: Create, edit, and delete price, volatility, and ROI alert rules
- **Form Validation**: Client-side and server-side validation with user feedback
- **Alert Management**: Enable/disable alerts, view trigger history
- **Real-time Stats**: Dashboard showing total alerts, active alerts, and recent triggers

### Backend API
- **Authentication**: Simple token-based authentication (register/login)
- **CRUD Operations**: Full alert lifecycle management
- **Alert Types**: Support for price, volatility, and ROI alerts
- **Conditions**: Above, below, and change thresholds

### Alert Evaluation
- **Ingestion Endpoint**: Simulates data ingestion to trigger alert evaluation
- **Automatic Evaluation**: Checks all active alerts against incoming data
- **Smart Triggering**: Supports multiple condition types and thresholds

### Deduplication & Rate Limiting
- **Duplicate Prevention**: Prevents the same alert from triggering multiple times for the same value within a time window (60 minutes)
- **Rate Limiting**: Maximum 5 triggers per hour per alert to prevent spam
- **Smart Reset**: Rate limit counters reset after the time window expires

### Real-time Notifications
- **SSE Stream**: Server-Sent Events for real-time in-app notifications
- **Auto-reconnect**: Automatically reconnects on connection loss
- **Live Updates**: Instant notification when alerts trigger

## Installation

```bash
npm install
```

## Usage

### Start the Server

```bash
npm start
```

The server will start on port 3000 (or PORT environment variable).

### Access the Application

Open your browser and navigate to `http://localhost:3000`

### Create an Account

1. Click "Register" button
2. Enter a username and password (minimum 6 characters)
3. Submit the form

### Create an Alert

1. Fill in the alert form:
   - **Name**: Descriptive name for your alert
   - **Asset**: Asset symbol (e.g., BTC, ETH)
   - **Type**: Choose price, volatility, or ROI
   - **Condition**: Choose above, below, or change
   - **Threshold**: Numeric value that triggers the alert

2. Click "Create Alert"

### Simulate Market Data Ingestion

1. Use the "Simulate Market Ingestion" form
2. Enter:
   - **Asset**: Asset symbol matching your alerts
   - **Price**: Current price (optional)
   - **Volatility**: Current volatility (optional)
   - **ROI**: Current ROI (optional)

3. Click "Process Ingestion"

The system will evaluate all active alerts and trigger any that match the conditions.

### View Real-time Notifications

Notifications appear in the "Real-time Notifications" section when alerts trigger.

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

### Alert Management

- `GET /api/alerts` - List all alerts (authenticated)
- `POST /api/alerts` - Create a new alert (authenticated)
- `PUT /api/alerts/:id` - Update an alert (authenticated)
- `DELETE /api/alerts/:id` - Delete an alert (authenticated)
- `GET /api/alerts/:id/history` - Get alert trigger history (authenticated)

### Ingestion

- `POST /api/ingest` - Process market data and evaluate alerts

### Real-time Notifications

- `GET /api/notifications/stream` - SSE stream for real-time notifications (authenticated)

### Stats

- `GET /api/stats` - Get user statistics (authenticated)

## Technical Details

### Database Schema

**users**
- id, username, password_hash, created_at

**alert_definitions**
- id, user_id, name, type, asset, condition, threshold, enabled, created_at, updated_at

**alert_triggers**
- id, alert_id, triggered_at, value, notified

**rate_limits**
- alert_id (PK), last_triggered, trigger_count

### Alert Types

- **price**: Monitor asset price
- **volatility**: Monitor volatility metrics
- **roi**: Monitor return on investment

### Conditions

- **above**: Trigger when value exceeds threshold
- **below**: Trigger when value falls below threshold
- **change**: Trigger when absolute change from last trigger exceeds threshold

### Rate Limiting

- Maximum 5 triggers per hour per alert
- Prevents notification spam
- Automatically resets after 1 hour

### Deduplication

- Prevents duplicate triggers for same value within 60-minute window
- Uses exact value matching
- Independent per alert

## Architecture

- **Frontend**: Vanilla JavaScript with ES6 modules
- **Backend**: Node.js with Express
- **Database**: SQLite (better-sqlite3)
- **Real-time**: Server-Sent Events (SSE)
- **Authentication**: Token-based (simplified, use JWT in production)

## Development Notes

- The authentication system is simplified for demonstration purposes
- In production, use proper JWT tokens and secure password hashing (bcrypt)
- Consider using PostgreSQL or MySQL for production deployments
- Add email/push notification services for external alerts
- Implement more sophisticated rate limiting with Redis
- Add WebSocket support as an alternative to SSE

## Acceptance Criteria ✅

- ✅ Users can manage alerts end-to-end (create, update, delete)
- ✅ Notifications fire on condition match
- ✅ System prevents duplicate alerts (60-minute window)
- ✅ Rate limiting prevents spam (5 triggers/hour)
- ✅ Real-time notifications via SSE
- ✅ Form validation with UX affordances
- ✅ Alert evaluation during ingestion
- ✅ Authenticated user context
