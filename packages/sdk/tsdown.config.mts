import { defineConfig, type UserConfig } from 'tsdown';

const config: UserConfig = defineConfig({
    entry: ['./src/index.ts'],
    platform: 'node',
    outDir: 'dist',
    format: ['esm', 'cjs'],
});

export default config;
