import {ThreadMessageRepository} from "../services/threadMessageRepository";
import {DOMHelpers} from "../helpers/domHelpers";
import {Pages} from "../pages/common";
import {Views} from "./common";

export module ThreadMessagesView {

    import DOMAppender = DOMHelpers.DOMAppender;

    export function createRecentThreadMessagesView(messages: ThreadMessageRepository.ThreadMessage[]): HTMLElement {

        let result = new DOMAppender('<div>', '</div>');

        for (let message of messages) {

            if (null === message) continue;

            let element = new DOMAppender('<div class="recent-message">', '</div>');
            result.append(element);

            let user = new DOMAppender('<span class="author">', '</span>');
            element.append(user);

            let data = `data-threadusername="${DOMHelpers.escapeStringForAttribute(message.createdBy.name)}"`;
            let userLink = new DOMAppender(`<a href="${Pages.getThreadsOfUserUrlFull(message.createdBy)}" ${data}>`, '</a>');
            user.append(userLink);
            userLink.appendString(message.createdBy.name);

            let threadTitle = DOMHelpers.escapeStringForAttribute(message.parentThread.name);

            let threadLink = new DOMAppender(`<a class="recent-message-thread-link" title="${threadTitle}" uk-tooltip>`, '</a>');
            element.append(threadLink);
            threadLink.appendString(message.parentThread.name);

            let messageTitle = DOMHelpers.escapeStringForAttribute(message.content);

            let link = new DOMAppender(`<a class="recent-message-link" title="${messageTitle}" uk-tooltip>`, '</a>');
            element.append(link);
            link.appendString(message.content);
        }

        let resultElement = result.toElement();

        Views.setupThreadsOfUsersLinks(resultElement);

        return resultElement;
    }
}