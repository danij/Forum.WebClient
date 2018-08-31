import {RequestHandler} from './requestHandler';

export module StatisticsRepository {

    export interface EntityCount {

        users: number;
        discussionThreads: number;
        discussionMessages: number;
        discussionTags: number;
        discussionCategories: number;
        visitors: number;
    }

    interface EntityCountResponse {

        count: EntityCount;
    }

    export async function getEntityCount(): Promise<EntityCount> {

        return (await RequestHandler.get({
            path: 'statistics/entitycount',
        }) as EntityCountResponse).count;
    }
}