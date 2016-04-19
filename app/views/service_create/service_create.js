'use strict';
angular.module('console.service.create', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/checkbox/checkbox.js',
            ]
        }
    ])
    .controller('ServiceCreateCtrl', [ '$rootScope', '$scope', '$log', 'ImageStream', 'DeploymentConfig', 'ImageSelect',
        function ($rootScope, $scope, $log, ImageStream, DeploymentConfig, ImageSelect) {
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
                    secretName:''
                }
            }
        };
        $log.info("ImageStream");
        $scope.loadImageStream = function() {
            ImageSelect.open();
        };
        //ImageSelect.open();
        $scope.createDC = function() {
            console.log("deploymentConfig", $scope.deploymentConfig);
       };
       $scope.createDC();
    }])

    .service('ImageSelect', ['$uibModal', function($uibModal){
        this.open = function () {
            return $uibModal.open({
                templateUrl: 'pub/tpl/modal_choose_image.html',
                size: 'default',
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

