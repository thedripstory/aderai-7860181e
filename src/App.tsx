import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import KlaviyoSetup from "./pages/KlaviyoSetup";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import UnifiedDashboard from "./pages/UnifiedDashboard";
import AdminPortal from "./pages/AdminPortal";
import FeatureShowcase from "./pages/FeatureShowcase";
import SegmentHealthDashboard from "./pages/SegmentHealthDashboard";
import AIFeaturesDashboard from "./pages/AIFeaturesDashboard";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<UnifiedDashboard />} />
            <Route path="/admin" element={<AdminPortal />} />
            <Route path="/login" element={<Auth initialView="signin" />} />
            <Route path="/signup" element={<Auth initialView="signup" />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/klaviyo-setup" element={<KlaviyoSetup />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/features" element={<FeatureShowcase />} />
            <Route path="/segment-health" element={<SegmentHealthDashboard />} />
            <Route path="/ai-features" element={<AIFeaturesDashboard />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
