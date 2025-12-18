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
} from "https://esm.sh/@react-email/components@0.0.22";
import * as React from "https://esm.sh/react@18.3.1";

interface TestUserInvitationEmailProps {
  firstName: string;
  brandName: string;
  email: string;
  tempPassword: string;
  loginUrl: string;
  dashboardUrl: string;
}

export const TestUserInvitationEmail = ({
  firstName,
  brandName,
  email,
  tempPassword,
  loginUrl,
  dashboardUrl,
}: TestUserInvitationEmailProps) => (
  <Html>
    <Head />
    <Preview>Welcome to Aderai Beta - Your exclusive test account is ready!</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Logo */}
        <Section style={logoSection}>
          <Img
            src="https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/zoomed-inblack-logo-png%20copy.png"
            width="120"
            height="auto"
            alt="Aderai"
            style={logo}
          />
        </Section>

        {/* Header */}
        <Heading style={h1}>Welcome to Aderai Beta! 🎉</Heading>

        <Text style={text}>Hi {firstName},</Text>

        <Text style={text}>
          Great news! You've been selected to be one of our exclusive beta testers for <strong>Aderai</strong> - 
          the AI-powered Klaviyo segmentation tool that creates 70+ expert-grade segments in seconds.
        </Text>

        <Text style={text}>
          Your test account for <strong>{brandName}</strong> is now ready to use.
        </Text>

        <Hr style={hr} />

        {/* Credentials Section */}
        <Section style={credentialsSection}>
          <Heading style={h2}>Your Login Credentials</Heading>
          
          <Section style={credentialBox}>
            <Text style={credentialLabel}>Email Address:</Text>
            <Text style={credentialValue}>{email}</Text>
          </Section>

          <Section style={credentialBox}>
            <Text style={credentialLabel}>Temporary Password:</Text>
            <Text style={credentialValueHighlight}>{tempPassword}</Text>
          </Section>

          <Text style={warningText}>
            ⚠️ Please change your password after your first login for security.
          </Text>
        </Section>

        <Hr style={hr} />

        {/* Getting Started Section */}
        <Section>
          <Heading style={h2}>Getting Started</Heading>
          
          <Text style={stepText}>
            <strong>Step 1:</strong> Click the button below to log in
          </Text>
          
          <Section style={buttonContainer}>
            <Link href={loginUrl} style={button}>
              Log In to Aderai →
            </Link>
          </Section>

          <Text style={stepText}>
            <strong>Step 2:</strong> Connect your Klaviyo account by adding your API key
          </Text>

          <Text style={stepText}>
            <strong>Step 3:</strong> Start creating AI-powered segments instantly!
          </Text>
        </Section>

        <Hr style={hr} />

        {/* What to Test Section */}
        <Section>
          <Heading style={h2}>What We'd Love Your Feedback On</Heading>
          
          <Text style={text}>
            As a beta tester, your feedback is incredibly valuable. Here are some things we'd love for you to explore:
          </Text>

          <ul style={list}>
            <li style={listItem}>Creating segments from our pre-built library</li>
            <li style={listItem}>Using AI suggestions for custom segments</li>
            <li style={listItem}>The overall user experience and navigation</li>
            <li style={listItem}>Any bugs or issues you encounter</li>
            <li style={listItem}>Features you'd like to see added</li>
          </ul>

          <Text style={text}>
            There's a feedback widget in the app (bottom-right corner) where you can share your thoughts anytime!
          </Text>
        </Section>

        <Hr style={hr} />

        {/* Support Section */}
        <Section>
          <Heading style={h2}>Need Help?</Heading>
          
          <Text style={text}>
            If you run into any issues or have questions, we're here to help:
          </Text>

          <Text style={text}>
            📧 Email us at <Link href="mailto:hello@aderai.io" style={link}>hello@aderai.io</Link>
          </Text>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            Thank you for being part of the Aderai beta program!
          </Text>
          <Text style={footerText}>
            — The Aderai Team
          </Text>
          <Text style={footerDisclaimer}>
            This is an exclusive beta invitation. Please do not share your credentials with others.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default TestUserInvitationEmail;

// Styles
const main = {
  backgroundColor: "#FFF8F3",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
  borderRadius: "8px",
  border: "1px solid #FFE8D9",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const logo = {
  margin: "0 auto",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  margin: "30px 0 20px",
  padding: "0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "24px 0 16px",
  padding: "0",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 0",
};

const stepText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "12px 0",
};

const hr = {
  borderColor: "#FFE8D9",
  margin: "24px 0",
};

const credentialsSection = {
  backgroundColor: "#FFF8F3",
  borderRadius: "8px",
  padding: "20px",
  margin: "16px 0",
};

const credentialBox = {
  margin: "12px 0",
};

const credentialLabel = {
  color: "#6b7280",
  fontSize: "13px",
  fontWeight: "500",
  margin: "0 0 4px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
};

const credentialValue = {
  color: "#1a1a1a",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
  fontFamily: "monospace",
};

const credentialValueHighlight = {
  color: "#FF6B35",
  fontSize: "18px",
  fontWeight: "700",
  margin: "0",
  fontFamily: "monospace",
  backgroundColor: "#FFE8D9",
  padding: "8px 12px",
  borderRadius: "4px",
  display: "inline-block",
};

const warningText = {
  color: "#92400e",
  fontSize: "13px",
  margin: "16px 0 0 0",
  backgroundColor: "#fef3c7",
  padding: "8px 12px",
  borderRadius: "4px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const button = {
  backgroundColor: "#FF6B35",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const link = {
  color: "#FF6B35",
  textDecoration: "underline",
};

const list = {
  margin: "16px 0",
  paddingLeft: "24px",
};

const listItem = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "28px",
};

const footer = {
  marginTop: "32px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#6b7280",
  fontSize: "14px",
  margin: "8px 0",
};

const footerDisclaimer = {
  color: "#9ca3af",
  fontSize: "12px",
  margin: "16px 0 0 0",
  fontStyle: "italic",
};
