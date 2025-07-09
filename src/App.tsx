
import { useState, useEffect, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Marketplace from "./pages/Marketplace";
import Apartments from "./pages/Apartments";
import Events from "./pages/Events";
import Blogs from "./pages/Blogs";
import NotFound from "./pages/NotFound";
import Header from "@/components/Header";
import CreatePostModal, { NewPostData } from "@/components/CreatePostModal";

const queryClient = new QueryClient();

const MOCK_USER = {
  name: "Campus User",
  username: "@campusstar",
  university: "Oruma University",
};

const AppContent = () => {
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const location = useLocation();

  // State to hold the function that adds a post to the Feed.tsx's state
  const [feedPostHandler, setFeedPostHandler] = useState<((data: NewPostData) => void) | null>(null);

  const toggleCreatePostModal = useCallback((open?: boolean) => {
    setIsCreatePostModalOpen(prev => typeof open === 'boolean' ? open : !prev);
  }, []);

  // This is the function that the CreatePostModal will call.
  // It then calls the handler provided by Feed.tsx.
  const handleGlobalPostSubmit = useCallback((postData: NewPostData) => {
    if (feedPostHandler) {
      feedPostHandler(postData);
      console.log("Global post submit handled, called feedPostHandler.");
    } else {
      console.warn("feedPostHandler not set. Post data:", postData);
    }
  }, [feedPostHandler]);

  const showHeader = !['/auth/login', '/auth/signup'].includes(location.pathname);

  return (
    <>
      {showHeader && <Header onOpenCreatePostModal={() => toggleCreatePostModal(true)} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route
          path="/feed"
          element={<Feed
            // isCreatePostModalOpen and toggleCreatePostModal are primarily for the inline create button in Feed
            // The global modal state is managed here in AppContent.
            // Feed.tsx needs to be able to open the modal.
            isCreatePostModalOpen={isCreatePostModalOpen}
            toggleCreatePostModal={toggleCreatePostModal}
            // This prop allows Feed.tsx to register its 'add post' function
            setFeedPostHandler={setFeedPostHandler}
            currentUser={MOCK_USER}
          />}
        />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/apartments" element={<Apartments />} />
        <Route path="/events" element={<Events />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* This single CreatePostModal instance is used globally */}
      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onOpenChange={toggleCreatePostModal}
        onPostSubmit={handleGlobalPostSubmit} // Modal calls this unified handler
        currentUser={MOCK_USER}
      />
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
