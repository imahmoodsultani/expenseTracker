## MODIFIED Requirements

### Requirement: Database schema extended for profile fields
The system SHALL store `name`, `phoneNumber`, and `address` as nullable string fields on the `User` model. The `User` model's primary key SHALL be an auto-incrementing integer (`Int @id @default(autoincrement())`), replacing the previous CUID string identifier. All foreign keys referencing `User.id` (e.g., `userId` on `Project`, `Expense`, `Category`) SHALL also be `Int`.

#### Scenario: Existing users are unaffected by migration
- **WHEN** the Prisma migration changing ID types is applied in a fresh development environment
- **THEN** all models SHALL be recreatable with integer primary keys and no data loss in production-equivalent seed data

#### Scenario: User ID is an integer in API responses
- **WHEN** an authenticated HTTP client calls any API endpoint that returns a user object
- **THEN** the `id` field SHALL be a JSON number, not a string

#### Scenario: Session user ID is a number
- **WHEN** an authenticated user has an active session
- **THEN** `session.user.id` SHALL be castable to a positive integer without data loss
