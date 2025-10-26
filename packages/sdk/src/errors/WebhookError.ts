import { WebhookListenerResponse } from '../contracts/webhook';

export class WebhookError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number = 400) {
        super(message);
        this.name = 'WebhookError';
        this.statusCode = statusCode;
    }

    toResponse(): WebhookListenerResponse {
        return {
            status: this.statusCode,
            success: false,
            error: this.message,
        };
    }
}
