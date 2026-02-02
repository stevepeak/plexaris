# Plexaris - Page Map

```mermaid
graph TD
    subgraph Public
        LAND[Landing Page]
        LOGIN[Login]
        REG[Register]
        VERIFY[Email Verification]
        FORGOT[Forgot Password]
        RESET[Reset Password]
        CLAIM[Supplier Claim /claim/:token]
        INVITE[Accept Invitation /invite/:token]
        SUP_PUB[Supplier Public Profile]
    end

    subgraph Onboarding
        ORG_CREATE[Create Organization]
        ORG_TYPE[Select Org Type: Supplier / Horeca]
        ORG_FORM_H[Horeca Org Details Form]
        ORG_FORM_S[Supplier Org Details Form]
    end

    subgraph Horeca
        H_DASH[Horeca Dashboard]
        H_SEARCH[Product Search & Browse]
        H_SUPPLIER[Supplier Profile View]
        H_CHAT[AI Chat & Voice Interface]
        H_CART[Cart]
        H_CHECKOUT[Checkout]
        H_PAY_OK[Payment Success]
        H_PAY_FAIL[Payment Failed]
        H_ORDERS[Order History]
        H_ORDER[Order Detail]
    end

    subgraph Supplier
        S_DASH[Supplier Dashboard]
        S_PRODUCTS[Product List]
        S_PRODUCT_NEW[Add Product]
        S_PRODUCT_EDIT[Edit Product]
        S_PROFILE[Edit Supplier Profile]
    end

    subgraph Settings["Settings (shared layout)"]
        SET_PROFILE[User Profile Settings]
        SET_ORG[Organization Settings]
        SET_MEMBERS[Members & Invitations]
    end

    subgraph Admin
        A_DASH[Admin Dashboard]
        A_HORECA[Horeca Accounts List]
        A_SUPPLIERS[Supplier Accounts List]
        A_ACCOUNT[Account Detail]
        A_ORDERS[Order Management]
        A_AUDIT[Audit Log]
    end

    subgraph Errors
        E_404[404 Not Found]
        E_500[Server Error]
    end

    %% Public flows
    LAND -->|Sign Up| REG
    LAND -->|Log In| LOGIN
    REG --> VERIFY
    VERIFY --> ORG_CREATE
    LOGIN -->|No orgs| ORG_CREATE
    LOGIN -->|Has orgs| H_DASH
    LOGIN -->|Has orgs| S_DASH
    FORGOT --> RESET
    RESET --> LOGIN
    CLAIM -->|New user| REG
    CLAIM -->|Existing user| LOGIN
    CLAIM -->|Authenticated| S_DASH
    INVITE -->|New user| REG
    INVITE -->|Existing user| LOGIN

    %% Onboarding flow
    ORG_CREATE --> ORG_TYPE
    ORG_TYPE -->|Horeca| ORG_FORM_H
    ORG_TYPE -->|Supplier| ORG_FORM_S
    ORG_FORM_H --> H_DASH
    ORG_FORM_S --> S_DASH

    %% Horeca flows
    H_DASH --> H_SEARCH
    H_DASH --> H_CHAT
    H_DASH --> H_ORDERS
    H_DASH --> H_CART
    H_SEARCH --> H_SUPPLIER
    H_SEARCH --> H_CART
    H_SUPPLIER --> H_CART
    H_CHAT --> H_CART
    H_CART --> H_CHECKOUT
    H_CHECKOUT --> H_PAY_OK
    H_CHECKOUT --> H_PAY_FAIL
    H_PAY_OK --> H_ORDERS
    H_PAY_FAIL --> H_CHECKOUT
    H_ORDERS --> H_ORDER
    H_ORDER -->|Reorder| H_CART

    %% Supplier flows
    S_DASH --> S_PRODUCTS
    S_DASH --> S_PROFILE
    S_PRODUCTS --> S_PRODUCT_NEW
    S_PRODUCTS --> S_PRODUCT_EDIT

    %% Settings accessible from any authenticated page
    H_DASH -.-> SET_PROFILE
    S_DASH -.-> SET_PROFILE
    SET_PROFILE -.-> SET_ORG
    SET_ORG -.-> SET_MEMBERS

    %% Admin flows
    A_DASH --> A_HORECA
    A_DASH --> A_SUPPLIERS
    A_DASH --> A_ORDERS
    A_DASH --> A_AUDIT
    A_HORECA --> A_ACCOUNT
    A_SUPPLIERS --> A_ACCOUNT
```

## Page Index

| #   | Page                    | Route                         | Role         | Source Doc |
| --- | ----------------------- | ----------------------------- | ------------ | ---------- |
| 1   | Landing                 | `/`                           | Public       | 00         |
| 2   | Login                   | `/login`                      | Public       | 01         |
| 3   | Register                | `/register`                   | Public       | 01         |
| 4   | Email Verification      | `/verify-email`               | Public       | 01         |
| 5   | Forgot Password         | `/forgot-password`            | Public       | 01         |
| 6   | Reset Password          | `/reset-password/:token`      | Public       | 01         |
| 7   | Supplier Claim          | `/claim/:token`               | Public       | 03         |
| 8   | Accept Invitation       | `/invite/:token`              | Public       | 01         |
| 9   | Supplier Public Profile | `/suppliers/:slug`            | Public       | 03         |
| 10  | Create Organization     | `/onboarding`                 | Auth         | 01         |
| 11  | Select Org Type         | `/onboarding/type`            | Auth         | 01         |
| 12  | Horeca Org Form         | `/onboarding/horeca`          | Auth         | 01         |
| 13  | Supplier Org Form       | `/onboarding/supplier`        | Auth         | 01         |
| 14  | Horeca Dashboard        | `/dashboard`                  | Horeca       | 07         |
| 15  | Product Search          | `/search`                     | Horeca       | 04         |
| 16  | Supplier Profile View   | `/suppliers/:slug`            | Horeca       | 03, 04     |
| 17  | AI Chat                 | `/chat`                       | Horeca       | 05         |
| 18  | Cart                    | `/cart`                       | Horeca       | 06         |
| 19  | Checkout                | `/checkout`                   | Horeca       | 06         |
| 20  | Payment Success         | `/checkout/success`           | Horeca       | 06         |
| 21  | Payment Failed          | `/checkout/failed`            | Horeca       | 06         |
| 22  | Order History           | `/orders`                     | Horeca       | 07         |
| 23  | Order Detail            | `/orders/:id`                 | Horeca       | 07         |
| 24  | Supplier Dashboard      | `/supplier/dashboard`         | Supplier     | 03, 04     |
| 25  | Product List            | `/supplier/products`          | Supplier     | 04         |
| 26  | Add Product             | `/supplier/products/new`      | Supplier     | 04         |
| 27  | Edit Product            | `/supplier/products/:id/edit` | Supplier     | 04         |
| 28  | Edit Supplier Profile   | `/supplier/profile`           | Supplier     | 03         |
| 29  | User Profile Settings   | `/settings/profile`           | Auth         | 01         |
| 30  | Organization Settings   | `/settings/organization`      | Auth         | 01         |
| 31  | Members & Invitations   | `/settings/members`           | Auth (owner) | 01         |
| 32  | Admin Dashboard         | `/admin`                      | Admin        | 08         |
| 33  | Horeca Accounts         | `/admin/horeca`               | Admin        | 08         |
| 34  | Supplier Accounts       | `/admin/suppliers`            | Admin        | 08         |
| 35  | Account Detail          | `/admin/accounts/:id`         | Admin        | 08         |
| 36  | Admin Order Management  | `/admin/orders`               | Admin        | 08         |
| 37  | Audit Log               | `/admin/audit-log`            | Admin        | 08         |
| 38  | 404 Not Found           | `*`                           | All          | --         |
| 39  | Server Error            | `/error`                      | All          | --         |
