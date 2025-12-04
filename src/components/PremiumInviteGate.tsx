import React, { useState } from 'react';
import { Crown, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
} from 'recharts';

// Fake data for background charts
const fakeLineData = [
  { name: 'Jan', value: 4000, value2: 2400 },
  { name: 'Feb', value: 3000, value2: 1398 },
  { name: 'Mar', value: 5000, value2: 9800 },
  { name: 'Apr', value: 2780, value2: 3908 },
  { name: 'May', value: 1890, value2: 4800 },
  { name: 'Jun', value: 2390, value2: 3800 },
  { name: 'Jul', value: 3490, value2: 4300 },
];

const fakeBarData = [
  { name: 'VIP', value: 2400 },
  { name: 'Active', value: 4567 },
  { name: 'New', value: 1398 },
  { name: 'At Risk', value: 980 },
  { name: 'Churned', value: 390 },
];

const fakePieData = [
  { name: 'Engaged', value: 400 },
  { name: 'Dormant', value: 300 },
  { name: 'New', value: 200 },
  { name: 'VIP', value: 100 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

interface PremiumInviteGateProps {
  featureName: string;
}

export const PremiumInviteGate: React.FC<PremiumInviteGateProps> = ({ featureName }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSubmitted(true);
    setLoading(false);
    toast.success('Request submitted!', {
      description: "We'll be in touch soon with your invite.",
    });
  };

  return (
    <div className="relative w-full min-h-[600px] rounded-2xl overflow-hidden">
      {/* Background fake charts - blurred */}
      <div className="absolute inset-0 p-6 grid grid-cols-2 gap-6 opacity-60">
        {/* Line Chart */}
        <div className="bg-card/50 rounded-xl p-4 border border-border/30">
          <div className="h-6 w-32 bg-muted/50 rounded mb-4" />
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={fakeLineData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="hsl(var(--primary))" fill="url(#colorValue)" strokeWidth={2} />
              <Line type="monotone" dataKey="value2" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-card/50 rounded-xl p-4 border border-border/30">
          <div className="h-6 w-40 bg-muted/50 rounded mb-4" />
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={fakeBarData}>
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-card/50 rounded-xl p-4 border border-border/30">
          <div className="h-6 w-36 bg-muted/50 rounded mb-4" />
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={fakePieData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {fakePieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Stats Grid */}
        <div className="bg-card/50 rounded-xl p-4 border border-border/30">
          <div className="h-6 w-28 bg-muted/50 rounded mb-4" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-3">
                <div className="h-8 w-16 bg-muted/50 rounded mb-2" />
                <div className="h-4 w-20 bg-muted/30 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Glass blur overlay */}
      <div className="absolute inset-0 backdrop-blur-xl bg-background/60" />

      {/* Premium invite content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[600px] px-6 py-12">
        {/* Crown icon with glow */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-150" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
            <Crown className="w-10 h-10 text-primary-foreground" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Aderai Premium
        </h2>
        
        <p className="text-muted-foreground text-center max-w-md mb-2">
          {featureName} is available exclusively for Aderai Premium members.
        </p>
        
        {/* Invite-only badge */}
        <div className="flex items-center gap-2 mb-8">
          <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Invite Only</span>
          </div>
        </div>

        {submitted ? (
          /* Success state */
          <div className="flex flex-col items-center animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              We'll review your request and send an invite to <span className="font-medium text-foreground">{email}</span> if you're selected.
            </p>
          </div>
        ) : (
          /* Email form */
          <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Enter your email to request an invite
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 bg-card/50 border-border/50 focus:border-primary/50"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 gap-2"
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
        <div className="mt-10 grid grid-cols-3 gap-6 max-w-lg">
          {[
            { label: 'Advanced Analytics', icon: '📊' },
            { label: 'AI Insights', icon: '🤖' },
            { label: 'Priority Support', icon: '⚡' },
          ].map((feature) => (
            <div key={feature.label} className="flex flex-col items-center gap-2 text-center">
              <div className="text-2xl">{feature.icon}</div>
              <span className="text-xs text-muted-foreground">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
