import {Pages} from './common';
import {ThreadRepository} from "../services/threadRepository";
import {ThreadsView} from "../views/threadsView";

/**
 * Displays a list of threads with pagination and custom sorting
 */
export class ThreadsPage implements Pages.Page {

    display(): void {

        $('#ThreadsPageLink').addClass('uk-active');
        Pages.changePage(async () => {

            let users = await Pages.getOrShowError(ThreadRepository.getThreads());
            if (null == users) return;

            return ThreadsView.createThreadList(users);
        });
    }
}
