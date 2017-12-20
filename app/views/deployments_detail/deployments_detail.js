'use strict';
angular.module('console.deployments.detail', [
        'kubernetesUI',
        {
            files: [
                'views/deployments_detail/deployments_detail.css',
                'components/datepick/datepick.js',
                'components/checkbox/checkbox.js'
            ]
        }
    ])
    .controller('DeploymentsDetailCtrl', ['$scope',
        function ($scope) {
        $scope

        }])

