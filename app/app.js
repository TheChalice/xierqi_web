'use strict';

define([
    'angular',
    'bootstrap',
    'angularBase64',
    'ocLazyLoad',
    'uiBootstrap',
    'angularAnimate',
    'router',
    'resource',
    'pub/controller',
    'pub/service',
    'pub/directive',
    'pub/filter',
    'pub/ws',
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
        'myApp.webSocket',
        'myApp.version'
    ]);

    myApp.constant('GLOBAL', {
        size: 10,
        host: 'https://54.222.199.235:8443/oapi/v1',
        host_wss: 'wss://54.222.199.235:8443/oapi/v1',
        namespace: 'foundry',
        token: 'L6PDA3dxiZgcThxh8YiNn1pVyPIxnl-qoxSw-lnBks0'
    })
    .constant('AUTH_EVENTS', {
        loginNeeded: 'auth-login-needed',
        loginSuccess: 'auth-login-success',
        httpForbidden: 'auth-http-forbidden'
    })
    .constant('AUTH_CFG', {
        oauth_authorize_uri: "https://54.222.199.235:8443/oauth/authorize",
        oauth_redirect_base: "http://localhost:9000",
        oauth_client_id: "openshift-web-console",
        logout_uri: ""
    })
    .config(['$httpProvider', 'AuthServiceProvider', 'RedirectLoginServiceProvider', 'AUTH_CFG', function($httpProvider, AuthServiceProvider, RedirectLoginServiceProvider, AUTH_CFG) {
        //todo oauth_redirect_base强制为location.origin
        var oauth_redirect_base = location.origin;

        $httpProvider.interceptors.push('AuthInterceptor');

        AuthServiceProvider.LoginService('RedirectLoginService');
        AuthServiceProvider.LogoutService('DeleteTokenLogoutService');
        AuthServiceProvider.UserStore('LocalStorageUserStore');

        RedirectLoginServiceProvider.OAuthClientID(AUTH_CFG.oauth_client_id);
        RedirectLoginServiceProvider.OAuthAuthorizeURI(AUTH_CFG.oauth_authorize_uri);
        RedirectLoginServiceProvider.OAuthRedirectURI(URI(oauth_redirect_base).segment("app/oauth.html").toString());

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
