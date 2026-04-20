## MODIFIED Requirements

### Requirement: View profile information
The system SHALL display the authenticated user's current profile information (name, email, phone number, address) on a dedicated profile page accessible at `/profile`. The profile page layout SHALL be fully responsive, rendering in a single-column layout on screens narrower than 640px and adapting spacing to mobile viewports.

#### Scenario: Authenticated user visits profile page
- **WHEN** an authenticated user navigates to `/profile`
- **THEN** the page SHALL render a form pre-populated with their current name, email, phone number, and address

#### Scenario: Unauthenticated user visits profile page
- **WHEN** an unauthenticated user navigates to `/profile`
- **THEN** the system SHALL redirect them to the sign-in page

#### Scenario: Profile form on mobile viewport
- **WHEN** an authenticated user visits `/profile` on a screen narrower than 640px
- **THEN** all form fields SHALL stack in a single column with no horizontal overflow
- **AND** section cards SHALL have reduced padding appropriate for mobile (e.g., `p-4` instead of `p-6`)
