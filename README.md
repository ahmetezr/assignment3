# Assignment 3 — Task Manager with a Reducer

Ahmet EZER — 2200008227

Based on the supplied Vite + React + TypeScript starter.

## Run

Requires Node.js 20.19 or newer. Tested with Node.js 24.21.0.

```text
npm install
npm run dev
```

Open the address printed by Vite. Tasks and undo history are held in memory and reset on refresh.

## Build and test

```text
npm run build
npm test
```

The build runs TypeScript in strict mode before producing the Vite bundle.

## Screenshots

`screenshots/all.png`, `todo.png`, `in-progress.png` and `done.png` show the four filters with three tasks: one in each status. Counts always describe the complete task list.

## Bonus 1: Undo

The state contains `tasks`, `filter`, and `past: Task[][]`, an ordered history of earlier task lists. Each action that changes tasks appends the old list to `past`; Undo restores the last list and removes that history entry while keeping the current filter. Filter changes, unknown IDs and clearing a list with no completed tasks do not add history, and Undo is disabled when history is empty.

## Bonus 2: Tests

Vitest tests cover all six actions, the complete status cycle, frozen-state immutability, deterministic results, multiple undos, restoring cleared tasks, filtering, and counts. Edge cases include empty lists, unknown IDs, clearing with nothing done, and counts after deletion.

Output from the actual `npm test` run on 13 November 2026:

```text
> task-manager-assignment3@0.0.0 test
> vitest run

 RUN  v5.1.0 C:/Users/PC/Desktop/Assignment3

 Test Files  1 passed (1)
      Tests  35 passed (35)
   Start at  15:23:41
   Duration  277ms (import 44%, transform 40%, tests 11%, worker 5%)
```

## Bonus 3: Explain your reducer

A reducer must calculate its result only from the state and action it receives. It should not change the previous state or perform work outside the function. React can call reducers more than once in development to help reveal mistakes. If the reducer modifies an existing array, earlier state snapshots also change. Returning the same mutated object can also cause React to skip an update because its identity has not changed. In this project, mutation would damage the task lists stored for Undo as well.

The form creates the task ID with `crypto.randomUUID()` before dispatching the add action. Random ID generation inside the reducer would give different results for the same inputs. Including the ID in the action keeps the reducer deterministic and makes tests repeatable.

The visible tasks and the four counts are calculated during rendering from the complete task list. They do not need their own state because they can always be computed from existing data. If a separate count were stored, deleting a completed task without updating that count could leave Done showing one task even though its list was empty. Deriving both values prevents that inconsistency.

Keeping the filter in the reducer state makes transitions easier to follow: the actions describe both task changes and filter selection in one place. The additional responsibility is to preserve the filter in every task update, especially Undo. The history therefore stores only task lists, so restoring earlier tasks does not unexpectedly switch the user's selected filter.

## Bonus 4: Git repository

Repository: https://github.com/ahmetezr/assignment3

The repository records the work in separate commits, includes the four screenshots, and excludes node_modules and dist. It is private; instructor access still needs to be arranged according to the CATS announcement.

## Submission

Package one folder named assignment3 containing the source, configuration, lockfile, README and screenshots. Leave out node_modules, dist and .git.

