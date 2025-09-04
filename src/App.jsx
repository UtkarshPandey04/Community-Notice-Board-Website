import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Header from '@/components/layout/Header';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';
import Home from '@/pages/Home';
import Announcements from '@/pages/Announcements';
import Events from '@/pages/Events';
import Marketplace from '@/pages/Marketplace';
import Contacts from '@/pages/Contacts';
import Admin from '@/pages/Admin';
import UserPosts from '@/components/posts/UserPosts';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600 text-sm">Loading community board...</p>
    </div>
  </div>
);

const AppLayout = () => {
  return (
    <BrowserRouter>
      <Header />
      <main className="min-h-screen bg-gray-50 pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/events" element={<Events />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/posts" element={<UserPosts />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
};

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return <AppLayout />;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
