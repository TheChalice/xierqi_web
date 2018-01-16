'use strict';
angular.module('console.routes', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('RoutesCtrl', ['$scope', 'routes',
        function($scope, routes) {
            $scope.text = "No routes have been added to project " + $scope.namespace + ".";
            if (routes) {
                $scope.items = routes.items;
            }
            //分页
            $scope.grid = {
                page: 1,
                size: 2,
                txt: ''
            };
            $scope.$watch('grid.page', function(newVal, oldVal){
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });
            var refresh = function(page) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                $scope.items = $scope.data.slice(skip, skip + $scope.grid.size);
            };
        }
    ]);