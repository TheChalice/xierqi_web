'use strict';
angular.module('console.service.create', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/checkbox/checkbox.js',
            ]
        }
    ])
    .controller('ServiceCreateCtrl', [ '$rootScope', '$scope', '$log', 'ImageStream', 'DeploymentConfig', 'ImageSelect','BackingServiceInstance','BackingServiceInstanceBd','ReplicationController',
        function ($rootScope, $scope, $log, ImageStream, DeploymentConfig, ImageSelect,BackingServiceInstance,BackingServiceInstanceBd,ReplicationController) {
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
        $scope.service = {
            spec : {
                ports: [{
                    protocol: '',
                    targetPort: '',
                }]
            }
        }

        //environment
        $scope.envList = [];
        $log.info("ImageStream");
        $scope.loadImageStream = function() {
            ImageSelect.open();
        };

        //创建rc
        var creatRc = function(dcData){
            var rcobj = {
                metadata:{
                    name : dcData.metadata.name+dcData.status.latestVersion
                },

                spec : dcData.spec

            }
            ReplicationController.create({namespace: $rootScope.namespace},rcobj, function (data) {

            });
        }
        //创建dc
        $scope.createDC = function() {
            $scope.deploymentConfig.template.spec.containers.env = $scope.envList;
            //DeploymentConfig.create({namespace: $rootScope.namespace},$scope.deploymentConfig, function (data) {
            //     $log.info('createDC-data',data);
            //if($scope.grid.isautoRun){creatRc(data)}
            //if($scope.grid.isautoDeploy){autoDeploy()}
            //});
            console.log($scope.grid.isautoDeploy)
            console.log("deploymentConfig", $scope.deploymentConfig);
            //bindService();
       };
       var bsiList = function() {
           BackingServiceInstance.get({namespace: $rootScope.namespace}, function (data) {
               $log.info("bsiList", data);
               $scope.BsiList = data.items;
           });
       }
       $scope.addBuildFun = function(idx){
           var bsi = $scope.BsiList[idx];
           bsi.selected = !bsi.selected;
       }
            //绑定服务
       var bindService = function(){
           var bsiarr = [];
           for(var i = 0;i<$scope.BsiList.length;i++){
               if($scope.BsiList[i].selected == true){
                   bsiarr.push($scope.BsiList[i]);
               }
           }
           console.log(bsiarr);
           var bindserviceobj = {
               resourceName : $scope.deploymentConfig.metadata.name,
               bindResourceVersion : {},
               bindKind : 'DeploymentConfig'

           }
           for(var j = 0;j<bsiarr.length;j++){
               BackingServiceInstanceBd.create({namespace: $rootScope.namespace,name:bsiarr[i].metadata.name}, bindserviceobj, function (data) {
                        $log.info('BackingServiceInstanceBd',data);
               });
           }

       }
            // 自动部署
       $scope.grid.isautoDeploy = false;
            //自动发布
       $scope.grid.isautoRun = false;
       var autoDeploy = function(){
           $scope.triggers = [];
           var conTn = $scope.deploymentConfig.template.spec.containers;
           for(var i = 0; i< conTn.length;i++){
               var thisobj = {
                   "type":"ImageChange",
                   "imageChangeParams":{
                       "automatic":true,
                       "containerNames":[
                           "datafoundryweb" // 容器名字
                       ],
                       "from":{
                           "kind":"ImageStreamTag",
                           "name":"datafoundryweb:latest" // 镜像名称 : 镜像版本
                       },
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
            //add container panel
            $scope.addCon = $scope.deploymentConfig.template.spec.containers;
            $scope.addContainer = function() {
                var newContainer = {};
                $scope.deploymentConfig.template.spec.containers.push(newContainer);
                $log.info($scope.addCon);
            }
            //delete container panel
            $scope.delContainer = function(idx) {
                $scope.deploymentConfig.template.spec.containers.splice(idx,1);
            }
            //choose image
            $log.info("ImageStream");
            $scope.loadImageStream = function() {
                ImageSelect.open();
            };
            //get port and tcp from imagestreamtag
            var loadport = function() {
            }
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

