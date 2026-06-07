/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { BrandShell, Button, Text, styles } from './_brand.tsx'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string; email?: string; newEmail?: string }

export const EmailChangeEmail = ({ confirmationUrl, email, newEmail, recipient }: Props) => (
  <BrandShell preview="Confirm your new Aderai email address" heading="Confirm your new email">
    <Text style={styles.text}>You requested to change the email on your Aderai account{email ? <> from <strong>{email}</strong></> : null}{newEmail ? <> to <strong>{newEmail}</strong></> : <> to <strong>{recipient}</strong></>}. Confirm below to complete the change.</Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>Confirm new email</Button>
    </div>
    <Text style={styles.small}>Or copy this link:<br /><a href={confirmationUrl} style={styles.link}>{confirmationUrl}</a></Text>
    <Text style={styles.small}>If you did not request this change, please contact hello@aderai.io right away.</Text>
  </BrandShell>
)

export default EmailChangeEmail
