## ADDED Requirements

### Requirement: README exists at project root
The project SHALL have a `README.md` at the repository root containing all information needed to understand, set up, and run the application.

#### Scenario: Developer opens the repository
- **WHEN** a developer opens the repository on GitHub or locally
- **THEN** they SHALL see a README.md rendered at the root level

### Requirement: README includes project overview
The README SHALL include a project title, brief description of purpose, and a bullet list of key features.

#### Scenario: Developer wants to understand the app
- **WHEN** a developer reads the README
- **THEN** they SHALL understand this is an expense tracking app with authentication, project management, categories, recurring expenses, reports, CSV export, and search/filter

### Requirement: README documents tech stack
The README SHALL list the core technologies with their versions.

#### Scenario: Developer evaluates the stack
- **WHEN** a developer reads the tech stack section
- **THEN** they SHALL see Next.js 15, React 19, TypeScript 5, Prisma 5, MySQL 8, Auth.js v5, Tailwind CSS, Recharts, Zod, React Hook Form

### Requirement: README documents project structure
The README SHALL include the top-level directory structure with brief descriptions.

#### Scenario: Developer wants to navigate the codebase
- **WHEN** a developer reads the project structure section
- **THEN** they SHALL understand the purpose of app/, components/, lib/, prisma/, and root config files

### Requirement: README documents environment setup
The README SHALL list all required environment variables with descriptions and show the `.env.local` template.

#### Scenario: Developer sets up environment
- **WHEN** a developer follows the README
- **THEN** they SHALL know to set DATABASE_URL, AUTH_SECRET, AUTH_URL, and CRON_SECRET, and how to generate secrets

### Requirement: README provides local development quickstart
The README SHALL provide numbered, copy-pasteable commands to run the app locally with Docker MySQL.

#### Scenario: Developer runs the app for the first time
- **WHEN** a developer follows the "Getting Started" section sequentially
- **THEN** they SHALL be able to start the app at http://localhost:3000 by: cloning the repo, copying .env.local.example, starting Docker, installing deps, running migrations, seeding, and starting the dev server

### Requirement: README documents Vercel deployment
The README SHALL include steps for deploying to Vercel with Aiven for MySQL.

#### Scenario: Developer deploys to Vercel
- **WHEN** a developer follows the deployment section
- **THEN** they SHALL know to provision Aiven for MySQL, set env vars in Vercel dashboard, run `npx prisma migrate deploy`, seed the DB, and that the cron job runs daily at 2 AM UTC

### Requirement: README documents available scripts
The README SHALL list all npm scripts with brief descriptions.

#### Scenario: Developer wants to run tests or build
- **WHEN** a developer reads the scripts section
- **THEN** they SHALL know: npm run dev, npm run build, npm start, npm run lint, npm test, and npx prisma commands
