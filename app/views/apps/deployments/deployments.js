'use strict';
angular.module('console.deployments', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('DeploymentsCtrl', ['$log','$rootScope', '$scope', 'replicas', 'mydcs', '$filter', 'mydeployment', 'ReplicaSet','Ws',
        function($log,$rootScope, $scope, replicas, mydcs, $filter, mydeployment, ReplicaSet,Ws) {
            $scope.text = "无";
            //$scope.text = "No deployments have been added to project " + $scope.namespace + ".";
            $scope.grid = {
                page: 1,
                size: 10,
                txt: ''
            };
            $scope.gridTwo = {
                page: 1,
                size: 10,
                txt: ''
            };
            $scope.$watch('grid.page', function(newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });
            var refresh = function(page) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                $scope.deploymentOneItem = $scope.items.slice(skip, skip + $scope.grid.size) || [];
            };

            $scope.dc=angular.copy(mydcs);
            $scope.replicas = angular.copy(replicas);

            $scope.deployment=angular.copy(mydeployment);
            $scope.replicasets = angular.copy(ReplicaSet);



            $scope.items = addrc($scope.dc.items);
            $scope.mydeploylist = addrs($scope.deployment.items);
            console.log('$scope.replicas', $scope.mydeploylist);
            $scope.deploymentOne = angular.copy($scope.items);
            $scope.grid.total = $scope.items.length;
            $scope.grid.page = 1;
            $scope.grid.txt = '';
            refresh(1);



            $scope.deploymentTwo = angular.copy($scope.mydeploylist);
            $scope.gridTwo.total = $scope.mydeploylist.length;
            $scope.gridTwo.page = 1;
            refreshTwo(1);
            Wsapi($scope.mydeploylist,mydeployment.metadata.resourceVersion,'extensions','deployments', function (items) {
                $scope.mydeploylist = addrs(items);
                //$scope.grid.total = $scope.items.length;
                refreshTwo(1);
            })
            Wsapi(ReplicaSet.items,ReplicaSet.metadata.resourceVersion,'extensions','replicasets', function (items) {;
                refreshTwo(1);
            })
            Wsapi($scope.items,mydcs.metadata.resourceVersion,false,'deploymentconfigs', function (items) {
                $scope.items = addrc(items,$scope.replicas.items);
                $scope.grid.total = $scope.items.length;
                refresh(1);
            })
            Wsapi(replicas.items,mydcs.metadata.resourceVersion,'k8s','replicationcontrollers', function (items) {
                $scope.replicas.items=angular.copy(items)
                $scope.items = addrc($scope.items,items);
                $scope.grid.total = $scope.items.length;
                refresh(1);
            })
            function Wsapi(items,resourceVersion,api,type,callback){
                watchapi(items,resourceVersion,api,type,callback)
            }
            function watchapi(items,resourceVersion,api,type,callback) {
                var sendobj={
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: type
                }
                if (api) {
                    sendobj.api=api
                }

                Ws.watch(sendobj, function (res) {
                    var data = JSON.parse(res.data);
                    updateapi(items,data,callback);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                });
            };
            function updateapi (items,data,callback){
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    return;
                }else if (data.type == 'ADDED') {
                    items.unshift(data.object)
                } else if (data.type == "MODIFIED") {
                    console.log('items', items);
                    angular.forEach(items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            items[i] = data.object;
                        }
                    })
                }else if (data.type == "DELETED") {
                    angular.forEach(items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            items.splice(i,1)

                        }
                    })
                }
                callback(items)
                $scope.$apply();
            }

            $scope.$watch('gridTwo.page', function(newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshTwo(newVal);
                }
            });
           function refreshTwo(page) {
                var skip = (page - 1) * $scope.gridTwo.size;
                $scope.deploymentTwoItem = $scope.mydeploylist.slice(skip, skip + $scope.gridTwo.size) || [];
            };
            function checkArr(arr) {
                var iarr = [];
                var str = $scope.grid.txt;
                str = str.toLocaleLowerCase();
                angular.forEach(arr, function(item, i) {
                    var nstr = item.metadata.name;
                    nstr = nstr.toLocaleLowerCase();
                    if (nstr.indexOf(str) !== -1) {
                        iarr.push(item)
                    }
                })
                return iarr;
            }
            $scope.search = function(event) {
                $scope.grid.page = 1;
                $scope.gridTwo.page = 1;
                if (!$scope.grid.txt) {
                    $scope.items = angular.copy($scope.deploymentOne);
                    $scope.mydeploylist = angular.copy($scope.deploymentTwo);
                    refresh(1);
                    refreshTwo(1);
                    $scope.grid.total = $scope.items.length;
                    $scope.gridTwo.total = $scope.mydeploylist.length;
                    return;
                }
                $scope.items = [];
                $scope.mydeploylist = [];
                $scope.items = angular.copy(checkArr($scope.deploymentOne));
                $scope.mydeploylist = angular.copy(checkArr($scope.deploymentTwo));
                refresh(1);
                refreshTwo(1);
                $scope.grid.total = $scope.items.length;
                $scope.gridTwo.total = $scope.mydeploylist.length;

            };





            function addrc(dc,rcitems) {
                var replicasitems=[];
                if (rcitems) {
                    replicasitems=angular.copy(rcitems);
                }else {
                    replicasitems=$scope.replicas.items;
                }
                if (dc) {
                    angular.forEach(dc, function(item, i) {
                        angular.forEach(replicasitems, function(replica) {
                            //console.log(replica);
                            if (item.metadata.name+'-'+item.status.latestVersion === replica.metadata.name) {

                                item.rc = replica || {};
                                item.rc.kind = "ReplicationController"
                            }
                        })
                    })
                    return angular.copy(dc);

                }
            }

            function addrs(dc) {
                if (dc) {
                    angular.forEach(dc, function(item, i) {
                        angular.forEach(ReplicaSet.items, function(replics) {
                            if (item.metadata.annotations['deployment.kubernetes.io/revision'] === replics.metadata.annotations['deployment.kubernetes.io/revision']) {
                                item.rs = replics || {}
                            }
                        })
                    })
                    console.log('dc', dc);
                    return angular.copy(dc);

                }
            }
        }
    ]);