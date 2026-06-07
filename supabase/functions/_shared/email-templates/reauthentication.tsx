/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { BrandShell, Text, styles } from './_brand.tsx'

interface Props { siteName: string; siteUrl: string; recipient: string; token: string }

export const ReauthenticationEmail = ({ token }: Props) => (
  <BrandShell preview="Your Aderai verification code" heading="Verify it's you">
    <Text style={styles.text}>Use the verification code below to confirm your identity. This code expires in 10 minutes.</Text>
    <div style={{ textAlign: 'center', margin: '28px 0' }}>
      <span style={styles.code}>{token}</span>
    </div>
    <Text style={styles.small}>If you did not request this code, please secure your account by resetting your password.</Text>
  </BrandShell>
)

export default ReauthenticationEmail
