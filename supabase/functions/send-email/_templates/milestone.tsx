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

interface MilestoneEmailProps {
  accountName: string;
  milestone: number;
  segmentCount: number;
  aiSuggestionsUsed: number;
  dashboardUrl: string;
  trackingPixelUrl?: string;
}

export const MilestoneEmail = ({
  accountName,
  milestone,
  segmentCount,
  aiSuggestionsUsed,
  dashboardUrl,
  trackingPixelUrl,
}: MilestoneEmailProps) => {
  const milestoneEmoji = milestone === 10 ? '🎯' : milestone === 25 ? '🚀' : '🏆';
  const milestoneMessage = 
    milestone === 10 ? 'You\'re just getting started!' :
    milestone === 25 ? 'You\'re becoming a segmentation pro!' :
    'You\'re a segmentation expert!';

  return (
    <Html>
      <Head />
      <Preview>{`Congratulations! You've reached ${milestone} segments`}</Preview>
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
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Section style={celebrationBanner}>
              <Text style={celebrationEmoji}>{milestoneEmoji}</Text>
              <Heading style={h1}>Milestone Achieved!</Heading>
            </Section>
            
            <Text style={text}>Hi {accountName},</Text>
            
            <Text style={bigText}>
              Congratulations! You've created <strong style={{ color: BRAND_COLOR }}>{segmentCount} segments</strong> with Aderai.
            </Text>

            <Text style={text}>
              {milestoneMessage}
            </Text>

            {/* Stats Section */}
            <Section style={statsBox}>
              <div style={statRow}>
                <Text style={statLabel}>Total Segments</Text>
                <Text style={statValue}>{segmentCount}</Text>
              </div>
              <Hr style={statDivider} />
              <div style={statRow}>
                <Text style={statLabel}>AI Suggestions Used</Text>
                <Text style={statValue}>{aiSuggestionsUsed}</Text>
              </div>
            </Section>

            {/* Next Steps */}
            <Section style={nextStepsBox}>
              <Text style={nextStepsTitle}>🎯 What's Next?</Text>
              {milestone === 10 && (
                <ul style={nextStepsList}>
                  <li style={nextStepsItem}>Explore our AI segment generator for custom ideas</li>
                  <li style={nextStepsItem}>Check your segment performance in Analytics</li>
                  <li style={nextStepsItem}>Try advanced segments like RFM analysis</li>
                </ul>
              )}
              {milestone === 25 && (
                <ul style={nextStepsList}>
                  <li style={nextStepsItem}>Optimize your segments based on performance data</li>
                  <li style={nextStepsItem}>Experiment with behavioral targeting</li>
                  <li style={nextStepsItem}>Set up automated segment updates</li>
                </ul>
              )}
              {milestone === 50 && (
                <ul style={nextStepsList}>
                  <li style={nextStepsItem}>You've deployed most of our segment library!</li>
                  <li style={nextStepsItem}>Focus on analyzing what's working best</li>
                  <li style={nextStepsItem}>Share your success with your team</li>
                </ul>
              )}
            </Section>

            <Section style={buttonContainer}>
              <Link href={`${dashboardUrl}/analytics`} style={button}>
                View Your Analytics
              </Link>
            </Section>

            <Hr style={hr} />

            <Text style={footerContentText}>
              Keep up the great work! Your segments are helping you target the right customers at the right time.
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

export default MilestoneEmail;

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

const celebrationBanner = {
  textAlign: 'center' as const,
  padding: '20px 0',
};

const celebrationEmoji = {
  fontSize: '64px',
  margin: '0',
  display: 'block',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '10px 0 30px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const bigText = {
  color: '#333333',
  fontSize: '18px',
  lineHeight: '28px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const statsBox = {
  backgroundColor: '#FFF8F3',
  border: '2px solid #FFE8D9',
  borderRadius: '8px',
  padding: '25px',
  margin: '30px 0',
};

const statRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const statLabel = {
  fontSize: '14px',
  color: '#666666',
  margin: '0',
};

const statValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: BRAND_COLOR,
  margin: '0',
};

const statDivider = {
  borderColor: '#FFE8D9',
  margin: '15px 0',
};

const nextStepsBox = {
  backgroundColor: '#E8F5E9',
  border: '2px solid #C8E6C9',
  borderRadius: '8px',
  padding: '20px',
  margin: '25px 0',
};

const nextStepsTitle = {
  color: '#2E7D32',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const nextStepsList = {
  margin: '0',
  padding: '0 0 0 20px',
  color: '#2E7D32',
};

const nextStepsItem = {
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
