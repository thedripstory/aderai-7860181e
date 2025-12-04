import React, { useState } from 'react';
import { Crown, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ComposedChart,
  Scatter,
} from 'recharts';

// Fake data for background charts - more variety
const fakeLineData = [
  { name: 'Jan', value: 4000, value2: 2400, value3: 3200 },
  { name: 'Feb', value: 3000, value2: 1398, value3: 4100 },
  { name: 'Mar', value: 5000, value2: 9800, value3: 2800 },
  { name: 'Apr', value: 2780, value2: 3908, value3: 5200 },
  { name: 'May', value: 1890, value2: 4800, value3: 3600 },
  { name: 'Jun', value: 2390, value2: 3800, value3: 4400 },
  { name: 'Jul', value: 3490, value2: 4300, value3: 5100 },
];

const fakeBarData = [
  { name: 'VIP', value: 2400, value2: 1800 },
  { name: 'Active', value: 4567, value2: 3200 },
  { name: 'New', value: 1398, value2: 2100 },
  { name: 'At Risk', value: 980, value2: 1400 },
  { name: 'Churned', value: 390, value2: 600 },
  { name: 'Win-back', value: 1200, value2: 900 },
];

const fakePieData = [
  { name: 'Engaged', value: 400 },
  { name: 'Dormant', value: 300 },
  { name: 'New', value: 200 },
  { name: 'VIP', value: 100 },
  { name: 'Returning', value: 250 },
];

const fakeRadarData = [
  { subject: 'Open Rate', A: 120, B: 110 },
  { subject: 'Click Rate', A: 98, B: 130 },
  { subject: 'Conversion', A: 86, B: 130 },
  { subject: 'Revenue', A: 99, B: 100 },
  { subject: 'Engagement', A: 85, B: 90 },
  { subject: 'Retention', A: 65, B: 85 },
];

const fakeScatterData = [
  { x: 100, y: 200, z: 200 },
  { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 },
  { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 },
  { x: 110, y: 280, z: 200 },
];

const fakeRevenueData = [
  { name: 'W1', revenue: 24000, orders: 180 },
  { name: 'W2', revenue: 31000, orders: 220 },
  { name: 'W3', revenue: 28000, orders: 195 },
  { name: 'W4', revenue: 42000, orders: 310 },
];

// Vibrant colors for FOMO effect
const COLORS = [
  '#FF6B6B', // Coral red
  '#4ECDC4', // Teal
  '#45B7D1', // Sky blue
  '#96CEB4', // Sage green
  '#FFEAA7', // Soft yellow
  '#DDA0DD', // Plum
  '#FF8C42', // Orange
  '#98D8C8', // Mint
];

const CURRENCIES = [
  { value: 'USD', label: 'USD ($)', symbol: '$' },
  { value: 'EUR', label: 'EUR (€)', symbol: '€' },
  { value: 'GBP', label: 'GBP (£)', symbol: '£' },
  { value: 'AUD', label: 'AUD (A$)', symbol: 'A$' },
  { value: 'CAD', label: 'CAD (C$)', symbol: 'C$' },
  { value: 'INR', label: 'INR (₹)', symbol: '₹' },
];

interface PremiumInviteGateProps {
  featureName: string;
}

export const PremiumInviteGate: React.FC<PremiumInviteGateProps> = ({ featureName }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    brandName: '',
    email: '',
    projectedRevenue: '',
    currency: 'USD',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.firstName.trim() || !formData.brandName.trim() || !formData.projectedRevenue.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('premium_invite_requests')
        .insert({
          first_name: formData.firstName.trim(),
          brand_name: formData.brandName.trim(),
          email: formData.email.trim(),
          projected_yearly_revenue: parseFloat(formData.projectedRevenue),
          currency: formData.currency,
          feature_requested: featureName,
          status: 'pending',
        });

      if (error) throw error;
      
      setSubmitted(true);
      toast.success('Request submitted!', {
        description: "We'll be in touch soon with your invite.",
      });
    } catch (error) {
      toast.error('Failed to submit request', {
        description: 'Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full min-h-[700px] rounded-2xl overflow-hidden">
      {/* Background fake charts - reduced blur for visibility */}
      <div className="absolute inset-0 p-4 grid grid-cols-3 gap-4 opacity-80">
        {/* Row 1 */}
        {/* Area Chart with multiple lines */}
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="h-5 w-28 bg-muted/40 rounded mb-3" />
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={fakeLineData}>
              <defs>
                <linearGradient id="colorValue1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorValue2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#FF6B6B" fill="url(#colorValue1)" strokeWidth={2} />
              <Area type="monotone" dataKey="value2" stroke="#4ECDC4" fill="url(#colorValue2)" strokeWidth={2} />
              <Line type="monotone" dataKey="value3" stroke="#FFEAA7" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stacked Bar Chart */}
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="h-5 w-32 bg-muted/40 rounded mb-3" />
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={fakeBarData}>
              <Bar dataKey="value" stackId="a" fill="#45B7D1" radius={[0, 0, 0, 0]} />
              <Bar dataKey="value2" stackId="a" fill="#FF8C42" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="h-5 w-24 bg-muted/40 rounded mb-3" />
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={fakePieData}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
              >
                {fakePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Row 2 */}
        {/* Radar Chart */}
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="h-5 w-36 bg-muted/40 rounded mb-3" />
          <ResponsiveContainer width="100%" height={140}>
            <RadarChart data={fakeRadarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 8 }} />
              <Radar name="Campaign A" dataKey="A" stroke="#DDA0DD" fill="#DDA0DD" fillOpacity={0.4} />
              <Radar name="Campaign B" dataKey="B" stroke="#96CEB4" fill="#96CEB4" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="h-5 w-28 bg-muted/40 rounded mb-3" />
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={fakeLineData}>
              <Line type="monotone" dataKey="value" stroke="#FF6B6B" strokeWidth={2} dot={{ fill: '#FF6B6B', r: 3 }} />
              <Line type="monotone" dataKey="value2" stroke="#45B7D1" strokeWidth={2} dot={{ fill: '#45B7D1', r: 3 }} />
              <Line type="monotone" dataKey="value3" stroke="#96CEB4" strokeWidth={2} dot={{ fill: '#96CEB4', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Grid */}
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="h-5 w-20 bg-muted/40 rounded mb-3" />
          <div className="grid grid-cols-2 gap-2">
            {[
              { color: '#FF6B6B', value: '$42.5K' },
              { color: '#4ECDC4', value: '12.8%' },
              { color: '#45B7D1', value: '3,420' },
              { color: '#FF8C42', value: '+24%' },
            ].map((stat, i) => (
              <div key={i} className="bg-muted/20 rounded-lg p-2">
                <div className="text-lg font-bold" style={{ color: stat.color }}>{stat.value}</div>
                <div className="h-3 w-14 bg-muted/30 rounded mt-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Row 3 */}
        {/* Composed Chart */}
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="h-5 w-32 bg-muted/40 rounded mb-3" />
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={fakeRevenueData}>
              <Bar dataKey="orders" fill="#98D8C8" radius={[4, 4, 0, 0]} />
              <Line type="monotone" dataKey="revenue" stroke="#FF6B6B" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Another Pie - donut style */}
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="h-5 w-28 bg-muted/40 rounded mb-3" />
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={fakeBarData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {fakeBarData.map((entry, index) => (
                  <Cell key={`cell2-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart horizontal style */}
        <div className="bg-card/40 rounded-xl p-3 border border-border/20">
          <div className="h-5 w-24 bg-muted/40 rounded mb-3" />
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={fakeBarData.slice(0, 4)} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Bar dataKey="value" fill="#DDA0DD" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Glass blur overlay - reduced blur */}
      <div className="absolute inset-0 backdrop-blur-md bg-background/50" />

      {/* Premium invite content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[700px] px-6 py-10">
        {/* Crown icon with glow */}
        <div className="relative mb-5">
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150" />
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
            <Crown className="w-8 h-8 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Aderai Premium
        </h2>
        
        <p className="text-muted-foreground text-center max-w-md mb-2 text-sm">
          {featureName} is available exclusively for Aderai Premium members.
        </p>
        
        {/* Invite-only badge */}
        <div className="flex items-center gap-2 mb-6">
          <div className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Invite Only</span>
          </div>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">You're on the list!</h3>
            <p className="text-muted-foreground text-center max-w-sm text-sm">
              We'll review your request and send an invite to <span className="font-medium text-foreground">{formData.email}</span> if you're selected.
            </p>
          </div>
        ) : (
          /* Full form */
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">First Name</label>
                <Input
                  type="text"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="h-10 bg-card/50 border-border/50 focus:border-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Brand Name</label>
                <Input
                  type="text"
                  placeholder="Acme Inc"
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  className="h-10 bg-card/50 border-border/50 focus:border-primary/50"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="h-10 bg-card/50 border-border/50 focus:border-primary/50"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Projected Yearly Revenue</label>
                <Input
                  type="number"
                  placeholder="500000"
                  value={formData.projectedRevenue}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectedRevenue: e.target.value }))}
                  className="h-10 bg-card/50 border-border/50 focus:border-primary/50"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Currency</label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger className="h-10 bg-card/50 border-border/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-10 gap-2 mt-4"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Request Invite
                </>
              )}
            </Button>
          </form>
        )}

        {/* Features preview */}
        <div className="mt-8 grid grid-cols-3 gap-5 max-w-lg">
          {[
            { label: 'Advanced Analytics', icon: '📊' },
            { label: 'AI Insights', icon: '🤖' },
            { label: 'Priority Support', icon: '⚡' },
          ].map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-1.5 text-center">
              <div className="text-xl">{feature.icon}</div>
              <span className="text-xs text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
