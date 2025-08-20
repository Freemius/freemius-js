import { PortalData } from '@freemius/sdk';
import PrimarySubscription from './primary-subscription';
import CheckoutProvider from './checkout-provider';
import { BillingSection } from './billing-section';
import { PaymentsSection } from './payments-section';
import { CheckoutContext, PurchaseSyncSuccess } from '../hooks/checkout';
import { useContext } from 'react';

export default function CustomerPortal(props: { portalData: PortalData; afterPurchase?: PurchaseSyncSuccess }) {
    const { portalData: portalData, afterPurchase } = props;
    const hasCheckout = Boolean(useContext(CheckoutContext));

    const children = (
        <div className="fs-saas-starter-portal flex flex-col gap-16">
            {portalData.subscriptions.primary ? (
                <PrimarySubscription
                    subscription={portalData.subscriptions.primary}
                    plans={portalData.plans}
                    sellingUnit={portalData.sellingUnit}
                />
            ) : null}

            {portalData.billing ? <BillingSection billing={portalData.billing} user={portalData.user} /> : null}

            {portalData.payments && portalData.payments.length > 0 ? (
                <PaymentsSection payments={portalData.payments} unit={portalData.sellingUnit} />
            ) : null}
            {/* <pre>{JSON.stringify(portalData, null, 2)}</pre> */}
        </div>
    );

    return hasCheckout ? (
        children
    ) : (
        <CheckoutProvider options={portalData.checkoutOptions} onSuccess={afterPurchase}>
            {children}
        </CheckoutProvider>
    );
}
