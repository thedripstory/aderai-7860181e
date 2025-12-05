# Deployment Guide

## Pre-Deployment Checklist

Before deploying to production, complete these steps:

### 1. Code Quality
- [ ] All TypeScript errors resolved
- [ ] No console.log statements in production code
- [ ] All TODO comments addressed
- [ ] Code formatted and linted
- [ ] Build succeeds without warnings

### 2. Testing
- [ ] Complete TESTING_CHECKLIST.md
- [ ] Test on mobile devices
- [ ] Test on different browsers
- [ ] Test all critical user flows
- [ ] Verify error handling

### 3. Environment Variables
- [ ] All production secrets configured in Cloud dashboard
- [ ] SITE_URL set to production domain
- [ ] RESEND_API_KEY configured
- [ ] ENCRYPTION_KEY generated and set
- [ ] OPENAI_API_KEY configured

### 4. Database
- [ ] All migrations applied
- [ ] RLS policies verified
- [ ] Test data cleaned up
- [ ] Backup strategy in place

### 5. Edge Functions
- [ ] All functions deployed
- [ ] Function logs checked for errors
- [ ] Rate limiting configured
- [ ] Secrets accessible to functions

## Deploy Frontend

Aderai uses **automatic deployment** - no external hosting required!

### Deploy Steps

1. **Click Publish Button**
   - Located in top-right corner of the editor
   - On mobile: Bottom-right when in Preview mode

2. **Review Changes**
   - Check the deployment preview
   - Verify all changes look correct

3. **Click "Update"**
   - Frontend changes go live immediately
   - No additional configuration needed

4. **Verify Deployment**
   - Visit your production URL
   - Test critical user flows
   - Check browser console for errors

### Custom Domain Setup

To use your own domain (e.g., aderai.io):

1. Go to Project Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for SSL certificate to provision (up to 24 hours)

**Note**: Custom domains require a paid plan.

## Deploy Edge Functions

Edge functions deploy **automatically** when you make changes:

1. Edit function code in `supabase/functions/`
2. Functions redeploy automatically on save
3. Check deployment status in Cloud tab
4. Verify function logs show no errors

### Manual Edge Function Deployment

If you need to manually trigger deployment:

1. Go to Cloud → Edge Functions
2. Click on the function you want to redeploy
3. Click "Deploy" button
4. Wait for deployment to complete
5. Check logs for any errors

## Post-Deployment Verification

### Critical Path Testing

1. **User Signup**
   ```
   ✓ Create new account
   ✓ Receive welcome email
   ✓ Profile created in database
   ✓ Redirects to onboarding
   ```

2. **Klaviyo Connection**
   ```
   ✓ Enter API key
   ✓ Key validated
   ✓ Key encrypted and stored
   ✓ Redirects to dashboard
   ```

3. **Segment Creation**
   ```
   ✓ Select segments
   ✓ Create in Klaviyo
   ✓ Segments appear in dashboard
   ✓ Success notification shown
   ```

4. **Analytics Loading**
   ```
   ✓ Charts render correctly
   ✓ Data loads without errors
   ✓ Historical data displays
   ```

### Monitoring

After deployment, monitor these metrics:

1. **Application Health**
   - Go to Cloud → Logs
   - Check for error spikes
   - Monitor response times
   - Verify function execution

2. **User Activity**
   - Check admin dashboard
   - Monitor signup rate
   - Track segment creation
   - Review error logs

3. **Email Delivery**
   - Check Resend dashboard
   - Monitor delivery rate
   - Review bounce rate
   - Track open/click rates

4. **Database Performance**
   - Monitor query performance
   - Check connection pool
   - Review slow queries
   - Verify RLS policies

## Rollback Procedure

If deployment fails or introduces critical bugs:

### Frontend Rollback

1. Go to project history
2. Click "Restore" on previous working version
3. Click "Publish" to deploy
4. Verify rollback successful

### Edge Function Rollback

1. Git checkout previous working commit
2. Functions will automatically redeploy
3. Or manually restore function code in editor
4. Verify function logs show no errors

### Database Rollback

**WARNING**: Database rollbacks are destructive and should be last resort.

1. Go to Cloud → Database
2. Click "Backups"
3. Select backup to restore
4. **This will overwrite current data**
5. Verify restoration successful

## Troubleshooting

### Deployment Fails

1. Check build logs
2. Verify all dependencies installed
3. Check for TypeScript errors
4. Review recent code changes

### Edge Functions Not Working

1. Check function logs in Cloud
2. Verify environment variables set
3. Check function deployment status
4. Test function with curl/Postman

### Database Errors

1. Check database logs
2. Verify RLS policies
3. Check connection limits
4. Review recent migrations

### Email Not Sending

1. Verify RESEND_API_KEY set
2. Check Resend dashboard for errors
3. Verify domain DNS records
4. Check email templates

## Performance Optimization

### After Deployment

1. **Monitor Bundle Size**
   - Check build output
   - Identify large dependencies
   - Consider code splitting

2. **Database Optimization**
   - Add indexes for slow queries
   - Optimize RLS policies
   - Consider read replicas

3. **CDN Optimization**
   - Leverage built-in CDN
   - Optimize images
   - Enable compression

4. **Caching Strategy**
   - Implement segment data caching
   - Cache analytics queries
   - Use service workers for offline

## Security Checklist

After deployment, verify:

- [ ] HTTPS enabled (automatic)
- [ ] CORS configured correctly
- [ ] Rate limiting active
- [ ] Input validation working
- [ ] RLS policies enforced
- [ ] API keys encrypted
- [ ] Error messages don't leak info
- [ ] Admin routes protected
- [ ] Session timeouts working

## Maintenance Schedule

### Daily
- Monitor error logs
- Check system health
- Review user feedback

### Weekly
- Review analytics
- Check email delivery
- Update dependencies
- Review security alerts

### Monthly
- Database performance review
- Security audit
- Backup verification
- Cost optimization

## Emergency Contacts

- **Project Owner**: hello@aderai.io

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Resend Documentation](https://resend.com/docs)
