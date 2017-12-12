'use strict';
angular.module('console.pods', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('PodsCtrl', ['$scope', 'Pod',
        function($scope, Pod) {
            $scope.text = "No pods have been added to project " + $scope.namespace + ".";
            Pod.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
                console.log(' Pod', $scope.items)
            });

        }
    ]);