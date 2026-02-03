# 🗄️ Gestión de Base de Datos: Desarrollo vs Producción

## ⚠️ IMPORTANTE: NO Borrar Data en Producción

### 🔴 Lo que NUNCA debes hacer en producción:
```bash
# ❌ NUNCA ejecutar esto en producción
npx prisma migrate reset    # Borra toda la base de datos
npx prisma db push --force-reset  # Borra toda la base de datos
```

---

## 🏗️ Desarrollo (Local)

### ✅ Flujo Normal de Desarrollo

**1. Cambiar el schema:**
```prisma
// Agregar un nuevo campo
model User {
  phoneNumber String?  // ← Nuevo campo opcional
}
```

**2. Crear migración:**
```bash
npx prisma migrate dev --name add_phone_to_users
```
Esto:
- Crea el SQL de migración
- Aplica la migración
- Regenera Prisma Client
- ✅ **NO borra datos** (a menos que uses `--create-only`)

**3. Si necesitas empezar de cero (solo en desarrollo):**
```bash
npx prisma migrate reset
npm run seed
```

### 🔧 Comandos de Desarrollo

| Comando | Qué hace | ¿Borra data? |
|---------|----------|--------------|
| `npx prisma migrate dev` | Crea y aplica migración | No |
| `npx prisma migrate reset` | Borra DB y re-crea todo | ✅ SÍ |
| `npx prisma db push` | Sync schema sin migración | No* |
| `npm run seed` | Puebla DB con datos test | No (usa upsert) |

*`db push` puede borrar data si eliminas columnas

---

## 🚀 Producción

### ✅ Flujo de Despliegue Seguro

**1. En tu local:**
```bash
# Crear la migración (sin aplicarla aún)
npx prisma migrate dev --name add_feature_x
```

**2. Commit y push:**
```bash
git add prisma/migrations
git commit -m "feat: add feature x migration"
git push
```

**3. En el servidor de producción:**
```bash
# Solo aplica migraciones pendientes (NO borra data)
npx prisma migrate deploy
```

### 🔒 Comandos de Producción

| Comando | Qué hace | ¿Borra data? |
|---------|----------|--------------|
| `npx prisma migrate deploy` | Aplica migraciones pendientes | No |
| `npx prisma migrate status` | Verifica migraciones aplicadas | No |

### ❌ **NUNCA** en Producción
```bash
# ❌ Estos comandos SON DESTRUCTIVOS
npx prisma migrate reset
npx prisma migrate dev
npx prisma db push --force-reset
npm run seed  # (a menos que sea el primer deploy)
```

---

## 📊 Migraciones Seguras vs Peligrosas

### ✅ **Migraciones Seguras** (No pierden data)

```prisma
// ✅ Agregar campo opcional
model User {
  phoneNumber String?  // Seguro: nullable
}

// ✅ Agregar campo con default
model User {
  status String @default("active")  // Seguro: tiene default
}

// ✅ Agregar nueva tabla
model Notification {
  id Int @id
}

// ✅ Agregar índice
@@index([email])

// ✅ Agregar relación opcional
organizationId Int?
```

### ⚠️ **Migraciones Que Requieren Cuidado**

```prisma
// ⚠️ Agregar campo requerido sin default
model User {
  phoneNumber String  // ¡Problema! ¿Qué valor para users existentes?
}
```

**Solución:**
```prisma
// Paso 1: Agregar como opcional
phoneNumber String?

// Paso 2: Migrar data manualmente
UPDATE User SET phoneNumber = '000-000-0000' WHERE phoneNumber IS NULL;

// Paso 3: Hacer requerido (nueva migración)
phoneNumber String @default("000-000-0000")
```

### 🔴 **Migraciones Destructivas** (PIERDEN DATA)

```prisma
// 🔴 Eliminar columna
model User {
  // password String  ← Comentado = SE BORRA
}

// 🔴 Eliminar tabla
// model OldTable { }  ← SE BORRA

// 🔴 Cambiar tipo de datos incompatible
email String  →  email Int  // ¡Perderás data!
```

---

## 🎯 Estrategia: Migraciones Aditivas

### Regla de Oro: **Nunca elimines, siempre agrega**

**❌ Mal:**
```prisma
model User {
  // oldField String  ← Eliminado
  newField String
}
```

**✅ Bien:**
```prisma
model User {
  oldField String @default("")  // Deprecado pero no eliminado
  newField String
}
```

Después de 2-3 versiones, cuando estés seguro que nada usa `oldField`, puedes eliminarlo en otra migración.

---

## 🔄 Caso Real: Agregamos Organization

### Lo que hicimos:

```prisma
model User {
  organizationId Int  // ← Campo requerido
  organization Organization @relation(...)
}
```

### ⚠️ Problema:
Si hubiera usuarios existentes en producción, esta migración **FALLARÍA** porque `organizationId` es requerido pero no tiene valor default.

### ✅ Solución Correcta:

**Paso 1: Migración inicial (opcional)**
```prisma
model User {
  organizationId Int?  // ← Opcional primero
}
```

**Paso 2: Script de data migration**
```javascript
// Asignar todos los usuarios a una org default
await prisma.user.updateMany({
  where: { organizationId: null },
  data: { organizationId: 1 }
});
```

**Paso 3: Segunda migración (requerido)**
```prisma
model User {
  organizationId Int  // ← Ahora requerido
}
```

---

## 📝 Seed Script: Solo Primera Vez

### ❌ NO correr seed en cada deploy

El seed (`npm run seed`) está diseñado para:
- ✅ Setup inicial (primera vez)
- ✅ Desarrollo local
- ✅ Tests automatizados
- ❌ NO en producción (después del setup inicial)

### ✅ Alternativa: Data Fixtures

Para datos iniciales en producción, usa un script de "setup" que:
1. Verifica si ya existen datos
2. Solo crea lo necesario
3. No usa `upsert` en producción

**Ejemplo:**
```javascript
// setup-production.js
async function setupProduction() {
  // Verificar si ya hay datos
  const existingOrgs = await prisma.organization.count();
  
  if (existingOrgs > 0) {
    console.log('✅ Production already setup, skipping...');
    return;
  }
  
  // Solo crear si es la primera vez
  console.log('🏗️ Setting up production for first time...');
  // ... crear datos necesarios
}
```

---

## 🚦 Environment Variables

### .env.development (Local PostgreSQL)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/assetflow_dev"
```

### .env.production (Railway)
```env
DATABASE_URL="postgresql://user:pass@host.railway.app:5432/railway"
```

### Scripts en package.json
```json
{
  "scripts": {
    "migrate:dev": "prisma migrate dev",
    "migrate:deploy": "prisma migrate deploy",
    "migrate:status": "prisma migrate status"
  }
}
```

---

## 📋 Checklist de Deployment

### Antes de hacer deploy:

- [ ] Todas las migraciones probadas localmente
- [ ] Migraciones son **aditivas** (no eliminan columnas)
- [ ] Campos requeridos tienen `@default()` o son opcionales
- [ ] Backup de producción creado
- [ ] Variables de entorno configuradas
- [ ] NO usar `migrate reset` en producción
- [ ] Usar `migrate deploy` para aplicar cambios

### Durante el deploy:

```bash
# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Apply migrations (safe)
npx prisma migrate deploy

# 4. Generate Prisma Client
npx prisma generate

# 5. Restart application
pm2 restart app
```

---

## 🔍 Debugging Migraciones

### Ver estado:
```bash
npx prisma migrate status
```

### Ver SQL de una migración:
```bash
cat prisma/migrations/20260201161218_add_organizations/migration.sql
```

### Rollback (solo desarrollo):
```bash
# Borra la última migración de la carpeta
rm -rf prisma/migrations/ultima_migracion
npx prisma migrate reset
```

### Rollback (producción):
❌ **No hay rollback automático**
✅ Debes crear una **nueva migración** que revierta los cambios

---

## 📚 Resumen

| Aspecto | Desarrollo | Producción |
|---------|-----------|-----------|
| Comando principal | `migrate dev` | `migrate deploy` |
| ¿Borra data? | Opcional (reset) | Nunca |
| Seed | Sí, siempre | Solo primera vez |
| Database | PostgreSQL local | PostgreSQL (Railway) |
| Backups | No necesario | ✅ SIEMPRE |
| Rollback | `migrate reset` | Nueva migración |

---

## 💡 Best Practices

1. **Siempre haz backup antes de migraciones en producción**
2. **Prueba migraciones en staging primero**
3. **Usa migraciones aditivas (no destructivas)**
4. **Nunca elimines columnas inmediatamente**
5. **Siempre incluye `@default()` para campos requeridos**
6. **Documenta migraciones complejas con comentarios**
7. **Usa transactions para data migrations**

---

## 🎓 Para Reclutadores

Esta documentación demuestra:
- ✅ Entendimiento de **database lifecycle management**
- ✅ Diferencia entre **dev/staging/prod environments**
- ✅ **Zero-downtime deployments**
- ✅ **Data safety** y prevención de pérdida de datos
- ✅ **Migration strategies** profesionales
- ✅ Experiencia con **ORM migrations** (Prisma)
