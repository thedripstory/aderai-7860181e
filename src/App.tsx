import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import BrandLogin from "./pages/BrandLogin";
import AgencyLogin from "./pages/AgencyLogin";
import BrandOnboarding from "./pages/BrandOnboarding";
import AgencyOnboarding from "./pages/AgencyOnboarding";
import KlaviyoSetup from "./pages/KlaviyoSetup";
import AffiliatePage from "./pages/AffiliatePage";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AcceptInvite from "./pages/AcceptInvite";
import BrandDashboard from "./pages/BrandDashboard";
import AgencyDashboard from "./pages/AgencyDashboard";
import UnifiedDashboard from "./pages/UnifiedDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/brand-dashboard" element={<UnifiedDashboard />} />
          <Route path="/agency-dashboard" element={<AgencyDashboard />} />
          <Route path="/dashboard" element={<UnifiedDashboard />} />
          <Route 
            path="/app" 
            element={<Index />} 
          />
          <Route 
            path="/signup" 
            element={<Auth initialView="choice" onComplete={() => {}} />} 
          />
          <Route path="/brand-login" element={<BrandLogin />} />
          <Route path="/agency-login" element={<AgencyLogin />} />
          <Route 
            path="/login" 
            element={<BrandLogin />} 
          />
          <Route path="/onboarding/brand" element={<BrandOnboarding />} />
          <Route path="/onboarding/agency" element={<AgencyOnboarding />} />
          <Route path="/klaviyo-setup" element={<KlaviyoSetup />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/affiliate" element={<AffiliatePage />} />
          <Route path="/accept-invite" element={<AcceptInvite />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
