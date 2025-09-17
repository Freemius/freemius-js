export function splitName(name: string): { firstName: string; lastName: string } {
    const parts = name.split(' ');

    return {
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' ') ?? '',
    };
}

export function isTestServer(): boolean {
    return process.env.FREEMIUS_INTERNAL__IS_DEVELOPMENT_MODE === 'true';
}
