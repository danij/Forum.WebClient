import {RequestHandler} from "../services/requestHandler";
import {Views} from "./common";
import {ViewsExtra} from "./extra";
import {DOMHelpers} from "../helpers/domHelpers";

export module DocumentationView {

    import cE = DOMHelpers.cE;

    export function showDocumentationInModal(fileName: string): void {

        RequestHandler.get({

            path: `../doc/${fileName}`,
            doNotParse: true

        }).catch(reason => {

            Views.showDangerNotification('Could not load documentation: ' + reason);

        }).then(content => {

            if ( ! content) return;

            const container = document.getElementById('documentation-modal-container');

            ViewsExtra.expandAndAdjust(container, content);

            Views.showModal(document.getElementById('documentation-modal'));
        });
    }

    export async function createDocumentationContainer(fileName: string): Promise<HTMLElement> {

        let couldNotLoadReason : string;
        let content : string;

        try {

            content = await RequestHandler.get({

                path: `../doc/${fileName}`,
                doNotParse: true
            });
        }
        catch (e) {

            couldNotLoadReason = e;
        }

        const container = cE('div');

        if (content) {

            ViewsExtra.expandAndAdjust(container, content);
        }
        else {

            container.appendChild(DOMHelpers.parseHTML(`<span class="uk-text-warning">Could not load documentation: ${couldNotLoadReason}</span>`));
        }

        return container;
    }
}