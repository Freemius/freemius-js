export function getAbsoluteLink(link: string): string | null {
    if (link.startsWith('http://') || link.startsWith('https://')) {
        return link;
    }

    if (typeof window === 'undefined') {
        return null; // Can't resolve relative URLs on the server
    }

    if (link.startsWith('/')) {
        // Absolute path, use the current origin
        return `${window.location.origin}${link}`;
    }

    // Relative path, use the current origin and pathname
    const pathname = window.location.pathname;
    const basePath = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    return `${window.location.origin}${basePath}${link}`;
}

export function getSanitizedUrl(link: string | null | undefined): URL | null {
    if (!link) {
        return null;
    }

    const sanitizedUrl = getAbsoluteLink(link);

    if (!sanitizedUrl) {
        return null;
    }

    try {
        return new URL(sanitizedUrl);
    } catch {
        return null;
    }
}
