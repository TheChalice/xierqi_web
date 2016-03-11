'use strict';

angular.module('console.build', [
    {
        files: ['components/searchbar/searchbar.js']
    }
])
    .controller('BuildCtrl', ['$scope', '$log', '$stateParams', 'Build', function ($scope, $log, $stateParams, Build) {

        var loadBuilds = function() {
            Build.get(function(data){
                $log.info('data', data);
                $scope.data = data;
            }, function(res) {
                //错误处理
            });
        };

        loadBuilds();

    }]);

