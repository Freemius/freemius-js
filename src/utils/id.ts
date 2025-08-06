export type FSId = string | number | bigint;

export function idToNumber(id: FSId): number {
    if (typeof id === 'number') {
        return id;
    } else if (typeof id === 'bigint') {
        return Number(id);
    } else if (typeof id === 'string') {
        const parsed = Number.parseInt(id, 10);

        if (Number.isNaN(parsed)) {
            throw new Error(`Invalid FSId: ${id}`);
        }

        return parsed;
    } else {
        throw new Error(`Unsupported FSId type: ${typeof id}`);
    }
}

export function idToString(id: FSId): string {
    if (typeof id === 'string') {
        return id;
    } else if (typeof id === 'number' || typeof id === 'bigint') {
        return String(id);
    } else {
        throw new Error(`Unsupported FSId type: ${typeof id}`);
    }
}
