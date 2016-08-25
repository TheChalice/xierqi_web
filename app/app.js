'use strict';

define([
    'angular',
    'bootstrap',
    'angularBase64',
    'ocLazyLoad',
    'uiBootstrap',
    'router',
    'resource',
    'pub/controller',
    'pub/service',
    'pub/directive',
    'pub/filter',
    'pub/ws',
    'components/version/version',
    'angularMd',
    'angularClipboard',
    'kubernetesUI',
    'highchartsNg',
    'fileUpload',
    'fileUploadShim',
    'angularticsgoogleanalytics'
], function (angular) {

    // 声明应用及其依赖
    var myApp = angular.module('myApp', [
        'oc.lazyLoad',
        'ui.bootstrap',
        'myApp.router',     //路由模块
        'myApp.resource',   //资源模块
        'myApp.controller',
        'myApp.service',
        'myApp.directive',
        'myApp.filter',
        'myApp.webSocket',
        'myApp.version',
        'hc.marked',
        'highcharts-ng',
        'ngFileUpload',
        'angularticsgoogleanalytics'
    ]);

    myApp.constant('GLOBAL', {
        size: 10,
        host: '/oapi/v1',
        host_k8s: '/api/v1',
        host_wss: '/ws/oapi/v1',
        host_wss_k8s: '/ws/api/v1',
        login_uri: '/login',
        host_webhooks: 'https://dev.dataos.io:8443/oapi/v1'
    })
    .constant('AUTH_EVENTS', {
        loginNeeded: 'auth-login-needed',
        loginSuccess: 'auth-login-success',
        httpForbidden: 'auth-http-forbidden'
    })

    .config(['$httpProvider', 'GLOBAL', function ($httpProvider) {
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
