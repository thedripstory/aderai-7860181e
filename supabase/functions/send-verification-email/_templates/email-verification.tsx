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
} from 'https://esm.sh/@react-email/components@0.0.22';
import * as React from 'https://esm.sh/react@18.3.1';

interface EmailVerificationProps {
  verificationUrl: string;
}

export const EmailVerification = ({
  verificationUrl,
}: EmailVerificationProps) => (
  <Html>
    <Head />
    <Preview>Verify your Aderai email address</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Aderai Logo */}
        <Section style={header}>
          <Text style={logoText}>aderai<Text style={logoDot}>.</Text></Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>Welcome to Aderai!</Heading>
          
          <Text style={text}>Hi there!</Text>
          
          <Text style={text}>
            Thank you for signing up! We're excited to help you create powerful Klaviyo segments in seconds.
          </Text>

          <Text style={text}>
            Please verify your email address to unlock all features and get started:
          </Text>

          <Section style={buttonContainer}>
            <Link href={verificationUrl} style={button}>
              Verify Email Address
            </Link>
          </Section>

          <Section style={featureBox}>
            <Text style={featureTitle}>What you'll get:</Text>
            <Text style={featureItem}>• 70+ pre-built Klaviyo segments</Text>
            <Text style={featureItem}>• Deploy segments in 30 seconds</Text>
            <Text style={featureItem}>• AI-powered segment suggestions</Text>
            <Text style={featureItem}>• Performance analytics & insights</Text>
          </Section>

          <Text style={smallText}>
            If the button doesn't work, copy and paste this link into your browser:
          </Text>
          <Text style={urlText}>{verificationUrl}</Text>

          <Hr style={hr} />

          <Text style={footerText}>
            Need help getting started? Check out our Help Center at https://aderai.io/help
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            © 2025 Aderai. All rights reserved.
          </Text>
          <Text style={footerSmallText}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default EmailVerification;

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

const logoText = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#1a1a1a',
  letterSpacing: '-0.5px',
  margin: '0',
  display: 'inline',
};

const logoDot = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#FF6B35',
  display: 'inline',
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

const smallText = {
  color: '#666666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '16px 0',
};

const urlText = {
  color: '#666666',
  fontSize: '12px',
  wordBreak: 'break-all' as const,
  backgroundColor: '#f9f9f9',
  padding: '10px',
  borderRadius: '5px',
  border: '1px solid #e5e5e5',
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

const featureItem = {
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '4px',
  marginTop: '0',
  color: '#333333',
};

const hr = {
  borderColor: '#e5e5e5',
  margin: '30px 0',
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
