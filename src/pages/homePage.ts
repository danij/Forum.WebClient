import {Pages} from './common';
import {CategoryRepository} from '../services/categoryRepository';
import {CategoriesView} from '../views/categoriesView';
import {MasterPage} from './masterPage';
import {ThreadsView} from '../views/threadsView';
import {ThreadRepository} from '../services/threadRepository';
import {Views} from '../views/common';
import {PageActions} from './action';
import {DOMHelpers} from '../helpers/domHelpers';
import {LanguageService} from "../services/languageService";
import L = LanguageService.translate;

/**
 * The home page displays the root categories
 */
export class HomePage implements Pages.Page {

    private pageNumber: number = 0;
    private orderBy: string = 'latestmessagecreated';
    private sortOrder: string = 'descending';
    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;
    private category: CategoryRepository.Category;

    display(): void {

        MasterPage.goTo('home', '');

        DOMHelpers.addClasses(document.getElementById('home-page-link'), 'uk-active');

        Pages.changePage(async () => {

            const categories = await Pages.getOrShowError(CategoryRepository.getRootCategories());
            if (null == categories) return;

            return await CategoriesView.createRootCategoriesDisplay(categories, PageActions.getCategoryCallback());
        });
    }

    async displayCategory(id: string, name: string): Promise<void> {

        MasterPage.goTo(Pages.getCategoryUrl(id, name), name);

        DOMHelpers.addClasses(document.getElementById('home-page-link'), 'uk-active');

        await Pages.changePage(async () => {

            this.category = await Pages.getOrShowError(CategoryRepository.getCategoryById(id));
            if (null == this.category) return;

            const threadCollection = await this.getCategoryThreads(this.category);
            let threadList : HTMLElement = null;

            if (null != threadCollection) {
                const threadElements = await ThreadsView.createThreadsPageContent(threadCollection, {
                    orderBy: this.orderBy,
                    sortOrder: this.sortOrder,
                }, (value: number) => this.onPageNumberChange(value),
                    (pageNumber: number) => this.getLinkForPage(pageNumber),
                    PageActions.getTagCallback(), PageActions.getUserCallback(), PageActions.getPrivilegesCallback());

                Pages.setupSortControls(this, threadElements.sortControls);

                this.topPaginationControl = threadElements.paginationTop;
                this.bottomPaginationControl = threadElements.paginationBottom;

                threadList = threadElements.list;
            }

            return await CategoriesView.createCategoryDisplay(this.category, threadList, PageActions.getCategoryCallback(),
                PageActions.getTagCallback(),
                PageActions.getPrivilegesCallback());
        });

        Pages.scrollPage({
            top: true
        });
    }

    static loadPage(url: string): boolean {

        const category = Pages.getCategory(url);
        if (category) {

            const page = new HomePage();
            page.orderBy = Pages.getOrderBy(url) || page.orderBy;
            page.sortOrder = Pages.getSortOrder(url) || page.sortOrder;
            page.pageNumber = Pages.getPageNumber(url) || page.pageNumber;

            page.displayCategory(category.id, category.name);
        }
        else {

            if (('/' != url) && (url.indexOf('home/') != 0)) return false;

            new HomePage().display();
        }

        return true;
    }

    private getCategoryThreads(category: CategoryRepository.Category): Promise<ThreadRepository.ThreadCollection> {

        return Pages.getOrShowError(ThreadRepository.getThreadsOfCategory(category, {
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as ThreadRepository.GetThreadsRequest));
    }

    private onPageNumberChange(newPageNumber: number): void {

        const scrollDirection = Pages.getScrollDirection(newPageNumber, this.pageNumber);

        this.pageNumber = newPageNumber;
        this.refreshUrl();
        this.refreshList(scrollDirection);
    }

    private async refreshList(scrollDirection: Pages.ScrollDirection): Promise<void> {

        await Views.changeContent(document.getElementsByClassName('threads-table')[0] as HTMLElement, async () => {

            const threadCollection = await this.getCategoryThreads(this.category);

            if (null == threadCollection) return;

            const newTopPaginationControl = Views.createPaginationControl(threadCollection, L('threads'),
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            const newBottomPaginationControl = Views.createPaginationControl(threadCollection, L('threads'),
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return await ThreadsView.createThreadsTable(threadCollection.threads);
        });

        Pages.scrollPage(scrollDirection);
    }

    private getLinkForPage(pageNumber: number): string {

        return Pages.appendToUrl(Pages.getCategoryUrl(this.category.id, this.category.name), {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder,
            pageNumber: pageNumber
        });
    }

    private refreshUrl() {

        const title = Views.addPageNumber(this.category.name, this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);

        DOMHelpers.addClasses(document.getElementById('home-page-link'), 'uk-active');
    }
}
