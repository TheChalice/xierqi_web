'use strict';

angular.module('home', [{
        files: ['components/nav/nav.js']
    }])
    .controller('HomeCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('HomeCtrl');

    }]);

