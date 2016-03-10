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
        'myApp.version'
    ]);

    myApp.constant('GLOBAL', {
        host: 'http://localhost:3002'
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
        oauth_client_id: "openshift-web-console",
        logout_uri: ""
    })
    .config(['$httpProvider', function ($httpProvider) {
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
        $rootScope.$on('$stateChangeSuccess', function () {
            $rootScope.transfering = false;
        });
    }]);

    return myApp;
});
