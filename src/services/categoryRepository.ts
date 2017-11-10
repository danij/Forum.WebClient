import {RequestHandler} from './requestHandler'
import {TagRepository} from "./tagRepository";
import {UserRepository} from "./userRepository";

export module CategoryRepository {

    export interface LatestMessage {
        id: string;
        created: number;
        createdBy: UserRepository.User;
        content: string;
        threadId: string;
        threadName: string;
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

        return sortChildCategories((await RequestHandler.get({
            path: 'categories/root'
        }) as CategoryCollection).categories);
    }

    function sortChildCategories(categories: Category[]): Category[] {

        if (null == categories) return null;

        for (let category of categories) {

            if (category.children && category.children.length) {

                category.children.sort((first, second) => {

                    return second.displayOrder - first.displayOrder;
                })
            }
        }

        return categories;
    }
}

