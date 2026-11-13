import type { Task } from './taskReducer'

type TaskRowProps = { task: Task; onNext: () => void; onDelete: () => void }

export default function TaskRow({ task, onNext, onDelete }: TaskRowProps) {
  return (
    <li className="task-row">
      <span className="task-title">{task.title}</span>
      <span className={`status ${task.status}`}>{task.status}</span>
      <button onClick={onNext} aria-label={`Advance ${task.title}`}>Next</button>
      <button onClick={onDelete} aria-label={`Delete ${task.title}`}>Delete</button>
    </li>
  )
}
