/**
 * Created by niuniu on 2018/7/26.
 */
'use strict';

angular.module('console.monitoring', [
    {
        files: [
            'views/monitoring/monitoring.css',
            'components/public_metrics/public_metrics.js',
        ]
    }
])
    .controller('MonitoringCtrl', ['$rootScope', '$scope', 'monitoringPods', 'monitoringReplicas', 'monitoringReplicaSet', 'BuildConfig', 'Build', 'Sort','monitoringStatefulSets','monitoringBuild',
        function ($rootScope, $scope, monitoringPods, monitoringReplicas, monitoringReplicaSet, BuildConfig, Build, Sort,monitoringStatefulSets,monitoringBuild) {
            $scope.bodyclass = true;
            $scope.allList = ['All', 'Pods', 'Deployments', 'Builds', 'Stateful Sets'];
            $scope.curListName = "All"
            $scope.podsItem = angular.copy(monitoringPods);
            $scope.replicasItem = angular.copy(monitoringReplicas);
            $scope.replicaSetItem = angular.copy(monitoringReplicaSet);
            $scope.statefulSets =  angular.copy(monitoringStatefulSets);
            $scope.builds= angular.copy(monitoringBuild);
            /////////
            $scope.checkCurListName = function(name){
                console.log('name',name);
                $scope.curListName = name;
                console.log('$scope.curListName',$scope.curListName);
            }
            ////rc监控
            var getOwnerReferences = function (apiObject) {
                return _.get(apiObject, 'metadata.ownerReferences');
            };

            var filterForController = function (apiObjects, controller) {
                var controllerUID = _.get(controller, 'metadata.uid');
                return _.filter(apiObjects, function (apiObject) {
                    return _.some(getOwnerReferences(apiObject), {
                        uid: controllerUID,
                        controller: true
                    });
                });
            };
            ////////列表展开收缩
            $scope.openCon = function(idx,type){
                if(type=='pod'){
                    if($scope.podsItem.items[idx].isLog){
                        $scope.podsItem.items[idx].isLog = false;
                    }else{
                        $scope.podsItem.items[idx].isLog = true;
                    }
                }else if(type=='rc'){
                    if($scope.replicasItem.items[idx].isLog){
                        $scope.replicasItem.items[idx].isLog = false;
                    }else{
                        $scope.replicasItem.items[idx].isLog = true;
                    }
                    $scope.rcPods = filterForController($scope.podsItem.items,$scope.replicasItem.items[idx]);
                    var poduid = [];
                    for (var i = 0; i < $scope.rcPods.length; i++) {
                        poduid.push($scope.rcPods[i].metadata.uid);
                    }
                    $scope.rcPoduid = poduid.join('|');
                }else if(type=='stateful'){
                    if($scope.statefulSets.items[idx].isLog){
                        $scope.statefulSets.items[idx].isLog = false;
                    }else{
                        $scope.statefulSets.items[idx].isLog = true;
                    }
                    $scope.statefulPods = filterForController($scope.podsItem.items,$scope.statefulSets.items[idx]);
                    var poduid = [];
                    for (var i = 0; i < $scope.statefulPods.length; i++) {
                        poduid.push($scope.statefulPods[i].metadata.uid);
                    }
                    $scope.statefulPoduid = poduid.join('|');
                }else if(type=='bc'){
                    if($scope.builds.items[idx].isLog){
                        $scope.builds.items[idx].isLog = false;
                    }else{
                        $scope.builds.items[idx].isLog = true;
                    }
                }

            }
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