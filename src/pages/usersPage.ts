import {Pages} from './common';
import {UserRepository} from "../services/userRepository";
import {UsersView} from "../views/usersView";

/**
 * Displays a list of users with pagination and custom sorting
 */
export class UsersPage implements Pages.Page {

    display(): void {

        $('#UsersPageLink').addClass('uk-active');
        Pages.changePage(async () => {

            let users = await Pages.getOrShowError(UserRepository.getUsers());
            if (null == users) return;

            return UsersView.createUsersList(users);
        });
    }
}
