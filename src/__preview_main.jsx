import { createRoot } from 'react-dom/client'
import './index.css'
import Accounts from './screens/Accounts/Accounts.jsx'
createRoot(document.getElementById('root')).render(<div className="app"><Accounts onInviteChild={() => { window.__invited = (window.__invited || 0) + 1 }} /></div>)
