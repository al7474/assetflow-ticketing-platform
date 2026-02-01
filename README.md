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
- SQLite (development) / **PostgreSQL (production)**

## ✨ Features

- 🔐 **JWT Authentication** - Secure login/register system
- 👥 **Role-Based Access Control** - ADMIN and EMPLOYEE roles
- 📦 **Asset Management** - View and track company assets
- 🎫 **Ticket System** - Report and manage asset failures
- 🛡️ **Protected API Routes** - Middleware authentication
- 📊 **Admin Dashboard** - Manage tickets (admin only)
- 🎨 **Responsive UI** - Tailwind CSS with modern design

## 📊 Database

⚠️ **Important**: This project uses **SQLite for local development** but is **designed for PostgreSQL in production**.

SQLite is not recommended for production environments due to:
- Data persistence issues on serverless deployments
- Lack of concurrent connection support
- Scalability limitations

### Migrating to PostgreSQL for Production

1. Update `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

2. Install PostgreSQL client (if not already installed):
```bash
cd backend
npm install @prisma/client
```

3. Set your PostgreSQL connection string in `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
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
# Edit .env and set JWT_SECRET to a secure random string
```

5. Set up the database (DEVELOPMENT ONLY):
```bash
npx prisma migrate dev
npm run seed
```

⚠️ **IMPORTANT**: `migrate dev` and `seed` are for **development only**. 
In production, use `npm run migrate:deploy` (never deletes data).
See [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) for details.

This will create two test users:
- **Admin**: `admin@assetflow.com` / `admin123`
- **Employee**: `employee@assetflow.com` / `employee123`

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
2. Register a new account or use test credentials:
   - **Admin**: `admin@assetflow.com` / `admin123` (can view admin dashboard)
   - **Employee**: `employee@assetflow.com` / `employee123` (standard user)
3. Browse assets and report failures
4. Admins can switch to "Admin: Tickets" view to manage and close tickets

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

Recommended platforms:
- **Railway**: Best for monorepo structure with PostgreSQL support
- **Vercel** (frontend) + **Render/Railway** (backend)
- **Netlify** (frontend) + **Railway** (backend)

### ⚠️ Important Pre-Deployment Steps:

1. **Switch to PostgreSQL** (SQLite is for dev only)
2. **Use production migration commands** (see below)
3. **Set JWT_SECRET** to a secure random string
4. **Never use `migrate dev` or `migrate reset` in production**

### Production Deployment Commands:
```bash
# Apply migrations safely (does NOT delete data)
npm run migrate:deploy

# Check migration status
npm run migrate:status

# ❌ NEVER run these in production:
# npm run migrate:dev  ← Can delete data
# npm run seed  ← Only for first-time setup
```

See [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) for complete guide.

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
