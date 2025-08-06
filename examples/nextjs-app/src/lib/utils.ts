import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function splitName(name: string): { firstName: string; lastName: string } {
    const parts = name.split(' ');

    return {
        firstName: parts[0] ?? '',
        lastName: parts.slice(1).join(' ') ?? '',
    };
}
