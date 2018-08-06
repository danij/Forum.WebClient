import {RequestHandler} from "./requestHandler";
import {CategoryRepository} from "./categoryRepository";
import {CommonEntities} from "./commonEntities";
import {ThreadMessageRepository} from "./threadMessageRepository";

export module TagRepository {

    export interface Tag extends CommonEntities.PrivilegesArray {

        id: string;
        name: string;
        created: number;
        threadCount: number;
        messageCount: number;
        latestMessage: ThreadMessageRepository.LatestMessage;
        categories: CategoryRepository.Category[];
        privileges: string[];
    }

    export interface TagCollection {

        tags: Tag[];
    }

    export interface GetTagsRequest {

        orderBy: string;
        sort: string;
    }

    export function sortByName(tags: Tag[]): void {

        tags.sort((first, second) => {

            return first.name.toLocaleLowerCase().localeCompare(second.name.toLocaleLowerCase());
        });
    }

    let latestTags: Tag[];

    export function filterTag(tag: Tag): Tag {

        tag.latestMessage = CategoryRepository.filterLatestMessage(tag.latestMessage);

        return tag;
    }

    function filterNulls(value: any): TagCollection {

        const result = value as TagCollection;

        result.tags = (result.tags || []).filter(t => null != t);

        for (const tag of result.tags) {

            filterTag(tag);
        }

        return result;
    }

    export async function getTags(request: GetTagsRequest): Promise<TagCollection> {

        const result = filterNulls(await RequestHandler.get({
            path: 'tags',
            query: request || {orderBy: 'name', sort: 'ascending'}
        }));

        latestTags = result.tags;

        return result;
    }

    export async function getTagsCached(): Promise<Tag[]> {

        if (latestTags) {

            return latestTags.slice();
        }
        return (await getTags(null)).tags.slice();
    }

    export async function getTag(name: string): Promise<Tag> {

        if (null == latestTags) await getTags(null);

        return latestTags.find(t => name.toLowerCase() === t.name.toLowerCase()) || null;
    }

    export async function addNewTag(name: string): Promise<void> {

        await RequestHandler.post({
            path: 'tags/',
            stringData: name
        });
    }

    export async function deleteTag(tagId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'tags/' + encodeURIComponent(tagId)
        });
    }

    export async function editTagName(tagId: string, newName: string): Promise<void> {

        await RequestHandler.put({
            path: 'tags/name/' + encodeURIComponent(tagId),
            stringData: newName
        });
    }

    export async function mergeTags(sourceTagId: string, destinationTagId: string): Promise<void> {

        await RequestHandler.post({
            path: 'tags/merge/' + encodeURIComponent(sourceTagId) + '/' + encodeURIComponent(destinationTagId)
        });
    }
}
