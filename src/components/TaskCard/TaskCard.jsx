import PriceHighlight from '../PriceHighlight/PriceHighlight.jsx'
import './TaskCard.css'

// Figma: Task card (2:566 default / 2:584 marked-as-done)
export default function TaskCard({ task, onReview }) {
  const { title, image, reward, assignee, dueLabel, state = 'default' } = task
  const isMarkedAsDone = state === 'marked-as-done'

  return (
    <article className={`task-card ${isMarkedAsDone ? 'task-card--done' : ''}`}>
      <div className="task-card__row">
        <div className="task-card__asset">
          <div className="task-card__image">
            <img src={image} alt="" />
          </div>
        </div>

        <div className="task-card__content">
          <div className="task-card__top">
            <p className="task-card__title">{title}</p>
            <PriceHighlight amount={reward} variant="task" />
          </div>

          <div className="task-card__divider" aria-hidden="true" />

          <div className="task-card__meta">
            <div className="task-card__assignee-avatar" aria-hidden="true">
              <div className="task-card__assignee-fill" />
              <img className="task-card__assignee-photo" src={assignee.avatar} alt="" />
              <div className="task-card__assignee-ring">
                <img src="/figma/task-profile-ellipse.png" width="24" height="24" alt="" />
              </div>
            </div>
            <span className="task-card__assignee-name">{assignee.name}</span>
            <img src="/figma/dot-separator.svg" width="4" height="4" alt="" />
            <span className="task-card__due">{dueLabel}</span>
          </div>
        </div>
      </div>

      {isMarkedAsDone && (
        <div className="task-card__info">
          <div className="task-card__info-status">
            <img src="/figma/check-circle-filled.svg" width="16" height="16" alt="" />
            <span>Marked as done</span>
          </div>
          <button type="button" className="task-card__review" onClick={onReview}>
            <span>Review</span>
            <img src="/figma/chevron-right-bold.svg" width="12" height="12" alt="" />
          </button>
        </div>
      )}
    </article>
  )
}
