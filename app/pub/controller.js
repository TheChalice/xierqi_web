'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.controller', [])
        .controller('AppCtrl', ['User','$rootScope', '$state', '$log', 'AUTH_EVENTS', 'Cookie',
            function (User,$rootScope, $state, $log, AUTH_EVENTS, Cookie) {
            //console相关全局变量
            $rootScope.console = {};

            $rootScope.$on(AUTH_EVENTS.loginNeeded, function () {
                $log.info(AUTH_EVENTS.loginNeeded);
                Cookie.clear('namespace');
                Cookie.clear('df_access_token');
                Cookie.clear('region');
                $rootScope.region = '';
                $rootScope.user = '';
                $rootScope.namespace = "";
                console.log("Cookie.get('newState')", Cookie.get('newState'));
                $state.go('blank',{oldurl:Cookie.get('newState')});
            });
            $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
                $log.info(AUTH_EVENTS.loginSuccess);
            });
            $rootScope.$on(AUTH_EVENTS.httpForbidden, function () {
                $log.info(AUTH_EVENTS.httpForbidden,"to do san.");

                Cookie.clear('namespace');
                Cookie.clear('df_access_token');
                Cookie.clear('region');
                $rootScope.region = '';
                $rootScope.user = '';
                $rootScope.namespace = "";
                console.log("Cookie.get('newState')", Cookie.get('newState'));
                $state.go('blank',{oldurl:Cookie.get('newState')});
            });
        }]);
});
