import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { Toaster } from "sonner"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <App />
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#1A1F2E',
              color: '#E8ECF1',
              border: '1px solid #2A3142',
            },
          }}
        />
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
