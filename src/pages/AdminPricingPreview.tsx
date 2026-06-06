import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PRICING, type CurrencyCode, formatPricePerMonth } from '@/lib/pricing';
import { countryToCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, ExternalLink } from 'lucide-react';

// Mirror of the Stripe Price IDs in stripe-create-checkout/index.ts (display only).
const PRICE_IDS: Record<CurrencyCode, string> = {
  usd: 'price_1TfQ330lE1soQQfxIEL5EHtQ',
  gbp: 'price_1TfQ350lE1soQQfxt9JfdVjD',
  aud: 'price_1TfQ360lE1soQQfxqPr4jXt9',
  cad: 'price_1TfQ360lE1soQQfxWwoSZL6n',
};

export default function AdminPricingPreview() {
  const [currency, setCurrency] = useState<CurrencyCode>('usd');
  const [country, setCountry] = useState('US');
  const [loading, setLoading] = useState(false);

  const applyCountry = (code: string) => {
    setCountry(code.toUpperCase());
    setCurrency(countryToCurrency(code));
  };

  const testCheckout = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('stripe-create-checkout', {
        body: { origin: window.location.origin, currency },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank', 'noopener');
        toast.success(`Opened Stripe Checkout in ${currency.toUpperCase()}`);
      }
    } catch (e: any) {
      toast.error(e?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const info = PRICING[currency];

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin"><ArrowLeft className="w-4 h-4 mr-1" /> Back to admin</Link>
        </Button>
        <h1 className="text-2xl font-bold">Pricing Preview</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Simulate region</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as CurrencyCode)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD — $39</SelectItem>
                  <SelectItem value="gbp">GBP — £39</SelectItem>
                  <SelectItem value="aud">AUD — A$59</SelectItem>
                  <SelectItem value="cad">CAD — C$59</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Country (ISO-2, e.g. GB, AU, CA, US)</Label>
              <Input
                value={country}
                onChange={(e) => applyCountry(e.target.value)}
                maxLength={2}
                className="uppercase"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Homepage copy preview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border p-6 bg-muted/30">
            <p className="text-sm text-muted-foreground">Hero CTA price</p>
            <p className="text-4xl font-bold mt-2">{info.display}<span className="text-base font-normal text-muted-foreground">/month</span></p>
            <p className="text-sm text-muted-foreground mt-4">"Get unlimited segments for just {formatPricePerMonth(currency)}"</p>
          </div>
          <div className="text-sm text-muted-foreground">
            Symbol: <code>{info.symbol}</code> · Amount: <code>{info.amount}</code> · Code: <code>{info.code}</code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resolved Stripe Price ID</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{currency.toUpperCase()}</Badge>
            <code className="text-sm">{PRICE_IDS[currency]}</code>
          </div>
          <Button onClick={testCheckout} disabled={loading}>
            {loading ? 'Creating session…' : 'Test live Stripe checkout'} <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-muted-foreground">
            Opens a real Stripe Checkout session in a new tab using your admin account. Do not complete the purchase.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All currencies at a glance</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr><th className="py-2">Currency</th><th>Display</th><th>Stripe Price ID</th></tr>
            </thead>
            <tbody>
              {(Object.keys(PRICING) as CurrencyCode[]).map((c) => (
                <tr key={c} className="border-t">
                  <td className="py-2">{c.toUpperCase()}</td>
                  <td>{PRICING[c].display}/month</td>
                  <td><code className="text-xs">{PRICE_IDS[c]}</code></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
