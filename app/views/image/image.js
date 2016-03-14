'use strict';
angular.module('console.image', [
        {
            files: ['components/searchbar/searchbar.js']
        }
    ])
    .controller('ImageCtrl', ['$scope', '$log','ImageStreamTag', 'Build', function ($scope, $log, ImageStreamTag, Build) {
        $log.info('ImageCtrl');

        var loadImageStream = function() {
            ImageStreamTag.get(function(data){
                $log.info('data', data);
                $scope.data = data;
                for (var i=0; i < data.length; i++){


                }
            })
        };

        var loadBuild = function() {
            Build.get(function(data){
                $log.info('Build', data);
            })
        };
        loadImageStream();
        loadBuild();
    }]);
