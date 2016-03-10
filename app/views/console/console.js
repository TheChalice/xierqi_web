'use strict';

angular.module('console', [
    {
        files:[
            'components/header/header.js',
            'components/sidebar/sidebar.js'
        ]
    }
])
    .controller('ConsoleCtrl', ['$rootScope', '$scope', '$log', 'AuthService', 'AUTH_EVENTS', function ($rootScope, $scope, $log, AuthService, AUTH_EVENTS) {
        $log.info('Console');

        if(!$rootScope.user){
            AuthService.withUser().then(function(user) {
                $rootScope.user = user;
            }, function(){

            });
        }

    }]);

