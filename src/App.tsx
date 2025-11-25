import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const KlaviyoSetup = lazy(() => import("./pages/KlaviyoSetup"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UnifiedDashboard = lazy(() => import("./pages/UnifiedDashboard"));
const AdminPortal = lazy(() => import("./pages/AdminPortal"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const FeatureShowcase = lazy(() => import("./pages/FeatureShowcase"));
const SegmentHealthDashboard = lazy(() => import("./pages/SegmentHealthDashboard"));
const AIFeaturesDashboard = lazy(() => import("./pages/AIFeaturesDashboard"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="relative w-16 h-16">
      <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
      <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
      </div>
      <div className="absolute inset-0 animate-spin" style={{ animationDuration: '2s' }}>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
      </div>
      <div className="absolute inset-0 animate-[spin_2s_linear_infinite_reverse]">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <GlobalErrorBoundary>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner 
            position="top-right"
            expand={true}
            richColors
            closeButton
          />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
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
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminProtectedRoute><AdminPortal /></AdminProtectedRoute>} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </GlobalErrorBoundary>
);

export default App;
