export module CommonEntities {

    export interface PaginationInfo {

        page: number;
        pageSize: number;
        totalCount: number;
    }

    export interface PrivilegesArray {

        privileges: string[];
    }

    export function getPageCount(info: PaginationInfo): number {

        return Math.ceil(info.totalCount / Math.max(info.pageSize, 1));
    }

    export interface CacheConfig {

        tags: number;
        threads: number;
        latestMessages: number;
        userRetrieveBatchSize: number;
    }

    declare const cacheConfig: CacheConfig;

    export function getCacheConfig(): CacheConfig {

        return cacheConfig;
    }
}