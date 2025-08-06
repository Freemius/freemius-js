import { CheckoutPopupParams, convertCheckoutOptionsToQueryParams } from '@freemius/checkout';
import { createHash } from 'crypto';
import { FSId } from '../utils/id';

export class Checkout {
    constructor(
        private readonly productId: FSId,
        private readonly publicKey: string,
        private readonly secretKey: string
    ) {}

    async getParams(
        config: Partial<Omit<CheckoutPopupParams, 'sandbox'>> & {
            sandbox?: boolean;
        }
    ): Promise<Partial<CheckoutPopupParams>> {
        // eslint-disable-next-line prefer-const
        let { sandbox, ...params } = config;

        if (sandbox) {
            params = {
                ...params,
                ...(await this.getSandboxParams()),
            };
        }

        return params;
    }

    /**
     * Retrieves the sandbox parameters for the checkout.
     *
     * This shouldn't be used in production, but is useful for testing purposes.
     *
     * @returns
     */
    async getSandboxParams(): Promise<Partial<CheckoutPopupParams>> {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const token = `${timestamp}${this.productId}${this.secretKey}${this.publicKey}checkout`;

        return {
            sandbox: {
                ctx: timestamp,
                token: createHash('md5').update(token).digest('hex'),
            },
        };
    }

    async getReadonlyUserParams(
        email: string,
        firstName?: string,
        lastName?: string,
        readonly = true
    ): Promise<Partial<CheckoutPopupParams>> {
        const params: Partial<CheckoutPopupParams> = {
            user_email: email,
            readonly_user: readonly,
        };

        if (firstName) {
            params.user_firstname = firstName;
        }
        if (lastName) {
            params.user_lastname = lastName;
        }

        return params;
    }

    // async getUpgradeParams(): Promise<CheckoutOptions> {}

    async getCheckoutUrl(
        planId: number | string,
        currency: 'usd' | 'eur' | 'gbp' | 'auto' = 'auto',
        licenses: number | null = null,
        options?: Omit<CheckoutPopupParams, 'plan_id' | 'licenses' | 'currency'>
    ): Promise<string> {
        const url = `https://checkout.freemius.com/product/${
            this.productId
        }/plan/${planId}/licenses/${licenses}/currency/${currency}/`;

        const queryParams = options ? convertCheckoutOptionsToQueryParams(options) : '';

        return `${url}${queryParams ? `?${queryParams}` : ''}`;
    }
}
