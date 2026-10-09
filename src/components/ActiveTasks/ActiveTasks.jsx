import TaskCard from '../TaskCard/TaskCard.jsx'
import './ActiveTasks.css'

// Figma: Active Tasks (2:2927) — only shows Pending and Marked as done (by kid) tasks
export default function ActiveTasks({ tasks, onNewTask, onReview }) {
  return (
    <section className="active-tasks" aria-labelledby="active-tasks-title">
      <div className="active-tasks__header">
        <div className="active-tasks__title-switcher">
          <h2 id="active-tasks-title" className="active-tasks__title">
            Tasks
          </h2>
        </div>

        <button type="button" className="active-tasks__new" onClick={onNewTask}>
          <img src="/figma/plus.svg" width="16" height="16" alt="" />
          <span>New task</span>
        </button>
      </div>

      <div className="active-tasks__list">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onReview={() => onReview?.(task)} />
        ))}
      </div>
    </section>
  )
}
