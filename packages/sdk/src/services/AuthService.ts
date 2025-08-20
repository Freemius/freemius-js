import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { FSId } from '../api/types';
import { idToString } from '../api/parser';

export interface TokenPayload {
    expiresAt: number;
    nonce: string;
}

export class AuthService {
    private static readonly TOKEN_SEPARATOR = '::';
    private static readonly DEFAULT_EXPIRY_MINUTES = 60; // 1 hour default

    constructor(
        private readonly productId: FSId,
        private readonly secretKey: string
    ) {
        if (!secretKey || secretKey.length < 32) {
            throw new Error('Secret key must be at least 32 characters long');
        }
    }

    /**
     * Creates a secure token for a specific action that can be performed by a user.
     *
     * @param action The action identifier (e.g., 'download_invoice', 'update_billing')
     * @param userId The ID of the user who can perform this action
     * @param expiryMinutes Optional expiry time in minutes (default: 60 minutes)
     * @returns A secure token string
     */
    createActionToken(
        action: string,
        userId: FSId,
        expiryMinutes: number = AuthService.DEFAULT_EXPIRY_MINUTES
    ): string {
        if (!action || action.trim().length === 0) {
            throw new Error('Action cannot be empty');
        }

        const now = Date.now();
        const expiresAt = now + expiryMinutes * 60 * 1000;
        const nonce = randomBytes(16).toString('hex');

        // Create the minimal payload
        const payload = this.encodeTokenPayload({ expiresAt, nonce });

        // Create signature based on all the data
        const signature = this.signData(action.trim(), userId, expiresAt, nonce);

        return `${payload}${AuthService.TOKEN_SEPARATOR}${signature}`;
    }

    /**
     * Verifies and validates an action token.
     *
     * @param token The token to verify
     * @param action The expected action
     * @param userId The expected user ID
     * @returns true if valid, false otherwise
     */
    verifyActionToken(token: string, action: string, userId: FSId): boolean {
        try {
            if (!token || typeof token !== 'string' || !action || !userId) {
                return false;
            }

            const parts = token.split(AuthService.TOKEN_SEPARATOR);
            if (parts.length !== 2) {
                return false;
            }

            const [payloadPart, signature] = parts;

            if (!payloadPart || !signature) {
                return false;
            }

            // Decode the payload
            const payload = this.decodeTokenPayload(payloadPart);
            if (!payload) {
                return false;
            }

            // Check expiry
            const now = Date.now();
            if (payload.expiresAt <= now) {
                return false;
            }

            // Verify signature by recreating it with the provided action and userId
            const expectedSignature = this.signData(action.trim(), userId, payload.expiresAt, payload.nonce);

            return this.constantTimeEqual(signature, expectedSignature);
        } catch {
            return false;
        }
    }

    private encodeTokenPayload(payload: TokenPayload): string {
        const jsonString = JSON.stringify(payload);
        return Buffer.from(jsonString).toString('base64url');
    }

    private decodeTokenPayload(payloadPart: string): TokenPayload | null {
        try {
            const jsonString = Buffer.from(payloadPart, 'base64url').toString('utf8');
            const data = JSON.parse(jsonString);

            // Validate required fields
            if (typeof data.expiresAt !== 'number' || !data.nonce) {
                return null;
            }

            return data as TokenPayload;
        } catch {
            return null;
        }
    }

    private signData(action: string, userId: FSId, expiresAt: number, nonce: string): string {
        const data = `${action}:${idToString(userId)}:${idToString(this.productId)}:${expiresAt}:${nonce}`;

        return createHmac('sha256', this.secretKey).update(data).digest('hex');
    }

    private constantTimeEqual(a: string, b: string): boolean {
        if (a.length !== b.length) {
            return false;
        }

        try {
            return timingSafeEqual(Buffer.from(a), Buffer.from(b));
        } catch {
            return false;
        }
    }
}
