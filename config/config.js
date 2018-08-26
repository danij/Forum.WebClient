//configuration data
window.serviceConfig = {

    uri: "http://dani.forum:8080/api",
    responsePrefix: "while(1);"
};

//stores the number of seconds to cache various entities
window.cacheConfig = {

    tags: 3600*24
};

window.displayConfig = {

    pageNumbersBefore: 3,
    pageNumbersMiddle: 5,
    pageNumbersAfter: 3,
    showSpinnerAfterMilliSeconds: 1000,
    updateStatisticsEveryMilliSeconds: 60000,
    updateRecentThreadsEveryMilliSeconds: 60000,
    updateRecentThreadMessagesEveryMilliSeconds: 30000,
    searchThreadWaitMilliseconds: 100,
    renderMessagePreviewEveryMilliseconds: 2000,
    useDashesForThreadNameInUrl: true,
    privacyPolicyDocName: 'privacy.md',
    termsOfServiceDocName: 'tos.md'
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

window.debugConfig = {

    enableAllPrivileges: false
};