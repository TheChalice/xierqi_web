'use strict';
/**
 * Created by sabrinaxue on 3/8/16.
 */

angular.module('console.image', [
        {
            files: ['components/searchbar/searchbar.js']
        }
    ])
    .controller('ImageCtrl', ['$scope', '$log','ImageStreamTag', function ($scope, $log, ImageStreamTag) {
        $log.info('ImageCtrl');

        var loadImageStream = function() {
            ImageStreamTag.get(function(data){
                $log.info('data',data);
                $scope.data = data;
            })
        };

        loadImageStream();
    }]);
