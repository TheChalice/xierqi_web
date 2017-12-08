'use strict';
angular.module('console.routes', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/routes/routes.css'
        ]
    }])
    .controller('RoutesCtrl', ['$filter', '$scope', 'Route',
        function($filter, $scope, Route) {
            $(".service_close").on("click", function() {
                $(".sevice_alert_jia").slideUp();
            });
            Route.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
            })
        }
    ]);