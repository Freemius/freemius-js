import { PagingOptions } from '../contracts/types';
import { idToNumber } from './parser';
import { FsApiClient } from './client';
import { FSId } from './types';

export const PAGING_DEFAULT_LIMIT = 150;
export const PAGING_MAX_LIMIT = 300;

export const defaultPagingOptions: PagingOptions = {
    count: PAGING_DEFAULT_LIMIT,
    offset: 0,
};

export abstract class ApiBase<EntityType, FilterType extends Record<string, unknown> = Record<string, unknown>> {
    public readonly productId: number;

    constructor(
        productId: FSId,
        public readonly client: FsApiClient
    ) {
        this.productId = idToNumber(productId);
    }

    abstract retrieve(id: FSId): Promise<EntityType | null>;

    abstract retrieveMany(filter?: FilterType, pagination?: PagingOptions): Promise<EntityType[]>;

    /**
     * Async generator that yields all entities by paginating through retrieveMany.
     * @param filter Optional filter for entities
     * @param pageSize Optional page size (default: PAGING_DEFAULT_LIMIT)
     *
     * @example
     * // Usage example:
     * for await (const entity of apiInstance.iterateAll({ status: 'active' })) {
     *   console.log(entity);
     * }
     */
    async *iterateAll(
        filter?: FilterType,
        pageSize: number = PAGING_DEFAULT_LIMIT
    ): AsyncGenerator<EntityType, void, unknown> {
        let offset = 0;

        while (true) {
            const page = await this.retrieveMany(filter, { count: pageSize, offset });

            if (!page.length) {
                break;
            }

            for (const entity of page) {
                yield entity;
            }

            if (page.length < pageSize) {
                break;
            }

            offset += page.length;
        }
    }

    // Helper methods

    getPagingParams(paging: PagingOptions = defaultPagingOptions): { count: number; offset: number } {
        return {
            count: paging.count ?? PAGING_DEFAULT_LIMIT,
            offset: paging.offset ?? 0,
        };
    }

    getIdForPath(id: FSId): number {
        return idToNumber(id);
    }

    isGoodResponse(response: Response): boolean {
        return response.status >= 200 && response.status < 300;
    }
}
