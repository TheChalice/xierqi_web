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
                loadBuild();
                }), function (res) {
                //错误处理
                };
            }


        var loadBuild = function() {
            var labelSelector = '';
            for (var i = 0; i < items.length; i++) {
            }
                Build.get(function (data) {
                    $log.info('Build', data);
                });
            loadImageStream();
            fillImageStreamTag(data.item);
        };
    }]);
