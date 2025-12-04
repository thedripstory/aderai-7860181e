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
        <Section style={header}>
          <Img 
            src={ADERAI_LOGO_URL} 
            width="140" 
            height="auto" 
            alt="Aderai" 
            style={logo}
          />
        </Section>

        <Section style={content}>
          <Heading style={h1}>✉️ Verify Your Email</Heading>
          
          <Text style={text}>Hi there!</Text>
          
          <Text style={text}>
            Thank you for signing up for Aderai! We're excited to help you create powerful Klaviyo segments in seconds.
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
            <Text style={featureTitle}>🚀 What you'll get:</Text>
            <Text style={featureItem}>✓ 70+ pre-built Klaviyo segments</Text>
            <Text style={featureItem}>✓ Deploy segments in 30 seconds</Text>
            <Text style={featureItem}>✓ AI-powered segment suggestions</Text>
            <Text style={featureItem}>✓ Performance analytics and insights</Text>
          </Section>

          <Text style={smallText}>
            If the button doesn't work, copy and paste this link into your browser:
          </Text>
          <Text style={urlText}>{verificationUrl}</Text>

          <Hr style={hr} />

          <Text style={footerContentText}>
            Need help getting started? Visit our <Link href="https://aderai.io/help" style={link}>Help Center</Link>
          </Text>
        </Section>

        <Section style={footer}>
          <Img 
            src={ADERAI_LOGO_URL} 
            width="80" 
            height="auto" 
            alt="Aderai" 
            style={{ margin: '0 auto 15px' }}
          />
          <Text style={footerText}>
            © {new Date().getFullYear()} Aderai. All rights reserved.
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

const link = {
  color: BRAND_COLOR,
  textDecoration: 'underline',
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
