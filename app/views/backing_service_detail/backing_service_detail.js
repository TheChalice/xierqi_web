'use strict';
angular.module('console.backing_service_detail', [
        {
            files: [
                'views/backing_service_detail/backing_service_detail.css'
            ]
        }
    ])
    .controller('BackingServiceInstanceCtrl',['$log','$scope','$rootScope','$stateParams','BackingService', 'BackingServiceInstance','ServiceSelect','Confirm','BackingServiceInstanceBd', '$state', 'Toast', function($log,$scope,$rootScope,$stateParams,BackingService,BackingServiceInstance,ServiceSelect,Confirm,BackingServiceInstanceBd, $state, Toast){
        $scope.grid = {};

        var cuename = $stateParams.name;
        var loadBs = function(){
            BackingService.get({namespace:'openshift',name:cuename},function(data){
                $log.info('loadBs=====',data);
                $scope.data = data;

                var plans = data.spec.plans;
                for (var i = 0; i < plans.length; i++) {
                    if (plans[i].name == $stateParams.plan) {
                        $scope.grid.checked = i;
                        break;
                    }
                }

            })
        };

        $scope.$watch('grid.active', function(newVal, oldVal){
            if (newVal != oldVal && newVal == 2) {
                $scope.grid.update = false;
            }
        });

        $scope.update = function(idx){
            var item = $scope.bsi[idx];
            $scope.grid.update = true;
            $scope.grid.active = 1;

            //$state.go('console.backing_service_detail', {name: item.spec.provisioning.backingservice_name, plan: item.spec.provisioning.backingservice_plan_name});
        };

        $scope.jump = function(idx){
            var item = $scope.bsi[idx];
            $scope.grid.active = 1;

            var plans = $scope.data.spec.plans;
            for (var i = 0; i < plans.length; i++) {
                if (plans[i].name == item.spec.provisioning.backingservice_plan_name) {
                    $scope.grid.checked = i;
                    break;
                }
            }

            //$state.go('console.backing_service_detail', {name: item.spec.provisioning.backingservice_name, plan: item.spec.provisioning.backingservice_plan_name});
        };

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
            var name = $scope.bsi[idx].metadata.name;
            var bindings = [];
            var binds = $scope.bsi[idx].spec.binding || [];
            for (var i = 0; i < binds.length; i++) {
                if (binds[i].checked) {
                    bindings.push(binds[i]);
                }
            }
            if (bindings.length == 0) {
                Toast.open('请先选择要解除绑定的服务');
                return;
            }

            angular.forEach(bindings, function(binding){
                var bindObj = {
                    metadata: {
                        name: name
                    },
                    resourceName : binding.bind_deploymentconfig,
                    bindResourceVersion : '',
                    bindKind : 'DeploymentConfig'
                };
                BackingServiceInstanceBd.put({namespace: $rootScope.namespace, name: name}, bindObj, function(res){
                    var foos = $scope.bsi[idx].spec.binding;
                    for (var j = 0; j < foos.length; j++) {
                        if (foos[j].bind_deploymentconfig == binding.bind_deploymentconfig) {
                            foos.splice(j, 1);
                        }
                    }
                    $scope.bsi[idx].spec.bound -= 1;
                }, function(res){
                    //todo 错误处理
                    Toast.open('操作失败');
                    $log.info("del bindings err", res);
                });
            });
        };

        var bindService = function(name, dcs){
            var bindObj = {
                metadata: {
                    name: name
                },
                resourceName : '',
                bindResourceVersion : '',
                bindKind : 'DeploymentConfig'
            };
            for(var i = 0; i < dcs.length; i++){
                bindObj.resourceName = dcs[i].metadata.name;
                BackingServiceInstanceBd.create({namespace: $rootScope.namespace, name: name}, bindObj, function(res){
                    $log.info("bindService success", res);
                    var foos = $scope.bsi;
                    for (var j = 0; j < foos.length; j++) {
                        if (foos[j].metadata.name == name) {
                            res.show = foos[j].show;
                            foos[j] = res;
                        }
                    }

                }, function(res){
                    //todo 错误处理
                    Toast.open('操作失败');
                    $log.info("bind services err", res);
                });
            }
            loadBsi();
        };
        $scope.bindModal = function(idx){
            var bindings = $scope.bsi[idx].spec.binding || [];
            ServiceSelect.open(bindings).then(function(res){
                $log.info("selected service", res);
                if (res.length > 0) {
                    bindService($scope.bsi[idx].metadata.name, res);
                }
            });
        };

    }]);