import { ApiEntitiesFilter } from '../contracts/types';
import { components, operations } from './schema';

export type ApiAuthParams = {
    date: string;
    authorization: string;
};

export type FSId = string | number | bigint;

export type SubscriptionEntity = components['schemas']['Subscription'];
export type SubscriptionFilterOptions = ApiEntitiesFilter<operations['subscriptions/list']['parameters']['query']>;

export type UserEntity = components['schemas']['User'];
export type UserFilterOptions = ApiEntitiesFilter<operations['users/list']['parameters']['query']>;
export type UserBillingEntity = components['schemas']['Billing'];
export type UserSubscriptionFilterOptions = ApiEntitiesFilter<
    operations['users/list-subscriptions']['parameters']['query']
>;
export type UserLicenseFilterOptions = ApiEntitiesFilter<operations['users/list-licenses']['parameters']['query']>;
export type UserPaymentFilterOptions = ApiEntitiesFilter<operations['users/list-payments']['parameters']['query']>;
export type UserPluginEntity = components['schemas']['UserPluginEnriched'];

export type LicenseEntity = components['schemas']['License'];
export type LicenseFilterOptions = ApiEntitiesFilter<operations['licenses/list']['parameters']['query']>;

export type PaymentEntity = components['schemas']['Payment'];
export type PaymentFilterOptions = ApiEntitiesFilter<operations['payments/list']['parameters']['query']>;

export type ProductEntity = components['schemas']['Plugin'];

export type PricingTableData =
    operations['products/retrieve-pricing-table-data']['responses'][200]['content']['application/json'];
export type PricingEntity = components['schemas']['Pricing'];

export type BillingEntity = components['schemas']['Billing'];

export type EventEntity = components['schemas']['EventLog'];

export type InstallEntity = components['schemas']['Install'];

export type BillingCycleApiEnum = components['schemas']['CommonEnums']['BillingCycle'];
export type CurrencyApiEnum = components['schemas']['CommonEnums']['Currency'];
