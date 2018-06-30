'use strict';
angular.module('console.resource_management', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'views/resource_persistentVolume/resource_persistentVolume.css'
            ]
        }
    ])
    .controller('persistentVolumeCtrl', ['$log', 'Ws', 'DeploymentConfig', 'persistent', '$state', '$rootScope', '$scope', 'configmaps', 'secretskey',
        function ($log, Ws, DeploymentConfig, persistent, $state, $rootScope, $scope, configmaps, secretskey) {
            $scope.grid = {
                rmpage: 1,
                size: 10,
                txt: ''
            };
            $scope.$watch('grid.rmpage', function (newVal, oldVal) {
                if (newVal === oldVal) {
                    return
                }
                if (newVal !== oldVal) {
                    rmrefresh(newVal);
                }
            });

            var rmrefresh = function (page) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                $scope.persistents = $scope.persistentdata.slice(skip, skip + $scope.grid.size)||[];

            };

            function persistentlist(nows) {
                persistent.get({
                    namespace: $rootScope.namespace,
                    region: $rootScope.region
                }, function (res) {
                    angular.forEach(res.items, function (item, i) {
                        //console.log(item.spec.resources.requests.storage);
                        res.items[i].spec.resources.requests.storage=item.spec.resources.requests.storage.replace('i','B')
                    })
                    DeploymentConfig.get({
                        namespace: $rootScope.namespace,
                        region: $rootScope.region
                    }, function (resdc) {
                        console.log('dc',resdc);
                        $scope.grid.constantlyvolume = false;
                        console.log(res.items, 1);
                        angular.forEach(res.items, function (volitem, i) {
                            res.items[i].arr = []
                            angular.forEach(resdc.items, function (dcitem, k) {
                                angular.forEach(dcitem.spec.template.spec.volumes, function (dcvolitem, j) {
                                    if (dcvolitem.persistentVolumeClaim && volitem.metadata.name == dcvolitem.persistentVolumeClaim.claimName) {
                                        res.items[i].arr.push(dcitem.metadata.name)
                                    }
                                })
                            })
                        });

                        if (res.items && res.items.length > 0) {
                            angular.forEach(res.items, function (item, i) {
                                if (item.arr.length > 0) {
                                    res.items[i].status.phase = 'band'
                                }
                                res.items[i].sorttime = (new Date(item.metadata.creationTimestamp)).getTime()
                            })

                            res.items.sort(function (x, y) {
                                return x.sorttime > y.sorttime ? -1 : 1;
                            });

                            $scope.resourceVersion = res.metadata.resourceVersion;

                            if (!nows) {
                                watchPc(res.metadata.resourceVersion);
                            }
                            //物理刷新不重启ws
                            $scope.persistentdata = res.items;

                        }else {
                            $scope.persistentdata=[];

                        }
                        $scope.grid.rmtotal = $scope.persistentdata.length;
                        $scope.cpoypersistents = angular.copy($scope.persistentdata)
                        $scope.grid.rmpage = 1;
                        $scope.grid.rmtxt = '';
                        rmrefresh(1);

                    })


                }, function (err) {

                });
            }

            persistentlist()

            var watchPc = function (resourceVersion) {
                Ws.watch({
                    api: 'k8s',
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'persistentvolumeclaims',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updatePC(data);
                    //console.log(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'persistentvolumeclaims', '');
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    watchPc($scope.resourceVersion);
                });
            };

            var updatePC = function (data) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    persistentlist();
                    return;
                }
                $scope.resourceVersion = data.object.metadata.resourceVersion;
                data.object.spec.resources.requests.storage=data.object.spec.resources.requests.storage.replace('i','B')
                if (data.type == 'ADDED') {

                    $scope.persistentdata.unshift(data.object)
                    rmrefresh(1);
                    $scope.$apply();

                } else if (data.type == "MODIFIED") {
                    //data.object.spec.resources.requests.storage=data.object.spec.resources.requests.storage.replace('i','B')
                    angular.forEach($scope.persistentdata, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.persistentdata[i] = data.object;
                            rmrefresh(1);
                            $scope.$apply();
                        }
                    })

                }else if (data.type == "DELETED") {
                    //data.object.spec.resources.requests.storage=data.object.spec.resources.requests.storage.replace('i','B')
                    angular.forEach($scope.persistentdata, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.persistentdata.splice(i,1)
                            rmrefresh(1);
                            $scope.$apply();
                        }
                    })

                }
            }
            $scope.text='您还没有存储卷';
            $scope.begin_blank=true;
            $scope.rmsearch = function (event) {
                if (!$scope.grid.rmtxt) {
                    $scope.persistentdata = angular.copy($scope.cpoypersistents)
                    rmrefresh(1);
                    $scope.grid.rmtotal = $scope.cpoypersistents.length;
                    $scope.grid.rmpage = 1;
                    return;
                }
                $scope.persistentdata = [];

                var iarr = [];
                var str = $scope.grid.rmtxt;
                str = str.toLocaleLowerCase();
                angular.forEach($scope.cpoypersistents, function (item, i) {
                    var nstr = item.metadata.name;
                    nstr = nstr.toLocaleLowerCase();
                    if (nstr.indexOf(str) !== -1) {
                        iarr.push(item)
                    }
                })
                if(iarr.length===0){
                    $scope.isQuery=true;
                    $scope.begin_blank=false;
                    $scope.text='没有查询到符合条件的数据';
                }
                else{
                    $scope.text='您还没有任何创建存储卷数据，现在就创建一个吧';
                }
                $scope.persistentdata=angular.copy(iarr);
                rmrefresh(1);
                $scope.grid.rmtotal = $scope.persistentdata.length;
            };
        }])