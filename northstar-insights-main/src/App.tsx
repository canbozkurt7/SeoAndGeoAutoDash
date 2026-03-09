import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import GoogleAds from "./pages/GoogleAds";
import MetaAds from "./pages/MetaAds";
import YandexAds from "./pages/YandexAds";
import Organic from "./pages/Organic";
import GeoIntelligence from "./pages/GeoIntelligence";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/google-ads" element={<GoogleAds />} />
          <Route path="/meta-ads" element={<MetaAds />} />
          <Route path="/yandex-ads" element={<YandexAds />} />
          <Route path="/organic" element={<Organic />} />
          <Route path="/geo" element={<GeoIntelligence />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
