'use strict';

angular.module('console.image_detail', [
        {
            files: ['components/searchbar/searchbar.js']
        }
    ])
    .controller('ImageDetailCtrl', ['$scope', '$log', 'ImageStreamTag', function ($scope, $log, ImageStreamTag) {
        $log.info('ImageDetailCtrl');

        var loadImageDetail = function(){
            ImageStreamTag.get(function(data){
                $log.info('data',data);
                $scope.data = data;
            })
        };

        loadImageDetail();
    }]);