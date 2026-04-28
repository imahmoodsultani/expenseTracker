## 1. API Fix — Reliable Cascade Deletion

- [x] 1.1 In `app/api/projects/[id]/route.ts`, replace `db.project.delete({ where: { id } })` with a `db.$transaction([...])` that deletes in order: expenses (`deleteMany({ where: { projectId: id } })`), then categories (`deleteMany({ where: { projectId: id } })`), then the project (`delete({ where: { id } })`)
- [x] 1.2 Wrap the transaction in a `try/catch` and return a `500` JSON error response on failure so the UI can surface it

## 2. UI — State Machine in ProjectList

- [x] 2.1 In `components/projects/ProjectList.tsx`, replace the `confirmId` state with a discriminated-union state: `{ step: "idle" } | { step: "warning"; project: Project } | { step: "verifying"; project: Project }`, initialised to `{ step: "idle" }`
- [x] 2.2 Add a `nameInput` string state (empty string default) and an `error` string state (empty string default) to hold the verification input value and any API error message
- [x] 2.3 Update the Delete button `onClick` handler: if `project.expenseCount > 0` set state to `{ step: "warning", project }`, otherwise set state to `{ step: "verifying", project }`
- [x] 2.4 Remove the existing inline confirm/cancel JSX (the `confirmId === project.id` conditional block) from the project card

## 3. UI — Warning Dialog

- [x] 3.1 Below the project grid, render a fixed full-screen overlay (`fixed inset-0 z-50 flex items-center justify-center bg-black/50`) when `state.step === "warning"`
- [x] 3.2 Inside the overlay, render a white modal card containing: the warning message ("This project contains N expense(s). Deleting it will permanently remove all its expenses and data. Are you sure?"), a "No, keep it" button (sets state to `{ step: "idle" }`), and a "Yes, continue" button (sets state to `{ step: "verifying", project: state.project }` and resets `nameInput` and `error`)

## 4. UI — Name Verification Dialog

- [x] 4.1 Render the same fixed overlay when `state.step === "verifying"`
- [x] 4.2 Inside the overlay, show: the label 'Type the project name to confirm: **"<project name>"**', a text input bound to `nameInput` state, the `error` string (if non-empty) in red, a "Cancel" button (sets state to `{ step: "idle" }`), and a "Delete project" button
- [x] 4.3 The "Delete project" button is `disabled` when `nameInput !== state.project.name`
- [x] 4.4 On "Delete project" click: call `DELETE /api/projects/:id`, on success call `onDelete(id)` and set state to `{ step: "idle" }`, on failure set the `error` state to the server's error message (or a generic fallback)

## 5. Verification

- [ ] 5.1 Manually test: delete a project with expenses — warning dialog should appear, name input should appear, wrong casing should keep button disabled, correct name should enable and execute delete
- [ ] 5.2 Manually test: delete a project with no expenses — name input dialog should appear directly (no warning)
- [ ] 5.3 Manually test: cancel at each step — project should remain untouched
- [ ] 5.4 Manually test: verify the project's expenses no longer appear anywhere after successful deletion
