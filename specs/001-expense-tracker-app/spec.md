# Feature Specification: Expense Tracker App with Auth, Projects, and Reporting

**Feature Branch**: `001-expense-tracker-app`  
**Created**: 2026-04-15  
**Status**: Draft  
**Input**: User description: "i want to create an expense tracker app that would be initialised with an authentication, user should be able to create and login from the start page, there would be options to add general monthly expenses as well as option to create projects in it. when adding expenses it would ask title, amount, date, description, category. only the description field will be optional rest will be required. For the category, it will be a dropdown list with pre defined option: Food, Vehicle, Household, Medicines, and also option to add more categories as per required. user should be able to create a project and that specific project related expenses would stay in the project, the format and fields for adding the expenses would be same. also user defined categories that user would create other than the predefined ones, if created within project would stay within the project and not in the main expense dashboard. also the dashboard should be able to create reports within the project and outside the project and an overall summary that would define the total expenses per category."

---

## Clarifications

### Session 2026-04-15

- Q: Should the app support recurring expenses that auto-generate each period, or are all expenses entered manually? → A: Recurring expenses supported — user marks an expense as recurring with a frequency (weekly, monthly, or yearly); the system auto-generates new expense instances at each interval.
- Q: Should users be able to export/download reports, or are reports view-only within the app? → A: CSV export — users can download any report as a CSV spreadsheet file.
- Q: On the main expense dashboard list, can users filter or search their expenses? → A: Full search — users can type a keyword to search by title or description, and also filter by category and/or date range.
- Q: In the overall summary, should category totals be broken down further by source (general vs. each project)? → A: Two-level view — user can toggle between a flat category total view and an expanded view showing each category's contribution broken down by source (General + each project).
- Q: Should users be able to delete custom categories, and what happens to expenses already tagged with a deleted category? → A: Allow deletion; the deleted category no longer appears in the dropdown for new expenses, but existing expenses permanently retain their category label so historical data and reports remain accurate.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - User Registration and Login (Priority: P1)

A new user visits the app's start page and creates an account using their email and password. On subsequent visits, they log in with those credentials to access their personal expense data. Users can also log out when done.

**Why this priority**: Authentication is the entry point to the entire application. No other feature is accessible without a verified account. Every other user story depends on this being in place.

**Independent Test**: Can be fully tested by registering a new account, logging out, and logging back in — delivers secure, personal access to the app.

**Acceptance Scenarios**:

1. **Given** a user is on the start page, **When** they submit a registration form with a valid email and password, **Then** their account is created and they are directed to their expense dashboard.
2. **Given** a registered user is on the start page, **When** they submit their email and password, **Then** they are authenticated and directed to their dashboard.
3. **Given** a logged-in user, **When** they choose to log out, **Then** their session ends and they are returned to the start page.
4. **Given** a user submits incorrect credentials, **When** attempting to log in, **Then** they see a clear error message and remain on the login page.
5. **Given** a user attempts to register with an already-used email, **When** they submit the form, **Then** they receive an error indicating the account already exists.

---

### User Story 2 - Adding and Managing General Expenses (Priority: P2)

A logged-in user adds day-to-day or monthly expenses that are not tied to any specific project. An expense can be marked as recurring (weekly, monthly, or yearly), in which case the system automatically creates a new instance of that expense at each due interval. The user can view, search, filter, edit, and delete these general expenses from their main dashboard.

**Why this priority**: The core value of the app is expense tracking. General expenses are the primary use case for most users, and this functionality must work before projects and reports are introduced.

**Independent Test**: Can be fully tested by adding several general expenses with all required fields, verifying they appear on the dashboard, then editing and deleting one — delivers standalone expense recording.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the dashboard, **When** they initiate adding a new expense and fill in Title, Amount, Date, and Category (with Description optional), **Then** the expense is saved and appears in their general expense list.
2. **Given** a user attempts to save an expense with a missing required field (Title, Amount, Date, or Category), **When** they submit the form, **Then** validation prevents saving and highlights the missing field.
3. **Given** a user leaves the Description field blank, **When** they save the expense, **Then** the expense is saved successfully without a description.
4. **Given** an existing general expense, **When** a user edits any of its fields and saves, **Then** the updated values are reflected in the expense list.
5. **Given** an existing general expense, **When** a user deletes it, **Then** it is removed from the expense list and no longer appears in reports.
6. **Given** a user marks an expense as recurring with a frequency (weekly, monthly, or yearly), **When** the next due date arrives, **Then** the system automatically creates a new expense instance with the same Title, Amount, Category, and Description.
7. **Given** a recurring expense exists, **When** the user cancels the recurrence, **Then** no further auto-generated instances are created, but existing instances remain.

---

### User Story 3 - Category Management (Priority: P3)

A logged-in user selects from four predefined expense categories (Food, Vehicle, Household, Medicines) when adding any expense. They can also create custom categories. Custom categories created on the main dashboard are available globally, while custom categories created within a project are only available within that project.

**Why this priority**: Categories are required for every expense and underpin the reporting feature. Scoped category management (global vs. project-level) is a key differentiating behavior of the app.

**Independent Test**: Can be fully tested by adding a global custom category, verifying it appears when adding general expenses, then creating a project-scoped category and verifying it does not appear outside that project.

**Acceptance Scenarios**:

1. **Given** a user is adding an expense, **When** they open the category dropdown, **Then** they see the four predefined categories: Food, Vehicle, Household, Medicines.
2. **Given** a user is adding a general expense, **When** they choose to add a new category, **Then** the new category is saved globally and available for all future general expenses.
3. **Given** a user is adding a project expense, **When** they choose to add a new category, **Then** the new category is saved only within that project and does not appear in the general expense category list.
4. **Given** a global custom category exists, **When** a user adds a general expense, **Then** the global custom category appears in the dropdown alongside predefined categories.
5. **Given** a project-scoped custom category exists, **When** a user adds a general expense outside that project, **Then** the project-scoped category does not appear in the dropdown.

---

### User Story 4 - Project Creation and Management (Priority: P4)

A logged-in user creates named projects to group related expenses together. They can view a list of their projects, open any project to see its expenses, and delete a project when it is no longer needed.

**Why this priority**: Projects provide organisational structure for tracking expenses by initiative, event, or purpose. This comes after general expense management is established.

**Independent Test**: Can be fully tested by creating a project, adding it to the project list view, and opening it to confirm it starts with an empty expense list — delivers project organisation without depending on reports.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the dashboard, **When** they create a new project by providing a name, **Then** the project appears in their project list.
2. **Given** a project exists, **When** a user opens it, **Then** they see the project's expense list and options to add expenses within the project.
3. **Given** a project exists, **When** a user deletes it, **Then** the project and all its expenses are removed and no longer accessible.
4. **Given** a user attempts to create a project without a name, **When** they submit the form, **Then** validation prevents creation and requests a project name.

---

### User Story 5 - Adding and Managing Project Expenses (Priority: P5)

A logged-in user adds expenses directly within a project. These expenses use the same fields as general expenses (Title, Amount, Date, Category, optional Description) but are stored under the project and do not appear in the general expense dashboard.

**Why this priority**: Project-scoped expense tracking is only meaningful after projects exist. This story delivers the full project expense workflow.

**Independent Test**: Can be fully tested by adding an expense inside a project and confirming it appears in the project's expense list but not in the general dashboard.

**Acceptance Scenarios**:

1. **Given** a user is inside a project, **When** they add an expense with Title, Amount, Date, and Category, **Then** the expense is saved under the project and visible in the project's expense list.
2. **Given** a project expense has been saved, **When** a user views the general expense dashboard, **Then** the project expense does not appear there.
3. **Given** a project expense exists, **When** a user edits or deletes it, **Then** the change is reflected only within the project.
4. **Given** a user adds a project expense without a required field, **When** they submit, **Then** validation prevents saving and highlights the missing field.

---

### User Story 6 - Reports and Summary Dashboard (Priority: P6)

A logged-in user views spending reports. They can see a report of general expenses (outside projects), a report within any specific project, and an overall summary showing total spending broken down by category across all expenses. Any report can be downloaded as a CSV file for use in external spreadsheet tools.

**Why this priority**: Reporting delivers insight and is only possible once expenses and projects exist. It is the culmination of the feature set.

**Independent Test**: Can be fully tested by adding expenses with varying categories across general and project contexts, then verifying each report view accurately reflects the relevant totals and category breakdowns.

**Acceptance Scenarios**:

1. **Given** a user has general expenses recorded, **When** they view the general expenses report, **Then** they see a breakdown of expenses by category with totals, filterable by date range.
2. **Given** a project has expenses recorded, **When** a user views the project report, **Then** they see that project's expenses broken down by category with totals, filterable by date range.
3. **Given** a user views the overall summary, **When** the summary loads, **Then** it shows a flat view of total spending per category aggregated across both general and all project expenses.
3a. **Given** a user is in the flat overall summary view, **When** they toggle to the breakdown view, **Then** each category expands to show sub-totals per source (General expenses and each individual project).
3b. **Given** a user is in the expanded breakdown view, **When** they toggle back to the flat view, **Then** only the combined category totals are shown.
4. **Given** no expenses exist in a report scope, **When** a user views that report, **Then** they see a clear empty state message rather than blank content.
5. **Given** a user applies a date range filter to any report, **When** the filter is applied, **Then** only expenses within the selected date range are shown and totals update accordingly.

---

### Edge Cases

- What happens when a user tries to add an expense with a negative amount?
- How does the system handle two custom categories with the same name (one global, one project-scoped)?
- When a custom category is deleted, existing expenses retain their category label (resolved: FR-017c). Deleted categories continue to appear in reports as long as expenses reference them.
- How are expenses displayed when no date filter is applied — all time, or current month by default?
- What happens when a project is deleted — are expenses permanently removed or archived?
- If a user edits the amount or category on a recurring expense, do future auto-generated instances reflect the updated values or the original values?
- If the app is offline or unavailable when a recurring expense is due, when does the auto-generation catch up?

---

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication

- **FR-001**: System MUST allow new users to register with an email address and password.
- **FR-002**: System MUST allow registered users to log in with their email and password.
- **FR-003**: System MUST allow logged-in users to log out, ending their session.
- **FR-004**: System MUST prevent unauthenticated users from accessing any expense or project data.
- **FR-005**: System MUST display a clear error message when login credentials are incorrect.
- **FR-006**: System MUST prevent registration with a duplicate email address.

#### General Expense Management

- **FR-007**: System MUST allow logged-in users to add a general expense with the following fields: Title (required), Amount (required, numeric), Date (required), Category (required, from dropdown), Description (optional free text), Recurring (optional, with frequency: weekly, monthly, or yearly).
- **FR-008**: System MUST prevent saving an expense when any required field is empty, and clearly indicate which field(s) are missing.
- **FR-009**: System MUST allow users to edit any field of an existing general expense, including its recurrence setting.
- **FR-010**: System MUST allow users to delete a general expense, with confirmation before permanent removal.
- **FR-011**: System MUST display all general expenses in a list on the main dashboard, sorted by date in reverse-chronological order by default.
- **FR-011d**: System MUST allow users to search the general expense list by keyword, matching against expense title and description fields.
- **FR-011e**: System MUST allow users to filter the general expense list by category, date range, or a combination of both.
- **FR-011f**: System MUST update the displayed expense list in real time (or near-real time) as search terms or filters are applied, without requiring a full page reload.
- **FR-011a**: System MUST automatically create a new expense instance for each recurring expense when its next due date is reached, using the same Title, Amount, Category, and Description as the original.
- **FR-011b**: System MUST allow users to cancel a recurrence on any recurring expense; cancellation stops future auto-generation but does not delete previously generated instances.
- **FR-011c**: System MUST visually distinguish recurring expenses in the expense list so users can identify them at a glance.

#### Category Management

- **FR-012**: System MUST provide four predefined categories in the category dropdown for all expenses: Food, Vehicle, Household, Medicines.
- **FR-013**: System MUST allow users to create a new custom category from within the expense form when the desired category is not in the list.
- **FR-014**: System MUST scope custom categories created in the general expense context as globally available across all general expenses.
- **FR-015**: System MUST scope custom categories created within a project as available only within that project's expense forms.
- **FR-016**: System MUST NOT display project-scoped categories in the general expense category dropdown.
- **FR-017**: System MUST NOT display global custom categories from other projects unless they are global.
- **FR-017a**: System MUST allow users to delete any custom category (global or project-scoped); predefined categories cannot be deleted.
- **FR-017b**: When a custom category is deleted, it MUST be removed from the category dropdown for new expenses immediately.
- **FR-017c**: When a custom category is deleted, all existing expenses that were tagged with it MUST retain their category label unchanged, preserving historical accuracy in the expense list and all reports.

#### Project Management

- **FR-018**: System MUST allow users to create a named project.
- **FR-019**: System MUST display a list of the user's projects on the main dashboard.
- **FR-020**: System MUST allow users to open a project and view its dedicated expense list.
- **FR-021**: System MUST allow users to delete a project, removing all its associated expenses and project-scoped categories.

#### Project Expense Management

- **FR-022**: System MUST allow users to add expenses within a project using the same fields as general expenses (Title required, Amount required, Date required, Category required, Description optional).
- **FR-023**: System MUST store project expenses exclusively within their parent project and not display them on the general expense dashboard.
- **FR-024**: System MUST allow users to edit and delete expenses within a project.

#### Reporting

- **FR-025**: System MUST provide a general expense report showing total spending per category for expenses outside of projects.
- **FR-026**: System MUST provide a project-specific report for each project showing total spending per category within that project.
- **FR-027**: System MUST provide an overall summary report showing combined total spending per category across all general expenses and all projects, displayed in a flat (single-total) view by default.
- **FR-027a**: System MUST allow users to toggle the overall summary to an expanded breakdown view, where each category shows sub-totals per source (General expenses plus each individual project).
- **FR-027b**: System MUST allow users to toggle back from the expanded breakdown view to the flat totals view.
- **FR-028**: System MUST allow users to filter any report by date range.
- **FR-029**: System MUST display a clear empty state when a report has no data to show.
- **FR-030**: System MUST allow users to download any report (general, project-specific, or overall summary) as a CSV file containing the individual expense rows included in that report.
- **FR-031**: The exported CSV MUST include at minimum: expense title, amount, date, category, and description for each expense row.

### Key Entities

- **User**: Represents an authenticated account. Attributes: email address, password (stored securely), account creation date. Owns all expenses, projects, and global custom categories.
- **Expense**: A single recorded spending event. Attributes: title, amount, date, description (optional), category, scope (general or project), is_recurring (boolean), recurrence_frequency (weekly/monthly/yearly, present only when is_recurring is true), recurrence_parent_id (links auto-generated instances back to the original recurring expense). Belongs to either the user's general pool or a specific project.
- **Project**: A named container for grouping related expenses. Attributes: name, creation date. Belongs to a user and contains zero or more project expenses and project-scoped categories.
- **Category**: A label applied to expenses. Attributes: name, type (predefined or custom), scope (global or project-specific). Predefined categories are system-wide; custom categories are either global to the user or scoped to a project.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can complete registration and add their first expense in under 3 minutes.
- **SC-002**: Users can add or edit an expense in under 60 seconds after navigating to the form.
- **SC-003**: The overall summary report loads and displays category totals within 2 seconds for a user with up to 500 expenses.
- **SC-004**: 95% of users can successfully add an expense without encountering unhandled errors.
- **SC-005**: All required field validations trigger correctly 100% of the time, preventing incomplete expense records from being saved.
- **SC-006**: Project-scoped categories are isolated correctly such that 0 project categories appear in the general expense dropdown in testing.
- **SC-007**: Reports accurately reflect all recorded expenses, with category totals matching the sum of individual expense amounts 100% of the time.

---

## Assumptions

- Each user account is personal and isolated — users can only see their own expenses, projects, and categories. There is no multi-user collaboration or shared project access in this version.
- The application is a single-currency system. Currency type and symbol are not configurable per expense; all amounts are recorded as numbers.
- Deleted projects and their expenses are permanently removed. There is no archive or soft-delete in this version.
- The default report view shows all-time data; date range filtering is available but not applied by default.
- Password reset ("forgot password") functionality is out of scope for this version; users must contact support if they lose access.
- The application targets web browsers. Native mobile app support is out of scope for this version.
- Predefined categories (Food, Vehicle, Household, Medicines) cannot be edited or removed by users.
- There is no upper limit on the number of custom categories a user may create in this version.
- Expense amounts must be positive numeric values. Negative amounts and zero are considered invalid.
