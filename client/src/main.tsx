import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Toaster } from 'react-hot-toast'

import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: { borderRadius: '16px', fontWeight: 700, fontSize: '14px' },
            success: { iconTheme: { primary: '#0052cc', secondary: '#fff' } },
          }}
        />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
)

