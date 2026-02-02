# 🚂 Railway Deployment Guide

Esta guía te ayudará a desplegar AssetFlow en Railway de forma gratuita.

## 📋 Pre-requisitos

- Cuenta de GitHub con el repositorio de AssetFlow
- Cuenta de Railway (crear en https://railway.app)
- $5 USD de créditos gratuitos mensuales incluidos en Railway

## 🎯 Paso 1: Preparar el Repositorio

Asegúrate de que todos los cambios estén commiteados:

```bash
git add .
git commit -m "Preparar para deployment en Railway"
git push origin main
```

## 🚀 Paso 2: Crear Proyecto en Railway

1. Ve a https://railway.app y haz login con GitHub
2. Click en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway a acceder a tus repositorios
5. Selecciona el repositorio `assetflow-ticketing-platform`

## 🗄️ Paso 3: Crear Base de Datos PostgreSQL

1. En tu proyecto de Railway, click en "+ New"
2. Selecciona "Database" → "Add PostgreSQL"
3. Railway creará automáticamente una instancia de PostgreSQL
4. La variable `DATABASE_URL` se creará automáticamente

## ⚙️ Paso 4: Configurar Backend

### 4.1 Seleccionar el Servicio Backend

1. Click en el servicio que Railway creó de tu repositorio
2. Ve a "Settings" → "Service"
3. En "Root Directory" escribe: `backend`
4. En "Start Command" escribe: `npm start`

### 4.2 Configurar Variables de Entorno

Ve a "Variables" y agrega las siguientes:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=tu_secreto_super_seguro_aqui_cambiar_en_produccion
NODE_ENV=production
PORT=3000
```

**IMPORTANTE:** 
- `DATABASE_URL` se auto-completa cuando seleccionas la referencia a Postgres
- Cambia `JWT_SECRET` por un string aleatorio seguro (puedes generarlo con: `openssl rand -base64 32`)

### 4.3 Configurar Build

Railway detectará automáticamente el `package.json` y ejecutará:
1. `npm install`
2. `npm run build` (que ejecuta `prisma generate && prisma migrate deploy`)
3. `npm start`

## 🎨 Paso 5: Configurar Frontend

### 5.1 Crear Nuevo Servicio

1. En tu proyecto Railway, click en "+ New"
2. Selecciona "GitHub Repo" → selecciona el mismo repositorio
3. Railway creará un segundo servicio

### 5.2 Configurar el Servicio Frontend

1. Click en el nuevo servicio
2. Ve a "Settings" → "Service"
3. En "Root Directory" escribe: `frontend`
4. En "Build Command" escribe: `npm run build`
5. En "Start Command" escribe: `npm run preview`

### 5.3 Configurar Variables de Entorno

Ve a "Variables" del servicio frontend y agrega:

```
VITE_API_URL=${{backend.url}}/api
```

**IMPORTANTE:** 
- `${{backend.url}}` es una referencia al servicio backend
- Railway reemplazará esto automáticamente con la URL real del backend

## 🌐 Paso 6: Actualizar CORS

Una vez que el frontend esté desplegado:

1. Copia la URL pública del frontend (ej: `https://tu-frontend.up.railway.app`)
2. Ve a las variables de entorno del **backend**
3. Agrega una nueva variable:

```
FRONTEND_URL=https://tu-frontend.up.railway.app
```

4. Railway redesplegará automáticamente el backend

## 📊 Paso 7: Ejecutar Seeds (Opcional)

Para poblar la base de datos con datos de prueba:

1. Ve al servicio **backend** en Railway
2. Click en "Settings" → "Service"
3. Scroll hasta "Deploy Logs" para ver los logs
4. Abre la pestaña "Custom Start Command" temporalmente
5. Cambia el comando a: `npm run seed && npm start`
6. Railway redesplegará y ejecutará el seed
7. **IMPORTANTE:** Después de que termine, vuelve a cambiar el comando a `npm start`

**Alternativa con Railway CLI:**

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar al proyecto
railway link

# Ejecutar seed
railway run npm run seed
```

## ✅ Paso 8: Verificar Deployment

1. Abre la URL del frontend en tu navegador
2. Intenta hacer login con las credenciales de prueba:
   - Email: `admin@acme.com`
   - Password: `admin123`
3. Verifica que puedas ver el dashboard con datos

## 🔧 Solución de Problemas

### Error: "Prisma schema not found"

**Solución:** Verifica que el Root Directory del backend sea `backend`

### Error: "CORS policy"

**Solución:** 
1. Verifica que `FRONTEND_URL` esté configurado en el backend
2. Asegúrate de que la URL no tenga `/` al final
3. Verifica los logs del backend para ver el error exacto

### Error: "Cannot connect to database"

**Solución:**
1. Verifica que `DATABASE_URL` esté configurado en el backend
2. Usa la referencia: `${{Postgres.DATABASE_URL}}`
3. Asegúrate de que el servicio PostgreSQL esté activo

### Error: "Build failed"

**Solución:**
1. Revisa los logs de build en Railway
2. Verifica que `package.json` tenga el script `"build"`
3. Para el backend: `"build": "prisma generate && prisma migrate deploy"`

### Frontend no se conecta al backend

**Solución:**
1. Verifica que `VITE_API_URL` esté configurado: `${{backend.url}}/api`
2. Verifica que el backend esté corriendo (check health endpoint)
3. Abre las DevTools del navegador → Console para ver errores

## 💰 Gestión de Créditos

Railway ofrece **$5 USD gratis al mes**, lo cual es suficiente para:
- 1 servicio backend (Node.js)
- 1 servicio frontend (Vite preview)
- 1 base de datos PostgreSQL (500MB)

**Uso estimado:**
- Backend: ~$3-4/mes
- Frontend: ~$0.50-1/mes
- PostgreSQL: Gratis hasta 500MB

**IMPORTANTE:** Monitorea tu uso en Railway Dashboard → Settings → Usage

## 🔐 Seguridad Post-Deployment

1. **Cambiar JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copia el resultado y actualiza la variable en Railway

2. **Eliminar usuarios de prueba:**
   - Conéctate a la base de datos en producción
   - Elimina los usuarios creados por `seed.js`
   - Crea usuarios reales desde el UI de registro

3. **Configurar límites de rate:**
   - Considera agregar `express-rate-limit` al backend
   - Limita requests por IP para prevenir abuso

## 📚 Recursos Adicionales

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Prisma on Railway](https://docs.railway.app/guides/prisma)
- [Monorepo Setup](https://docs.railway.app/deploy/monorepo)

## 🎉 ¡Listo!

Tu aplicación AssetFlow ahora está desplegada en Railway. Puedes:
- Compartir la URL del frontend con tu equipo
- Monitorear logs en tiempo real en Railway Dashboard
- Escalar verticalmente si necesitas más recursos
- Configurar dominios personalizados (requiere plan Pro)

**URLs importantes:**
- Frontend: `https://tu-frontend.up.railway.app`
- Backend API: `https://tu-backend.up.railway.app/api`
- Dashboard: `https://railway.app/project/tu-proyecto`
