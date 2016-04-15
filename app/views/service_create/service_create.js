'use strict';
angular.module('console.service.create', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/checkbox/checkbox.js',
            ]
        }
    ])
    .controller('ServiceCreateCtrl', [ '$scope', '$log', 'DeploymentConfig',
        function ($scope, $log, DeploymentConfig) {
        $log.info('ServiceCreate');
        $scope.deploymentConfig = {
            metadata: {
                name: ''
            },
            spec: {
               containers: {
                   name: '',
                   image: '',
                   ports: {
                       containerPort: '',
                       protocol: ''
                   }
               }
            }
        }
           var createDC = function(){

           }

    }]);
