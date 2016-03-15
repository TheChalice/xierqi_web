'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.controller', [])
        .controller('AppCtrl', ['$rootScope', '$state', '$log', 'AUTH_EVENTS', 'AUTH_CFG', function ($rootScope, $state, $log, AUTH_EVENTS, AUTH_CFG) {
            //console相关全局变量
            $rootScope.console = {};

            $rootScope.$on(AUTH_EVENTS.loginNeeded, function () {
                $log.info(AUTH_EVENTS.loginNeeded);
            });
            $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
                $log.info(AUTH_EVENTS.loginSuccess);
            });
            $rootScope.$on(AUTH_EVENTS.httpForbidden, function () {
                $log.info(AUTH_EVENTS.httpForbidden);
            });
        }]);
});
