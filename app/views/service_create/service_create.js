'use strict';
angular.module('console.service.create', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/checkbox/checkbox.js',
            ]
        }
    ])
    .controller('ServiceCreateCtrl', [ '$rootScope', '$scope', '$log', 'ImageStream', 'DeploymentConfig', 'ImageSelect','BackingServiceInstance','BackingServiceInstanceBd',
        function ($rootScope, $scope, $log, ImageStream, DeploymentConfig, ImageSelect,BackingServiceInstance,BackingServiceInstanceBd) {
        $log.info('ServiceCreate');

        $scope.grid = {};

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
        }

        $scope.delContainer = function(idx) {
            $scope.deploymentConfig.template.spec.containers.splice(idx,1);
        }
        $scope.envList = [
                {
                    name:"test",
                    value:"lab-test"
                }
            ];
        $log.info("ImageStream");
        $scope.loadImageStream = function() {
            ImageSelect.open();
        };
        //创建dc
        $scope.createDC = function() {
            $scope.deploymentConfig.template.spec.containers.env = $scope.envList;
            //DeploymentConfig.create({namespace: $rootScope.namespace},$scope.deploymentConfig, function (data) {
            //     $log.info('createDC-data',data);
            //});
            console.log($scope.grid.isautoDeploy)
            console.log("deploymentConfig", $scope.deploymentConfig);
       };
       var bsiList = function() {
           BackingServiceInstance.get({namespace: $rootScope.namespace}, function (data) {
               $log.info("bsiList", data);
               $scope.BsiList = data.items;
           });
       }
            //绑定服务
       var bindService = function(){
           $scope.dcname = 'test';
           var bindserviceobj = {
               resourceName : $scope.dcname,
               bindResourceVersion : {},
               bindKind : 'DeploymentConfig',

           }
           BackingServiceInstanceBd.create({namespace: $rootScope.namespace,name:$scope.dcname}, bindserviceobj, function (data) {

           });
       }
       $scope.grid.isautoDeploy = false;
       var autoDeploy = function(){
           $scope.triggers = [];
           var conTn = $scope.deploymentConfig.template.spec.containers;
           for(var i = 0; i< conTn.length;i++){
               var thisobj = {
                   "type":"ImageChange",
                   "imageChangeParams":{
                       "automatic":true,
                       "containerNames":[
                           "datafoundryweb"
                       ],
                       "from":{
                           "kind":"ImageStreamTag",
                           "name":"datafoundryweb:latest"
                       },
                       "lastTriggeredImage":""
                   }
               }
               $scope.triggers.push(thisobj);

           }
       }
       $scope.addEnv = function(){
           var newenv = {};
           $scope.envList.push(newenv);


       };

       $scope.delEnv = function(idx){
           $scope.envList.splice(idx,1);
       }
       bsiList ();
       //$scope.createDC();
    }])

    .service('ImageSelect', ['$uibModal', function($uibModal){
        this.open = function () {
            return $uibModal.open({
                templateUrl: 'views/service_create/modal_choose_image.html',
                size: 'default modal-lg',
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

