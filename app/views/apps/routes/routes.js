'use strict';
angular.module('console.routes', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/routes/routes.css'
        ]
    }])
    .controller('RoutesCtrl', ['$scope', 'Route',
        function($scope, Route) {
            $(".service_close").on("click", function() {
                $(".sevice_alert_jia").slideUp();
            });
            $scope.text = "No routes have been added to project " + $scope.namespace + ".";
            Route.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
            })
        }
    ]);