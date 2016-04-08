'use strict';
angular.module('console.service.detail', [])
    .controller('ServiceDetailCtrl', ['$rootScope', '$scope', '$log', 'DeploymentConfig', function($rootScope, $scope, $log, DeploymentConfig) {
        $log.info("namespace", $rootScope.namespace);
        //获取服务列表
        var loadDcs = function () {
            DeploymentConfig.get({namespace: $rootScope.namespace}, function(res){
                $log.info("deploy")
            }, function(res){
                //todo 错误处理
            });
        };

        loadDcs();
    }]);
