import { InstallEntity, LicenseEntity, SubscriptionEntity, UserPluginEntity } from '../api/types';

export interface SubscriptionEventDataMap {
    'subscription.created': {
        objects: {
            user: UserPluginEntity;
            subscription: SubscriptionEntity;
            license: LicenseEntity;
            /**
             * This is the associated Install or activation entity. This is only applicable for App like products where the license key is actually activated using the Freemius API.
             * For SaaS products, this will be undefined.
             */
            install?: InstallEntity;
        };
        data: {
            /**
             * Unique identifier for the subscription
             */
            subscription_id: string;
            /**
             * Unique identifier for the license
             */
            license_id: string;
        };
    };
    'subscription.cancelled': {
        objects: {
            user: UserPluginEntity;
            subscription: SubscriptionEntity;
            license: LicenseEntity;
            /**
             * This is the associated Install or activation entity. This is only applicable for App like products where the license key is actually activated using the Freemius API.
             * For SaaS products, this will be undefined.
             */
            install?: InstallEntity;
        };
        data: {
            /**
             * Unique identifier for the subscription
             */
            subscription_id: string;
            /**
             * Unique identifier for the license
             */
            license_id: string;
            /**
             * Array of reason IDs for cancellation
             */
            reason_ids: string[];
            /**
             * Populated only if reason_ids contain the "other" option
             */
            reason: string;
        };
    };
    'subscription.renewal.failed': {
        objects: {
            user: UserPluginEntity;
            subscription: SubscriptionEntity;
            license: LicenseEntity;
            /**
             * This is the associated Install or activation entity. This is only applicable for App like products where the license key is actually activated using the Freemius API.
             * For SaaS products, this will be undefined.
             */
            install?: InstallEntity;
        };
    };
    'subscription.renewal.failed.last': {
        objects: {
            user: UserPluginEntity;
            subscription: SubscriptionEntity;
            license: LicenseEntity;
            /**
             * This is the associated Install or activation entity. This is only applicable for App like products where the license key is actually activated using the Freemius API.
             * For SaaS products, this will be undefined.
             */
            install?: InstallEntity;
        };
    };
}
