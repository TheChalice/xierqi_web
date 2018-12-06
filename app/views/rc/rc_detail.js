'use strict';
angular.module('console.replication', [
    {
        files: [
            'views/rc/rc_detail.css',
            'components/deploymentsevent/deploymentsevent.js',
            'components/public_metrics/public_metrics.js'
        ]
    }
])
    .controller('rcCtrl', ['Confirm', 'delTip', '$rootScope', '$scope', '$stateParams', 'Metrics', 'PieChar', 'myPodList', '$interval', '$state', '$log', 'ReplicationController', 'myrc', 'ScaleRc', '$filter', 'DeploymentConfigRollback', 'DeploymentConfig', 'toastr',
        function (Confirm, delTip, $rootScope, $scope, $stateParams, Metrics, PieChar, myPodList, $interval, $state, $log, ReplicationController, myrc, ScaleRc, $filter, DeploymentConfigRollback, DeploymentConfig, toastr) {

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
            $scope.changeScale = function () {
                $scope.isShow = !$scope.isShow;
            };
            $scope.cancel = function () {
                $scope.isShow = !$scope.isShow;
            };
            var getMyrc = function () {
                $scope.replicaSet = angular.copy(myrc);
                // console.log('$scope.replicaSet', $scope.replicaSet);
                $scope.podsForService = {};
                $scope.envOrigin = $scope.replicaSet.spec.template.spec.containers[0];
                $scope.envProxy = $scope.replicaSet.spec.template.spec.containers[1];
                $scope.containerName = $scope.replicaSet.spec.template.spec.containers[0].name;
                $scope.conname = $scope.containerName;
                // console.log('$scope.containerName', $scope.containerName);
                $scope.replicaPods = filterForController(myPodList.items, myrc);
                // console.log('$scope.replicaPods-=-=-=', $scope.replicaPods);
                var poduid = [];
                for (var i = 0; i < $scope.replicaPods.length; i++) {
                    poduid.push($scope.replicaPods[i].metadata.uid);
                }
                $scope.poduid = poduid.join('|');
                $scope.isShow = true;
                $scope.confirm = function (num) {
                    ScaleRc.put({
                        namespace: $rootScope.namespace,
                        name: $scope.replicaSet.spec.selector.deploymentconfig,
                        kind: "Scale",
                        apiVersion: "extensions/v1beta1",
                        metadata: {
                            name: $scope.replicaSet.spec.selector.deploymentconfig,
                            namespace: $rootScope.namespace
                        },
                        spec: {
                            replicas: num
                        }
                    }, function (res) {
                        $scope.isShow = !$scope.isShow;
                        $scope.replicaSet.status.replicas = res.spec.replicas;
                        $scope.replicaSet.spec.replicas = res.spec.replicas;
                    })
                };

                var deploymentStatus = $filter('deploymentStatus');
                var deploymentIsLatest = $filter('deploymentIsLatest');
                $scope.showRollbackAction = function () {
                    return deploymentStatus($scope.replicaSet) === 'Complete' && !deploymentIsLatest($scope.replicaSet, $scope.deploymentConfig) && !$scope.replicaSet.metadata.deletionTimestamp;
                };
                $scope.flag = false;
                $scope.rollbackToDeployment = function (changeScaleSettings, changeStrategy, changeTriggers) {
                    $scope.flag = true;
                    var rollbackdata = {
                        kind: "DeploymentConfigRollback",
                        apiVersion: "v1",
                        spec: {
                            from: {name: $scope.replicaSet.metadata.name},
                            includeTemplate: true,
                            includeReplicationMeta: changeScaleSettings,
                            includeStrategy: changeStrategy,
                            includeTriggers: changeTriggers
                        }
                    };
                    DeploymentConfigRollback.create({namespace: $rootScope.namespace}, rollbackdata, function (data) {
                        console.log('DeploymentConfigRollback is ok');
                        DeploymentConfig.put({
                            namespace: $rootScope.namespace,
                            name: data.metadata.name
                        }, data, function (res) {
                            console.log('DeploymentConfig put is ok');
                            toastr.success('roll back 成功', {
                                timeOut: 2000,
                                closeButton: true
                            });
                            // if (res.kind === 'DeploymentConfig') {
                            //     Notification.success("Deployment #" + res.status.latestVersion + " is rolling back " + $scope.replicaSet.spec.selector.deploymentconfig + " to " + $scope.replicaSet.metadata.name + ".");
                            // }
                        })
                    })
                };
            };
            getMyrc();
            $scope.delete = function (name) {
                delTip.open("删除ReplicationController", name, true).then(function () {
                    ReplicationController.delete({namespace: $scope.namespace, name: name}, function (res) {
                        $state.go('console.deployments', {namespace: $rootScope.namespace});
                        toastr.success('操作成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                    }, function () {
                        Confirm.open("删除ReplicationController", "删除" + name + "失败", null, null, true)
                        toastr.error('删除失败,请重试', {
                            timeOut: 2000,
                            closeButton: true
                        });
                    })
                })
            }
        }]);


