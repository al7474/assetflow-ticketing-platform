# 🔐 Autenticación con JWT + Roles - Guía de Implementación

## ✅ Implementado

### Backend

#### 1. **Prisma Schema** ([backend/prisma/schema.prisma](backend/prisma/schema.prisma))
```prisma
model User {
  password  String   // Hashed password
  createdAt DateTime @default(now())
}
```

#### 2. **Middleware de Autenticación** ([backend/middleware/auth.js](backend/middleware/auth.js))
- `authenticateToken`: Verifica JWT en headers
- `requireAdmin`: Verifica rol de administrador

#### 3. **Utilidades de Auth** ([backend/utils/auth.js](backend/utils/auth.js))
- `hashPassword()`: Hashea contraseñas con bcrypt
- `comparePassword()`: Compara contraseña con hash
- `generateToken()`: Genera JWT token (expira en 7 días)

#### 4. **Endpoints de Autenticación** ([backend/index.js](backend/index.js))
- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario actual (protegido)

#### 5. **Rutas Protegidas**
Todas las rutas ahora requieren autenticación:
- `GET /api/assets` - Requiere token JWT
- `POST /api/tickets` - Requiere token JWT (usa ID del usuario autenticado)
- `GET /api/tickets` - Requiere token JWT + rol ADMIN
- `PATCH /api/tickets/:id/close` - Requiere token JWT + rol ADMIN

### Frontend

#### 1. **AuthContext** ([frontend/src/context/AuthContext.jsx](frontend/src/context/AuthContext.jsx))
Provee:
- `user` - Usuario actual
- `loading` - Estado de carga
- `login(email, password)` - Función de login
- `register(name, email, password)` - Función de registro
- `logout()` - Función de logout
- `isAdmin` - Booleano si es admin
- `isAuthenticated` - Booleano si está autenticado

#### 2. **Componentes de Auth**
- [Login.jsx](frontend/src/components/Login.jsx) - Formulario de inicio de sesión
- [Register.jsx](frontend/src/components/Register.jsx) - Formulario de registro

#### 3. **Axios Interceptor** ([frontend/src/api/client.js](frontend/src/api/client.js))
Automáticamente agrega el token JWT a todas las peticiones:
```javascript
Authorization: Bearer <token>
```

#### 4. **App.jsx actualizado**
- Muestra Login/Register si no está autenticado
- Solo muestra panel Admin si `isAdmin === true`
- Botón de logout
- Muestra nombre del usuario

## 🧪 Usuarios de Prueba

Después de ejecutar `npm run seed`:

| Email | Password | Rol |
|-------|----------|-----|
| admin@assetflow.com | admin123 | ADMIN |
| employee@assetflow.com | employee123 | EMPLOYEE |

## 🚀 Cómo Probarlo

### 1. Inicia el backend
```bash
cd backend
npm run dev
```

### 2. Inicia el frontend
```bash
cd frontend
npm run dev
```

### 3. Abre http://localhost:5173

### 4. Prueba diferentes escenarios:

**Como Employee:**
1. Login con `employee@assetflow.com / employee123`
2. ✅ Puede ver assets
3. ✅ Puede crear tickets
4. ❌ NO ve el panel de Admin

**Como Admin:**
1. Login con `admin@assetflow.com / admin123`
2. ✅ Puede ver assets
3. ✅ Puede crear tickets
4. ✅ SÍ ve el panel de Admin
5. ✅ Puede cerrar tickets

## 🔒 Características de Seguridad

1. **Passwords Hasheados**: Usa bcrypt con 10 salt rounds
2. **JWT Tokens**: Expiran en 7 días
3. **Protected Routes**: Middleware verifica token en cada request
4. **Role-Based Access Control (RBAC)**: Solo admins pueden ver/cerrar tickets
5. **Validación de Input**: Email, password mínimo 6 caracteres
6. **Error Handling**: Mensajes de error apropiados sin exponer detalles

## 📝 Variables de Entorno

Crea `.env` en `backend/`:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

⚠️ **IMPORTANTE**: Cambia `JWT_SECRET` en producción!

## 🔄 Flujo de Autenticación

```
1. Usuario hace login → POST /api/auth/login
2. Backend valida credenciales → bcrypt.compare()
3. Backend genera JWT → jwt.sign()
4. Frontend guarda token → localStorage.setItem('token')
5. Axios agrega token a requests → Authorization: Bearer <token>
6. Middleware verifica token → jwt.verify()
7. Request continúa con req.user = { id, email, role }
```

## 📚 Próximos Pasos Recomendados

Para llevar esto a un nivel SaaS profesional:

1. ✅ **Autenticación con JWT + Roles** ← YA IMPLEMENTADO
2. ⏭️ **Multi-tenancy** (Organizaciones)
3. ⏭️ **Sistema de Suscripciones** (Stripe)
4. ⏭️ **Dashboard con Analytics**
5. ⏭️ **Testing** (Jest + Vitest)
6. ⏭️ **CI/CD** (GitHub Actions)

## 🐛 Debugging

Si tienes problemas:

1. **401 Unauthorized**: Token inválido o expirado → Logout y login nuevamente
2. **403 Forbidden**: Usuario no tiene permisos → Verifica rol del usuario
3. **Network Error**: Backend no está corriendo → `cd backend && npm run dev`

## 📖 API Testing con curl

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@test.com","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@assetflow.com","password":"admin123"}'

# Get assets (con token)
curl http://localhost:3000/api/assets \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```
