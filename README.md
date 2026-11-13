# Assignment 3 — Task Manager with a Reducer

Ahmet EZER — 2200008227

This project uses the Task Manager starter provided with the assignment. It adds filters, task counts, a Clear done button and Undo.

## Run

Node.js 20.19 or newer is needed. The project was checked with Node.js 24.21.0.

```text
npm install
npm run dev
```

Open the address shown in the terminal. Tasks are kept in memory, so refreshing the page clears the tasks and undo history.

## Build and test

```text
npm run build
npm test
```

The build command checks TypeScript types and builds the app.

## Screenshots

The screenshots folder has four images: all.png, todo.png, in-progress.png and done.png. They show three tasks, with one task in each status.

## Bonus 1: Undo

The state has tasks, filter and past, where past stores the earlier task lists. When tasks change, the old list is saved so Undo can bring it back without changing the selected filter. Changing the filter does not add history, and the Undo button is disabled when there is no history.

## Bonus 2: Tests

The Vitest tests check every action, the three status changes, Undo and the filter functions. They also check that the old state is not changed, including the task objects and history lists. Other cases include an unknown ID, an empty list, clearing when nothing is done and checking counts after deleting a task.

Output from npm test on 13 November 2026:

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

The reducer takes the current state and an action, then returns the next state. It needs to be pure, meaning the same inputs should give the same result. It should not change the old state. For example, using push on the existing task array would also change that earlier array. If the same state object is returned after changing it, React may skip the update. This would also cause problems with Undo because the saved lists could change too.

The task ID is created in the form with crypto.randomUUID() before the add action is sent. If the reducer created the ID, running it twice with the same inputs could produce different tasks. Passing the ID in the action makes the result predictable and easier to test.

The filtered list and counts are calculated from state.tasks during rendering. Keeping separate copies would mean updating them every time a task changes. For example, after deleting a done task, the Done count could stay the same if that separate count was not updated. Calculating it from the tasks avoids this problem.

Putting the filter in the reducer state makes it easier to follow task changes and filter changes in one place. The part that needs care is keeping the filter when tasks change or Undo is used. Only task lists are saved in past, so Undo restores tasks while leaving the current filter selected.

## Bonus 4: Git repository

Repository: https://github.com/ahmetezr/assignment3

The repository has separate commits for the changes and includes the four screenshots. The .gitignore file excludes node_modules and dist. The repository is public, so the instructor can view the code, screenshots and commit history using the link above.

## Submission

The ZIP contains an assignment3 folder with the code, configuration files, README and screenshots. It leaves out node_modules, dist and .git.

