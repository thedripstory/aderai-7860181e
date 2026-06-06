import * as React from 'npm:react@18.3.1'
import { Text, Button } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  endsOn?: string
  dashboardUrl?: string
}

const Email = ({ firstName, endsOn, dashboardUrl = 'https://aderai.io/settings' }: Props) => (
  <EmailLayout preview="Your Aderai subscription has been canceled." heading="Subscription canceled">
    <Text style={styles.text}>
      Hi{firstName ? ` ${firstName}` : ''}, your Aderai subscription has been canceled.
      {endsOn ? ` You will keep access until ${endsOn}.` : ''}
    </Text>
    <Text style={styles.text}>
      Changed your mind? You can resume your subscription anytime.
    </Text>
    <div style={styles.buttonWrap}>
      <Button href={dashboardUrl} style={styles.button}>Manage subscription</Button>
    </div>
  </EmailLayout>
)

export const template = {
  component: Email,
  subject: 'Your Aderai subscription has been canceled',
  displayName: 'Billing: Subscription Canceled',
  previewData: { firstName: 'Sarah', endsOn: 'January 6, 2027', dashboardUrl: 'https://aderai.io/settings' },
} satisfies TemplateEntry
