//configuration data
window.serviceConfig = {

    uri: "http://dani.forum:8080/forum/api",
    responsePrefix: "while(1);"
};

window.displayConfig = {

    pageNumbersBefore: 3,
    pageNumbersMiddle: 5,
    pageNumbersAfter: 3,
    showSpinnerAfterMilliSeconds: 1000,
    updateStatisticsEveryMilliSeconds: 60000,
    updateRecentThreadsEveryMilliSeconds: 60000,
    updateRecentThreadMessagesEveryMilliSeconds: 30000
};

window.masterPageConfig = {

    baseUri: "http://dani.forum:8080/forum"
};

MathJax.Hub.Config({

    extensions: ["tex2jax.js"],
    jax: ["input/TeX", "output/HTML-CSS"],
    tex2jax: {
        inlineMath: [['$', '$'], ["\\(", "\\)"]],
        displayMath: [['$$', '$$'], ["\\[", "\\]"]],
        processEscapes: true
    },
    "HTML-CSS": {availableFonts: ["TeX"]}
});
