'use strict';
angular.module('console.deployments', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/deployments/deployments.css'
        ]
    }])
    .controller('DeploymentsCtrl', ['$scope', 'DeploymentConfig',
        function($scope, DeploymentConfig) {
            $(".service_close").on("click", function() {
                $(".sevice_alert_jia").slideUp();
            });
            $scope.text = "No deployments have been added to project " + $scope.namespace + ".";
            DeploymentConfig.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
            })
        }
    ]);