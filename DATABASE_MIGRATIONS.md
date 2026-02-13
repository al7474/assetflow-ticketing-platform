# 🗄️ Database Management: Development vs Production

## ⚠️ IMPORTANT: NEVER Delete Data in Production

### 🔴 What you should NEVER do in production:
```bash
# ❌ NEVER run these in production
npx prisma migrate reset    # Deletes entire database
npx prisma db push --force-reset  # Deletes entire database
```

---

## 🏗️ Development (Local)

### ✅ Normal Development Flow

**1. Change the schema:**
```prisma
// Add a new field
model User {
  phoneNumber String?  // ← New optional field
}
```

**2. Create migration:**
```bash
npx prisma migrate dev --name add_phone_to_users
```
This:
- Creates migration SQL
- Applies the migration
- Regenerates Prisma Client
- ✅ **Does NOT delete data** (unless you use `--create-only`)

**3. If you need to start fresh (only in development):**
```bash
npx prisma migrate reset
npm run seed
```

### 🔧 Development Commands

| Command | What it does | Deletes data? |
|---------|--------------|---------------|
| `npx prisma migrate dev` | Creates and applies migration | No |
| `npx prisma migrate reset` | Deletes DB and recreates everything | ✅ YES |
| `npx prisma db push` | Syncs schema without migration | No* |
| `npm run seed` | Populates DB with test data | No (uses upsert) |

*`db push` can delete data if you remove fields or change types incompatibly.

---

## 🚀 Production (Railway)

### ✅ Safe Production Workflow

**1. Make schema changes locally:**
```prisma
// In development
model User {
  phoneNumber String?
}
```

**2. Create migration locally:**
```bash
npx prisma migrate dev --name add_phone_to_users
```
This creates a file in `prisma/migrations/`

**3. Test locally:**
```bash
# Verify migration works
npm run dev
# Test the new field
```

**4. Commit migration:**
```bash
git add prisma/migrations/
git commit -m "Add phoneNumber field to User"
```

**5. Deploy to Railway:**
```bash
git push
```

**6. Railway auto-runs:**
```bash
npx prisma migrate deploy
```
This applies pending migrations to production DB.

---

## 📋 Migration Best Practices

### ✅ DO:

1. **Always use migrations in production**
   ```bash
   npx prisma migrate deploy
   ```

2. **Test migrations locally first**
   ```bash
   npx prisma migrate dev
   # Test thoroughly
   ```

3. **Make backwards-compatible changes**
   ```prisma
   // ✅ GOOD: Optional field
   model User {
     phoneNumber String?
   }
   ```

4. **Write data migration scripts** if needed
   ```javascript
   // scripts/migrate-data.js
   const { PrismaClient } = require('@prisma/client');
   const prisma = new PrismaClient();
   
   async function main() {
     // Update existing records
     await prisma.user.updateMany({
       where: { phoneNumber: null },
       data: { phoneNumber: '' }
     });
   }
   ```

### ❌ DON'T:

1. **Don't remove required fields without data migration**
   ```prisma
   // ❌ BAD: Removes field with data
   model User {
     // phoneNumber String  ← Removed!
   }
   ```

2. **Don't change field types incompatibly**
   ```prisma
   // ❌ BAD: String to Int without migration
   model User {
     age Int // Was String before
   }
   ```

3. **Don't use `db push` in production**
   ```bash
   # ❌ AVOID in production
   npx prisma db push
   ```

4. **Don't edit migration files manually**
   ```sql
   -- ❌ DON'T edit these after creation
   -- migrations/20240101_add_field/migration.sql
   ```

---

## 🔄 Common Scenarios

### Scenario 1: Add Optional Field

**Schema Change:**
```prisma
model User {
  phoneNumber String?  // Optional
}
```

**Commands:**
```bash
# Development
npx prisma migrate dev --name add_phone_number

# Production (via Railway deploy)
# Automatically runs: npx prisma migrate deploy
```

**Result:** ✅ Safe, no data loss

---

### Scenario 2: Add Required Field (Existing Data)

**Schema Change:**
```prisma
model User {
  phoneNumber String  // Required!
}
```

**Problem:** Existing users don't have phone numbers!

**Solution:**

1. **First migration: Add optional**
   ```prisma
   phoneNumber String?
   ```

2. **Run data migration:**
   ```javascript
   await prisma.user.updateMany({
     where: { phoneNumber: null },
     data: { phoneNumber: 'N/A' }
   });
   ```

3. **Second migration: Make required**
   ```prisma
   phoneNumber String
   ```

---

### Scenario 3: Rename Field

**Don't:**
```prisma
model User {
  // name String         ← Removed
  fullName String        // ← Added
}
```
This loses data!

**Do:**
```bash
npx prisma migrate dev --create-only --name rename_name_to_fullname
```

Then edit the migration:
```sql
-- Rename instead of drop/add
ALTER TABLE "User" RENAME COLUMN "name" TO "fullName";
```

---

## 📊 Migration Status

### Check Migration Status
```bash
npx prisma migrate status
```

Output:
```
Database schema is up to date!

The following migrations are applied:
20240101120000_init
20240102130000_add_subscription_fields
```

### If Migrations are Pending
```bash
# Apply pending migrations
npx prisma migrate deploy
```

---

## 🐛 Troubleshooting

### "Migration failed"

**Check:**
1. Database connection
2. Migration SQL syntax
3. Data constraints

**Fix:**
```bash
# Mark migration as rolled back
npx prisma migrate resolve --rolled-back {migration_name}

# Fix the issue
# Try again
npx prisma migrate deploy
```

### "Drift detected"

Schema doesn't match migrations.

**In Development:**
```bash
npx prisma db push
```

**In Production:**
```bash
# Create migration to sync
npx prisma migrate dev
```

### "Database is locked"

Another process is using the database.

**Solution:**
```bash
# Wait or kill other connections
# Then retry
```

---

## 📚 Railway-Specific Notes

### Auto-Deploy on Push

Railway automatically runs:
```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate deploy

# Start app
npm start
```

### Check Logs

See migration results:
```
Railway Dashboard → Deployments → Logs
```

Look for:
```
✓ Prisma migrate deploy completed
Applied migration 20240101_add_field
```

---

## 🎯 Production Deployment Checklist

Before deploying schema changes:

- [ ] Schema changes committed
- [ ] Migrations created locally
- [ ] Migrations tested in development
- [ ] Backwards compatibility verified
- [ ] Data migration script ready (if needed)
- [ ] Backup created (optional, Railway auto-backups)
- [ ] Deployed to Railway
- [ ] Migration logs checked
- [ ] Application tested

---

## 🔐 Environment Variables

Required for migrations:

```bash
# Railway (Production)
DATABASE_URL="postgresql://..."

# Local (.env)
DATABASE_URL="postgresql://postgres:password@localhost:5432/assetflow_dev"
```

---

## 📖 Further Reading

- [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Railway Docs](https://docs.railway.app/databases/postgresql)
- [Database Migration Best Practices](https://www.prisma.io/docs/guides/database/production-migrations)

---

_Last updated: February 13, 2026_
