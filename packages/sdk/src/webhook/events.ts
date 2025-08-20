import { EventEntity } from '../api/types';
import { LicenseEventDataMap } from './license.events';
import { SubscriptionEventDataMap } from './subscription.events';

export interface EventDataMap extends LicenseEventDataMap, SubscriptionEventDataMap {}

// Extract event types automatically
export type FreemiusEventType = keyof EventDataMap;

// Create the complete event interface
export type FreemiusEvent<T extends FreemiusEventType = FreemiusEventType> = {
    id: string;
    type: T;
    created: string; // ISO 8601
    updated: string | null; // ISO 8601
    state: NonNullable<EventEntity['state']>;
} & EventDataMap[T];

// Event handler type with better inference
export type EventHandler<T extends FreemiusEventType> = (event: FreemiusEvent<T>) => Promise<void>;

// Event map for the listener (much simpler now)
export type EventMap = {
    [K in FreemiusEventType]: FreemiusEvent<K>;
};
