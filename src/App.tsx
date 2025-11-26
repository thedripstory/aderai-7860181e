import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { AderaiPreloader } from "@/components/AderaiPreloader";
import { LoadingState } from "@/components/ui/loading-state";

// Lazy load pages for better performance
const Index = lazy(() => import("./pages/Index"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const KlaviyoSetup = lazy(() => import("./pages/KlaviyoSetup"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UnifiedDashboard = lazy(() => import("./pages/UnifiedDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const FeatureShowcase = lazy(() => import("./pages/FeatureShowcase"));
const SegmentHealthDashboard = lazy(() => import("./pages/SegmentHealthDashboard"));
const AIFeaturesDashboard = lazy(() => import("./pages/AIFeaturesDashboard"));
const HelpCenter = lazy(() => import("./pages/HelpCenter"));

const queryClient = new QueryClient();

// Simple loader for subsequent page loads
const SimpleLoader = () => (
  <div className="h-screen w-full bg-background flex items-center justify-center">
    <div className="relative w-8 h-8">
      <div className="absolute inset-0 border-2 border-transparent border-t-primary border-r-primary rounded-full animate-spin" />
      <div className="absolute inset-1 border-2 border-transparent border-b-accent border-l-accent rounded-full animate-[spin_0.8s_linear_infinite_reverse]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
      </div>
    </div>
  </div>
);

const App = () => {
  const [isFirstLoad, setIsFirstLoad] = useState(() => {
    // Check if this is the first load of the session
    return !sessionStorage.getItem('aderai_loaded');
  });

  useEffect(() => {
    // Mark as loaded after first render
    if (isFirstLoad) {
      sessionStorage.setItem('aderai_loaded', 'true');
    }
  }, [isFirstLoad]);

  const LoaderComponent = isFirstLoad ? AderaiPreloader : SimpleLoader;

  return (
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
              <Suspense fallback={<LoaderComponent />}>
                <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<PublicRoute><Auth initialView="signin" /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Auth initialView="signup" /></PublicRoute>} />
                <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={<ProtectedRoute><UnifiedDashboard /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/klaviyo-setup" element={<ProtectedRoute><KlaviyoSetup /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/features" element={<ProtectedRoute><FeatureShowcase /></ProtectedRoute>} />
                <Route path="/segment-health" element={<ProtectedRoute><SegmentHealthDashboard /></ProtectedRoute>} />
                <Route path="/ai-features" element={<ProtectedRoute><AIFeaturesDashboard /></ProtectedRoute>} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
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
};

export default App;
