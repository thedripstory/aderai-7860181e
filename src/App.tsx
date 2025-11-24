import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
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
            <Route path="/login" element={<PublicRoute><Auth initialView="signin" /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Auth initialView="signup" /></PublicRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/klaviyo-setup" element={<ProtectedRoute><KlaviyoSetup /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/features" element={<ProtectedRoute><FeatureShowcase /></ProtectedRoute>} />
            <Route path="/segment-health" element={<ProtectedRoute><SegmentHealthDashboard /></ProtectedRoute>} />
            <Route path="/ai-features" element={<ProtectedRoute><AIFeaturesDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><AdminPortal /></ProtectedRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
