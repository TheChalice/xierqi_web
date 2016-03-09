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
    'pub/services/auth',
    'pub/services/userstore',
    'pub/services/login',
    'pub/services/logout',
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
        'myApp.service.auth',
        'myApp.service.userstore',
        'myApp.service.login',
        'myApp.service.logout',
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
        oauth_authorize_uri: "https://localhost:8443/oauth/authorize",
        oauth_redirect_base: "https://localhost:9000",
        oauth_client_id: "openshift-web-console",
        logout_uri: ""
    })
    .config(function($httpProvider, AuthServiceProvider, RedirectLoginServiceProvider, AUTH_CFG) {
        $httpProvider.interceptors.push('AuthInterceptor');

        AuthServiceProvider.LoginService('RedirectLoginService');
        AuthServiceProvider.LogoutService('DeleteTokenLogoutService');
        AuthServiceProvider.UserStore('LocalStorageUserStore');

        RedirectLoginServiceProvider.OAuthClientID(AUTH_CFG.oauth_client_id);
        RedirectLoginServiceProvider.OAuthAuthorizeURI(AUTH_CFG.oauth_authorize_uri);
        //RedirectLoginServiceProvider.OAuthRedirectURI(URI(AUTH_CFG.oauth_redirect_base).segment("oauth").toString());

    })

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
