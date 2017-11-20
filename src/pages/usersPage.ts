import {Pages} from './common';
import {UserRepository} from "../services/userRepository";
import {UsersView} from "../views/usersView";
import {CommonEntities} from "../services/commonEntities";
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";

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
                }, (value: number) => this.onPageNumberChange(value));

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

        Views.changeContent($('#pageContentContainer .users-list')[0], async () => {

            let userCollection = await this.getAllUsers();

            if (null == userCollection) return null;

            let newTopPaginationControl = Views.createPaginationControl(userCollection,
                (value: number) => this.onPageNumberChange(value));
            $(this.topPaginationControl).replaceWith(newTopPaginationControl);
            this.topPaginationControl = newTopPaginationControl;

            let newBottomPaginationControl = Views.createPaginationControl(userCollection,
                (value: number) => this.onPageNumberChange(value));
            $(this.bottomPaginationControl).replaceWith(newBottomPaginationControl);
            this.bottomPaginationControl = newBottomPaginationControl;

            return UsersView.createUserListContent(userCollection.users);
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        let elements = $(controls);

        elements.find('input[type=radio]').on('change', (e) => {

            this.orderBy = (e.target as HTMLInputElement).value;
            this.refreshUrl();
            this.refreshList();
        });

        elements.find("select[name='sortOrder']").on('change', (e) => {

            this.sortOrder = (e.target as HTMLSelectElement).value;
            this.refreshUrl();
            this.refreshList();
        });
    }

    private onPageNumberChange(newPageNumber: number): void {

        this.pageNumber = newPageNumber;
        this.refreshUrl();
        this.refreshList();
    }

    private refreshUrl() {

        let title = Views.addPageNumber('Users', this.pageNumber);

        MasterPage.goTo( Pages.appendToUrl('users', {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder,
            pageNumber: this.pageNumber
        }), title);
        document.getElementById('UsersPageLink').classList.add('uk-active');
    }
}
