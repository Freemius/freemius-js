# Release Guide

This monorepo uses [Changesets](https://github.com/changesets/changesets) for version management and publishing.

## Workflow

### 1. Making Changes

When you make changes that should trigger a version bump:

```bash
# After making your changes, create a changeset
npx changeset
```

This will prompt you to:

- Select which packages have changed
- Choose the type of change (patch, minor, major)
- Write a summary of the changes

### 2. Building Packages

```bash
# Build all packages
npm run build

# Build specific package
npm run build:sdk
npm run build:saas-kit

# Build SDK in watch mode during development
npm run dev:sdk
```

### 3. Version Bumping

```bash
# Apply all pending changesets and update versions
npx changeset version
```

This will:

- Update package.json versions
- Update CHANGELOG.md files
- Remove consumed changeset files

### 4. Publishing

```bash
# Build and publish to npm
npm run release
```

### 5. Development Scripts

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

### SaaS Kit (@freemius/saas-kit)

```bash
# Build registry
npm run build --workspace=@freemius/saas-kit

# Development
npm run dev --workspace=@freemius/saas-kit
```

## Example Workflow

1. Make changes to the SDK
2. Run `npx changeset` and select SDK with appropriate version bump
3. Run `npm run build:sdk` to ensure it builds
4. Commit your changes including the changeset file
5. When ready to release: `npx changeset version` then `npm run release`
