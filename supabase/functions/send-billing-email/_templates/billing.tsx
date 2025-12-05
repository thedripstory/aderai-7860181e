import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Img,
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

const ADERAI_LOGO_URL = 'https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/zoomed-inblack-logo-png%20copy.png';
const BRAND_COLOR = '#FF6B35';

export type BillingEmailType = 
  | 'subscription_confirmed'
  | 'subscription_canceled'
  | 'subscription_renewed'
  | 'payment_failed'
  | 'payment_succeeded'
  | 'trial_ending';

interface BillingEmailProps {
  accountName: string;
  emailType: BillingEmailType;
  dashboardUrl: string;
  billingPortalUrl?: string;
  planName?: string;
  amount?: string;
  currency?: string;
  nextBillingDate?: string;
  trialEndDate?: string;
  failureReason?: string;
  trackingPixelUrl?: string;
}

export const BillingEmail = ({
  accountName,
  emailType,
  dashboardUrl,
  billingPortalUrl,
  planName = 'Pro',
  amount = '$9',
  currency = 'USD',
  nextBillingDate,
  trialEndDate,
  failureReason,
  trackingPixelUrl,
}: BillingEmailProps) => {
  const getEmailContent = () => {
    switch (emailType) {
      case 'subscription_confirmed':
        return {
          preview: 'Your Aderai subscription is now active!',
          emoji: '🎉',
          title: 'Subscription Confirmed!',
          message: `Thank you for subscribing to Aderai ${planName}! Your subscription is now active and you have full access to all features.`,
          highlightBox: {
            title: '📋 Your Subscription Details',
            items: [
              `Plan: ${planName}`,
              `Amount: ${amount}/${currency === 'USD' ? 'month' : currency}`,
              nextBillingDate ? `Next billing date: ${nextBillingDate}` : null,
            ].filter(Boolean),
          },
          ctaText: 'Start Creating Segments',
          ctaUrl: dashboardUrl,
          showBillingPortal: true,
        };

      case 'subscription_canceled':
        return {
          preview: 'Your Aderai subscription has been canceled',
          emoji: '👋',
          title: 'Subscription Canceled',
          message: `We're sorry to see you go! Your Aderai subscription has been canceled. You'll continue to have access until the end of your current billing period.`,
          highlightBox: {
            title: '⏰ Important Information',
            items: [
              nextBillingDate ? `Access until: ${nextBillingDate}` : 'Access continues until end of billing period',
              'Your segments will remain in Klaviyo',
              'You can resubscribe anytime',
            ],
          },
          ctaText: 'Resubscribe',
          ctaUrl: `${dashboardUrl}/settings`,
          showBillingPortal: false,
        };

      case 'subscription_renewed':
        return {
          preview: 'Your Aderai subscription has been renewed',
          emoji: '✅',
          title: 'Subscription Renewed!',
          message: `Your Aderai ${planName} subscription has been successfully renewed. Thank you for your continued support!`,
          highlightBox: {
            title: '📋 Renewal Details',
            items: [
              `Amount charged: ${amount}`,
              nextBillingDate ? `Next renewal: ${nextBillingDate}` : null,
            ].filter(Boolean),
          },
          ctaText: 'View Dashboard',
          ctaUrl: dashboardUrl,
          showBillingPortal: true,
        };

      case 'payment_failed':
        return {
          preview: 'Action required: Payment failed for your Aderai subscription',
          emoji: '⚠️',
          title: 'Payment Failed',
          message: `We couldn't process your payment for Aderai ${planName}. Please update your payment method to avoid service interruption.`,
          highlightBox: {
            title: '❌ What Happened',
            items: [
              failureReason || 'Your payment could not be processed',
              'Your subscription may be suspended if not resolved',
              'Update your payment method to continue',
            ],
            isWarning: true,
          },
          ctaText: 'Update Payment Method',
          ctaUrl: billingPortalUrl || `${dashboardUrl}/settings`,
          showBillingPortal: false,
        };

      case 'payment_succeeded':
        return {
          preview: 'Payment received for your Aderai subscription',
          emoji: '💳',
          title: 'Payment Successful',
          message: `We've successfully received your payment of ${amount} for Aderai ${planName}. Thank you!`,
          highlightBox: {
            title: '✅ Payment Details',
            items: [
              `Amount: ${amount}`,
              `Plan: ${planName}`,
              nextBillingDate ? `Next billing date: ${nextBillingDate}` : null,
            ].filter(Boolean),
          },
          ctaText: 'View Dashboard',
          ctaUrl: dashboardUrl,
          showBillingPortal: true,
        };

      case 'trial_ending':
        return {
          preview: `Your Aderai trial ends on ${trialEndDate}`,
          emoji: '⏳',
          title: 'Trial Ending Soon',
          message: `Your Aderai trial is ending on ${trialEndDate}. Subscribe now to keep your access to all features and continue creating powerful segments.`,
          highlightBox: {
            title: '🚀 What You Get With Pro',
            items: [
              '70+ pre-built Klaviyo segments',
              'AI-powered segment suggestions',
              'Performance analytics & insights',
              'Priority support',
            ],
          },
          ctaText: 'Subscribe Now',
          ctaUrl: `${dashboardUrl}/settings`,
          showBillingPortal: false,
        };

      default:
        return {
          preview: 'Aderai Billing Update',
          emoji: '📧',
          title: 'Billing Update',
          message: 'There has been an update to your billing.',
          highlightBox: null,
          ctaText: 'View Details',
          ctaUrl: dashboardUrl,
          showBillingPortal: true,
        };
    }
  };

  const content = getEmailContent();
  const isWarning = content.highlightBox?.isWarning;

  return (
    <Html>
      <Head />
      <Preview>{content.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img 
              src={ADERAI_LOGO_URL} 
              width="140" 
              height="auto" 
              alt="Aderai" 
              style={logo}
            />
            <Text style={headerSubtitle}>Billing</Text>
          </Section>

          {/* Main Content */}
          <Section style={contentSection}>
            <Section style={emojiSection}>
              <Text style={emojiText}>{content.emoji}</Text>
            </Section>
            
            <Heading style={h1}>{content.title}</Heading>
            
            <Text style={text}>Hi {accountName},</Text>
            
            <Text style={text}>{content.message}</Text>

            {content.highlightBox && (
              <Section style={isWarning ? warningBox : highlightBox}>
                <Text style={isWarning ? warningBoxTitle : highlightBoxTitle}>
                  {content.highlightBox.title}
                </Text>
                <ul style={highlightList}>
                  {content.highlightBox.items.map((item, index) => (
                    <li key={index} style={highlightItem}>{item}</li>
                  ))}
                </ul>
              </Section>
            )}

            <Section style={buttonContainer}>
              <Link href={content.ctaUrl} style={button}>
                {content.ctaText}
              </Link>
            </Section>

            {content.showBillingPortal && billingPortalUrl && (
              <Text style={secondaryLinkText}>
                <Link href={billingPortalUrl} style={link}>
                  Manage your subscription →
                </Link>
              </Text>
            )}

            <Hr style={hr} />

            <Text style={footerContentText}>
              Have billing questions? Contact us at{' '}
              <Link href="mailto:billing@aderai.io" style={link}>
                billing@aderai.io
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Img 
              src={ADERAI_LOGO_URL} 
              width="80" 
              height="auto" 
              alt="Aderai" 
              style={{ margin: '0 auto 15px' }}
            />
            <Text style={footerSmallText}>
              © {new Date().getFullYear()} Aderai. All rights reserved.
            </Text>
            <Text style={footerSmallText}>
              <Link href={`${dashboardUrl}/settings`} style={footerLink}>
                Manage email preferences
              </Link>
            </Text>
          </Section>

          {/* Tracking Pixel */}
          {trackingPixelUrl && (
            <Img src={trackingPixelUrl} width="1" height="1" alt="" style={{ display: 'block' }} />
          )}
        </Container>
      </Body>
    </Html>
  );
};

export default BillingEmail;

// Styles
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
};

const container = {
  margin: '0 auto',
  padding: '20px 0',
  maxWidth: '600px',
};

const header = {
  backgroundColor: '#ffffff',
  padding: '30px 20px',
  textAlign: 'center' as const,
  borderRadius: '10px 10px 0 0',
  borderBottom: `3px solid ${BRAND_COLOR}`,
};

const logo = {
  margin: '0 auto',
};

const headerSubtitle = {
  fontSize: '14px',
  color: '#666666',
  margin: '12px 0 0',
  fontWeight: 'normal' as const,
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const contentSection = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
  borderRadius: '0 0 10px 10px',
};

const emojiSection = {
  textAlign: 'center' as const,
  margin: '0 0 10px',
};

const emojiText = {
  fontSize: '48px',
  margin: '0',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const highlightBox = {
  backgroundColor: '#FFF8F3',
  border: '2px solid #FFE8D9',
  borderRadius: '8px',
  padding: '20px',
  margin: '25px 0',
};

const highlightBoxTitle = {
  color: '#EA580C',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const warningBox = {
  backgroundColor: '#FEF2F2',
  border: '2px solid #FECACA',
  borderRadius: '8px',
  padding: '20px',
  margin: '25px 0',
};

const warningBoxTitle = {
  color: '#DC2626',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const highlightList = {
  margin: '0',
  padding: '0 0 0 20px',
  color: '#333333',
};

const highlightItem = {
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: BRAND_COLOR,
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
};

const secondaryLinkText = {
  textAlign: 'center' as const,
  margin: '0 0 20px',
  fontSize: '14px',
};

const link = {
  color: BRAND_COLOR,
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '30px 0',
};

const footer = {
  textAlign: 'center' as const,
  padding: '20px',
};

const footerContentText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const footerSmallText = {
  color: '#bbbbbb',
  fontSize: '11px',
  lineHeight: '18px',
  margin: '5px 0',
};

const footerLink = {
  color: '#999999',
  textDecoration: 'underline',
};