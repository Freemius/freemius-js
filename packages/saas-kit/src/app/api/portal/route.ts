import { freemius } from '@/lib/freemius';
import { getUser, getUserEmail, processPurchases } from '@/lib/user-license';

const processor = freemius.customerPortal.request.getProcessor({
    getUser: getUser,
    getUserEmail: getUserEmail,
    portalEndpoint: process.env.NEXT_PUBLIC_APP_URL! + '/api/portal',
    isSandbox: process.env.NODE_ENV !== 'production',
    onRestore: processPurchases,
});

export { processor as GET, processor as POST };
