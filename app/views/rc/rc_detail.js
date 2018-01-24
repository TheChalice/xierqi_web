/**
 * Created by niuniu on 2018/1/5.
 */
'use strict';
angular.module('console.rc', [
    {
        files: [
            'views/rc/rc_detail.css',
            'components/deploymentsevent/deploymentsevent.js',
            'components/public_metrics/public_metrics.js'
        ]
    }
])
    .controller('rcCtrl', ['$rootScope', '$scope', '$stateParams', 'Metrics', 'PieChar', 'myPodList', '$interval', '$state', '$log', 'ReplicationController', 'myrc', 'ScaleRc',
        function ($rootScope, $scope, $stateParams, Metrics, PieChar, myPodList, $interval, $state, $log, ReplicationController, myrc, ScaleRc) {

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
                $scope.changeScale = function () {
                    $scope.isShow = !$scope.isShow;
                };
                $scope.cancel = function () {
                    $scope.isShow = !$scope.isShow;
                }
            };
            getMyrc();
        }]);


