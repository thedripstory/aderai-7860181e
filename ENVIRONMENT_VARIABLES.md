# Environment Variables

## Required Variables

### Development (.env)
```env
# Supabase (auto-configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Site URL
VITE_SITE_URL=http://localhost:5173
```

### Production (Cloud Dashboard → Edge Functions → Secrets)

#### Required for Core Functionality
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SITE_URL=https://aderai.io
ENCRYPTION_KEY=your_32_character_encryption_key
```

#### Required for Payments ($9/month subscription)
```env
STRIPE_SECRET_KEY=sk_live_xxx        # Stripe Dashboard → Developers → API Keys
STRIPE_WEBHOOK_SECRET=whsec_xxx      # Stripe Dashboard → Developers → Webhooks
STRIPE_PRICE_ID=price_xxx            # Stripe Dashboard → Products → Your $9/month price
```

#### Required for Email
```env
RESEND_API_KEY=re_xxx                # Resend Dashboard → API Keys
```

#### Required for AI Features
```env
OPENAI_API_KEY=sk-xxx                # OpenAI Platform → API Keys
```

## Stripe Setup Checklist

### 1. Create Stripe Account
- Go to https://dashboard.stripe.com
- Complete account setup for live payments

### 2. Get API Keys
- Go to Developers → API Keys
- Copy the **Secret key** (starts with `sk_live_` for production)
- Add as `STRIPE_SECRET_KEY` in Cloud secrets

### 3. Create Product & Price
- Go to Products → Add Product
- Name: "Aderai Monthly"
- Price: $9.00 USD, Recurring monthly
- Copy the **Price ID** (starts with `price_`)
- Add as `STRIPE_PRICE_ID` in Cloud secrets

### 4. Set Up Webhook
- Go to Developers → Webhooks → Add endpoint
- Endpoint URL: `https://kfsvgcijligxschxyuyb.supabase.co/functions/v1/stripe-webhook`
- Events to send:
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_failed`
- Copy the **Signing secret** (starts with `whsec_`)
- Add as `STRIPE_WEBHOOK_SECRET` in Cloud secrets

### 5. Verify Setup
- Go to /admin/setup in your Aderai app
- All Stripe checks should show green ✓

## How to Set Cloud Secrets

1. Go to your project dashboard
2. Navigate to Edge Functions → Secrets
3. Click "Add Secret"
4. Enter the name (e.g., `STRIPE_SECRET_KEY`)
5. Enter the value
6. Click "Save"

## Generating Encryption Key

To generate a secure 32-character encryption key:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 16
```

## Verification

### Check Frontend Variables
Open browser console and run:
```javascript
console.log({
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  siteUrl: import.meta.env.VITE_SITE_URL,
  projectId: import.meta.env.VITE_SUPABASE_PROJECT_ID
});
```

### Check Edge Function Variables
Go to /admin/setup in your Aderai app to see which variables are configured.

## Troubleshooting

### Payments Not Working
1. Check /admin/setup page for specific issues
2. Verify all 3 Stripe secrets are set
3. Verify webhook URL is correct
4. Check Stripe Dashboard → Developers → Logs

### Webhook Not Receiving Events
1. Verify webhook URL in Stripe Dashboard
2. Check webhook signing secret matches
3. Verify all 4 event types are selected
4. Check Edge Function logs

### "Payment system not configured" Error
- Missing `STRIPE_SECRET_KEY` secret
- Add it in Cloud Dashboard → Edge Functions → Secrets

### "Subscription plan not found" Error
- Missing or invalid `STRIPE_PRICE_ID`
- Create a price in Stripe and add the ID to secrets

### Variables Not Loading
1. Check spelling (case-sensitive)
2. Restart development server
3. Clear browser cache
4. Verify `.env` file location (project root)

### Edge Functions Not Working
1. Verify secrets are set in Cloud dashboard
2. Check Edge Function logs for errors
3. Ensure function is deployed
4. Verify function has access to secrets

### Email Not Sending
1. Verify `RESEND_API_KEY` is set
2. Check Resend dashboard for errors
3. Verify domain is configured in Resend
4. Check SPF/DKIM/DMARC records

## Required Secrets by Feature

### Payment System
- `STRIPE_SECRET_KEY` - Required for all payment operations
- `STRIPE_WEBHOOK_SECRET` - Required for webhook verification
- `STRIPE_PRICE_ID` - Required for subscription checkout

### Email System
- `RESEND_API_KEY` - Required for all transactional emails

### Klaviyo Integration
- `ENCRYPTION_KEY` - Required to encrypt/decrypt API keys

### AI Features
- `OPENAI_API_KEY` - Required for AI segment suggestions

### All Features
- `SITE_URL` - Required for generating links in emails

## Security Notes

- **Never commit** `.env` files to version control
- **Never expose** service role keys in frontend code
- **Always use** encrypted storage for API keys
- **Rotate keys** regularly (every 90 days recommended)
- **Use different keys** for development and production
