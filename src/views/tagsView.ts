import {TagRepository} from "../services/tagRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Views} from "./common";

export module TagsView {

    export function createTagElement(tag: TagRepository.Tag): HTMLElement {

        let container = $('<div class="uk-display-inline-block"></div>');

        let tagElement = $('<span class="uk-badge uk-icon" uk-icon="icon: tag"></span>');
        container.append(tagElement);
        tagElement.text(tag.name);

        let dropdown = $(createTagDropdown(tag));
        container.append(dropdown);

        return container[0];
    }

    function createTagDropdown(tag: TagRepository.Tag): HTMLElement {

        let content = $('<div></div>');
        content.append($(('<li>\n' +
            '    <a href="UserThreads" class="align-left">\n' +
            '        <span>Threads</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfThreads}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfThreads}', DisplayHelpers.intToString(tag.threadCount))));

        content.append($(('<li>\n' +
            '    <a href="UserMessages" class="align-left">\n' +
            '        <span>Messages</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfMessages}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfMessages}', DisplayHelpers.intToString(tag.messageCount))));

        return Views.createDropdown(tag.name, content, {
            mode: 'hover',
        });
    }

    export class TagsPageContent {

        sortControls: HTMLElement;
        list: HTMLElement
    }

    export function createTagsPageContent(tags: TagRepository.Tag[]): TagsPageContent {

        let result = new TagsPageContent();

        let resultList = $("<div></div>");

        resultList.append(result.sortControls = createTagListSortControls());

        let tagsList = $('<div class="tags-list"></div>');
        resultList.append(tagsList);
        tagsList.append(this.createTagsList(tags));

        result.list = resultList[0];
        return result;
    }

    export function createTagsList(tags: TagRepository.Tag[]): HTMLElement {

        let tagsListGrid = $('<div class="uk-grid-match uk-text-center" uk-grid></div>');

        for (let tag of tags)
        {
            if (null == tag) continue;

            tagsListGrid.append(createTagInList(tag));
        }

        return tagsListGrid[0];
    }

    function createTagListSortControls(): HTMLElement {

        return $('<div class="users-list-header">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="user-list-sort-order">\n' +
            '                Sort by:\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy" value="name" checked> Name</label>\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy" value="threadcount"> Thread Count</label>\n' +
            '                <label><input class="uk-radio" type="radio" name="orderBy" value="messagecount"> Message Count</label>\n' +
            '            </div>\n' +
            '            <div class="uk-float-right">\n' +
            '                <select class="uk-select" name="sortOrder">\n' +
            '                    <option value="ascending">Ascending</option>\n' +
            '                    <option value="descending">Descending</option>\n' +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </form>\n' +
            '</div>')[0];
    }

    function createTagInList(tag: TagRepository.Tag): HTMLElement {

        let result = $('<div></div>');

        let card = $('<div class="uk-card uk-card-default uk-card-body"></div>');
        result.append(card);

        let wrapper = $('<div class="tag-in-list"></div>');
        card.append(wrapper);

        wrapper.append(createTagElement(tag));

        wrapper.append($(('<div>\n' +
            '    <div class="uk-float-left"><a href="#">Threads</a></div>\n' +
            '    <div class="uk-float-right">{nrOfThreads}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfThreads}', DisplayHelpers.intToString(tag.threadCount))));

        wrapper.append($(('<div>\n' +
            '    <div class="uk-float-left"><a href="#">Messages</a></div>\n' +
            '    <div class="uk-float-right">{nrOfMessages}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfMessages}', DisplayHelpers.intToString(tag.messageCount))));

        wrapper.append($(('<div>\n' +
            '    <div class="uk-float-left">Added</div>\n' +
            '    <div class="uk-float-right min-date">\n' +
            '        <span title="{AddedExpanded}" uk-tooltip>{AddedShort}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
            .replace('{AddedExpanded}', DisplayHelpers.getFullDateTime(tag.created))
            .replace('{AddedShort}', DisplayHelpers.getShortDate(tag.created))));

        return result[0];
    }
}
