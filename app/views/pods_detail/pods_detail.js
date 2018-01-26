'use strict';
angular.module('console.pods_detail', [
        'kubernetesUI',
        {
            files: [
                'views/pods_detail/pods_detail.css',
                'components/deploymentsevent/deploymentsevent.js',
                'components/public_metrics/public_metrics.js',
            ]
        }
    ])
    .controller('podsdetailCtrl', ['$rootScope', '$scope', '$state', '$log', 'mypod','Ws','Metrics','podList','Pod',
        function ($rootScope, $scope, $state, $log,mypod,Ws,Metrics,podList,Pod) {

            $scope.podlist = angular.copy(podList);
            $scope.pod=angular.copy(mypod);
            console.log('mypod',mypod);
            $scope.containers = $scope.pod.spec.containers;
            $scope.environment = $scope.pod.spec.containers[0].env;

            $scope.$on('$destroy', function () {
                Ws.clear();
            });


            var getOwnerReferences = function(apiObject) {
                return _.get(apiObject, 'metadata.ownerReferences');
            };
            $scope.delete = function(name){
                Pod.delete({ namespace: $scope.namespace,name:name }, function(res) {
                    $state.go('console.pods');
                });
            }
            
        }])


