'use strict';
angular.module('console.persistentvolumeclaim_detail', [
    {
        files: []
    }
])
    .controller('constDetailCtrl', ['delorders', 'orders', 'Confirm', 'delvolume', 'volume', 'DeploymentConfig', 'persistent', '$stateParams', '$state', '$http', '$scope', '$rootScope', 'toastr',
        function (delorders, orders, Confirm, delvolume, volume, DeploymentConfig, persistent, $stateParams, $state, $http, $scope, $rootScope, toastr) {
            //console.log($stateParams.name);
            $scope.name = $stateParams.name;
            $scope.guazai = '未挂载';
            persistent.get({
                namespace: $rootScope.namespace,
                name: $stateParams.name,
                region: $rootScope.region
            }, function (res) {
                //console.log('chijiu',res);
                res.arr = [];
                DeploymentConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (dcres) {
                    angular.forEach(dcres.items, function (dcitem, i) {
                        angular.forEach(dcitem.spec.template.spec.volumes, function (item, i) {
                            if (item.persistentVolumeClaim && res.metadata.name == item.persistentVolumeClaim.claimName) {
                                $scope.guazai = '已挂载';
                                var has = false;
                                angular.forEach(res.arr, function (key, j) {
                                    if (key === dcitem.metadata.name) {
                                        has = true
                                    }
                                });
                                if (!has) {
                                    res.arr.push(dcitem.metadata.name)
                                }

                            }
                        })
                    });
                    res.spec.resources.requests.storage = res.spec.resources.requests.storage.replace('i', 'B')
                    $scope.persistents = res;
                    //console.log('chijiu',res);
                })
            }, function (err) {
                $state.go('console.resource_persistentVolume', {namespace: $rootScope.namespace})
            });
            $scope.delete = function () {

                Confirm.open("删除存储卷", "您确定要删除存储卷吗？", "存储卷中的数据将被删除", "stop").then(function () {

                    if ($scope.persistents.arr.length > 0) {
                        Confirm.open("删除存储卷", "删除存储卷失败", "存储卷已经挂载在容器中，您需要先停止服务，卸载存储卷后，才能删除。", null, true)

                    } else {
                        //orders.query({region:$rootScope.region,resource_name:$stateParams.name,namespace:$rootScope.namespace,
                        //    status:'consuming'}, function (data) {
                        //    console.log('data',data);
                        //    if (data.length>0&&data[0].order.id) {
                        //        delorders.delete({id:data[0].order.id,action:"cancel",namespace:$rootScope.namespace}, function (data) {
                        //            $state.go('console.resource_management', {index: 1})
                        //        })
                        //
                        //    }else {
                        delvolume.del({namespace: $rootScope.namespace, name: $stateParams.name}, function (res) {
                            //console.log(res);
                            // $state.go('console.resource_management', {index: 1})
                            toastr.success('删除成功', {
                                closeButton: true
                            });
                            $state.go('console.resource_persistentVolume', {namespace: $rootScope.namespace})
                        }, function (err) {
                            toastr.error('删除失败，请重试', {
                                closeButton: true
                            });
                        });
                        //}
                        //})
                    }
                })
            }
            $scope.editYaml = function () {
                $state.go('console.edit_yaml_file',{namespace: $rootScope.namespace, name: $scope.persistents.metadata.name,kind: $scope.persistents.kind});
            };
        }]);