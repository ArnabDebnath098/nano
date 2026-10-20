import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installTapHaptics } from './lib/haptics.js'
import { preloadAssets } from './lib/preloadAssets.js'

// Haptic tick on every button and input-field tap (noon NANO pattern)
installTapHaptics()

// Warm every screen's images, Lotties and video in the background after the first paint
preloadAssets()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
