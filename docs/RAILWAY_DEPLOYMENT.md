# 🚂 Railway Deployment Guide

This guide will help you deploy AssetFlow to Railway for free.

## 📋 Prerequisites

- GitHub account with AssetFlow repository
- Railway account (create at https://railway.app)
- $5 USD free monthly credits included with Railway

## 🎯 Step 1: Prepare Repository

Ensure all changes are committed:

```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

## 🚀 Step 2: Create Railway Project

1. Go to https://railway.app and login with GitHub
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your repositories
5. Select the `assetflow-ticketing-platform` repository

## 🗄️ Step 3: Create PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. The `DATABASE_URL` variable will be created automatically

## ⚙️ Step 4: Configure Backend

### 4.1 Select Backend Service

1. Click on the service Railway created from your repository
2. Go to "Settings" → "Service"
3. In "Root Directory" enter: `backend`
4. In "Start Command" enter: `npm start`

### 4.2 Configure Environment Variables

Go to "Variables" and add the following:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your_super_secure_secret_here_change_in_production
NODE_ENV=production
PORT=3000
FRONTEND_URL=${{frontend.url}}
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
STRIPE_PRO_PRICE_ID=price_your_pro_id
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_id
RESEND_API_KEY=re_your_resend_key
```

**IMPORTANT:** 
- `DATABASE_URL` autoCompletes when you select the Postgres reference
- Change `JWT_SECRET` to a secure random string (generate with: `openssl rand -base64 32`)
- Configure Stripe keys from your Stripe dashboard
- Get Resend API key from https://resend.com

### 4.3 Configure Build

Railway will automatically detect `package.json` and run:
1. `npm install`
2. `npm run build` (which runs `prisma generate && prisma migrate deploy`)
3. `npm start`

## 🎨 Step 5: Configure Frontend

### 5.1 Create New Service

1. In your Railway project, click "+ New"
2. Select "GitHub Repo" → select the same repository
3. Railway will create a second service

### 5.2 Configure Frontend Service

1. Click on the new service
2. Go to "Settings" → "Service"
3. In "Root Directory" enter: `frontend`
4. In "Build Command" enter: `npm run build`
5. In "Start Command" enter: `npm run preview`

### 5.3 Configure Environment Variables

Go to "Variables" in the frontend service and add:

```
VITE_API_URL=${{backend.url}}/api
```

**IMPORTANT:** 
- `${{backend.url}}` is a reference to the backend service
- Railway will automatically replace this with the real backend URL

## 🌐 Step 6: Update CORS

Once the frontend is deployed:

1. Copy the public frontend URL (e.g., `https://your-frontend.up.railway.app`)
2. Go to the **backend** environment variables
3. Add a new variable:

```
FRONTEND_URL=https://your-frontend.up.railway.app
```

4. Railway will automatically redeploy the backend

## 📊 Step 7: Run Seeds (Optional)

To populate the database with test data:

1. Go to the **backend** service in Railway
2. Click "Settings" → "Service"
3. Scroll to "Deploy Logs" to view logs
4. Temporarily open "Custom Start Command" tab
5. Change the command to: `npm run seed && npm start`
6. Railway will redeploy and run the seed
7. **IMPORTANT:** After it finishes, change the command back to `npm start`

**Alternative with Railway CLI:**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Connect to project
railway link

# Run seed
railway run npm run seed
```

## ✅ Step 8: Verify Deployment

1. Open the frontend URL in your browser
2. Try logging in with test credentials:
   - Email: `admin@acme.com`
   - Password: `admin123`
3. Verify you can see the dashboard with data

## 🔧 Troubleshooting

### Error: "Prisma schema not found"

**Solution:** Verify the backend Root Directory is `backend`

### Error: "CORS policy"

**Solution:** 
1. Verify `FRONTEND_URL` is configured in the backend
2. Ensure the URL doesn't have a trailing `/`
3. Check backend logs for the exact error

### Error: "Cannot connect to database"

**Solution:**
1. Verify `DATABASE_URL` is configured in the backend
2. Use the reference: `${{Postgres.DATABASE_URL}}`
3. Ensure the PostgreSQL service is active

### Error: "Build failed"

**Solution:**
1. Review build logs in Railway
2. Verify `package.json` has the `"build"` script
3. For backend: `"build": "prisma generate && prisma migrate deploy"`

### Frontend doesn't connect to backend

**Solution:**
1. Verify `VITE_API_URL` is configured: `${{backend.url}}/api`
2. Verify the backend is running (check health endpoint)
3. Open browser DevTools → Console to see errors

## 💰 Credit Management

Railway offers **$5 USD free per month**, which is enough for:
- 1 backend service (Node.js)
- 1 frontend service (Vite preview)
- 1 PostgreSQL database (500MB)

**Estimated usage:**
- Backend: ~$3-4/month
- Frontend: ~$0.50-1/month
- PostgreSQL: Free up to 500MB

**IMPORTANT:** Monitor your usage in Railway Dashboard → Settings → Usage

## 🔐 Post-Deployment Security

1. **Change JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Copy the result and update the variable in Railway

2. **Remove test users:**
   - Connect to production database
   - Delete users created by `seed.js`
   - Create real users from registration UI

3. **Configure rate limits:**
   - Consider adding `express-rate-limit` to backend
   - Limit requests per IP to prevent abuse

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Railway CLI](https://docs.railway.app/develop/cli)
- [Prisma on Railway](https://docs.railway.app/guides/prisma)
- [Monorepo Setup](https://docs.railway.app/deploy/monorepo)

## 🎉 Done!

Your AssetFlow application is now deployed on Railway. You can:
- Share the frontend URL with your team
- Monitor logs in real-time in Railway Dashboard
- Scale vertically if you need more resources
- Configure custom domains (requires Pro plan)

**Important URLs:**
- Frontend: `https://your-frontend.up.railway.app`
- Backend API: `https://your-backend.up.railway.app/api`
- Dashboard: `https://railway.app/project/your-project`

---

_Last updated: February 13, 2026_
