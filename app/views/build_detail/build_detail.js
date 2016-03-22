'use strict';

angular.module('console.build.detail', [
    {
        files: [
            'components/timeline/timeline.js',
            'views/build_detail/build_detail.css'
        ]
    }
])
    .controller('BuildDetailCtrl', ['$scope', '$log', '$stateParams', '$state', 'BuildConfig', 'Build', 'Sort', 'Confirm', function ($scope, $log, $stateParams, $state, BuildConfig, Build, Sort, Confirm) {

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

        //开始构建
        $scope.startBuild = function() {
            var name = $scope.data.metadata.name;
            var buildRequest = {
                metadata: {
                    name: name
                }
            };
            BuildConfig.instantiate.create({name: name}, buildRequest, function(res){
                $log.info("build instantiate success");
                if ($scope.history.items) {
                    $scope.history.items.unshift(res);
                } else {
                    $scope.history.items = [res];
                }
            }, function(res){
                //todo 错误处理
            });
        };

        $scope.delete = function(){
            var name = $scope.data.metadata.name;
            Confirm.open("删除构建", "您确定要删除项目吗?", "删除项目将清除项目的所有历史数据以及相关的镜像该操作不能被恢复", 'recycle').then(function() {
                BuildConfig.remove({name: name}, {}, function(){
                    $log.info("remove buildConfig success");
                    $state.go("console.build");
                }, function(res){
                    //todo 错误处理
                });
            });
        };

    }]);

