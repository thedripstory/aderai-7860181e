// Help articles content data
export const helpArticlesData = [
  // Getting Started
  {
    slug: 'connect-klaviyo',
    title: 'How to connect your Klaviyo account',
    category: 'Getting Started',
    excerpt: 'Learn how to securely connect your Klaviyo account to start creating segments',
    order_index: 1,
    content: `# How to connect your Klaviyo account

## Step 1: Get your Klaviyo API Key

1. Log in to your Klaviyo account
2. Navigate to **Account** → **Settings** → **API Keys**
3. Click **Create Private API Key**
4. Give it a name like "Segment Portal"
5. Select **Full Access** for permissions
6. Copy the generated API key

## Step 2: Add to Segment Portal

1. Go to the **Settings** page in Segment Portal
2. Click **Add New Client** or **Add Klaviyo Key**
3. Paste your API key
4. Enter a client name (e.g., "Main Store")
5. Click **Save**

## Step 3: Configure Settings

After adding your key, you can customize:
- Currency and symbol
- Customer lifecycle thresholds
- Average order value
- VIP thresholds

Your Klaviyo account is now connected and ready to create segments!`
  },
  {
    slug: 'first-segment',
    title: 'Creating your first segment',
    category: 'Getting Started',
    excerpt: 'Step-by-step guide to creating your first customer segment',
    order_index: 2,
    content: `# Creating your first segment

## Choose Your Method

There are three ways to create segments:

### 1. Pre-built Segments (Recommended)
- Browse 70+ ready-to-use segments
- Select segments that match your goals
- Click **Create Selected Segments**

### 2. Segment Bundles
- Choose pre-configured bundles like "New Customer Welcome Series"
- All relevant segments created at once
- Perfect for specific campaigns

### 3. AI Suggestions
- Describe your business goal
- Get personalized segment recommendations
- AI creates custom segments based on your needs

## What Happens Next?

1. Segments are created in your Klaviyo account
2. Profiles automatically populate based on criteria
3. You can view segment performance in Analytics
4. Use segments in campaigns and flows

## Best Practices

- Start with 5-10 segments focused on your immediate goals
- Review segment definitions before creating
- Check Analytics tab to see segment performance
- Refine based on actual customer behavior`
  },
  {
    slug: 'segment-bundles',
    title: 'Understanding segment bundles',
    category: 'Getting Started',
    excerpt: 'Learn how segment bundles help you launch complete campaigns faster',
    order_index: 3,
    content: `# Understanding segment bundles

## What are Segment Bundles?

Segment bundles are pre-configured collections of segments designed for specific marketing strategies. Instead of selecting individual segments, bundles give you everything you need for a complete campaign.

## Available Bundles

### New Customer Welcome Series
Perfect for onboarding new customers with:
- New Customers (Last 30 Days)
- First-time Buyers
- Recently Engaged but Not Purchased

### Win-Back Campaigns
Re-engage inactive customers with:
- Lapsed Customers (90+ Days)
- Churned Customers (180+ Days)
- Previously Engaged, Now Inactive

### VIP & Loyalty Programs
Reward your best customers:
- VIP Customers (High Lifetime Value)
- Repeat Customers (3+ Purchases)
- High-Value Recent Buyers

### Cart Abandonment Flow
Recover lost sales:
- Active Cart Abandoners
- Frequent Cart Abandoners
- High-Value Abandoned Carts

## How to Use Bundles

1. Click **Select Bundle** on any bundle card
2. Review the segments included
3. Click **Create All Segments**
4. Segments appear in your Klaviyo account instantly

## Benefits

- Save time with proven segment combinations
- Ensure you don't miss critical segments
- Follow marketing best practices
- Get started faster`
  },
  {
    slug: 'free-beta',
    title: 'How the free beta works',
    category: 'Getting Started',
    excerpt: 'Everything you need to know about using the free beta',
    order_index: 4,
    content: `# How the free beta works

## What's Included

During the free beta period, you get:
- ✅ Unlimited segment creation
- ✅ All 70+ pre-built segments
- ✅ AI-powered segment suggestions (10/day)
- ✅ Full analytics dashboard
- ✅ Multiple client/brand management
- ✅ Priority support

## Beta Period

The free beta is currently **active** and will continue until we announce transition plans. We'll give at least 30 days notice before any changes.

## Your Feedback Matters

As a beta user, your input shapes the product:
- Use the feedback widget (bottom right)
- Report bugs or issues
- Suggest new segments or features
- Share what's working well

## After Beta

Aderai is currently free for all users. Enjoy full access to all features with no limitations.
- You'll be notified well in advance

## Fair Use Policy

While we offer unlimited segments, we ask that you:
- Use segments for legitimate marketing purposes
- Avoid automated/bulk segment creation
- Report any issues you encounter

Thank you for being an early user! 🚀`
  },

  // Segments Category
  {
    slug: 'prebuilt-segments',
    title: 'What are the 70 pre-built segments?',
    category: 'Segments',
    excerpt: 'Explore the complete library of ready-to-use customer segments',
    order_index: 1,
    content: `# What are the 70 pre-built segments?

## Overview

Our platform offers 70+ professionally crafted segments based on e-commerce best practices and proven marketing strategies.

## Segment Categories

### 👋 New Customer Segments
Target recently acquired customers:
- New Customers (Last 30/60 Days)
- First-Time Buyers
- Single Purchase Customers
- New Subscribers

### 🔄 Repeat Customer Segments
Engage loyal customers:
- Repeat Customers (2-5+ Purchases)
- Monthly/Quarterly Buyers
- Subscription Customers
- Brand Advocates

### 💎 High-Value Segments
Focus on your best customers:
- VIP Customers (Top 10% LTV)
- High-Value Customers ($500+)
- Above Average Order Value
- Premium Product Buyers

### 🎯 Engagement Segments
Re-engage based on activity:
- Highly Engaged (7-30 Days)
- Recently Opened/Clicked
- Active Email Engagers
- Social Media Engaged

### 😴 Re-engagement Segments
Win back inactive customers:
- Lapsed Customers (90+ Days)
- Churned Customers (180+ Days)
- Used to Engage, Now Inactive
- At-Risk Customers

### 🛒 Cart & Browse Segments
Recover potential sales:
- Active Cart Abandoners
- Browse Abandoners
- Repeat Cart Abandoners
- High-Value Abandoned Carts

### 📍 Geographic Segments
Target by location:
- US Customers
- International Customers
- Specific State/Region
- Shipping Zone Based

### 📱 Channel Segments
Segment by interaction:
- Email Only Customers
- SMS Subscribers
- Multi-Channel Engaged
- Mobile App Users

## Why Pre-built?

These segments are:
- ✅ Battle-tested across thousands of brands
- ✅ Optimized for Klaviyo's data structure
- ✅ Ready to use immediately
- ✅ Based on marketing best practices
- ✅ Regularly updated with new strategies`
  },
  {
    slug: 'segment-categories',
    title: 'Segment categories explained',
    category: 'Segments',
    excerpt: 'Understand how segments are organized to find what you need',
    order_index: 2,
    content: `# Segment categories explained

## How Segments are Organized

Segments are grouped into 8 strategic categories to help you find what you need quickly.

## Category Breakdown

### 1. New Customer Acquisition
**Purpose:** Welcome and nurture new customers

**Key segments:**
- New Customers (30-day window)
- First-Time Buyers
- Recently Subscribed

**Use cases:**
- Welcome email series
- First purchase incentives
- Onboarding campaigns

### 2. Loyalty & Retention
**Purpose:** Keep customers coming back

**Key segments:**
- Repeat Customers
- Loyal Customers (5+ purchases)
- Monthly Buyers

**Use cases:**
- Loyalty program enrollment
- Exclusive offers for repeat buyers
- VIP tier advancement

### 3. Win-Back & Re-engagement
**Purpose:** Recover at-risk and churned customers

**Key segments:**
- Lapsed (90+ days)
- Churned (180+ days)
- At-Risk

**Use cases:**
- Win-back discount campaigns
- "We miss you" emails
- Re-engagement surveys`
  },
  {
    slug: 'segment-sync',
    title: 'How segments sync to Klaviyo',
    category: 'Segments',
    excerpt: 'Learn how segments are created and maintained in your Klaviyo account',
    order_index: 3,
    content: `# How segments sync to Klaviyo

## Real-Time Creation

When you create segments in our portal, they're instantly pushed to your Klaviyo account using the Klaviyo API.

## What Gets Created

For each segment, we create:
- ✅ Segment definition in Klaviyo
- ✅ All filtering criteria and conditions
- ✅ Dynamic membership rules

## Syncing Process

### 1. Segment Creation
You select segments → Click "Create"

### 2. API Request
Our system sends segment definitions to Klaviyo

### 3. Klaviyo Processing
Klaviyo creates the segment and begins populating it

### 4. Profile Matching
Klaviyo automatically adds profiles matching the criteria

### 5. Ongoing Updates
Segments update automatically as customer behavior changes

## Timeline

- **Creation:** Instant (< 5 seconds)
- **Population:** 5-15 minutes for initial profiles
- **Updates:** Real-time as customers meet criteria

## Segment Limits

Klaviyo has account-based segment limits:
- Starter: 100 segments
- Professional: Unlimited segments
- Free accounts: 150 segments`
  },

  // AI Features
  {
    slug: 'ai-suggestions',
    title: 'How AI segment suggestions work',
    category: 'AI Features',
    excerpt: 'Discover how AI creates personalized segment recommendations',
    order_index: 1,
    content: `# How AI segment suggestions work

## Overview

Our AI analyzes your business goals and generates personalized segment recommendations tailored to your specific needs.

## How It Works

### 1. Describe Your Goal
Tell us what you want to achieve:
- "Increase repeat purchases from first-time buyers"
- "Re-engage customers who haven't bought in 90 days"
- "Identify VIP customers for exclusive offers"

### 2. AI Analysis
Our AI considers:
- Your industry and business type
- Customer lifecycle stage
- Marketing objectives
- Klaviyo data structure
- Best practices for your goal

### 3. Segment Generation
AI creates 3-5 custom segments:
- Specific filtering criteria
- Optimized definitions
- Ready to create in Klaviyo

### 4. Review & Create
- Review suggested segments
- Adjust if needed
- Create all with one click`
  },
  {
    slug: 'better-ai-recommendations',
    title: 'Getting better AI recommendations',
    category: 'AI Features',
    excerpt: 'Tips and techniques for getting the most relevant AI segment suggestions',
    order_index: 2,
    content: `# Getting better AI recommendations

## Be Specific

### ❌ Vague
"Help me with customers"

### ✅ Specific
"Create segments to run a win-back campaign for customers who haven't purchased in 60-90 days"

## Include Context

### What AI Needs to Know:
- Your industry (e.g., "fashion brand", "subscription box")
- Customer behavior patterns
- Specific challenges
- Campaign goals

### Example:
"I run a skincare e-commerce brand. I want to identify customers who bought once 30-60 days ago and send them a replenishment reminder with a discount."

## Ask for Sequences

Instead of single segments, request campaign flows:

**Example:**
"Create a complete new customer nurture sequence with segments for days 1, 7, 14, and 30 after first purchase"`
  },
  {
    slug: 'ai-limits',
    title: 'Daily AI suggestion limits',
    category: 'AI Features',
    excerpt: 'Understand how AI suggestion limits work and how to maximize them',
    order_index: 3,
    content: `# Daily AI suggestion limits

## Current Limits

During the free beta:
- **10 AI suggestions per day**
- Resets at midnight UTC
- No rollover of unused suggestions

## Why Limits?

AI suggestions use computational resources and API calls. Limits ensure:
- Fair access for all beta users
- System reliability and performance
- Sustainable service delivery

## Tracking Your Usage

View your remaining AI suggestions:
- Top of AI tab shows: "X/10 AI suggestions remaining today"
- Updates in real-time after each use
- Resets automatically at midnight UTC

## Making the Most of Your Daily Limit

### 1. Plan Ahead
Before using AI, outline your goals for the day

### 2. Batch Similar Requests
Group related segments in one prompt:
"Create segments for new customer onboarding: day 1, 7, 14, 30"

### 3. Be Specific First Time
Detailed prompts reduce need for iterations

### 4. Use Pre-built for Common Needs
Save AI suggestions for custom requirements

### 5. Start with Bundles
Use pre-configured bundles, then fill gaps with AI`
  },

  // Troubleshooting
  {
    slug: 'klaviyo-connection',
    title: 'Klaviyo connection issues',
    category: 'Troubleshooting',
    excerpt: 'Solve common Klaviyo API connection problems',
    order_index: 1,
    content: `# Klaviyo connection issues

## Common Connection Problems

### Issue 1: Invalid API Key

**Symptoms:**
- "Invalid API key" error message
- Unable to save Klaviyo key

**Solutions:**
1. Verify you copied the entire API key (starts with "pk_")
2. Make sure it's a **Private Key** (not Public)
3. Check for extra spaces before/after the key
4. Generate a new key in Klaviyo if needed

### Issue 2: Insufficient Permissions

**Symptoms:**
- Segments not creating
- "Permission denied" errors

**Solutions:**
1. Go to Klaviyo → Account → API Keys
2. Edit your API key
3. Ensure **Full Access** is selected
4. Save and re-enter key in portal

### Issue 3: Connection Times Out

**Symptoms:**
- Loading spinners that never finish
- "Request timeout" errors

**Solutions:**
1. Check your internet connection
2. Try refreshing the page
3. Clear browser cache
4. Try different browser
5. Disable VPN if active`
  },
  {
    slug: 'segment-errors',
    title: 'Segment creation errors',
    category: 'Troubleshooting',
    excerpt: 'Troubleshoot and resolve segment creation errors',
    order_index: 2,
    content: `# Segment creation errors

## Common Errors

### Error: "Segment already exists"

**Cause:** A segment with the same name exists in Klaviyo

**Solutions:**
1. Check existing Klaviyo segments
2. Delete or rename the duplicate in Klaviyo
3. Try creating again
4. Use a different segment name

### Error: "Rate limit exceeded"

**Cause:** Too many API requests in short time

**Solutions:**
1. Wait 2-3 minutes
2. Create segments in smaller batches
3. Avoid clicking "Create" multiple times
4. Retry failed segments individually

### Error: "Invalid segment definition"

**Cause:** Segment criteria incompatible with your Klaviyo data

**Solutions:**
1. Verify custom properties exist in Klaviyo
2. Check date ranges are valid
3. Ensure numeric values are properly formatted
4. Review segment definition for conflicts`
  },
  {
    slug: 'api-permissions',
    title: 'API key permissions',
    category: 'Troubleshooting',
    excerpt: 'Configure correct API key permissions for full functionality',
    order_index: 3,
    content: `# API key permissions

## Required Permissions

For full functionality, your Klaviyo API key needs:

### Minimum (Basic Segments):
- ✅ Read Segments
- ✅ Write Segments

### Recommended (Full Features):
- ✅ Read Segments
- ✅ Write Segments
- ✅ Read Profiles
- ✅ Read Metrics
- ✅ Read Campaigns
- ✅ Read Flows

### Full Access (Best):
- ✅ All permissions enabled

## Setting Permissions

### For New API Keys:

1. Klaviyo → Account → Settings → API Keys
2. Click **Create Private API Key**
3. Name it (e.g., "Segment Portal - Full Access")
4. Select **Full Access** radio button
5. Click **Create**
6. Copy key immediately (shown only once)

### For Existing Keys:

1. Find your API key in Klaviyo
2. Click on it to edit
3. Change permissions:
   - Select **Full Access**, or
   - Check individual permissions listed above
4. Click **Update**
5. Key updates immediately (no need to re-enter)`
  }
];
