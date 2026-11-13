// Ahmet EZER — 2200008227
import type { Filter } from './filter'

export type Status = 'todo' | 'in-progress' | 'done'
export type Task = { id: string; title: string; status: Status }
export type State = { tasks: Task[]; filter: Filter }
export const initialState: State = { tasks: [], filter: 'all' }

export type Action =
  | { type: 'add'; id: string; title: string }
  | { type: 'advance'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'setFilter'; filter: Filter }
  | { type: 'clearDone' }

const NEXT: Record<Status, Status> = {
  todo: 'in-progress',
  'in-progress': 'done',
  done: 'todo',
}

export function taskReducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return { ...state, tasks: [...state.tasks, { id: action.id, title: action.title, status: 'todo' }] }
    case 'advance':
      return { ...state, tasks: state.tasks.map((task) =>
        task.id === action.id ? { ...task, status: NEXT[task.status] } : task,
      ) }
    case 'remove':
      return { ...state, tasks: state.tasks.filter((task) => task.id !== action.id) }
    case 'setFilter':
      return { ...state, filter: action.filter }
    case 'clearDone':
      return { ...state, tasks: state.tasks.filter((task) => task.status !== 'done') }
    default: {
      // A new action must have a case above, or TypeScript rejects this assignment.
      const unhandled: never = action
      throw new Error(`Unhandled action: ${JSON.stringify(unhandled)}`)
    }
  }
}
