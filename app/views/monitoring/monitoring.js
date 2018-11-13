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
            $scope.replicaSetItem = angular.copy(monitoringReplicaSet);
            $scope.deploymentsData = $scope.replicasItem.items.concat($scope.replicaSetItem.items);
            $scope.replicasItemData = $scope.deploymentsData;

            // console.log('090900===',$scope.replicaSetItem);
            $scope.statefulSets = angular.copy(monitoringStatefulSets);
            $scope.statefulSetsData = $scope.statefulSets.items;
            $scope.builds = angular.copy(monitoringBuild);
            $scope.buildsData = $scope.builds.items;
            $scope.grid = {
                txt: '',
                isHide: false
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
            };
            function group(data, assistantFilter) {
                // console.log('assistantFilter==',assistantFilter);
                const result = {};
                for (var i in data) {
                    var item = data[i];

                    // 把状态不满足的item筛除
                    if (!assistantFilter) continue;
                    var key = item['metadata']['ownerReferences'][0]['name'];
                    // var key = item['metadata']['labels']['app'];
                    var targetLastItem = result[key];
                    if (!targetLastItem) {
                        targetLastItem = [];
                        result[key] = item;
                        continue;
                    }
                    result[key] = getNewItem(item, targetLastItem);
                }
                return result;
            }

            function getNewItem(item1, item2) {
                return getItemVersion(item1) > item2 ? item1 : item2;
            }

            function getItemVersion(item) {
                var tmpArr = item.metadata.name.split('-');
                var versionStr = tmpArr[tmpArr.length - 1];
                return parseInt(versionStr);
            }
            function itemsInHiddenMode(originalDatas, assistantFilter) {
                if(!originalDatas){
                    return []
                }
                var resultArr = Object.entries(group(originalDatas, assistantFilter));
                resultArr.sort(function (a, b) {
                    if (a[0] > b[0]) return 1;
                    else return 0;
                });
                resultArr = resultArr.map(function (item) {
                    return item[1];
                });
                return resultArr;
            }
            function reservePodItemInHiddenMode(item) {
                // console.log('-=-=',item);
                if(item['status']['phase'] === 'Running'){
                    return true;
                }
                return false;
            }
            function reserveReplicasItemInHiddenMode(item) {
                if(item['status']['phase'] === 'Active'){
                    return true;
                }
                return false;
            }
            function reserveBuildItemInHiddenMode(item) {
                if(item['status']['phase'] === 'Complete'){
                    return true;
                }
                return false;
            }
            function reserveStatefulItemInHiddenMode(item) {
                if(item['status']['phase'] === 'Active'){
                    return true;
                }
                return false;
            }
            $scope.hideOlderResources = function (status) {
                if (status === true) {
                    // itemsInHiddenMode
                    $scope.podsItemData = itemsInHiddenMode($scope.podsItemData, reservePodItemInHiddenMode);
                    $scope.replicasItemData = itemsInHiddenMode($scope.deploymentsData, reserveReplicasItemInHiddenMode);
                    $scope.statefulSetsData = itemsInHiddenMode($scope.statefulSetsData, reserveStatefulItemInHiddenMode);
                    $scope.buildsData = itemsInHiddenMode($scope.buildsData,reserveBuildItemInHiddenMode);
                } else {
                    $scope.podsItemData = $scope.podsItem.items;
                    $scope.replicasItemData = $scope.deploymentsData;
                    $scope.statefulSetsData = $scope.statefulSets.items;
                    $scope.buildsData = $scope.builds.items;
                }
            };
            $scope.searchName = function (name) {
                // console.log('name', name);
                if (!$scope.grid.txt) {
                    $scope.podsItemData = $scope.podsItem.items;
                    $scope.replicasItemData = $scope.deploymentsData;
                    $scope.statefulSetsData = $scope.statefulSets.items;
                    $scope.buildsData = $scope.builds.items;
                    return
                } else {
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
                    for (var j = 0; j < $scope.deploymentsData.length; j++) {
                        var nstrArrReplicasItem = $scope.deploymentsData[j].metadata.name;
                        if (nstrArrReplicasItem.indexOf(str) !== -1) {
                            arrReplicasItem.push($scope.deploymentsData[j])
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