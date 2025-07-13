
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { EventsProvider } from "@/contexts/EventsContext";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Marketplace from "./pages/Marketplace";
import ItemDetail from "./pages/ItemDetail";
import Apartments from "./pages/Apartments";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail";
import Blogs from "./pages/Blogs";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import ProfileView from "./pages/ProfileView";
import Messages from "./pages/Messages";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MessagingProvider>
        <EventsProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/feed" element={<Feed />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/marketplace/item/:id" element={<ItemDetail />} />
              <Route path="/apartments" element={<Apartments />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/view" element={<ProfileView />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/messages/:conversationId" element={<Chat />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </EventsProvider>
      </MessagingProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
