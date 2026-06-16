import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { CharacterProvider } from './contexts/CharacterContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <CharacterProvider>
        <App />
      </CharacterProvider>
    </AuthProvider>
  </StrictMode>,
)
