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
                watchBuilds(data.metadata.resourceVersion);
                $scope.imageEnable = imageEnable();
            }, function(res){
                //错误处理
            });
        };

        loadBuildConfig();

        var watchBuilds = function(resourceVersion) {
            Build.watch(function(res){
                var data = JSON.parse(res.data);
                updateBuilds(data);
            }, function(){
                $log.info("webSocket start");
            }, function(){
                $log.info("webSocket stop");
            }, resourceVersion)
        };

        var updateBuilds = function (data) {
            if (data.type == 'ADDED') {

            } else if (data.type == "MODIFIED") {
                //todo  这种方式非常不好,尽快修改
                angular.forEach($scope.history.items, function(item, i){
                    if (item.metadata.name == data.object.metadata.name) {
                        data.object.showLog = $scope.history.items[i].showLog;
                        Build.log.get({name: data.object.metadata.name}, function(res){
                            var result = "";
                            for(var k in res){
                                result += res[k];
                            }
                            data.object.buildLog = result;
                            $scope.history.items[i] = data.object;
                        }, function(){
                            $scope.history.items[i] = data.object;
                        });
                    }
                });
            }
        };

        var imageEnable = function(){
            if (!$scope.data || !$scope.data.spec.output || !$scope.data.spec.output.to || !$scope.data.spec.output.to.name) {
                return false;
            }
            if (!$scope.history || $scope.history.items.length == 0) {
                return false;
            }
            if ($scope.history.items.length == 1) {
                if ($scope.history.items[0].status.phase != 'Complete' ) {
                    return false;
                }
            }
            return true;
        };

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
                    res.showLog = true;
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
                    $scope.imageEnable = imageEnable();
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

