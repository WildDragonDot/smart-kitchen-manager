# Render Deployment Guide

## Manual Setup (Recommended)

### 1. API Service Setup

1. **Create New Web Service** in Render Dashboard
2. **Connect your GitHub repo**
3. **Configure the API service:**
   - **Name:** `smart-kitchen-api`
   - **Environment:** `Node`
   - **Build Command:** `pnpm build:api`
   - **Start Command:** `pnpm start:api`
   - **Node Version:** `20`

4. **Environment Variables:**
   ```
   NODE_ENV=production
   PORT=4000
   HOST=0.0.0.0
   DATABASE_URL=[from your database]
   JWT_SECRET=[generate a secure random string]
   REDIS_URL=[from your Redis service]
   OPENAI_API_KEY=[your OpenAI key]
   R2_ACCESS_KEY_ID=[your R2 key]
   R2_SECRET_ACCESS_KEY=[your R2 secret]
   R2_ENDPOINT=[your R2 endpoint]
   R2_BUCKET_NAME=[your bucket name]
   R2_PUBLIC_URL=[your R2 public URL]
   R2_ACCOUNT_ID=[your Cloudflare account ID]
   MAILGUN_API_KEY=[your Mailgun key]
   MAILGUN_DOMAIN=[your domain]
   FRONTEND_URL=https://smart-kitchen-web.onrender.com
   ```

### 2. Web Service Setup

1. **Create Another Web Service**
2. **Connect same GitHub repo**
3. **Configure the Web service:**
   - **Name:** `smart-kitchen-web`
   - **Environment:** `Node`
   - **Build Command:** `pnpm build:web`
   - **Start Command:** `pnpm start:web`
   - **Node Version:** `20`

4. **Environment Variables:**
   ```
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://smart-kitchen-api.onrender.com/graphql
   NEXT_PUBLIC_APP_URL=https://smart-kitchen-web.onrender.com
   NEXT_PUBLIC_SITE_NAME=Smart Kitchen Manager
   ```

### 3. Database Setup

1. **Create PostgreSQL Database**
   - **Name:** `smart-kitchen-db`
   - **Database Name:** `smart_kitchen`
   - **User:** `smart_kitchen_user`

2. **Copy the connection string** to your API service's `DATABASE_URL`

### 4. Redis Setup

1. **Create Redis Service**
   - **Name:** `smart-kitchen-redis`

2. **Copy the connection string** to your API service's `REDIS_URL`

## Auto-Deploy

Once set up, every push to your main branch will automatically trigger deployments for both services.

## Troubleshooting

- **Build fails with turbo not found:** The build commands bypass turbo and install dependencies directly
- **Lockfile issues:** The build commands run `pnpm install` which updates the lockfile
- **Missing dependencies:** Make sure all packages are listed in the respective package.json files

## URLs

After deployment:
- **API:** `https://smart-kitchen-api.onrender.com`
- **Web:** `https://smart-kitchen-web.onrender.com`