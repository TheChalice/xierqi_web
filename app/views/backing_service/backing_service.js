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
    var loadBs = function(){
        BackingService.get({namespace:'openshift'},function(data){
            $log.info('loadBs',data);
            $scope.items = data.items;
        })
    }
    loadBs();
    $scope.search = function (key, txt) {
        $scope.items = [];
        txt = txt.replace(/\//g, '\\/');
        //txt = txt.replace(/\./g, '\\.');
        var reg = eval('/' + txt + '/');
        angular.forEach($scope.items, function(item) {
            if (key == 'all' || key == 'metadata.name') {
                if (reg.test(item.metadata.name)) {
                    $scope.items.push(item);
                }
            }
        })
    };
}]);