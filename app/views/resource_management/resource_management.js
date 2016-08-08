'use strict';
angular.module('console.resource_management', [
    {
        files:[
            'components/searchbar/searchbar.js',
        ]
    }
]).controller('resmanageCtrl',['$log','Ws','DeploymentConfig','persistent','$state','$rootScope','$scope','configmaps','secretskey',
    function($log,Ws,DeploymentConfig,persistent,$state,$rootScope,$scope,configmaps,secretskey){
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

    if ($state.params.index) {
        $scope.check = $state.params.index
    } else {
        $scope.check = false
    }
        function persistentlist(){
            persistent.get({namespace: $rootScope.namespace}, function (res) {

                DeploymentConfig.get({namespace: $rootScope.namespace}, function (resdc) {
                    //console.log('dc',resdc);
                    angular.forEach(res.items, function (volitem,i) {
                        res.items[i].arr=[]
                        angular.forEach(resdc.items, function (dcitem,k) {
                            angular.forEach(dcitem.spec.template.spec.volumes, function (dcvolitem,j) {
                                if (volitem.metadata.name == dcvolitem.persistentVolumeClaim.claimName) {
                                    res.items[i].arr.push(dcitem.metadata.name)
                                }
                            })
                            //volitem.metadata.name==dcitem.spec.template.spec.volumes
                        })
                    });

                    if (res.items&&res.items.length > 0) {
                        angular.forEach(res.items, function (item,i) {
                            res.items[i].sorttime=(new Date(item.metadata.creationTimestamp)).getTime()
                        })
                        //console.log($scope.items);

                        res.items.sort(function (x, y) {
                            return x.sorttime > y.sorttime ? -1 : 1;
                        });
                        $scope.resourceVersion = res.metadata.resourceVersion;
                        watchPc(res.metadata.resourceVersion);
                        $scope.persistents=res;
                        console.log('chijiu',res);
                    }

                })


            }, function (err) {

            });
        }

        var watchPc = function(resourceVersion){
            Ws.watch({
                api: 'k8s',
                resourceVersion: resourceVersion,
                namespace: $rootScope.namespace,
                type: 'persistentvolumeclaims',
                name: ''
            }, function(res){
                var data = JSON.parse(res.data);
                updatePC(data);
                console.log(data);
            }, function(){
                $log.info("webSocket start");
            }, function(){
                $log.info("webSocket stop");
                var key = Ws.key($rootScope.namespace, 'persistentvolumeclaims', '');
                if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                    return;
                }
                watchPc($scope.resourceVersion);
            });
        };
        var updatePC = function(data){
            if (data.type == 'ERROR') {
                $log.info("err", data.object.message);
                Ws.clear();
                persistentlist();
                return;
            }
            // if (data.type == 'DELETE') {
            //
            // }

            $scope.resourceVersion = data.object.metadata.resourceVersion;

            if (data.type == 'ADDED') {
                $scope.rcs.items.push(data.object);
            }else if (data.type == "MODIFIED") {
                angular.forEach($scope.items, function(item, i){
                    if (item.rc.metadata.name == data.object.metadata.name) {
                        $scope.items[i].rc = data.object;
                        console.log('updatedata========',data);
                        console.log('$scope.items[i]-----------',$scope.items[i]);
                        //isNormal($scope.items);
                        $scope.$apply();
                    }
                });



            }
        }
  ////////////////  配置卷
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
            if (res.items&&res.items.length > 0) {
                angular.forEach(res.items, function (item,i) {
                    res.items[i].sorttime=(new Date(item.metadata.creationTimestamp)).getTime()
                })
                //console.log($scope.items);
                res.items.sort(function (x, y) {
                    return x.sorttime > y.sorttime ? -1 : 1;
                });
                if(!res.items) {
                    $scope.configitems = [];
                }else{
                    $scope.configitems = res.items;
                }
                $scope.grid.total = $scope.configitems.length;
                $scope.grid.page = 1;
                $scope.grid.txt = '';
                refresh(1);
            }


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
            if (res.items&&res.items.length > 0) {
                angular.forEach(res.items, function (item,i) {
                    res.items[i].sorttime=(new Date(item.metadata.creationTimestamp)).getTime()
                })
                console.log(res.items);
                //console.log($scope.items);
                res.items.sort(function (x, y) {
                    return x.sorttime > y.sorttime ? -1 : 1;
                });
                if(res.items){
                    $scope.secretitems = res.items;
                }else {
                    $scope.secretitems = []
                }
                $scope.secrets.total = $scope.secretitems.length;
                $scope.secrets.page = 1;
                $scope.secrets.txt = '';
                secretrefresh(1);
            }

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