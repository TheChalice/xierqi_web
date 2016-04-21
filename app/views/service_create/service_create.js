'use strict';
angular.module('console.service.create', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/checkbox/checkbox.js',
            ]
        }
    ])
    .controller('ServiceCreateCtrl', [ '$rootScope', '$scope', '$log', 'ImageStream', 'DeploymentConfig', 'ImageSelect','BackingServiceInstance',
        function ($rootScope, $scope, $log, ImageStream, DeploymentConfig, ImageSelect,BackingServiceInstance) {
        $log.info('ServiceCreate');
        $scope.deploymentConfig = {
            metadata: {
                name: ''
            },
            template: {
                spec: {
                    containers: [{
                        name: '',
                        image: '',
                        ports: {
                            containerPort: '',
                            protocol: ''
                        },

                        VolumeMounts: {}
                    }],
                    replicas: 5,
                    restartPolicy: "Always",
                    Volumes: {
                        name: '',
                        secret: '',
                        secretName: ''
                    }
                }
            }
        };

        $scope.addContainer = function() {
            var newContainer = {};
            $scope.deploymentConfig.template.spec.containers.push(newContainer);
            $scope.addCon = $scope.deploymentConfig.template.spec.containers;
            $log.info($scope.addCon);
        }

        $scope.delContainer = function(idx) {
            $scope.deploymentConfig.template.spec.containers.splice(idx,1);
        }

        $scope.envList = [
                {
                    name:"DATAFOUNDRY_APISERVER_ADDR",
                    value:"lab-test.dataos.io:8443"
                },
                {
                    name:"DATAFOUNDRY_APISERVER_ADDR",
                    value:"lab-test.dataos.io:8443"
                }
            ];
        $log.info("ImageStream");
        $scope.loadImageStream = function() {
            ImageSelect.open();
        };

        $scope.createDC = function() {
            console.log("deploymentConfig", $scope.deploymentConfig);
       };
       var bsiList = function(){
           BackingServiceInstance.get({namespace: $rootScope.namespace}, function (data) {
               $log.info("bsiList", data);
               $scope.BsiList = data.items;

           });
       }
       $scope.addEnv = function(){
           var newenv = {};
           $scope.envList.push(newenv);


       };
       $scope.delEnv = function(idx){
           $scope.envList.splice(idx,1);
       }
       bsiList ();
       $scope.createDC();
    }])

    .service('ImageSelect', ['$uibModal', function($uibModal){
        this.open = function () {
            return $uibModal.open({
                templateUrl: 'views/service_create/modal_choose_image.html',
                size: 'modal-default modal-lg',
                controller: ['$scope', '$uibModalInstance', function($scope, $uibModalInstance) {
                    $scope.cancel = function() {
                        $uibModalInstance.dismiss();
                    };
                    $scope.ok = function() {
                        $uibModalInstance.close(true);
                    };
                }]
            })
        }
    }]);

