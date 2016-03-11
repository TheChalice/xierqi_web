'use strict';

angular.module('console.build.detail', [
    {
        files: ['components/timeline/timeline.js']
    }
])
    .controller('BuildDetailCtrl', ['$scope', '$log', '$stateParams', 'Build', function ($scope, $log, $stateParams, Build) {
        var loadBuild = function() {
            Build.get({name: $stateParams.name}, function(data){
                $log.info('data', data);
                $scope.data = data;
            }, function(res) {
                //错误处理
            });
        };

        loadBuild();

    }]);

