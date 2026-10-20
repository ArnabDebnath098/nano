import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { squirclePath } from '../../lib/squircle.js'
import './DeviceFrame.css'

// Desktop preview: the app runs inside a phone-sized iframe so it gets a real 390×844 viewport —
// fixed layers, 100dvh, document scroll and the keyboard hooks all behave as on a phone.
const WIDTH = 390
const HEIGHT = 844
const RADIUS = 40
const MARGIN = 32 // breathing room around the frame before it scales down

const CLIP = `path('${squirclePath({ width: WIDTH, height: HEIGHT, radius: RADIUS })}')`

export default function DeviceFrame() {
  const frameRef = useRef(null)
  const [scale, setScale] = useState(1)

  // Shrink to fit short windows (never grow past 1:1)
  useLayoutEffect(() => {
    const fit = () =>
      setScale(Math.min(1, (window.innerHeight - MARGIN * 2) / HEIGHT, (window.innerWidth - MARGIN * 2) / WIDTH))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  // Mirror the app's route into the address bar so a reload reopens the same screen
  useEffect(() => {
    const frame = frameRef.current
    let off
    const onLoad = () => {
      off?.()
      const win = frame.contentWindow
      const sync = () => window.history.replaceState(null, '', win.location.hash || '#/')
      win.addEventListener('hashchange', sync)
      off = () => win.removeEventListener('hashchange', sync)
      sync()
    }
    frame.addEventListener('load', onLoad)
    return () => {
      frame.removeEventListener('load', onLoad)
      off?.()
    }
  }, [])

  return (
    <div className="device-frame">
      <div className="device-frame__shadow" style={{ width: WIDTH * scale, height: HEIGHT * scale }}>
        <iframe
          ref={frameRef}
          className="device-frame__screen"
          title="noon app"
          src={window.location.pathname + window.location.search + window.location.hash}
          style={{ width: WIDTH, height: HEIGHT, clipPath: CLIP, transform: `scale(${scale})` }}
        />
      </div>
    </div>
  )
}
