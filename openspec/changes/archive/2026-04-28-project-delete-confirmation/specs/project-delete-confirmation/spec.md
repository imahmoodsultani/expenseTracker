## ADDED Requirements

### Requirement: Warning dialog for projects with expenses
When a user initiates deletion of a project that contains one or more expenses, the system SHALL display a modal warning dialog before proceeding. The dialog SHALL state that the project contains expenses and ask the user to confirm intent. The user SHALL be able to cancel and return to the project list without any changes, or confirm and proceed to the name-verification step.

#### Scenario: Warning shown for project with expenses
- **WHEN** a user clicks Delete on a project whose `expenseCount` is greater than zero
- **THEN** a modal dialog appears stating "This project contains N expense(s). Are you sure you want to delete it and all its data?"

#### Scenario: Cancelling warning closes dialog without deleting
- **WHEN** the warning dialog is open and the user clicks "No, keep it"
- **THEN** the dialog closes and the project remains in the list unchanged

#### Scenario: Confirming warning advances to name verification
- **WHEN** the warning dialog is open and the user clicks "Yes, continue"
- **THEN** the warning dialog is replaced by the name-verification dialog

#### Scenario: No warning for empty projects
- **WHEN** a user clicks Delete on a project whose `expenseCount` is zero
- **THEN** the system skips the warning dialog and goes directly to the name-verification dialog

### Requirement: Case-sensitive name verification before delete
Before any project deletion is executed, the system SHALL require the user to type the project's name exactly (case-sensitive, no trimming) into a text input. The delete button SHALL remain disabled until the input matches the project name exactly. Upon a successful match and button press, the project and all its associated expenses and categories SHALL be permanently deleted.

#### Scenario: Delete button disabled until name matches
- **WHEN** the name-verification dialog is open and the input value does not exactly match the project name
- **THEN** the "Delete project" button is disabled and cannot be clicked

#### Scenario: Delete button enabled on exact match
- **WHEN** the user types the project name exactly as displayed (case-sensitive)
- **THEN** the "Delete project" button becomes enabled

#### Scenario: Case mismatch does not enable delete
- **WHEN** the user types the project name with different casing (e.g., "my project" instead of "My Project")
- **THEN** the "Delete project" button remains disabled

#### Scenario: Successful deletion removes project from list
- **WHEN** the user types the exact project name and clicks "Delete project"
- **THEN** the project is deleted from the server, the modal closes, and the project card disappears from the list

#### Scenario: Cancelling name verification closes dialog without deleting
- **WHEN** the name-verification dialog is open and the user clicks "Cancel"
- **THEN** the dialog closes and the project remains in the list unchanged

### Requirement: API correctly deletes project with all related data
The server SHALL permanently delete a project along with all its associated expenses and categories in a single atomic operation. If any part of the deletion fails, no data SHALL be deleted.

#### Scenario: Project with expenses and categories is fully deleted
- **WHEN** the DELETE request is received for a project that has expenses and project-scoped categories
- **THEN** all expenses are deleted, then all project-scoped categories, then the project itself — and the response returns `{ deleted: true }`

#### Scenario: API error is surfaced to the user
- **WHEN** the DELETE request fails on the server
- **THEN** the modal displays an error message and the project remains in the list
