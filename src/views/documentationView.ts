import {Views} from './common';
import {ViewsExtra} from './extra';
import {DOMHelpers} from '../helpers/domHelpers';
import {PageActions} from '../pages/action';
import {LanguageService} from "../services/languageService";

export module DocumentationView {

    import cE = DOMHelpers.cE;
    import IDocumentationCallback = PageActions.IDocumentationCallback;
    import L = LanguageService.translate;

    export function showDocumentationInModal(source: string, callback: IDocumentationCallback): void {

        callback.getContent(source).catch(reason => {

            Views.showDangerNotification(L('Could not load documentation:', reason));

        }).then(content => {

            if ( ! content) return;

            const container = document.getElementById('documentation-modal-container');

            ViewsExtra.expandAndAdjust(container, content);

            Views.showModal(document.getElementById('documentation-modal'));
        });
    }

    export async function createDocumentationContainer(source: string,
                                                       callback: IDocumentationCallback): Promise<HTMLElement> {

        let couldNotLoadReason : string;
        let content : string;

        try {

            content = await callback.getContent(source);
        }
        catch (e) {

            couldNotLoadReason = e;
        }

        const container = cE('div');

        if (content) {

            ViewsExtra.expandAndAdjust(container, content);
        }
        else {

            container.appendChild(DOMHelpers.parseHTML(`<span class="uk-text-warning">${L('Could not load documentation:', couldNotLoadReason)}</span>`));
        }

        return container;
    }
}