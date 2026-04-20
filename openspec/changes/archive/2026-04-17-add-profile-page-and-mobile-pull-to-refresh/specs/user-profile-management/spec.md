## ADDED Requirements

### Requirement: View profile information
The system SHALL display the authenticated user's current profile information (name, email, phone number, address) on a dedicated profile page accessible at `/profile`.

#### Scenario: Authenticated user visits profile page
- **WHEN** an authenticated user navigates to `/profile`
- **THEN** the page SHALL render a form pre-populated with their current name, email, phone number, and address

#### Scenario: Unauthenticated user visits profile page
- **WHEN** an unauthenticated user navigates to `/profile`
- **THEN** the system SHALL redirect them to the sign-in page

### Requirement: Update general profile fields
The system SHALL allow authenticated users to update their name, email, phone number, and address via the profile page form.

#### Scenario: Successful general info update
- **WHEN** an authenticated user submits the general info form with valid name, email, phone number, and address values
- **THEN** the system SHALL persist the changes to the database and display a success confirmation to the user

#### Scenario: Email already in use
- **WHEN** an authenticated user submits a new email address that belongs to another account
- **THEN** the system SHALL return an error indicating the email is already taken and SHALL NOT update any fields

#### Scenario: Invalid email format
- **WHEN** an authenticated user submits a value that is not a valid email address in the email field
- **THEN** the system SHALL display a validation error before submitting to the server

### Requirement: Change password
The system SHALL allow authenticated users to change their password by providing their current password and a new password.

#### Scenario: Successful password change
- **WHEN** an authenticated user submits a valid current password and a new password of at least 8 characters
- **THEN** the system SHALL hash the new password and persist it, and SHALL display a success confirmation

#### Scenario: Incorrect current password
- **WHEN** an authenticated user submits an incorrect current password
- **THEN** the system SHALL return a 400 error with a message indicating the current password is wrong and SHALL NOT update the password

#### Scenario: New password too short
- **WHEN** an authenticated user submits a new password shorter than 8 characters
- **THEN** the system SHALL display a validation error before submitting to the server

### Requirement: Profile API endpoint
The system SHALL expose a `PATCH /api/profile` endpoint that accepts partial updates to the authenticated user's profile fields.

#### Scenario: Authenticated PATCH request with valid data
- **WHEN** an authenticated HTTP client sends a PATCH request to `/api/profile` with a JSON body containing one or more valid profile fields
- **THEN** the server SHALL update only the provided fields and return the updated user object with a 200 status

#### Scenario: Unauthenticated PATCH request
- **WHEN** an unauthenticated HTTP client sends a PATCH request to `/api/profile`
- **THEN** the server SHALL return a 401 Unauthorized response

#### Scenario: Password change via API with wrong current password
- **WHEN** an authenticated HTTP client sends a PATCH request with `currentPassword` and `newPassword` but `currentPassword` does not match the stored hash
- **THEN** the server SHALL return a 400 response with an error message and SHALL NOT update the password

### Requirement: Database schema extended for profile fields
The system SHALL store `name`, `phoneNumber`, and `address` as nullable string fields on the `User` model.

#### Scenario: Existing users are unaffected by migration
- **WHEN** the Prisma migration adding `name`, `phoneNumber`, and `address` is applied
- **THEN** all existing `User` rows SHALL remain valid with NULL values for the new fields
