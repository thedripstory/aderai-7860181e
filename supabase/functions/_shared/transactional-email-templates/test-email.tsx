import * as React from 'npm:react@18.3.1'
import { Text } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  recipient?: string
  sentAt?: string
}

const Email = ({ recipient, sentAt }: Props) => (
  <EmailLayout preview="Aderai email delivery test." heading="Aderai test email">
    <Text style={styles.text}>
      This is a test email sent from notify.aderai.io to verify that your Aderai email delivery is working end to end.
    </Text>
    {recipient && (
      <Text style={styles.text}>Recipient: <strong>{recipient}</strong></Text>
    )}
    {sentAt && (
      <Text style={styles.text}>Sent at: <strong>{sentAt}</strong></Text>
    )}
    <Text style={styles.text}>
      If you received this in your inbox (not spam), your sender domain, DKIM, and SPF are configured correctly.
    </Text>
  </EmailLayout>
)

export const template = {
  component: Email,
  subject: 'Aderai email delivery test',
  displayName: 'Test Email',
  previewData: { recipient: 'you@example.com', sentAt: new Date().toISOString() },
} satisfies TemplateEntry
