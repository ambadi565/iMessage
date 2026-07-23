import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { Button, Toast } from '@heroui/react';
import {useEffect} from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WallpaperProvider } from './contexts/WallpaperContext';
import { Navigate, Route, Routes } from 'react-router-dom';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import { useAuth } from '@clerk/react';
import PageLoader from './components/PageLoader';
import { useAuthStore } from './lib/useAuthStore';
import Toaster from 'react-hot-toast';


function App() {
  const { isSignedIn, isLoaded } = useAuth();

  const { checkAuth } = useAuthStore((state) => ({ checkAuth: state.checkAuth }));
  const { clearAuth } = useAuthStore((state) => ({ clearAuth: state.clearAuth }));
  const { isCheckingAuth } = useAuthStore((state) => ({ isCheckingAuth: state.isCheckingAuth }));
  useEffect(() => {
    if(!isLoaded) return;
    if (isSignedIn) {
      checkAuth();
    } else {
      clearAuth();
    }
  }, [checkAuth, clearAuth, isLoaded, isSignedIn]);

  if (!isLoaded || ( isCheckingAuth && isSignedIn)) {
    return <PageLoader />;
  }


  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route path="/" element={isSignedIn ? <ChatPage /> : <Navigate to={"/auth"} replace />} />
          <Route path="/auth" element={!isSignedIn ? <AuthPage /> : <Navigate to={"/"} replace />} />
        </Routes>
        <Toaster />
      </WallpaperProvider>
    </ThemeProvider>
  )
}

export default App
