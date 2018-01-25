/**
 * Created by niuniu on 2018/1/5.
 */
'use strict';
angular.module('console.rs', [
    {
        files: [
            'views/rs/rs_detail.css',
            'components/deploymentsevent/deploymentsevent.js',
            'components/public_metrics/public_metrics.js'
        ]
    }
])
    .controller('rsCtrl', ['$rootScope', '$scope', '$stateParams', 'Metrics', 'PieChar', 'myPodList', 'ScaleRs', '$interval', '$state', '$log', 'ReplicaSet','Ws','myrs',
        function ($rootScope, $scope, $stateParams, Metrics, PieChar, myPodList, ScaleRs, $interval, $state, $log, ReplicaSet, Ws, myrs) {


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
            var getMyRs = function () {
                $scope.replicaSet = angular.copy(myrs);
                // console.log('$scope.replicaSet', $scope.replicaSet);

                $scope.envOrigin = $scope.replicaSet.spec.template.spec.containers[0];
                $scope.envProxy = $scope.replicaSet.spec.template.spec.containers[1];
                $scope.containerName = $scope.replicaSet.spec.template.spec.containers[0].name;
                $scope.conname = $scope.containerName;
                $scope.scaleName = $scope.replicaSet.metadata.labels.app;
                // console.log('$scope.containerName', $scope.containerName);
                $scope.replicaPods = filterForController(myPodList.items, myrs);
                // console.log('$scope.replicaPods-=-=-=', $scope.replicaPods);
                var poduid = [];
                for (var i = 0; i < $scope.replicaPods.length; i++) {
                    poduid.push($scope.replicaPods[i].metadata.uid);
                }

                $scope.poduid = poduid.join('|');

                $scope.$on("$destroy",
                    function () {
                        Ws.clear();
                    }
                );
                $scope.isShow = true;
                $scope.confirm = function (num) {
                    ScaleRs.put({
                        namespace: $rootScope.namespace,
                        name: $scope.replicaSet.metadata.labels.app,
                        kind: "Scale",
                        apiVersion: "extensions/v1beta1",
                        metadata: {
                            name: $scope.replicaSet.metadata.labels.app,
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
            getMyRs();

        }]);