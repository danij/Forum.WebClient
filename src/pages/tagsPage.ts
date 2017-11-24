import {Pages} from './common';
import {TagRepository} from "../services/tagRepository";
import {TagsView} from "../views/tagsView";
import {Views} from "../views/common";
import {MasterPage} from "./masterPage";


/**
 * Displays a list of all tags with custom sorting
 */
export class TagsPage implements Pages.Page {

    private orderBy: string = 'name';
    private sortOrder: string = 'ascending';

    display(): void {

        this.refreshUrl();

        Pages.changePage(async () => {

            let tagCollection = await this.getAllTags();
            if (null == tagCollection) return;

            let elements = TagsView.createTagsPageContent(tagCollection.tags, {
                orderBy: this.orderBy,
                sortOrder: this.sortOrder
            });

            this.setupSortControls(elements.sortControls);

            return elements.list;
        });
    }

    static loadPage(url: string) : boolean {

        if (url.indexOf('tags/') != 0) return false;

        let page = new TagsPage();

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

        Views.changeContent($('#pageContentContainer .tags-list')[0], async () => {

            let tagCollection = await this.getAllTags();

            if (null == tagCollection) return null;

            return TagsView.createTagsTable(tagCollection.tags);
        }).then(() => {

            Views.scrollToTop();
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        let elements = $(controls);

        elements.find('input[type=radio]').on('change', (e) => {

            this.orderBy = (e.target as HTMLInputElement).value;
            this.refreshUrl();
            this.refreshList();
        });

        elements.find("select[name='sortOrder']").on('change', (e) => {

            this.sortOrder = (e.target as HTMLSelectElement).value;
            this.refreshUrl();
            this.refreshList();
        });
    }

    private refreshUrl() {

        MasterPage.goTo(Pages.appendToUrl('tags', {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder
        }), 'Tags');
        document.getElementById('TagsPageLink').classList.add('uk-active');
    }
}
