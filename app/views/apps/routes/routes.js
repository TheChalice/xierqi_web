'use strict';
angular.module('console.routes', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('RoutesCtrl', ['$scope', 'Route',
        function($scope, Route) {
            $scope.text = "No routes have been added to project " + $scope.namespace + ".";
            Route.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
            })
        }
    ]);