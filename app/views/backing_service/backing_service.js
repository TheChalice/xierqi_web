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
        vendor: 'all',
        txt: ''
    };

    $scope.select = function(tp, key){
        console.log("tp", tp, 'key', key);
        if (key == $scope.grid[tp]) {
            $scope.grid[tp] = 'all';
        } else {
            $scope.grid[tp] = key;
        }

        filter(tp, key);
    };

    var filter = function(tp, key){
        var reg = null;
        if ($scope.grid.txt) {
            var txt = $scope.grid.txt.replace(/\//g, '\\/');
            reg = eval('/' + txt + '/ig');
        }
        angular.forEach($scope.items, function(item){
            if (tp == 'serviceCat') {
                item.show = item.metadata.labels.cat == key || key == 'all';
            }
            if (tp == 'vendor') {
                item.show = item.spec.metadata.providerDisplayName == key || key == 'all';
            }
            if (reg) {
                item.show = item.show && reg.test(item.metadata.name)
            }
        });
    };

    var loadBs = function(){
        BackingService.get({namespace:'openshift'},function(data){
            $log.info('loadBs',data);
            $scope.items = data.items;
            $scope.data = data.items;
            filter('serviceCat', 'all');
            filter('vendor', 'all');
        })
    };
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

    $scope.search = function () {
        console.log("----", $scope.txt);
        filter('serviceCat', $scope.grid.serviceCat);
        filter('vendor', $scope.grid.vendor);
    };
    $scope.delBsi = function(idx){
        $log.info('del$scope.bsi.items[idx]',$scope.bsi.items[idx]);
        if($scope.bsi.items[idx].spec.binding){
            var curlength = $scope.bsi.items[idx].spec.binding.length;
            if(curlength > 0){
                Confirm.open('删除后端服务实例','该实例已绑定服务,不能删除','','',true)
            }else{
                Confirm.open('删除后端服务实例','您确定要删除该实例吗?此操作不可恢复','','',false).then(function(){
                    BackingServiceInstance.del({namespace : $rootScope.namespace,name : $scope.bsi.items[idx].metadata.name},function(res){
                        $scope.bsi.items.splice(idx,1);
                    },function(res){
                        $log.info('err',res);
                    })
                });

            }
        }else{
            Confirm.open('删除后端服务实例','您确定要删除该实例吗?此操作不可恢复','','',false).then(function(){
                BackingServiceInstance.del({namespace : $rootScope.namespace,name : $scope.bsi.items[idx].metadata.name},function(res){
                    $scope.bsi.items.splice(idx,1);
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
}]);