# Smart Kitchen Manager - Backend API

A complete GraphQL API server for the Smart Kitchen Manager application with authentication, real-time features, AI integrations, and background job processing.

## 🚀 Features

### Core Functionality
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Multi-tenant Architecture**: Households, kitchens, and member management
- **Inventory Management**: Items, batches, expiry tracking, low-stock alerts
- **Shopping Lists**: Multiple list types, festival templates, cost estimation
- **Expense Tracking**: Receipt OCR, vendor comparison, budget analytics
- **Smart Reminders**: Automated alerts for expiry, low stock, appliances
- **Usage Logging**: Track consumption, waste, purchases with auto inventory updates
- **Recipe Generation**: AI-powered recipe suggestions based on available ingredients

### AI & Automation
- **Image Recognition**: Scan items, receipts, and recipes using OpenAI Vision
- **Recipe AI**: Generate personalized recipes from available ingredients
- **Smart Suggestions**: Automated shopping lists and inventory predictions
- **Background Jobs**: Automated reminders, expiry checks, low-stock alerts

### Real-time Features
- **GraphQL Subscriptions**: Live updates for inventory changes
- **Push Notifications**: Reminders and alerts via multiple channels
- **Job Scheduling**: Background processing for automated tasks

## 🛠 Tech Stack

- **Runtime**: Node.js with TypeScript
- **API**: GraphQL with Apollo Server
- **Web Framework**: Fastify
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **File Storage**: Cloudflare R2 (configured)
- **AI Services**: OpenAI GPT-4 and Vision API
- **Background Jobs**: Custom job scheduler with intervals
- **Validation**: Zod schemas

## 📁 Project Structure

```
apps/api/
├── src/
│   ├── graphql/
│   │   ├── schema.ts          # GraphQL type definitions
│   │   ├── context.ts         # Request context & auth
│   │   └── resolvers/         # Query & mutation resolvers
│   │       ├── auth.ts        # Authentication resolvers
│   │       ├── inventory.ts   # Inventory management
│   │       ├── shopping.ts    # Shopping lists
│   │       ├── expense.ts     # Expense tracking
│   │       ├── reminder.ts    # Reminders & alerts
│   │       ├── recipe.ts      # AI recipe generation
│   │       └── ai.ts          # AI image scanning
│   ├── services/
│   │   ├── ai.ts             # OpenAI integrations
│   │   ├── storage.ts        # File upload handling
│   │   └── notifications.ts  # Push notifications
│   ├── jobs/
│   │   ├── reminderJobs.ts   # Background job processors
│   │   └── scheduler.ts      # Job scheduling system
│   └── index.ts              # Server entry point
├── package.json
└── tsconfig.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- OpenAI API key (for AI features)
- Cloudflare R2 credentials (for file storage)

### Installation

1. **Install dependencies**:
```bash
cd apps/api
npm install
```

2. **Set up environment variables**:
```bash
cp ../../.env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/smart_kitchen"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this"

# OpenAI
OPENAI_API_KEY="sk-your-openai-key"

# Cloudflare R2
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="smart-kitchen"

# App Config
FRONTEND_URL="http://localhost:3000"
```

3. **Set up the database**:
```bash
# Generate Prisma client
cd ../../packages/db
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

4. **Start the development server**:
```bash
cd ../../apps/api
npm run dev
```

The API will be available at:
- GraphQL Playground: http://localhost:4000/graphql
- Health Check: http://localhost:4000/health

## 📊 API Documentation

### Authentication

**Register a new user:**
```graphql
mutation Register {
  register(input: {
    email: "user@example.com"
    password: "password123"
    name: "John Doe"
  }) {
    token
    user {
      id
      email
      name
    }
  }
}
```

**Login:**
```graphql
mutation Login {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    token
    user {
      id
      email
      name
    }
  }
}
```

### Inventory Management

**Get inventory items:**
```graphql
query GetInventory($kitchenId: ID!) {
  inventoryItems(kitchenId: $kitchenId) {
    id
    name
    category
    totalQuantity
    status
    nextExpiry
    batches {
      id
      quantity
      unit
      expiryDate
    }
  }
}
```

**Add inventory item:**
```graphql
mutation AddItem($input: CreateInventoryItemInput!) {
  createInventoryItem(input: $input) {
    id
    name
    category
    location
  }
}
```

### Shopping Lists

**Create shopping list:**
```graphql
mutation CreateList($input: CreateShoppingListInput!) {
  createShoppingList(input: $input) {
    id
    title
    type
    totalItems
    estimatedTotal
  }
}
```

### AI Features

**Scan image:**
```graphql
mutation ScanImage($input: AIImageScanInput!) {
  scanImage(input: $input) {
    id
    result
    confidence
    processed
  }
}
```

**Generate recipe:**
```graphql
query GenerateRecipe($input: GenerateRecipeInput!) {
  generateRecipe(input: $input) {
    title
    ingredients
    steps
    prepTime
    calories
  }
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `R2_ACCOUNT_ID` | Cloudflare R2 account ID | No |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key | No |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key | No |
| `R2_BUCKET_NAME` | Cloudflare R2 bucket name | No |
| `FRONTEND_URL` | Frontend URL for CORS | No |
| `PORT` | Server port (default: 4000) | No |
| `NODE_ENV` | Environment (development/production) | No |

### Background Jobs

The API includes automated background jobs:

- **Expiry Check**: Runs every hour to check for expiring items
- **Low Stock Check**: Runs every 6 hours to identify low stock items  
- **Reminder Processing**: Runs every 5 minutes to send scheduled reminders

Jobs are automatically started with the server and can be configured in `src/jobs/scheduler.ts`.

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Household-level permissions (Owner, Admin, Member, Viewer)
- **Input Validation**: Comprehensive validation using Zod schemas
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **CORS Configuration**: Configurable cross-origin resource sharing
- **Rate Limiting**: Built-in Fastify rate limiting (can be configured)

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Setup

For production deployment:

1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Set up Cloudflare R2 bucket
5. Configure OpenAI API access
6. Set up monitoring and logging

## 📈 Monitoring & Logging

The API includes:

- **Health Check Endpoint**: `/health` for monitoring
- **Structured Logging**: JSON logs with different levels
- **Error Handling**: Comprehensive error catching and reporting
- **Performance Monitoring**: Built-in Fastify metrics

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write comprehensive tests
5. Update documentation

## 📝 License

This project is part of the Smart Kitchen Manager application.