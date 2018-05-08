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
    .controller('podsdetailCtrl', ['$rootScope', '$scope', '$state', '$log', 'mypod','Ws','Metrics','podList','Pod','delTip','Confirm','toastr',
        function ($rootScope, $scope, $state, $log,mypod,Ws,Metrics,podList,Pod,delTip,Confirm,toastr) {

            $scope.podlist = angular.copy(podList);
            $scope.pod=angular.copy(mypod);
            console.log('mypod',mypod);
            $scope.containers = $scope.pod.spec.containers;
            $scope.$on('$destroy', function () {
                Ws.clear();
            });


            var getOwnerReferences = function(apiObject) {
                return _.get(apiObject, 'metadata.ownerReferences');
            };
            $scope.delete = function(name){
                delTip.open("删除Pod", name, true).then(function () {
                    Pod.delete({ namespace: $scope.namespace,name:name }, function (res) {
                        $state.go('console.pods',{namespace:$rootScope.namespace});
                        toastr.success('操作成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                    }, function () {
                        Confirm.open("删除Pod", "删除" + name + "失败", null, null, true)
                        toastr.error('删除失败,请重试', {
                            timeOut: 2000,
                            closeButton: true
                        });
                    })
                })
            }
            
        }])


