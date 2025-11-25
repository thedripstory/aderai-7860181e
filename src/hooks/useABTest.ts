import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ABVariant = 'A' | 'B';

interface ABTest {
  name: string;
  variants: {
    A: number; // weight 0-1
    B: number; // weight 0-1
  };
}

const AB_TESTS: Record<string, ABTest> = {
  'hero-headline': {
    name: 'hero-headline',
    variants: { A: 0.5, B: 0.5 }
  }
};

export function useABTest(testName: string): ABVariant {
  const [variant, setVariant] = useState<ABVariant>('A');

  useEffect(() => {
    // Check if user already has a variant assigned
    const storageKey = `ab_test_${testName}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored && (stored === 'A' || stored === 'B')) {
      setVariant(stored as ABVariant);
      return;
    }

    // Assign new variant based on weights
    const test = AB_TESTS[testName];
    if (!test) {
      console.warn(`AB test "${testName}" not found`);
      return;
    }

    const random = Math.random();
    const assignedVariant: ABVariant = random < test.variants.A ? 'A' : 'B';
    
    setVariant(assignedVariant);
    localStorage.setItem(storageKey, assignedVariant);

    // Track variant assignment
    trackABTestView(testName, assignedVariant);
  }, [testName]);

  return variant;
}

async function trackABTestView(testName: string, variant: ABVariant) {
  try {
    await supabase.from('analytics_events').insert({
      user_id: '00000000-0000-0000-0000-000000000000', // anonymous
      event_name: 'ab_test_view',
      event_metadata: {
        test_name: testName,
        variant: variant
      },
      page_url: window.location.href
    });
  } catch (error) {
    console.error('Failed to track AB test view:', error);
  }
}

export async function trackABTestConversion(testName: string) {
  try {
    const storageKey = `ab_test_${testName}`;
    const variant = localStorage.getItem(storageKey);
    
    if (!variant) return;

    await supabase.from('analytics_events').insert({
      user_id: '00000000-0000-0000-0000-000000000000', // anonymous
      event_name: 'ab_test_conversion',
      event_metadata: {
        test_name: testName,
        variant: variant
      },
      page_url: window.location.href
    });
  } catch (error) {
    console.error('Failed to track AB test conversion:', error);
  }
}
