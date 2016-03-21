'use strict';

angular.module('console.build.detail', [
    {
        files: [
            'components/timeline/timeline.js',
            'views/build_detail/build_detail.css'
        ]
    }
])
    .controller('BuildDetailCtrl', ['$scope', '$log', '$stateParams', 'BuildConfig', 'Build', 'Sort', function ($scope, $log, $stateParams, BuildConfig, Build, Sort) {

        var loadBuildConfig = function() {
            BuildConfig.get({name: $stateParams.name}, function(data){
                $log.info('data', data);
                $scope.data = data;

                loadBuildHistory();
            }, function(res) {
                //错误处理
            });
        };

        var loadBuildHistory = function () {
            Build.get({labelSelector: 'buildconfig=' + $scope.data.metadata.name}, function(data){
                $log.info("history", data);
                data.items = Sort.sort(data.items, -1); //排序
                $scope.history = data;
            }, function(res){
                //错误处理
            });
        };

        loadBuildConfig();

    }]);

