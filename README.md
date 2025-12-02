# Aderai - Instant Klaviyo Segmentation Tool

## What is Aderai?

Aderai is a **free beta** tool that integrates officially with Klaviyo and provides instant, expert-grade segmentation for e-commerce brands and agencies. It replaces manual, time-consuming segmentation by offering 70+ pre-built segments and AI-powered custom options, deployed to Klaviyo with a single click.

## 🎯 Key Features

### 🚀 Instant Segmentation
- **70+ Pre-Built Segments**: Industry-standard segments across 7 categories
- **One-Click Deployment**: Deploy segments directly to your Klaviyo account
- **Bundle Creation**: Deploy multiple related segments at once

### 🤖 AI-Powered Suggestions
- **Custom Segment AI**: Get personalized segment suggestions based on your industry and goals
- **Smart Recommendations**: AI analyzes your needs and suggests optimal segments
- **Daily AI Limit**: 10 AI suggestions per day per user during beta

### 📊 Analytics & Performance
- **Segment Analytics**: Track performance of deployed segments
- **Health Monitoring**: Monitor segment health and identify issues
- **Campaign Performance**: See which segments drive the most revenue

### 🎓 Help & Support
- **In-App Help Center**: Comprehensive documentation and guides
- **Interactive Onboarding**: Guided tour for new users
- **Contextual Help**: Get help exactly where you need it

### 🎉 Engagement Features
- **Achievements System**: Earn badges for milestones
- **Feedback Widget**: Submit bugs, feature requests, and general feedback
- **Email Notifications**: Stay updated on important events (opt-in)

## 🔧 Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, shadcn/ui
- **Backend**: Lovable Cloud (Supabase)
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)
- **Email**: Resend API
- **AI**: Claude API (for segment suggestions)
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm installed
- Klaviyo account with API access

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment Variables

The project uses Lovable Cloud for backend services. Environment variables are automatically configured:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## 📖 How to Use

1. **Sign Up**: Create a free account at Aderai
2. **Connect Klaviyo**: Add your Klaviyo Private API Key
3. **Browse Segments**: Explore 70+ pre-built segments across 7 categories
4. **Deploy**: Click to deploy individual segments or bundles
5. **Get AI Suggestions**: Use AI to generate custom segments
6. **Monitor Performance**: Track segment analytics and health

## 🎯 Free Beta Positioning

Aderai is currently in **free beta** to validate product-market fit. All features are free during this phase:
- ✅ Unlimited segment creation
- ✅ Full access to 70+ pre-built segments
- ✅ 10 AI suggestions per day
- ✅ Analytics and performance tracking
- ✅ Email notifications

We're monitoring user sign-ups and feature adoption to understand how the tool is performing with real users before launching paid plans in the future.

## 🤝 How to Contribute Feedback

We'd love to hear from you! Use the in-app feedback widget to:
- 🐛 **Report Bugs**: Help us identify and fix issues
- 💡 **Request Features**: Tell us what you'd like to see
- 💬 **General Feedback**: Share your thoughts and suggestions

Or email us directly at: **akshat@aderai.io**

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔒 Security & Privacy

- All API keys are encrypted at rest
- Secure authentication via Supabase
- HTTPS-only connections
- No data shared with third parties

## 📄 License

Proprietary - All rights reserved

## 🌐 Links

- **Website**: [https://aderai.io](https://aderai.io)
- **Documentation**: In-app Help Center at `/help`
- **Support**: akshat@aderai.io

## 🙏 Acknowledgments

Built with [Lovable](https://lovable.dev) - The fastest way to build web applications

---

**Note**: Aderai is currently free for all users. We're gathering feedback to improve the product before considering future pricing models.
