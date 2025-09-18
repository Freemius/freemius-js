import { LicenseEntity, UserPluginEntity } from '../api/types';

export interface LicenseEventDataMap {
    /**
     * Event triggered when a new license is created
     */
    'license.created': {
        objects: {
            license: LicenseEntity;
            /**
             * Will be populated only if the user was associated with the license at creation time, for example using the Freemius Checkout.
             */
            user?: UserPluginEntity;
        };
        data: {
            /** License expiration date in YYYY-MM-DD HH:mm:ss format */
            expiration: string;
            /** Unique identifier for the license */
            license_id: string;
        };
    };
    /**
     * Event triggered when a license is extended. Only applicable for licenses that have an expiration date.
     */
    'license.extended': {
        objects: { license: LicenseEntity; user?: UserPluginEntity };
        data: {
            /** Original expiration date in YYYY-MM-DD HH:mm:ss format */
            from: string;
            /** New expiration date in YYYY-MM-DD HH:mm:ss format */
            to: string;
            /** Unique identifier for the license */
            license_id: string;
            /** Determines if the license was renewed due to the renewal of the associated subscription */
            is_renewal?: boolean;
        };
    };
    'license.shortened': {
        objects: { license: LicenseEntity; user?: UserPluginEntity };
        data: {
            /** Original expiration date in YYYY-MM-DD HH:mm:ss format */
            from: string;
            /** New expiration date in YYYY-MM-DD HH:mm:ss format */
            to: string;
            /** Unique identifier for the license */
            license_id: string;
        };
    };
    /**
     * This event will be triggered only when the plan is changed manually from the Developer Dashboard.
     *
     * This will also be accompanied by the `license.updated` event.
     */
    'license.plan.changed': {
        objects: { license: LicenseEntity; user?: UserPluginEntity };
        data: {
            /** ID of the plan before change */
            from_plan_id: string;
            /** ID of the plan after change */
            to_plan_id: string;
            /** ID of the pricing before change */
            from_pricing_id: string;
            /** ID of the pricing after change */
            to_pricing_id: string;
            /** ID of the license being changed */
            license_id: string;
        };
    };
    'license.updated': {
        objects: {
            license: LicenseEntity;
            /**
             * Will be populated only if the user did something that updated the license.
             * If you have updated the license manually from the Developer Dashboard or through the API, this will be undefined.
             */
            user?: UserPluginEntity;
        };
    };
    'license.expired': {
        objects: {
            license: LicenseEntity;
            /**
             * Will be populated only if the user did something that updated the license.
             * If you have updated the license manually from the Developer Dashboard or through the API, this will be undefined.
             */
            user?: UserPluginEntity;
        };
        data: {
            /** Unique identifier for the license */
            license_id: string;
        };
    };
    'license.cancelled': {
        objects: {
            license: LicenseEntity;
            user?: UserPluginEntity;
        };
        data: {
            /** Unique identifier for the license */
            license_id: string;
        };
    };
    'license.deleted': {
        objects: {
            /**
             * The value is always false, indicating that the license has been deleted.
             */
            license: false;
        };
        data: {
            /** Unique identifier for the license */
            license_id: string;
        };
    };
}
