import * as React from 'npm:react@18.3.1'
import { Text, Button } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  dashboardUrl?: string
}

const Email = ({ firstName, dashboardUrl = 'https://aderai.io/dashboard' }: Props) => (
  <EmailLayout preview="One step left: connect your Klaviyo account to Aderai." heading="Connect your Klaviyo account">
    <Text style={styles.text}>
      Hi{firstName ? ` ${firstName}` : ''}, your Aderai account is ready, but it cannot do much without your Klaviyo data.
    </Text>
    <Text style={styles.text}>
      Add your Klaviyo private API key (it stays encrypted) and Aderai will start suggesting segments tailored to your store.
    </Text>
    <div style={styles.buttonWrap}>
      <Button href={dashboardUrl} style={styles.button}>Connect Klaviyo now</Button>
    </div>
    <Text style={styles.text}>
      This is a one time setup. We will only send this reminder once.
    </Text>
  </EmailLayout>
)

export const template = {
  component: Email,
  subject: 'Connect your Klaviyo to start using Aderai',
  displayName: 'Connect Klaviyo Reminder',
  previewData: { firstName: 'Sarah', dashboardUrl: 'https://aderai.io/dashboard' },
} satisfies TemplateEntry
