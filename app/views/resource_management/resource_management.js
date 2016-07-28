'use strict';
angular.module('console.resource_management', [
    {
        files:[
            'components/searchbar/searchbar.js',
        ]
    }
]).controller('resmanageCtrl',['$rootScope','$scope','configmaps',function($rootScope,$scope,configmaps){
    $scope.grid = {
        page: 1,
        size: 2,
        txt :''
    };
    $scope.$watch('grid.page', function(newVal, oldVal){
        if (newVal != oldVal) {
            refresh(newVal);
        }
    });
    var refresh = function(page) {
        var skip = (page - 1) * $scope.grid.size;
        $scope.pageitems = $scope.configitems.slice(skip, skip + $scope.grid.size);
        $scope.grid.total = $scope.configitems.length;
    };
    $scope.loadconfigmaps = function(){
        configmaps.get({namespace: $rootScope.namespace},function(res){
            console.log(res);
            $scope.configitems = res.items
            $scope.grid.total = $scope.configitems.length;
            $scope.grid.page = 1;
            $scope.grid.txt = '';
            refresh(1);
        })
    }
    $scope.search = function () {
        if (!$scope.grid.txt) {
            refresh(1);
            return;
        }
        $scope.pageitems = [];

        $scope.grid.txt = $scope.grid.txt.replace(/\//g, '\\/');
        $scope.grid.txt = $scope.grid.txt.replace(/\./g, '\\.');
        var reg = eval('/' + $scope.grid.txt + '/');
        angular.forEach($scope.configitems, function(item){
                if (reg.test(item.metadata.name)) {
                    $scope.pageitems.push(item);
                }
        });
        $scope.grid.total = $scope.pageitems.length;
    };

    $scope.loadconfigmaps();



}])