/**
 * Created by niuniu on 2018/7/26.
 */
'use strict';

angular.module('console.monitoring', [
    {
        files: [
            'views/monitoring/monitoring.css',
            'components/public_metrics/public_metrics.js'
        ]
    }
])
    .controller('MonitoringCtrl', ['$rootScope', '$scope', '$state', 'monitoringPods', 'monitoringReplicas', 'monitoringReplicaSet', 'BuildConfig', 'Build', 'Sort', 'monitoringStatefulSets', 'monitoringBuild',
        function ($rootScope, $scope, $state, monitoringPods, monitoringReplicas, monitoringReplicaSet, BuildConfig, Build, Sort, monitoringStatefulSets, monitoringBuild) {
            $scope.bodyclass = true;
            $scope.allList = ['All', 'Pods', 'Deployments', 'Builds', 'Stateful Sets'];
            $scope.curListName = "All";
            $scope.podsItem = angular.copy(monitoringPods);
            $scope.podsItemData = $scope.podsItem.items;
            $scope.replicasItem = angular.copy(monitoringReplicas);
            $scope.replicasItemData = $scope.replicasItem.items;
            $scope.replicaSetItem = angular.copy(monitoringReplicaSet);
            $scope.statefulSets = angular.copy(monitoringStatefulSets);
            $scope.statefulSetsData = $scope.statefulSets.items;
            $scope.builds = angular.copy(monitoringBuild);
            $scope.buildsData = $scope.builds.items;
            $scope.grid = {
                txt : ''
            };
            var refresh = function () {
                // console.log('refresh');
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                $scope.podsItemData = $scope.podsItem.items;
                $scope.replicasItemData = $scope.replicasItem.items;
                $scope.statefulSetsData = $scope.statefulSets.items;
                $scope.buildsData = $scope.builds.items;
            };
            $scope.editEvent = function () {
                $state.go("console.events", {namespace: $rootScope.namespace})
            };
            $scope.savelog = function (log) {
                var filename = _.get($scope, 'object.metadata.name', 'openshift') + '.log';
                var blob = new Blob([$scope.result], {type: "text/plain;charset=utf-8"});
                saveAs(blob, filename);
            };
            $scope.checkCurListName = function (name) {
                // console.log('name', name);
                $scope.curListName = name;
                // console.log('$scope.curListName', $scope.curListName);
            };

            $scope.searchName = function (name) {
                console.log('name', name);
                if(!$scope.grid.txt){
                    refresh();
                    return
                }else{
                    var arr = [];
                    var arrReplicasItem = [];
                    var arrStatefulSets = [];
                    var arrBuilds = [];
                    var str = $scope.grid.txt;
                    //in pods
                    for (var i = 0; i < $scope.podsItem.items.length; i++) {
                        var nstr = $scope.podsItem.items[i].metadata.name;
                        if (nstr.indexOf(str) !== -1) {
                            arr.push($scope.podsItem.items[i])
                        }
                    }
                    $scope.podsItemData = arr;
                    //in dc
                    for (var j = 0; j < $scope.replicasItem.items.length; j++) {
                        var nstrArrReplicasItem = $scope.replicasItem.items[j].metadata.name;
                        if (nstrArrReplicasItem.indexOf(str) !== -1) {
                            arrReplicasItem.push($scope.replicasItem.items[j])
                        }
                    }
                    $scope.replicasItemData = arrReplicasItem;
                    //in statefulSets
                    for (var l = 0; l < $scope.statefulSets.items.length; l++) {
                        var nstrStatefulSets = $scope.statefulSets.items[l].metadata.name;
                        if (nstrStatefulSets.indexOf(str) !== -1) {
                            arrStatefulSets.push($scope.statefulSets.items[l])
                        }
                    }
                    $scope.statefulSetsData = arrStatefulSets;
                    // in builds
                    for (var k = 0; k < $scope.builds.items.length; k++) {
                        var nstrBuilds = $scope.builds.items[k].metadata.name;
                        if (nstrBuilds.indexOf(str) !== -1) {
                            arrBuilds.push($scope.builds.items[k])
                        }
                    }
                    $scope.buildsData = arrBuilds;
                }
            };
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
            $scope.openCon = function (idx, type) {
                if (type == 'pod') {
                    if ($scope.podsItem.items[idx].isLog) {
                        $scope.podsItem.items[idx].isLog = false;
                    } else {
                        $scope.podsItem.items[idx].isLog = true;
                    }
                } else if (type == 'rc') {
                    if ($scope.replicasItem.items[idx].isLog) {
                        $scope.replicasItem.items[idx].isLog = false;
                    } else {
                        $scope.replicasItem.items[idx].isLog = true;
                    }
                    $scope.rcPods = filterForController($scope.podsItem.items, $scope.replicasItem.items[idx]);
                    var poduid = [];
                    for (var i = 0; i < $scope.rcPods.length; i++) {
                        poduid.push($scope.rcPods[i].metadata.uid);
                    }
                    $scope.rcPoduid = poduid.join('|');
                } else if (type == 'stateful') {
                    if ($scope.statefulSets.items[idx].isLog) {
                        $scope.statefulSets.items[idx].isLog = false;
                    } else {
                        $scope.statefulSets.items[idx].isLog = true;
                    }
                    $scope.statefulPods = filterForController($scope.podsItem.items, $scope.statefulSets.items[idx]);
                    var poduid = [];
                    for (var i = 0; i < $scope.statefulPods.length; i++) {
                        poduid.push($scope.statefulPods[i].metadata.uid);
                    }
                    $scope.statefulPoduid = poduid.join('|');
                } else if (type == 'bc') {
                    if ($scope.builds.items[idx].isLog) {
                        $scope.builds.items[idx].isLog = false;
                    } else {
                        $scope.builds.items[idx].isLog = true;
                    }
                }

            };
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