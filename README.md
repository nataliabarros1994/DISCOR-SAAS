# Discord SaaS Platform

A modern, full-stack SaaS application for real-time event tracking with Discord notifications. Built with Next.js 16, React 19, TypeScript, and Prisma.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running Locally](#running-locally)
- [Responsive Design](#responsive-design)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Known Issues](#known-issues)
- [Contributing](#contributing)
- [License](#license)

## Overview

Discord SaaS is a production-ready platform that enables users to track application events in real-time and receive instant Discord notifications. The application features a complete authentication system, subscription management with Stripe, and a full CRUD interface for managing event categories and events.

### Key Highlights

- **Real-time Notifications**: Get instant Discord alerts when events occur
- **Subscription Plans**: FREE, PRO, and ENTERPRISE tiers with Stripe integration
- **Event Management**: Create, read, update, and delete event categories and events
- **User Dashboard**: Comprehensive overview of events, categories, and usage statistics
- **Secure Authentication**: Powered by Clerk with OAuth support
- **Type-Safe**: Full TypeScript implementation with Zod validation
- **Responsive Design**: Mobile-first design that works seamlessly across all devices

## Features

### Authentication & User Management
- ✅ Email/password and OAuth authentication (Google, GitHub, etc.)
- ✅ Secure session management with Clerk
- ✅ User profile management
- ✅ Protected routes and API endpoints

### Subscription & Billing
- ✅ Three subscription tiers: FREE, PRO, ENTERPRISE
- ✅ Stripe integration for payment processing
- ✅ Monthly and annual billing options
- ✅ Subscription management (upgrade, downgrade, cancel)
- ✅ Customer portal for invoice history
- ✅ Automatic refund system
- ✅ Webhook-based subscription status updates

### Event Tracking System
- ✅ Create custom event categories
- ✅ Track events with title, description, and timestamps
- ✅ Organize events by categories
- ✅ View recent events on dashboard
- ✅ Event history with full CRUD operations
- ✅ Real-time event logging to database

### Discord Integration
- ✅ Discord webhook notifications
- ✅ Rich embed messages with user details
- ✅ Event-triggered notifications
- ✅ Configurable notification channels
- ✅ Automatic fallback handling

### UI/UX Features
- ✅ Modern glass-morphism design
- ✅ Gradient backgrounds and smooth animations
- ✅ Loading states and skeleton screens
- ✅ Toast notifications (Sonner)
- ✅ Confirmation modals
- ✅ Empty states with helpful CTAs
- ✅ Form validation with inline errors
- ✅ Responsive tables and cards

## Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript 5](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Forms**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (Neon)
- **Authentication**: [Clerk](https://clerk.com/)
- **Payments**: [Stripe](https://stripe.com/)
- **Email**: [Resend](https://resend.com/)

### DevOps & Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Git Hooks**: Optional pre-commit hooks
- **Environment**: dotenv

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: 20.x or higher ([Download](https://nodejs.org/))
- **npm**: 10.x or higher (comes with Node.js)
- **Git**: Latest version ([Download](https://git-scm.com/))
- **PostgreSQL**: 14.x or higher (or use Neon cloud database)

### External Services Required

You'll need accounts for the following services:

1. **Clerk** - Authentication ([Sign up](https://clerk.com/))
2. **Stripe** - Payment processing ([Sign up](https://stripe.com/))
3. **Neon** - PostgreSQL database ([Sign up](https://neon.tech/))
4. **Discord** - For webhook notifications (optional) ([Create server](https://discord.com/))
5. **Resend** - Email notifications (optional) ([Sign up](https://resend.com/))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/discord-saas.git
cd discord-saas
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js and React
- Prisma and database client
- Clerk for authentication
- Stripe SDK
- Tailwind CSS and UI dependencies
- TypeScript and type definitions

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

See [Environment Variables](#environment-variables) section for detailed configuration.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Required Variables

```env
# Database - Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk Authentication
# Get from: https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Stripe Payment Processing
# Get from: https://dashboard.stripe.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Stripe Product Price IDs

```env
# PRO Plan ($19.99/month or $191.88/year)
STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
STRIPE_PRO_ANNUAL_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PRO_ANNUAL_PRICE_ID="price_..."

# ENTERPRISE Plan ($99.99/month or $959.88/year)
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_..."
STRIPE_ENTERPRISE_ANNUAL_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_ENTERPRISE_ANNUAL_PRICE_ID="price_..."
```

### Optional Variables

```env
# Discord Notifications (Recommended Method - Webhook)
# Get from: Discord Server → Channel → Edit → Integrations → Webhooks
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# Discord Bot (Alternative Method - Not needed if using webhook)
DISCORD_BOT_TOKEN=""
DISCORD_CHANNEL_ID=""

# Resend Email Service
# Get from: https://resend.com
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="Discord SaaS <onboarding@resend.dev>"
```

### How to Get Each Key

#### 1. Neon Database
1. Go to [console.neon.tech](https://console.neon.tech/)
2. Create a new project
3. Copy the connection string (use the pooled connection)
4. Important: Remove `?channel_binding=require` for Prisma compatibility

#### 2. Clerk
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com/)
2. Create a new application
3. Navigate to API Keys
4. Copy both the Publishable Key and Secret Key

#### 3. Stripe
1. Go to [dashboard.stripe.com](https://dashboard.stripe.com/)
2. Navigate to Developers → API keys
3. Copy Test mode keys (use Live keys for production)
4. For webhook secret: Developers → Webhooks → Add endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: Select all `customer.subscription.*` and `checkout.session.completed`

#### 4. Discord Webhook (Optional)
1. Open Discord server
2. Go to Server Settings → Integrations → Webhooks
3. Click "New Webhook"
4. Choose a channel and copy the webhook URL

#### 5. Stripe Products Setup
Create products in Stripe Dashboard:
1. Go to Products → Add Product
2. Create "PRO" plan with monthly ($19.99) and yearly ($191.88) prices
3. Create "ENTERPRISE" plan with monthly ($99.99) and yearly ($959.88) prices
4. Copy each price ID to your `.env.local`

## Database Setup

### Using Neon (Recommended)

1. **Create a Neon Account**: Sign up at [neon.tech](https://neon.tech/)

2. **Create a New Project**:
   - Project name: `discord-saas` (or your choice)
   - Region: Choose closest to your users
   - PostgreSQL version: 16

3. **Get Connection String**:
   - Go to your project dashboard
   - Copy the connection string
   - Use the **Pooled connection** string
   - Remove `?channel_binding=require` parameter

4. **Wake Up Database** (Neon auto-suspends inactive databases):
   ```bash
   ./wake-database.sh
   ```

5. **Push Database Schema**:
   ```bash
   npx prisma db push
   ```

6. **Verify Schema**:
   ```bash
   npx prisma studio
   ```
   This opens a GUI to browse your database at `http://localhost:5555`

### Database Migrations

For production, use migrations instead of `db push`:

```bash
# Create a new migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Database Schema Overview

The application uses the following main tables:

- **User**: Stores user accounts with Clerk integration
- **Category**: Event categories created by users
- **Event**: Individual events tracked by the system
- **Quota**: Usage limits for different subscription plans
- **StripeEvent**: Processed Stripe webhook events
- **SystemEvent**: Application event logs
- **UserWebhook**: Custom user-defined webhooks
- **WebhookLog**: Webhook delivery logs

## Running Locally

### Quick Start

Use the provided shell script:

```bash
chmod +x quick-start.sh
./quick-start.sh
```

This script will:
1. Check if database is awake
2. Install dependencies
3. Push database schema
4. Start the development server

### Manual Start

```bash
# 1. Wake up database (if using Neon)
./wake-database.sh

# 2. Push database schema
npx prisma db push

# 3. Start development server
npm run dev
```

The application will be available at:
- **Homepage**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Manage**: http://localhost:3000/manage
- **Pricing**: http://localhost:3000/pricing

### Available Scripts

```bash
# Development server (with Turbopack)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check environment variables
npm run check-env

# Open Prisma Studio
npx prisma studio
```

### Testing the Application

#### 1. Authentication Flow
1. Visit http://localhost:3000
2. Click "Get Started"
3. Sign up with email or OAuth provider
4. Verify you're redirected to dashboard

#### 2. Event Management
1. Go to http://localhost:3000/manage
2. Create a category (e.g., "Sales Events")
3. Create an event in that category
4. Edit and delete events/categories

#### 3. Payment Flow
1. From dashboard, click "Upgrade Now"
2. Select a plan (PRO or ENTERPRISE)
3. Choose billing period (Monthly/Annual)
4. Use Stripe test card: `4242 4242 4242 4242`
5. Expiry: `12/34`, CVC: `123`, ZIP: `12345`
6. Complete payment
7. Verify redirect to success page
8. Check Discord for upgrade notification (if configured)

#### 4. Subscription Management
1. Go to http://localhost:3000/manage
2. Click "Manage Subscription"
3. Test cancellation and upgrades

### Setting Up Stripe Webhook Locally

To test Stripe webhooks locally:

```bash
# Install Stripe CLI
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copy the webhook signing secret (whsec_...) to .env.local
```

## Responsive Design

The application is fully responsive across all device sizes:

### Breakpoints

The design uses Tailwind CSS default breakpoints:

- **Mobile**: < 640px (sm)
- **Tablet**: 640px - 1024px (md, lg)
- **Desktop**: > 1024px (xl, 2xl)

### Responsive Features

#### Mobile (< 640px)
- ✅ Hamburger menu navigation (if implemented)
- ✅ Stacked layout for forms and cards
- ✅ Touch-friendly button sizes (min 44x44px)
- ✅ Simplified tables with vertical scrolling
- ✅ Full-width modals
- ✅ Collapsible sections

#### Tablet (640px - 1024px)
- ✅ 2-column grid layouts
- ✅ Horizontal navigation bar
- ✅ Side-by-side forms
- ✅ Modal dialogs with proper margins
- ✅ Responsive typography

#### Desktop (> 1024px)
- ✅ 3-column grid layouts
- ✅ Full navigation with all options visible
- ✅ Larger modals with better spacing
- ✅ Hover effects and transitions
- ✅ Optimized for mouse/keyboard interaction

### Testing Responsive Design

```bash
# Use browser DevTools
1. Open http://localhost:3000
2. Press F12 to open DevTools
3. Click device toolbar icon (Ctrl+Shift+M)
4. Test different device sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - iPad Pro (1024px)
   - Desktop (1920px)
```

### Responsive Design Classes Used

The application uses these Tailwind patterns:

```tsx
// Example from components
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Responsive grid: 1 col mobile, 2 tablet, 3 desktop */}
</div>

<button className="text-sm md:text-base lg:text-lg px-4 py-2 md:px-6 md:py-3">
  {/* Responsive text size and padding */}
</button>

<div className="hidden md:block">
  {/* Hidden on mobile, visible on tablet+ */}
</div>

<nav className="flex flex-col md:flex-row gap-4">
  {/* Vertical on mobile, horizontal on tablet+ */}
</nav>
```

## Project Structure

```
discord-saas/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── api/                      # API Routes
│   │   │   ├── categories/           # Category CRUD endpoints
│   │   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   │   └── [id]/route.ts     # GET, PATCH, DELETE by ID
│   │   │   ├── events/               # Event CRUD endpoints
│   │   │   │   ├── route.ts          # GET (list), POST (create)
│   │   │   │   └── [id]/route.ts     # GET, PATCH, DELETE by ID
│   │   │   ├── checkout/             # Stripe checkout session
│   │   │   │   └── route.ts
│   │   │   ├── verify-session/       # Payment verification
│   │   │   │   └── route.ts
│   │   │   ├── create-portal-session/ # Stripe customer portal
│   │   │   │   └── route.ts
│   │   │   ├── webhooks/             # Webhook handlers
│   │   │   │   ├── stripe/route.ts   # Stripe webhook
│   │   │   │   └── user/route.ts     # User webhook
│   │   │   └── user/                 # User management
│   │   │       ├── plan/route.ts
│   │   │       └── email/route.ts
│   │   ├── dashboard/                # Dashboard page
│   │   │   └── page.tsx
│   │   ├── manage/                   # Event/Category management
│   │   │   └── page.tsx
│   │   ├── pricing/                  # Pricing page
│   │   │   └── page.tsx
│   │   ├── success/                  # Payment success page
│   │   │   └── page.tsx
│   │   ├── cancel/                   # Payment cancel page
│   │   │   └── page.tsx
│   │   ├── sign-in/                  # Clerk sign in
│   │   │   └── [[...sign-in]]/page.tsx
│   │   ├── sign-up/                  # Clerk sign up
│   │   │   └── [[...sign-up]]/page.tsx
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Landing page
│   │   ├── globals.css               # Global styles
│   │   └── providers.tsx             # React Query provider
│   ├── components/                   # React Components
│   │   ├── CategoryForm.tsx          # Create/Edit category form
│   │   ├── CategoryList.tsx          # Category list with actions
│   │   ├── EventForm.tsx             # Create/Edit event form
│   │   ├── EventList.tsx             # Event list with actions
│   │   ├── PricingCard.tsx           # Pricing plan card
│   │   ├── PricingToggle.tsx         # Monthly/Annual toggle
│   │   ├── BillingDateSelector.tsx   # Billing date picker
│   │   ├── FeatureComparison.tsx     # Plan comparison table
│   │   ├── UpgradeButton.tsx         # Upgrade to PRO button
│   │   ├── ShinyButton.tsx           # Animated button
│   │   ├── SuccessPageClient.tsx     # Success page client logic
│   │   └── ToasterProvider.tsx       # Toast notification provider
│   ├── lib/                          # Utility Functions
│   │   ├── prisma.ts                 # Prisma client setup
│   │   ├── discord-webhook.ts        # Discord webhook utilities
│   │   ├── discord.ts                # Discord bot utilities
│   │   ├── validations.ts            # Zod schemas
│   │   ├── utils.ts                  # Helper functions
│   │   └── stripe.ts                 # Stripe utilities (if exists)
│   └── middleware.ts                 # Next.js middleware (Clerk auth)
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── migrations/                   # Database migrations
├── public/                           # Static assets
├── .env.local                        # Environment variables (not in git)
├── .env.example                      # Environment template
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript config
├── tailwind.config.ts                # Tailwind CSS config
├── next.config.js                    # Next.js config
├── eslint.config.mjs                 # ESLint config
├── wake-database.sh                  # Database wake script
├── quick-start.sh                    # Quick start script
└── README.md                         # This file
```

### Key Files Explained

- **`src/app/layout.tsx`**: Root layout with Clerk provider and fonts
- **`src/app/providers.tsx`**: TanStack Query provider setup
- **`src/middleware.ts`**: Authentication middleware for protected routes
- **`src/lib/prisma.ts`**: Prisma client with auto-retry for Neon database
- **`src/lib/validations.ts`**: Zod schemas for form validation
- **`prisma/schema.prisma`**: Complete database schema definition

## API Documentation

### Authentication

All API routes (except webhooks) require authentication via Clerk. Include the session token in requests.

### Category Endpoints

#### GET `/api/categories`
Get all categories for the authenticated user.

**Response**: `200 OK`
```json
[
  {
    "id": "clxxx...",
    "name": "Sales Events",
    "slug": "sales-events",
    "createdAt": "2024-01-01T00:00:00Z",
    "events": []
  }
]
```

#### POST `/api/categories`
Create a new category.

**Body**:
```json
{
  "name": "Sales Events"
}
```

**Response**: `201 Created`

#### PATCH `/api/categories/[id]`
Update a category.

**Body**:
```json
{
  "name": "Updated Name"
}
```

**Response**: `200 OK`

#### DELETE `/api/categories/[id]`
Delete a category (cascades to events).

**Response**: `200 OK`

### Event Endpoints

#### GET `/api/events`
Get all events for the authenticated user.

**Response**: `200 OK`
```json
[
  {
    "id": "clxxx...",
    "title": "New Sale",
    "description": "Customer purchased PRO plan",
    "categoryId": "clxxx...",
    "createdAt": "2024-01-01T00:00:00Z",
    "category": {
      "name": "Sales Events"
    }
  }
]
```

#### POST `/api/events`
Create a new event.

**Body**:
```json
{
  "title": "New Sale",
  "description": "Customer purchased PRO plan",
  "categoryId": "clxxx..."
}
```

**Response**: `201 Created`

#### PATCH `/api/events/[id]`
Update an event.

**Response**: `200 OK`

#### DELETE `/api/events/[id]`
Delete an event.

**Response**: `200 OK`

### Payment Endpoints

#### POST `/api/checkout`
Create a Stripe checkout session.

**Body**:
```json
{
  "priceId": "price_xxx",
  "plan": "PRO",
  "billingPeriod": "MONTHLY"
}
```

**Response**: `200 OK`
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

#### POST `/api/create-portal-session`
Create a Stripe customer portal session.

**Response**: `200 OK`
```json
{
  "url": "https://billing.stripe.com/..."
}
```

#### GET `/api/verify-session?session_id=cs_xxx`
Verify a Stripe checkout session.

**Response**: `200 OK`
```json
{
  "session": {
    "payment_status": "paid",
    "amount_total": 1999,
    "currency": "usd"
  }
}
```

### Webhook Endpoints

#### POST `/api/webhooks/stripe`
Stripe webhook handler for subscription events.

**Events Handled**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

## Deployment

### Deploying to Vercel (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com/)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure Environment Variables**:
   - In Vercel dashboard, go to Settings → Environment Variables
   - Add all variables from `.env.local`
   - **Important**: Use production keys (not test keys)

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `https://your-app.vercel.app`

5. **Configure Stripe Webhook**:
   - In Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Select events: All `customer.subscription.*` and `checkout.session.completed`
   - Copy webhook secret to Vercel environment variables

6. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
   ```

### Deploying to Other Platforms

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add environment variables
railway variables set DATABASE_URL=...

# Deploy
railway up
```

#### Netlify
- Follow similar steps to Vercel
- Use Netlify CLI or GitHub integration
- Configure environment variables in Netlify dashboard

### Post-Deployment Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Replace all test keys with live keys
- [ ] Configure production Stripe webhook
- [ ] Test payment flow in production
- [ ] Set up Discord webhook for production notifications
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring (Sentry, LogRocket, etc.)
- [ ] Enable error tracking
- [ ] Configure analytics (Google Analytics, Posthog, etc.)
- [ ] Set up uptime monitoring
- [ ] Review security headers
- [ ] Enable rate limiting (if needed)
- [ ] Set up database backups

## Known Issues

### Database Connection Issues

**Issue**: Database connection fails with "Can't reach database server"

**Solution**:
- Neon databases auto-suspend after inactivity
- Run `./wake-database.sh` to wake it up
- The app has auto-retry logic that handles this automatically

### Stripe Webhook Not Firing Locally

**Issue**: Local development doesn't receive Stripe webhooks

**Solution**:
- Use Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Or test on a deployed environment with HTTPS

### Discord Notifications Not Sending

**Issue**: Discord notifications fail silently

**Solution**:
- Verify `DISCORD_WEBHOOK_URL` is correct
- Check Discord channel permissions
- Review server logs for errors
- Test webhook directly: `curl -X POST [WEBHOOK_URL] -H "Content-Type: application/json" -d '{"content": "Test"}'`

### Middleware Deprecation Warning

**Issue**: Console shows warning about middleware convention

**Solution**:
- This is a Next.js 16 deprecation notice
- Functionality is not affected
- Update to "proxy" convention when stable

### TypeScript Errors in IDE

**Issue**: IDE shows TypeScript errors but build succeeds

**Solution**:
- Restart TypeScript server in IDE
- Run `npx prisma generate` to regenerate types
- Clear `.next` folder: `rm -rf .next`

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and conventions
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting PR
- Ensure all TypeScript errors are resolved
- Follow responsive design principles

### Code Style

- Use TypeScript for all new files
- Follow ESLint rules
- Use Tailwind CSS for styling (no inline styles)
- Prefer functional components with hooks
- Use Zod for validation
- Write descriptive variable and function names

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For issues, questions, or suggestions:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/discord-saas/issues)
- **Documentation**: See `FEATURES_IMPLEMENTED.md` for complete feature list
- **Email**: your.email@example.com

---

## Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Clerk](https://clerk.com/) - Authentication
- [Stripe](https://stripe.com/) - Payments
- [Prisma](https://www.prisma.io/) - Database ORM
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Neon](https://neon.tech/) - PostgreSQL hosting
- [Vercel](https://vercel.com/) - Deployment platform

---

**Made with ❤️ using Next.js, React, and TypeScript**

**Ready to launch!** 🚀
