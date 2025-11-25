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

interface WeeklyDigestProps {
  accountName: string;
  segmentsCreated: number;
  aiUsed: number;
  analyticsViewed: boolean;
  dashboardUrl: string;
  trackingPixelUrl?: string;
}

export const WeeklyDigest = ({
  accountName,
  segmentsCreated,
  aiUsed,
  analyticsViewed,
  dashboardUrl,
  trackingPixelUrl,
}: WeeklyDigestProps) => (
  <Html>
    <Head />
    <Preview>Your weekly Aderai activity summary</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <div style={logoContainer}>
            <span style={logoText}>aderai</span>
            <span style={logoDot}>.</span>
          </div>
          <Text style={headerSubtitle}>Your Weekly Activity</Text>
        </Section>

        {/* Main Content */}
        <Section style={content}>
          <Heading style={h1}>📊 This Week's Progress</Heading>
          
          <Text style={text}>Hi {accountName},</Text>
          
          <Text style={text}>
            Here's a quick recap of your Aderai activity from the past week:
          </Text>

          {/* Stats Grid */}
          <Section style={statsGrid}>
            <div style={statCard}>
              <Text style={statNumber}>{segmentsCreated}</Text>
              <Text style={statLabel}>Segments Created</Text>
            </div>
            <div style={statCard}>
              <Text style={statNumber}>{aiUsed}</Text>
              <Text style={statLabel}>AI Suggestions Used</Text>
            </div>
            <div style={statCard}>
              <Text style={statNumber}>{analyticsViewed ? '✓' : '—'}</Text>
              <Text style={statLabel}>Analytics Viewed</Text>
            </div>
          </Section>

          {segmentsCreated === 0 && (
            <Section style={motivationBox}>
              <Text style={motivationTitle}>💪 Keep Building!</Text>
              <Text style={motivationText}>
                You haven't created any segments this week. Deploy your first segment bundle in just 30 seconds!
              </Text>
              <Section style={buttonContainer}>
                <Link href={dashboardUrl} style={button}>
                  Browse Segments
                </Link>
              </Section>
            </Section>
          )}

          {segmentsCreated > 0 && (
            <Section style={celebrationBox}>
              <Text style={celebrationTitle}>🎉 Great Work!</Text>
              <Text style={celebrationText}>
                You created {segmentsCreated} segment{segmentsCreated > 1 ? 's' : ''} this week. Keep up the momentum!
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Section style={tipBox}>
            <Text style={tipTitle}>💡 Pro Tip:</Text>
            <Text style={tipText}>
              Use the Analytics dashboard to track which segments are performing best and adjust your strategy accordingly.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Link href={`${dashboardUrl}/analytics`} style={secondaryButton}>
              View Full Analytics
            </Link>
          </Section>
        </Section>

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            <Link href={dashboardUrl + '/settings'} style={link}>Manage email preferences</Link>
          </Text>
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

export default WeeklyDigest;

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

const headerSubtitle = {
  fontSize: '14px',
  color: '#666666',
  margin: '8px 0 0',
  fontWeight: 'normal' as const,
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

const statsGrid = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '15px',
  margin: '30px 0',
};

const statCard = {
  flex: '1',
  backgroundColor: '#FFF8F3',
  border: '2px solid #FFE8D9',
  borderRadius: '8px',
  padding: '20px',
  textAlign: 'center' as const,
};

const statNumber = {
  fontSize: '32px',
  fontWeight: 'bold',
  color: '#FF6B35',
  margin: '0 0 8px',
  display: 'block',
};

const statLabel = {
  fontSize: '12px',
  color: '#666666',
  margin: '0',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
};

const motivationBox = {
  backgroundColor: '#FFF3CD',
  border: '2px solid #FFE8A1',
  borderRadius: '8px',
  padding: '20px',
  margin: '25px 0',
  textAlign: 'center' as const,
};

const motivationTitle = {
  color: '#856404',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const motivationText = {
  color: '#856404',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 20px',
};

const celebrationBox = {
  backgroundColor: '#D4EDDA',
  border: '2px solid #C3E6CB',
  borderRadius: '8px',
  padding: '20px',
  margin: '25px 0',
  textAlign: 'center' as const,
};

const celebrationTitle = {
  color: '#155724',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 12px',
};

const celebrationText = {
  color: '#155724',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '20px 0',
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

const secondaryButton = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  color: '#FF6B35',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 30px',
  border: '2px solid #FF6B35',
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
