'use strict';

angular.module('console.image_detail', [
        {
            files: ['components/searchbar/searchbar.js']
        }
    ])
    .controller('ImageDetailCtrl', ['$scope', '$log', 'ImageStreamTag', '$stateParams', 'Git', function ($scope, $log, ImageStreamTag, $stateParams, Git) {
        $log.info('ImageDetailCtrl');

        var loadImageDetail = function(){
            //传imagename的参数
            ImageStreamTag.get({name: $stateParams["name"]}, function(data){
                $log.info('data',data);
                $scope.data = data;
            })
        };

        loadImageDetail();

        var laodGit = function(){
            var list = new array("owner", "repo", "path");
            Git.get(function(list){
                $log.info(list);
            })
        };
        laodGit();
    }]);