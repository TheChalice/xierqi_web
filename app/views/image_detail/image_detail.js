'use strict';

angular.module('console.image_detail', [
        {
            files: ['components/searchbar/searchbar.js']
        }
    ])
    .controller('ImageDetailCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('ImageDetailCtrl');

    }]);