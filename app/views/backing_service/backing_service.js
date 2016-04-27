'use strict';
angular.module('console.backing_service',[
    {
        files: [
            'views/backing_service/backing_service.css',
            'components/bscard/bscard.js'
        ]
    }
])
.controller('BackingServiceCtrl',['$log','$rootScope', '$scope','BackingService','BackingServiceInstance','Service',function ($log,$rootScope,$scope,BackingService,BackingServiceInstance,Service){
    $scope.status = {};
    $scope.grid = {
        checked : false
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
    $scope.delBing = function(){

    }
    var loadService = function(){
        Service.get({namespace: $rootScope.namespace}, function(res){
            $log.info("Service", res);


        }, function(res){
            //todo 错误处理
            $log.info("loadBsi err", res);
        });
    }
    loadService();
    $scope.search = function (txt) {
        if(!txt){
            $scope.items = $scope.data;
        }else{
            $scope.items = [];
            txt = txt.replace(/\//g, '\\/');
            var reg = eval('/' + txt + '/');
            angular.forEach($scope.data, function(item) {
                if (reg.test(item.metadata.name)) {
                    $scope.items.push(item);
                }
            })
        }
    };
}]);