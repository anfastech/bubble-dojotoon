import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index.jsx";
import NotFound from "./pages/NotFound";
import ButterflyTest from "./pages/butterflytest.jsx";
import BubbleTest from "./pages/BubbleTest";
import GlassBubbleTest from "./pages/GlassBubbleTest";
import ManyBubblesTest from "./pages/ManyBubblesTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/ButterflyTest" element={<ButterflyTest />} />
          <Route path="/BubbleTest" element={<BubbleTest />} />
          <Route path="/GlassBubbleTest" element={<GlassBubbleTest />} />
          <Route path="/ManyBubblesTest" element={<ManyBubblesTest />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
