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
            });
        }
    ]);