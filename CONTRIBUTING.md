# Mono Repo Structure

The git repository is structured as a mono repo, using `npm` workspaces to manage multiple packages. This allows for
better organization and easier dependency management across the SDK and its related components.

Here are the primary packages in the mono repo:

| Package Name         | Location            | Description                                                                                                                                                                                    |
| -------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@freemius/sdk`      | `packages/sdk`      | The main SDK package that provides the core functionality for interacting with Freemius services.                                                                                              |
| `@freemius/saas-kit` | `packages/saas-kit` | A starter kit for building SaaS applications with Freemius integration. Currently is based on Shadcn UI and is only installable through `shadcn` CLI. We will make react library in the future |

We also have various example applications and utilities that demonstrate how to use the SDK effectively.

| Example Name | Location            | Description                                                                                                                                                                                                                                                                |
| ------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `nextjs-app` | `packages/saas-kit` | A simple SaaS application built in NextJS that demonstrates the basic usage of the SDK for any AI like app with credit system and subscription. We use the same package to develop the SaaS kit and the nextjs example for the time being. We might split it in the future |

The following dependencies are handled from the root `package.json`:

- ESLint - For linting the codebase.
- Prettier - For code formatting.
- TypeScript - For type checking and development.
- Husky - For managing Git hooks.
- Lint-staged - For running linters on staged files.

## Development Scripts

```bash
# Type checking
npm run typecheck

# Linting
npm run lint
npm run lint:fix

# Clean build artifacts
npm run clean
```

## Package-Specific Commands

### SDK (@freemius/sdk)

```bash
# Development with watch mode
npm run dev:sdk

# Generate OpenAPI types
npm run openapi:generate --workspace=@freemius/sdk
```

### SaaS Kit (shadcn)

```bash
# Build registry
npm run build --workspace=@freemius/saas-kit

# Development
npm run dev --workspace=@freemius/saas-kit
```
