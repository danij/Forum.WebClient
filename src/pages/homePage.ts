import {Pages} from './common';
import {CategoryRepository} from "../services/categoryRepository";
import {CategoriesView} from "../views/categoriesView";
import {MasterPage} from "./masterPage";
import {ThreadsView} from "../views/threadsView";
import {ThreadRepository} from "../services/threadRepository";
import {Views} from "../views/common";
import {Privileges} from '../services/privileges';
import {PageActions} from "./action";
import {DOMHelpers} from "../helpers/domHelpers";

/**
 * The home page displays the root categories
 */
export class HomePage implements Pages.Page {

    private pageNumber: number = 0;
    private orderBy: string = 'name';
    private sortOrder: string = 'ascending';
    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;
    private category: CategoryRepository.Category;

    display(): void {

        MasterPage.goTo('home', '');

        document.getElementById('HomePageLink').classList.add('uk-active');

        Pages.changePage(async () => {

            let categories = await Pages.getOrShowError(CategoryRepository.getRootCategories());
            if (null == categories) return;

            return CategoriesView.createRootCategoriesDisplay(categories, PageActions.getCategoryCallback(),
                Privileges.getCategoryPrivileges());
        });
    }

    displayCategory(id: string, name: string): void {

        MasterPage.goTo(Pages.getCategoryUrl(id, name), name);

        document.getElementById('HomePageLink').classList.add('uk-active');

        Pages.changePage(async () => {

            this.category = await Pages.getOrShowError(CategoryRepository.getCategoryById(id));
            if (null == this.category) return;

            let threadCollection = await this.getCategoryThreads(this.category);
            let threadList : HTMLElement = null;

            if (null != threadCollection) {
                let threadElements = ThreadsView.createThreadsPageContent(threadCollection, {
                    orderBy: this.orderBy,
                    sortOrder: this.sortOrder,
                }, (value: number) => this.onPageNumberChange(value),
                    (pageNumber: number) => this.getLinkForPage(pageNumber),
                    PageActions.getTagCallback(), Privileges.getTagPrivileges());

                this.setupSortControls(threadElements.sortControls);

                this.topPaginationControl = threadElements.paginationTop;
                this.bottomPaginationControl = threadElements.paginationBottom;

                threadList = threadElements.list;
            }

            return CategoriesView.createCategoryDisplay(this.category, threadList, PageActions.getCategoryCallback(),
                Privileges.getCategoryPrivileges());
        });
    }

    static loadPage(url: string): boolean {

        const category = Pages.getCategory(url);
        if (category) {

            let page = new HomePage();
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

    private setupSortControls(controls: HTMLElement): void {

        let radioElements = controls.querySelectorAll('input[type=radio]');

        for (let i = 0; i < radioElements.length; ++i) {

            radioElements[i].addEventListener('change', (ev) => {

                this.orderBy = (ev.target as HTMLInputElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        }

        let selectElements = controls.querySelectorAll("select[name='sortOrder']");

        for (let i = 0; i < selectElements.length; ++i) {

            selectElements[i].addEventListener('change', (ev) => {

                this.sortOrder = (ev.target as HTMLSelectElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        }
    }

    private onPageNumberChange(newPageNumber: number): void {

        this.pageNumber = newPageNumber;
        this.refreshUrl();
        this.refreshList();
    }

    private refreshList(): void {

        Views.changeContent(document.getElementsByClassName('threads-table')[0] as HTMLElement, async () => {

            let threadCollection = await this.getCategoryThreads(this.category);

            if (null == threadCollection) return;

            let newTopPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            let newBottomPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return ThreadsView.createThreadsTable(threadCollection.threads);
        }).then(() => {

            Views.scrollToTop();
        });
    }

    private getLinkForPage(pageNumber: number): string {

        return Pages.appendToUrl(Pages.getCategoryUrl(this.category.id, this.category.name), {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder,
            pageNumber: pageNumber
        });
    }

    private refreshUrl() {

        let title = Views.addPageNumber(this.category.name, this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);

        document.getElementById('HomePageLink').classList.add('uk-active');
    }
}
