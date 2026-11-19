import { ApiEntitiesFilter } from '../contracts/types';
import { components, operations } from './schema';

export type ApiAuthParams = {
    date: string;
    authorization: string;
};

export type FSId = string | number | bigint;

export type MigrationSource = NonNullable<components['schemas']['Migration']['source_external_id']>;
export const MigrationSource = {
    FREEMIUS: 'freemius',
    OTHER: 'others',
    EASY_DIGITAL_DOWNLOADS: 'edd',
    WOOCOMMERCE: 'woo',
    GUMROAD: 'gumroad',
    CODECANYON: 'cc',
    THEMEFOREST: 'tf',
    APPSUMO: 'appsumo',
    SENDOWL: 'sendowl',
    WHMCS: 'whmcs',
    LEMON_SQUEEZY: 'ls',
} as const satisfies Record<string, MigrationSource>;

export type SubscriptionEntity = components['schemas']['Subscription'];
export type SubscriptionFilterOptions = ApiEntitiesFilter<operations['subscriptions/list']['parameters']['query']>;
export type UserSubscriptionEntity = NonNullable<
    operations['users/list-subscriptions']['responses'][200]['content']['application/json']['subscriptions']
>[number];
export type SubscriptionDiscountEntity = NonNullable<
    operations['users/list-subscriptions']['responses'][200]['content']['application/json']['discounts']
>[string][number];
export type UserSubscriptionWithDiscounts = UserSubscriptionEntity & {
    discounts: SubscriptionDiscountEntity[];
};
export type SubscriptionCancellationResult =
    operations['subscriptions/cancel']['responses'][200]['content']['application/json'];
export type SubscriptionRenewalCouponResult =
    operations['subscriptions/update']['responses'][200]['content']['application/json'];

export type UserEntity = components['schemas']['User'];
export type UserMigrationPayload = Omit<
    operations['users/create']['requestBody']['content']['application/json'],
    'source' | 'is_migration'
>;
export type UserFilterOptions = ApiEntitiesFilter<operations['users/list']['parameters']['query']>;
export type UserBillingEntity = components['schemas']['Billing'];
export type UserSubscriptionFilterOptions = ApiEntitiesFilter<
    operations['users/list-subscriptions']['parameters']['query']
>;
export type UserLicenseFilterOptions = ApiEntitiesFilter<operations['users/list-licenses']['parameters']['query']>;
export type UserPaymentFilterOptions = ApiEntitiesFilter<operations['users/list-payments']['parameters']['query']>;
export type UserPluginEntity = components['schemas']['UserPluginEnriched'];
export type UserCustomerPortalResult =
    operations['products/generate-portal-login-link']['responses'][201]['content']['application/json'];

export type LicenseEntity = components['schemas']['License'];
export type LicenseMigrationPayload = Omit<
    operations['plans/create-license']['requestBody']['content']['application/json'],
    'source'
> & {
    plan_id: FSId;
    pricing_id: FSId;
};
export type LicenseMigrationResult =
    operations['plans/create-license']['responses'][201]['content']['application/json'];
export type LicenseFilterOptions = ApiEntitiesFilter<operations['licenses/list']['parameters']['query']>;
export type LicenseUpdatePayload = NonNullable<
    operations['licenses/update']['requestBody']
>['content']['application/json'];
export type LicenseCheckoutUpgradePayload = NonNullable<
    operations['licenses/generate-upgrade-link']['requestBody']
>['content']['application/json'];
export type LicenseCheckoutUpgradeResult =
    operations['licenses/generate-upgrade-link']['responses'][201]['content']['application/json'];

export type PaymentEntity = components['schemas']['Payment'];
export type PaymentFilterOptions = ApiEntitiesFilter<operations['payments/list']['parameters']['query']>;

export type ProductEntity = components['schemas']['Plugin'];

export type PricingTableData =
    operations['products/retrieve-pricing-table-data']['responses'][200]['content']['application/json'];
export type PricingEntity = components['schemas']['Pricing'];
export type PlanEntity = components['schemas']['Plan'];

export type BillingEntity = components['schemas']['Billing'];
export type BillingUpdatePayload =
    operations['users/update-or-create-billing']['requestBody']['content']['application/json'];

export type EventEntity = components['schemas']['EventLog'];
export type EventFilterOptions = ApiEntitiesFilter<operations['events/list']['parameters']['query']>;

export type InstallEntity = components['schemas']['Install'];

export type BillingCycleApiEnum = components['schemas']['CommonEnums']['BillingCycle'];
export type CurrencyApiEnum = components['schemas']['CommonEnums']['Currency'];

export type SellingUnit = Required<
    NonNullable<
        NonNullable<
            operations['products/retrieve-pricing-table-data']['responses']['200']['content']['application/json']['plugin']
        >['selling_unit_label']
    >
>;

export type CouponEntityEnriched = components['schemas']['CouponEntityEnriched'];

export type SubscriptionCancellationReasonType = components['schemas']['Uninstall']['reason_id'];
