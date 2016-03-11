'use strict';

angular.module('console.build', [
    {
        files: ['components/searchbar/searchbar.js']
    }
])
    .controller('BuildCtrl', ['$scope', '$log', '$stateParams', 'BuildConfig', function ($scope, $log, $stateParams, BuildConfig) {

        var loadBuilds = function() {
            BuildConfig.get(function(data){
                $log.info('data', data);
                $scope.data = data;
            }, function(res) {
                //错误处理
            });
        };

        loadBuilds();

    }]);

