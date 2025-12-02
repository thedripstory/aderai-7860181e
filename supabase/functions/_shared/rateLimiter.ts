import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

interface RateLimitConfig {
  maxRequests: number;
  windowMinutes: number;
  identifier: string; // userId or IP
  operation: string;
}

export async function checkRateLimit(
  supabase: any,
  config: RateLimitConfig
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const windowStart = new Date(Date.now() - config.windowMinutes * 60 * 1000);

  // Count requests in current window
  const { data, error } = await supabase
    .from('rate_limits')
    .select('count')
    .eq('identifier', config.identifier)
    .eq('operation', config.operation)
    .gte('created_at', windowStart.toISOString())
    .maybeSingle();

  const currentCount = data?.count || 0;

  if (currentCount >= config.maxRequests) {
    const resetAt = new Date(windowStart.getTime() + config.windowMinutes * 60 * 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
    };
  }

  // Increment counter
  await supabase.from('rate_limits').insert({
    identifier: config.identifier,
    operation: config.operation,
    count: 1,
  });

  return {
    allowed: true,
    remaining: config.maxRequests - currentCount - 1,
    resetAt: new Date(windowStart.getTime() + config.windowMinutes * 60 * 1000),
  };
}
