# 🍳 Smart Kitchen Manager

> **AI-powered kitchen & household management platform**

A complete, production-ready application for managing your kitchen inventory, shopping lists, expenses, and recipes with AI-powered features and real-time collaboration.

## ✨ Features

### 🏠 **Household Management**
- Multi-user households with role-based permissions
- Multiple kitchens per household (Home, Office, PG, etc.)
- Real-time collaboration and sync across devices

### 📦 **Smart Inventory**
- AI-powered item scanning from photos
- Automatic expiry tracking and alerts
- Low stock notifications
- Batch management with FIFO consumption
- Smart categorization and storage location tracking

### 🛒 **Intelligent Shopping**
- Auto-generated shopping lists from low stock items
- Festival and event templates (Diwali, Holi, Eid, etc.)
- Price estimation and vendor comparison
- Shared shopping lists with real-time updates

### 💰 **Expense Tracking**
- Receipt OCR for automatic expense logging
- Vendor price comparison and analytics
- Budget alerts and spending insights
- Monthly/yearly expense reports

### 🤖 **AI Recipe Assistant**
- Generate recipes from available ingredients
- Cuisine and dietary preference filtering
- Meal planning with auto shopping list generation
- Recipe suggestions based on expiring items

### 🔔 **Smart Reminders**
- Automated expiry and low stock alerts
- Appliance maintenance reminders (gas, water filter, etc.)
- Festival preparation notifications
- Custom recurring reminders

### 📱 **Modern PWA Experience**
- Responsive design for mobile, tablet, and desktop
- Offline functionality with data sync
- Push notifications
- App-like experience on all devices

## 🏗 Architecture

### **Monorepo Structure**
```
smart-kitchen-manager/
├── apps/
│   ├── web/                 # Next.js 15 PWA Frontend
│   └── api/                 # Node.js GraphQL Backend
├── packages/
│   ├── db/                  # Prisma Database Schema
│   ├── ui/                  # Shared UI Components
│   ├── types/               # Shared TypeScript Types
│   └── utils/               # Shared Utilities
└── scripts/                 # Setup and deployment scripts
```

### **Tech Stack**

**Frontend:**
- Next.js 15 with App Router
- React 19 with TypeScript
- TailwindCSS + shadcn/ui components
- Framer Motion animations
- Zustand state management
- PWA with offline support

**Backend:**
- Node.js with TypeScript
- GraphQL API with Apollo Server
- Fastify web framework
- PostgreSQL with Prisma ORM
- JWT authentication
- Background job processing

**AI & Services:**
- OpenAI GPT-4 for recipe generation
- OpenAI Vision for image scanning
- Cloudflare R2 for file storage
- Push notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL database
- OpenAI API key (for AI features)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd smart-kitchen-manager

# Run the automated setup script
npm run setup
```

### 2. Configure Environment
```bash
# Copy and edit environment variables
cp .env.example .env
```

Update `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_kitchen"

# JWT Secret (change this!)
JWT_SECRET="your-super-secret-jwt-key-change-this"

# OpenAI API Key
OPENAI_API_KEY="sk-your-openai-key"

# App URLs
NEXT_PUBLIC_API_URL="http://localhost:4000/graphql"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize Database
```bash
cd packages/db
pnpm prisma db push
```

### 4. Start Development Servers
```bash
# Start both frontend and backend
pnpm dev

# Or start individually
pnpm api:dev    # Backend only
pnpm web:dev    # Frontend only
```

### 5. Access the Application
- **Frontend**: http://localhost:3000
- **GraphQL API**: http://localhost:4000/graphql
- **Health Check**: http://localhost:4000/health

## 📊 API Documentation

The backend provides a complete GraphQL API with the following capabilities:

### **Authentication**
```graphql
# Register new user
mutation Register {
  register(input: {
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
  }) {
    token
    user { id email name }
  }
}

# Login
mutation Login {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    token
    user { id email name }
  }
}
```

### **Inventory Management**
```graphql
# Get inventory items
query GetInventory($kitchenId: ID!) {
  inventoryItems(kitchenId: $kitchenId) {
    id name category totalQuantity status
    batches { quantity unit expiryDate }
  }
}

# Add inventory item
mutation AddItem($input: CreateInventoryItemInput!) {
  createInventoryItem(input: $input) {
    id name category location
  }
}
```

### **AI Features**
```graphql
# Scan image for items
mutation ScanImage($input: AIImageScanInput!) {
  scanImage(input: $input) {
    id result confidence processed
  }
}

# Generate recipe from ingredients
query GenerateRecipe($input: GenerateRecipeInput!) {
  generateRecipe(input: $input) {
    title ingredients steps prepTime calories
  }
}
```

## 🔧 Development

### **Project Structure**
- **`apps/web/`**: Next.js frontend application
- **`apps/api/`**: GraphQL backend server
- **`packages/db/`**: Database schema and Prisma client
- **`packages/ui/`**: Shared React components
- **`packages/types/`**: Shared TypeScript types
- **`packages/utils/`**: Shared utility functions

### **Available Scripts**
```bash
# Development
pnpm dev              # Start all services
pnpm api:dev          # Backend only
pnpm web:dev          # Frontend only

# Building
pnpm build            # Build all packages
pnpm type-check       # TypeScript checking

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema to database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio

# Utilities
pnpm clean            # Clean build artifacts
pnpm install:all      # Install all dependencies
```

### **Database Schema**
The application uses a comprehensive PostgreSQL schema with:
- User authentication and households
- Multi-kitchen inventory management
- Shopping lists and expense tracking
- Reminders and usage logs
- AI scan history and recipe storage

View the complete schema: `packages/db/prisma/schema.prisma`

## 🚀 Deployment

### **Frontend (Vercel)**
```bash
# Build and deploy to Vercel
cd apps/web
vercel --prod
```

### **Backend (Railway/Render)**
```bash
# Build for production
cd apps/api
npm run build

# Start production server
npm start
```

### **Database**
- Use managed PostgreSQL (Railway, Supabase, AWS RDS)
- Run migrations: `pnpm db:migrate`
- Set up connection pooling for production

### **Environment Variables**
Ensure all production environment variables are set:
- Database connection string
- JWT secret (secure random string)
- OpenAI API key
- Cloudflare R2 credentials
- Frontend/backend URLs

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Household-level permissions (Owner, Admin, Member, Viewer)
- **Input Validation**: Comprehensive validation using Zod schemas
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **CORS Configuration**: Secure cross-origin resource sharing
- **Data Encryption**: Sensitive data encryption at rest

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### **Development Guidelines**
- Follow TypeScript best practices
- Add proper error handling and validation
- Include comprehensive tests
- Update documentation
- Follow the existing code style

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web technologies
- AI powered by OpenAI
- UI components from shadcn/ui
- Icons from Lucide React

---

**Made with ❤️ for better kitchen management**
