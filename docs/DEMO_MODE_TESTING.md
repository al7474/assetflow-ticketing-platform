# Demo Mode Testing Guide

This document provides a comprehensive testing checklist for the Demo Mode functionality.

## 🎯 What Was Fixed

### 1. ✅ BillingPage - Fixed Stripe Portal Button
**Problem:** "Manage Billing" button tried to call Stripe API and failed  
**Solution:** Removed Stripe portal button, replaced with single "Upgrade/Downgrade" button pointing to Pricing page  
**Visual:** Added demo mode banner at top of billing page

### 2. ✅ Downgrade Support Added
**Problem:** Could only upgrade, not downgrade to FREE  
**Solution:** Modified `/api/subscription/demo-upgrade` to accept FREE, PRO, and ENTERPRISE  
**Logic:** FREE = downgrade, sets status to 'canceled', removes period end

### 3. ✅ Improved UX Messages
**Problem:** Generic alerts  
**Solution:** Dynamic messages showing "upgraded", "downgraded", or "changed" based on tier movement

### 4. ✅ Better Button Labels
**Problem:** Confusing button text  
**Solution:**
- "⬆️ Upgrade to Pro/Enterprise" (going up)
- "⬇️ Downgrade to Free/Pro" (going down)
- "✓ Current Plan" (already on plan)

## 🧪 Complete Testing Checklist

### Test 1: FREE → PRO Upgrade
1. Login as FREE user
2. Go to Pricing page
3. Verify banner shows "🚀 Demo Mode Active"
4. Click "Upgrade to Pro"
5. ✅ **Expected:** Alert "Successfully upgraded to PRO plan"
6. ✅ **Expected:** Button changes to "✓ Current Plan"
7. Go to Billing page
8. ✅ **Expected:** Shows "Pro Plan", "$29 per month", renewal date
9. ✅ **Expected:** Usage bars show for 50 assets, unlimited tickets, 10 users

### Test 2: PRO → ENTERPRISE Upgrade
1. Start from PRO plan (from Test 1)
2. Go to Pricing page
3. Click "Upgrade to Enterprise" on ENTERPRISE card
4. ✅ **Expected:** Alert "Successfully upgraded to ENTERPRISE plan"
5. Go to Billing page
6. ✅ **Expected:** Shows "Enterprise Plan", "$99 per month"
7. ✅ **Expected:** All usage shows "∞ unlimited"

### Test 3: ENTERPRISE → PRO Downgrade
1. Start from ENTERPRISE plan (from Test 2)
2. Go to Pricing page
3. Click "⬇️ Downgrade to Pro" on PRO card
4. ✅ **Expected:** Alert "Successfully downgraded to PRO plan"
5. Go to Billing page
6. ✅ **Expected:** Shows "Pro Plan", limits restored (50 assets, 10 users)

### Test 4: PRO → FREE Downgrade
1. Start from PRO plan (from Test 3)
2. Go to Pricing page
3. Click "⬇️ Downgrade to Free" on FREE card
4. ✅ **Expected:** Alert "Successfully downgraded to FREE plan"
5. Go to Billing page
6. ✅ **Expected:** Shows "Free Plan", "$0 forever"
7. ✅ **Expected:** Status: "canceled", no renewal date
8. ✅ **Expected:** Limits: 5 assets, 10 tickets, 2 users

### Test 5: Click Current Plan
1. On any tier
2. Go to Pricing page
3. Click button on current plan card
4. ✅ **Expected:** Alert "ℹ️ You are already on this plan"
5. ✅ **Expected:** No changes made

### Test 6: Dashboard (Admin Only)
1. Login as ADMIN user
2. Go to Dashboard
3. ✅ **Expected:** See analytics charts:
   - Summary cards (total tickets, open, closed, assets)
   - Bar chart: Tickets by Asset
   - Line chart: Tickets timeline (last 7 days)
4. Create a new ticket
5. Refresh Dashboard
6. ✅ **Expected:** Charts update with new data

### Test 7: Billing Page Demo Banner
1. Go to Billing page on any plan
2. ✅ **Expected:** Blue/purple gradient banner at top
3. ✅ **Expected:** Text: "🚀 Demo Mode - Instant upgrades & downgrades available"
4. ✅ **Expected:** Single button "⬆️ Upgrade Plan" or "⬆️ Upgrade or ⬇️ Downgrade"

### Test 8: Subscription Limits Enforcement
1. On FREE plan (5 assets, 10 tickets, 2 users)
2. Try to create 11th ticket
3. ✅ **Expected:** Error "Limit reached. Your Free plan allows up to 10 tickets"
4. Upgrade to PRO
5. Try to create 11th ticket
6. ✅ **Expected:** Success (unlimited tickets on PRO)

### Test 9: Email Notifications
1. Upgrade to PRO plan
2. Check backend terminal logs
3. ✅ **Expected:** See log "⚠️ RESEND_API_KEY not configured, skipping email"
4. ✅ **Expected:** No crash, graceful degradation
5. When RESEND_API_KEY is configured:
   - ✅ Receive email: "Subscription Confirmed - PRO Plan"

### Test 10: Multi-tenancy Isolation
1. Register new organization (Org A)
2. Upgrade to PRO
3. Register another organization (Org B) in incognito window
4. ✅ **Expected:** Org B starts at FREE plan
5. ✅ **Expected:** Org A remains on PRO plan
6. ✅ **Expected:** Plans are independent

## 📊 Test Results Template

Copy this for testing session:

```
Date: ___________
Tester: ___________

✅ Test 1: FREE → PRO Upgrade: PASS / FAIL
✅ Test 2: PRO → ENTERPRISE Upgrade: PASS / FAIL
✅ Test 3: ENTERPRISE → PRO Downgrade: PASS / FAIL
✅ Test 4: PRO → FREE Downgrade: PASS / FAIL
✅ Test 5: Click Current Plan: PASS / FAIL
✅ Test 6: Dashboard Analytics: PASS / FAIL
✅ Test 7: Billing Page Banner: PASS / FAIL
✅ Test 8: Limit Enforcement: PASS / FAIL
✅ Test 9: Email Notifications: PASS / FAIL
✅ Test 10: Multi-tenancy: PASS / FAIL

Notes:
_________________________________
```

## 🐛 Known Limitations (By Design)

1. **No real payment processing** - This is demo mode, Stripe not integrated
2. **Emails don't send** - RESEND_API_KEY not configured (graceful degradation)
3. **Instant changes** - Real Stripe would take seconds/minutes for webhook
4. **No billing history** - Would require Stripe Customer Portal

## 🚀 Production Readiness

To enable real payments in production:

1. Configure Stripe keys in `.env`:
   ```
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PRO_PRICE_ID=price_...
   STRIPE_ENTERPRISE_PRICE_ID=price_...
   ```

2. In frontend, change endpoint:
   ```javascript
   // From:
   ${API_URL}/api/subscription/demo-upgrade
   
   // To:
   ${API_URL}/api/subscription/create-checkout
   ```

3. Remove demo mode banners

4. Test with Stripe test cards: `4242 4242 4242 4242`

## ✅ Success Criteria

All tests should PASS:
- Upgrades work ✅
- Downgrades work ✅
- Limits enforced ✅
- UI updates correctly ✅
- Multi-tenancy isolated ✅
- No crashes or errors ✅

**Status:** Ready for portfolio deployment 🎉
