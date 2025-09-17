/**
 * This route handles the Purchase actions and sync actions coming from the Freemius React Starter Kit.
 */
import { freemius } from '@/lib/freemius';
import { processPurchaseInfo, processRedirect } from '@/lib/user-entitlement';

const processor = freemius.checkout.request.createProcessor({
    onPurchase: processPurchaseInfo,
    proxyUrl: process.env.NEXT_PUBLIC_APP_URL!,
    onRedirect: processRedirect,
    afterProcessUrl: process.env.NEXT_PUBLIC_APP_URL! + '/billing',
});

export { processor as GET, processor as POST };
