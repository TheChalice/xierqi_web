'use strict';
angular.module('console.services', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/services/services.css'
        ]
    }])
    .controller('ServicesCtrl', ['$scope', 'Service',
        function($scope, Service) {
            $(".service_close").on("click", function() {
                $(".sevice_alert_jia").slideUp();
            });
            $scope.text = "No services have been added to project " + $scope.namespace + ".";
            Service.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
            })
        }
    ]);