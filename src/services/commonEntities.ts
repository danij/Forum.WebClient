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

    declare const cacheConfig: any;

    export function getCacheConfig(): any {

        return cacheConfig;
    }
}