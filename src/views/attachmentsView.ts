import {Views} from "./common";
import {PageActions} from "../pages/action";
import {UsersView} from "./usersView";
import {DOMHelpers} from "../helpers/domHelpers";
import {UserRepository} from "../services/userRepository";
import {AttachmentsRepository} from "../services/attachmentsRepository";
import {DisplayHelpers} from "../helpers/displayHelpers";
import {Pages} from "../pages/common";
import {Privileges} from "../services/privileges";
import {EditViews} from "./edit";
import {ThreadMessageRepository} from "../services/threadMessageRepository";

export module AttachmentsView {

    import cE = DOMHelpers.cE;
    import dA = DOMHelpers.dA;
    import DOMAppender = DOMHelpers.DOMAppender;

    export interface AttachmentsPageDisplayInfo extends Views.SortInfo {

        user?: UserRepository.User
    }

    export class AttachmentsPageContent {

        sortControls: HTMLElement;
        paginationTop: HTMLElement;
        paginationBottom: HTMLElement;
        list: HTMLElement;
    }

    export async function createAttachmentsPageContent(collection: AttachmentsRepository.AttachmentCollection,
                                                       info: AttachmentsPageDisplayInfo,
                                                       onPageNumberChange: Views.PageNumberChangeCallback,
                                                       getLinkForPage: Views.GetLinkForPageCallback,
                                                       attachmentCallback: PageActions.IAttachmentCallback,
                                                       userCallback: PageActions.IUserCallback,
                                                       privilegesCallback: PageActions.IPrivilegesCallback): Promise<AttachmentsPageContent> {

        collection = collection || AttachmentsRepository.defaultAttachmentCollection();

        const result = new AttachmentsPageContent();

        const resultList = cE('div');

        if (info.user) {

            resultList.appendChild(UsersView.createUserPageHeader(info.user, userCallback, privilegesCallback));
        }
        else {

            const header = cE('h2');
            header.innerText = 'All Attachments';
            resultList.appendChild(header);
        }
        resultList.appendChild(result.sortControls = createThreadMessageListSortControls(info));

        resultList.appendChild(result.paginationTop =
            Views.createPaginationControl(collection, 'attachments', onPageNumberChange, getLinkForPage));

        const listContainer = cE('div');
        DOMHelpers.addClasses(listContainer, 'attachments-table');
        listContainer.appendChild(await createAttachmentsTable(collection, attachmentCallback));
        resultList.appendChild(listContainer);

        resultList.appendChild(result.paginationBottom =
            Views.createPaginationControl(collection, 'attachments', onPageNumberChange, getLinkForPage));

        result.list = resultList;

        return result;
    }

    function createThreadMessageListSortControls(info: Views.SortInfo): HTMLElement {

        return DOMHelpers.parseHTML('<div class="attachments-table-header">\n' +
            '    <form>\n' +
            '        <div class="uk-grid-small uk-child-width-auto uk-grid">\n' +
            '            <div class="order-by">\n' +
            '                Sort by:\n' +
            Views.createOrderByLabel('name', 'Name', info) +
            Views.createOrderByLabel('created', 'Created', info) +
            Views.createOrderByLabel('size', 'Size', info) +
            Views.createOrderByLabel('approval', 'Approval', info) +
            '            </div>\n' +
            '            <div class="uk-float-right">\n' +
            '                <select class="uk-select" name="sortOrder">\n' +
            Views.createSortOrderOption('ascending', 'Ascending', info) +
            Views.createSortOrderOption('descending', 'Descending', info) +
            '                </select>\n' +
            '            </div>\n' +
            '        </div>\n' +
            '    </form>\n' +
            '</div>');
    }

    export function createAttachmentsTable(collection: AttachmentsRepository.AttachmentCollection,
                                                 callback: PageActions.IAttachmentCallback): HTMLElement {

        const attachments = collection.attachments || [];

        if (attachments.length < 1) {

            return DOMHelpers.parseHTML('<span class="uk-text-warning">No attachments found</span>');
        }

        const table = dA('<table class="uk-table uk-table-divider uk-table-middle">');

        const tableHeader = '<thead>\n' +
            '    <tr>\n' +
            '        <th class="uk-table-expand">Attachment</th>\n' +
            '        <th class="uk-text-right">Size</th>\n' +
            '        <th class="uk-text-center">Added</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">By</th>\n' +
            '        <th class="uk-text-center uk-table-shrink">Statistics</th>\n' +
            '        <th class="uk-text-right">Actions</th>\n' +
            '    </tr>\n' +
            '</thead>';
        table.appendRaw(tableHeader);

        const tbody = dA('<tbody>');
        table.append(tbody);

        const attachmentsById = {};

        for (let i = 0; i < attachments.length; ++i) {

            const attachment = attachments[i];
            if (! attachment) continue;

            attachmentsById[attachment.id] = attachment;

            const row = dA('<tr>');
            tbody.append(row);

            {
                const nameColumn = dA('<td class="uk-table-expand">');
                row.append(nameColumn);

                const attachmentLink = createAttachmentLink(attachment);
                nameColumn.append(attachmentLink);
            }
            {
                const sizeColumn = dA('<td class="attachment-size uk-text-right">');
                row.append(sizeColumn);

                sizeColumn.appendRaw(('{Size}<div class="uk-text-meta">bytes</div>')
                    .replace('{Size}', DisplayHelpers.intToString(attachment.size)));
            }
            {
                const createdColumn = dA('<td class="attachment-created uk-text-center">');
                row.append(createdColumn);

                createdColumn.appendRaw(('<div class="uk-text-meta">\n' +
                    '    <span>{Added}</span>\n' +
                    '</div>')
                    .replace('{Added}', DisplayHelpers.getDateTime(attachment.created)));
            }
            {
                const createdByColumn = dA('<td class="uk-text-center uk-table-shrink">');
                row.append(createdByColumn);

                createdByColumn.append(UsersView.createAuthorSmall(attachment.createdBy));

                if (attachment.ip && attachment.ip.length) {

                    createdByColumn.appendRaw(`<div><samp>${DOMHelpers.escapeStringForContent(attachment.ip)}</samp></div>`);
                }
            }
            {
                const statisticsColumn = ('<td class="attachment-statistics uk-table-shrink">\n' +
                    '    <table>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfDownloads}</td>\n' +
                    '            <td class="spaced-number uk-text-left uk-text-meta">downloads</td>\n' +
                    '        </tr>\n' +
                    '        <tr>\n' +
                    '            <td class="spaced-number uk-text-right">{nrOfMessages}</td>\n' +
                    '            <td class="spaced-number uk-text-left uk-text-meta">messages</td>\n' +
                    '        </tr>\n' +
                    '    </table>\n' +
                    '</td>')
                    .replace('{nrOfDownloads}', DisplayHelpers.intToString(attachment.nrOfGetRequests))
                    .replace('{nrOfMessages}', DisplayHelpers.intToString(attachment.nrOfMessagesAttached));
                row.appendRaw(statisticsColumn);
            }
            {
                const actionsColumn = dA('<td class="attachment-actions uk-text-right">');
                row.append(actionsColumn);

                if (Privileges.Attachment.canEditAttachmentApproval(attachment)) {

                    actionsColumn.appendRaw(`<a uk-icon="icon: check" class="approve-attachment-link" title="Approve attachment" data-attachment-id="${attachment.id}" uk-tooltip></a>`);
                    actionsColumn.appendRaw(`<a uk-icon="icon: ban" class="unapprove-attachment-link" title="Unapprove attachment" data-attachment-id="${attachment.id}" uk-tooltip></a>`);
                }

                if (Privileges.Attachment.canEditAttachmentName(attachment)) {

                    actionsColumn.appendRaw(`<a uk-icon="icon: file-edit" class="edit-attachment-name-link" title="Edit attachment name" data-attachment-id="${attachment.id}" uk-tooltip></a>`);
                }

                if (Privileges.Attachment.canDeleteAttachment(attachment)) {

                    actionsColumn.appendRaw(`<a uk-icon="icon: trash" class="delete-attachment-link" title="Delete attachment" data-attachment-id="${attachment.id}" uk-tooltip></a>`);
                }
            }
        }

        const result = table.toElement();

        setupAttachmentActionEvents(result, attachmentsById, callback);

        Views.setupThreadsOfUsersLinks(result);
        Views.markElementForAnimatedDisplay(result, '.threads-table tbody');

        return result;
    }

    function createAttachmentLink(attachment: AttachmentsRepository.Attachment, asButtonLink: boolean = true): DOMAppender {

        const href = Pages.getAttachmentDownloadUrl(attachment.id);

        let classes = asButtonLink ? 'uk-button uk-button-text ' : '';
        if ( ! attachment.approved) {

            classes = classes + 'unapproved ';
        }

        const result = dA(`<a class="${classes}attachment-name" href="${href}" target="_blank">`);
        result.appendString(attachment.name);

        return result;
    }

    export function setupAttachmentActionEvents(element: HTMLElement, attachmentsById,
                                                callback: PageActions.IAttachmentCallback): void {

        function getAttachmentElement(ev: Event): HTMLElement {

            const row = DOMHelpers.goUpUntilTag(ev.target as HTMLElement, 'tr');
            if (row) {

                return row;
            }

            return DOMHelpers.goUpUntilTag(ev.target as HTMLElement, 'li');
        }

        function getAttachmentNameElement(ev: Event): HTMLElement {

            const attachmentElement = getAttachmentElement(ev);

            return attachmentElement.getElementsByClassName('attachment-name')[0] as HTMLElement;
        }

        DOMHelpers.addEventListeners(element, 'approve-attachment-link', 'click', async (ev) => {

            const attachmentId = DOMHelpers.getLink(ev).getAttribute('data-attachment-id');
            const attachment = attachmentsById[attachmentId];

            if (attachment.approved) return;

            if (await callback.approve(attachmentId)) {

                attachment.approved = true;

                DOMHelpers.removeClasses(getAttachmentNameElement(ev), 'unapproved');
            }
        });

        DOMHelpers.addEventListeners(element, 'unapprove-attachment-link', 'click', async (ev) => {

            const attachmentId = DOMHelpers.getLink(ev).getAttribute('data-attachment-id');
            const attachment = attachmentsById[attachmentId];

            if ( ! attachment.approved) return;

            if (await callback.unapprove(attachmentId)) {

                attachment.approved = false;

                DOMHelpers.addClasses(getAttachmentNameElement(ev), 'unapproved');
            }
        });

        DOMHelpers.addEventListeners(element, 'edit-attachment-name-link', 'click', async (ev) => {

            const attachmentId = DOMHelpers.getLink(ev).getAttribute('data-attachment-id');
            const attachment = attachmentsById[attachmentId];

            const newName = (EditViews.getInput('Please enter the new attachment name', attachment.name) || '').trim();

            if (newName.length && newName != attachment.name) {

                const min = Views.DisplayConfig.attachmentNameLengths.min;
                const max = Views.DisplayConfig.attachmentNameLengths.max;

                if (newName.length < min) {

                    Views.showWarningNotification(`Attachment name must be at least ${min} characters long.`);
                    return;
                }
                if (newName.length > max) {

                    Views.showWarningNotification(`Attachment name must be less than ${max} characters long.`);
                    return;
                }

                if (await callback.editAttachmentName(attachmentId, newName)) {

                    attachment.name = newName;
                    getAttachmentNameElement(ev).innerText = newName;
                }
            }
        });

        DOMHelpers.addEventListeners(element, 'delete-attachment-link', 'click', async (ev) => {

            const attachmentId = DOMHelpers.getLink(ev).getAttribute('data-attachment-id');

            if (EditViews.confirm('Are you sure you want to delete the selected attachment?')) {

                if (await callback.deleteAttachment(attachmentId)) {

                    getAttachmentElement(ev).remove();
                }
            }
        });

        DOMHelpers.addEventListeners(element, 'remove-attachment-from-message-link', 'click', async (ev) => {

            const attachmentId = DOMHelpers.getLink(ev).getAttribute('data-attachment-id');
            const messageId = DOMHelpers.getLink(ev).getAttribute('data-message-id');

            if (EditViews.confirm('Are you sure you want to remove the selected attachment from the message?')) {

                if (await callback.removeAttachmentFromMessage(attachmentId, messageId)) {

                    getAttachmentElement(ev).remove();
                }
            }
        });
    }

    export function createAttachmentsOfMessageList(attachments: AttachmentsRepository.Attachment[],
                                                   message: ThreadMessageRepository.ThreadMessage): DOMAppender {

        attachments.sort((first, second) => {

            return first.name.toLocaleLowerCase().localeCompare(second.name.toLocaleLowerCase());
        });

        const result = dA('<ul class="attachments">');

        for (let attachment of attachments) {

            const item = dA('<li class="attachment">');
            result.append(item);

            const flexContainer = dA('<div class="uk-flex">');
            item.append(flexContainer);

            const mainContainer = dA('<div class="uk-flex-1">');
            flexContainer.append(mainContainer);
            {
                const nameContainer = dA('span');
                mainContainer.append(nameContainer);

                const attachmentLink = createAttachmentLink(attachment, false);
                nameContainer.append(attachmentLink);
            }
            {
                const detailsContainer = dA('div');
                mainContainer.append(detailsContainer);

                detailsContainer.appendRaw(('{Size} <span class="uk-text-meta">bytes</span>')
                    .replace('{Size}', DisplayHelpers.intToString(attachment.size)));

                detailsContainer.appendRaw(' · <span class="uk-text-meta">{Added}</span>'
                    .replace('{Added}', DisplayHelpers.getDateTime(attachment.created)));

                if (attachment.createdBy.id != message.createdBy.id) {

                    detailsContainer.appendString(' · ');
                    detailsContainer.append(UsersView.createAuthorSmall(attachment.createdBy));
                }
            }
            {
                const actionsContainer = dA('<div class="attachment-actions">');

                let showAttachmentActions = false;

                if (Privileges.Attachment.canEditAttachmentApproval(attachment)) {

                    actionsContainer.appendRaw(`<a uk-icon="icon: check" class="approve-attachment-link" title="Approve attachment" data-attachment-id="${attachment.id}" uk-tooltip></a>`);
                    actionsContainer.appendRaw(`<a uk-icon="icon: ban" class="unapprove-attachment-link" title="Unapprove attachment" data-attachment-id="${attachment.id}" uk-tooltip></a>`);
                    showAttachmentActions = true;
                }

                if (Privileges.Attachment.canEditAttachmentName(attachment)) {

                    actionsContainer.appendRaw(`<a uk-icon="icon: file-edit" class="edit-attachment-name-link" title="Edit attachment name" data-attachment-id="${attachment.id}" uk-tooltip></a>`);
                    showAttachmentActions = true;
                }

                if (Privileges.Attachment.canRemoveAttachmentFromMessage(attachment, message)) {

                    actionsContainer.appendRaw(`<a uk-icon="icon: close" class="remove-attachment-from-message-link" title="Remove attachment from message" data-attachment-id="${attachment.id}" data-message-id="${message.id}" uk-tooltip></a>`);
                    showAttachmentActions = true;
                }

                if (Privileges.Attachment.canDeleteAttachment(attachment)) {

                    actionsContainer.appendRaw(`<a uk-icon="icon: trash" class="delete-attachment-link" title="Delete attachment" data-attachment-id="${attachment.id}" uk-tooltip></a>`);
                    showAttachmentActions = true;
                }
                if (showAttachmentActions) {

                    flexContainer.append(actionsContainer);
                }
            }
        }

        return result;
    }
}