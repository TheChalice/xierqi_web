exports.config = {
    allScriptsTimeout: 11000,

    directConnect: true,

    specs: [
        '../e2e-test/*.js'
    ],

    capabilities: {
        'browserName': 'chrome'
    },

    baseUrl: 'http://localhost:8080/app/',

    framework: 'jasmine',

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
