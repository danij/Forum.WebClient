import {Pages} from './common';
import {TagRepository} from "../services/tagRepository";
import {TagsView} from "../views/tagsView";
import {Views} from "../views/common";

/**
 * Displays a list of all tags with custom sorting
 */
export class TagsPage implements Pages.Page {

    private orderBy: string = 'name';
    private sortOrder: string = 'ascending';

    display(): void {

        $('#TagsPageLink').addClass('uk-active');
        Pages.changePage(async () => {

            let tagCollection = await this.getAllTags();
            if (null == tagCollection) return;

            let elements = TagsView.createTagsPageContent(tagCollection.tags);

            this.setupSortControls(elements.sortControls);

            return elements.list;
        });
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

            return TagsView.createTagsList(tagCollection.tags);
        });
    }

    private setupSortControls(controls: HTMLElement): void {

        let elements = $(controls);

        elements.find('input[type=radio]').on('change', (e) => {

            this.orderBy = (e.target as HTMLInputElement).value;
            this.refreshList();
        });

        elements.find("select[name='sortOrder']").on('change', (e) => {

            this.sortOrder = (e.target as HTMLSelectElement).value;
            this.refreshList();
        });
    }
}
