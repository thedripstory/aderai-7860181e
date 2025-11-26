import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense, useState, useEffect } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { GlobalErrorBoundary } from "@/components/GlobalErrorBoundary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { AderaiPreloader } from "@/components/AderaiPreloader";
import { PageTransition } from "@/components/PageTransition";
import { AnimatePresence } from "framer-motion";

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

// Wrapper component to handle initial loading with animated transitions
const AppContent = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Small delay to ensure smooth transition
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isInitialLoad ? (
        <AderaiPreloader key="preloader" />
      ) : (
        <Suspense fallback={<AderaiPreloader key="suspense-preloader" />}>
          <PageTransition>
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
          </PageTransition>
        </Suspense>
      )}
    </AnimatePresence>
  );
};

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
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </GlobalErrorBoundary>
);

export default App;
