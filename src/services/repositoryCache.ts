export module RepositoryCache {

    interface CacheEntry {

        value: any;
        expiresAt: number;
    }

    const cacheEntries = {};

    function now(): number {

        return Math.floor((new Date).getTime() / 1000);
    }

    export function get(id: string): any {

        const entry = cacheEntries[id] as CacheEntry;
        if ( ! entry) return entry;

        if (entry.expiresAt < now()) {

            delete cacheEntries[id];
            return null;
        }

        return entry.value;
    }

    export function update(id: string, value: any, expiresInSeconds: number): void {

        cacheEntries[id] = {

            value: value,
            expiresAt: now() + expiresInSeconds
        };
    }
}