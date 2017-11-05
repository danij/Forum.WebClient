import {RequestHandler} from './requestHandler'
import {TagRepository} from "./tagRepository";
import {UserRepository} from "./userRepository";

export module CategoryRepository {

    export interface LatestMessage {
        id: string;
        created: number;
        createdBy: UserRepository.User;
        message: string;
        threadId: string;
        threadTitle: string;
    }

    export interface Category {
        id: string;
        name: string;
        description: string;
        displayOrder: number;
        created: number;
        threadCount: number;
        messageCount: number;
        threadTotalCount: number;
        messageTotalCount: number;
        latestMessage: LatestMessage;
        tags: TagRepository.Tag[];
        children: Category[];
        privileges: string[];
    }

    export interface CategoryCollection {
        categories: Category[];
    }

    export async function getRootCategories(): Promise<Category[]> {

        return (await RequestHandler.get({
            path: 'categories/root'
        }) as CategoryCollection).categories;
    }
}

