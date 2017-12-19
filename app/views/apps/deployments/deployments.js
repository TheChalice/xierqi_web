'use strict';
angular.module('console.deployments', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('DeploymentsCtrl', ['$scope', 'DeploymentConfig',
        function($scope, DeploymentConfig) {
            $scope.text = "No deployments have been added to project " + $scope.namespace + ".";
            DeploymentConfig.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
            })
        }
    ]);