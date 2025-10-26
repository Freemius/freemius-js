// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    react.configs.flat.recommended,
    reactHooks.configs['recommended-latest'],
    eslintConfigPrettier,
    {
        ignores: [
            'packages/sdk/api/schema.d.ts',
            'packages/**/dist/**/*',
            'packages/saas-kit/generated/**/*',
            'packages/saas-kit/.next/**/*',
            'packages/saas-kit/src/components/ai-elements/**/*',
            'packages/saas-kit/next-env.d.ts',
        ],
    },
    // React settings for auto-detection
    {
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off', // Next.js has automatic JSX runtime
        },
    },
    // Next.js specific configuration for packages/saas-kit
    {
        files: ['packages/saas-kit/**/*.{js,jsx,ts,tsx}'],
        plugins: {
            '@next/next': nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
        },
        settings: {
            next: {
                rootDir: 'packages/saas-kit/',
            },
        },
    },
    // Turn on react in scope for the saas starter kit
    {
        files: ['packages/saas-kit/registry/**/*.{js,jsx,ts,tsx}'],
        rules: {
            'react/react-in-jsx-scope': 'error',
        },
    }
);
