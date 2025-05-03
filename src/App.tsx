import { Toaster as RadixToaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./contexts/GameContext";

import Index from "./pages/Index";
import GameRoom from "./pages/GameRoom";
import Admin from "./pages/Admin";
import Faq from "./pages/Faq";
import Feedback from "./pages/Feedback";
import About from "./pages/About";
import Donations from "./pages/Donations";
import Updates from "./pages/Updates";
import FindRooms from "./pages/FindRooms";
import CreateRoom from "./pages/CreateRoom";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GameProvider>
          <RadixToaster />
          <SonnerToaster />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/room/:roomId" element={<GameRoom />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/about" element={<About />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/updates" element={<Updates />} />
            <Route path="/find-rooms" element={<FindRooms />} />
            <Route path="/create-room" element={<CreateRoom />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </GameProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

export default App;
