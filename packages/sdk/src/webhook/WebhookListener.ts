import crypto from 'crypto';
import { WebhookEventHandler, WebhookEventType, WebhookEvent } from './events';
import { EventEntity } from '../api/types';

export interface NormalizedRequest {
    headers: Record<string, string | string[] | undefined> | Headers;
    rawBody: string | Buffer; // MUST be the exact raw body Freemius sent
}

export type WebhookListenerResponse = {
    status: number;
} & ({ success: true } | { success: false; error: string });

const SIGNATURE_HEADER = 'x-signature';

// @todo - Add a method `onAny` to listen to all events with a single handler
export class WebhookListener {
    private eventHandlers: Map<WebhookEventType, Set<WebhookEventHandler<WebhookEventType>>> = new Map();

    constructor(
        private readonly secretKey: string,
        private readonly onError: (error: unknown) => void = console.error
    ) {}

    // Overload for single event type
    on<T extends WebhookEventType>(type: T, handler: WebhookEventHandler<T>): this;
    // Overload for array of event types
    on<T extends WebhookEventType>(types: T[], handler: WebhookEventHandler<T>): this;
    // Implementation
    on<T extends WebhookEventType>(typeOrTypes: T | T[], handler: WebhookEventHandler<T>): this {
        const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];

        for (const type of types) {
            if (!this.eventHandlers.has(type)) {
                this.eventHandlers.set(type, new Set());
            }

            const existingHandlers = this.eventHandlers.get(type)!;
            existingHandlers?.add(handler as WebhookEventHandler<WebhookEventType>);
        }

        return this;
    }

    // Overload for single event type
    off<T extends WebhookEventType>(type: T, handler: WebhookEventHandler<T>): this;
    // Overload for array of event types
    off<T extends WebhookEventType>(types: T[], handler: WebhookEventHandler<T>): this;
    // Implementation
    off<T extends WebhookEventType>(typeOrTypes: T | T[], handler: WebhookEventHandler<T>): this {
        const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];

        for (const type of types) {
            const currentHandlers = this.eventHandlers.get(type);
            if (!currentHandlers) {
                continue;
            }

            // Set.delete() returns true if the element was in the set
            currentHandlers.delete(handler as WebhookEventHandler<WebhookEventType>);

            // Remove the entire entry if no handlers remain
            if (currentHandlers.size === 0) {
                this.eventHandlers.delete(type);
            }
        }

        return this;
    }

    // Remove all handlers for specific event type(s)
    removeAll<T extends WebhookEventType>(typeOrTypes: T | T[]): this {
        const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes];

        for (const type of types) {
            this.eventHandlers.delete(type);
        }

        return this;
    }

    // Get handler count for debugging
    getHandlerCount<T extends WebhookEventType>(type: T): number {
        return this.eventHandlers.get(type)?.size ?? 0;
    }

    // Get total number of event types with handlers
    getEventTypeCount(): number {
        return this.eventHandlers.size;
    }

    // Get all registered event types
    getRegisteredEventTypes(): WebhookEventType[] {
        return Array.from(this.eventHandlers.keys());
    }

    // Check if a specific event type has any handlers
    hasHandlers<T extends WebhookEventType>(type: T): boolean {
        const handlers = this.eventHandlers.get(type);
        return handlers !== undefined && handlers.size > 0;
    }

    // Check if a specific handler is registered for an event type
    hasHandler<T extends WebhookEventType>(type: T, handler: WebhookEventHandler<T>): boolean {
        const handlers = this.eventHandlers.get(type);
        return handlers ? handlers.has(handler as WebhookEventHandler<WebhookEventType>) : false;
    }

    // Get all handlers for a specific event type (useful for debugging)
    getHandlers<T extends WebhookEventType>(type: T): Set<WebhookEventHandler<WebhookEventType>> {
        return this.eventHandlers.get(type) || new Set();
    }

    // Get total count of all handlers across all event types
    getTotalHandlerCount(): number {
        let total = 0;
        for (const handlers of this.eventHandlers.values()) {
            total += handlers.size;
        }
        return total;
    }

    /**
     * Verify hex HMAC signature against the raw body.
     */
    verifySignature(rawBody: string | Buffer, signature: string | null): boolean {
        if (!signature) {
            return false;
        }

        const mac = crypto.createHmac('sha256', this.secretKey).update(rawBody).digest('hex');

        try {
            return crypto.timingSafeEqual(Buffer.from(mac, 'hex'), Buffer.from(signature, 'hex'));
        } catch {
            return false;
        }
    }

    /**
     * Process a normalized request.
     * Returns an object you can map to your framework's response easily.
     */
    async process(input: NormalizedRequest): Promise<WebhookListenerResponse> {
        const sig = this.getHeader(SIGNATURE_HEADER, input.headers);

        if (!this.verifySignature(input.rawBody, sig)) {
            return { status: 401, success: false, error: 'Invalid signature' };
        }

        let evt: EventEntity;
        try {
            const parsed = JSON.parse(
                typeof input.rawBody === 'string' ? input.rawBody : input.rawBody.toString('utf8')
            );

            if (!parsed || typeof parsed.type !== 'string') {
                return { status: 400, success: false, error: 'Invalid payload' };
            }

            evt = parsed as EventEntity;
        } catch {
            return { status: 400, success: false, error: 'Malformed JSON' };
        }

        const eventType = evt.type as WebhookEventType;
        const eventHandlers = this.eventHandlers.get(eventType);

        if (!eventHandlers || eventHandlers.size === 0) {
            // Optionally log unhandled events
            console.warn(`No handlers registered for event type: ${eventType}`);
        }

        try {
            // Execute handlers with proper type casting
            const promises = Array.from(eventHandlers || []).map((handler) => {
                const typedHandler = handler as WebhookEventHandler<typeof eventType>;
                const typedEvent = evt as WebhookEvent<typeof eventType>;
                return typedHandler(typedEvent);
            });

            // Execute handlers in parallel for better performance
            await Promise.all(promises);
        } catch (error) {
            this.onError?.(error as Error);
            return { status: 500, success: false, error: 'Internal Server Error' };
        }

        return { status: 200, success: true };
    }

    private getHeader(name: string, headers: NormalizedRequest['headers']): string | null {
        const lname = name.toLowerCase();

        if (headers instanceof Headers) {
            return headers.get(lname);
        }

        const v = headers[lname] ?? headers[name];

        if (Array.isArray(v)) {
            return v[0] ?? null;
        }

        return (v as string | undefined) ?? null;
    }
}
