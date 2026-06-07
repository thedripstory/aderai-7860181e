/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { BrandShell, Button, Text, styles } from './_brand.tsx'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string }

export const RecoveryEmail = ({ recipient, confirmationUrl }: Props) => (
  <BrandShell preview="Reset your Aderai password" heading="Reset your password">
    <Text style={styles.text}>We received a request to reset the password for <strong>{recipient}</strong>. Click the button below to choose a new one. This link expires in 1 hour.</Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>Reset password</Button>
    </div>
    <Text style={styles.small}>Or copy this link:<br /><a href={confirmationUrl} style={styles.link}>{confirmationUrl}</a></Text>
    <Text style={styles.small}>If you did not request a password reset, you can safely ignore this email. Your password will not change.</Text>
  </BrandShell>
)

export default RecoveryEmail
