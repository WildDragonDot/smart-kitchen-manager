#!/bin/bash

# Smart Kitchen Manager - Backend Setup Script
# This script sets up the complete backend environment

set -e

echo "🚀 Setting up Smart Kitchen Manager Backend..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "apps/api" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 20+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    print_error "Node.js version 20+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js version check passed: $(node -v)"

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

print_success "pnpm is available: $(pnpm -v)"

# Install dependencies
print_status "Installing dependencies..."
pnpm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating from .env.example..."
    cp .env.example .env
    print_warning "Please edit .env file with your configuration before starting the server"
fi

# Generate Prisma client
print_status "Generating Prisma client..."
cd packages/db
pnpm prisma generate
cd ../..

# Check if DATABASE_URL is set
if grep -q "postgresql://user:password@localhost:5432/smart_kitchen" .env; then
    print_warning "Default DATABASE_URL detected. Please update .env with your actual database connection string."
fi

# Check if OpenAI API key is set
if grep -q "sk-your-openai-key" .env; then
    print_warning "Default OpenAI API key detected. Please update .env with your actual OpenAI API key for AI features."
fi

print_success "Backend setup completed!"

echo ""
echo "📋 Next Steps:"
echo "1. Update .env file with your actual configuration:"
echo "   - DATABASE_URL (PostgreSQL connection string)"
echo "   - OPENAI_API_KEY (for AI features)"
echo "   - JWT_SECRET (change the default)"
echo "   - Cloudflare R2 credentials (optional, for file uploads)"
echo ""
echo "2. Set up your PostgreSQL database and run:"
echo "   cd packages/db && pnpm prisma db push"
echo ""
echo "3. Start the development servers:"
echo "   pnpm dev"
echo ""
echo "🌐 URLs:"
echo "   - Frontend: http://localhost:3000"
echo "   - GraphQL API: http://localhost:4000/graphql"
echo "   - Health Check: http://localhost:4000/health"
echo ""
echo "📚 Documentation:"
echo "   - API README: apps/api/README.md"
echo "   - Database Schema: packages/db/prisma/schema.prisma"
echo ""

print_success "Setup complete! Happy coding! 🎉"