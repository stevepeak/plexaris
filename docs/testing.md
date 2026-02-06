# Testing Strategy

This document outlines the testing strategy for Plexaris, optimized for **speed** and **high impact**. The goal is to catch regressions fast while keeping CI feedback loops under 60 seconds for the critical path.

## Philosophy

1. **Test at the lowest level possible** — Unit and integration tests are 10-100x faster than E2E tests
2. **E2E tests for critical paths only** — Authentication, order creation, and payment-adjacent flows
3. **Parallelization by default** — All test suites should run concurrently
4. **No flaky tests** — Flaky tests get deleted, not skipped

## Test Pyramid

```
         ╱╲
        ╱  ╲         E2E Tests (Playwright)
       ╱ 5% ╲        ~5-10 critical user journeys
      ╱──────╲       Target: < 30s parallelized
     ╱        ╲
    ╱   15%    ╲     Integration Tests (Vitest)
   ╱────────────╲    tRPC procedures, DB queries
  ╱              ╲   Target: < 10s
 ╱      80%       ╲  Unit Tests (Vitest)
╱──────────────────╲ Components, hooks, utilities
                     Target: < 5s
```

## Tooling Stack

| Layer              | Tool                                 | Why                                               |
| ------------------ | ------------------------------------ | ------------------------------------------------- |
| Unit & Integration | **Vitest**                           | Already in deps, Vite-native, fast HMR, ESM-first |
| Component          | **Vitest Browser Mode**              | Real DOM, faster than Playwright for components   |
| E2E                | **Playwright**                       | Best-in-class reliability, parallel execution     |
| Visual Regression  | **Storybook + Chromatic** (optional) | Leverage existing stories                         |
| API Mocking        | **MSW**                              | Intercept at network level, works everywhere      |

## Directory Structure

```
apps/web/
├── __tests__/
│   ├── unit/           # Pure function tests
│   ├── integration/    # Hook + context tests
│   └── e2e/            # Playwright tests
├── components/
│   └── [component]/
│       ├── component.tsx
│       ├── component.stories.tsx    # Already exists
│       └── component.test.tsx       # Co-located unit tests
└── vitest.config.ts

packages/api/
├── src/
│   └── routers/
│       ├── order.ts
│       └── order.test.ts            # Co-located procedure tests
└── vitest.config.ts

packages/db/
├── src/
│   └── __tests__/
│       └── queries.test.ts          # Database integration tests
└── vitest.config.ts
```

---

## Layer 1: Unit Tests (Vitest)

**Target execution time: < 5 seconds**

### What to Test

| Category       | Examples                                     | Priority |
| -------------- | -------------------------------------------- | -------- |
| Pure functions | Price calculations, formatters, validators   | High     |
| Zod schemas    | Input validation, error messages             | High     |
| Custom hooks   | `useOrderCart`, `useActiveOrg` (mocked deps) | High     |
| UI components  | Render, props, events (no network)           | Medium   |

### Configuration

```typescript
// apps/web/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['**/*.e2e.test.ts', '**/e2e/**'],
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      exclude: ['**/*.stories.tsx', '**/*.test.ts'],
    },
  },
})
```

```typescript
// apps/web/vitest.setup.ts
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))
```

### Example: Hook Unit Test

```typescript
// apps/web/hooks/use-order-cart.test.tsx
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useOrderCart } from './use-order-cart'

// Mock tRPC
vi.mock('@/lib/trpc', () => ({
  trpc: {
    order: {
      addItem: { useMutation: () => ({ mutateAsync: vi.fn() }) },
      removeItem: { useMutation: () => ({ mutateAsync: vi.fn() }) },
      updateQuantity: { useMutation: () => ({ mutateAsync: vi.fn() }) },
    },
  },
}))

describe('useOrderCart', () => {
  it('calculates total correctly', () => {
    const { result } = renderHook(() =>
      useOrderCart({
        items: [
          { id: '1', quantity: 2, priceAtAdd: 10 },
          { id: '2', quantity: 1, priceAtAdd: 25 },
        ],
      }),
    )

    expect(result.current.total).toBe(45)
  })

  it('groups items by supplier', () => {
    const { result } = renderHook(() =>
      useOrderCart({
        items: [
          { id: '1', supplierId: 'sup-1', name: 'Apples' },
          { id: '2', supplierId: 'sup-1', name: 'Oranges' },
          { id: '3', supplierId: 'sup-2', name: 'Milk' },
        ],
      }),
    )

    expect(Object.keys(result.current.itemsBySupplier)).toHaveLength(2)
  })
})
```

### Example: Component Unit Test

```typescript
// apps/web/components/order/order-item-card.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { OrderItemCard } from './order-item-card'

describe('OrderItemCard', () => {
  const defaultProps = {
    item: {
      id: '1',
      product: { name: 'Organic Apples', unit: 'kg' },
      quantity: 5,
      priceAtAdd: 3.50,
    },
    onQuantityChange: vi.fn(),
    onRemove: vi.fn(),
  }

  it('displays product name and quantity', () => {
    render(<OrderItemCard {...defaultProps} />)

    expect(screen.getByText('Organic Apples')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
  })

  it('calls onQuantityChange when quantity is updated', async () => {
    render(<OrderItemCard {...defaultProps} />)

    const input = screen.getByRole('spinbutton')
    await fireEvent.change(input, { target: { value: '10' } })

    expect(defaultProps.onQuantityChange).toHaveBeenCalledWith('1', 10)
  })

  it('calls onRemove when remove button is clicked', async () => {
    render(<OrderItemCard {...defaultProps} />)

    await fireEvent.click(screen.getByRole('button', { name: /remove/i }))

    expect(defaultProps.onRemove).toHaveBeenCalledWith('1')
  })
})
```

---

## Layer 2: Integration Tests (Vitest)

**Target execution time: < 10 seconds**

### What to Test

| Category         | Examples                         | Priority |
| ---------------- | -------------------------------- | -------- |
| tRPC procedures  | `order.create`, `order.addItem`  | Critical |
| Database queries | Complex joins, constraints       | High     |
| Auth middleware  | `protectedProcedure` enforcement | High     |
| Business logic   | Order status transitions         | High     |

### tRPC Procedure Tests

Test procedures with a real database connection but mocked auth context. Use a test database with transactions that rollback after each test.

```typescript
// packages/api/src/routers/order.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createCaller } from '../trpc'
import { db } from '@plexaris/db'
import {
  order,
  orderItem,
  user,
  organization,
  membership,
} from '@plexaris/db/schema'

describe('order router', () => {
  let testUser: typeof user.$inferSelect
  let testOrg: typeof organization.$inferSelect
  let caller: ReturnType<typeof createCaller>

  beforeEach(async () => {
    // Create test fixtures
    ;[testUser] = await db
      .insert(user)
      .values({
        id: 'test-user-1',
        email: 'test@example.com',
        name: 'Test User',
      })
      .returning()
    ;[testOrg] = await db
      .insert(organization)
      .values({
        id: 'test-org-1',
        name: 'Test Restaurant',
        type: 'horeca',
      })
      .returning()

    await db.insert(membership).values({
      userId: testUser.id,
      organizationId: testOrg.id,
      role: 'owner',
    })

    // Create authenticated caller
    caller = createCaller({
      session: { userId: testUser.id },
      db,
    })
  })

  afterEach(async () => {
    // Clean up in reverse dependency order
    await db.delete(orderItem)
    await db.delete(order)
    await db.delete(membership)
    await db.delete(organization)
    await db.delete(user)
  })

  describe('create', () => {
    it('creates a draft order for the organization', async () => {
      const result = await caller.order.create({
        organizationId: testOrg.id,
      })

      expect(result.status).toBe('draft')
      expect(result.organizationId).toBe(testOrg.id)
    })

    it('rejects creation for non-member organizations', async () => {
      const [otherOrg] = await db
        .insert(organization)
        .values({
          id: 'other-org',
          name: 'Other Org',
          type: 'horeca',
        })
        .returning()

      await expect(
        caller.order.create({ organizationId: otherOrg.id }),
      ).rejects.toThrow('Not authorized')

      await db.delete(organization).where(eq(organization.id, otherOrg.id))
    })
  })

  describe('addItem', () => {
    it('adds item to draft order', async () => {
      const newOrder = await caller.order.create({ organizationId: testOrg.id })

      const result = await caller.order.addItem({
        orderId: newOrder.id,
        productId: 'product-1',
        supplierId: 'supplier-1',
        quantity: 5,
      })

      expect(result.items).toHaveLength(1)
      expect(result.items[0].quantity).toBe(5)
    })

    it('rejects adding items to submitted orders', async () => {
      const newOrder = await caller.order.create({ organizationId: testOrg.id })
      await db
        .update(order)
        .set({ status: 'submitted' })
        .where(eq(order.id, newOrder.id))

      await expect(
        caller.order.addItem({
          orderId: newOrder.id,
          productId: 'product-1',
          supplierId: 'supplier-1',
          quantity: 5,
        }),
      ).rejects.toThrow('Cannot modify submitted order')
    })
  })
})
```

### Database Query Tests

```typescript
// packages/db/src/__tests__/order-queries.test.ts
import { describe, it, expect } from 'vitest'
import { db } from '../client'
import { getOrderWithItems, getOrdersByOrganization } from '../queries/order'

describe('order queries', () => {
  it('getOrderWithItems returns items grouped by supplier', async () => {
    const result = await getOrderWithItems('existing-order-id')

    expect(result).toHaveProperty('items')
    expect(result).toHaveProperty('itemsBySupplier')
  })

  it('getOrdersByOrganization excludes archived orders by default', async () => {
    const results = await getOrdersByOrganization('org-id')

    expect(results.every((o) => o.archivedAt === null)).toBe(true)
  })

  it('getOrdersByOrganization includes archived when flag is set', async () => {
    const results = await getOrdersByOrganization('org-id', {
      includeArchived: true,
    })

    expect(results.some((o) => o.archivedAt !== null)).toBe(true)
  })
})
```

---

## Layer 3: E2E Tests (Playwright)

**Target execution time: < 30 seconds (parallelized)**

### Philosophy

E2E tests are expensive. Only test flows where:

1. **Failure = revenue loss** (checkout, order submission)
2. **Multiple systems interact** (auth → navigation → API → database)
3. **User trust is critical** (data integrity, security)

### Critical User Journeys (Priority Order)

| Journey                             | Why Critical                | Est. Time |
| ----------------------------------- | --------------------------- | --------- |
| 1. Sign up → Onboarding → Dashboard | First-time user experience  | ~8s       |
| 2. Login → Create Order → Add Items | Core value proposition      | ~10s      |
| 3. Submit Order → View Confirmation | Revenue-generating action   | ~6s       |
| 4. Organization Switching           | Multi-tenant data isolation | ~5s       |
| 5. Invite Member → Accept Invite    | Team growth flow            | ~8s       |

### Configuration

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './__tests__/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: process.env.CI ? 'github' : 'html',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Auth setup runs first, creates authenticated state
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  // Don't start dev server - it's already running per project rules
  webServer: undefined,
})
```

### Authentication Setup (Run Once)

```typescript
// apps/web/__tests__/e2e/auth.setup.ts
import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '../.auth/user.json')

setup('authenticate', async ({ page }) => {
  // Create test user via API or use seeded user
  await page.goto('/login')
  await page.getByLabel('Email').fill('e2e-test@plexaris.local')
  await page.getByLabel('Password').fill('test-password-123')
  await page.getByRole('button', { name: 'Sign in' }).click()

  // Wait for redirect to dashboard
  await expect(page).toHaveURL(/\/dashboard/)

  // Save authentication state
  await page.context().storageState({ path: authFile })
})
```

### Example: Order Creation E2E

```typescript
// apps/web/__tests__/e2e/order-creation.test.ts
import { test, expect } from '@playwright/test'

test.describe('order creation', () => {
  test.use({ storageState: './__tests__/.auth/user.json' })

  test('creates order and adds items', async ({ page }) => {
    // Navigate to orders
    await page.goto('/dashboard')
    await page.getByRole('link', { name: /orders/i }).click()

    // Create new order
    await page.getByRole('button', { name: /new order/i }).click()
    await expect(page).toHaveURL(/\/order\/[a-z0-9-]+/)

    // Search for product
    await page.getByPlaceholder(/search/i).fill('apples')
    await page.waitForTimeout(300) // Debounce

    // Add first result to cart
    const productCard = page.getByTestId('product-card').first()
    await productCard.getByRole('button', { name: /add/i }).click()

    // Verify item in cart
    const cart = page.getByTestId('order-cart')
    await expect(cart.getByText('apples')).toBeVisible()

    // Update quantity
    await cart.getByRole('spinbutton').fill('10')
    await expect(cart.getByRole('spinbutton')).toHaveValue('10')
  })

  test('submits order successfully', async ({ page }) => {
    // Assume order exists with items (seeded or created in beforeEach)
    await page.goto('/order/test-order-with-items')

    await page.getByRole('button', { name: /submit order/i }).click()

    // Confirm dialog
    await page.getByRole('button', { name: /confirm/i }).click()

    // Verify success state
    await expect(page.getByText(/order submitted/i)).toBeVisible()
    await expect(
      page.getByRole('button', { name: /submit order/i }),
    ).toBeDisabled()
  })
})
```

### Example: Authentication E2E

```typescript
// apps/web/__tests__/e2e/auth.test.ts
import { test, expect } from '@playwright/test'

test.describe('authentication', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('signup flow creates account and redirects to onboarding', async ({
    page,
  }) => {
    const uniqueEmail = `test-${Date.now()}@plexaris.local`

    await page.goto('/signup')
    await page.getByLabel('Name').fill('Test User')
    await page.getByLabel('Email').fill(uniqueEmail)
    await page.getByLabel('Password').fill('secure-password-123')
    await page.getByRole('button', { name: /sign up/i }).click()

    // Should redirect to onboarding
    await expect(page).toHaveURL(/\/onboarding/)

    // Complete onboarding
    await page.getByRole('button', { name: /restaurant/i }).click()
    await page.getByRole('button', { name: /next/i }).click()
    await page.getByLabel('Organization name').fill('Test Restaurant')
    await page.getByRole('button', { name: /create/i }).click()

    // Should land on org page
    await expect(page).toHaveURL(/\/orgs\/[a-z0-9-]+/)
  })

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('Email').fill('wrong@example.com')
    await page.getByLabel('Password').fill('wrong-password')
    await page.getByRole('button', { name: /sign in/i }).click()

    await expect(page.getByText(/invalid/i)).toBeVisible()
  })
})
```

### Data Seeding Strategy

For fast, reliable E2E tests, seed the database with known state before each test run:

```typescript
// apps/web/__tests__/e2e/fixtures/seed.ts
import { db } from '@plexaris/db'
import {
  user,
  organization,
  membership,
  product,
  order,
  orderItem,
} from '@plexaris/db/schema'

export async function seedE2EData() {
  // Clean previous test data
  await db.delete(orderItem).where(like(orderItem.id, 'e2e-%'))
  await db.delete(order).where(like(order.id, 'e2e-%'))
  await db.delete(product).where(like(product.id, 'e2e-%'))
  await db.delete(membership).where(like(membership.userId, 'e2e-%'))
  await db.delete(organization).where(like(organization.id, 'e2e-%'))
  await db.delete(user).where(like(user.id, 'e2e-%'))

  // Create test user
  const [testUser] = await db
    .insert(user)
    .values({
      id: 'e2e-user-1',
      email: 'e2e-test@plexaris.local',
      name: 'E2E Test User',
      // Password hash for 'test-password-123'
      passwordHash: '$2a$10$...',
    })
    .returning()

  // Create organizations
  const [horecaOrg] = await db
    .insert(organization)
    .values({
      id: 'e2e-horeca-1',
      name: 'E2E Test Restaurant',
      type: 'horeca',
    })
    .returning()

  const [supplierOrg] = await db
    .insert(organization)
    .values({
      id: 'e2e-supplier-1',
      name: 'E2E Test Supplier',
      type: 'supplier',
    })
    .returning()

  // Create memberships
  await db.insert(membership).values([
    { userId: testUser.id, organizationId: horecaOrg.id, role: 'owner' },
    { userId: testUser.id, organizationId: supplierOrg.id, role: 'member' },
  ])

  // Create products
  await db.insert(product).values([
    {
      id: 'e2e-product-1',
      name: 'Organic Apples',
      organizationId: supplierOrg.id,
      price: 3.5,
      unit: 'kg',
      category: 'produce',
    },
    {
      id: 'e2e-product-2',
      name: 'Fresh Milk',
      organizationId: supplierOrg.id,
      price: 2.0,
      unit: 'liter',
      category: 'dairy',
    },
  ])

  // Create order with items
  const [testOrder] = await db
    .insert(order)
    .values({
      id: 'e2e-order-with-items',
      organizationId: horecaOrg.id,
      status: 'draft',
    })
    .returning()

  await db.insert(orderItem).values({
    id: 'e2e-item-1',
    orderId: testOrder.id,
    productId: 'e2e-product-1',
    supplierId: supplierOrg.id,
    quantity: 5,
    priceAtAdd: 3.5,
    unit: 'kg',
  })

  return { testUser, horecaOrg, supplierOrg, testOrder }
}
```

---

## CI Pipeline

### Optimized GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/plexaris_test

jobs:
  unit:
    name: Unit Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun run test:unit
        timeout-minutes: 2

  integration:
    name: Integration Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: plexaris_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun --cwd packages/db db:migrate
      - run: bun run test:integration
        timeout-minutes: 3

  e2e:
    name: E2E Tests
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: plexaris_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
      - run: bun install --frozen-lockfile
      - run: bun --cwd packages/db db:migrate
      - run: bunx playwright install chromium --with-deps

      # Seed test data
      - run: bun run test:e2e:seed

      # Start app in background
      - run: bun run dev &
        env:
          NODE_ENV: test
      - run: bunx wait-on http://localhost:3000 --timeout 30000

      # Run E2E tests
      - run: bun run test:e2e
        timeout-minutes: 5

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web/playwright-report/
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "turbo run test",
    "test:unit": "turbo run test:unit",
    "test:integration": "turbo run test:integration",
    "test:e2e": "playwright test --project=chromium",
    "test:e2e:seed": "bun run apps/web/__tests__/e2e/fixtures/seed.ts",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

Per-package scripts:

```json
// apps/web/package.json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest --exclude '**/*.e2e.test.ts'",
    "test:coverage": "vitest --coverage"
  }
}

// packages/api/package.json
{
  "scripts": {
    "test": "vitest",
    "test:integration": "vitest"
  }
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)

1. **Configure Vitest** in `apps/web` and `packages/api`
2. **Add test utilities**: Testing Library, MSW for mocking
3. **Write first unit tests**:
   - `useOrderCart` hook
   - `OrderItemCard` component
   - Zod validation schemas

### Phase 2: Integration Coverage (Week 2)

1. **Set up test database**: Docker Compose for local, GitHub Actions service for CI
2. **Write tRPC procedure tests**:
   - `order.create`
   - `order.addItem`
   - `order.removeItem`
   - `order.updateQuantity`
3. **Auth middleware tests**: Verify `protectedProcedure` enforcement

### Phase 3: E2E Critical Paths (Week 3)

1. **Configure Playwright**
2. **Implement auth setup**
3. **Create data seeding scripts**
4. **Write E2E tests**:
   - Signup → Onboarding flow
   - Login → Order creation
   - Order submission

### Phase 4: CI Integration (Week 4)

1. **GitHub Actions workflow**
2. **Parallel test execution**
3. **Failure artifacts** (screenshots, traces)
4. **Coverage reporting**

---

## Performance Targets

| Metric                    | Target | Measurement                          |
| ------------------------- | ------ | ------------------------------------ |
| Unit test suite           | < 5s   | `time bun run test:unit`             |
| Integration test suite    | < 10s  | `time bun run test:integration`      |
| E2E test suite (parallel) | < 30s  | `time bun run test:e2e`              |
| Full CI pipeline          | < 3min | GitHub Actions duration              |
| Test flakiness rate       | < 1%   | CI failure rate without code changes |

---

## Anti-Patterns to Avoid

1. **Testing implementation details** — Test behavior, not internal state
2. **Over-mocking** — If you mock everything, you test nothing
3. **E2E for everything** — Use E2E only for critical user journeys
4. **Shared mutable state** — Each test must be independent
5. **Sleep-based waits** — Use explicit waits (`waitFor`, `expect.poll`)
6. **Ignoring flaky tests** — Fix or delete, never skip indefinitely

---

## Quick Reference

```bash
# Run all tests
bun run test

# Run unit tests only (fast feedback)
bun run test:unit

# Run integration tests (needs database)
bun run test:integration

# Run E2E tests (needs running dev server)
bun run test:e2e

# Run E2E with UI mode (debugging)
bun run test:e2e:ui

# Run specific test file
bunx vitest apps/web/components/order/order-item-card.test.tsx

# Run tests matching pattern
bunx vitest --filter "order"

# Watch mode for TDD
bunx vitest --watch
```
