import {Pages} from './common';
import {TagRepository} from '../services/tagRepository';
import {TagsView} from '../views/tagsView';
import {Views} from '../views/common';
import {MasterPage} from './masterPage';
import {PageActions} from './action';
import {DOMHelpers} from '../helpers/domHelpers';

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

            Pages.setupSortControls(this, elements.sortControls);

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

    private refreshUrl() {

        MasterPage.goTo(Pages.appendToUrl('tags', {
            orderBy: this.orderBy,
            sortOrder: this.sortOrder
        }), 'Tags');
        DOMHelpers.addClasses(document.getElementById('tags-page-link'), 'uk-active');
    }
}
