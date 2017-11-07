import {Pages} from './common';
import {TagRepository} from "../services/tagRepository";
import {TagsView} from "../views/tagsView";

/**
 * Displays a list of all tags with custom sorting
 */
export class TagsPage implements Pages.Page {

    display(): void {

        $('#TagsPageLink').addClass('uk-active');
        Pages.changePage(async () => {

            let tags = await Pages.getOrShowError(TagRepository.getTags());
            if (null == tags) return;

            return TagsView.createTagsList(tags);
        });
    }
}
