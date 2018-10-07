import {Pages} from './common';
import {Views} from '../views/common';
import {MasterPage} from './masterPage';
import {UserRepository} from '../services/userRepository';
import {PageActions} from './action';
import {DOMHelpers} from '../helpers/domHelpers';
import {AttachmentsRepository} from "../services/attachmentsRepository";
import {AttachmentsView} from "../views/attachmentsView";

/**
 * Displays a list of attachments with pagination and custom sorting
 */
export class AttachmentsPage implements Pages.Page {

    private pageNumber: number = 0;
    private orderBy: string = 'created';
    private sortOrder: string = 'descending';
    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;
    private userName: string = null;
    private user: UserRepository.User = null;

    static readonly URL_PREFIX = 'view_attachments';

    display(): void {

        this.refreshUrl();

        Pages.changePage(async () => {

            if (this.userName && this.userName.length) {

                this.user = await this.getUser(this.userName);
            }

            const attachmentsCollection = await this.getAttachmentsCollection();
            if (null == attachmentsCollection) return;

            const elements = await AttachmentsView.createAttachmentsPageContent(attachmentsCollection, {
                    orderBy: this.orderBy,
                    sortOrder: this.sortOrder,
                    user: this.user
                }, (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber),
                PageActions.getAttachmentCallback(), PageActions.getUserCallback(), PageActions.getPrivilegesCallback());

            Pages.setupSortControls(this, elements.sortControls);

            this.topPaginationControl = elements.paginationTop;
            this.bottomPaginationControl = elements.paginationBottom;

            return elements.list;
        });
    }

    displayForUser(userName: string): void {

        if (userName && userName.length) {

            this.userName = userName;
        }
        this.display();
    }

    static loadPage(url: string): boolean {

        if (url.indexOf(AttachmentsPage.URL_PREFIX + '/') != 0) return false;

        const page = new AttachmentsPage();

        page.orderBy = Pages.getOrderBy(url) || page.orderBy;
        page.sortOrder = Pages.getSortOrder(url) || page.sortOrder;
        page.pageNumber = Pages.getPageNumber(url) || page.pageNumber;
        page.userName = Pages.getUserName(url);

        page.display();
        return true;
    }

    private getAttachmentsCollection(): Promise<AttachmentsRepository.AttachmentCollection> {

        return this.user
            ? this.getAttachmentsAddedByUser(this.user)
            : this.getAllAttachments();
    }

    private getAllAttachments(): Promise<AttachmentsRepository.AttachmentCollection> {

        return Pages.getOrShowError(AttachmentsRepository.getAllAttachments({
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as AttachmentsRepository.GetAttachmentsRequest));
    }

    private getAttachmentsAddedByUser(user: UserRepository.User): Promise<AttachmentsRepository.AttachmentCollection> {

        return Pages.getOrShowError(AttachmentsRepository.getAttachmentsAddedByUser(user, {
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as AttachmentsRepository.GetAttachmentsRequest));
    }

    private getUser(userName: string): Promise<UserRepository.User> {

        return Pages.getOrShowError(UserRepository.getUserByName(userName));
    }

    private async refreshList(scrollDirection: Pages.ScrollDirection): Promise<void> {

        Views.changeContent(document.querySelector('#page-content-container .attachments-table'), async () => {

            const attachmentsCollection = await this.getAttachmentsCollection();

            if (null == attachmentsCollection) return;

            const newTopPaginationControl = Views.createPaginationControl(attachmentsCollection, 'attachments',
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            const newBottomPaginationControl = Views.createPaginationControl(attachmentsCollection, 'attachments',
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return await AttachmentsView.createAttachmentsTable(attachmentsCollection,
                PageActions.getAttachmentCallback());
        });

        Pages.scrollPage(scrollDirection);
    }

    private onPageNumberChange(newPageNumber: number): void {

        const scrollDirection = Pages.getScrollDirection(newPageNumber, this.pageNumber);

        this.pageNumber = newPageNumber;
        this.refreshUrl();
        this.refreshList(scrollDirection);
    }

    private getLinkForPage(pageNumber: number): string {

        let url = AttachmentsPage.URL_PREFIX;

        if (this.userName && this.userName.length) {

            url = Pages.getAttachmentsAddedByUserUrl(this.userName);
        }

        return Pages.appendToUrl(url, {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder,
            pageNumber: pageNumber
        });
    }

    private refreshUrl() {

        let title = 'Attachments';

        if (this.userName && this.userName.length) {

            title = 'Attachments added by ' + this.userName;
        }

        title = Views.addPageNumber(title, this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);
    }
}
