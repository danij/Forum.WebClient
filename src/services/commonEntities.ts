export module CommonEntities {

    export interface PaginationInfo {

        page: number;
        pageSize: number;
        totalCount: number;
    }

    export function getPageCount(info: PaginationInfo): number {

        return Math.ceil(info.totalCount / Math.max(info.pageSize, 1));
    }
}