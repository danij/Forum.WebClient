import {DOMHelpers} from "../helpers/domHelpers";
import {PageActions} from "../pages/action";
import {Views} from "./common";
import {EditViews} from "./edit";
import {Privileges} from "../services/privileges";
import {UserCache} from "../services/userCache";
import {PrivateMessageRepository} from "../services/privateMessageRepository";
import {ViewsExtra} from "./extra";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {UsersView} from "./usersView";

export module PrivateMessagesView {

    import cE = DOMHelpers.cE;
    import DOMAppender = DOMHelpers.DOMAppender;
    import dA = DOMHelpers.dA;
    import TabEntry = Views.TabEntry;

    export function displayPrivateMessages(privateMessagesCallback: PageActions.IPrivateMessageCallback,
                                           userCallback: PageActions.IUserCallback): Promise<void> {

        Views.clearActiveHeaderLinks();
        return Views.changeContent(document.getElementById('page-content-container'), () => {

            return createPrivateMessagesContent(privateMessagesCallback, userCallback)
        }, false);
    }

    async function createPrivateMessagesContent(privateMessagesCallback: PageActions.IPrivateMessageCallback,
                                                userCallback: PageActions.IUserCallback): Promise<HTMLElement> {

        const result = cE('div');

        const header = cE('h2');
        result.appendChild(header);
        header.innerText = 'Private Messages';

        var tabs: TabEntry[] = [
            {title: 'Received Messages', content: dA('<div class="received-messages">')},
            {title: 'Sent Messages', content: dA('<div class="sent-messages">')},
        ];

        const tabsElement = Views.createTabs(tabs, 0, 'center').toElement();
        result.appendChild(tabsElement);

        createPrivateMessagesTab(tabsElement.getElementsByClassName('received-messages')[0] as HTMLElement,
            privateMessagesCallback, 0,
            pageNumber => privateMessagesCallback.getReceivedPrivateMessages(pageNumber));

        createPrivateMessagesTab(tabsElement.getElementsByClassName('sent-messages')[0] as HTMLElement,
            privateMessagesCallback, 0,
            pageNumber => privateMessagesCallback.getSentPrivateMessages(pageNumber));

        const privateMessageControl = createNewPrivateMessageControl(privateMessagesCallback);

        result.appendChild(privateMessageControl);
        return result;
    }

    function createPrivateMessagesTab(container: HTMLElement, privateMessagesCallback: PageActions.IPrivateMessageCallback,
        currentPage: number,
        getMessages: (pageNumber: number) => Promise<PrivateMessageRepository.PrivateMessageCollection>): Promise<void> {

        return Views.changeContent(container, async () => {

            const result = cE('div');

            const collection = await getMessages(currentPage);

            let messages = collection.messages || [];

            if (messages.length < 1) {

                result.appendChild(DOMHelpers.parseHTML('<span class="uk-text-warning">No messages found</span>'));
                return result;
            }

            result.appendChild(Views.createPaginationControl(collection, 'private messages',
                (value: number) => createPrivateMessagesTab(container, privateMessagesCallback,
                    value, getMessages),
                (pageNumber: number) => '#'));

            result.appendChild(await createPrivateMessageList(messages, privateMessagesCallback));

            result.appendChild(Views.createPaginationControl(collection, 'private messages',
                (value: number) => createPrivateMessagesTab(container, privateMessagesCallback,
                    value, getMessages),
                (pageNumber: number) => '#'));

            return result;
        });
    }

    async function createPrivateMessageList(messages: PrivateMessageRepository.PrivateMessage[],
                                            privateMessagesCallback: PageActions.IPrivateMessageCallback): Promise<HTMLElement> {

        const result = dA('<div class="uk-container uk-container-expand">');

        const allMessages = messages
            .filter(m => m)
            .map(m => m.content);
        await ViewsExtra.searchUsersById(allMessages);

        for (let i = 0; i < messages.length; ++i) {

            const message = messages[i];

            const messageContainer = dA('<div class="uk-card uk-card-body private-message">');
            result.append(messageContainer);

            messageContainer.append(createPrivateMessageDetails(message));

            const flexContainer = dA('<div class="uk-flex">');
            messageContainer.append(flexContainer);

            flexContainer.append(createPrivateMessageAuthor(message));
            flexContainer.append(createPrivateMessageContent(message));
            flexContainer.append(createPrivateMessageActionLinks(message));

            result.appendRaw('<hr class="uk-divider-icon" />');
        }

        const element = result.toElement();

        ViewsExtra.adjustMessageContent(element);
        Views.setupSubscribedThreadsOfUsersLinks(element);
        Views.setupThreadMessagesOfUsersLinks(element);
        Views.setupAttachmentsAddedByUserLinks(element);

        setupPrivateMessageActionEvents(element, privateMessagesCallback);

        return element;
    }

    function createPrivateMessageDetails(message: PrivateMessageRepository.PrivateMessage) {

        const messageDetailsContainer = dA(`<div class="uk-card-badge message-time-container" uk-no-boot>`);
        messageDetailsContainer.appendRaw(`<span class="message-time">${DisplayHelpers.getDateTime(message.created)} </span>`);

        if (message.ip && message.ip.length) {

            messageDetailsContainer.appendRaw(`<samp>${DOMHelpers.escapeStringForContent(message.ip)}</samp>`);
        }

        return messageDetailsContainer;
    }

    function createPrivateMessageContent(message: PrivateMessageRepository.PrivateMessage): DOMAppender {

        const content = dA(`<div class="message-content render-math uk-flex-1">`);
        content.appendRaw(ViewsExtra.expandContent(message.content));

        return content;
    }

    function createPrivateMessageActionLinks(message: PrivateMessageRepository.PrivateMessage): DOMAppender {

        const actions = dA('<div class="message-actions">');
        const messageId = DOMHelpers.escapeStringForAttribute(message.id);

        const replyTo = (message.source || message.destination).name;

        actions.appendRaw(`<a uk-icon="icon: reply" class="reply-private-message-link" title="Reply" data-reply-to="${DOMHelpers.escapeStringForAttribute(replyTo)}" uk-tooltip></a>`);
        actions.appendRaw(`<a uk-icon="icon: trash" class="delete-private-message-link" title="Delete message" data-message-id="${DOMHelpers.escapeStringForAttribute(messageId)}" uk-tooltip></a>`);

        return actions;
    }

    function createPrivateMessageAuthor(message: PrivateMessageRepository.PrivateMessage): DOMAppender {

        const author = message.source || message.destination;
        const authorContainer = dA('<div class="message-author">');
        {
            const userContainer = dA('<div class="pointer-cursor">');
            authorContainer.append(userContainer);

            userContainer.append(UsersView.createUserLogoForList(author));

            const usernameElement = UsersView.createUserNameElement(author, '');

            userContainer.append(usernameElement);

            userContainer.append(UsersView.createUserTitleElement(author, false));
        }
        {
            authorContainer.append(UsersView.createUserDropdown(author, 'user-info', 'bottom-left'));
        }
        return authorContainer;
    }

    function setupPrivateMessageActionEvents(element: HTMLElement,
                                             privateMessagesCallback: PageActions.IPrivateMessageCallback) {

        DOMHelpers.addEventListeners(element, 'reply-private-message-link', 'click', async (ev) => {

            const replyTo = DOMHelpers.getLink(ev).getAttribute('data-reply-to');

            const destinationInput = document.getElementById('private-message-destination') as HTMLInputElement;

            if (destinationInput.value == replyTo) {

                destinationInput.scrollIntoView();
                return;
            }

            if (destinationInput.value && (! EditViews.confirm(`You are writing a message to another user. Override with ${replyTo}?`))) {

                return;
            }

            destinationInput.value = replyTo;
            destinationInput.scrollIntoView();
        });

        DOMHelpers.addEventListeners(element, 'delete-private-message-link', 'click', async (ev) => {

            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');

            if (EditViews.confirm('Are you sure you want to delete the selected message?')) {

                if (await privateMessagesCallback.deletePrivateMessage(messageId)) {

                    const messageElement = DOMHelpers.goUpUntil(ev.target as HTMLElement, e => e.classList.contains('private-message'));
                    if (messageElement) {

                        const separator = messageElement.nextSibling as HTMLElement;
                        if (separator && separator.tagName.toLowerCase() == 'hr') {

                            separator.remove();
                        }
                        messageElement.remove();
                    }
                }
            }
        });
    }

    async function getRecipientId(name: string): Promise<string> {

        await UserCache.searchNames([name]);

        return UserCache.getIdByName(name);
    }

    function createNewPrivateMessageControl(privateMessagesCallback: PageActions.IPrivateMessageCallback): HTMLElement {

        const result = cE('div');
        DOMHelpers.addClasses(result, 'new-message-container');

        if (Privileges.ForumWide.canSendPrivateMessages()) {

            const destinationContainer = cE('div');
            result.appendChild(destinationContainer);
            DOMHelpers.addClasses(destinationContainer, 'message-destination-container');

            const label = DOMHelpers.parseHTML('<label for="private-message-destination">Send a new message to:</label>');
            destinationContainer.appendChild(label);

            const destinationInput = DOMHelpers.parseHTML('<input id="private-message-destination" type="text" class="uk-input uk-form-width-large">') as HTMLInputElement;
            destinationContainer.appendChild(destinationInput);

            const editControl = new EditViews.EditControl(result);

            const button = cE('button');
            result.appendChild(button);
            DOMHelpers.addClasses(button, 'uk-button', 'uk-button-primary', 'uk-align-center');
            button.innerText = 'Send Message';

            Views.onClick(button, async () => {

                const destinationUserName = destinationInput.value.trim();

                if (destinationUserName.length < 1) {

                    Views.showWarningNotification('Recipient not specified.');
                    return;
                }

                const destinationUserId = await getRecipientId(destinationUserName);

                if ( ! destinationUserId) {

                    Views.showWarningNotification(`Unknown recipient: ${destinationUserName}`);
                    return;
                }

                const text = (await editControl.getText()).trim();
                if (text.length < 1) {

                    Views.showWarningNotification('Message not specified.');
                    return;
                }

                const min = Views.DisplayConfig.privateMessageContentLengths.min;
                const max = Views.DisplayConfig.privateMessageContentLengths.max;

                if (text.length < min) {

                    Views.showWarningNotification(`Message must be at least ${min} characters long.`);
                    return;
                }
                if (text.length > max) {

                    Views.showWarningNotification(`Message must be less than ${max} characters long.`);
                    return;
                }

                if (await privateMessagesCallback.sendPrivateMessage(destinationUserId, text)) {

                    Views.showSuccessNotification('Message sent.');
                }
            })
        }
        else {

            result.appendChild(DOMHelpers.parseHTML('<span class="uk-align-center uk-text-center uk-alert">Insufficient privileges to send private messages.</span>'));
        }

        return result;
    }
}