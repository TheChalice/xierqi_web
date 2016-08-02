'use strict';
angular.module('console.resource_management', [
    {
        files:[
            'components/searchbar/searchbar.js',
        ]
    }
]).controller('resmanageCtrl',['$rootScope','$scope','configmaps','secretskey',function($rootScope,$scope,configmaps,secretskey){
    $scope.grid = {
        page: 1,
        size: 10,
        txt :''
    };
    $scope.secrets = {
        page: 1,
        size: 10,
        txt :''
    };

  //////////////////  配置卷
    $scope.$watch('grid.page', function(newVal, oldVal){
        if (newVal != oldVal) {
            refresh(newVal);
        }
    });
    var refresh = function(page) {
        var skip = (page - 1) * $scope.grid.size;
        $scope.pageitems = $scope.configitems.slice(skip, skip + $scope.grid.size);

    };
    $scope.loadconfigmaps = function(){
        configmaps.get({namespace: $rootScope.namespace},function(res){
            console.log(res);
            if(res.items){
                $scope.configitems = res.items
            }else{
                $scope.configitems = [];
            }

            $scope.grid.total = $scope.configitems.length;
            $scope.grid.page = 1;
            $scope.grid.txt = '';
            refresh(1);
        })
    }
    $scope.search = function () {
        if (!$scope.grid.txt) {
            refresh(1);
            $scope.grid.total = $scope.configitems.length;
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
//////////////////////////密钥
    $scope.loadsecrets = function(){
        secretskey.get({namespace:$rootScope.namespace},function(res){
            console.log('-------loadsecrets',res);
            if(res.items){
                $scope.secretitems = res.items;
            }else{
                $scope.secretitems = []
            }
            $scope.secrets.total = $scope.secretitems.length;
            $scope.secrets.page = 1;
            $scope.secrets.txt = '';
            secretrefresh(1);
        })
    }
    $scope.loadsecrets();
    $scope.$watch('secrets.page', function(newVal, oldVal){
        if (newVal != oldVal) {
            secretrefresh(newVal);
        }
    });
    var secretrefresh = function(page) {
        var skip = (page - 1) * $scope.grid.size;
        $scope.scretspageitems = $scope.secretitems.slice(skip, skip + $scope.secrets.size);
        //$scope.secrets.total = $scope.secretitems.length;
    };
    $scope.scretssearch = function () {
        if (!$scope.secrets.txt) {
            secretrefresh(1);
            $scope.secrets.total = $scope.secretitems.length;
            return;
        }
        $scope.scretspageitems = [];

        $scope.secrets.txt = $scope.secrets.txt.replace(/\//g, '\\/');
        $scope.secrets.txt = $scope.secrets.txt.replace(/\./g, '\\.');
        var reg = eval('/' + $scope.secrets.txt + '/');
        angular.forEach($scope.secretitems, function(item){
            if (reg.test(item.metadata.name)) {
                $scope.scretspageitems.push(item);
            }
        });
        $scope.secrets.total = $scope.scretspageitems.length;
    };
}])