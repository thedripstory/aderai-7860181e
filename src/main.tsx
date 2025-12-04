import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Initialize PostHog lazily to avoid React version conflicts
if (typeof window !== 'undefined') {
  import('posthog-js').then(({ default: posthog }) => {
    const posthogKey = import.meta.env.VITE_PUBLIC_POSTHOG_KEY || 'phc_paGJpOfW3y5PtPVD3N24U7Ihn6ErIxgWs6BRxxGJG2V'
    const posthogHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com'
    
    if (posthogKey) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        session_recording: {
          maskAllInputs: true,
        },
      })
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
