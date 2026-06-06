import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: any) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  to?: string
}

import { template as testEmail } from './test-email.tsx'
import { template as welcome } from './welcome.tsx'
import { template as firstSegment } from './first-segment.tsx'
import { template as connectKlaviyoReminder } from './connect-klaviyo-reminder.tsx'
import { template as billingSubscriptionConfirmed } from './billing-subscription-confirmed.tsx'
import { template as billingPaymentFailed } from './billing-payment-failed.tsx'
import { template as billingSubscriptionCanceled } from './billing-subscription-canceled.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'test-email': testEmail,
  'welcome': welcome,
  'first-segment': firstSegment,
  'connect-klaviyo-reminder': connectKlaviyoReminder,
  'billing-subscription-confirmed': billingSubscriptionConfirmed,
  'billing-payment-failed': billingPaymentFailed,
  'billing-subscription-canceled': billingSubscriptionCanceled,
}
