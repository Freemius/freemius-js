/**
 * Copyright (c) 2025 Freemius Inc.
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

export default {
    useTabs: false,
    tabWidth: 4,
    printWidth: 120,
    semi: true,
    singleQuote: true,
    trailingComma: 'es5',
    bracketSpacing: true,
    proseWrap: 'always',
    overrides: [
        {
            files: '*.json',
            options: {
                tabWidth: 2,
            },
        },
        {
            files: '*.{yaml,yml}',
            options: {
                tabWidth: 2,
            },
        },
    ],
};
