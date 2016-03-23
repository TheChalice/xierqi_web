'use strict';

angular.module('console.build.detail', [
    {
        files: [
            'components/timeline/timeline.js',
            'components/checkbox/checkbox.js',
            'views/build_detail/build_detail.css'
        ]
    }
])
    .controller('BuildDetailCtrl', ['$scope', '$log', '$stateParams', '$state', 'BuildConfig', 'Build', 'Sort', 'Confirm', function ($scope, $log, $stateParams, $state, BuildConfig, Build, Sort, Confirm) {
        $scope.grid = {};

        var loadBuildConfig = function() {
            BuildConfig.get({name: $stateParams.name}, function(data){
                $log.info('data', data);
                $scope.data = data;
                if (data.spec && data.spec.completionDeadlineSeconds){
                    $scope.grid.completionDeadlineMinutes = parseInt(data.spec.completionDeadlineSeconds / 60);
                }
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
            Confirm.open("删除构建", "您确定要删除构建吗?", "删除构建将清除构建的所有历史数据以及相关的镜像该操作不能被恢复", 'recycle').then(function() {
                BuildConfig.remove({name: name}, {}, function(){
                    $log.info("remove buildConfig success");
                    $state.go("console.build");
                }, function(res){
                    //todo 错误处理
                });
            });
        };

        $scope.save = function(){
            if (!$scope.deadlineMinutesEnable) {
                $scope.deadlineMinutesEnable = true;
                return;
            }
            var name = $scope.data.metadata.name;
            $scope.data.spec.completionDeadlineSeconds = $scope.grid.completionDeadlineMinutes * 60;
            BuildConfig.put({name: name}, $scope.data, function (res) {
                $log.info("put success", res);
                $scope.deadlineMinutesEnable = false;
            }, function(res) {
                //todo 错误处理
                $log.info("put failed");
            });
        };

    }]);

