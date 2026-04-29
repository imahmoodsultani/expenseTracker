## ADDED Requirements

### Requirement: Display profile avatar in header
The system SHALL replace the "Profile" text link and email span in the desktop header with a circular user avatar icon button. The email span SHALL be removed entirely.

#### Scenario: Desktop header shows avatar icon, not text
- **WHEN** an authenticated user views the dashboard on a viewport of 768px or wider
- **THEN** the header SHALL display a circular avatar icon button in place of the "Profile" NavLink
- **AND** the header SHALL NOT display the user's email address

#### Scenario: Mobile header is unchanged
- **WHEN** an authenticated user views the dashboard on a viewport narrower than 768px
- **THEN** the avatar icon button SHALL NOT be visible (mobile navigation handles profile access)

### Requirement: Avatar click opens profile quick-view popover
The system SHALL display a popover when the user clicks the avatar icon. The popover SHALL contain the user's name (read-only) and email (read-only) and an "Edit Details" action.

#### Scenario: Popover shows read-only name and email
- **WHEN** an authenticated user clicks the avatar icon in the header
- **THEN** a popover SHALL appear showing the user's name and email as non-editable display text

#### Scenario: Name is not set
- **WHEN** an authenticated user who has not set a name clicks the avatar icon
- **THEN** the popover SHALL display a placeholder such as "No name set" in the name field

#### Scenario: Popover closes on outside click
- **WHEN** a popover is open and the user clicks outside of it
- **THEN** the popover SHALL close

### Requirement: Edit Details navigates to profile page
The popover SHALL include an "Edit Details" button that navigates the user to the `/profile` page.

#### Scenario: Edit Details button navigates to /profile
- **WHEN** a user clicks the "Edit Details" button inside the profile popover
- **THEN** the user SHALL be navigated to `/profile`
- **AND** the popover SHALL close
