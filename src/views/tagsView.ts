import {TagRepository} from "../services/tagRepository";

export module TagsView {

    export function createTagElement(tag: TagRepository.Tag): HTMLElement {

        let tagElement = $('<span class="uk-badge uk-icon" uk-icon="icon: tag"></span>');
        tagElement.text(tag.name);

        return tagElement[0];
    }
}
