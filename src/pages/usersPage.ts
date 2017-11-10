import {Pages} from './common';
import {UserRepository} from "../services/userRepository";
import {UsersView} from "../views/usersView";
import {CommonEntities} from "../services/commonEntities";
import {Views} from "../views/common";

/**
 * Displays a list of users with pagination and custom sorting
 */
export class UsersPage implements Pages.Page {

    private pageNumber: number = 0;
    private pageCount: number = 1;
    private orderBy: string = 'name';
    private sortOrder: string = 'ascending';
    private topPaginationControl: HTMLElement;
    private bottomPaginationControl: HTMLElement;

    display(): void {

        $('#UsersPageLink').addClass('uk-active');

        Pages.changePage(async () => {

            let userCollection = await this.getAllUsers();

            let elements = UsersView.createUsersPageContent(userCollection,
                (value: number) => this.onPageNumberChange(value));

            this.setupSortControls(elements.sortControls);

            this.topPaginationControl = elements.paginationTop;
            this.bottomPaginationControl = elements.paginationBottom;
            this.pageCount = CommonEntities.getPageCount(userCollection);

            return elements.list;
        });
    }

    private getAllUsers(): Promise<UserRepository.UserCollection> {

        return Pages.getOrShowError(UserRepository.getUsers({
            page: this.pageNumber,
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as UserRepository.GetUsersRequest));
    }

    private refreshList(): void {

        Pages.changeContent($('#pageContentContainer .users-list')[0], async () => {

            let userCollection = await this.getAllUsers();

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
