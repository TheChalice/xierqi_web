'use strict';
/**
 * Created by sabrinaxue on 3/8/16.
 */

angular.module('console.image', [
        {
            files: ['components/searchbar/searchbar.js']
        }
    ])
    .controller('ImageCtrl', ['$scope', '$log','Image', function ($scope, $log, Image) {
        $log.info('ImageCtrl');

        var loadImages = function() {
            Image.get(function(data){
                $log.info('data',data);
                $scope.data = data;
            })
        };

        loadImages();
    }]);
