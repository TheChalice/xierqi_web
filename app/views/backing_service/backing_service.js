'use strict';
angular.module('console.backing_service',[
    {
        files: [
            'views/backing_service/backing_service.css',
            'components/bscard/bscard.js'
        ]
    }
])
.controller('BackingServiceCtrl',['$log', '$scope','$state','BackingService',function ($log,$scope,$state,BackingService){
    var loadBs = function(){
        BackingService.get({namespace:'openshift'},function(data){
            $log.info('loadBs',data);
            $scope.items = data.items;
            $scope.data = data.items;
        })
    }
    loadBs();
    $scope.bsdetails = function(){
        $state.go('console.backing_service_detail');
    }

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