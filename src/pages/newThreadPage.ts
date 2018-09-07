import {Pages} from './common';
import {ThreadsView} from '../views/threadsView';
import {MasterPage} from './masterPage';
import {TagRepository} from '../services/tagRepository';
import {PageActions} from './action';
import {DOMHelpers} from '../helpers/domHelpers';
import {Views} from "../views/common";

/**
 * Displays page for creating a new thread
 */
export class NewThreadPage implements Pages.Page {

    static readonly PageUrl: string = 'threads/new';

    display(): void {

        this.refreshUrl();

        Pages.changePage(async () => {

            const allTags = await TagRepository.getAllTags();

            return ThreadsView.createAddNewThreadContent(allTags, PageActions.getTagCallback(), (name, tagIds, message) => {

                if (name && name.trim().length && message && message.trim().length) {

                    {
                        const min = Views.DisplayConfig.threadNameLengths.min;
                        const max = Views.DisplayConfig.threadNameLengths.max;

                        if (name.length < min) {

                            Views.showWarningNotification(`Thread name must be at least ${min} characters long.`);
                            return;
                        }
                        if (name.length > max) {

                            Views.showWarningNotification(`Thread name must be less than ${max} characters long.`);
                            return;
                        }
                    }
                    {
                        const min = Views.DisplayConfig.messageContentLengths.min;
                        const max = Views.DisplayConfig.messageContentLengths.max;

                        if (message.length < min) {

                            Views.showWarningNotification(`Message must be at least ${min} characters long.`);
                            return;
                        }
                        if (message.length > max) {

                            Views.showWarningNotification(`Message must be less than ${max} characters long.`);
                            return;
                        }
                    }

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
