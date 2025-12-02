# Aderai Testing Checklist

## Authentication Flow

### New User Signup
- [ ] Can create account with email/password
- [ ] Welcome email is sent
- [ ] Profile is created in database
- [ ] Redirects to onboarding
- [ ] Beta Pioneer achievement awarded

### Sign In
- [ ] Can sign in with valid credentials
- [ ] Error message for invalid credentials
- [ ] Redirects to dashboard after signin
- [ ] Session persists after page refresh

### Password Reset
- [ ] Can request password reset
- [ ] Reset email is sent
- [ ] Can reset password with valid token
- [ ] Can sign in with new password

### Session Timeout
- [ ] Warning appears 5 minutes before timeout
- [ ] Can extend session from warning
- [ ] Auto-logout when session expires
- [ ] Redirects to login after timeout

## Onboarding Flow

### Account Setup
- [ ] Can select account type (brand/agency)
- [ ] Can enter account details
- [ ] Progress bar updates correctly
- [ ] Can skip optional steps

### Klaviyo Setup
- [ ] Can enter Klaviyo API key
- [ ] API key is validated
- [ ] Error shown for invalid key
- [ ] Success message for valid key
- [ ] Key is encrypted in database
- [ ] Redirects to dashboard after completion

## Dashboard

### Main Dashboard
- [ ] Loads without errors
- [ ] Shows correct user data
- [ ] All tabs load correctly
- [ ] No Klaviyo connection banner shows when not connected
- [ ] Banner disappears when connected

### Segments Tab
- [ ] Can view segment list
- [ ] Can search segments
- [ ] Can filter by category
- [ ] Can sort segments
- [ ] Empty state shows when no segments
- [ ] Loading state shows while fetching

### Analytics Tab
- [ ] Charts render correctly
- [ ] Data loads without errors
- [ ] Empty state shows when no data
- [ ] Can switch between time ranges

### Performance Tab
- [ ] Campaign data loads
- [ ] Flow data loads
- [ ] Metrics are accurate
- [ ] Empty state shows when no data

## Segment Creation

### Bulk Creation
- [ ] Can select multiple segments
- [ ] Progress indicator shows during creation
- [ ] Success message shows when complete
- [ ] Segments appear in Klaviyo
- [ ] Segments appear in dashboard
- [ ] Can retry failed segments

### AI Suggestions
- [ ] Can generate AI suggestions
- [ ] Rate limiting works (10 per day)
- [ ] Suggestions are relevant
- [ ] Can create suggested segments
- [ ] Error handling works

### Custom Segments
- [ ] Can create custom segment
- [ ] Validation works on form
- [ ] Segment appears in Klaviyo
- [ ] Segment appears in dashboard

## Admin Features

### Admin Dashboard
- [ ] Only admins can access
- [ ] Non-admins get 403 error
- [ ] All analytics load correctly
- [ ] User management works
- [ ] System health displays correctly

## Error Handling

### Network Errors
- [ ] Offline notification shows when disconnected
- [ ] Online notification shows when reconnected
- [ ] Failed requests retry automatically

### Component Errors
- [ ] Error boundaries catch component crashes
- [ ] User sees friendly error message
- [ ] Can reload page from error state
- [ ] Errors are logged to database

### Validation Errors
- [ ] Form validation works
- [ ] Error messages are helpful
- [ ] Can correct errors and resubmit

## Mobile Responsiveness

### iPhone (375px)
- [ ] Landing page displays correctly
- [ ] Dashboard is usable
- [ ] All buttons are tappable
- [ ] Text is readable
- [ ] Navigation works

### iPad (768px)
- [ ] Layout adapts to tablet size
- [ ] All features are accessible
- [ ] Charts render properly

## Performance

### Load Times
- [ ] Landing page loads in < 2s
- [ ] Dashboard loads in < 3s
- [ ] No console errors
- [ ] No memory leaks

### Interactions
- [ ] Buttons respond immediately
- [ ] Animations are smooth
- [ ] No lag when typing
- [ ] Segment creation completes in reasonable time

## Security

### Authentication
- [ ] Sessions expire correctly
- [ ] Can't access protected routes when logged out
- [ ] Can't access login when logged in

### API Security
- [ ] Rate limiting works
- [ ] Input validation rejects invalid data
- [ ] Klaviyo keys are encrypted
- [ ] Error messages don't leak sensitive info

### Admin Security
- [ ] Only admins can access admin routes
- [ ] Privilege escalation is not possible
- [ ] Audit log captures admin actions

## Email System

### Welcome Email
- [ ] Sends on signup
- [ ] Has correct branding
- [ ] Links work correctly
- [ ] Tracking works

### Notification Emails
- [ ] Milestone emails send
- [ ] Password reset emails send
- [ ] Email preferences are respected

## Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

## Final Checks

- [ ] No console errors in production
- [ ] All environment variables set
- [ ] SSL certificate valid
- [ ] Analytics tracking works
- [ ] Error logging works
- [ ] Backup strategy in place
