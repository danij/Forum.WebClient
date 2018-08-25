import {Pages} from './common';
import {ThreadsView} from "../views/threadsView";
import {MasterPage} from "./masterPage";
import {TagRepository} from "../services/tagRepository";
import {PageActions} from "./action";
import {DOMHelpers} from "../helpers/domHelpers";

/**
 * Displays page for creating a new thread
 */
export class NewThreadPage implements Pages.Page {

    static readonly PageUrl: string = 'threads/new';

    display(): void {

        this.refreshUrl();

        Pages.changePage(async () => {

            const allTags = await TagRepository.getTagsCached();

            return ThreadsView.createAddNewThreadContent(allTags, (name, tagIds, message) => {

                if (name && name.trim().length && message && message.trim().length) {

                    return PageActions.getThreadCallback().createThread(name, tagIds, message);
                }
            });
        });
    }

    static loadPage(url: string): boolean {

        if (url.indexOf(NewThreadPage.PageUrl) != 0) return false;

        const page = new NewThreadPage();

        page.display();
        return true;
    }

    private refreshUrl() {

        MasterPage.goTo(NewThreadPage.PageUrl, 'Add a New Thread');
        DOMHelpers.addClasses(document.getElementById('new-thread-page-link'), 'uk-active');
    }
}
