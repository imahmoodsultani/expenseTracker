## ADDED Requirements

### Requirement: Responsive form grids
All multi-column form grids SHALL default to a single column on mobile and expand to two columns at the `sm` breakpoint (640px) or wider.

#### Scenario: Expense form on mobile
- **WHEN** the viewport width is less than 640px
- **THEN** the Amount and Date fields in ExpenseForm stack vertically (single column)

#### Scenario: Expense form on tablet/desktop
- **WHEN** the viewport width is 640px or wider
- **THEN** the Amount and Date fields render side by side (two columns)

### Requirement: Responsive expense list rows
Expense list rows SHALL stack their content vertically on mobile screens, showing title/category on top and amount/actions below, rather than forcing all content into a single horizontal row.

#### Scenario: Expense row on mobile
- **WHEN** the viewport width is less than 640px
- **THEN** each expense row shows the title and category on one line and the amount and action buttons on the next line

#### Scenario: Expense row on desktop
- **WHEN** the viewport width is 640px or wider
- **THEN** each expense row displays title, amount, and action buttons in a single horizontal row

### Requirement: Responsive page headings and spacing
Page headings SHALL scale down on mobile screens. Page-level vertical spacing SHALL use smaller values on mobile and larger values on desktop.

#### Scenario: Heading size on mobile
- **WHEN** a page heading (h1) is rendered on a viewport narrower than 640px
- **THEN** the heading text is sized at `text-xl` or smaller

#### Scenario: Page spacing on mobile
- **WHEN** a dashboard page is rendered on a viewport narrower than 640px
- **THEN** vertical gaps between sections are reduced compared to desktop (e.g., `space-y-4` instead of `space-y-6`)

### Requirement: Responsive table overflow
All data tables on report pages SHALL be wrapped in a horizontally scrollable container so that the table content does not overflow the viewport on small screens.

#### Scenario: Table overflow on mobile
- **WHEN** a report table is wider than the viewport
- **THEN** the user can horizontally scroll within the table container without the page layout breaking

### Requirement: Button touch targets
All interactive buttons SHALL have a minimum touch target area of 44×44px on mobile screens to meet accessibility and usability standards.

#### Scenario: Action buttons on mobile
- **WHEN** action buttons (Edit, Delete, Save, Cancel) are rendered on a mobile viewport
- **THEN** each button has at least 44px of height via padding

### Requirement: Header mobile optimization
On mobile screens, the email address shown in the header SHALL be hidden to conserve space, and the header padding/gap values SHALL be reduced to prevent overflow.

#### Scenario: Email hidden on mobile
- **WHEN** the viewport width is less than 768px
- **THEN** the user's email address is not visible in the header

#### Scenario: Header does not overflow
- **WHEN** the dashboard header is rendered on any viewport ≥ 375px
- **THEN** the header content fits within the viewport without horizontal overflow
