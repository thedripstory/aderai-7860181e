import * as React from 'npm:react@18.3.1'
import { Text, Button } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  segmentName?: string
  dashboardUrl?: string
}

const Email = ({ firstName, segmentName, dashboardUrl = 'https://aderai.io/dashboard' }: Props) => (
  <EmailLayout preview="Your first Aderai segment is live in Klaviyo." heading="Your first segment is live">
    <Text style={styles.text}>
      Nice work{firstName ? `, ${firstName}` : ''}. {segmentName ? `"${segmentName}"` : 'Your new segment'} is now live in your Klaviyo account.
    </Text>
    <Text style={styles.text}>
      Aderai will keep refreshing this segment automatically as your customer behaviour changes. You can use it in any campaign or flow right away.
    </Text>
    <div style={styles.buttonWrap}>
      <Button href={dashboardUrl} style={styles.button}>Build more segments</Button>
    </div>
    <Text style={styles.text}>
      Tip: stack 2 or 3 segments inside a single flow to personalise messaging without rewriting the whole journey.
    </Text>
  </EmailLayout>
)

export const template = {
  component: Email,
  subject: 'Your first Aderai segment is live',
  displayName: 'First Segment Created',
  previewData: { firstName: 'Sarah', segmentName: 'High value buyers (90 days)', dashboardUrl: 'https://aderai.io/dashboard' },
} satisfies TemplateEntry
