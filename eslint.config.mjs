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
            'examples/nextjs-app/generated/**/*',
            'examples/nextjs-app/.next/**/*',
            'examples/nextjs-app/src/components/ai-elements/**/*',
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
    // Next.js specific configuration for examples/nextjs-app
    {
        files: ['examples/nextjs-app/**/*.{js,jsx,ts,tsx}'],
        plugins: {
            '@next/next': nextPlugin,
        },
        rules: {
            ...nextPlugin.configs.recommended.rules,
            ...nextPlugin.configs['core-web-vitals'].rules,
        },
        settings: {
            next: {
                rootDir: 'examples/nextjs-app/',
            },
        },
    }
);
