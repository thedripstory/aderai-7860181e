import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import Auth from "./pages/Auth";
import BrandOnboarding from "./pages/BrandOnboarding";
import AgencyOnboarding from "./pages/AgencyOnboarding";
import AffiliatePage from "./pages/AffiliatePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/app" 
            element={<Index />} 
          />
          <Route 
            path="/signup" 
            element={<Auth initialView="choice" onComplete={() => {}} />} 
          />
          <Route 
            path="/login" 
            element={<Auth initialView="brand-login" onComplete={() => {}} />} 
          />
          <Route path="/onboarding/brand" element={<BrandOnboarding />} />
          <Route path="/onboarding/agency" element={<AgencyOnboarding />} />
          <Route path="/affiliate" element={<AffiliatePage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
