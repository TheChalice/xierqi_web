'use strict';

angular.module('console.build.detail', [
    {
        files: [
            'components/timeline/timeline.js',
            'views/build_detail/build_detail.css'
        ]
    }
])
    .controller('BuildDetailCtrl', ['$scope', '$log', '$stateParams', 'BuildConfig', 'Build', 'Confirm', function ($scope, $log, $stateParams, BuildConfig, Build, Confirm) {

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
                $scope.history = data;
            }, function(res){
                //错误处理
            });
        };

        loadBuildConfig();

        $scope.delete = function(){
            Confirm.open("删除构建", "您确定要删除项目吗?", "删除项目将清除项目的所有历史数据以及相关的镜像该操作不能被恢复", 'recycle').then(function(){
                $log.info("confirm")
            });
        }


    }]);

