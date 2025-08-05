import { createApiClient } from './api/client';

export class Freemius {
    private readonly apiClient: ReturnType<typeof createApiClient>;

    constructor(
        private readonly productId: string,
        private readonly apiKey: string,
        private readonly secretKey: string,
        private readonly publicKey: string
    ) {
        this.apiClient = createApiClient(process.env.IS_FREEMIUS_DEVELOPMENT_MODE === 'true');
    }
}
