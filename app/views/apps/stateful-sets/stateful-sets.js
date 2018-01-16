'use strict';
angular.module('console.stateful-sets', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('Stateful-setsCtrl', ['statefulsets', '$scope',
        function(statefulsets, $scope) {
            $scope.text = "No stateful sets have been added to project " + $scope.namespace + ".";
            statefulsets.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
                $scope.copySets = angular.copy($scope.items);
                $scope.grid.total = $scope.items.length;
                $scope.grid.page = 1;
                $scope.grid.txt = '';
                refresh(1);
            });
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
                $scope.setsItem = $scope.items.slice(skip, skip + $scope.grid.size)||[];
            };
            $scope.search = function (event) {
                $scope.grid.page = 1;
                if (!$scope.grid.txt) {
                    $scope.items = angular.copy($scope.copySets);
                    refresh(1);
                    $scope.grid.total = $scope.items.length;
                    return;
                }
                $scope.items = [];
                var iarr = [];
                var str = $scope.grid.txt;
                str = str.toLocaleLowerCase();
                angular.forEach($scope.copySets, function (item, i) {
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