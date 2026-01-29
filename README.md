# AssetFlow Ticketing Platform

Full-stack ticketing system for asset failure management built with React, Node.js, Express, and Prisma.

## 🚀 Tech Stack

### Frontend
- React 19.2.0
- Vite 7.2.4
- Tailwind CSS 4.1.18
- Axios

### Backend
- Node.js 20.x
- Express 5.2.1
- Prisma 6.19.2
- SQLite (development) / **PostgreSQL (production)**

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

4. Set up the database:
```bash
cd ../backend
npx prisma migrate dev
npm run seed
```

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

## 📋 Features

- **Asset Management**: View available assets with status indicators
- **Ticket Creation**: Report asset failures with detailed descriptions
- **Admin Dashboard**: Manage and close tickets
- **Duplicate Prevention**: Prevents multiple open tickets for the same asset
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS

## 🚢 Deployment

Recommended platforms:
- **Railway**: Best for monorepo structure with PostgreSQL support
- **Vercel** (frontend) + **Render/Railway** (backend)
- **Netlify** (frontend) + **Railway** (backend)

### Important: Switch to PostgreSQL before deploying!

## 📝 API Endpoints

- `GET /api/assets` - List all assets
- `POST /api/tickets` - Create a new ticket
- `GET /api/tickets` - List all tickets (with user and asset details)
- `PATCH /api/tickets/:id/close` - Close a ticket

## 👤 Default Test User

After running the seed script:
- Email: `admin@assetflow.com`
- Role: `ADMIN`

## 🔧 Scripts

### Backend
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run seed` - Populate database with test data

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📂 Project Structure

```
assetflow-ticketing-platform/
├── backend/
│   ├── index.js           # Express server
│   ├── seed.js            # Database seeding
│   ├── package.json
│   └── prisma/
│       └── schema.prisma  # Database schema
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main component
│   │   ├── api/
│   │   │   └── client.js  # Axios configuration
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## 📄 License

MIT
