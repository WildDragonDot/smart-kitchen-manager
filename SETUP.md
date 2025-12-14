# 🚀 Smart Kitchen Manager - Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
# Install all dependencies
pnpm install

# Generate Prisma client
cd packages/db && pnpm prisma generate && cd ../..
```

### 2. Set up Environment
```bash
# Copy environment file
cp .env.example .env
```

**Edit `.env` with your configuration:**
```env
# Database (Required)
DATABASE_URL="postgresql://user:password@localhost:5432/smart_kitchen"

# JWT Secret (Required - change this!)
JWT_SECRET="your-super-secret-jwt-key-change-this"

# OpenAI API Key (Required for AI features)
OPENAI_API_KEY="sk-your-openai-key"

# App URLs
NEXT_PUBLIC_API_URL="http://localhost:4000/graphql"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set up Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Create database: smart_kitchen
# Update DATABASE_URL in .env

# Push schema to database
cd packages/db && pnpm prisma db push
```

**Option B: Cloud Database (Recommended)**
```bash
# Use Railway, Supabase, or Neon for free PostgreSQL
# Get connection string and update DATABASE_URL in .env

# Push schema to database
cd packages/db && pnpm prisma db push
```

### 4. Start the Application
```bash
# Start both frontend and backend
pnpm dev
```

**Access the application:**
- Frontend: http://localhost:3000
- GraphQL API: http://localhost:4000/graphql
- Health Check: http://localhost:4000/health

### 5. Create Your Account
1. Go to http://localhost:3000
2. Click "Sign up" 
3. Create your account
4. Start managing your kitchen!

## 🔧 Configuration Options

### Database Setup Options

**1. Railway (Free)**
```bash
# 1. Go to railway.app
# 2. Create new project → PostgreSQL
# 3. Copy connection string to .env
```

**2. Supabase (Free)**
```bash
# 1. Go to supabase.com
# 2. Create new project
# 3. Go to Settings → Database
# 4. Copy connection string to .env
```

**3. Neon (Free)**
```bash
# 1. Go to neon.tech
# 2. Create new project
# 3. Copy connection string to .env
```

### OpenAI API Key
```bash
# 1. Go to platform.openai.com
# 2. Create API key
# 3. Add to .env as OPENAI_API_KEY
```

## 🎯 Features Now Working

### ✅ **Authentication**
- User registration and login
- JWT-based authentication
- Protected routes

### ✅ **Inventory Management**
- Add/edit/delete items
- Batch tracking with expiry dates
- Low stock and expiry alerts
- Real-time status updates

### ✅ **Shopping Lists**
- Create multiple lists
- Festival templates
- Item management with prices
- Real-time collaboration

### ✅ **Expense Tracking**
- Log purchases and food orders
- Vendor comparison
- Monthly analytics
- Receipt upload (ready for OCR)

### ✅ **AI Features**
- Recipe generation from ingredients
- Image scanning (OpenAI Vision)
- Smart suggestions

### ✅ **Smart Reminders**
- Automated expiry alerts
- Low stock notifications
- Custom reminders
- Background job processing

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
# Verify DATABASE_URL format
# Test connection:
cd packages/db && pnpm prisma db push
```

### GraphQL API Issues
```bash
# Check if API is running on port 4000
curl http://localhost:4000/health

# Check logs in terminal
```

### Frontend Issues
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Restart development server
pnpm dev
```

### Authentication Issues
```bash
# Clear browser localStorage
# Check JWT_SECRET in .env
# Verify API connection
```

## 📱 Using the Application

### 1. **Dashboard Overview**
- View inventory stats
- See low stock alerts
- Check upcoming reminders
- Quick actions for common tasks

### 2. **Inventory Management**
- Add items manually or via AI scanning
- Set expiry dates and quantities
- Track usage and consumption
- Get automated alerts

### 3. **Shopping Lists**
- Create lists for different occasions
- Use festival templates (Diwali, Holi, etc.)
- Share lists with family members
- Track estimated costs

### 4. **Expense Tracking**
- Log grocery purchases
- Upload receipt photos
- Compare vendor prices
- View spending analytics

### 5. **AI Recipe Assistant**
- Generate recipes from available ingredients
- Filter by cuisine and dietary preferences
- Save favorite recipes
- Plan weekly meals

## 🚀 Production Deployment

### Frontend (Vercel)
```bash
cd apps/web
vercel --prod
```

### Backend (Railway)
```bash
cd apps/api
# Connect to Railway
# Deploy with environment variables
```

### Environment Variables for Production
```env
DATABASE_URL="your-production-db-url"
JWT_SECRET="secure-random-string"
OPENAI_API_KEY="your-openai-key"
FRONTEND_URL="https://your-domain.com"
NODE_ENV="production"
```

## 🎉 You're All Set!

Your Smart Kitchen Manager is now fully functional with:
- ✅ Real authentication system
- ✅ Complete GraphQL API
- ✅ AI-powered features
- ✅ Real-time updates
- ✅ Production-ready architecture

Start by creating your account and adding some inventory items to see the magic happen! 🍳✨