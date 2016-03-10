'use strict';

angular.module('console', [
    {
        files:[
            'components/header/header.js',
            'components/sidebar/sidebar.js'
        ]
    }
])
    .controller('ConsoleCtrl', ['$rootScope', '$scope', '$log', 'AUTH_EVENTS', function ($rootScope, $scope, $log, AUTH_EVENTS) {
        $log.info('Console');



    }]);

