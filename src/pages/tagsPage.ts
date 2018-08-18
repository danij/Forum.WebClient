import {Pages} from './common';
import {TagRepository} from "../services/tagRepository";
import {TagsView} from "../views/tagsView";
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";
import {PageActions} from "./action";
import {DOMHelpers} from "../helpers/domHelpers";

/**
 * Displays a list of all tags with custom sorting
 */
export class TagsPage implements Pages.Page {

    private orderBy: string = 'name';
    private sortOrder: string = 'ascending';

    display(): void {

        this.refreshUrl();

        Pages.changePageDontRefreshMath(async () => {

            const tagCollection = await this.getAllTags();
            if (null == tagCollection) return;

            const elements = TagsView.createTagsPageContent(tagCollection.tags, {
                orderBy: this.orderBy,
                sortOrder: this.sortOrder
            }, PageActions.getTagCallback());

            this.setupSortControls(elements.sortControls);

            return elements.list;
        });
    }

    static loadPage(url: string) : boolean {

        if (url.indexOf('tags/') != 0) return false;

        const page = new TagsPage();

        page.orderBy = Pages.getOrderBy(url) || page.orderBy;
        page.sortOrder = Pages.getSortOrder(url) || page.sortOrder;

        page.display();
        return true;
    }

    private getAllTags(): Promise<TagRepository.TagCollection> {

        return Pages.getOrShowError(TagRepository.getTags({
            orderBy: this.orderBy,
            sort: this.sortOrder
        } as TagRepository.GetTagsRequest));
    }

    private refreshList(): void {

        Views.changeContent(document.querySelector('#page-content-container .tags-list'), async () => {

            const tagCollection = await this.getAllTags();

            if (null == tagCollection) return null;

            return TagsView.createTagsTable(tagCollection.tags);
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        const radioElements = controls.querySelectorAll('input[type=radio]');

        DOMHelpers.forEach(radioElements, radioElement => {

            radioElement.addEventListener('change', (ev) => {

                this.orderBy = (ev.target as HTMLInputElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        });

        const selectElements = controls.querySelectorAll("select[name='sortOrder']");

        DOMHelpers.forEach(selectElements, selectElement => {

            selectElement.addEventListener('change', (ev) => {

                this.sortOrder = (ev.target as HTMLSelectElement).value;
                this.refreshUrl();
                this.refreshList();
            });
        });
    }

    private refreshUrl() {

        MasterPage.goTo(Pages.appendToUrl('tags', {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder
        }), 'Tags');
        document.getElementById('tags-page-link').classList.add('uk-active');
    }
}
