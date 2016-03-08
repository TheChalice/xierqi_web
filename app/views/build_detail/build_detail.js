'use strict';

angular.module('console.build.detail', [
    {
        files: ['components/timeline/timeline.js']
    }
])
    .controller('BuildDetailCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('BuildDetail');

    }]);

