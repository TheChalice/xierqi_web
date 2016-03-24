'use strict';

if (window.__karma__) {
    var allTestFiles = [];
    var TEST_REGEXP = /_test\.js$/;

    var pathToModule = function (path) {
        return path.replace(/^\/base\/app\//, '').replace(/\.js$/, '');
    };

    Object.keys(window.__karma__.files).forEach(function (file) {
        if (TEST_REGEXP.test(file)) {
            // Normalize paths to RequireJS module names.
            allTestFiles.push(pathToModule(file));
        }
    });
}

require.config({
    baseUrl: window.__karma__ ? '/base/app' : './',
    paths: {
        bootstrap: '../bower_components/bootstrap/dist/js/bootstrap.min',
        jquery: '../bower_components/jquery/dist/jquery.min',
        moment: '../bower_components/moment/min/moment-with-locales.min',
        angular: '../bower_components/angular/angular.min',
        ngResource: '../bower_components/angular-resource/angular-resource.min',
        ngFileUpload: '../bower_components/ng-file-upload/ng-file-upload-all.min',
        uiBootstrap: '../bower_components/angular-bootstrap/ui-bootstrap-tpls.min',
        uiRouter: '../bower_components/angular-ui-router/release/angular-ui-router.min',
        angularAnimate: '../bower_components/angular-animate/angular-animate.min',
        angularMocks: '../bower_components/angular-mocks/angular-mocks',
        ocLazyLoad: '../bower_components/oclazyload/dist/ocLazyLoad.min'
    },
    shim: {
        'angular': {
            'dep': ['jquery'],
            'exports': 'angular'
        },
        'angularMocks': {
            deps: ['angular'],
            'exports': 'angular.mock'
        },
        'angularAnimate': {
            deps: ['angular']
        },
        'ngResource': {
            deps: ['angular']
        },
        'ngFileUpload': {
            deps: ['angular']
        },
        'uiBootstrap': {
            deps: ['angular']
        },
        'uiRouter': {
            deps: ['angular']
        },
        'ocLazyLoad': {
            deps: ['angular']
        },
        'bootstrap': {
            deps: ['jquery']
        }
    },
    priority: [
        "angular"
    ],
    deps: window.__karma__ ? allTestFiles : [],
    callback: window.__karma__ ? window.__karma__.start : null,
});

require([
        'app'
    ], function (app) {
        var $html = angular.element(document.getElementsByTagName('html')[0]);
        angular.element().ready(function () {
            // bootstrap the app manually
            angular.bootstrap(document, ['myApp']);
        });
    }
);
