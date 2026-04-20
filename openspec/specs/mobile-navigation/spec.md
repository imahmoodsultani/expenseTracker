## ADDED Requirements

### Requirement: Mobile hamburger menu button
The dashboard layout SHALL display a hamburger button on screens narrower than the `md` breakpoint (768px). The button SHALL be hidden on `md` and wider screens where the full navigation is visible.

#### Scenario: Hamburger visible on small screen
- **WHEN** the viewport width is less than 768px
- **THEN** a hamburger icon button is visible in the header
- **AND** the full horizontal navigation links are hidden

#### Scenario: Hamburger hidden on desktop
- **WHEN** the viewport width is 768px or wider
- **THEN** the hamburger button is not rendered or hidden
- **AND** the full horizontal navigation links are visible

### Requirement: Mobile navigation drawer
The system SHALL display a slide-in or full-width overlay drawer containing all navigation links when the hamburger button is activated. The drawer SHALL close when the user navigates to a new route or taps outside the drawer.

#### Scenario: Drawer opens on hamburger tap
- **WHEN** the user taps the hamburger button
- **THEN** a navigation drawer appears containing all nav links (Expenses, Projects, Reports, Profile, Sign Out)

#### Scenario: Drawer closes on navigation
- **WHEN** the user taps a nav link inside the drawer
- **THEN** the drawer closes and the user is navigated to the selected route

#### Scenario: Drawer closes on backdrop tap
- **WHEN** the drawer is open and the user taps the backdrop area outside the drawer
- **THEN** the drawer closes without navigating

### Requirement: Touch-friendly navigation links
All navigation links in the mobile drawer SHALL have a minimum touch target height of 44px and sufficient horizontal padding to prevent mis-taps.

#### Scenario: Navigation link tap target
- **WHEN** a navigation link is rendered inside the mobile drawer
- **THEN** its clickable area is at least 44px tall
