'use strict';
/**
 * Created by sabrinaxue on 3/8/16.
 */

angular.module('console.image', [
        {
            files: ['components/searchbar/searchbar.js']
        }
    ])
    .controller('ImageCtrl', ['$scope', '$log', function ($scope, $log) {
        $log.info('');

    }]);
