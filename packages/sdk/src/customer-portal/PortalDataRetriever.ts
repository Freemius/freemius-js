import { PortalAction } from '../contracts/portal';
import { UserRetriever } from '../contracts/types';
import { PortalDataRepository } from './PortalDataRepository';

export class PortalDataRetriever implements PortalAction {
    constructor(
        private readonly repository: PortalDataRepository,
        private readonly getUser: UserRetriever,
        private readonly endpoint: string,
        private readonly isSandbox?: boolean
    ) {}

    createAuthenticatedUrl(): string {
        throw new Error('Method not implemented.');
    }

    verifyAuthentication(): boolean {
        return true;
    }

    canHandle(request: Request): boolean {
        const url = new URL(request.url);
        const action = url.searchParams.get('action');

        return request.method === 'GET' && action === 'portal_data';
    }

    async processAction(): Promise<Response> {
        const user = await this.getUser();

        if (!user) {
            return Response.json(null);
        }

        return Response.json(
            await this.repository.retrievePortalDataByUserId({
                userId: user.id,
                endpoint: this.endpoint,
                primaryLicenseId: null,
                sandbox: this.isSandbox ?? false,
            })
        );
    }
}
