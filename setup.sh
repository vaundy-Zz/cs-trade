#!/bin/bash

echo "🚀 Setting up Alerts & Workflows System..."

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🗄️  Starting PostgreSQL and Redis with Docker..."
docker-compose up -d

echo ""
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec -T postgres pg_isready -U alerts_user -d alerts_db > /dev/null 2>&1; do
  sleep 1
done

echo ""
echo "📝 Setting up backend environment..."
cd backend
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env file from .env.example"
  echo "⚠️  Please update DATABASE_URL and JWT_SECRET in backend/.env"
else
  echo "✅ .env file already exists"
fi

echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate

echo ""
echo "🗄️  Running database migrations..."
npm run db:migrate

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the development servers, run:"
echo "  npm run dev"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
echo "Database credentials:"
echo "  Host:     localhost"
echo "  Port:     5432"
echo "  Database: alerts_db"
echo "  User:     alerts_user"
echo "  Password: alerts_password"
