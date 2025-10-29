# Quick Start Guide

Get the Alerts & Workflows system running in 5 minutes!

## Prerequisites

Make sure you have installed:
- Node.js 18+ (`node --version`)
- Docker and Docker Compose (`docker --version`)
- Git (`git --version`)

## Step 1: Setup with Docker

The easiest way to get started is using the automated setup script:

```bash
# Make setup script executable (if not already)
chmod +x setup.sh

# Run setup
./setup.sh
```

This will:
1. Install all npm dependencies
2. Start PostgreSQL and Redis with Docker
3. Generate Prisma client
4. Run database migrations

## Step 2: Configure Environment

The setup script creates a default `.env` file. For production or custom setups, edit `backend/.env`:

```bash
cd backend
nano .env  # or use your preferred editor
```

Update these values:
```env
DATABASE_URL="postgresql://alerts_user:alerts_password@localhost:5432/alerts_db"
JWT_SECRET="change-this-to-a-random-secret"
```

## Step 3: Start Development Servers

From the project root:

```bash
npm run dev
```

This starts both backend and frontend:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## Step 4: Create Your First Alert

1. Open http://localhost:3000 in your browser
2. Click **Register** and create an account
3. After login, you'll see the dashboard
4. Click **Alerts** in the navigation
5. Click **Create Alert**
6. Fill in the form:
   - **Name**: "BTC Price Test"
   - **Type**: Price
   - **Symbol**: BTC
   - **Condition**: Above
   - **Threshold**: 100
7. Click **Create Alert**

## Step 5: Test Real-time Notifications

1. Click the 🔔 bell icon in the header
2. Click **Test** notification button (if available)
3. Or wait ~30 seconds for the background job to evaluate your alert
4. You should see notifications appear in real-time!

## Manual Setup (Without Docker)

If you prefer not to use Docker:

### Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu/Debian
sudo apt install postgresql
sudo systemctl start postgresql
```

### Install Redis (optional, for background jobs)
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis
```

### Create Database
```bash
psql postgres
CREATE DATABASE alerts_db;
CREATE USER alerts_user WITH PASSWORD 'alerts_password';
GRANT ALL PRIVILEGES ON DATABASE alerts_db TO alerts_user;
\q
```

### Install Dependencies and Run Migrations
```bash
npm install
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm run db:generate
npm run db:migrate
cd ..
```

### Start Servers
```bash
npm run dev
```

## Common Commands

### Start/Stop Docker Services
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# View logs
docker-compose logs -f
```

### Database Operations
```bash
cd backend

# Generate Prisma client after schema changes
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Open Prisma Studio (visual database editor)
npm run db:studio
```

### Development
```bash
# Run both frontend and backend
npm run dev

# Run only backend
npm run dev:backend

# Run only frontend
npm run dev:frontend
```

### Production Build
```bash
# Build both apps
npm run build

# Start production server
npm start
```

## Verify Installation

### Check Backend Health
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-01-01T12:00:00.000Z"}
```

### Check Database Connection
```bash
cd backend
npm run db:studio
```

This opens Prisma Studio at http://localhost:5555 where you can view/edit database records.

### Check Redis (if using)
```bash
redis-cli ping
```

Should return: `PONG`

## Troubleshooting

### Port Already in Use
If ports 3000 or 3001 are in use:

**Backend:**
Edit `backend/.env`:
```env
PORT=3002  # or any available port
```

**Frontend:**
Edit `frontend/vite.config.ts`:
```typescript
server: {
  port: 3001,  // change to available port
}
```

### Database Connection Failed
1. Check PostgreSQL is running: `docker-compose ps`
2. Verify credentials in `backend/.env`
3. Try: `docker-compose restart postgres`

### Redis Connection Failed
This is not critical. The app will work without Redis, but background jobs won't run. To fix:
1. Start Redis: `docker-compose up -d redis`
2. Restart backend: `npm run dev:backend`

### Migrations Failed
```bash
cd backend
rm -rf prisma/migrations
npm run db:push  # Force sync schema
```

### Frontend Not Loading
1. Clear browser cache
2. Check console for errors
3. Verify backend is running: `curl http://localhost:3001/health`

## Next Steps

- Read [README.md](./README.md) for detailed documentation
- Check [API.md](./API.md) for API reference
- Explore the code structure
- Customize alert types and conditions
- Add email/push notification services

## Need Help?

- Check the logs: `docker-compose logs`
- Backend logs: Terminal running `npm run dev:backend`
- Frontend logs: Browser console
- Database: `cd backend && npm run db:studio`

Happy alerting! 🚀
