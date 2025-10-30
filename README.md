# Authentication System with NextAuth, Prisma, and Steam OAuth

A comprehensive authentication system built with Next.js 16, NextAuth.js v5, Prisma, and Steam OAuth integration. Features secure session handling, protected routes, and user-specific entities management.

## Features

### Authentication
- **Email/Password Authentication**: Secure credential-based login with bcrypt password hashing
- **Steam OAuth**: Integration with Steam OpenID for seamless gaming platform authentication
- **Session Management**: JWT-based sessions compatible with SSR and server components
- **Protected Routes**: Middleware-based route guards with automatic redirects

### User Management
- **User Profiles**: View and manage user information
- **Preferences**: Customizable user settings (theme, notifications, email alerts)
- **Alerts**: Create and manage user-specific alerts with type categorization
- **Watchlists**: Organize items into watchlists with metadata support

### API Endpoints
All endpoints enforce authentication and authorization:

#### Authentication
- `POST /api/auth/signup` - Create a new user account
- `GET /api/auth/[...nextauth]` - NextAuth.js handler (signin, callback, etc.)
- `POST /api/auth/[...nextauth]` - NextAuth.js handler (signin, signout, etc.)

#### Preferences
- `GET /api/preferences` - Fetch user preferences
- `PUT /api/preferences` - Update user preferences

#### Alerts
- `GET /api/alerts` - List all user alerts
- `POST /api/alerts` - Create a new alert
- `PUT /api/alerts/[id]` - Update an alert
- `DELETE /api/alerts/[id]` - Delete an alert

#### Watchlists
- `GET /api/watchlists` - List all user watchlists
- `POST /api/watchlists` - Create a new watchlist
- `PUT /api/watchlists/[id]` - Update a watchlist
- `DELETE /api/watchlists/[id]` - Delete a watchlist

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Authentication**: NextAuth.js v5 (beta)
- **Database ORM**: Prisma
- **Database**: PostgreSQL (Prisma Postgres)
- **Password Hashing**: bcryptjs
- **UI**: Tailwind CSS
- **Testing**: Jest + React Testing Library

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database (or use Prisma Postgres)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env`:
```env
DATABASE_URL="your-postgres-connection-string"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
STEAM_API_KEY="your-steam-api-key" # Optional for Steam OAuth
```

3. Generate Prisma Client and create database tables:
```bash
npx prisma generate
npx prisma db push
```

### Development

Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Testing

Run the test suite:
```bash
npm test
```

Tests cover:
- Authentication callbacks and JWT/session handling
- Route guards and protected route redirects
- API authorization rules for all endpoints
- CRUD operations on user-specific entities

## Project Structure

```
/app
  /api
    /auth           # Authentication endpoints
    /preferences    # User preferences API
    /alerts         # Alerts management API
    /watchlists     # Watchlists management API
  /auth             # Auth pages (signin, signup, signout, error)
  /dashboard        # Protected dashboard
  /profile          # User profile page
  /preferences      # Preferences management page
  /alerts           # Alerts page
  /watchlists       # Watchlists page
  layout.tsx        # Root layout with SessionProvider
  page.tsx          # Homepage

/lib
  auth.ts           # NextAuth configuration
  prisma.ts         # Prisma client singleton
  route-guard.ts    # Route protection logic

/prisma
  schema.prisma     # Database schema

/__tests__
  auth.test.ts             # Auth callback tests
  route-guard.test.ts      # Route protection tests
  /api                     # API endpoint tests

/components
  SessionProvider.tsx      # Client-side session provider

middleware.ts              # Route protection middleware
```

## Database Schema

The application uses the following Prisma models:

- **User**: Core user account
- **Account**: OAuth account linking (for Steam)
- **Session**: User sessions
- **VerificationToken**: Email verification tokens
- **UserPreferences**: User-specific preferences
- **Alert**: User alerts with conditions
- **Watchlist**: User watchlists
- **WatchlistItem**: Items in watchlists

## Security Features

1. **Password Security**: Passwords are hashed using bcrypt with a salt factor of 12
2. **JWT Sessions**: Secure token-based session management
3. **Route Protection**: Middleware enforces authentication on protected routes
4. **API Authorization**: All API endpoints verify user identity and ownership
5. **CSRF Protection**: Built-in NextAuth.js CSRF protection
6. **Environment Variables**: Sensitive configuration stored in environment variables

## Protected Routes

The following routes require authentication:
- `/dashboard`
- `/profile`
- `/preferences`
- `/alerts`
- `/watchlists`

Unauthenticated users are automatically redirected to `/auth/signin` with a callback URL.

## Steam OAuth Setup

To enable Steam authentication:

1. Obtain a Steam API key from [Steam Web API](https://steamcommunity.com/dev/apikey)
2. Add the API key to your `.env` file:
```env
STEAM_API_KEY="your-steam-api-key"
```
3. Steam uses OpenID authentication, which is handled by the custom Steam provider in `lib/auth.ts`

## API Usage Examples

### Create an Alert
```bash
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Price Drop Alert",
    "description": "Notify when game price drops below $20",
    "type": "price",
    "condition": "{\"price\": 20, \"operator\": \"less_than\"}"
  }'
```

### Create a Watchlist
```bash
curl -X POST http://localhost:3000/api/watchlists \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Favorite Games",
    "description": "My favorite Steam games",
    "items": [
      {
        "itemType": "game",
        "itemId": "570",
        "itemName": "Dota 2"
      }
    ]
  }'
```

## Testing Coverage

The test suite includes:

- **Auth Tests**: Credential validation, JWT callbacks, session callbacks
- **Route Guard Tests**: Protected route identification, redirect paths
- **Preferences API Tests**: GET/PUT operations with auth checks
- **Alerts API Tests**: Full CRUD operations with ownership validation
- **Watchlists API Tests**: Full CRUD operations with ownership validation

All API tests verify:
- 401 responses for unauthenticated requests
- 403 responses for unauthorized access attempts
- Proper data validation and error handling
- Successful operations for authorized users

## Deployment

For production deployment:

1. Set strong `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

2. Configure production database URL
3. Set `NEXTAUTH_URL` to your production domain
4. Run database migrations:
```bash
npx prisma migrate deploy
```

5. Build and start:
```bash
npm run build
npm start
```

## License

MIT
