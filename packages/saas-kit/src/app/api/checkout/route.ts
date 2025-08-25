/**
 * This route handles the Purchase actions and sync actions coming from the Freemius SaaS Starter Kit.
 */
import { freemius } from '@/lib/freemius';
import { processPurchaseInfo, processRedirect } from '@/lib/user-license';

const processor = freemius.checkout.request.getProcessor({
    proxyUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://xyz.ngrok-free.app',
    onPurchase: processPurchaseInfo,
    onRedirect: processRedirect,
});

export { processor as GET, processor as POST };
