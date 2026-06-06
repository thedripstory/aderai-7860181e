import * as React from 'npm:react@18.3.1'
import { Text, Button } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  dashboardUrl?: string
}

const Email = ({ firstName, dashboardUrl = 'https://aderai.io/dashboard' }: Props) => (
  <EmailLayout preview="Welcome to Aderai. Let's get your Klaviyo connected." heading={`Welcome to Aderai${firstName ? `, ${firstName}` : ''}`}>
    <Text style={styles.text}>
      Aderai turns your Klaviyo data into smart, ready to use segments so you can ship better campaigns faster.
    </Text>
    <Text style={styles.text}>
      To start, connect your Klaviyo account. It takes about 30 seconds.
    </Text>
    <div style={styles.buttonWrap}>
      <Button href={dashboardUrl} style={styles.button}>Connect Klaviyo</Button>
    </div>
    <Text style={styles.text}>
      Once connected, our AI will suggest high impact segments tailored to your store. You stay in control of every segment that gets created.
    </Text>
  </EmailLayout>
)

export const template = {
  component: Email,
  subject: 'Welcome to Aderai',
  displayName: 'Welcome',
  previewData: { firstName: 'Sarah', dashboardUrl: 'https://aderai.io/dashboard' },
} satisfies TemplateEntry
