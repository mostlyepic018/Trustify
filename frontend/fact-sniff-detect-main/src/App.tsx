import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import FakeNewsDetector from "./pages/FakeNewsDetector";
import FakeEcommerceDetector from "./pages/FakeEcommerceDetector";
import ScamJobDetector from "./pages/ScamJobDetector";
import FakeTweetDetector from "./pages/FakeTweetDetector";
import AIImageDetector from "./pages/AIImageDetector";
import AITextDetector from "./pages/AITextDetector";
import ResultHistory from "./pages/ResultHistory";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Replace this with your actual Google OAuth Client ID
const GOOGLE_CLIENT_ID = "673210533931-oiq82vfvciiufn17jic3fob25vgmk6r1.apps.googleusercontent.com";

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/help" element={<Help />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/fake-news" element={
                  <ProtectedRoute>
                    <FakeNewsDetector />
                  </ProtectedRoute>
                } />
                <Route path="/fake-ecommerce" element={
                  <ProtectedRoute>
                    <FakeEcommerceDetector />
                  </ProtectedRoute>
                } />
                <Route path="/scam-jobs" element={
                  <ProtectedRoute>
                    <ScamJobDetector />
                  </ProtectedRoute>
                } />
                <Route path="/fake-tweets" element={
                  <ProtectedRoute>
                    <FakeTweetDetector />
                  </ProtectedRoute>
                } />
                <Route path="/ai-images" element={
                  <ProtectedRoute>
                    <AIImageDetector />
                  </ProtectedRoute>
                } />
                <Route path="/ai-text" element={
                  <ProtectedRoute>
                    <AITextDetector />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <ResultHistory />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
