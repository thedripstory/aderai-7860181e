/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Img, Preview, Section, Text, Button, Link,
} from 'npm:@react-email/components@0.0.22'

export const LOGO_URL = 'https://pub-3bbb34ba2afb44e8af7fdecd43e23b74.r2.dev/aderai-logos/zoomed-inblack-logo-png%20copy.png'
export const BRAND = '#FF6B35'

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", margin: 0, padding: 0 }
const container = { margin: '0 auto', maxWidth: '600px', padding: 0 }
const header = { padding: '32px 32px 20px', textAlign: 'center' as const, borderBottom: `3px solid ${BRAND}` }
const logoStyle = { width: '140px', height: 'auto', margin: '0 auto' }
const content = { padding: '32px' }
const h1 = { color: '#0f172a', fontSize: '24px', fontWeight: 700, margin: '0 0 16px', lineHeight: '32px' }
const text = { color: '#334155', fontSize: '16px', lineHeight: '26px', margin: '14px 0' }
const small = { color: '#64748b', fontSize: '13px', lineHeight: '20px', margin: '20px 0 0' }
const button = { backgroundColor: BRAND, borderRadius: '8px', color: '#ffffff', fontSize: '16px', fontWeight: 700, textDecoration: 'none', display: 'inline-block', padding: '14px 32px' }
const buttonWrap = { textAlign: 'center' as const, margin: '28px 0' }
const footer = { padding: '24px 32px', borderTop: '1px solid #e5e7eb', color: '#94a3b8', fontSize: '12px', lineHeight: '18px', textAlign: 'center' as const }
const link = { color: BRAND, textDecoration: 'underline' }
const code = { display: 'inline-block', background: '#f1f5f9', padding: '12px 20px', borderRadius: '8px', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '20px', fontWeight: 700, color: '#0f172a', letterSpacing: '4px' }

export const styles = { main, container, header, content, h1, text, small, button, buttonWrap, footer, link, code, logoStyle }

export function BrandShell({ preview, heading, children }: { preview: string; heading: string; children: React.ReactNode }) {
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img src={LOGO_URL} alt="Aderai" style={logoStyle} />
          </Section>
          <Section style={content}>
            <Heading style={h1}>{heading}</Heading>
            {children}
          </Section>
          <Section style={footer}>
            <Text style={{ margin: 0, color: '#94a3b8', fontSize: '12px' }}>Aderai, powered by Klaviyo.</Text>
            <Text style={{ margin: '6px 0 0', color: '#94a3b8', fontSize: '12px' }}>Need help? Email hello@aderai.io</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export { Button, Text, Link, Section }
