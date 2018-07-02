'use strict';
angular.module('console.routes', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('RoutesCtrl', ['$scope', 'routes','Route','Sort',
        function($scope, routes,Route,Sort) {
            $scope.text = "您还没有域名管理";
            $scope.begin_blank=true;
            //$scope.text = "No routes have been added to project " + $scope.namespace + ".";
            $scope.grid = {
                page: 1,
                size: 10,
                txt: ''
            };
            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });
            var refresh = function (page) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                $scope.routeItem = $scope.items.slice(skip, skip + $scope.grid.size)||[];
            };
            $scope.search = function (event) {
                     $scope.grid.page = 1;
                    if (!$scope.grid.txt) {
                        $scope.items = angular.copy($scope.copyRoute);
                        refresh(1);
                        $scope.grid.total = $scope.items.length;
                        return;
                    }
                    $scope.items = [];
                    var iarr = [];
                    var str = $scope.grid.txt;
                    str = str.toLocaleLowerCase();
                    angular.forEach($scope.copyRoute, function (item, i) {
                        var nstr = item.metadata.name;
                        nstr = nstr.toLocaleLowerCase();
                        if (nstr.indexOf(str) !== -1) {
                            iarr.push(item)
                        }
                    })

                    $scope.isQuery=false;
                    if(iarr.length===0){
                        $scope.isQuery=true;
                        $scope.begin_blank=false;
                        $scope.text='没有查询到符合条件的数据';
                        // console.log($scope.items.length);
                    }
                    else{
                        $scope.text='您还没有任何域名管理数据，现在就创建一个吧';
                    }
                    $scope.items=angular.copy(iarr);
                    refresh(1);
                    $scope.grid.total = $scope.items.length;

            };
            if (routes) {
                $scope.items = routes.items;
                $scope.items=Sort.sort(routes.items, -1)
                $scope.copyRoute = angular.copy($scope.items);
                $scope.grid.total = $scope.items.length;
                $scope.grid.page = 1;
                $scope.grid.txt = '';
                refresh(1);
            }
        }
    ]);