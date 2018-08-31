import {Pages} from './common';
import {MasterPage} from './masterPage';
import {DocumentationView} from '../views/documentationView';
import {PageActions} from './action';

export class DocPage implements Pages.Page {

    docSource: string;

    display(): void {

        MasterPage.goTo('documentation/' + encodeURIComponent(this.docSource), 'Documentation');

        Pages.changePage(() => DocumentationView.createDocumentationContainer(this.docSource,
            PageActions.getDocumentationCallback()));
    }

    static loadPage(url: string) : boolean {

        if (url.indexOf('documentation/') != 0) return false;

        const page = new DocPage();

        page.docSource = Pages.getDocSource('/' + url);
        if ( ! page.docSource) return false;

        page.display();
        return true;
    }

    static getPageUrl(docSource: string): string {

        return Pages.getUrl('documentation/' + encodeURIComponent(docSource));
    }
}