import * as fs from 'fs';
import * as path from 'path';
import { Registry, RegistryItem } from 'shadcn/registry';

const dirToTypeMap: Record<string, RegistryItem['type']> = {
    components: 'registry:component',
    hooks: 'registry:hook',
    icons: 'registry:lib',
    utils: 'registry:lib',
};

const REGISTRY_BASE_PATH = path.join(__dirname, 'saas-kit');
const OUTPUT_PATH = path.join(__dirname, '..', 'registry.json');
const TARGET_DIRECTORY_NAME = 'react-starter';

function getAllFiles(dir: string): string[] {
    const files: string[] = [];

    if (!fs.existsSync(dir)) {
        return files;
    }

    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            files.push(...getAllFiles(fullPath));
        } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
            files.push(fullPath);
        }
    }

    return files;
}

function validateImports(filePath: string): void {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const relativePath = path.relative(REGISTRY_BASE_PATH, filePath);

        // Check for imports that go outside the saas-kit directory (../../)
        // but are not from @/components
        const invalidImportRegex = /from\s+['"]\.\.\/\.\./g;
        const componentImportRegex = /from\s+['"]@\/components/g;

        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Skip if this line imports from @/components (allowed)
            if (componentImportRegex.test(line)) {
                continue;
            }

            // Check for ../../ imports
            if (invalidImportRegex.test(line)) {
                throw new Error(
                    `Invalid import found in ${relativePath} at line ${i + 1}:\n` +
                        `  ${line.trim()}\n` +
                        `Registry components should not import from outside the saas-kit directory ` +
                        `unless they are @/components imports.`
                );
            }
        }
    } catch (error) {
        if (error instanceof Error && error.message.includes('Invalid import found')) {
            throw error;
        }
        console.warn(`Warning: Could not validate imports in ${filePath}:`, error);
    }
}

function extractRegistryDependencies(filePath: string): string[] {
    const dependencies: string[] = [];

    try {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Match imports from @/components/ui/*
        const uiImportRegex = /from\s+['"]@\/components\/ui\/([^'"]+)['"]/g;
        let match;

        while ((match = uiImportRegex.exec(content)) !== null) {
            const componentName = match[1];
            dependencies.push(componentName);
        }

        // Also match: import { Component } from "@/components/ui/component"
        const namedImportRegex = /import\s*\{[^}]*\}\s*from\s*['"]@\/components\/ui\/([^'"]+)['"]/g;
        while ((match = namedImportRegex.exec(content)) !== null) {
            const componentName = match[1];
            if (!dependencies.includes(componentName)) {
                dependencies.push(componentName);
            }
        }
    } catch (error) {
        console.warn(`Warning: Could not read file ${filePath} for dependency extraction:`, error);
    }

    return dependencies;
}

function createRegistryFile(
    filePath: string,
    type: RegistryItem['type']
): {
    file: NonNullable<RegistryItem['files']>[number];
    dependencies: string[];
} {
    // Validate imports before processing the file
    validateImports(filePath);

    const relativePath = path.relative(REGISTRY_BASE_PATH, filePath);
    const dependencies = extractRegistryDependencies(filePath);

    return {
        file: {
            path: `registry/saas-kit/${relativePath}`,
            target: `${TARGET_DIRECTORY_NAME}/${relativePath}`,
            type,
        },
        dependencies,
    };
}

function buildRegistry(): void {
    const files: RegistryItem['files'] = [];
    const allRegistryDependencies = new Set<string>();

    try {
        console.log('Validating imports and building registry...');

        // Iterate through each directory type
        for (const [dirName, itemType] of Object.entries(dirToTypeMap)) {
            const dirPath = path.join(REGISTRY_BASE_PATH, dirName);
            const sourceFiles = getAllFiles(dirPath);

            for (const filePath of sourceFiles) {
                const { file, dependencies } = createRegistryFile(filePath, itemType);
                files.push(file);

                // Add dependencies to the set
                dependencies.forEach((dep) => allRegistryDependencies.add(dep));
            }
        }

        const registry: Registry = {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            $schema: 'https://ui.shadcn.com/schema/registry.json',
            homepage: 'https://shadcn.freemius.com',
            name: 'freemius-react-starter-kit',
            items: [
                {
                    name: 'all',
                    author: 'Freemius Inc',
                    type: 'registry:ui',
                    description: 'All components, hooks, icons, and utilities for Freemius React Starter Kit',
                    dependencies: ['@freemius/checkout', '@freemius/sdk'],
                    registryDependencies: Array.from(allRegistryDependencies).sort(),
                    files,
                },
            ],
        };

        // Write the registry to file
        fs.writeFileSync(OUTPUT_PATH, JSON.stringify(registry, null, 2));
        console.log(`Registry built successfully! Generated ${files.length} items.`);
        console.log(
            `Found ${allRegistryDependencies.size} registry dependencies: ${Array.from(allRegistryDependencies).join(', ')}`
        );
        console.log(`Output written to: ${OUTPUT_PATH}`);
    } catch (error) {
        console.error('Registry build failed:', error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

// Run the build if this script is executed directly
if (require.main === module) {
    buildRegistry();
}
