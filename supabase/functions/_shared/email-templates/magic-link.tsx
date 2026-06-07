/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { BrandShell, Button, Text, styles } from './_brand.tsx'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string }

export const MagicLinkEmail = ({ recipient, confirmationUrl }: Props) => (
  <BrandShell preview="Your Aderai sign-in link" heading="Sign in to Aderai">
    <Text style={styles.text}>Click the button below to sign in to Aderai as <strong>{recipient}</strong>. This link expires in 1 hour and can only be used once.</Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>Sign in to Aderai</Button>
    </div>
    <Text style={styles.small}>Or copy this link:<br /><a href={confirmationUrl} style={styles.link}>{confirmationUrl}</a></Text>
    <Text style={styles.small}>If you did not request a sign-in link, you can safely ignore this email.</Text>
  </BrandShell>
)

export default MagicLinkEmail
