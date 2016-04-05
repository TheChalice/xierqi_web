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
    .controller('BuildDetailCtrl', ['$rootScope', '$scope', '$log', '$stateParams', '$state', 'BuildConfig', 'Build', 'Confirm', function ($rootScope, $scope, $log, $stateParams, $state, BuildConfig, Build, Confirm) {
        $scope.grid = {};
        $scope.bcName = $stateParams.name;

        var loadBuildConfig = function() {
            BuildConfig.get({namespace: $rootScope.namespece, name: $stateParams.name}, function(data){
                $log.info('data', data);
                $scope.data = data;
                if (data.spec && data.spec.completionDeadlineSeconds){
                    $scope.grid.completionDeadlineMinutes = parseInt(data.spec.completionDeadlineSeconds / 60);
                }
                imageEnable();
            }, function(res) {
                //错误处理
            });
        };

        loadBuildConfig();

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
            BuildConfig.instantiate.create({namespace: $rootScope.namespece, name: name}, buildRequest, function(res){
                $log.info("build instantiate success");
                $scope.active = 1;  //打开记录标签
                $scope.$broadcast('timeline', 'add', res);
            }, function(res){
                //todo 错误处理
            });
        };

        $scope.delete = function(){
            var name = $scope.data.metadata.name;
            Confirm.open("删除构建", "您确定要删除构建吗?", "删除构建将清除构建的所有历史数据以及相关的镜像该操作不能被恢复", 'recycle').then(function() {
                BuildConfig.remove({namespace: $rootScope.namespece, name: name}, {}, function(){
                    $log.info("remove buildConfig success");

                    removeBuilds($scope.data.metadata.name);

                    $state.go("console.build");
                }, function(res){
                    //todo 错误处理
                });
            });
        };

        var removeBuilds = function (bcName) {
            Build.remove({namespace: $rootScope.namespece}, {labelSelector: 'buildconfig=' + bcName}, function(){
                $log.info("remove builds of " + bcName + " success");
            }, function(res){
                $log.info("remove builds of " + bcName + " error");
            });
        };

        $scope.save = function(){
            if (!$scope.deadlineMinutesEnable) {
                $scope.deadlineMinutesEnable = true;
                return;
            }
            var name = $scope.data.metadata.name;
            $scope.data.spec.completionDeadlineSeconds = $scope.grid.completionDeadlineMinutes * 60;
            BuildConfig.put({namespace: $rootScope.namespece, name: name}, $scope.data, function (res) {
                $log.info("put success", res);
                $scope.deadlineMinutesEnable = false;
            }, function(res) {
                //todo 错误处理
                $log.info("put failed");
            });
        };

    }]);

