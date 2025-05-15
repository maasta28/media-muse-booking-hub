
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { StrictMode } from "react";
import Index from "./pages/Index";
import ArtistPortfolio from "./pages/ArtistPortfolio";
import ArtistForm from "./pages/ArtistForm";
import Artists from "./pages/Artists";
import EventDetails from "./pages/EventDetails";
import EventCreate from "./pages/EventCreate";
import Events from "./pages/Events";
import AuditionEvents from "./pages/AuditionEvents";
import Auth from "./pages/Auth";
import OrganizerOnboarding from "./pages/OrganizerOnboarding";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import NotFound from "./pages/NotFound";
import Jobs from "./pages/Jobs";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <StrictMode>
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
            <Route path="/event/create" element={<EventCreate />} />
            <Route path="/events" element={<Events />} />
            <Route path="/auditions" element={<AuditionEvents />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/organizer/onboarding" element={<OrganizerOnboarding />} />
            <Route path="/organizer/dashboard" element={<OrganizerDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </StrictMode>
);

export default App;
