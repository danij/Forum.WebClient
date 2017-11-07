import {RequestHandler} from "./requestHandler";

export module TagRepository {

    export interface Tag {

        id: string;
        name: string;
        created: number;
        threadCount: number;
        messageCount: number;
    }

    export interface TagCollection {

        tags: Tag[];
    }

    export async function getTags(): Promise<Tag[]> {

        return (await RequestHandler.get({
            path: 'tags'
        }) as TagCollection).tags;
    }
}
