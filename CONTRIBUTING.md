# Contributing to AssetFlow

Welcome to AssetFlow! This document serves as your central guide to understanding the project structure, architecture, and development workflows.

## 📚 Documentation Index

### Getting Started
- [README.md](README.md) - Project overview and quick start guide
- [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) - Production deployment guide

### Architecture & Design
- **Backend Architecture** - MVC pattern with layered architecture:
  - `routes/` - Express route definitions
  - `controllers/` - Business logic layer
  - `services/` - Database operations (Prisma)
  - `validators/` - Input validation middleware
  - `middleware/` - Auth, organization, subscription middleware
  - `utils/` - Helper functions (auth, email)
  - `config/` - Configuration files (Stripe)

### Core Concepts
- [MULTI_TENANCY.md](MULTI_TENANCY.md) - Multi-organization data isolation
- [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md) - JWT authentication and authorization
- [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) - Prisma migration workflows

### Development
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Testing scenarios and procedures
- [IMPROVEMENTS.md](IMPROVEMENTS.md) - Recent bug fixes and improvements
- [LANGUAGE_STANDARDIZATION.md](LANGUAGE_STANDARDIZATION.md) - English-only policy
- [.cursorrules](.cursorrules) - AI assistant guidelines and best practices

## 🏗️ Architecture Overview

### Backend Structure (Refactored MVC)

```
backend/
├── index.js                    # Server entry point (80 lines)
├── routes/                     # Express routers
│   ├── auth.routes.js          # Auth endpoints
│   ├── asset.routes.js         # Asset endpoints
│   ├── ticket.routes.js        # Ticket endpoints
│   ├── analytics.routes.js     # Analytics endpoints
│   └── subscription.routes.js  # Subscription endpoints
├── controllers/                # Business logic
│   ├── auth.controller.js      # Auth operations
│   ├── asset.controller.js     # Asset operations
│   ├── ticket.controller.js    # Ticket operations
│   ├── analytics.controller.js # Analytics operations
│   └── subscription.controller.js # Subscription & webhook logic
├── services/                   # Database layer
│   ├── auth.service.js         # User/org database ops
│   ├── asset.service.js        # Asset database ops
│   ├── ticket.service.js       # Ticket database ops
│   └── organization.service.js # Organization database ops
├── validators/                 # Input validation
│   ├── auth.validator.js       # Auth input validation
│   ├── ticket.validator.js     # Ticket input validation
│   └── subscription.validator.js # Subscription validation
├── middleware/                 # Express middleware
│   ├── auth.js                 # JWT authentication
│   ├── organization.js         # Multi-tenancy isolation
│   └── subscription.js         # Subscription limit enforcement
├── utils/                      # Helper functions
│   ├── auth.js                 # Password hashing, token generation
│   └── email.js                # Email notifications (Resend)
├── config/                     # Configuration
│   └── stripe.js               # Stripe plans configuration
├── prisma/                     # Database
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
└── __tests__/                  # Jest tests
    └── unit/                   # Unit tests
```

### Frontend Structure

```
frontend/
└── src/
    ├── main.jsx                # App entry point
    ├── App.jsx                 # Main app component
    ├── components/             # React components
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Dashboard.jsx
    │   ├── PricingPage.jsx
    │   └── BillingPage.jsx
    ├── context/                # React context
    │   └── AuthContext.jsx     # Auth state management
    └── api/                    # API client
        └── client.js           # Axios instance with interceptors
```

## 🔄 Development Workflow

### Adding a New Feature

Follow this layered approach when adding new functionality:

#### 1. **Define Route** (`routes/*.routes.js`)
```javascript
const express = require('express');
const router = express.Router();
const controller = require('../controllers/feature.controller');
const validator = require('../validators/feature.validator');

router.post('/', validator.validateInput, controller.createFeature);

module.exports = router;
```

#### 2. **Create Validator** (`validators/*.validator.js`)
```javascript
const validateInput = (req, res, next) => {
  const { field } = req.body;
  
  if (!field || !field.trim()) {
    return res.status(400).json({ error: 'Field is required' });
  }
  
  next();
};

module.exports = { validateInput };
```

#### 3. **Implement Service** (`services/*.service.js`)
```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class FeatureService {
  async create(data) {
    return await prisma.feature.create({ data });
  }
}

module.exports = new FeatureService();
```

#### 4. **Write Controller** (`controllers/*.controller.js`)
```javascript
const featureService = require('../services/feature.service');

class FeatureController {
  async createFeature(req, res) {
    try {
      const feature = await featureService.create(req.body);
      res.json(feature);
    } catch (error) {
      console.error('Create error:', error);
      res.status(500).json({ error: 'Failed to create feature' });
    }
  }
}

module.exports = new FeatureController();
```

#### 5. **Register Route** (`index.js`)
```javascript
const featureRoutes = require('./routes/feature.routes');
app.use('/api/features', featureRoutes);
```

## 🧪 Testing

### Running Tests
```bash
cd backend
npm test                    # Run all tests
npm test -- --coverage      # With coverage report
npm test -- auth.test.js    # Run specific test file
```

### Test Structure
- Unit tests: `__tests__/unit/*.test.js`
- Integration tests: Coming soon
- E2E tests: Coming soon

### Writing Tests
```javascript
const { functionToTest } = require('../utils/module');

describe('Module Name', () => {
  describe('functionToTest', () => {
    it('should do something expected', async () => {
      const result = await functionToTest('input');
      expect(result).toBe('expected');
    });
  });
});
```

## 🎯 Coding Standards

### Language Policy
**CRITICAL:** All code, documentation, and UI must be in English.

✅ **Correct:**
```javascript
const userName = 'John';
// Fetch user data
```

❌ **Incorrect:**
```javascript
const nombreUsuario = 'John';
// Obtener datos del usuario
```

### Naming Conventions
- **Variables:** `camelCase` (`userName`, `assetCount`)
- **Functions:** `camelCase` (`createUser`, `fetchAssets`)
- **Classes:** `PascalCase` (`UserController`, `AssetService`)
- **Constants:** `UPPER_SNAKE_CASE` (`MAX_RETRIES`, `JWT_SECRET`)
- **Files:** `kebab-case.type.js` (`auth.controller.js`, `user.service.js`)

### Code Organization
- One class per file
- Export at bottom of file
- Group related functions
- Separate concerns (routing, logic, data)

### Error Handling
```javascript
try {
  // Operation
  const result = await service.operation();
  res.json(result);
} catch (error) {
  console.error('Context-specific error:', error);
  res.status(500).json({ error: 'User-friendly message' });
}
```

## 🔒 Security Guidelines

### Multi-Tenancy
**ALWAYS** filter by `organizationId`:
```javascript
// ✅ CORRECT
const assets = await prisma.asset.findMany({
  where: { organizationId: req.organizationId }
});

// ❌ WRONG - Data leak!
const assets = await prisma.asset.findMany();
```

### Authentication
- Use `authenticateToken` middleware for protected routes
- Use `requireAdmin` for admin-only routes
- Always attach organization context with `attachOrganization`

### Input Validation
- Validate ALL user inputs in validators
- Sanitize strings (trim whitespace)
- Parse and validate IDs
- Check for SQL injection patterns

## 📦 Database Migrations

### Development Workflow
```bash
# Make schema changes in prisma/schema.prisma
npx prisma migrate dev --name descriptive_name
npx prisma generate
```

### Production Workflow
```bash
# Run migrations in production
npx prisma migrate deploy
```

See [DATABASE_MIGRATIONS.md](DATABASE_MIGRATIONS.md) for detailed guidance.

## 🚀 Deployment

### Environment Variables
**Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Min 32 characters
- `FRONTEND_URL` - For CORS
- `STRIPE_SECRET_KEY` - Stripe API key
- `STRIPE_WEBHOOK_SECRET` - Webhook signature key
- `STRIPE_PRO_PRICE_ID` - PRO plan price ID
- `STRIPE_ENTERPRISE_PRICE_ID` - ENTERPRISE plan price ID
- `RESEND_API_KEY` - Email service API key

See [RAILWAY_DEPLOYMENT.md](RAILWAY_DEPLOYMENT.md) for complete deployment guide.

## 🐛 Debugging

### Backend Logs
- Check terminal for console.error() output
- Check Railway logs in production
- Use `console.log()` for development debugging (remove before commit)

### Database Issues
```bash
# Check database connection
npx prisma db push --skip-generate

# View data
npx prisma studio
```

### Common Issues
1. **Stripe webhook failing** - Check webhook is BEFORE express.json()
2. **401 Unauthorized** - Check JWT_SECRET matches between environments
3. **403 Forbidden** - Check subscription limits or organization isolation
4. **CORS errors** - Check FRONTEND_URL is configured correctly

## 📈 Performance Tips

- Use `select` to limit returned fields
- Use `include` for eager loading related data
- Implement pagination for large datasets
- Use database indexes for frequently queried fields
- Cache frequently accessed data (Redis in future)

## 🤝 Pull Request Process

1. Create feature branch from `develop`
2. Make changes following architecture patterns
3. Write/update tests
4. Ensure all tests pass: `npm test`
5. Update documentation if needed
6. Submit PR with clear description
7. Wait for code review
8. Address review feedback
9. Merge after approval

## 📞 Getting Help

- **Issues:** Check [IMPROVEMENTS.md](IMPROVEMENTS.md) for known issues
- **Testing:** See [TESTING_GUIDE.md](TESTING_GUIDE.md)
- **Multi-Tenancy:** See [MULTI_TENANCY.md](MULTI_TENANCY.md)
- **Auth:** See [AUTH_IMPLEMENTATION.md](AUTH_IMPLEMENTATION.md)
- **AI Guidelines:** See [.cursorrules](.cursorrules)

## 🎉 Recognition

This project follows industry best practices:
- **MVC Architecture** - Clear separation of concerns
- **Layered Architecture** - Routes → Controllers → Services → Database
- **Dependency Injection** - Services injected into controllers
- **Input Validation** - Dedicated validation layer
- **Error Handling** - Comprehensive try-catch and error responses
- **Testing** - Unit tests with Jest
- **Documentation** - Comprehensive guides for all major systems

---

**Ready to contribute?** Start by reading the relevant documentation for the feature you want to work on, then follow the development workflow above. Welcome aboard! 🚀
