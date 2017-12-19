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
            })
        }
    ]);