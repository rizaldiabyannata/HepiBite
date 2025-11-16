## ADDED Requirements
### Requirement: Supabase Authentication
The system SHALL use Supabase Auth for user authentication and session management.

#### Scenario: Admin login with Supabase
- **WHEN** admin provides valid email and password
- **THEN** Supabase Auth SHALL authenticate the user and return a session
- **AND** the session SHALL include user metadata with admin role

#### Scenario: Session validation
- **WHEN** API request includes Supabase session token
- **THEN** the system SHALL validate the session with Supabase
- **AND** extract user role from session metadata

#### Scenario: Admin logout
- **WHEN** admin logs out
- **THEN** Supabase Auth SHALL invalidate the session
- **AND** clear client-side session data

## MODIFIED Requirements
### Requirement: Admin User Management
The system SHALL manage admin users through Supabase Auth with custom role metadata.

#### Scenario: Create admin user
- **WHEN** super admin creates new admin account
- **THEN** Supabase Auth SHALL create the user account
- **AND** set role metadata (ADMIN or SUPER_ADMIN)

#### Scenario: Update admin role
- **WHEN** super admin updates user role
- **THEN** Supabase Auth SHALL update user metadata
- **AND** reflect role changes in subsequent sessions