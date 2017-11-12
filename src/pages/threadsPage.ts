import {Pages} from './common';
import {ThreadRepository} from "../services/threadRepository";
import {ThreadsView} from "../views/threadsView";
import {CommonEntities} from "../services/commonEntities";
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";

/**
 * Displays a list of threads with pagination and custom sorting
 */
export class ThreadsPage implements Pages.Page {

    private pageNumber: number = 0;
    private pageCount: number = 1;
    private orderBy: string = 'name';
    private sortOrder: string = 'ascending';
    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;

    display(): void {

        MasterPage.goTo('threads', 'Threads');

        document.getElementById('ThreadsPageLink').classList.add('uk-active');

        Pages.changePage(async () => {

            let threadCollection = await this.getAllThreads();
            if (null == threadCollection) return;

            let elements = ThreadsView.createThreadsPageContent(threadCollection,
                (value: number) => this.onPageNumberChange(value));

            this.setupSortControls(elements.sortControls);

            this.topPaginationControl = elements.paginationTop;
            this.bottomPaginationControl = elements.paginationBottom;
            this.pageCount = CommonEntities.getPageCount(threadCollection);

            return elements.list;
        });
    }


    static loadPage(url: string) : boolean {

        if (url.indexOf('threads/') != 0) return false;

        new ThreadsPage().display();

        return true;
    }

    private getAllThreads(): Promise<ThreadRepository.ThreadCollection> {

        return Pages.getOrShowError(ThreadRepository.getThreads({
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as ThreadRepository.GetThreadsRequest));
    }


    private refreshList(): void {

        Views.changeContent($('#pageContentContainer .threads-table')[0], async () => {

            let threadCollection = await this.getAllThreads();

            if (null == threadCollection) return null;

            let newTopPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value));
            $(this.topPaginationControl).replaceWith(newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            let newBottomPaginationControl = Views.createPaginationControl(threadCollection,
                (value: number) => this.onPageNumberChange(value));
            $(this.bottomPaginationControl).replaceWith(newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return ThreadsView.createThreadsTable(threadCollection.threads);
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        let elements = $(controls);

        elements.find('input[type=radio]').on('change', (e) => {

            this.orderBy = (e.target as HTMLInputElement).value;
            this.refreshList();
        });

        elements.find("select[name='sortOrder']").on('change', (e) => {

            this.sortOrder = (e.target as HTMLSelectElement).value;
            this.refreshList();
        });
    }

    private onPageNumberChange(newPageNumber: number): void {

        this.pageNumber = newPageNumber;
        this.refreshList();
    }
}
