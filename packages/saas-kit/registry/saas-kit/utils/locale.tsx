import { PaymentMethod, PortalPayment, SellingUnit } from '@freemius/sdk';
import { useContext, createContext } from 'react';

export const defaultLocale = {
    portal: {
        primary: {
            title: () => <>Current Subscription</>,
            planTitle: (planTitle: string) => <>{planTitle} Plan</>,
            renewal: {
                amount: (formattedAmount: string, period: string) => (
                    <>
                        {formattedAmount} per {period}
                    </>
                ),
                active: (nextDate: string) => <>Your subscription renews on {nextDate}.</>,
                inactive: (cancelledAt: string) => <>The subscription was cancelled on {cancelledAt}.</>,
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
    code: 'en-US',
} as const;

export type LocaleType = typeof defaultLocale;

const LocaleContext = createContext<LocaleType>(defaultLocale);

export function useLocale() {
    return useContext(LocaleContext);
}

export function LocaleProvider({ children, text }: { children: React.ReactNode; text?: Partial<LocaleType> }) {
    const value = { ...defaultLocale, ...text } as LocaleType;

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
