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

    export function filterLatestMessage(latestMessage: LatestMessage): LatestMessage {

        if (null == latestMessage) {

            latestMessage = {
                id: '',
                created: 0,
                createdBy: null,
                content: '',
                threadId: '',
                threadName: '',
            }
        }

        latestMessage.createdBy = latestMessage.createdBy || UserRepository.UnknownUser;

        return latestMessage;
    }

    export function filterCategoryNulls(category: Category): Category {

        category.tags = (category.tags || []).filter(t => null != t);

        for (let tag of category.tags) {

            TagRepository.filterTag(tag);
        }

        category.latestMessage = filterLatestMessage(category.latestMessage);

        category.children = (category.children || []).filter(c => null != c);

        for (let childCategory of category.children) {

            filterCategoryNulls(childCategory);
        }

        return category;
    }

    function filterNulls(value: any): CategoryCollection {

        let result = value as CategoryCollection;

        result.categories = (result.categories || []).filter(c => null != c);

        for (let category of result.categories)
        {
            filterCategoryNulls(category);
        }

        return result;
    }

    export async function getRootCategories(): Promise<Category[]> {

        let result = filterNulls(await RequestHandler.get({
            path: 'categories/root'
        })).categories;

        sortCategories(result);
        return result;
    }

    export async function getAllCategories(): Promise<Category[]> {

        let result = filterNulls(await RequestHandler.get({
            path: 'categories/'
        })).categories;

        sortCategories(result);
        return result;
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

        let result = filterCategoryNulls((await RequestHandler.get({
            path: 'category/' + encodeURIComponent(id)
        }) as SingleCategory).category);

        sortCategories(result.children);

        return result;
    }

    function compareCategoriesByDisplayOrder(first: Category, second: Category) {

        return Math.sign(first.displayOrder - second.displayOrder);
    }

    export function compareCategoriesByName(first: Category, second: Category) {

        return first.name.toLocaleLowerCase().localeCompare(second.name.toLocaleLowerCase());
    }

    function sortCategories(categories: Category[]): void {

        if (null == categories) return null;
        categories.sort(compareCategoriesByDisplayOrder);

        for (let category of categories) {

            if (category.children && category.children.length) {

                sortCategories(category.children);
            }
        }
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
