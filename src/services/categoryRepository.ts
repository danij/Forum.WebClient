import {RequestHandler} from './requestHandler'
import {TagRepository} from './tagRepository';
import {UserRepository} from './userRepository';
import {CommonEntities} from './commonEntities';
import {ThreadMessageRepository} from './threadMessageRepository';
import {UserCache} from "./userCache";

export module CategoryRepository {

    export interface Category extends CommonEntities.PrivilegesArray {
        id: string;
        name: string;
        description: string;
        displayOrder: number;
        created: number;
        threadCount: number;
        messageCount: number;
        threadTotalCount: number;
        messageTotalCount: number;
        latestMessage: ThreadMessageRepository.LatestMessage;
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

    export function filterLatestMessage(latestMessage: ThreadMessageRepository.LatestMessage):
        ThreadMessageRepository.LatestMessage {

        if (null == latestMessage) {

            latestMessage = {
                id: '',
                approved: true,
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

        for (const tag of category.tags) {

            TagRepository.filterTag(tag);
        }

        category.latestMessage = filterLatestMessage(category.latestMessage);

        category.children = (category.children || []).filter(c => null != c);

        for (const childCategory of category.children) {

            filterCategoryNulls(childCategory);
        }

        return category;
    }

    function filterNulls(value: any): CategoryCollection {

        const result = value as CategoryCollection;

        result.categories = (result.categories || []).filter(c => null != c);

        for (const category of result.categories) {
            filterCategoryNulls(category);
        }

        return result;
    }

    export async function getRootCategories(): Promise<Category[]> {

        const result = filterNulls(await RequestHandler.get({
            path: 'categories/root'
        })).categories;

        sortCategories(result);
        UserCache.processCategories(result);

        return result;
    }

    export async function getAllCategories(): Promise<Category[]> {

        const result = filterNulls(await RequestHandler.get({
            path: 'categories/'
        })).categories;

        sortCategories(result);
        UserCache.processCategories(result);

        return result;
    }

    export async function getAllCategoriesAsTree(): Promise<Category[]> {

        const allCategories = (await getAllCategories()).sort(compareCategoriesByDisplayOrder);

        const rootCategories: Category[] = [];

        for (const category of allCategories) {

            const parent = allCategories.find((c) => {
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

        UserCache.processCategories(rootCategories);

        return rootCategories;
    }

    export async function getCategoryById(id: string): Promise<Category> {

        const result = filterCategoryNulls((await RequestHandler.get({
            path: 'category/' + encodeURIComponent(id)
        }) as SingleCategory).category);

        sortCategories(result.children);
        UserCache.processCategory(result);

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

        for (const category of categories) {

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
