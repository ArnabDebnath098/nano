import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installTapHaptics } from './lib/haptics.js'
import { preloadAssets } from './lib/preloadAssets.js'
import { isNativeMobile } from './lib/platform.js'
import DeviceFrame from './components/DeviceFrame/DeviceFrame.jsx'

// Desktop browsers get the app inside a phone frame (the app itself runs in the frame's iframe)
const showFrame = !isNativeMobile && window.self === window.top && window.innerWidth > 600

if (!showFrame) {
  // Haptic tick on every button and input-field tap (noon NANO pattern)
  installTapHaptics()

  // Warm every screen's images, Lotties and video in the background after the first paint
  preloadAssets()
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {showFrame ? <DeviceFrame /> : <App />}
  </StrictMode>,
)
