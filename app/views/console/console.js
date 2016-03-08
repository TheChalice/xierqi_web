'use strict';

angular.module('console', [
    {
        files:[
            'components/header/header.js',
            'components/sidebar/sidebar.js'
        ]
    }
])
    .controller('ConsoleCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('Console');

    }]);

