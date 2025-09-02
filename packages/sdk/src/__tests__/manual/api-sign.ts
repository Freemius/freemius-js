import { freemius } from './fs';

async function main() {
    const url = freemius.api.getSignedUrl(freemius.api.createUrl(`/payments/1736338/invoice.pdf`));

    console.log('Signed URL:', url);
}

main();
