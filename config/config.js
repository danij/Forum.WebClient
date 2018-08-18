//configuration data
window.serviceConfig = {

    uri: "http://dani.forum:8080/api",
    responsePrefix: "while(1);"
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
    renderNewMessageEveryMilliseconds: 2000,
    useDashesForThreadNameInUrl: true
};

window.masterPageConfig = {

    baseUri: "http://dani.forum:8080/",
    title: "Fast Forum",
    footerLinks: [{
        title: "Help",
        link: "#"
    }, {
        title: "Terms of Service",
        link: "#"
    }]
};

window.debugConfig = {

    enableAllPrivileges: false
};