'use strict';
angular.module('console.pods', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/pods/pods.css'
        ]
    }])
    .controller('PodsCtrl', ['$scope', 'Pod',
        function($scope, Pod) {
            $(".service_close").on("click", function() {
                $(".sevice_alert_jia").slideUp();
            });
            $scope.text = "No pods have been added to project " + $scope.namespace + ".";
            Pod.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
            });

        }
    ]);