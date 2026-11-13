// Ahmet EZER — 2200008227
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }
export type State = { tasks: Task[]; filter: Filter; past: Task[][] }
export const initialState: State = { tasks: [], filter: 'all', past: [] }

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }
  | { type: 'undo' }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

/** Save the old task list only when an action actually changes tasks. */
function changeTasks(state: State, tasks: Task[]): State {
  return { ...state, tasks, past: [...state.past, state.tasks] }
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return changeTasks(state, [...state.tasks, {
        id: action.id, title: action.title, status: 'todo',
      }])
    case 'advance':
      if (!state.tasks.some((task) => task.id === action.id)) return { ...state }
      return changeTasks(state, state.tasks.map((task) =>
        task.id === action.id ? { ...task, status: NEXT[task.status] } : task,
      ))
    case 'remove':
      if (!state.tasks.some((task) => task.id === action.id)) return { ...state }
      return changeTasks(state, state.tasks.filter((task) => task.id !== action.id))
    case 'setFilter':
      return { ...state, filter: action.filter }
    case 'clearDone':
      if (!state.tasks.some((task) => task.status === 'done')) return { ...state }
      return changeTasks(state, state.tasks.filter((task) => task.status !== 'done'))
    case 'undo': {
      const previousTasks = state.past.at(-1)
      if (previousTasks === undefined) return { ...state }
      // Restore tasks while keeping the currently selected filter.
      return { ...state, tasks: previousTasks, past: state.past.slice(0, -1) }
    }
    default: {
      // Adding an action without a case above is a TypeScript error.
      const unhandled: never = action
      throw new Error(`Unhandled action: ${JSON.stringify(unhandled)}`)
    }
  }
}
