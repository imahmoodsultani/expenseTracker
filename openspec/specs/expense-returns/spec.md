## ADDED Requirements

### Requirement: Negative amount records a return
The system SHALL allow expenses to be saved with a negative amount. A negative amount represents a return or refund for goods or services previously purchased. Zero amounts SHALL be rejected. Positive amounts continue to represent normal expenses.

#### Scenario: Save a return expense with a negative amount
- **WHEN** a user submits an expense form with amount `-25.00`, a title, date, and category
- **THEN** the expense is saved successfully and appears in the expense list with the amount displayed as `-$25.00`

#### Scenario: Zero amount is rejected
- **WHEN** a user submits an expense form with amount `0`
- **THEN** the form displays a validation error "Amount cannot be zero" and the expense is not saved

#### Scenario: Positive amount still accepted
- **WHEN** a user submits an expense form with amount `50.00`
- **THEN** the expense is saved as a normal expense without change in behavior

### Requirement: Return expenses are visually distinguished in the expense list
The system SHALL display a "Return" badge next to any expense whose amount is negative. The amount SHALL be rendered in a visually distinct style (e.g., red color) to make returns immediately identifiable at a glance.

#### Scenario: Return badge on negative expense
- **WHEN** the expense list renders an expense with `amount < 0`
- **THEN** a "Return" label/badge is shown alongside the expense row and the amount appears in red

#### Scenario: No badge on positive expense
- **WHEN** the expense list renders an expense with `amount > 0`
- **THEN** no "Return" badge is shown and the amount is displayed in the default style

### Requirement: Reports correctly aggregate negative amounts
The system SHALL include negative-amount expenses in all report calculations. Category totals SHALL reflect the net amount (sum of positive expenses minus absolute value of returns).

#### Scenario: Category total reduced by return
- **WHEN** a user has a $100.00 Food expense and a -$30.00 Food return
- **THEN** the Food category total in any report shows $70.00

#### Scenario: CSV export includes negative amounts
- **WHEN** a user downloads a report that contains a return expense
- **THEN** the exported CSV row for that expense shows the negative amount value (e.g., `-30.00`)

### Requirement: Form communicates that negative amounts represent returns
The system SHALL display helper text on the amount input field informing the user that entering a negative amount will record the expense as a return or refund.

#### Scenario: Helper text visible on expense form
- **WHEN** a user opens the add or edit expense form
- **THEN** helper text is visible near the amount field stating that a negative amount represents a return/refund
