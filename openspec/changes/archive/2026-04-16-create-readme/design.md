## Context

The project has no README. All setup knowledge lives in CLAUDE.md (dev-only), scattered spec files, and `.env.local.example`. A single `README.md` at the repo root is the standard developer entry point.

## Goals / Non-Goals

**Goals:**
- Single `README.md` covering project purpose, features, tech stack, structure, env setup, local dev, database setup, testing, and Vercel deployment
- Runnable from top to bottom by a developer who has never seen the project

**Non-Goals:**
- API documentation (already in specs)
- Contributing guidelines
- Changelog / release notes

## Decisions

**Single file at root (`README.md`)**
A root-level README is the universal convention and is auto-rendered by GitHub/GitLab. No need for a `docs/` folder for a project of this size.

**Include both local Docker and Aiven MySQL paths**
The project supports both (docker-compose.yml for local, Aiven for Vercel). Both paths must be documented so developers aren't blocked regardless of their setup preference.

**Keep "How to Run" section minimal and sequential**
Developers scan READMEs; the run section should be a numbered list of copy-pasteable commands, not prose.

## Risks / Trade-offs

- **Stale content** → README is a snapshot; it can drift from code over time. Mitigation: keep it high-level so it doesn't need constant updates.

## Migration Plan

1. Write `README.md` at project root
2. No rollback needed — purely additive
