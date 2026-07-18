import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react'
import { Button } from '@heroui/react';
import { ThemeProvider } from './contexts/ThemeContext';
import { WallpaperProvider } from './contexts/WallpaperContext';
import { Routes, Route } from 'react-router-dom';


function App() {
  return (
    <ThemeProvider>
      <WallpaperProvider>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </WallpaperProvider>
    </ThemeProvider>
  )
}

export default App
