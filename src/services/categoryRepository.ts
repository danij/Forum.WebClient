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
        parent: Category;
        parentId: string;
    }

    export const EmptyCategoryId: string = '00000000-0000-0000-0000-000000000000';

    export interface CategoryCollection {

        categories: Category[];
    }

    interface SingleCategory {

        category: Category;
    }

    export async function getRootCategories(): Promise<Category[]> {

        return sortChildCategories((await RequestHandler.get({
            path: 'categories/root'
        }) as CategoryCollection).categories);
    }

    export async function getAllCategories(): Promise<Category[]> {

        return sortChildCategories((await RequestHandler.get({
            path: 'categories/'
        }) as CategoryCollection).categories);
    }

    export async function getAllCategoriesAsTree(): Promise<Category[]> {

        let allCategories = (await getAllCategories()).sort(compareCategoriesByDisplayOrder);

        let rootCategories: Category[] = [];

        for (let category of allCategories) {

            let parent = allCategories.find((c) => {
                return c.id == category.parentId;
            });

            if (parent) {

                parent.children = parent.children || [];
                parent.children.push(category);
            }
            else {

                rootCategories.push(category);
            }
        }

        return rootCategories;
    }

    export async function getCategoryById(id: string): Promise<Category> {

        let result = (await RequestHandler.get({
            path: 'category/' + encodeURIComponent(id)
        }) as SingleCategory).category;

        sortChildCategories(result.children);

        return result;
    }

    function compareCategoriesByDisplayOrder(first: Category, second: Category) {

        return Math.sign(first.displayOrder - second.displayOrder);
    }

    function sortChildCategories(categories: Category[]): Category[] {

        if (null == categories) return null;

        for (let category of categories) {

            if (category.children && category.children.length) {

                category.children.sort(compareCategoriesByDisplayOrder);
            }
        }

        return categories;
    }

    export async function addNewCategory(name: string, parentCategoryId?: string): Promise<void> {

        await RequestHandler.post({
            path: 'categories/' + encodeURIComponent(parentCategoryId || ''),
            stringData: name
        });
    }

    export async function deleteCategory(categoryId?: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'categories/' + encodeURIComponent(categoryId)
        });
    }

    export async function editCategoryName(categoryId: string, newName: string): Promise<void> {

        await RequestHandler.put({
            path: 'categories/name/' + encodeURIComponent(categoryId),
            stringData: newName
        });
    }

    export async function editCategoryDescription(categoryId: string, newDescription: string): Promise<void> {

        await RequestHandler.put({
            path: 'categories/description/' + encodeURIComponent(categoryId),
            stringData: newDescription
        });
    }

    export async function editCategoryDisplayOrder(categoryId: string, newDisplayOrder: number): Promise<void> {

        await RequestHandler.put({
            path: 'categories/displayorder/' + encodeURIComponent(categoryId),
            stringData: newDisplayOrder.toString()
        });
    }

    export async function editCategoryParent(categoryId: string, newParentId: string): Promise<void> {

        await RequestHandler.put({
            path: 'categories/parent/' + encodeURIComponent(categoryId),
            stringData: newParentId
        });
    }

    export async function addTagToCategory(categoryId: string, tagId: string): Promise<void> {

        await RequestHandler.post({
            path: 'categories/tag/' + encodeURIComponent(categoryId) + '/' + encodeURIComponent(tagId)
        });
    }

    export async function removeTagFromCategory(categoryId: string, tagId: string): Promise<void> {

        await RequestHandler.requestDelete({
            path: 'categories/tag/' + encodeURIComponent(categoryId) + '/' + encodeURIComponent(tagId)
        });
    }
}
