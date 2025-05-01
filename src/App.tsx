
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArtistPortfolio from "./pages/ArtistPortfolio";
import ArtistForm from "./pages/ArtistForm";
import Artists from "./pages/Artists";
import EventDetails from "./pages/EventDetails";
import Events from "./pages/Events";
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
          <Route path="/artist/:id" element={<ArtistPortfolio />} />
          <Route path="/artist/create" element={<ArtistForm />} />
          <Route path="/artist/edit/:id" element={<ArtistForm />} />
          <Route path="/artists" element={<Artists />} />
          <Route path="/event/:id" element={<EventDetails />} />
          <Route path="/events" element={<Events />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
