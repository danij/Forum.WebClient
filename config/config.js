//configuration data
window.serviceConfig = {

    uri: "http://dani.forum:8080/api",
    responsePrefix: "while(1);"
};

//stores the number of seconds to cache various entities
window.cacheConfig = {

    tags: 3600 * 24,
    threads: 60,
    latestMessages: 30,
    userRetrieveBatchSize: 25 //cannot exceed the configured user page size
};

window.displayConfig = {

    pageNumbersBefore: 3,
    pageNumbersMiddle: 5,
    pageNumbersAfter: 3,
    showSpinnerAfterMilliSeconds: 1000,
    updateStatisticsEveryMilliSeconds: 60000,
    updateRecentThreadsEveryMilliSeconds: 60000,
    updateRecentThreadMessagesEveryMilliSeconds: 30000,
    checkAuthenticationEveryMilliSeconds: 120000,
    searchThreadWaitMilliseconds: 100,
    renderMessagePreviewEveryMilliseconds: 2000,
    useDashesForThreadNameInUrl: true,
    privacyPolicyDocName: 'privacy',
    termsOfServiceDocName: 'terms_of_service',
    //only for displaying errors, when updating please also update the backend configuration
    userNameLengths: {
        min: 3,
        max: 20
    },
    threadNameLengths: {
        min: 3,
        max: 128
    },
    messageContentLengths: {
        min: 5,
        max: 65535
    },
    privateMessageContentLengths: {
        min: 5,
        max: 65535
    }
};

window.actionConfig = {

    multiTagInputSeparator: ';'
};

window.masterPageConfig = {

    baseUri: "http://dani.forum:8080/",
    allowedAuthProviders: [
        "custom",
        "google"
    ],
    title: "Fast Forum",
    navLinks: [{
        title: "Help",
        link: "#"
    }, {
        title: "Privacy Policy",
        docName: window.displayConfig.privacyPolicyDocName
    }, {
        title: "Terms of Service",
        docName: window.displayConfig.termsOfServiceDocName
    }],
    externalImagesWarningFormat: 'External link: {title}'
};

window.registerConfig = {

    enableRegistration: true,
    //only for displaying errors, when updating please also update the auth backend configuration
    minAge: 18,
    minPasswordLength: 8
};

window.debugConfig = {

    enableAllPrivileges: false
};