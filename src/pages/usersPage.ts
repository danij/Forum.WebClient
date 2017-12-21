import {Pages} from './common';
import {UserRepository} from "../services/userRepository";
import {UsersView} from "../views/usersView";
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";
import {DOMHelpers} from "../helpers/domHelpers";

/**
 * Displays a list of users with pagination and custom sorting
 */
export class UsersPage implements Pages.Page {

    private pageNumber: number = 0;
    private orderBy: string = 'name';
    private sortOrder: string = 'ascending';
    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;

    display(): void {

        this.refreshUrl();

        Pages.changePage(async () => {

            let userCollection = await this.getAllUsers();

            if (null == userCollection) return null;

            let elements = UsersView.createUsersPageContent(userCollection, {
                    orderBy: this.orderBy,
                    sortOrder: this.sortOrder
                }, (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));

            this.setupSortControls(elements.sortControls);

            this.topPaginationControl = elements.paginationTop;
            this.bottomPaginationControl = elements.paginationBottom;

            return elements.list;
        });
    }


    static loadPage(url: string): boolean {

        if (url.indexOf('users/') != 0) return false;

        let page = new UsersPage();

        page.orderBy = Pages.getOrderBy(url) || page.orderBy;
        page.sortOrder = Pages.getSortOrder(url) || page.sortOrder;
        page.pageNumber = Pages.getPageNumber(url) || page.pageNumber;

        page.display();
        return true;
    }

    private getAllUsers(): Promise<UserRepository.UserCollection> {

        return Pages.getOrShowError(UserRepository.getUsers({
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as UserRepository.GetUsersRequest));
    }

    private refreshList(): void {

        Views.changeContent(document.querySelector('#pageContentContainer .users-list'), async () => {

            let userCollection = await this.getAllUsers();

            if (null == userCollection) return null;

            let newTopPaginationControl = Views.createPaginationControl(userCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            let newBottomPaginationControl = Views.createPaginationControl(userCollection,
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return UsersView.createUserListContent(userCollection.users);
        }).then(() => {

            Views.scrollToTop();
        });
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

    private getLinkForPage(pageNumber: number): string {

        return Pages.appendToUrl('users', {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder,
            pageNumber: pageNumber
        });
    }

    private refreshUrl() {

        let title = Views.addPageNumber('Users', this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);
        document.getElementById('UsersPageLink').classList.add('uk-active');
    }
}
