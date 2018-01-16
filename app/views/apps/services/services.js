'use strict';
angular.module('console.services', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('ServicesCtrl', ['$scope', 'Service',
        function($scope, Service) {
            $scope.text = "No services have been added to project " + $scope.namespace + ".";
            Service.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
                $scope.copyServe = angular.copy($scope.items);
                $scope.grid.total = $scope.items.length;
                $scope.grid.page = 1;
                $scope.grid.txt = '';
                refresh(1);
            })
            $scope.grid = {
                page: 1,
                size: 1,
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
                $scope.serveItem = $scope.items.slice(skip, skip + $scope.grid.size)||[];
            };
            $scope.search = function (event) {
                $scope.grid.page = 1;
                if (!$scope.grid.txt) {
                    $scope.items = angular.copy($scope.copyServe);
                    refresh(1);
                    $scope.grid.total = $scope.items.length;
                    return;
                }
                $scope.items = [];
                var iarr = [];
                var str = $scope.grid.txt;
                str = str.toLocaleLowerCase();
                angular.forEach($scope.copyServe, function (item, i) {
                    var nstr = item.metadata.name;
                    nstr = nstr.toLocaleLowerCase();
                    if (nstr.indexOf(str) !== -1) {
                        iarr.push(item)
                    }
                })
                if(iarr.length===0){
                    $scope.text3='没有查询到相关数据';
                }
                else{
                    $scope.text3='您还没有创建密钥';
                }
                $scope.items=angular.copy(iarr);
                refresh(1);
                $scope.grid.total = $scope.items.length;

            };
        }
    ]);