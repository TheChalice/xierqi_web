/**
 * Created by niuniu on 2018/7/26.
 */
'use strict';

angular.module('console.monitoring', [
    {
        files: [
            'views/monitoring/monitoring.css'
        ]
    }
])
    .controller('MonitoringCtrl', ['$rootScope', '$scope', 'monitoringPods', 'monitoringReplicas', 'monitoringReplicaSet', 'BuildConfig', 'Build', 'Sort',
        function ($rootScope, $scope, monitoringPods, monitoringReplicas, monitoringReplicaSet, BuildConfig, Build, Sort) {
            $scope.bodyclass = true;
            $scope.allList = ['All', 'Pods', 'Deployments', 'Builds', 'Stateful Sets'];
            $scope.podsItem = angular.copy(monitoringPods);
            $scope.replicasItem = angular.copy(monitoringReplicas);
            $scope.replicaSetItem = angular.copy(monitoringReplicaSet);
            // console.log('111',$scope.podsItem);
            // console.log('121',$scope.replicasItem);
            // console.log('113',$scope.replicaSetItem);
            var loadBuildConfigs = function() {
                BuildConfig.get({namespace: $rootScope.namespace,region:$rootScope.region}, function(data){
                    data.items = Sort.sort(data.items, -1); //排序
                    $scope.data = data.items;
                    loadBuilds($scope.data);
                }, function(res) {
                    //todo 错误处理
                });
            };

            //根据buildConfig标签获取build列表
            var loadBuilds = function(items){
                var labelSelector = '';
                if (items.length > 0) {
                    labelSelector = 'buildconfig in (';
                    for (var i = 0; i < items.length; i++) {
                        labelSelector += items[i].metadata.name + ','
                    }
                    labelSelector = labelSelector.substring(0, labelSelector.length - 1) + ')';
                }
                Build.get({namespace: $rootScope.namespace, labelSelector: labelSelector,region:$rootScope.region}, function (data) {
                    // console.log('114',data);
                    $scope.resourceVersion = data.metadata.resourceVersion;
                });
            };
            loadBuildConfigs();
            $scope.kinds = [
                {
                    kind: "All"
                },
                {
                    kind: "Pods"
                },
                {
                    label: "Deployments",
                    kind: "ReplicationControllers"
                },
                {
                    kind: "Builds"
                },
                {
                    kind: "StatefulSets"
                }
            ];
        }]);