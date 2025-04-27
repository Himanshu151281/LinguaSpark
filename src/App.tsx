import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Feature Pages
import DashboardPage from "./pages/DashboardPage";
import LessonHubPage from "./pages/LessonHubPage";
import LessonDetailPage from "./pages/LessonDetailPage";
import ConversationPracticePage from "./pages/ConversationPracticePage";
import GameCenterPage from "./pages/GameCenterPage";
import ProgressTrackerPage from "./pages/ProgressTrackerPage";
import QuizPage from "./pages/QuizPage";

// Game center sub-pages
import TypingTestPage from "./pages/games/TypingTestPage";
import SongLyricsPage from "./pages/games/SongLyricsPage";
import StoryGeneratorPage from "./pages/games/StoryGeneratorPage";
// import ComicCreatorPage from "./pages/games/ComicCreatorPage";

// Import global styles
import "./styles/globals.css";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Main feature routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/lessons" element={<LessonHubPage />} />
          <Route path="/lessons/:lessonId" element={<LessonDetailPage />} />
          <Route path="/practice" element={<ConversationPracticePage />} />
          <Route path="/progress" element={<ProgressTrackerPage />} />
          <Route path="/progress/quiz" element={<QuizPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          
          {/* Game center routes */}
          <Route path="/games" element={<GameCenterPage />} />
          <Route path="/games/typing" element={<TypingTestPage />} />
          <Route path="/games/lyrics" element={<SongLyricsPage />} />
          <Route path="/games/stories" element={<StoryGeneratorPage />} />
          {/* <Route path="/games/comics" element={<ComicCreatorPage />} /> */}
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
