import * as React from 'npm:react@18.3.1'
import { Text, Button } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  amount?: number | string
  currency?: string
  planName?: string
  nextBillingDate?: string
  dashboardUrl?: string
}

function formatMoney(amount?: number | string, currency?: string) {
  if (amount == null) return ''
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (Number.isNaN(num)) return ''
  const code = (currency || 'USD').toUpperCase()
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(num)
  } catch {
    return `${num.toFixed(2)} ${code}`
  }
}

const Email = ({ firstName, amount, currency, planName, nextBillingDate, dashboardUrl = 'https://aderai.io/dashboard' }: Props) => {
  const money = formatMoney(amount, currency)
  return (
    <EmailLayout preview="Your Aderai subscription is active." heading={`Subscription confirmed${firstName ? `, ${firstName}` : ''}`}>
      <Text style={styles.text}>
        Thank you for subscribing to Aderai{planName ? ` ${planName}` : ''}.
      </Text>
      {money && (
        <Text style={styles.text}>
          We charged <strong>{money}</strong> for your subscription.
          {nextBillingDate ? ` Your next renewal is on ${nextBillingDate}.` : ''}
        </Text>
      )}
      <div style={styles.buttonWrap}>
        <Button href={dashboardUrl} style={styles.button}>Go to dashboard</Button>
      </div>
      <Text style={styles.text}>
        Payment security is processed by Stripe. You can manage your subscription anytime from Settings.
      </Text>
    </EmailLayout>
  )
}

export const template = {
  component: Email,
  subject: 'Your Aderai subscription is active',
  displayName: 'Billing: Subscription Confirmed',
  previewData: { firstName: 'Sarah', amount: 39, currency: 'USD', planName: 'Pro', nextBillingDate: 'January 6, 2027', dashboardUrl: 'https://aderai.io/dashboard' },
} satisfies TemplateEntry
