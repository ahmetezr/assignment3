import { useReducer, type Dispatch } from 'react'
import { taskReducer, initialState, type Task, type Action } from './taskReducer'
import { FILTERS, filterTasks, countByFilter, type Filter } from './filter'
import TaskRow from './TaskRow'
import './styles.css'

const LABELS: Record<Filter, string> = { all: 'All', todo: 'To do', 'in-progress': 'In progress', done: 'Done' }

function AddForm({ dispatch }: { dispatch: Dispatch<Action> }) {
  function addTask(formData: FormData) {
    const title = String(formData.get('title') ?? '').trim()
    if (title) dispatch({ type: 'add', id: crypto.randomUUID(), title })
  }
  return (
    <form action={addTask}>
      <label htmlFor="title">New task</label>
      <div className="add-controls">
        <input id="title" name="title" placeholder="What needs to be done?" required />
        <button type="submit" className="primary">Add task</button>
      </div>
    </form>
  )
}

function FilterBar({ filter, counts, dispatch }: {
  filter: Filter; counts: Record<Filter, number>; dispatch: Dispatch<Action>
}) {
  return (
    <nav aria-label="Filter tasks" className="filters">
      {FILTERS.map((value) => (
        <button key={value} aria-pressed={filter === value}
          onClick={() => dispatch({ type: 'setFilter', filter: value })}>
          {LABELS[value]} ({counts[value]})
        </button>
      ))}
    </nav>
  )
}

function TaskList({ tasks, dispatch }: { tasks: Task[]; dispatch: Dispatch<Action> }) {
  if (tasks.length === 0) return <p className="empty" role="status">No tasks here.</p>
  return <ul>{tasks.map((task) => (
    <TaskRow key={task.id} task={task}
      onNext={() => dispatch({ type: 'advance', id: task.id })}
      onDelete={() => dispatch({ type: 'remove', id: task.id })} />
  ))}</ul>
}

export default function App() {
  const [state, dispatch] = useReducer(taskReducer, initialState)
  // These values are derived on every render, never stored as a second state.
  const visibleTasks = filterTasks(state.tasks, state.filter)
  const counts = countByFilter(state.tasks)
  return (
    <main>
      <header><p className="eyebrow">YOUR DAILY WORKSPACE</p><h1>Task Manager</h1>
        <p>Add a task, move it forward, and keep track of your progress.</p></header>
      <section className="panel" aria-label="Manage tasks">
        <AddForm dispatch={dispatch} />
        <FilterBar filter={state.filter} counts={counts} dispatch={dispatch} />
        <div className="list-heading"><h2>{LABELS[state.filter]} tasks</h2>
          <div className="task-actions"><button disabled={state.past.length === 0} onClick={() => dispatch({ type: 'undo' })}>Undo</button>
          <button disabled={counts.done === 0} onClick={() => dispatch({ type: 'clearDone' })}>Clear done</button></div>
        </div>
        <TaskList tasks={visibleTasks} dispatch={dispatch} />
      </section>
    </main>
  )
}

