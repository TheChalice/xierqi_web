'use strict';

angular.module('console.build', [
    {
        files: ['components/searchbar/searchbar.js']
    }
])
    .controller('BuildCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('Build');

    }]);

