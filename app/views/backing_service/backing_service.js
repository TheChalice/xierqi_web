'use strict';
angular.module('console.backing_service',[
    {
        files: [
            'views/backing_service/backing_service.css',
            'components/bscard/bscard.js'
        ]
    }
])
.controller('BackingServiceCtrl',['$log', '$scope','BackingService',function ($log,$scope,BackingService){
    $scope.status = {};
    $scope.grid = {};
    var loadBs = function(){
        BackingService.get({namespace:'openshift'},function(data){
            $log.info('loadBs',data);
            $scope.items = data.items;
            $scope.data = data.items;
        })
    }
    loadBs();
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