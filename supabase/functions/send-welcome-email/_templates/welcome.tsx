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

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl: string;
  trackingPixelUrl?: string;
}

export const WelcomeEmail = ({
  userName,
  dashboardUrl,
  trackingPixelUrl,
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Aderai - Start creating segments in 30 seconds!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Aderai Logo */}
        <Section style={header}>
          <div style={logoContainer}>
            <span style={logoText}>aderai</span>
            <span style={logoDot}>.</span>
          </div>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>🎉 Welcome to Aderai!</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            We're thrilled to have you join Aderai! You're now ready to deploy 70+ pre-built Klaviyo segments in just 30 seconds.
          </Text>

          <Section style={featureBox}>
            <Text style={featureTitle}>🚀 What's inside:</Text>
            <ul style={featureList}>
              <li style={featureItem}>70+ battle-tested segment templates</li>
              <li style={featureItem}>AI-powered custom segment generator</li>
              <li style={featureItem}>Performance analytics & insights</li>
              <li style={featureItem}>One-click deployment to Klaviyo</li>
            </ul>
          </Section>

          <Section style={buttonContainer}>
            <Link href={dashboardUrl} style={button}>
              Start Creating Segments
            </Link>
          </Section>

          <Section style={tipBox}>
            <Text style={tipTitle}>💡 Quick Tip:</Text>
            <Text style={tipText}>
              Connect your Klaviyo account first, then browse our segment library or ask our AI to create custom segments based on your goals.
            </Text>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            Need help? Check out our <Link href="https://aderai.lovable.app/help" style={link}>Help Center</Link> or reply to this email.
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} Aderai. All rights reserved.
          </Text>
          <Text style={footerSmallText}>
            You're receiving this because you created an Aderai account.
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

export default WelcomeEmail;

// Styles
const main = {
  backgroundColor: '#f6f6f6',
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
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
  borderBottom: '3px solid #FF6B35',
};

const logoContainer = {
  display: 'inline-block',
};

const logoText = {
  fontSize: '32px',
  fontFamily: "'Playfair Display', serif",
  fontWeight: 'bold',
  color: '#1a1a1a',
  letterSpacing: '-0.5px',
};

const logoDot = {
  fontSize: '32px',
  fontFamily: "'Playfair Display', serif",
  fontWeight: 'bold',
  color: '#FF6B35',
};

const content = {
  backgroundColor: '#ffffff',
  padding: '40px 30px',
  borderRadius: '0 0 10px 10px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#FF6B35',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
};

const featureBox = {
  backgroundColor: '#FFF8F3',
  border: '2px solid #FFE8D9',
  borderRadius: '8px',
  padding: '20px',
  margin: '25px 0',
};

const featureTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const featureList = {
  margin: '0',
  padding: '0 0 0 20px',
  color: '#333333',
};

const featureItem = {
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '8px',
};

const tipBox = {
  backgroundColor: '#E3F2FD',
  border: '2px solid #BBDEFB',
  borderRadius: '8px',
  padding: '20px',
  margin: '25px 0',
};

const tipTitle = {
  color: '#1565C0',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 8px',
};

const tipText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '30px 0',
};

const link = {
  color: '#FF6B35',
  textDecoration: 'underline',
};

const footer = {
  textAlign: 'center' as const,
  padding: '20px',
};

const footerText = {
  color: '#999999',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '5px 0',
};

const footerSmallText = {
  color: '#bbbbbb',
  fontSize: '11px',
  lineHeight: '18px',
  margin: '5px 0',
};
