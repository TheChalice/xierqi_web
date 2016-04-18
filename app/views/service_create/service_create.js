'use strict';
angular.module('console.service.create', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/checkbox/checkbox.js',
            ]
        }
    ])
    .controller('ServiceCreateCtrl', [ '$rootScope', '$scope', '$log', 'DeploymentConfig',
        function ($rootScope, $scope, $log, DeploymentConfig) {
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
                   },
                   VolumeMounts: {

                   }
               },
                Volumes: {
                    name:'',
                    secret:'',
                    secretName:'',
                }
            }
        }
           var createDC = function() {
               console.log("deploymentConfig", $scope.deploymentConfig);
               DeploymentConfig.create({namespace: $rootScope.namespace}, $scope.deploymentConfig, function (res) {
                   $log.info("newservice", res);

               })
           }
            createDC();
    }]);
