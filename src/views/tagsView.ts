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
            '</li>').replace('{nrOfThreads}', DisplayHelpers.formatNumberForStatistics(tag.threadCount))));

        content.append($(('<li>\n' +
            '    <a href="UserMessages" class="align-left">\n' +
            '        <span>Messages</span>\n' +
            '    </a>\n' +
            '    <span class="uk-badge align-right">{nrOfMessages}</span>\n' +
            '    <div class="uk-clearfix"></div>\n' +
            '</li>').replace('{nrOfMessages}', DisplayHelpers.formatNumberForStatistics(tag.messageCount))));

        return Views.createDropdown(tag.name, content, {
            mode: 'hover',
        });
    }
}
