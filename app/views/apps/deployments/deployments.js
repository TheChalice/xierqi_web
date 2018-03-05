'use strict';
angular.module('console.deployments', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('DeploymentsCtrl', ['$rootScope', '$scope', 'replicas', 'mydcs', '$filter', 'mydeployment', 'ReplicaSet',
        function($rootScope, $scope, replicas, mydcs, $filter, mydeployment, ReplicaSet) {
            $scope.text = "No deployments have been added to project " + $scope.namespace + ".";
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
            $scope.items = addrc(mydcs);
            $scope.deploymentOne = angular.copy($scope.items);
            $scope.grid.total = $scope.items.length;
            $scope.grid.page = 1;
            $scope.grid.txt = '';
            refresh(1);

            $scope.$watch('gridTwo.page', function(newVal, oldVal) {
                if (newVal != oldVal) {
                    refreshTwo(newVal);
                }
            });
            var refreshTwo = function(page) {
                var skip = (page - 1) * $scope.gridTwo.size;
                $scope.deploymentTwoItem = $scope.mydeploylist.slice(skip, skip + $scope.gridTwo.size) || [];
            };
            var checkArr = function(arr) {
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



            $scope.mydeploylist = addrs(mydeployment);
            $scope.deploymentTwo = angular.copy($scope.mydeploylist);
            $scope.gridTwo.total = $scope.mydeploylist.length;
            $scope.gridTwo.page = 1;
            refreshTwo(1);

            function addrc(dc, items) {
                if (dc.items) {
                    angular.forEach(dc.items, function(dc, i) {
                        angular.forEach(replicas.items, function(replica) {
                            if (dc.metadata.name === replica.metadata.ownerReferences[0].name) {
                                dc.rc = replica || {};
                                dc.rc.kind = "ReplicationController"
                            }
                        })
                    })
                    return angular.copy(dc.items);
                    console.log("$scope.items", items)
                }
            }

            function addrs(dc) {
                if (dc.items) {
                    angular.forEach(dc.items, function(dc, i) {
                        angular.forEach(ReplicaSet.items, function(replics) {
                            if (dc.metadata.annotations['deployment.kubernetes.io/revision'] === replics.metadata.annotations['deployment.kubernetes.io/revision']) {
                                dc.rs = replics || {}
                            }
                        })
                    })
                    return angular.copy(dc.items);

                }
            }
        }
    ]);