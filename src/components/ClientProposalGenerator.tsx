import { useState } from "react";
import { FileText, Download, Sparkles, DollarSign, TrendingUp, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export const ClientProposalGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [proposalData, setProposalData] = useState({
    clientName: "",
    industry: "",
    emailListSize: "",
    currentRevenue: "",
    goals: ""
  });
  const { toast } = useToast();

  const generateProposal = () => {
    if (!proposalData.clientName || !proposalData.industry) {
      toast({
        title: "Missing information",
        description: "Please fill in client name and industry",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Proposal Generated!",
        description: "Your custom proposal is ready to download",
      });
    }, 2000);
  };

  // Calculate projected value
  const calculateProjection = () => {
    const listSize = parseInt(proposalData.emailListSize) || 10000;
    const currentRev = parseInt(proposalData.currentRevenue) || 5000;
    
    return {
      monthlyIncrease: Math.round(currentRev * 0.35),
      annualValue: Math.round(currentRev * 0.35 * 12),
      timesSaved: 10,
      roi: Math.round((currentRev * 0.35) / 399 * 100) // Based on Agency Pro pricing
    };
  };

  const projections = calculateProjection();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8 text-primary" />
          AI Proposal Generator
        </h2>
        <p className="text-muted-foreground">
          Create data-driven proposals with ROI calculators in seconds
        </p>
      </div>

      {/* Input Form */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-bold mb-4">Client Information</h3>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="client-name">Client Name</Label>
              <Input
                id="client-name"
                placeholder="Acme Beauty Co."
                value={proposalData.clientName}
                onChange={(e) => setProposalData({ ...proposalData, clientName: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select
                value={proposalData.industry}
                onValueChange={(value) => setProposalData({ ...proposalData, industry: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beauty">Beauty & Cosmetics</SelectItem>
                  <SelectItem value="fashion">Fashion & Apparel</SelectItem>
                  <SelectItem value="wellness">Health & Wellness</SelectItem>
                  <SelectItem value="home">Home & Decor</SelectItem>
                  <SelectItem value="outdoor">Outdoor & Sports</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="food">Food & Beverage</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="list-size">Email List Size</Label>
              <Input
                id="list-size"
                type="number"
                placeholder="10000"
                value={proposalData.emailListSize}
                onChange={(e) => setProposalData({ ...proposalData, emailListSize: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="revenue">Current Monthly Email Revenue</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="revenue"
                  type="number"
                  placeholder="5000"
                  className="pl-7"
                  value={proposalData.currentRevenue}
                  onChange={(e) => setProposalData({ ...proposalData, currentRevenue: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="goals">Client Goals (Optional)</Label>
              <Textarea
                id="goals"
                placeholder="Increase email revenue, improve engagement, grow VIP segment..."
                value={proposalData.goals}
                onChange={(e) => setProposalData({ ...proposalData, goals: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <Button 
            onClick={generateProposal}
            disabled={loading}
            className="w-full mt-4"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Custom Proposal
              </>
            )}
          </Button>
        </Card>

        {/* Live Preview / Projections */}
        <div className="space-y-4">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-background">
            <h3 className="text-xl font-bold mb-4">Projected Value</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Monthly Revenue Increase</span>
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-3xl font-bold text-emerald-600">
                  +${projections.monthlyIncrease.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  35% average lift from better segmentation
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Annual Value</span>
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary">
                  ${projections.annualValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  First year projected impact
                </p>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Time Saved Monthly</span>
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent">
                  {projections.timesSaved}+ hours
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Worth ${projections.timesSaved * 100} in labor
                </p>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Return on Investment</div>
                <div className="text-4xl font-bold">{projections.roi}x ROI</div>
                <p className="text-xs text-muted-foreground mt-1">
                  First month payback
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-bold mb-3">Proposal Includes:</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>Custom ROI calculator based on client data</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>Industry-specific segment recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>90-day implementation timeline</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>Success metrics and KPIs</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>Competitive analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <span>White-label branded PDF</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>

      {/* Sample Sections Preview */}
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Proposal Sections</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border border-border rounded-lg">
            <div className="font-semibold mb-2">1. Executive Summary</div>
            <p className="text-sm text-muted-foreground">
              High-level overview of opportunities and projected impact
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="font-semibold mb-2">2. Current State Analysis</div>
            <p className="text-sm text-muted-foreground">
              Assessment of existing email program and gaps
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="font-semibold mb-2">3. Recommended Strategy</div>
            <p className="text-sm text-muted-foreground">
              Segment deployment plan and optimization roadmap
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="font-semibold mb-2">4. ROI Projections</div>
            <p className="text-sm text-muted-foreground">
              Month-by-month financial impact forecast
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="font-semibold mb-2">5. Implementation Timeline</div>
            <p className="text-sm text-muted-foreground">
              90-day rollout plan with milestones
            </p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <div className="font-semibold mb-2">6. Investment & Pricing</div>
            <p className="text-sm text-muted-foreground">
              Package options and service agreements
            </p>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button className="flex-1" variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
        <Button className="flex-1" disabled={!proposalData.clientName}>
          <Download className="w-4 h-4 mr-2" />
          Export Final Proposal
        </Button>
      </div>
    </div>
  );
};
