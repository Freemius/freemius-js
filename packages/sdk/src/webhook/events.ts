import { EventEntity } from '../api/types';
import { LicenseEventDataMap } from './license.events';
import { SubscriptionEventDataMap } from './subscription.events';

/**
 * We unify all event data maps into a single map for easier reference.
 */
export interface WebhookEventDataMap extends LicenseEventDataMap, SubscriptionEventDataMap {}

/**
 * All possible webhook event types. For example `'license.created'`, `subscription.created`, etc.
 */
export type WebhookEventType = keyof WebhookEventDataMap;

/**
 * The structure of a webhook event received from Freemius.
 *
 * The `data` and `objects` properties are dynamically typed based on the event type.
 *
 * @template T The type of the webhook event.
 */
export type WebhookEvent<T extends WebhookEventType = WebhookEventType> = {
    id: string;
    type: T;
    created: string; // ISO 8601
    updated: string | null; // ISO 8601
    state: NonNullable<EventEntity['state']>;
} & WebhookEventDataMap[T];

/**
 * A handler function for a specific webhook event type.
 */
export type WebhookEventHandler<T extends WebhookEventType> = (event: WebhookEvent<T>) => Promise<void>;
