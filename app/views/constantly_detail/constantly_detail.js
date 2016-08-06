'use strict';
angular.module('console.constantly_detail', [
        {
            files: [

            ]
        }
    ])
    .controller('constDetailCtrl', ['Confirm','delvolume','volume','DeploymentConfig','persistent','$stateParams','$state', '$http', '$scope', '$rootScope',
        function(Confirm,delvolume,volume,DeploymentConfig,persistent,$stateParams,$state, $http, $scope, $rootScope){
            console.log($stateParams.name);
            $scope.name=$stateParams.name
            persistent.get({namespace: $rootScope.namespace,name:$stateParams.name}, function (res) {
                //console.log('chijiu',res);
                res.arr=[];
                DeploymentConfig.get({namespace: $rootScope.namespace}, function (dcres) {
                    angular.forEach(dcres.items, function (dcitem,i) {
                        angular.forEach(dcitem.spec.template.spec.volumes, function (item,i) {
                            if (res.metadata.name == item.persistentVolumeClaim.claimName) {
                                res.arr.push(dcitem.metadata.name)
                            }
                        })
                    })
                    $scope.persistents=res;
                    console.log('chijiu',res);
                })
            }, function (err) {

            })
            $scope.delete= function () {
                Confirm.open("删除持久化卷", "您确定要删除持久化卷吗？", "持久化卷中的数据将被删除", "stop").then(function(){

                        delvolume.del({namespace: $rootScope.namespace,name:$stateParams.name}, function (res) {
                            console.log(res);
                            $state.go('console.resource_management', {index: 1})
                        }, function (err) {
                            Confirm.open("删除持久化卷", "删除持久化卷失败", "持久化卷已经挂载在容器中,您需要先停止服务,         卸载持久化卷后,才能删除.", null,true)
                        })


                })


            }


        }]);