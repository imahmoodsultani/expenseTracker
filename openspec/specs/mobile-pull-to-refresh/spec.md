## ADDED Requirements

### Requirement: Pull-to-refresh on mobile expense list
The mobile expenses screen SHALL support a pull-to-refresh gesture that triggers a reload of the expense data when the user swipes down from the top of the list.

#### Scenario: User swipes down on expense list
- **WHEN** an authenticated mobile user swipes down from the top of the expenses list screen
- **THEN** the app SHALL display a platform-native loading spinner and SHALL reload the full expense list, categories, and projects data from the API

#### Scenario: Refresh completes successfully
- **WHEN** the data reload triggered by pull-to-refresh completes successfully
- **THEN** the loading spinner SHALL dismiss and the list SHALL display the freshly fetched expenses

#### Scenario: Refresh fails due to network error
- **WHEN** the data reload triggered by pull-to-refresh fails (e.g., network error)
- **THEN** the loading spinner SHALL dismiss, the existing list data SHALL remain visible, and an error alert SHALL be shown to the user

### Requirement: Refresh does not interfere with existing load state
The pull-to-refresh mechanism SHALL be independent from the initial loading state indicator so that the full-screen loader is not shown during a pull-to-refresh cycle.

#### Scenario: Pull-to-refresh does not show full-screen spinner
- **WHEN** a user triggers pull-to-refresh on the expenses screen
- **THEN** the full-screen `ActivityIndicator` SHALL NOT be displayed; only the `RefreshControl` spinner SHALL be visible
