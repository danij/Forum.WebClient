import {RequestHandler} from "../services/requestHandler";
import {Views} from "./common";
import {ViewsExtra} from "./extra";

export module DocumentationView {

    export function showDocumentation(fileName: string): void {

        RequestHandler.get({

            path: `../doc/${fileName}`,
            doNotParse: true

        }).catch(reason => {

            Views.showDangerNotification('Could not load documentation: ' + reason);

        }).then(content => {

            if ( ! content) return;

            const container = document.getElementById('documentation-container');
            container.innerText = content;

            ViewsExtra.expandAndAdjust(container);

            Views.showModal(document.getElementById('documentation-modal'));
        });
    }
}