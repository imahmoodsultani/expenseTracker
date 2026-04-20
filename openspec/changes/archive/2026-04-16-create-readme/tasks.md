## 1. Create README.md

- [x] 1.1 Create `README.md` at project root with title, badges (optional), and project description
- [x] 1.2 Add Features section listing all key capabilities (auth, expenses, projects, categories, recurring, reports, CSV export, search/filter)
- [x] 1.3 Add Tech Stack section listing Next.js 15, React 19, TypeScript 5, Prisma 5, MySQL 8, Auth.js v5, Tailwind CSS, Recharts, Zod, React Hook Form with versions
- [x] 1.4 Add Project Structure section with annotated directory tree
- [x] 1.5 Add Prerequisites section (Node.js 20+, Docker, npm)

## 2. Environment & Setup

- [x] 2.1 Add Environment Variables section listing DATABASE_URL, AUTH_SECRET, AUTH_URL, CRON_SECRET with descriptions and how to generate secrets (`openssl rand -base64 32`)
- [x] 2.2 Show the `.env.local` template (copied from `.env.local.example`)

## 3. Getting Started (Local Dev)

- [x] 3.1 Add numbered quickstart steps: clone → copy .env.local.example → start Docker (`docker compose up -d`) → npm install → prisma migrate dev → prisma db seed → npm run dev
- [x] 3.2 Confirm app runs at http://localhost:3000

## 4. Available Scripts

- [x] 4.1 Add scripts table/list: npm run dev, npm run build, npm start, npm run lint, npm test, npx prisma migrate dev, npx prisma db seed, npx prisma studio

## 5. Deployment

- [x] 5.1 Add Vercel deployment section: provision Aiven for MySQL via Vercel Marketplace, set env vars in dashboard, run `npx prisma migrate deploy`, seed DB
- [x] 5.2 Note the cron job (`/api/cron/recurring-expenses` runs daily at 2 AM UTC via vercel.json)
