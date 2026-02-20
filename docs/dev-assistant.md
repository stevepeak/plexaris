# Dev Assistant - Floating AI Chat Button

## Context

The app needs a developer-only AI assistant accessible from every page. It opens a chat panel where you can ask an AI (via OpenRouter) to perform CRUD operations on products, suggestions, and members directly in the database. This replaces manual SQL/API calls during development.

## Architecture

- **API route** (`/api/dev/chat`) streams AI responses using `streamText` from AI SDK with server-side tools that use Drizzle ORM directly
- **Frontend** uses `useChat` from `@ai-sdk/react` to stream messages into a Sheet (slide-in panel)
- **Dev-only** gated by `process.env.NODE_ENV === 'development'` in both the layout and the API route
- Reuses existing `createModel()` from `@app/agents` for the OpenRouter model

## New Files

### 1. `apps/web/app/api/dev/chat/route.ts` — API Route

POST handler that:

- Guards with `NODE_ENV !== 'development'` → 404
- Creates a `db` instance via `createDb()` from `@app/db`
- Gets a dev user ID via `SELECT id FROM user LIMIT 1` (needed for FK constraints on `productVersion.editedBy` and `invitation.invitedBy`)
- Calls `streamText()` with `createModel()`, a system prompt, and 12 tools
- Returns `result.toUIMessageStreamResponse()`
- Uses `maxSteps: 10` for multi-step tool chains

**Tools (all use Drizzle ORM queries):**

| Tool                | Input                                                                  | Operation                                             |
| ------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------- |
| `listOrganizations` | `{}`                                                                   | SELECT all orgs                                       |
| `listProducts`      | `organizationId, includeArchived?`                                     | SELECT products by org                                |
| `getProduct`        | `id`                                                                   | SELECT product by id                                  |
| `createProduct`     | `organizationId, name, description?, price?, unit?, category?`         | INSERT product (status: active) + productVersion (v1) |
| `updateProduct`     | `id, name?, description?, price?, unit?, category?, status?`           | UPDATE product + new productVersion                   |
| `archiveProduct`    | `id`                                                                   | SET archivedAt + status='archived'                    |
| `listSuggestions`   | `organizationId, status?, targetType?`                                 | SELECT suggestions with filters                       |
| `createSuggestion`  | `organizationId, targetType, action, field, label, proposedValue, ...` | INSERT suggestion (triggerRunId: 'dev-assistant')     |
| `acceptSuggestion`  | `id`                                                                   | Apply suggestion (mirrors tRPC accept logic)          |
| `dismissSuggestion` | `id`                                                                   | Mark dismissed, archive draft if applicable           |
| `listMembers`       | `organizationId`                                                       | SELECT memberships + user join                        |
| `inviteMember`      | `organizationId, email, role?`                                         | INSERT invitation with token + 7d expiry              |
| `removeMember`      | `membershipId`                                                         | DELETE membership                                     |

### 2. `apps/web/components/dev-assistant/dev-assistant-button.tsx` — Main Component

Client component with:

- `useChat` connected to `/api/dev/chat` via `DefaultChatTransport`
- Fixed floating `<Button>` (bottom-right, z-50) with `Bot` icon
- `<Sheet side="right">` containing:
  - Header with title
  - Scrollable message list (auto-scroll on new messages)
  - Input form with send button
- Empty state with example prompts

### 3. `apps/web/components/dev-assistant/chat-message.tsx` — Message Bubble

Renders a `UIMessage`:

- User messages: right-aligned, primary color
- Assistant messages: left-aligned, muted background
- `text` parts: rendered as-is with `whitespace-pre-wrap`
- `tool-invocation` parts: `<Badge>` with tool name + collapsible `<details>` for result JSON

### 4. `apps/web/components/dev-assistant/index.ts` — Barrel Export

### 5. Story Files

- `dev-assistant-button.stories.tsx` — Default story (fullscreen layout)
- `chat-message.stories.tsx` — UserMessage, AssistantTextMessage, AssistantWithToolCall variants

## Modified Files

### `apps/web/app/layout.tsx`

Add after the provider stack closing tag, inside `<body>`:

```tsx
{
  process.env.NODE_ENV === 'development' && <DevAssistantButton />
}
```

### `apps/web/package.json`

Add dependencies: `"@ai-sdk/react": "catalog:"`, `"ai": "catalog:"`

### Root `package.json`

Add to catalog: `"@ai-sdk/react": "^6.0.73"`

## Key Implementation Details

- **FK constraints**: `productVersion.editedBy` and `invitation.invitedBy` reference `user.id`. The route queries for the first user at startup and uses their ID.
- **triggerRunId**: Required non-null on `suggestion` table. Use `'dev-assistant'` for dev-created suggestions.
- **Product versioning**: `createProduct` inserts product + version 1 + sets `currentVersionId`. `updateProduct` creates a new version with incremented version number.
- **Streaming flow**: `useChat` → POST `/api/dev/chat` → `streamText` with tools → `toUIMessageStreamResponse()` → client receives SSE stream

## Verification

1. Visit `http://localhost:3000` — floating bot button should appear in bottom-right
2. Click button — Sheet slides in from right with chat interface
3. Type "List all organizations" — should stream a response with tool call results
4. Type "Create a product called Test Widget in org [id]" — should create product and confirm
5. Run `bun run fix && bun run knip:fix` then `bun run ci` — should pass
6. In production build, the button should not appear (tree-shaken)
