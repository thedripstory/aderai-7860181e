# Environment Variables

## Required Variables

### Development (.env)
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id

# Site URL
VITE_SITE_URL=http://localhost:5173
```

### Production (Supabase Dashboard → Edge Functions → Secrets)
```env
# Supabase (set automatically by Lovable Cloud)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Site URL
SITE_URL=https://aderai.io

# Encryption
ENCRYPTION_KEY=your_32_character_encryption_key

# OpenAI (for AI suggestions)
OPENAI_API_KEY=your_openai_api_key
```

## How to Set

### Development

1. Variables are automatically set by Lovable Cloud
2. No manual configuration needed for development

### Production

1. Go to Lovable Dashboard
2. Click on your project
3. Go to Settings → Integrations → Lovable Cloud
4. Click "Manage Secrets"
5. Add each secret with name and value:
   - `RESEND_API_KEY` - Your Resend API key for sending emails
   - `ENCRYPTION_KEY` - 32-character random string for encrypting Klaviyo keys
   - `OPENAI_API_KEY` - Your OpenAI API key for AI features
   - `SITE_URL` - Your production domain (e.g., https://aderai.io)

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
In Lovable Dashboard:
1. Go to Cloud → Edge Functions
2. Click on any function
3. Check "Environment Variables" section
4. Verify all required secrets are listed

## Security Notes

- **Never commit** `.env` files to version control
- **Never expose** service role keys in frontend code
- **Always use** encrypted storage for API keys
- **Rotate keys** regularly (every 90 days recommended)
- **Use different keys** for development and production

## Troubleshooting

### Variables Not Loading
1. Check spelling (case-sensitive)
2. Restart development server
3. Clear browser cache
4. Verify `.env` file location (project root)

### Edge Functions Not Working
1. Verify secrets are set in Lovable Cloud
2. Check Edge Function logs for errors
3. Ensure function is deployed
4. Verify function has access to secrets

### Email Not Sending
1. Verify `RESEND_API_KEY` is set
2. Check Resend dashboard for errors
3. Verify domain is configured in Resend
4. Check SPF/DKIM/DMARC records

## Required Secrets by Feature

### Email System
- `RESEND_API_KEY` - Required for all transactional emails

### Klaviyo Integration
- `ENCRYPTION_KEY` - Required to encrypt/decrypt API keys

### AI Features
- `OPENAI_API_KEY` - Required for AI segment suggestions

### All Features
- `SITE_URL` - Required for generating links in emails
