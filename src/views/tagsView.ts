import {TagRepository} from "../services/tagRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Views} from "./common";
import {DOMHelpers} from "../helpers/domHelpers";

export module TagsView {

    import DOMAppender = DOMHelpers.DOMAppender;

    export function createTagElement(tag: TagRepository.Tag): DOMAppender {

        let container = new DOMAppender('<div class="uk-display-inline-block">', '</div>');

        let tagElement = new DOMAppender('<span class="uk-badge uk-icon" uk-icon="icon: tag">', '</span>');
        container.append(tagElement);
        tagElement.appendString(tag.name);

        container.append(createTagDropdown(tag));

        return container;
    }

    function createTagDropdown(tag: TagRepository.Tag): DOMAppender {

        let content = new DOMAppender('<div>', '</div>');
        content.appendRaw(('<li>\n' +
            '    <a href="UserThreads" class="align-left">\n' +
            '        <span>Threads</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfThreads}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfThreads}', DisplayHelpers.intToString(tag.threadCount)));

        content.appendRaw(('<li>\n' +
            '    <a href="UserMessages" class="align-left">\n' +
            '        <span>Messages</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfMessages}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfMessages}', DisplayHelpers.intToString(tag.messageCount)));

        return Views.createDropdown(tag.name, content, {
            mode: 'hover',
        });
    }

    export class TagsPageContent {

        sortControls: HTMLElement;
        list: HTMLElement
    }

    export function createTagsPageContent(tags: TagRepository.Tag[], info: Views.SortInfo): TagsPageContent {

        let result = new TagsPageContent();

        let resultList = $("<div></div>");

        resultList.append(result.sortControls = createTagListSortControls(info));

        let tagsList = $('<div class="tags-list"></div>');
        resultList.append(tagsList);
        tagsList.append(this.createTagsList(tags));

        result.list = resultList[0];
        return result;
    }

    export function createTagsList(tags: TagRepository.Tag[]): HTMLElement {

        let tagsListGrid = new DOMAppender('<div class="uk-grid-match uk-text-center" uk-grid>', '</div>');

        for (let tag of tags)
        {
            if (null == tag) continue;

            tagsListGrid.append(createTagInList(tag));
        }

        return tagsListGrid.toElement();
    }

    function createTagListSortControls(info: Views.SortInfo): HTMLElement {

        return $('<div class="tags-list-header">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="order-by">\n' +
            '                Sort by:\n' +
            Views.createOrderByLabel('name', 'Name', info) +
            Views.createOrderByLabel('threadcount', 'Thread Count', info) +
            Views.createOrderByLabel('messagecount', 'Message Count', info) +
            '            </div>\n' +
            '            <div class="uk-float-right">\n' +
            '                <select class="uk-select" name="sortOrder">\n' +
            Views.createSortOrderOption('ascending', 'Ascending', info) +
            Views.createSortOrderOption('descending', 'Descending', info) +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </form>\n' +
            '</div>')[0];
    }

    function createTagInList(tag: TagRepository.Tag): DOMAppender {

        let result = new DOMAppender('<div>', '</div>');

        let card = new DOMAppender('<div class="uk-card uk-card-default uk-card-body">', '</div>');
        result.append(card);

        let wrapper = new DOMAppender('<div class="tag-in-list">', '</div>');
        card.append(wrapper);

        wrapper.append(createTagElement(tag));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a href="#">Threads</a></div>\n' +
            '    <div class="uk-float-right">{nrOfThreads}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfThreads}', DisplayHelpers.intToString(tag.threadCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left"><a href="#">Messages</a></div>\n' +
            '    <div class="uk-float-right">{nrOfMessages}</div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>').replace('{nrOfMessages}', DisplayHelpers.intToString(tag.messageCount)));

        wrapper.appendRaw(('<div>\n' +
            '    <div class="uk-float-left">Added</div>\n' +
            '    <div class="uk-float-right min-date">\n' +
            '        <span title="{AddedExpanded}" uk-tooltip>{AddedShort}</span>\n' +
            '    </div>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</div>')
            .replace('{AddedExpanded}', DisplayHelpers.getFullDateTime(tag.created))
            .replace('{AddedShort}', DisplayHelpers.getShortDate(tag.created)));

        return result;
    }
}
