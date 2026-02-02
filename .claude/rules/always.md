# Development

- This project is not in production. Do not add backwards-compatible shims, deprecation paths, or migration logic.
- When development is complete run the following in order:
  1. `bun run fix && bun run knip:fix`
  2. `bun run ci`
- Dev services are already running. The web app is at `http://localhost:3000/`.
  - Do not start, restart, or spawn dev servers. If something is not working, inform the user to restart services themselves.

# Monorepo Structure

This is a Turborepo monorepo using Bun workspaces. All code must stay within this structure:

```
apps/
  web/          # Next.js 16 (App Router, React 19) — the main frontend
  trigger/      # Trigger.dev background jobs
packages/
  api/          # tRPC router definitions and procedures
  db/           # Drizzle ORM schema, migrations, and database client
  config/       # Shared environment variable validation (Zod)
  agents/       # AI agent tooling and MCP integration
  utils/        # Shared utility functions
  posthog/      # PostHog analytics helpers
config/
  eslint/       # Shared ESLint configuration (@plexaris/eslint-config)
  tsconfig/     # Shared TypeScript configurations
```

- Do not create new top-level directories or packages without explicit instruction.
- Import shared code from the appropriate package rather than duplicating logic across apps.

# Database

When database changes are required, follow these steps in order:

1. Modify the Drizzle schema in `packages/db/src/schema/`.
2. Generate a migration: `bun --cwd packages/db db:generate`
3. Apply the migration: `bun --cwd packages/db db:migrate`
4. Regenerate schema types (see `packages/db/package.json` for the exact script).
5. Run typecheck after types are regenerated to confirm nothing is broken.

Do not use `db:push` for schema changes — always create proper migration files.

# Components

- Use shadcn/ui components (new-york style, configured in `apps/web/components.json`) as the base building blocks.
- Compose shadcn primitives into higher-level reusable components when a pattern is used in more than one place.
- All components must have corresponding Storybook stories (`*.stories.tsx` co-located with the component).
- Use Tailwind CSS utility classes for styling. Avoid custom CSS or inline styles unless explicitly asked for.
