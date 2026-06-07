/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { BrandShell, Button, Text, styles } from './_brand.tsx'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string }

export const SignupEmail = ({ siteName, recipient, confirmationUrl }: Props) => (
  <BrandShell preview={`Confirm your email to start using ${siteName}`} heading="Confirm your email">
    <Text style={styles.text}>Welcome to Aderai. Please confirm <strong>{recipient}</strong> to activate your account and unlock your Klaviyo segment workspace.</Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>Confirm email</Button>
    </div>
    <Text style={styles.small}>If the button does not work, copy and paste this link into your browser:<br /><a href={confirmationUrl} style={styles.link}>{confirmationUrl}</a></Text>
    <Text style={styles.small}>If you did not sign up for Aderai, you can safely ignore this email.</Text>
  </BrandShell>
)

export default SignupEmail
