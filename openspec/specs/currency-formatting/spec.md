## ADDED Requirements

### Requirement: Format monetary amounts as PKR with comma separators
The system SHALL provide a `formatCurrency(amount: number | string): string` utility that converts a numeric amount into a PKR-formatted string with `Rs.` prefix, thousands commas, and two decimal places.

#### Scenario: Format a whole-number amount
- **WHEN** `formatCurrency(1500)` is called
- **THEN** it returns `"Rs. 1,500.00"`

#### Scenario: Format a large amount
- **WHEN** `formatCurrency(1234567.89)` is called
- **THEN** it returns `"Rs. 1,234,567.89"`

#### Scenario: Format a string amount (from API/Prisma)
- **WHEN** `formatCurrency("2500.5")` is called
- **THEN** it returns `"Rs. 2,500.50"`

#### Scenario: Format zero
- **WHEN** `formatCurrency(0)` is called
- **THEN** it returns `"Rs. 0.00"`

### Requirement: Display PKR amounts in expense list
The system SHALL display each expense's amount using `formatCurrency` in the expense list, replacing the previous `$X.XX` format.

#### Scenario: Expense list shows PKR amount
- **WHEN** an expense with amount `5000` is rendered in the expense list
- **THEN** the amount is displayed as `Rs. 5,000.00`

### Requirement: Display PKR amounts in project list
The system SHALL display each project's total amount using `formatCurrency` in the project list card.

#### Scenario: Project card shows PKR total
- **WHEN** a project with totalAmount `75000` is displayed
- **THEN** the total is shown as `Rs. 75,000.00`

### Requirement: Display PKR amounts on dashboard and project detail pages
The system SHALL format the computed total amount on the dashboard and project detail pages using `formatCurrency`.

#### Scenario: Dashboard total shows PKR
- **WHEN** the dashboard renders a list of expenses totalling `12000`
- **THEN** the total is displayed as `Rs. 12,000.00`

### Requirement: Display PKR amounts in all report pages
The system SHALL format all monetary values (grand totals, row totals, sub-totals) in the general report, project report, and summary report pages using `formatCurrency`.

#### Scenario: Report grand total shows PKR
- **WHEN** a report page renders with a grand total of `500000`
- **THEN** it is displayed as `Rs. 5,00,000.00` — actually `Rs. 500,000.00`

### Requirement: Display PKR amounts in chart tooltip
The system SHALL format the category totals chart tooltip value using `formatCurrency`.

#### Scenario: Chart tooltip shows PKR
- **WHEN** the user hovers over a chart segment with value `8500`
- **THEN** the tooltip displays `Rs. 8,500.00`
