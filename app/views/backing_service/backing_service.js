'use strict';
angular.module('console.backing_service',[
    {
        files: [
            'views/backing_service/backing_service.css',
            'components/bscard/bscard.js'
        ]
    }
])
.controller('BackingServiceCtrl',['$log','$rootScope','$scope','BackingService','BackingServiceInstance','ServiceSelect','BackingServiceInstanceBd','Confirm',function ($log,$rootScope,$scope,BackingService,BackingServiceInstance,ServiceSelect,BackingServiceInstanceBd,Confirm){
    $scope.status = {};
    $scope.grid = {
        serviceCat: 'all',
        vendor: 'all'
    };
    var loadBs = function(){
        BackingService.get({namespace:'openshift'},function(data){
            $log.info('loadBs',data);
            $scope.items = data.items;
            $scope.data = data.items;
        })
    }
    loadBs();
    var loadBsi = function () {
        BackingServiceInstance.get({namespace: $rootScope.namespace}, function(res){
            $log.info("backingServiceInstance", res);
            $scope.bsi = res;

        }, function(res){
            //todo 错误处理
            $log.info("loadBsi err", res);
        });
    };
    loadBsi();
    $scope.delBsi = function(idx){
        $log.info('del$scope.bsi.items[idx]',$scope.bsi.items[idx]);
        var curlength = $scope.bsi.items[idx].spec.binding.length;
        if(curlength > 0){
            Confirm.open('删除后端服务实例','该实例已绑定服务,不能删除','','',true)
        }else{
            Confirm.open('删除后端服务实例','您确定要删除该实例吗?此操作不可恢复','','',false).then(function(){
                BackingServiceInstance.del({namespace : $rootScope.namespace,name : $scope.bsi.items[idx].metadata.name},function(res){
                    $log.info('err',res);
                },function(res){
                    $log.info('err',res);
                })
            });

        }

    }
    $scope.delBing = function(idx){
        $log.info('delBing$scope.bsi',$scope.bsi.items[idx]);
        var curlength =  $scope.bsi.items[idx].spec.binding.length
        for(var i = 0 ;i < curlength;i++){
            if($scope.bsi.items[idx].spec.binding[i].checked == true){
                var bindObj = {
                    metadata: {
                        name: $scope.bsi.items[idx].metadata.name
                    },
                    resourceName : $scope.bsi.items[idx].spec.binding[i].bind_deploymentconfig,
                    bindResourceVersion : '',
                    bindKind : 'DeploymentConfig'
                };
                var j = i;
                BackingServiceInstanceBd.put({namespace: $rootScope.namespace,name : $scope.bsi.items[idx].metadata.name},bindObj, function(res){
                    $scope.bsi.items[idx].spec.binding.splice(j,1);
                    console.log(res+'OK');
                }, function(res){
                    //todo 错误处理
                    $log.info("err", res);
                });

            }
        }
        loadBsi();
    };
    var bindService = function(idx,objarr){
        for(var i = 0; i<objarr.length;i++){
            var bindObj = {
                metadata: {
                    name: $scope.bsi.items[idx].metadata.name
                },
                resourceName : objarr[i].metadata.name,
                bindResourceVersion : '',
                bindKind : 'DeploymentConfig'
            };
            BackingServiceInstanceBd.create({namespace: $rootScope.namespace,name : $scope.bsi.items[idx].metadata.name},bindObj,function(res){
                $log.info("bindService", res);
            })
        }
        loadBsi();
    };
    $scope.bindModal = function(idx){
        var curbsi = $scope.bsi.items[idx].spec.binding;
        ServiceSelect.open(curbsi).then(function(res){
            bindService(idx,res)
            $log.info("bind modal", res);
        });
    };
}])
.service('ServiceSelect', ['$uibModal', function($uibModal){
    this.open = function (c) {
        return $uibModal.open({
            templateUrl: 'views/backing_service/service_select.html',
            size: 'default modal-foo',
            controller: ['$log','$rootScope', '$scope', '$uibModalInstance', 'data', function($log,$rootScope, $scope, $uibModalInstance, data) {
                var curdata = angular.copy(data);
                for(var j = 0;j<data.items.length;j++){
                    for(var i = 0 ; i < c.length;i++){
                        if(data.items[j].metadata.name == c[i].bind_deploymentconfig){
                            curdata.items.splice(j,1);
                        }
                    }
                }
                $log.info('curdatacurdata',curdata);
                $scope.data = curdata;
                $scope.items = curdata.items;
                $scope.cancel = function() {
                    $uibModalInstance.dismiss();
                };
                $scope.ok = function() {
                    var items = [];
                    for (var i = 0; i < $scope.data.items.length; i++) {
                        if ($scope.data.items[i].checked) {
                            items.push($scope.data.items[i]);
                        }
                    }
                    $uibModalInstance.close(items);
                };

                $scope.$watch('txt', function(newVal, oldVal){
                   if (newVal != oldVal) {
                       $scope.search(newVal);
                   }
                });

                $scope.search = function (txt) {
                    if(!txt){
                        $scope.items = $scope.data.items;
                    }else{
                        $scope.items = [];
                        txt = txt.replace(/\//g, '\\/');
                        var reg = eval('/' + txt + '/');
                        angular.forEach($scope.data.items, function(item) {
                            if (reg.test(item.metadata.name)) {
                                $scope.items.push(item);
                            }
                        })
                    }
                };
            }],
            resolve: {
                data: ['$rootScope', 'Service', function ($rootScope, Service) {
                    return Service.get({namespace: $rootScope.namespace}).$promise;
                }]
            }
        }).result;
    }
}]);