/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { BrandShell, Button, Text, styles } from './_brand.tsx'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string }

export const InviteEmail = ({ recipient, confirmationUrl }: Props) => (
  <BrandShell preview="You have been invited to Aderai" heading="You're invited to Aderai">
    <Text style={styles.text}>Hi <strong>{recipient}</strong>, you have been invited to join Aderai. Accept the invite to get started building Klaviyo segments in minutes.</Text>
    <div style={styles.buttonWrap}>
      <Button style={styles.button} href={confirmationUrl}>Accept invite</Button>
    </div>
    <Text style={styles.small}>Or copy this link:<br /><a href={confirmationUrl} style={styles.link}>{confirmationUrl}</a></Text>
  </BrandShell>
)

export default InviteEmail
