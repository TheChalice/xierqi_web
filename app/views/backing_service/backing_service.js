'use strict';
angular.module('console.backing_service',[
    {
        files: [
            'views/backing_service/backing_service.css',
            'components/bscard/bscard.js'
        ]
    }
])
.controller('BackingServiceCtrl',['$log','$rootScope','$scope','BackingService','BackingServiceInstance','ServiceSelect','BackingServiceInstanceBd','Confirm', 'Toast', 'Ws',function ($log,$rootScope,$scope,BackingService,BackingServiceInstance,ServiceSelect,BackingServiceInstanceBd,Confirm, Toast, Ws){
    $scope.status = {};
    $scope.grid = {
        serviceCat: 'all',
        vendor: 'all',
        txt: ''
    };

    $scope.select = function(tp, key){
        console.log("tp", tp, 'key', key);
        if (key == $scope.grid[tp]) {
            key = 'all';
        }
        $scope.grid[tp] = key;

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

            $scope.resourceVersion = res.metadata.resourceVersion;
            watchBsi($scope.resourceVersion);

        }, function(res){
            //todo 错误处理
            $log.info("loadBsi err", res);
        });
    };
    loadBsi();

    var watchBsi = function(resourceVersion){
        Ws.watch({
            resourceVersion: resourceVersion,
            namespace: $rootScope.namespace,
            type: 'backingserviceinstances',
            name: ''
        }, function(res){
            var data = JSON.parse(res.data);
            $scope.resourceVersion = data.object.metadata.resourceVersion;
            updateBsi(data);
        }, function(){
            $log.info("webSocket start");
        }, function(){
            $log.info("webSocket stop");
            var key = Ws.key($rootScope.namespace, 'backingserviceinstances', '');
            if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                return;
            }
            watchBsi($scope.resourceVersion);
        });
    };

    var updateBsi = function(data){
        $log.info("watch bsi", data);

        if (data.type == 'ERROR') {
            $log.info("err", data.object.message);
            Ws.clear();
            loadBsi();
            return;
        }

        $scope.resourceVersion = data.object.metadata.resourceVersion;

        if (data.type == 'ADDED') {
            data.object.showLog = true;
            if ($scope.bsi.items.length > 0) {
                $scope.bsi.items.unshift(data.object);
            } else {
                $scope.bsi.items = [data.object];
            }
        } else if (data.type == "MODIFIED") {
            angular.forEach($scope.bsi.items, function(item, i){
                if (item.metadata.name == data.object.metadata.name) {
                    data.object.show = item.show;
                    $scope.bsi.items[i] = data.object;
                    $scope.$apply();
                }
            });
        }
    };

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
        var name = $scope.bsi.items[idx].metadata.name;
        var bindings = [];
        var binds = $scope.bsi.items[idx].spec.binding || [];
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

            }, function(res){
                //todo 错误处理
                Toast.open('操作失败');
                $log.info("bind services err", res);
            });
        }
    };
    $scope.bindModal = function(idx){
        var bindings = $scope.bsi.items[idx].spec.binding || [];
        ServiceSelect.open(bindings).then(function(res){
            $log.info("selected service", res);
            if (res.length > 0) {
                bindService($scope.bsi.items[idx].metadata.name, res);
            }
        });
    };
}]);