# 🧪 Testing Guide - Verify All Fixes

## 📋 Testing Checklist

Use this guide to verify that all fixes work correctly.

---

## ✅ TEST 1: Registration Creates New Organization

### Objective
Verify that each registration creates its own isolated organization (multi-tenancy security).

### Steps
1. Ensure backend is running:
   ```bash
   cd backend
   npm run dev
   ```

2. Register a new user:
   ```bash
   POST http://localhost:3000/api/auth/register
   Content-Type: application/json

   {
     "name": "Test User",
     "email": "test1@example.com",
     "password": "password123"
   }
   ```

3. **Verify in response:**
   - ✅ Status 201 Created
   - ✅ Token generated
   - ✅ User created

4. **Verify in database:**
   ```bash
   npx prisma studio
   ```
   - ✅ New organization with name "Test User's Organization"
   - ✅ User with role "ADMIN"
   - ✅ Unique organizationId

### Expected Result
Each registration creates a separate organization. ✅ No data sharing.

---

## ✅ TEST 2: Invite User Respects Limits

### Objective
Verify that `/api/auth/invite` endpoint respects FREE plan limits (2 users).

### Steps
1. Login as admin:
   ```bash
   POST http://localhost:3000/api/auth/login
   Content-Type: application/json

   {
     "email": "admin@acme.com",
     "password": "admin123"
   }
   ```
   **Save the received token**

2. Check current plan:
   ```bash
   GET http://localhost:3000/api/subscription/status
   Authorization: Bearer {your_token}
   ```
   **Should show:** tier: "FREE", limits.maxUsers: 2

3. Count current users:
   ```bash
   # Should show usage.users
   ```

4. **If already 2 users**, try inviting a third:
   ```bash
   POST http://localhost:3000/api/auth/invite
   Authorization: Bearer {admin_token}
   Content-Type: application/json

   {
     "name": "Extra User",
     "email": "extra@acme.com",
     "password": "password123"
   }
   ```

### Expected Result
- ✅ If < 2 users: User created successfully
- ✅ If = 2 users: Error 403 "Limit reached"
- ✅ Welcome email sent (if RESEND_API_KEY configured)

---

## ✅ TEST 3: Create Ticket Sends Email

### Objective
Verify that creating a ticket sends email notification to admins.

### Prerequisite
```bash
# Configure RESEND_API_KEY in backend/.env
RESEND_API_KEY="re_your_real_api_key"
```

### Steps
1. Login as regular user:
   ```bash
   POST http://localhost:3000/api/auth/login
   {
     "email": "employee@acme.com",
     "password": "employee123"
   }
   ```

2. Create ticket:
   ```bash
   POST http://localhost:3000/api/tickets
   Authorization: Bearer {user_token}
   Content-Type: application/json

   {
     "assetId": 1,
     "description": "Screen won't turn on, need urgent support"
   }
   ```

3. **Verify in backend terminal:**
   ```
   ✅ Ticket notification sent to 1 admin(s)
   ```

4. **Verify received email:**
   - To: admin email
   - Subject: "New Ticket Created - {asset name}"
   - Content: Problem description, reported by user

### Expected Result
- ✅ Ticket created with status 200
- ✅ Email sent to ALL admins in organization
- ✅ Console log confirms sending

---

## ✅ TEST 4: PricingPage Shows Current Plan

### Objective
Verify that pricing page correctly shows user's active plan.

### Steps
1. Start frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open http://localhost:5173

3. Login with any user

4. Navigate to "💎 Pricing"

5. **Verify visually:**
   - ✅ FREE plan has green button "✓ Current Plan"
   - ✅ PRO plan has button "Upgrade to Pro"
   - ✅ ENTERPRISE plan has button "Upgrade to Enterprise"

6. **If user has PRO plan:**
   - ✅ PRO plan should show "✓ Current Plan"
   - ✅ FREE plan should show "Downgrade" (if implemented)

### Expected Result
Current plan is visually highlighted and CANNOT be purchased again.

---

## ✅ TEST 5: Stripe Webhook (Simulated)

### Objective
Verify that webhook correctly processes Stripe events.

### Prerequisite
```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login
```

### Steps
1. Start webhook listener:
   ```bash
   stripe listen --forward-to localhost:3000/api/subscription/webhook
   ```
   **Save the webhook secret shown** (starts with `whsec_`)

2. Configure in `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_your_listener_secret"
   ```

3. Restart backend

4. In another terminal, simulate event:
   ```bash
   stripe trigger checkout.session.completed
   ```

5. **Verify in backend terminal:**
   ```
   ✅ Subscription email sent to: [email]
   ```

6. **Verify in database:**
   - subscriptionTier updated
   - subscriptionStatus = 'active'
   - currentPeriodEnd has date

### Expected Result
- ✅ Webhook receives event without errors
- ✅ Database updated
- ✅ Confirmation email sent

---

## ✅ TEST 6: Input Validation

### Objective
Verify that endpoints reject invalid inputs.

### Steps

#### Test 6.1: Create Ticket Without Description
```bash
POST http://localhost:3000/api/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "assetId": 1,
  "description": ""
}
```
**Expected:** ❌ 400 "Description is required"

#### Test 6.2: Create Ticket With Invalid Asset ID
```bash
POST http://localhost:3000/api/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "assetId": "abc",
  "description": "Test"
}
```
**Expected:** ❌ 400 "Invalid asset ID"

#### Test 6.3: Close Already Closed Ticket
```bash
# First close a ticket
PATCH http://localhost:3000/api/tickets/1/close
Authorization: Bearer {admin_token}

# Try closing it again
PATCH http://localhost:3000/api/tickets/1/close
Authorization: Bearer {admin_token}
```
**Expected:** ❌ 400 "Ticket is already closed"

#### Test 6.4: Purchase Current Plan
```bash
POST http://localhost:3000/api/subscription/create-checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "tier": "FREE"
}
```
**Expected:** ❌ 400 "You are already on this plan"

### Expected Result
All error cases return descriptive messages, NO crashes.

---

## ✅ TEST 7: Ticket Limits (FREE Plan)

### Objective
Verify that FREE plan blocks after 10 tickets.

### Steps
1. Login as user on FREE plan

2. Create 10 tickets (adapt loop to your needs):
   ```bash
   # Ticket 1, 2, 3... up to 10
   POST http://localhost:3000/api/tickets
   {
     "assetId": 1,
     "description": "Test ticket #1"
   }
   ```

3. Try creating ticket #11:
   ```bash
   POST http://localhost:3000/api/tickets
   {
     "assetId": 1,
     "description": "Test ticket #11"
   }
   ```

### Expected Result
- ✅ Tickets 1-10: Created successfully
- ✅ Ticket 11: ❌ 403 "Your Free plan allows up to 10 tickets"
- ✅ Message includes currentCount and limit

---

## 📊 Final Checklist

Mark each completed test:

- [ ] ✅ TEST 1: Registration creates new organization
- [ ] ✅ TEST 2: Invite user respects limits
- [ ] ✅ TEST 3: Create ticket sends email
- [ ] ✅ TEST 4: PricingPage shows current plan
- [ ] ✅ TEST 5: Stripe webhook works
- [ ] ✅ TEST 6: Input validation
- [ ] ✅ TEST 7: Ticket limits (FREE plan)

---

## 🐛 Found a Bug?

If any test fails:

1. **Check environment variables:**
   ```bash
   cat backend/.env
   # Must have DATABASE_URL, JWT_SECRET configured
   ```

2. **Review backend logs:**
   ```bash
   # Should show detailed errors in console
   ```

3. **Verify database:**
   ```bash
   npx prisma studio
   # Confirm data is in correct tables
   ```

4. **Confirm migrations applied:**
   ```bash
   npx prisma migrate status
   ```

---

## ✅ All Tests Passed?

**Congratulations! 🎉** Your application is working perfectly with all fixes applied.

You're now ready to:
1. Commit changes
2. Deploy to Railway
3. Configure environment variables in production
4. Test in staging before production

---

_Testing Guide - February 13, 2026_

## 📋 Checklist de Pruebas

Usa esta guía para verificar que todas las correcciones funcionan correctamente.

---

## ✅ TEST 1: Registro Crea Nueva Organización

### Objetivo
Verificar que cada registro crea su propia organización aislada (seguridad multi-tenancy).

### Pasos
1. Asegúrate de que el backend esté corriendo:
   ```bash
   cd backend
   npm run dev
   ```

2. Registra un nuevo usuario:
   ```bash
   POST http://localhost:3000/api/auth/register
   Content-Type: application/json

   {
     "name": "Usuario Test",
     "email": "test1@ejemplo.com",
     "password": "password123"
   }
   ```

3. **Verifica en respuesta:**
   - ✅ Status 201 Created
   - ✅ Token generado
   - ✅ Usuario creado

4. **Verifica en base de datos:**
   ```bash
   npx prisma studio
   ```
   - ✅ Nueva organización con nombre "Usuario Test's Organization"
   - ✅ Usuario con role "ADMIN"
   - ✅ organizationId único

### Resultado Esperado
Cada registro crea una organización separada. ✅ Sin compartir datos.

---

## ✅ TEST 2: Invitar Usuario Respeta Límites

### Objetivo
Verificar que el endpoint `/api/auth/invite` respeta límites del plan FREE (2 usuarios).

### Pasos
1. Login como admin:
   ```bash
   POST http://localhost:3000/api/auth/login
   Content-Type: application/json

   {
     "email": "admin@acme.com",
     "password": "admin123"
   }
   ```
   **Guarda el token recibido**

2. Verifica plan actual:
   ```bash
   GET http://localhost:3000/api/subscription/status
   Authorization: Bearer {tu_token}
   ```
   **Debe mostrar:** tier: "FREE", limits.maxUsers: 2

3. Cuenta usuarios actuales:
   ```bash
   # Debe mostrar usage.users
   ```

4. **Si ya hay 2 usuarios**, intenta invitar un tercero:
   ```bash
   POST http://localhost:3000/api/auth/invite
   Authorization: Bearer {admin_token}
   Content-Type: application/json

   {
     "name": "Usuario Extra",
     "email": "extra@acme.com",
     "password": "password123"
   }
   ```

### Resultado Esperado
- ✅ Si < 2 usuarios: Usuario creado exitosamente
- ✅ Si = 2 usuarios: Error 403 "Limit reached"
- ✅ Email de bienvenida enviado (si RESEND_API_KEY configurado)

---

## ✅ TEST 3: Crear Ticket Envía Email

### Objetivo
Verificar que crear un ticket envía notificación por email a los admins.

### Prerequisito
```bash
# Configura RESEND_API_KEY en backend/.env
RESEND_API_KEY="re_tu_api_key_real"
```

### Pasos
1. Login como usuario regular:
   ```bash
   POST http://localhost:3000/api/auth/login
   {
     "email": "employee@acme.com",
     "password": "employee123"
   }
   ```

2. Crear ticket:
   ```bash
   POST http://localhost:3000/api/tickets
   Authorization: Bearer {user_token}
   Content-Type: application/json

   {
     "assetId": 1,
     "description": "La pantalla no enciende, necesito soporte urgente"
   }
   ```

3. **Verifica en terminal del backend:**
   ```
   ✅ Ticket notification sent to 1 admin(s)
   ```

4. **Verifica email recibido:**
   - Para: admin email
   - Asunto: "New Ticket Created - {asset name}"
   - Contenido: Descripción del problema, usuario reportó

### Resultado Esperado
- ✅ Ticket creado con status 200
- ✅ Email enviado a TODOS los admins de la organización
- ✅ Log en consola confirma envío

---

## ✅ TEST 4: PricingPage Muestra Plan Actual

### Objetivo
Verificar que la página de precios muestra correctamente el plan activo del usuario.

### Pasos
1. Inicia frontend:
   ```bash
   cd frontend
   npm run dev
   ```

2. Abre http://localhost:5173

3. Login con cualquier usuario

4. Navega a "💎 Pricing"

5. **Verifica visualmente:**
   - ✅ Plan FREE tiene botón verde "✓ Current Plan"
   - ✅ Plan PRO tiene botón "Upgrade to Pro"
   - ✅ Plan ENTERPRISE tiene botón "Upgrade to Enterprise"

6. **Si el usuario tiene plan PRO:**
   - ✅ Plan PRO debe mostrar "✓ Current Plan"
   - ✅ Plan FREE debe mostrar "Downgrade" (si implementado)

### Resultado Esperado
El plan actual se resalta visualmente y NO permite comprarlo de nuevo.

---

## ✅ TEST 5: Webhook de Stripe (Simulado)

### Objetivo
Verificar que el webhook procesa correctamente eventos de Stripe.

### Prerequisito
```bash
# Instala Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe

# Login
stripe login
```

### Pasos
1. Inicia listener de webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/subscription/webhook
   ```
   **Guarda el webhook secret que aparece** (empieza con `whsec_`)

2. Configura en `.env`:
   ```bash
   STRIPE_WEBHOOK_SECRET="whsec_tu_secret_del_listener"
   ```

3. Reinicia backend

4. En otra terminal, simula evento:
   ```bash
   stripe trigger checkout.session.completed
   ```

5. **Verifica en terminal del backend:**
   ```
   ✅ Subscription email sent to: [email]
   ```

6. **Verifica en base de datos:**
   - subscriptionTier actualizado
   - subscriptionStatus = 'active'
   - currentPeriodEnd tiene fecha

### Resultado Esperado
- ✅ Webhook recibe evento sin errores
- ✅ Base de datos actualizada
- ✅ Email de confirmación enviado

---

## ✅ TEST 6: Validación de Inputs

### Objetivo
Verificar que los endpoints rechazan inputs inválidos.

### Pasos

#### Test 6.1: Crear Ticket Sin Descripción
```bash
POST http://localhost:3000/api/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "assetId": 1,
  "description": ""
}
```
**Esperado:** ❌ 400 "Description is required"

#### Test 6.2: Crear Ticket Con Asset ID Inválido
```bash
POST http://localhost:3000/api/tickets
Authorization: Bearer {token}
Content-Type: application/json

{
  "assetId": "abc",
  "description": "Test"
}
```
**Esperado:** ❌ 400 "Invalid asset ID"

#### Test 6.3: Cerrar Ticket Ya Cerrado
```bash
# Primero cierra un ticket
PATCH http://localhost:3000/api/tickets/1/close
Authorization: Bearer {admin_token}

# Intenta cerrarlo de nuevo
PATCH http://localhost:3000/api/tickets/1/close
Authorization: Bearer {admin_token}
```
**Esperado:** ❌ 400 "Ticket is already closed"

#### Test 6.4: Comprar Plan Actual
```bash
POST http://localhost:3000/api/subscription/create-checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "tier": "FREE"
}
```
**Esperado:** ❌ 400 "You are already on this plan"

### Resultado Esperado
Todos los casos de error retornan mensajes descriptivos, NO crashes.

---

## ✅ TEST 7: Límites de Tickets (Plan FREE)

### Objetivo
Verificar que el plan FREE bloquea después de 10 tickets.

### Pasos
1. Login como usuario en plan FREE

2. Crea 10 tickets (adapta el loop a tu necesidad):
   ```bash
   # Ticket 1, 2, 3... hasta 10
   POST http://localhost:3000/api/tickets
   {
     "assetId": 1,
     "description": "Test ticket #1"
   }
   ```

3. Intenta crear el ticket #11:
   ```bash
   POST http://localhost:3000/api/tickets
   {
     "assetId": 1,
     "description": "Test ticket #11"
   }
   ```

### Resultado Esperado
- ✅ Tickets 1-10: Creados exitosamente
- ✅ Ticket 11: ❌ 403 "Your Free plan allows up to 10 tickets"
- ✅ Mensaje incluye currentCount y limit

---

## 📊 Checklist Final

Marca cada test completado:

- [ ] ✅ TEST 1: Registro crea nueva organización
- [ ] ✅ TEST 2: Invitar usuario respeta límites
- [ ] ✅ TEST 3: Crear ticket envía email
- [ ] ✅ TEST 4: PricingPage muestra plan actual
- [ ] ✅ TEST 5: Webhook de Stripe funciona
- [ ] ✅ TEST 6: Validación de inputs
- [ ] ✅ TEST 7: Límites de tickets (plan FREE)

---

## 🐛 ¿Encontraste un Bug?

Si algún test falla:

1. **Verifica variables de entorno:**
   ```bash
   cat backend/.env
   # Debe tener DATABASE_URL, JWT_SECRET configurados
   ```

2. **Revisa logs del backend:**
   ```bash
   # Debe mostrar errores detallados en consola
   ```

3. **Verifica base de datos:**
   ```bash
   npx prisma studio
   # Confirma que datos estén en tablas correctas
   ```

4. **Confirma migraciones aplicadas:**
   ```bash
   npx prisma migrate status
   ```

---

## ✅ Todos los Tests Pasaron?

**¡Felicidades! 🎉** Tu aplicación está funcionando perfectamente con todas las correcciones aplicadas.

Ahora estás listo para:
1. Hacer commit de los cambios
2. Deployar a Railway
3. Configurar variables de entorno en producción
4. Probar en staging antes de producción

---

_Guía de Testing - Febrero 13, 2026_
