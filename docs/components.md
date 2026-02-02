# Plexaris - shadcn/ui Components

## Layout & Navigation

| Component           | Usage                                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| **Navigation Menu** | Main top navigation bar for all roles                                    |
| **Breadcrumb**      | Page hierarchy in supplier dashboard, admin, settings                    |
| **Sidebar**         | Admin dashboard, supplier dashboard side navigation                      |
| **Separator**       | Section dividers throughout the app                                      |
| **Scroll Area**     | Chat message list, long product lists, order details                     |
| **Collapsible**     | Cart items grouped by supplier, mobile nav sections                      |
| **Tabs**            | Settings pages (profile/org/members), admin views, order detail sections |
| **Resizable**       | AI chat panel alongside search results                                   |

## Forms & Input

| Component       | Usage                                                                       |
| --------------- | --------------------------------------------------------------------------- |
| **Form**        | Registration, login, product creation, org creation, checkout, profile edit |
| **Input**       | Email, password, names, addresses, prices, search bar                       |
| **Textarea**    | Product descriptions, company descriptions, chat message input              |
| **Label**       | All form fields                                                             |
| **Select**      | Org type picker, product category, unit type (kg/piece/box), filters        |
| **Radio Group** | Org type selection (Supplier/Horeca), delivery options                      |
| **Checkbox**    | Filter checkboxes in search, terms acceptance, bulk select in admin         |
| **Switch**      | Toggle product visibility, notification preferences                         |
| **Slider**      | Price range filter in product search                                        |
| **Input OTP**   | Email verification code                                                     |

## Data Display

| Component        | Usage                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Table**        | Order history, admin account lists, product lists, member lists, audit log                                                          |
| **Card**         | Product cards in search results, AI chat product cards, dashboard widgets, supplier profile cards                                   |
| **Badge**        | Order status (pending/paid/processing/delivered), org type (Supplier/Horeca), role (owner/member), claim status (claimed/unclaimed) |
| **Avatar**       | User avatar in nav, supplier logos, org switcher                                                                                    |
| **Aspect Ratio** | Product images, supplier logos                                                                                                      |
| **Carousel**     | Multiple product images on detail view                                                                                              |
| **Skeleton**     | Loading states for product cards, search results, dashboard widgets, chat messages                                                  |
| **Progress**     | Image upload progress, claim flow steps                                                                                             |
| **Pagination**   | Order history, admin account lists, product lists                                                                                   |

## Feedback & Overlays

| Component          | Usage                                                                                     |
| ------------------ | ----------------------------------------------------------------------------------------- |
| **Sonner** (toast) | Success/error notifications: item added to cart, order placed, profile saved, invite sent |
| **Alert**          | Form validation errors, payment failures, price change warnings on reorder                |
| **Alert Dialog**   | Destructive confirmations: archive account, archive org, archive product, leave org       |
| **Dialog**         | Invite member modal, edit quantity modal, product quick-view                              |
| **Sheet**          | Cart slide-out panel, mobile navigation, filters panel on mobile                          |
| **Tooltip**        | Icon buttons, truncated text, info hints                                                  |
| **Popover**        | Org switcher dropdown, date filter, user menu                                             |
| **Hover Card**     | Supplier name hover preview in search results                                             |

## Actions

| Component         | Usage                                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------- |
| **Button**        | All CTAs: Add to Cart, Checkout, Save, Login, Register, Reorder, Claim Profile, Send Invite |
| **Dropdown Menu** | Org switcher, product actions (edit/archive), order actions, admin account actions          |
| **Toggle**        | View mode switch (grid/list) for product catalog                                            |
| **Toggle Group**  | Category filter tabs in product search                                                      |
| **Command**       | Global search / command palette (Cmd+K) for quick product and supplier search               |
| **Context Menu**  | Right-click actions on product rows in supplier dashboard                                   |

## Date & Time

| Component       | Usage                                                 |
| --------------- | ----------------------------------------------------- |
| **Calendar**    | Order history date filter, delivery date selection    |
| **Date Picker** | Filter orders by date range in admin and horeca views |

## Charts (shadcn/ui charts)

| Component      | Usage                                               |
| -------------- | --------------------------------------------------- |
| **Bar Chart**  | Admin dashboard: orders per day/week, GMV over time |
| **Line Chart** | Supplier dashboard: sales trends                    |
| **Pie Chart**  | Order breakdown by supplier or category             |

## Installation

```bash
npx shadcn@latest init
npx shadcn@latest add \
  accordion alert alert-dialog aspect-ratio avatar \
  badge breadcrumb button calendar card carousel \
  chart checkbox collapsible command context-menu \
  date-picker dialog dropdown-menu form hover-card \
  input input-otp label navigation-menu pagination \
  popover progress radio-group resizable \
  scroll-area select separator sheet sidebar skeleton \
  slider sonner switch table tabs textarea toggle \
  toggle-group tooltip
```
