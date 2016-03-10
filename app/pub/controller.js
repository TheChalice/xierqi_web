'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.controller', [])
        .controller('AppCtrl', ['$rootScope', '$state', '$log', '$window', 'AUTH_EVENTS', 'AUTH_CFG', function ($rootScope, $state, $log, $window, AUTH_EVENTS, AUTH_CFG) {
            $rootScope.$on(AUTH_EVENTS.loginNeeded, function () {
                $log.info(AUTH_EVENTS.loginNeeded);
            });
            $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
                $log.info(AUTH_EVENTS.loginSuccess);
            });
            $rootScope.$on(AUTH_EVENTS.httpForbidden, function () {
                $log.info(AUTH_EVENTS.httpForbidden);
            });
        }])
        .controller('OAuthCtrl', ['$location', '$q', 'RedirectLoginService', 'DataService', 'AuthService', function ($location, $q, RedirectLoginService, DataService, AuthService) {
            RedirectLoginService.finish()
                .then(function(data) {
                    var token = data.token;
                    var then = data.then;
                    var ttl = data.ttl;

                    // Try to fetch the user
                    var opts = {errorNotification: false, http: {auth: {token: token, triggerLogin: false}}};

                    DataService.get("users", "~", {}, opts)
                        .then(function(user) {
                            // Set the new user and token in the auth service
                            AuthService.setUser(user, token, ttl);

                            // Redirect to original destination (or default to '/')
                            var destination = then || './';
                            $location.url(destination);
                        })
                        .catch(function(rejection) {
                            // Handle an API error response fetching the user
                            var redirect = URI('error').query({error: 'user_fetch_failed'}).toString();
                            $location.url(redirect);
                        });

                })
                .catch(function(rejection) {
                    var redirect = URI('error').query({
                        error: rejection.error || "",
                        error_description: rejection.error_description || "",
                        error_uri: rejection.error_uri || ""
                    }).toString();
                    $location.url(redirect);
                });

        }]);
});
