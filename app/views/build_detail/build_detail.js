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
    .controller('BuildDetailCtrl', ['$rootScope', '$scope', '$log', '$stateParams', '$state', 'BuildConfig', 'Build', 'Confirm', 'UUID', function ($rootScope, $scope, $log, $stateParams, $state, BuildConfig, Build, Confirm, UUID) {
        $scope.grid = {};
        $scope.bcName = $stateParams.name;

        $scope.$on('image-enable', function(e, enable){
            $scope.imageEnable = enable;
        });

        var loadBuildConfig = function() {
            BuildConfig.get({namespace: $rootScope.namespace, name: $stateParams.name}, function(data){
                $log.info('data', data);
                $scope.data = data;
                if (data.spec && data.spec.completionDeadlineSeconds){
                    $scope.grid.completionDeadlineMinutes = parseInt(data.spec.completionDeadlineSeconds / 60);
                }
                if (data.spec.triggers.length) {
                    $scope.grid.checked = 'start';
                    $scope.grid.checkedLocal = true;
                }
            }, function(res) {
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
            BuildConfig.instantiate.create({namespace: $rootScope.namespace, name: name}, buildRequest, function(res){
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
                BuildConfig.remove({namespace: $rootScope.namespace, name: name}, {}, function(){
                    $log.info("remove buildConfig success");

                    removeBuilds($scope.data.metadata.name);

                    $state.go("console.build");
                }, function(res){
                    //todo 错误处理
                });
            });
        };

        var removeBuilds = function (bcName) {
            if (!bcName) {
                return;
            }
            Build.remove({namespace: $rootScope.namespace, labelSelector: 'buildconfig=' + bcName}, function(){
                $log.info("remove builds of " + bcName + " success");
            }, function(res){
                $log.info("remove builds of " + bcName + " error");
            });
        };

        $scope.$watch('grid.checked', function(newVal, oldVal){
            if (newVal == "start") {
                return;
            }
            if (newVal != oldVal){
                $scope.saveTrigger();
            }
        });

        $scope.saveTrigger = function(){
            var name = $scope.data.metadata.name;
            if($scope.grid.checked){
                $scope.data.spec.triggers = [
                    {
                        type: 'GitHub',
                        github: {
                            secret: UUID.guid().replace(/-/g, "")
                        }
                    }
                ];
            } else {
                $scope.data.spec.triggers = [];
            }
            BuildConfig.put({namespace: $rootScope.namespace, name: name}, $scope.data, function (res) {
                $log.info("put success", res);
                $scope.data = res;
                $scope.deadlineMinutesEnable = false;
                $scope.grid.checkedLocal = $scope.grid.checked;
            }, function(res) {
                //todo 错误处理
                $log.info("put failed");
            });
        };

        $scope.save = function(){
            if (!$scope.deadlineMinutesEnable) {
                $scope.deadlineMinutesEnable = true;
                return;
            }
            var name = $scope.data.metadata.name;
            $scope.data.spec.completionDeadlineSeconds = $scope.grid.completionDeadlineMinutes * 60;
            BuildConfig.put({namespace: $rootScope.namespace, name: name}, $scope.data, function (res) {
                $log.info("put success", res);
                $scope.data = res;
                $scope.deadlineMinutesEnable = false;
            }, function(res) {
                //todo 错误处理
                $log.info("put failed");
            });
        };

    }]);

