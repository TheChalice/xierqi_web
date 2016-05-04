'use strict';
angular.module('console.backing_service_detail', [
        {
            files: [
                'views/backing_service_detail/backing_service_detail.css'
            ]
        }
    ])
    .controller('BackingServiceInstanceCtrl',['$log','$scope','$rootScope','$stateParams','BackingService', 'BackingServiceInstance','ServiceSelect','Confirm','BackingServiceInstanceBd',function($log,$scope,$rootScope,$stateParams,BackingService,BackingServiceInstance,ServiceSelect,Confirm,BackingServiceInstanceBd){
        var cuename = $stateParams.name;
        var loadBs = function(){
            BackingService.get({namespace:'openshift',name:cuename},function(data){
                $log.info('loadBs=====',data);
                $scope.data = data;

            })
        }
        loadBs();
        var loadBsi = function () {
            BackingServiceInstance.get({namespace: $rootScope.namespace}, function(res){
                $log.info("backingServiceInstance", res);
                $scope.bsi = [];
                for(var i = 0 ; i < res.items.length;i++){
                    if(res.items[i].spec.provisioning.backingservice_name == cuename){
                        $scope.bsi.push(res.items[i]);
                    }
                }
                $log.info("$scope.bsi====", $scope.bsi);
            }, function(res){
                //todo 错误处理
                $log.info("loadBsi err", res);
            });
        };
        loadBsi();
        $scope.delBsi = function(idx){
            $log.info('del$scope.bsi.items[idx]',$scope.bsi[idx]);
            if($scope.bsi[idx].spec.binding){
                var curlength = $scope.bsi[idx].spec.binding.length;
                if(curlength > 0){
                    Confirm.open('删除后端服务实例','该实例已绑定服务,不能删除','','',true)
                }else{
                    Confirm.open('删除后端服务实例','您确定要删除该实例吗?此操作不可恢复','','',false).then(function(){
                        BackingServiceInstance.del({namespace : $rootScope.namespace,name : $scope.bsi[idx].metadata.name},function(res){
                            $scope.bsi.splice(idx,1);
                        },function(res){
                            $log.info('err',res);
                        })
                    });

                }
            }else{
                Confirm.open('删除后端服务实例','您确定要删除该实例吗?此操作不可恢复','','',false).then(function(){
                    BackingServiceInstance.del({namespace : $rootScope.namespace,name : $scope.bsi[idx].metadata.name},function(res){
                        $scope.bsi.splice(idx,1);
                    },function(res){
                        $log.info('err',res);
                    })
                });
            }


        }
        $scope.delBing = function(idx){
            $log.info('delBing$scope.bsi',$scope.bsi[idx]);
            var curlength =  $scope.bsi[idx].spec.binding.length
            for(var i = 0 ;i < curlength;i++){
                if($scope.bsi[idx].spec.binding[i].checked == true){
                    var bindObj = {
                        metadata: {
                            name: $scope.bsi[idx].metadata.name
                        },
                        resourceName : $scope.bsi[idx].spec.binding[i].bind_deploymentconfig,
                        bindResourceVersion : '',
                        bindKind : 'DeploymentConfig'
                    };
                    var j = i;
                    BackingServiceInstanceBd.put({namespace: $rootScope.namespace,name : $scope.bsi[idx].metadata.name},bindObj, function(res){
                        $scope.bsi[idx].spec.binding.splice(j,1);
                        $log.info('delbind',res);
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
                        name: $scope.bsi[idx].metadata.name
                    },
                    resourceName : objarr[i].metadata.name,
                    bindResourceVersion : '',
                    bindKind : 'DeploymentConfig'
                };
                BackingServiceInstanceBd.create({namespace: $rootScope.namespace,name : $scope.bsi[idx].metadata.name},bindObj,function(res){
                    $log.info("bindService", res);
                })
            }
            loadBsi();
        };
        $scope.bindModal = function(idx){
            var curbsi = $scope.bsi[idx].spec.binding;
            ServiceSelect.open(curbsi).then(function(res){
                bindService(idx,res)
                $log.info("bind modal", res);
            });
        };

    }]);