import {Pages} from './common';
import {ThreadsView} from '../views/threadsView';
import {MasterPage} from './masterPage';
import {TagRepository} from '../services/tagRepository';
import {PageActions} from './action';
import {DOMHelpers} from '../helpers/domHelpers';
import {Views} from "../views/common";
import {LanguageService} from "../services/languageService";
import L = LanguageService.translate;

/**
 * Displays page for creating a new thread
 */
export class NewThreadPage implements Pages.Page {

    static readonly PageUrl: string = 'threads/new';

    display(): void {

        this.refreshUrl();

        Pages.changePage(async () => {

            const allTags = await TagRepository.getAllTags();

            return ThreadsView.createAddNewThreadContent(allTags, PageActions.getTagCallback(),
                PageActions.getAttachmentCallback(), (name, tagIds, message) => {

                if (name && name.trim().length && message && message.trim().length) {

                    {
                        const min = Views.DisplayConfig.threadNameLengths.min;
                        const max = Views.DisplayConfig.threadNameLengths.max;

                        if (name.length < min) {

                            Views.showWarningNotification(L('THREAD_MIN_LENGTH', min));
                            return;
                        }
                        if (name.length > max) {

                            Views.showWarningNotification(L('THREAD_MAX_LENGTH', max));
                            return;
                        }
                    }
                    {
                        const min = Views.DisplayConfig.messageContentLengths.min;
                        const max = Views.DisplayConfig.messageContentLengths.max;

                        if (message.length < min) {

                            Views.showWarningNotification(L('MESSAGE_MIN_LENGTH', min));
                            return;
                        }
                        if (message.length > max) {

                            Views.showWarningNotification(L('MESSAGE_MAX_LENGTH', max));
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

        MasterPage.goTo(NewThreadPage.PageUrl, L('Add a New Thread'));
        DOMHelpers.addClasses(document.getElementById('new-thread-page-link'), 'uk-active');
    }
}
