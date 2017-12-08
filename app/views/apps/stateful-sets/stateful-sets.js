'use strict';
angular.module('console.stateful-sets', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/stateful-sets/stateful-sets.css'
        ]
    }])
    .controller('Stateful-setsCtrl', ['statefulsets', '$scope',
        function(statefulsets, $scope) {
            $(".service_close").on("click", function() {
                $(".sevice_alert_jia").slideUp();
            });
            $scope.text = "No stateful sets have been added to project " + $scope.namespace + ".";
            statefulsets.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
            });
        }
    ]);