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
        var laodGit = function(owner,repo){
            Git.get({owner: owner, repo: repo, path:"readme.md"})(function(data){
                $log.info('data',data);
                $scope.data = data;
            })
        };
    }]);