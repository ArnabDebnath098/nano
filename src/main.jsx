import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installTapHaptics } from './lib/haptics.js'

// Haptic tick on every button and input-field tap (noon NANO pattern)
installTapHaptics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
