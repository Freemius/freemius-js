# AI Coding Agent Instructions

## Project Overview

This is a TypeScript monorepo providing a **Freemius Node.js SDK** and **SaaS Starter Kit** for building
subscription-based SaaS applications. The architecture follows a service-oriented pattern with dependency injection,
webhook-driven license management, and authenticated customer portal actions.

## Architecture Patterns

### Service Layer Architecture

- **Main entry point**: `packages/sdk/src/Freemius.ts` - Acts as the service container, injecting dependencies between
  services
- **Service pattern**: Each service (`ApiService`, `CheckoutService`, `CustomerPortalService`, etc.) is injected with
  required dependencies in the constructor
- **Action pattern**: Customer portal uses action classes (`InvoiceAction`, `BillingAction`) that implement the
  `PortalAction` interface for token-based authentication

### Error Handling Convention

Use `ActionError` class (not `Response.json`) for customer portal actions:

```typescript
// Good
throw ActionError.validationFailed('Invalid request', zodError.issues);
throw ActionError.badRequest('Missing parameter: userId');

// Bad
return Response.json({ error: 'Invalid request' }, { status: 400 });
```

### Minimalist Code Philosophy

**Write only what executes** - Avoid creating library-like abstractions hoping they'll be useful later. The goal is a
compact toolset for monetizing products with Freemius, not a comprehensive framework.

**ActionError Example**: Originally had complex error codes, field mappings, and multiple factory methods. Refactored to
only:

- Error message
- HTTP status code
- Validation issues (for Zod errors)
- Essential factory methods actually used in the codebase

```typescript
// Good: Simple, focused on actual needs
static validationFailed(message: string, validationIssues: unknown): ActionError

// Removed: Unused complexity
static invalidContentType(expected: string = 'application/json'): ActionError
```

### Authentication Pattern

- **Webhook signature verification**: Use `WebhookListener.verifySignature(rawBody, signature)` with HMAC-SHA256
- **Action tokens**: Use `AuthService.createActionToken()` and `verifyActionToken()` for time-limited, cryptographically
  signed tokens
- **Token format**: `payload::signature` where payload is base64-encoded and signature is HMAC-SHA256

## Critical Development Workflows

### Building & Development

```bash
# SDK development with watch mode
npm run dev:sdk

# Build all packages
npm run build

# SaaS Kit development
npm run dev:saas-kit

# Generate OpenAPI types (when Freemius API changes)
npm run openapi:generate --workspace=@freemius/sdk
```

### Release Management

```bash
# Create changeset after making changes
npx changeset

# Apply version bumps
npx changeset version

# Build and publish
npm run release
```

### SaaS Kit Registry (Shadcn Components)

The SaaS Kit uses a custom shadcn registry system:

```bash
# Build registry (automatically extracts dependencies)
npm run build --workspace=@freemius/saas-kit
```

- Registry build script: `packages/saas-kit/registry/build.ts`
- Extracts `@/components/ui/*` dependencies automatically
- Outputs to `packages/saas-kit/registry.json`

## Key Integration Points

### Webhook Event Handling

```typescript
// Standard pattern in packages/saas-kit/src/app/webhook/route.ts
const listener = freemius.webhook.createListener();

listener.on('license.created', async ({ objects: { license } }) => {
    await syncLicenseFromWebhook(license);
});

export async function POST(request: Request) {
    return await freemius.webhook.processFetch(listener, request);
}
```

### Database Integration (Prisma + Better Auth)

- **Schema**: `packages/saas-kit/prisma/schema.prisma`
- **Generated client**: `packages/saas-kit/generated/prisma/`
- **Auth setup**: `packages/saas-kit/src/lib/auth.ts` using `betterAuth()` with Prisma adapter
- **Database calls**: Always use the prisma instance from `packages/saas-kit/src/lib/prisma.ts`

### Customer Portal Actions

When implementing new portal actions:

1. Create action class implementing `PortalAction` interface
2. Add to `CustomerPortalService.action` object
3. Use `AuthService.createActionToken()` for URL generation
4. Implement `verifyAuthentication()`, `canHandle()`, and `processAction()`
5. Use Zod for request validation
6. Throw `ActionError` for error responses

## Project-Specific Conventions

### Minimalist Development Approach

**Core Philosophy**: Write minimal code that directly serves the goal of helping developers monetize their products with
Freemius. Avoid over-engineering or creating unused abstractions.

**Guidelines**:

- Only implement features that are actively used
- Remove code that doesn't execute in real scenarios
- Prefer simple, direct solutions over flexible frameworks
- Refactor to eliminate unused complexity when discovered

**Example**: The ActionError class was simplified from having error codes, field mappings, and many factory methods to
just the essential properties (message, statusCode, validationIssues) and methods actually used in portal actions.

### File Organization

- **SDK**: `packages/sdk/src/` - Core SDK functionality
- **Services**: `packages/sdk/src/services/` - Business logic services
- **API**: `packages/sdk/src/api/` - Generated OpenAPI types and parsers
- **SaaS Kit**: `packages/saas-kit/src/` - Next.js application
- **Registry**: `packages/saas-kit/registry/saas-kit/` - Shadcn components for registry

### Import Conventions

```typescript
// SaaS Kit imports
import { freemius } from '@/lib/freemius'; // SDK instance
import { prisma } from '@/lib/prisma'; // Database
import { auth } from '@/lib/auth'; // Authentication

// SDK imports
export * from './contracts/purchase'; // Always re-export contracts
export type { ApiService } from './services/ApiService'; // Export service types
```

### Validation Pattern

Always use Zod for request validation in portal actions:

```typescript
const schema = zod.object({
    userId: zod.string().min(1, 'User ID is required'),
    // ... other fields
});

const parseResult = schema.safeParse(requestData);
if (!parseResult.success) {
    throw ActionError.validationFailed('Validation failed', parseResult.error.issues);
}
```

### Environment Configuration

- **SDK**: Requires `FS__PRODUCT_ID`, `FS__API_KEY`, `FS__SECRET_KEY`, `FS__PUBLIC_KEY`
- **SaaS Kit**: Additional `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` for Prisma and Better Auth
- **Webhook**: Uses `secretKey` for signature verification

## Testing & Debugging

### Manual Testing

- **SDK examples**: `packages/sdk/src/__tests__/manual/` - Contains working examples for checkout, webhooks
- **Sandbox mode**: Use `.inSandbox()` for checkout and testing workflows

### Common Debugging

- **Webhook issues**: Check signature verification with raw body (not parsed JSON)
- **Action token issues**: Verify token hasn't expired and action/userId match exactly
- **Prisma issues**: Ensure generated client is up-to-date after schema changes

## External Dependencies

- **OpenAPI types**: Auto-generated from Freemius API - regenerate when API changes
- **@freemius/checkout**: Frontend checkout component (peer dependency)
- **Shadcn UI**: Component system for SaaS Kit
- **Better Auth**: Authentication system with Prisma adapter
- **tsdown**: Build tool for SDK (dual ESM/CJS output)
