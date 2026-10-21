import RequestCard from '../RequestCard/RequestCard.jsx'
import { navigate } from '../../lib/router.js'
import './ApprovalRequests.css'

// Figma: Task Widget (2:2920) — "Approval requests" section
export default function ApprovalRequests({ requests }) {
  return (
    <section className="approval-requests" aria-labelledby="approval-requests-title">
      <header className="approval-requests__header">
        <h2 id="approval-requests-title" className="approval-requests__title">
          Approval requests
        </h2>
      </header>

      <div className="approval-requests__list">
        {requests.map((request) => (
          <RequestCard key={request.id} request={request} onOpen={() => navigate(`/request/${request.id}`)} />
        ))}
      </div>
    </section>
  )
}
