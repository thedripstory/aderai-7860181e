import * as React from 'npm:react@18.3.1'
import { Text, Button } from 'npm:@react-email/components@0.0.22'
import { EmailLayout, styles } from './_layout.tsx'
import type { TemplateEntry } from './registry.ts'

interface Props {
  firstName?: string
  amount?: number | string
  currency?: string
  billingPortalUrl?: string
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

const Email = ({ firstName, amount, currency, billingPortalUrl = 'https://aderai.io/settings' }: Props) => {
  const money = formatMoney(amount, currency)
  return (
    <EmailLayout preview="Action required: your Aderai payment failed." heading="We could not process your payment">
      <Text style={styles.text}>
        Hi{firstName ? ` ${firstName}` : ''}, your latest Aderai payment {money ? `of ${money} ` : ''}did not go through.
      </Text>
      <Text style={styles.text}>
        To keep your account active, please update your payment method.
      </Text>
      <div style={styles.buttonWrap}>
        <Button href={billingPortalUrl} style={styles.button}>Update payment method</Button>
      </div>
      <Text style={styles.text}>
        Stripe will retry the charge automatically over the next few days.
      </Text>
    </EmailLayout>
  )
}

export const template = {
  component: Email,
  subject: 'Action required: Aderai payment failed',
  displayName: 'Billing: Payment Failed',
  previewData: { firstName: 'Sarah', amount: 39, currency: 'USD', billingPortalUrl: 'https://aderai.io/settings' },
} satisfies TemplateEntry
