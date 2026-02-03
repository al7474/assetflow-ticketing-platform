# AssetFlow Ticketing Platform

Full-stack SaaS ticketing system for asset failure management with **JWT Authentication & Role-Based Access Control (RBAC)**.

## 🚀 Tech Stack

### Frontend
- React 19.2.0
- Vite 7.2.4
- Tailwind CSS 4.1.18
- Axios
- Context API for state management

### Backend
- Node.js 20.x
- Express 5.2.1
- Prisma 6.19.2
- **JWT Authentication** (jsonwebtoken)
- **bcrypt** for password hashing
- **PostgreSQL** (production-ready)

## ✨ Features

- 🔐 **JWT Authentication** - Secure login/register system
- 👥 **Role-Based Access Control** - ADMIN and EMPLOYEE roles
- 📦 **Asset Management** - View and track company assets
- 🎫 **Ticket System** - Report and manage asset failures
- 🛡️ **Protected API Routes** - Middleware authentication
- 📊 **Admin Dashboard** - Manage tickets (admin only)
- 🎨 **Responsive UI** - Tailwind CSS with modern design

## 📊 Database

✅ **Production-Ready**: This project uses **PostgreSQL** for both development and production.

### Database Configuration

The project is configured with PostgreSQL in `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Local Development Setup

For local development, you have two options:

**Option 1: Use Railway PostgreSQL (Recommended)**
- Free tier includes PostgreSQL
- Same environment as production
- See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md)

**Option 2: Local PostgreSQL**
```bash
# Install PostgreSQL locally
# Set DATABASE_URL in backend/.env:
DATABASE_URL="postgresql://user:password@localhost:5432/assetflow"
```

4. Run migrations:
```bash
npm run prisma:migrate
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd assetflow-ticketing-platform
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

4. Set up environment variables:
```bash
cd backend
cp .env.example .env
# Edit .env:
# - Set JWT_SECRET to a secure random string
# - Set DATABASE_URL to your PostgreSQL connection string
```

5. Set up the database:
```bash
npx prisma migrate deploy
npm run seed:all
```

This will create:
- 2 organizations (Acme Corp, Tech Startup)
- 4 test users (2 per organization)
- 5 assets
- 6 sample tickets

**Test Users:**
- **Acme Admin**: `admin@acme.com` / `admin123`
- **Acme Employee**: `employee@acme.com` / `employee123`
- **Tech Admin**: `admin@techstartup.com` / `admin123`
- **Tech Employee**: `employee@techstartup.com` / `employee123`

### Development

Run both frontend and backend:

**Backend** (Terminal 1):
```bash
cd backend
npm run dev
# Server runs on http://localhost:3000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

## 🎯 Usage

1. Open http://localhost:5173
2. Login with test credentials:
   - **Acme Admin**: `admin@acme.com` / `admin123` (can view admin dashboard)
   - **Acme Employee**: `employee@acme.com` / `employee123` (standard user)
3. Browse assets and report failures
4. Admins can access the Dashboard to view analytics and manage tickets

## 🏢 Multi-Tenancy

AssetFlow supports **multi-tenancy** with complete data isolation:
- Each organization only sees their own data
- JWT tokens include `organizationId`
- All API queries are filtered by organization
- See [MULTI_TENANCY.md](MULTI_TENANCY.md) for details

## 🔐 Authentication Flow

1. User registers or logs in → JWT token generated
2. Token stored in localStorage
3. Axios automatically includes token in all API requests
4. Backend middleware validates token and checks role
5. Access granted based on permissions

**Role Permissions:**
- **EMPLOYEE**: Can view assets and create tickets
- **ADMIN**: All employee permissions + view/close all tickets

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user info (protected)

### Assets & Tickets
- `GET /api/assets` - List all assets (protected)
- `POST /api/tickets` - Create a new ticket (protected)
- `GET /api/tickets` - List all tickets (admin only)
- `PATCH /api/tickets/:id/close` - Close a ticket (admin only)

## 🚢 Deployment

**✅ Currently Deployed on Railway** - See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for complete guide.

Other supported platforms:
- **Railway**: Best for monorepo + PostgreSQL (recommended)
- **Vercel** (frontend) + **Render** (backend)
- **Netlify** (frontend) + **Railway** (backend)

### Production Setup:

1. **PostgreSQL is already configured** - No changes needed
2. **Set JWT_SECRET** to a secure random string
3. **Set FRONTEND_URL** for CORS
4. **Run seeds only once** on first deployment

### Production Deployment Commands:
```bash
# First deployment (with initial data)
npm run seed:all && npx prisma generate && npx prisma migrate deploy && node index.js

# Subsequent deployments (normal - use this permanently)
npx prisma generate && npx prisma migrate deploy && node index.js

# Check migration status
npm run migrate:status
```

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) and [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) for details.

## 🔧 Scripts

### Backend (Development)
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Populate database with test data (dev only)
- `npm run migrate:dev` - Create and apply migration (dev only)

### Backend (Production)
- `npm run migrate:deploy` - Apply migrations safely (does NOT delete data)
- `npm run migrate:status` - Check migration status
- `npm run prisma:generate` - Generate Prisma Client

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📂 Project Structure

```
assetflow-ticketing-platform/
├── backend/
│   ├── index.js                # Express server with auth routes
│   ├── seed.js                 # Database seeding (dev only!)
│   ├── package.json
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication middleware
│   │   └── organization.js     # Multi-tenancy middleware
│   ├── utils/
│   │   └── auth.js             # Password hashing & token generation
│   └── prisma/
│       ├── schema.prisma       # Database schema with Organizations
│       └── migrations/         # Database migrations (commit these!)
├── frontend/
│   ├── src/
│   │   ├── App.jsx             # Main app with protected routes
│   │   ├── main.jsx            # App entry with AuthProvider
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Authentication context
│   │   ├── components/
│   │   │   ├── Login.jsx       # Login form
│   │   │   └── Register.jsx    # Registration form
│   │   └── api/
│   │       └── client.js       # Axios with JWT interceptor
│   ├── package.json
│   └── vite.config.js
├── AUTH_IMPLEMENTATION.md      # Detailed auth documentation
├── MULTI_TENANCY.md            # Multi-tenancy guide
├── DATABASE_MIGRATIONS.md      # ⚠️ Production migration guide
└── README.md
```

## 🎓 Learning Highlights (for Recruiters)

This project demonstrates:
- ✅ **Full-stack SaaS architecture**
- ✅ **JWT Authentication & Authorization**
- ✅ **Role-Based Access Control (RBAC)**
- ✅ **Secure password hashing with bcrypt**
- ✅ **Protected API routes with middleware**
- ✅ **React Context API for state management**
- ✅ **RESTful API design**
- ✅ **Database modeling with Prisma ORM**
- ✅ **Modern UI with Tailwind CSS**
- ✅ **Production-ready error handling**

## 📖 Documentation

- [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md) - Complete authentication implementation guide

## 📄 License

MIT
