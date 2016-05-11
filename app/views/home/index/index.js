'use strict';

angular.module('console', [])
    .controller('IndexCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('Index');

    }]);

