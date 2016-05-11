'use strict';

angular.module('console', [])
    .controller('HomeCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('Home');

    }]);

