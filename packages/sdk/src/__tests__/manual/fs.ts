import 'dotenv/config';
import { Freemius } from '../../';

export const freemius = new Freemius({
    productId: process.env.FS__PRODUCT_ID!,
    apiKey: process.env.FS__API_KEY!,
    secretKey: process.env.FS__SECRET_KEY!,
    publicKey: process.env.FS__PUBLIC_KEY!,
});
