'use strict';

define([
    'angular',
    'ocLazyLoad',
    'uiBootstrap',
    'angularAnimate',
    'router',
    'resource',
    'pub/controller',
    'pub/service',
    'pub/directive',
    'pub/filter',
    'components/version/version'
], function (angular) {

    // 声明应用及其依赖
    var myApp = angular.module('myApp', [
        'oc.lazyLoad',
        'ui.bootstrap',
        'ngAnimate',
        'myApp.router',     //路由模块
        'myApp.resource',   //资源模块
        'myApp.controller',
        'myApp.service',
        'myApp.directive',
        'myApp.filter',
        'myApp.version'
    ]);

    myApp.constant('GLOBAL', {
        size: 10
    })
    .constant('AUTH_EVENTS', {
        loginNeeded: 'auth-login-needed',
        loginSuccess: 'auth-login-success',
        httpForbidden: 'auth-http-forbidden'
    })
    .constant('AUTH_CFG', {
        oauth_authorize_uri: "https://lab.asiainfodata.com:8443/oauth/authorize",
        //oauth_redirect_base: "http://localhost:8080/console",
        oauth_redirect_base: "https://lab.asiainfodata.com:8443/console",
        oauth_client_id: "openshift-challenging-client",
        logout_uri: ""
    })
    .config(['$httpProvider', function ($httpProvider) {
        $httpProvider.defaults.headers.common["Authorization"] = "Bearer HlqyWwA-2DuJ4x9Kb2kNQD5nDCGkJRBjkh_sx8MEOug";

        $httpProvider.interceptors.push([
            '$injector',
            function ($injector) {
                return $injector.get('AuthInterceptor');
            }
        ]);
    }])

    .run(['$rootScope', function ($rootScope) {
        $rootScope.$on('$stateChangeStart', function () {
            $rootScope.transfering = true;
        });
        $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
            //更新header标题
            $rootScope.console.state = toState.name;
            $rootScope.transfering = false;
        });
    }]);

    return myApp;
});
