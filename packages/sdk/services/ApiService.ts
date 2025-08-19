import * as crypto from 'crypto';
import { ApiAuthParams, FSId } from '../api/types';
import { FsApiClient, createApiClient } from '../api/client';
import { License } from '../api/License';
import { Product } from '../api/Product';
import { Subscription } from '../api/Subscription';
import { User } from '../api/User';
import { idToString } from '../api/parser';

const API_ENDPOINT_PRODUCTION = 'https://api.freemius.com/v1/';
const API_ENDPOINT_TEST = 'http://api.freemius-local.com:8080/v1/';

export class ApiService {
    private readonly client: FsApiClient;

    public readonly productId: string;

    public readonly user: User;

    public readonly license: License;

    public readonly product: Product;

    public readonly subscription: Subscription;

    public readonly baseUrl: string;

    constructor(
        productId: FSId,
        apiKey: string,
        private readonly secretKey: string,
        private readonly publicKey: string
    ) {
        const isTestServer = process.env.FS__INTERNAL__IS_DEVELOPMENT_MODE === 'true';
        this.baseUrl = isTestServer ? API_ENDPOINT_TEST : API_ENDPOINT_PRODUCTION;

        this.client = createApiClient(this.baseUrl, apiKey);
        this.productId = idToString(productId);

        this.user = new User(this.productId, this.client);
        this.license = new License(this.productId, this.client);
        this.product = new Product(this.productId, this.client);
        this.subscription = new Subscription(this.productId, this.client);
    }

    /**
     * Low level API client for direct access to the Freemius API.
     * Use this for advanced use cases where you need to make custom API calls.
     *
     * For regular operations, prefer using the provided services like `User`, `Subscription`, `License` etc.
     */
    get __unstable_ApiClient(): FsApiClient {
        return this.client;
    }

    public createUrl(path: string): string {
        // Trim leading slashes to avoid double slashes in the URL
        path = path.replace(/^\/+/, '');

        return `${this.baseUrl}products/${this.productId}/${path}`;
    }

    /**
     * Generate signed URL for the given full URL
     */
    public getSignedUrl(fullUrl: string): string {
        const url = new URL(fullUrl);
        const resourcePath = url.pathname;

        const auth = this.generateAuthorizationParams(resourcePath);

        // Build query parameters
        url.searchParams.set('auth_date', auth.date);
        url.searchParams.set('authorization', auth.authorization);

        return url.toString();
    }

    /**
     * Generate authorization parameters for signing
     */
    public generateAuthorizationParams(
        resourcePath: string,
        method: 'POST' | 'PUT' | 'GET' | 'DELETE' = 'GET',
        jsonEncodedParams: string = '',
        contentType: string = ''
    ): ApiAuthParams {
        const eol = '\n';
        let contentMd5 = '';
        const date = this.toDateTimeString(new Date());

        if (['POST', 'PUT'].includes(method) && jsonEncodedParams) {
            contentMd5 = crypto.createHash('md5').update(jsonEncodedParams).digest('hex');
        }

        const stringToSign = [method, contentMd5, contentType, date, resourcePath].join(eol);

        // If secret and public keys are identical, it means that
        // the signature uses public key hash encoding.
        const authType = this.secretKey !== this.publicKey ? 'FS' : 'FSP';

        const signature = crypto.createHmac('sha256', this.secretKey).update(stringToSign).digest('hex');
        const base64 = this.base64UrlEncode(signature);

        return {
            date,
            authorization: `${authType} ${this.productId}:${this.publicKey}:${base64}`,
        };
    }

    /**
     * Base64 encoding that doesn't need to be urlencode()ed.
     * Exactly the same as base64_encode except it uses
     *   - instead of +
     *   _ instead of /
     */
    private base64UrlEncode(input: string): string {
        return Buffer.from(input, 'utf8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); // Remove padding
    }

    private toDateTimeString(date: Date): string {
        // Format date as "YYYY-MM-DD HH:mm:ss"
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getUTCDate()).padStart(2, '0');
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        const seconds = String(date.getUTCSeconds()).padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
}
