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

interface PasswordResetEmailProps {
  userName: string;
  resetLink: string;
}

export const PasswordResetEmail = ({
  userName,
  resetLink,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your Aderai password</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header with Aderai Logo */}
        <Section style={header}>
          <Img 
            src={ADERAI_LOGO_URL} 
            width="140" 
            height="auto" 
            alt="Aderai" 
            style={logo}
          />
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>🔐 Password Reset Request</Heading>
          
          <Text style={text}>Hi {userName},</Text>
          
          <Text style={text}>
            We received a request to reset your password. Click the button below to create a new password:
          </Text>

          <Section style={buttonContainer}>
            <Link href={resetLink} style={button}>
              Reset Password
            </Link>
          </Section>

          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request this reset, please ignore this email and your password will remain unchanged.
            </Text>
          </Section>

          <Text style={text}>
            For security reasons, this link can only be used once.
          </Text>

          <Text style={smallText}>
            If you're having trouble clicking the button, copy and paste this URL into your browser:
          </Text>
          <Text style={urlText}>{resetLink}</Text>

          <Hr style={hr} />

          <Text style={footerContentText}>
            Need help? Visit our <Link href="https://aderai.io/help" style={link}>Help Center</Link>
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
          <Text style={footerText}>
            © {new Date().getFullYear()} Aderai. All rights reserved.
          </Text>
          <Text style={footerText}>
            This is an automated email, please do not reply.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;

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

const warningBox = {
  backgroundColor: '#FFF3CD',
  borderLeft: `4px solid ${BRAND_COLOR}`,
  padding: '15px',
  margin: '20px 0',
  borderRadius: '4px',
};

const warningText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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
