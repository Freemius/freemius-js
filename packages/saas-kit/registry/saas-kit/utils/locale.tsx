import * as React from 'react';
import { PaymentMethod, PortalPayment, SellingUnit } from '@freemius/sdk';
import { useContext, createContext } from 'react';

export const defaultLocale = {
    portal: {
        primary: {
            title: () => <>Current Subscription</>,
            inactiveBadge: () => <>INACTIVE</>,
            planTitle: (planTitle: string) => <>{planTitle} Plan</>,
            renewal: {
                amount: (formattedAmount: string, period: string) => (
                    <>
                        {formattedAmount} per {period}
                    </>
                ),
                active: (nextDate: string) => <>Your subscription renews on {nextDate}.</>,
                inactive: (cancelledAt: string) => <>The subscription was cancelled on {cancelledAt}.</>,
                updatePaymentMethodBefore: (nextDate: string) => (
                    <>
                        Reactivate before <strong>{nextDate}</strong> to avoid service interruption.
                    </>
                ),
            },
        },
        action: {
            reactivate: () => <>Reactivate subscription</>,
            cancel: () => <>Cancel subscription</>,
            update: () => <>Update subscription</>,
            amount: (formattedAmount: string, period: string) => (
                <>
                    {formattedAmount} / {period}
                </>
            ),
            amountFrom: (formattedAmount: string, period: string) => (
                <>
                    From {formattedAmount} / {period}
                </>
            ),
            pricingTitle: (formattedLicenses: string, count: number, sellingUnit: SellingUnit) => {
                const unit = count === 1 ? sellingUnit.singular : sellingUnit.plural;

                return (
                    <>
                        {formattedLicenses} {unit}
                    </>
                );
            },
            current: () => <>Current subscription</>,
        },
        payment: {
            info: (method: PaymentMethod) => {
                return <>Billed automatically with {method === 'paypal' ? 'PayPal' : 'Card'}</>;
            },
            update: () => <>Update payment method</>,
        },
        billing: {
            title: () => <>Billing Information</>,
            label: {
                name: () => <>Name</>,
                email: () => <>Email</>,
                businessName: () => <>Business Name</>,
                businessEmail: () => <>Business Email</>,
                address: () => <>Address</>,
                tax: () => <>Tax / VAT ID / GST</>,
                account: () => <>Account</>,
                phone: () => <>Phone</>,
            },
            action: {
                update: () => <>Update information</>,
                cancel: () => <>Cancel</>,
                save: () => <>Save</>,
            },
        },
        payments: {
            title: () => <>Payments</>,
            pricingTitle: (formattedLicenses: string, count: number, sellingUnit: SellingUnit) => {
                const unit = count === 1 ? sellingUnit.singular : sellingUnit.plural;

                return (
                    <>
                        {formattedLicenses} {unit?.toLocaleLowerCase()}
                    </>
                );
            },
            action: {
                downloadInvoice: () => <>Invoice</>,
            },
            type: {
                oneoff: () => 'One-off purchase',
                first: () => 'Subscription',
                renewal: () => 'Renewal',
            },
        },
        error: {
            fetchingData: () => <>Error fetching billing data</>,
        },
        empty: {
            message: {
                restore: () => (
                    <>
                        In case you have already purchased and do not see it here, please click the button below to try
                        and restore your purchase.
                    </>
                ),
            },
        },
        subscribe: {
            title: () => <>Please subscribe to use our product</>,
            message: () => (
                <>It looks like you don&apos;t have any active susbcription with us. Please purchase one from below.</>
            ),
        },
        cancelSubscription: {
            title: {
                confirm: () => <>Well, that&apos;s a bummer</>,
                coupon: (discountLabel: React.ReactNode) => <>Wait, how about {discountLabel} off?</>,
                reason: () => <>Why are you cancelling?</>,
            },
            message: {
                trial: {
                    paragraphs: (daysLeft: number | null, isFree: boolean | null) => [
                        <>Cancelling the trial will immediately block access to all premium features. Are you sure?</>,
                        isFree ? (
                            <>
                                If you aren&apos;t sure, keep enjoying the paid features for another {daysLeft}{' '}
                                {daysLeft !== 1 ? 'days' : 'day'} and we&apos;ll email you once the trial has expired
                                (don&apos;t worry, you won&apos;t be charged).
                            </>
                        ) : (
                            <>
                                If you aren&apos;t sure, you can choose to have a reminder sent 2 days prior to the
                                trial expiration date.
                            </>
                        ),
                    ],
                },
                regular: {
                    paragraphs: (daysLeft: number | null) => [
                        <>
                            Your product subscription will be cancelled after {daysLeft}{' '}
                            {daysLeft !== 1 ? 'days' : 'day'}. Keep enjoying it until then.
                        </>,
                        // eslint-disable-next-line react/jsx-key
                        <span className="bg-destructive text-primary-foreground p-4 rounded-md block">
                            Please note that we will not be able to grandfather outdated pricing for renewals/new
                            subscriptions after a cancellation. If you choose to renew the subscription manually in the
                            future, after a price increase, which typically occurs once a year, you will be charged the
                            updated price.
                        </span>,
                        <>If you aren&apos;t sure, you can choose to have a reminder sent prior to the renewal date.</>,
                    ],
                },
                coupon: {
                    off: () => <>off</>,
                    paragraphs: (hasRenewals: boolean, discountLabel: React.ReactNode) => [
                        <>
                            We&apos;d hate to see you go, especially if it&apos;s a matter of price! Keep your
                            subscription active and get a special {discountLabel} discount off your{' '}
                            {hasRenewals ? 'renewals' : 'next renewal'}
                        </>,
                    ],
                },
                reason: {
                    paragraphs: () => [<>We hate to see you go, but before you do, let us know where we went wrong.</>],
                    form: {
                        reason: () => <>Select all that apply</>,
                        feedback: () => <>Additional feedback (optional)</>,
                        feedbackPlaceholder: () => `Your feedback...`,
                    },
                },
            },
            action: {
                cancel: () => <>Cancel renewals</>,
                remindMe: () => <>Remind me later</>,
                back: () => <>Go back</>,
                couponCancel: () => <>Continue to cancel</>,
                confirmCancel: (hasTrial: boolean) => <>Send &amp; Cancel {hasTrial ? 'trial' : 'renewals'}</>,
            },
            alert: {
                subscriptionCancelled: () => 'Subscription successfully canceled.',
                couponApplied: () => 'Promo successfully applied!',
            },
        },
    },
    refreshPurchase: {
        action: {
            restore: () => <>Restore Purchase</>,
            restoring: () => <>Restoring...</>,
        },
        alert: {
            restored: (count: number) =>
                `Successfully restored ${count} purchase${count > 1 ? 's' : ''}. The page will reload now.`,
            nothingToRestore: () => 'No purchases were found to restore.',
        },
    },
    paymentBadge: (type: PortalPayment['type']) => {
        switch (type) {
            case 'chargeback':
                return <>Chargeback</>;
            case 'disputed':
                return <>Disputed</>;
            case 'lost_dispute':
                return <>Dispute Won</>;
            case 'won_dispute':
                return <>Dispute Lost</>;
            case 'refund':
                return <>Refund</>;
            default:
            case 'payment':
                return <>Paid</>;
        }
    },
    billingCycle: (cycle: string) => {
        switch (cycle) {
            case 'monthly':
                return 'Month';
            case 'yearly':
                return 'Year';
            default:
                return 'N/A';
        }
    },
    checkout: {
        processing: () => <>Processing your purchase...</>,
    },
    pricing: {
        from: () => <>from</>,
        billingSeparator: () => <>/</>,
        monthly: () => <>month</>,
        paidTrial: () => <>Trial</>,
        freeTrial: () => <>Free Trial</>,
        action: {
            upgrade: () => <>Upgrade</>,
            trial: () => <>Start Trial</>,
            cancel: () => <>Maybe later</>,
            purchase: () => <>Purchase</>,
        },
        topupUnitPrice: (unitPrice: string, sellingUnit: SellingUnit) => (
            <>
                at {unitPrice} / {sellingUnit.singular!.toLowerCase()}
            </>
        ),
        error: {
            fetchingData: () => <>Error fetching pricing data</>,
            noPlans: () => <>No plans available</>,
            noTopupPlan: () => <>No top-up plan available</>,
        },
    },
    paywall: {
        noActivePurchase: {
            title: () => <>You need to upgrade</>,
            message: () => (
                <>
                    You need to have an active subscription to use this feature. Please choose a plan below to upgrade
                    your account.
                </>
            ),
        },
        insufficientCredits: {
            title: () => <>Insufficient Credits</>,
            message: () => (
                <>
                    You do not have enough credits to perform this action. Please purchase more credits by choosing a
                    plan below.
                </>
            ),
        },
        portalNavigation: (navLink: React.ReactNode) => (
            <>
                If you&apos;ve purchased already yet don&apos;t see it reflected please visit the billing section from
                where you can restore the purchase: {navLink}
            </>
        ),
    },
    code: 'en-US',
} as const;

export type LocaleType = typeof defaultLocale;

const LocaleContext = createContext<LocaleType>(defaultLocale);

export function useLocale() {
    return useContext(LocaleContext);
}

export function LocaleProvider({ children, text }: { children: React.ReactNode; text?: Partial<LocaleType> }) {
    const value = React.useMemo(() => ({ ...defaultLocale, ...text }) as LocaleType, [text]);

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
