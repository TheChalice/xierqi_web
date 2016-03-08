'use strict';

angular.module('console.build', [])
    .controller('BuildCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('Build');

    }]);

