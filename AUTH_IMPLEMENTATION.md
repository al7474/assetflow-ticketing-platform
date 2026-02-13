# 🔐 JWT Authentication + Roles - Implementation Guide

## ✅ Implemented

### Backend

#### 1. **Prisma Schema** ([backend/prisma/schema.prisma](backend/prisma/schema.prisma))
```prisma
model User {
  id             Int          @id @default(autoincrement())
  name           String
  email          String       @unique
  password       String       // Hashed password
  role           String       @default("EMPLOYEE") // ADMIN or EMPLOYEE
  organizationId Int
  organization   Organization @relation(fields: [organizationId], references: [id])
  tickets        Ticket[]
  createdAt      DateTime     @default(now())
}
```

#### 2. **Authentication Middleware** ([backend/middleware/auth.js](backend/middleware/auth.js))
- `authenticateToken`: Verifies JWT in headers
- `requireAdmin`: Verifies admin role

#### 3. **Auth Utilities** ([backend/utils/auth.js](backend/utils/auth.js))
- `hashPassword()`: Hashes passwords with bcrypt
- `comparePassword()`: Compares password with hash
- `generateToken()`: Generates JWT token (expires in 7 days)

#### 4. **Authentication Endpoints** ([backend/index.js](backend/index.js))
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Sign in
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/invite` - Invite user to organization (admin only)

#### 5. **Protected Routes**
All routes now require authentication:
- `GET /api/assets` - Requires JWT token
- `POST /api/tickets` - Requires JWT token (uses authenticated user ID)
- `GET /api/tickets` - Requires JWT token + ADMIN role
- `PATCH /api/tickets/:id/close` - Requires JWT token + ADMIN role

### Frontend

#### 1. **AuthContext** ([frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx))
Provides:
- `user` - Current user
- `loading` - Loading state
- `login(email, password)` - Login function
- `register(name, email, password)` - Register function
- `logout()` - Logout function
- `isAdmin` - Boolean if admin
- `isAuthenticated` - Boolean if authenticated
- `organization` - Organization object

#### 2. **Auth Components**
- [Login.jsx](frontend/src/components/Login.jsx) - Login form
- [Register.jsx](frontend/src/components/Register.jsx) - Registration form

#### 3. **API Client** ([frontend/src/api/client.js](frontend/src/api/client.js))
Axios interceptor that:
- Auto-includes `Authorization: Bearer {token}` in all requests
- Redirects to login on 401 Unauthorized

#### 4. **Conditional UI** ([frontend/src/App.jsx](frontend/src/App.jsx))
- Shows Login/Register if not authenticated
- Shows Dashboard only for admins (`isAdmin`)
- Shows Tickets view only for admins

---

## 🔒 Security Features

### 1. **Password Hashing**
```javascript
// bcrypt with 10 salt rounds
const hashedPassword = await hashPassword('password123');
// Result: $2b$10$...
```

### 2. **JWT Token**
```javascript
{
  id: 1,
  email: "admin@acme.com",
  role: "ADMIN",
  organizationId: 1,
  iat: 1234567890,
  exp: 1234567890 + (7 * 24 * 60 * 60) // 7 days
}
```

### 3. **Token Storage**
- Stored in `localStorage` as `token`
- Sent in `Authorization` header
- Auto-removed on logout or 401

### 4. **Middleware Chain**
```javascript
app.get('/api/tickets',
  authenticateToken,    // 1. Verify JWT
  requireAdmin,         // 2. Check role
  attachOrganization,   // 3. Extract orgId
  requireOrganization,  // 4. Ensure orgId exists
  async (req, res) => { // 5. Execute logic
    // req.user contains decoded JWT
    // req.organizationId contains org ID
  }
);
```

---

## 🧪 Test Users

After running `npm run seed`:

### Acme Corporation
- **Admin**: `admin@acme.com` / `admin123`
  - Can view Dashboard
  - Can manage tickets
  - Can invite users
- **Employee**: `employee@acme.com` / `employee123`
  - Can report failures
  - Cannot view Dashboard
  - Cannot manage tickets

### Tech Startup Inc
- **Admin**: `admin@techstartup.com` / `admin123`
- **Employee**: `employee@techstartup.com` / `employee123`

---

## 🎯 Role Permissions

| Feature | EMPLOYEE | ADMIN |
|---------|----------|-------|
| View own organization's assets | ✅ | ✅ |
| Report asset failures | ✅ | ✅ |
| View Dashboard | ❌ | ✅ |
| View all tickets | ❌ | ✅ |
| Close tickets | ❌ | ✅ |
| Invite users | ❌ | ✅ |
| View analytics | ❌ | ✅ |

---

## 📝 Code Examples

### Frontend: Login
```javascript
const { login } = useAuth();

const result = await login(email, password);
if (result.success) {
  // User is now authenticated
  // Token saved to localStorage
  // Redirected to app
}
```

### Backend: Protect Route
```javascript
app.get('/api/admin-only',
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    // Only admins reach here
    res.json({ message: 'Admin access granted' });
  }
);
```

### Backend: Get Current User
```javascript
app.get('/api/profile',
  authenticateToken,
  async (req, res) => {
    // req.user contains:
    // { id, email, role, organizationId }
    res.json(req.user);
  }
);
```

---

## 🔐 JWT Secret

**⚠️ CRITICAL:** Change `JWT_SECRET` in production!

```bash
# backend/.env
JWT_SECRET="your-super-secret-key-min-32-characters"
```

Generate a strong secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🐛 Troubleshooting

### "Invalid token"
- Token expired (7 days)
- JWT_SECRET changed
- Token manually modified

**Solution:** Logout and login again

### "Unauthorized"
- No token provided
- Token in wrong format

**Solution:** Check `Authorization` header format: `Bearer {token}`

### "Forbidden"
- User is EMPLOYEE trying to access admin route

**Solution:** Upgrade user role to ADMIN

---

## 🚀 Production Checklist

- [ ] Change `JWT_SECRET` to secure random string
- [ ] Set token expiration appropriate for use case
- [ ] Implement refresh tokens (optional)
- [ ] Add rate limiting on auth endpoints
- [ ] Implement 2FA (optional)
- [ ] Add password reset flow
- [ ] Log authentication attempts
- [ ] Monitor for brute force attacks

---

## 📚 Resources

- [JWT.io](https://jwt.io) - Decode and inspect tokens
- [bcrypt](https://www.npmjs.com/package/bcrypt) - Password hashing
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) - JWT library

---

_Last updated: February 13, 2026_
