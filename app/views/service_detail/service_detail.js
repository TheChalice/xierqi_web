'use strict';
angular.module('console.service.detail', [])
    .controller('ServiceDetailCtrl', ['$rootScope', '$scope', '$log', '$stateParams', 'DeploymentConfig', 'ReplicationController', 'Sort', 'Confirm',
        function($rootScope, $scope, $log, $stateParams, DeploymentConfig, ReplicationController, Sort, Confirm) {
        //获取服务列表
        var loadDc = function (name) {
            DeploymentConfig.get({namespace: $rootScope.namespace, name: name}, function(res){
                $log.info("deploymentConfigs", res);
                $scope.dc = res;

                loadRcs(res.metadata.name);

            }, function(res){
                //todo 错误处理
            });
        };

        loadDc($stateParams.name);

        var loadRcs = function (name) {
            var labelSelector = 'openshift.io/deployment-config.name=' + name;
            ReplicationController.get({namespace: $rootScope.namespace, labelSelector: labelSelector}, function(res){
                $log.info("replicationControllers", res);

                res.items = Sort.sort(res.items, -1);

                $scope.rcs = res;
            }, function(res){
                //todo 错误处理
            });
        };

        $scope.delete = function(){
            Confirm.open("删除服务", "您确定要删除服务吗?", "删除服务将清除构建的所有历史数据该操作不能被恢复", 'recycle').then(function() {
                DeploymentConfig.remove({
                    namespace: $rootScope.namespace,
                    name: $scope.dc.metadata.name
                }, function () {
                    $log.info("remove deploymentConfig success");

                    $state.go("console.service");

                }, function (res) {
                    $log.info("remove deploymentConfig fail", res);
                    //todo 错误处理
                });
            });
        };

        $scope.getLog = function(idx){
            var o = $scope.rcs.items[idx];
            o.showLog = !o.showLog;
            o.showConfig = false;

            //存储已经调取过的log
            if (o.log) {
                return;
            }
            DeploymentConfig.log.get({namespace: $rootScope.namespace, name: $scope.dc.metadata.name}, function(res){
                var result = "";
                for(var k in res){
                    result += res[k];
                }
                o.log = result;
            }, function(res){
                //todo 错误处理
                $log.info("err", res);
            });
        };

        $scope.getConfig = function(idx){
            var o = $scope.rcs.items[idx];
            o.showConfig = !o.showConfig;
            o.showLog = false;

            //todo 获取更多的配置
        };

    }])
    .filter('rcStatusFilter', [function() {
        return function(phase) {
            if (phase == "Complete") {
                return "部署成功"
            } else if (phase == "Running") {
                return "正在部署"
            } else if (phase == "Failed") {
                return "部署失败"
            } else if (phase == "Error") {
                return "部署错误"
            } else if (phase == "Cancelled") {
                return "终止"
            } else {
                return phase || "-"
            }
        };
    }]);
