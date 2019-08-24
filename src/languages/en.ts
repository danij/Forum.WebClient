export function load(languages: any, languageEntries: any[]) {
    languageEntries.push({
        'id': 'en',
        'name': 'English'
    });
    languages['en'] = {
        '(an existing attachment id can also be pasted)': '(an existing attachment id can also be pasted)',
        'ATTACHMENTS_BY': u => `Attachments added by ${u}`,
        'ATTACHMENTS_MAX_LENGTH': n => `Attachment name must be less than ${n} characters long.`,
        'ATTACHMENTS_MIN_LENGTH': n => `Attachment name must be at least ${n} characters long.`,
        'Actions': 'Actions',
        'Activity': 'Activity',
        'Add Attachment': 'Add Attachment',
        'Add Category': 'Add Category',
        'Add Comment': 'Add Comment',
        'Add Message': 'Add Message',
        'Add Root Category': 'Add Root Category',
        'Add Sub Category': 'Add Sub Category',
        'Add Tag': 'Add Tag',
        'Add Thread': 'Add Thread',
        'Add a New Thread': 'Add a New Thread',
        'Add attachment': 'Add attachment',
        'Add code': 'Add code',
        'Add horizontal rule': 'Add horizontal rule',
        'Add image reference': 'Add image reference',
        'Add link': 'Add link',
        'Add list': 'Add list',
        'Add math': 'Add math',
        'Add new tag...': 'Add new tag...',
        'Add table': 'Add table',
        'Add': 'Add',
        'Added': 'Added',
        'Adjust Privileges': 'Adjust Privileges',
        'All Attachments': 'All Attachments',
        'All Thread Message Comments': 'All Thread Message Comments',
        'Already Uploaded': 'Already Uploaded',
        'Approval': 'Approval',
        'Approve Content': 'Approve Content',
        'Approve Thread': 'Approve Thread',
        'Approve attachment': 'Approve attachment',
        'Are you sure you want to delete the selected message?': 'Are you sure you want to delete the selected message?',
        'Ascending': 'Ascending',
        'Attachment Count': 'Attachment Count',
        'Attachment Quota': 'Attachment Quota',
        'Attachment Total Size': 'Attachment Total Size',
        'Attachment': 'Attachment',
        'Attachments': 'Attachments',
        'Auto Approve Attachment': 'Auto Approve Attachment',
        'Auto Approve Message': 'Auto Approve Message',
        'Auto Approve Thread': 'Auto Approve Thread',
        'By': 'By',
        'CANNOT_FIND_USER': u => `Cannot find user with name: ${u}`,
        'CATEGORIES_COUNT': n => `${n} categories`,
        'CONFIRM_DELETE_CATEGORY': name => `Are you sure you want to delete the following category: ${name}?`,
        'CONFIRM_DELETE_SELECTED_ATTACHMENT': 'Are you sure you want to delete the selected attachment?',
        'CONFIRM_DELETE_SELECTED_ATTACHMENT_FROM_MESSAGE': 'Are you sure you want to remove the selected attachment from the message?',
        'CONFIRM_DELETE_TAG': m => `Are you sure you want to delete the following tag: ${m}?`,
        'CONFIRM_DELETE_USER': u => `Are you sure you want to delete the user "${u}"?`,
        'CONFIRM_DELETE_USER_LOGO': u => `Are you sure you want to delete ${u}'s logo?`,
        'CONFIRM_PRIVATE_MESSAGE_OVERRIDE': m => `You are writing a message to another user. Override with ${m}?`,
        'CONFIRM_THREAD_DELETION': t => `Are you sure you want to delete the following thread: ${t}?`,
        'CONSENT_AGREE_COOKIES': 'I agree to the website storing the above required cookies in my browser.',
        'CONSENT_AGREE_LINKED_CONTENT': 'I agree to the website automatically loading externally linked content.',
        'CONSENT_EXTERNAL_CANNOT_CONTROL': 'Because the forum cannot control and is not responsible for other sites (how they track your visit, what cookies they use, what ads they display, etc.) it disables loading such images/videos automatically.',
        'CONSENT_EXTERNAL_EXPRESS_CONSENT': "If you don't mind loading the images/videos automatically, you can express your consent below.",
        'CONSENT_EXTERNAL_INCLUDE': 'Messages on the forum can include images or videos stored on external sites.',
        'CONSENT_Needs3rdPartyCookies': 'This website needs to store the following third-party <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies">HTTP cookies</a> in your browser in order to function property.',
        'CONSENT_NeedsCookies': 'This website needs to store the following first-party <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies">HTTP cookies</a> in your browser in order to function property.',
        'CONSENT_ProtectsCSRF': 'Protects against <a href="https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)">Cross-Site Request Forgery</a> attacks.',
        'COOKIE_DISPLAY_ONLINE_USER': 'Stores whether to display the user name you are logged in with in the list of online users.',
        'COOKIE_RECAPTCHA': 'Using Google reCAPTCHA to check that account registration/forgot password operations are not performed by a robot.',
        'COOKIE_REMEMBER_LOGIN': 'Remembers who you are logged in as so that you do not have to log in every time you reload the page.',
        'COOKIE_REMEMBER_PROVIDER': 'Remembers the type of provider you have authenticated with.',
        'COOKIE_URL_AFTER_LOGIN': 'Temporarily stores the url to which to redirect after logging in.',
        'COULD_NOT_ASSIGN_PRIVILEGE': m => `Could not assign privilege: ${m}`,
        'CREATE_USER_CONSENT_REQUIRED': 'Consent for storing cookies is required to be able to register.',
        'CREATE_USER_CanContain': 'Can contain whitespace (<code> </code>), underscore (<code>_</code>) or hyphen (<code>-</code>)',
        'CREATE_USER_NoUserFound': 'You have logged in but have not chosen a user name yet. The user name is displayed along side all the content created by you on the site.',
        'CREATE_USER_PP_TOS_NOT_ACCEPTED': 'Cannot register if the Privacy Policy and Terms of Service are not accepted',
        'Cancel': 'Cancel',
        'Category Required Levels': 'Category Required Levels',
        'Category': 'Category',
        'Change Any Attachment Approval': 'Change Any Attachment Approval',
        'Change Any Attachment Name': 'Change Any Attachment Name',
        'Change Any User Attachment Quota': 'Change Any User Attachment Quota',
        'Change Any User Info': 'Change Any User Info',
        'Change Any User Logo': 'Change Any User Logo',
        'Change Any User Name': 'Change Any User Name',
        'Change Any User Signature': 'Change Any User Signature',
        'Change Any User Title': 'Change Any User Title',
        'Change Approval': 'Change Approval',
        'Change Content': 'Change Content',
        'Change Description': 'Change Description',
        'Change Displayorder': 'Change Displayorder',
        'Change Name': 'Change Name',
        'Change Own Attachment Name': 'Change Own Attachment Name',
        'Change Own User Info': 'Change Own User Info',
        'Change Own User Logo': 'Change Own User Logo',
        'Change Own User Name': 'Change Own User Name',
        'Change Own User Signature': 'Change Own User Signature',
        'Change Own User Title': 'Change Own User Title',
        'Change Parent': 'Change Parent',
        'Change Password': 'Change Password',
        'Change Pin Display Order': 'Change Pin Display Order',
        'Change Reason:': 'Change Reason:',
        'Click to down vote message.': 'Click to down vote message.',
        'Click to reset vote.': 'Click to reset vote.',
        'Click to up vote message.': 'Click to up vote message.',
        'Comment sent!': 'Comment sent!',
        'Commented Messages': 'Commented Messages',
        'Consent Required': 'Consent Required',
        'Consent': 'Consent',
        'Cookies': 'Cookies',
        'Could not load documentation:': m => `Could not load documentation: ${m}`,
        'Create Attachment': 'Create Attachment',
        'Create User Name': 'Create User Name',
        'Create account': 'Create account',
        'Create new account': 'Create new account',
        'Create': 'Create',
        'Created': 'Created',
        'Dark Theme': 'Dark Theme',
        'Default Theme': 'Default Theme',
        'Delete Any Attachment': 'Delete Any Attachment',
        'Delete Any User Logo': 'Delete Any User Logo',
        'Delete Any User': 'Delete Any User',
        'Delete Own Attachment': 'Delete Own Attachments',
        'Delete Own User Logo': 'Delete Own User Logo',
        'Delete attachment': 'Delete attachment',
        'Delete message': 'Delete message',
        'Delete tag': 'Delete tag',
        'Delete thread': 'Delete thread',
        'Delete': 'Delete',
        'Descending': 'Descending',
        'Description': 'Description',
        'Displayed under:': 'Displayed under:',
        'Documentation': 'Documentation',
        'Domain': 'Domain',
        'Down Vote': 'Down Vote',
        'Down votes': 'Down votes',
        'Drop attachment here or': 'Drop attachment here or',
        'Duration cannot be negative!': 'Duration cannot be negative!',
        'Duration': 'Duration',
        'EDITED_AT': d => `Edited ${d}`,
        'Edit Message': 'Edit Message',
        'Edit attachment name': 'Edit attachment name',
        'Edit attachment quota': 'Edit attachment quota',
        'Edit category description': 'Edit category description',
        'Edit category display order': 'Edit category display order',
        'Edit category name': 'Edit category name',
        'Edit category parent': 'Edit category parent',
        'Edit category tags': 'Edit category tags',
        'Edit info': 'Edit info',
        'Edit message content': 'Edit message content',
        'Edit name': 'Edit name',
        'Edit signature': 'Edit signature',
        'Edit tag name': 'Edit tag name',
        'Edit thread display order when pinned': 'Edit thread display order when pinned',
        'Edit thread name': 'Edit thread name',
        'Edit thread tags': 'Edit thread tags',
        'Edit title': 'Edit title',
        'Edit user attachment quota': 'Edit user attachment quota',
        'Edit user info': 'Edit user info',
        'Edit user name': 'Edit user name',
        'Edit user signature': 'Edit user signature',
        'Edit user title': 'Edit user title',
        'Edit': 'Edit',
        'Embed YouTube': 'Embed YouTube',
        'Enter the new category name': 'Enter the new category name',
        'Enter the new sub category name': 'Enter the new sub category name',
        'Enter the new tag name': 'Enter the new tag name',
        'Error uploading file:': m => `Error uploading file: ${m}`,
        'Error while rendering': 'Error while rendering',
        'External Images/Videos': 'External Images/Videos',
        'Feedback Received': 'Feedback Received',
        'Filter...': 'Filter...',
        'Flag & comment': 'Flag & comment',
        'Forgot the password?': 'Forgot the password?',
        'Forum Wide Privileges': 'Forum Wide Privileges',
        'Forum Wide Required Levels': 'Forum Wide Required Levels',
        'Forum Wide': 'Forum Wide',
        'From': 'From',
        'Go to latest visited page': 'Go to latest visited page',
        'Go to message': 'Go to message',
        'Granted Category Levels': 'Granted Category Levels',
        'Granted Forum Wide Levels': 'Granted Forum Wide Levels',
        'Granted Levels (Expired)': 'Granted Levels (Expired)',
        'Granted Levels': 'Granted Levels',
        'Granted Tag Levels': 'Granted Tag Levels',
        'Granted Thread Levels': 'Granted Thread Levels',
        'Granted': 'Granted',
        'Home': 'Home',
        'I agree to the Privacy Policy and Terms of Service': 'I agree to the Privacy Policy and Terms of Service',
        'I am at least {age} years old': 'I am at least {age} years old',
        'INSUFFICIENT_PRIVILEGES_THREAD_ADD_MESSAGE': 'Insufficient privileges to add a new message to this thread.',
        'Individual Thread Message': 'Individual Thread Message',
        'Insufficient privileges to create new attachments': 'Insufficient privileges to create new attachments',
        'Insufficient privileges to send private messages.': 'Insufficient privileges to send private messages.',
        'Invalid email address!': 'Invalid email address!',
        'Invalid embed code.': 'Invalid embed code.',
        'Joined': 'Joined',
        'LAST_EDITED_BY_REASON': (u, r) => `Last edited by ${u}: ${r}`,
        'LOGIN': 'LOGIN',
        'LOGIN_ACCEPT_PP_TOS': 'Cannot log in or reset the password without accepting the privacy policy and terms of service',
        'LOGIN_Agree': 'I agree to the <a class="privacy-link">Privacy Policy</a> and <a class="tos-link">Terms of Service</a>',
        'LOGIN_CONSENT_REQUIRED': 'Consent for storing cookies is required to be able to log in.',
        'LOGIN_DisplayInOnlineUsersList': 'Display my user name in the public list of <emph>online users</emph>',
        'Last Seen': 'Last Seen',
        'Last seen': 'Last seen',
        'Latest Message Added': 'Latest Message Added',
        'Latest Message': 'Latest Message',
        'Level': 'Level',
        'Log in': 'Log in',
        'Login': 'Login',
        'Logout': 'Logout',
        'MESSAGE_COMMENTS_BY': u => `Message comments added by ${u}`,
        'MESSAGE_COUNT': n => `${n} messages`,
        'MESSAGE_MAX_LENGTH': n => `Message must be less than ${n} characters long.`,
        'MESSAGE_MIN_LENGTH': n => `Message must be at least ${n} characters long.`,
        'MESSAGE_NOT_YET_APPROVED': 'Not yet approved. Message is only visible to the author and privileged users.',
        'MINIMUM_AGE_NOT_MET': 'You do not have the minimum age required to register on this site.',
        'Make selection bold': 'Make selection bold',
        'Make selection italic': 'Make selection italic',
        'Make selection monospace': 'Make selection monospace',
        'Make selection strikethrough': 'Make selection strikethrough',
        'Maximum length: {userNameMaxLength} characters': 'Maximum length: {userNameMaxLength} characters',
        'Merge tags': 'Merge tags',
        'Merge threads': 'Merge threads',
        'Merge': 'Merge',
        'Message Comments': 'Message Comments',
        'Message Count': 'Message Count',
        'Message Preview': 'Message Preview',
        'Message not specified.': 'Message not specified.',
        'Message sent.': 'Message sent.',
        'Message': 'Message',
        'Messages': 'Messages',
        'Minimum length: {userNameMinLength} characters': 'Minimum length: {userNameMinLength} characters',
        'Move to different thread': 'Move to different thread',
        'Move': 'Move',
        'Must start and end with an alphanumeric character': 'Must start and end with an alphanumeric character',
        'My User': 'My User',
        'NAV_New Thread': 'New <div class="uk-navbar-subtitle">Thread',
        'NAV_RECENT MESSAGES': '<b>Recent</b><div class="uk-navbar-subtitle">Messages</div>',
        'NAV_RECENT THREADS': '<b>Recent</b><div class="uk-navbar-subtitle">Threads',
        'NO_USER_YET': 'No user name has been yet created. Click here to create one.',
        'Name': 'Name',
        'New Thread': 'New Thread',
        'No Throttling Exception': 'No Throttling Exception',
        'No categories found': 'No categories found',
        'No comments found': 'No comments found',
        'No messages found': 'No messages found',
        'No more messages found': 'No more messages found',
        'No more threads found': 'No more threads found',
        'No previously uploaded attachments found': 'No previously uploaded attachments found',
        'No privileges assigned': 'No privileges assigned',
        'No privileges revoked': 'No privileges revoked',
        'No tags found': 'No tags found',
        'No threads found': 'No threads found',
        'No users found': 'No users found',
        'Not yet approved': 'Not yet approved',
        'Online Users': 'Online Users',
        'Only PNG files are supported as logos': 'Only PNG files are supported as logos',
        'Others': 'Others',
        'PRIVILEGES_ASSIGNED_TO_USER': u => `Privileges Assigned To User: ${u}`,
        'PRIVILEGES_FOR_CATEGORY': t => `Privileges For Category: ${t}`,
        'PRIVILEGES_FOR_TAG': t => `Privileges For Tag: ${t}`,
        'PRIVILEGES_FOR_THREAD': t => `Privileges For Thread: ${t}`,
        'PRIVILEGES_NEED_TO_REOPEN_MODAL': 'Assigned privilege will be displayed when reopening the modal.',
        'Page:': 'Page:',
        'Password changed.': 'Password changed.',
        'Passwords do not match!': 'Passwords do not match!',
        'Please check your email for details on how to reset the password.': 'Please check your email for details on how to reset the password.',
        'Please check your email to complete the registration.': 'Please check your email to complete the registration.',
        'Please complete the not a robot test.': 'Please complete the not a robot test.',
        'Please enter a comment for the selected message': 'Please enter a comment for the selected message',
        'Please enter a password!': 'Please enter a password!',
        'Please enter the embed code': 'Please enter the embed code',
        'Please enter the image title': 'Please enter the image title',
        'Please enter the link to add': 'Please enter the link to add',
        'Please enter the link to the image': 'Please enter the link to the image',
        'Please enter the new attachment name': 'Please enter the new attachment name',
        'Please enter the page number:': 'Please enter the page number:',
        'Please enter the title for the link': 'Please enter the title for the link',
        'Please specify the old password': 'Please specify the old password',
        'Please use a more complex password!': 'Please use a more complex password!',
        'Privacy Policy': 'Privacy Policy',
        'Private Messages': 'Private Messages',
        'Privilege': 'Privilege',
        'Privileges For Thread Message': 'Privileges For Thread Message',
        'Privileges': 'Privileges',
        'Quote content': 'Quote content',
        'Quoted By': 'Quoted By',
        'REGISTER_CONFIRMATION_WARNING': 'When registering, a confirmation link will be sent to the email you provide. Registration will only be complete after confirmation.',
        'Received Messages': 'Received Messages',
        'Received Votes': 'Received Votes',
        'Recent Messages': 'Recent Messages',
        'Recent Threads': 'Recent Threads',
        'Recipient not specified.': 'Recipient not specified.',
        'Referenced by:': 'Referenced by:',
        'Register User': 'Register User',
        'Register a New Account': 'Register a New Account',
        'Registration is not available.': 'Registration is not available.',
        'Remembers your consent to allow loading externally linked content.': 'Remembers your consent to allow loading externally linked content.',
        'Remembers your consent to allow required cookies.': 'Remembers your consent to allow required cookies.',
        'Remove Attachment': 'Remove Attachment',
        'Remove Tag': 'Remove Tag',
        'Remove attachment from message': 'Remove attachment from message',
        'Remove profile image': 'Remove profile image',
        'Reply': 'Reply',
        'Reset Vote': 'Reset Vote',
        'Revoked Category Levels': 'Revoked Category Levels',
        'Revoked Forum Wide Levels': 'Revoked Forum Wide Levels',
        'Revoked Levels (Expired)': 'Revoked Levels (Expired)',
        'Revoked Levels': 'Revoked Levels',
        'Revoked Tag Levels': 'Revoked Tag Levels',
        'Revoked Thread Levels': 'Revoked Thread Levels',
        'Revoked': 'Revoked',
        'Save': 'Save',
        'Search Thread by Initial': 'Search Thread by Initial',
        'Search': 'Search',
        'Select Attachment': 'Select Attachment',
        'Select Category Parent': 'Select Category Parent',
        'Select Tag': 'Select Tag',
        'Select Tags': 'Select Tags',
        'Select Thread': 'Select Thread',
        'Selected Attachment Id': 'Selected Attachment Id',
        'Selected Thread Id': 'Selected Thread Id',
        'Send Message': 'Send Message',
        'Send Private Message': 'Send Private Message',
        'Send a new message to:': 'Send a new message to:',
        'Sent Messages': 'Sent Messages',
        'Set Comment to Solved': 'Set Comment to Solved',
        'Set comment to solved': 'Set comment to solved',
        'Settings': 'Settings',
        'Signature': 'Signature',
        'Size': 'Size',
        'Sort by:': 'Sort by:',
        'Statistics': 'Statistics',
        'Subcategories:': 'Subcategories:',
        'Subscribe': 'Subscribe',
        'Subscribed Threads': 'Subscribed Threads',
        'Subscribed Users': 'Subscribed Users',
        'Subscribed': 'Subscribed',
        'TAGS_COUNT': n => `${n} tags`,
        'THREADS_BY': u => `Threads added by ${u}`,
        'THREADS_COUNT': n => `${n} threads`,
        'THREADS_SUBSCRIBED_TO': u => `Threads subscribed to by ${u}`,
        'THREADS_TAGGED_WITH': t => `Threads tagged with ${t}`,
        'THREAD_MAX_LENGTH': n => `Thread name must be less than ${n} characters long.`,
        'THREAD_MESSAGES_BY': u => `Thread messages added by ${u}`,
        'THREAD_MESSAGES_COUNT': n => `${n} thread messages`,
        'THREAD_MIN_LENGTH': n => `Thread name must be at least ${n} characters long.`,
        'THREAD_SUBSCRIBED_USERS': n => `${n} subscribed users`,
        'THREAD_TOTAL_VIEWS': n => `${n} total views`,
        'TOTAL_COMMENTS': n => `${n} ${(1 == n) ? 'comment' : 'comments'}`,
        'Tag Required Levels': 'Tag Required Levels',
        'Tag': 'Tag',
        'Tags': 'Tags',
        'Terms Of Service': 'Terms Of Service',
        'The following restrictions apply:': 'The following restrictions apply:',
        'Thread Count': 'Thread Count',
        'Thread Message Required Levels': 'Thread Message Required Levels',
        'Thread Message': 'Thread Message',
        'Thread Messages': 'Thread Messages',
        'Thread Name': 'Thread Name',
        'Thread Required Levels': 'Thread Required Levels',
        'Thread Tags': 'Thread Tags',
        'Thread is pinned': 'Thread is pinned',
        'Thread not found': 'Thread not found',
        'Thread': 'Thread',
        'Threads': 'Threads',
        'UNKNOWN_RECIPIENT': m => `Unknown recipient: ${m}`,
        'UNSOLVED_COMMENTS': n => `${n} unsolved`,
        'USERNAME_MAX_LENGTH': n => `User name must be less than ${n} characters long.`,
        'USERNAME_MIN_LENGTH': n => `User name must be at least ${n} characters long.`,
        'USERS_COUNT': n => `${n} users`,
        'USERS_ONLINE': n => `${n} users online`,
        'Unapprove Content': 'Unapprove Content',
        'Unapprove Thread': 'Unapprove Thread',
        'Unapprove attachment': 'Unapprove attachment',
        'Unsubscribe': 'Unsubscribe',
        'Until': 'Until',
        'Up Vote': 'Up Vote',
        'Up votes': 'Up votes',
        'Upload new profile image': 'Upload new profile image',
        'User Name': 'User Name',
        'User name cannot be empty!': 'User name cannot be empty!',
        'User name': 'User name',
        'User signature': 'User signature',
        'Users': 'Users',
        'VALUE_MUST_BE_BETWEEN': (min, max) => `Value must be between ${min} and ${max}!`,
        'VISITORS_COUNT': n => `(${n} total visitors)`,
        'View All Attachments': 'View All Attachments',
        'View All Categories': 'View All Categories',
        'View All Message Comments': 'View All Message Comments',
        'View All Tags': 'View All Tags',
        'View All Threads': 'View All Threads',
        'View All Users': 'View All Users',
        'View Assigned Privileges': 'View Assigned Privileges',
        'View Attachment Creator IP Address': 'View Attachment Creator IP Address',
        'View Attachments of User': 'View Attachments of User',
        'View Attachments': 'View Attachments',
        'View Creator User': 'View Creator User',
        'View Entities Count': 'View Entities Count',
        'View Forum Wide Assigned Privileges': 'View Forum Wide Assigned Privileges',
        'View Forum Wide Required Privileges': 'View Forum Wide Required Privileges',
        'View IP Address': 'View IP Address',
        'View Message Comments Of User': 'View Message Comments Of User',
        'View Message Comments': 'View Message Comments',
        'View Private Message IP Address': 'View Private Message IP Address',
        'View Required Privileges': 'View Required Privileges',
        'View Root Categories': 'View Root Categories',
        'View Subscribed Threads Of User': 'View Subscribed Threads Of User',
        'View Thread Messages Of User': 'View Thread Messages Of User',
        'View Threads Of User': 'View Threads Of User',
        'View Threads': 'View Threads',
        'View Unapproved Attachments': 'View Unapproved Attachments',
        'View Unapproved': 'View Unapproved',
        'View User Assigned Privileges': 'View User Assigned Privileges',
        'View User Info': 'View User Info',
        'View Users Subscribed to Thread': 'View Users Subscribed to Thread',
        'View Version': 'View Version',
        'View Votes': 'View Votes',
        'View': 'View',
        'With a different provider:': 'With a different provider:',
        'With an account created on this site:': 'With an account created on this site:',
        'attachments': 'attachments',
        'choose one': 'choose one',
        'confirm password': 'confirm password',
        'days': 'days',
        'downloads': 'downloads',
        'email': 'email',
        'empty': 'empty',
        'hours': 'hours',
        'message comments': 'message comments',
        'messages': 'messages',
        'minutes': 'minutes',
        'new forum account password': 'new forum account password',
        'no reason': 'no reason',
        'old forum account password': 'old forum account password',
        'password for the new account': 'password for the new account',
        'private messages': 'private messages',
        'seconds': 'seconds',
        'show added attachments': 'show added attachments',
        'show assigned privileges': 'show assigned privileges',
        'show written comments': 'show written comments',
        'subscribed threads': 'subscribed threads',
        'subscribed': 'subscribed',
        'thread messages': 'thread messages',
        'threads': 'threads',
        'unknown': 'unknown',
        'unlimited': 'unlimited',
        'users': 'users',
        'views': 'views'
    };
}