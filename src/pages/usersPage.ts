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

            const userCollection = await this.getAllUsers();

            if (null == userCollection) return null;

            const elements = UsersView.createUsersPageContent(userCollection, {
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

        const page = new UsersPage();

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

        Views.changeContent(document.querySelector('#page-content-container .users-list'), async () => {

            const userCollection = await this.getAllUsers();

            if (null == userCollection) return null;

            const newTopPaginationControl = Views.createPaginationControl(userCollection, 'users',
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.topPaginationControl, newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            const newBottomPaginationControl = Views.createPaginationControl(userCollection, 'users',
                (value: number) => this.onPageNumberChange(value),
                (pageNumber: number) => this.getLinkForPage(pageNumber));
            DOMHelpers.replaceElementWith(this.bottomPaginationControl, newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return UsersView.createUserListContent(userCollection.users);
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        const radioElements = controls.querySelectorAll('input[type=radio]');

        DOMHelpers.forEach(radioElements, radioElement => {

            radioElement.addEventListener('change', (ev) => {

                this.orderBy = (ev.target as HTMLInputElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        });

        const selectElements = controls.querySelectorAll("select[name='sortOrder']");

        DOMHelpers.forEach(selectElements, selectElement => {

            selectElement.addEventListener('change', (ev) => {

                this.sortOrder = (ev.target as HTMLSelectElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        });
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

        const title = Views.addPageNumber('Users', this.pageNumber);

        MasterPage.goTo(this.getLinkForPage(this.pageNumber), title);
        DOMHelpers.addClasses(document.getElementById('users-page-link'), 'uk-active');
    }
}
