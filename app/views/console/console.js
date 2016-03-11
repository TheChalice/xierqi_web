'use strict';

angular.module('console', [
    {
        files:[
            'components/header/header.js',
            'components/sidebar/sidebar.js'
        ]
    }
])
    .controller('ConsoleCtrl', ['$rootScope', '$scope', '$log', 'AUTH_EVENTS', 'User', function ($rootScope, $scope, $log, AUTH_EVENTS, User) {
        $log.info('Console');

        if(!$rootScope.user){
            User.get({name: 'admin'}, function(data){
                console.log("user", data);
                $rootScope.user = data;
            });
        }

    }]);

