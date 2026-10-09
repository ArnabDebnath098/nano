import './Greeting.css'

// Figma: "Hi, Anmol · row" (2:2946)
export default function Greeting({ name, subtitle }) {
  return (
    <div className="greeting">
      <div className="greeting__stack">
        <h1 className="greeting__title">Hi, {name}</h1>
        <p className="greeting__subtitle">{subtitle}</p>
      </div>
    </div>
  )
}
