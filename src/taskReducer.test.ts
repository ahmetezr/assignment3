import { describe, expect, it } from 'vitest'
import { initialState, taskReducer, type Action, type State, type Task } from './taskReducer'
import { countByFilter, filterTasks } from './filter'

function sample(): State {
  return { tasks: [
    { id: 'a', title: 'Read', status: 'todo' },
    { id: 'b', title: 'Build', status: 'in-progress' },
    { id: 'c', title: 'Review', status: 'done' },
  ], filter: 'all', past: [] }
}
function freezeState(state: State): void {
  for (const list of [...state.past, state.tasks]) {
    for (const task of list) Object.freeze(task)
    Object.freeze(list)
  }
  Object.freeze(state.past)
  Object.freeze(state)
}

describe('taskReducer', () => {
  it('starts empty with all selected and no history', () => {
    expect(initialState).toEqual({ tasks: [], filter: 'all', past: [] })
  })
  it('adds a todo task with the supplied ID and saves the old list', () => {
    const state = sample()
    const result = taskReducer(state, { type: 'add', id: 'd', title: 'New' })
    expect(result.tasks).toEqual([...state.tasks, { id: 'd', title: 'New', status: 'todo' }])
    expect(result.past).toEqual([state.tasks])
  })
  it('advances through all three statuses and returns to todo', () => {
    let state = sample()
    for (const expected of ['in-progress', 'done', 'todo']) {
      state = taskReducer(state, { type: 'advance', id: 'a' })
      expect(state.tasks.find((task) => task.id === 'a')?.status).toBe(expected)
    }
    expect(state.past).toHaveLength(3)
  })
  it('removes only the requested task and updates derived counts', () => {
    const result = taskReducer(sample(), { type: 'remove', id: 'b' })
    expect(result.tasks.map((task) => task.id)).toEqual(['a', 'c'])
    expect(countByFilter(result.tasks)).toEqual({ all: 2, todo: 1, 'in-progress': 0, done: 1 })
  })
  it('changes only the filter, without adding history', () => {
    const state = sample()
    const result = taskReducer(state, { type: 'setFilter', filter: 'done' })
    expect(result.filter).toBe('done')
    expect(result.tasks).toBe(state.tasks)
    expect(result.past).toBe(state.past)
  })
  it('clears every done task while keeping the filter and order', () => {
    const state = sample()
    state.filter = 'done'
    state.tasks.push({ id: 'd', title: 'Also done', status: 'done' })
    const result = taskReducer(state, { type: 'clearDone' })
    expect(result.tasks.map((task) => task.id)).toEqual(['a', 'b'])
    expect(result.filter).toBe('done')
    expect(filterTasks(result.tasks, result.filter)).toEqual([])
  })
  it('restores cleared tasks with undo and keeps a later filter selection', () => {
    const state = sample()
    const cleared = taskReducer(state, { type: 'clearDone' })
    const filtered = taskReducer(cleared, { type: 'setFilter', filter: 'todo' })
    const restored = taskReducer(filtered, { type: 'undo' })
    expect(restored.tasks).toEqual(state.tasks)
    expect(restored.filter).toBe('todo')
    expect(restored.past).toEqual([])
  })
  it.each<Action>([
    { type: 'add', id: 'd', title: 'Added' },
    { type: 'advance', id: 'a' },
    { type: 'remove', id: 'b' },
    { type: 'clearDone' },
  ])('undo reverses $type', (action) => {
    const state = sample()
    const changed = taskReducer(state, action)
    expect(taskReducer(changed, { type: 'undo' })).toEqual(state)
  })
  it('supports several undos, including restoring an empty list', () => {
    let state = taskReducer(initialState, { type: 'add', id: 'a', title: 'First' })
    state = taskReducer(state, { type: 'advance', id: 'a' })
    state = taskReducer(state, { type: 'undo' })
    expect(state.tasks[0]?.status).toBe('todo')
    state = taskReducer(state, { type: 'undo' })
    expect(state).toEqual(initialState)
  })
  it('does nothing when undo history is empty', () => {
    expect(taskReducer(initialState, { type: 'undo' })).toEqual(initialState)
  })
  it.each<Action>([{ type: 'advance', id: 'missing' }, { type: 'remove', id: 'missing' }])(
    'unknown ID in $type does not change tasks or add history', (action) => {
      const state = sample()
      expect(taskReducer(state, action)).toEqual(state)
    },
  )
  it('clearDone with no completed tasks does not add history', () => {
    const state = taskReducer(initialState, { type: 'add', id: 'a', title: 'Read' })
    expect(taskReducer(state, { type: 'clearDone' })).toEqual(state)
  })
  it.each<Action>([
    { type: 'advance', id: 'missing' }, { type: 'remove', id: 'missing' },
    { type: 'clearDone' }, { type: 'undo' },
  ])('$type handles an empty list', (action) => {
    expect(taskReducer(initialState, action)).toEqual(initialState)
  })
  it.each<Action>([
    { type: 'add', id: 'd', title: 'New' }, { type: 'advance', id: 'a' },
    { type: 'remove', id: 'b' }, { type: 'setFilter', filter: 'done' },
    { type: 'clearDone' }, { type: 'undo' },
  ])('$type preserves frozen state, nested tasks and history', (action) => {
    const state = sample()
    state.past = [[{ id: 'old', title: 'Old', status: 'todo' }]]
    const before = structuredClone(state)
    freezeState(state)
    const result = taskReducer(state, action)
    expect(state).toEqual(before)
    expect(result).not.toBe(state)
    if (action.type === 'advance') {
      expect(result.tasks).not.toBe(state.tasks)
      expect(result.tasks[0]).not.toBe(state.tasks[0])
    }
  })
  it('the same state and action always produce the same result', () => {
    const state = sample()
    const action: Action = { type: 'add', id: 'stable-id', title: 'Stable' }
    expect(taskReducer(state, action)).toEqual(taskReducer(state, action))
  })
})

describe('filter helpers', () => {
  it.each(['all', 'todo', 'in-progress', 'done'] as const)('filters %s correctly', (filter) => {
    const tasks = sample().tasks
    const expected: Record<string, string[]> = { all: ['a', 'b', 'c'], todo: ['a'], 'in-progress': ['b'], done: ['c'] }
    expect(filterTasks(tasks, filter).map((task) => task.id)).toEqual(expected[filter])
  })
  it('counts all statuses from the complete list', () => {
    expect(countByFilter(sample().tasks)).toEqual({ all: 3, todo: 1, 'in-progress': 1, done: 1 })
  })
  it('empty lists have no matches and zero counts', () => {
    for (const filter of ['all', 'todo', 'in-progress', 'done'] as const) expect(filterTasks([], filter)).toEqual([])
    expect(countByFilter([])).toEqual({ all: 0, todo: 0, 'in-progress': 0, done: 0 })
  })
  it('counts repeated statuses correctly', () => {
    const tasks: Task[] = [{ id: 'a', title: 'A', status: 'done' }, { id: 'b', title: 'B', status: 'done' }]
    expect(countByFilter(tasks)).toEqual({ all: 2, todo: 0, 'in-progress': 0, done: 2 })
  })
  it('does not mutate frozen inputs', () => {
    const state = sample()
    const before = structuredClone(state)
    freezeState(state)
    filterTasks(state.tasks, 'done')
    countByFilter(state.tasks)
    expect(state).toEqual(before)
  })
})
