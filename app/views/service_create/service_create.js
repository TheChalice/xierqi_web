'use strict';
angular.module('console.service.create', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/checkbox/checkbox.js',
                'views/service_create/service_create.css'
            ]
        }
    ])
    .controller('ServiceCreateCtrl', [ '$rootScope', '$scope', '$log', 'ImageStream', 'DeploymentConfig', 'ImageSelect','BackingServiceInstance','BackingServiceInstanceBd','ReplicationController','Route', 'Secret', 'Service',
        function ($rootScope, $scope, $log, ImageStream, DeploymentConfig, ImageSelect,BackingServiceInstance,BackingServiceInstanceBd,ReplicationController,Route, Secret, Service) {
            $log.info('ServiceCreate');

            $scope.grid = {
                ports: [],
                port: 0,
                imageChange: true,
                configChange: true,
                checkedsecond : false,
                auto: true
            };

            $scope.envs = [];

            $scope.containerTpl = {
                name: "",
                image: "",    //imageStreamTag
                ports: [],
                "env": [],
                "resources": {},
                "imagePullPolicy": "Always",
                volumeMounts:[{}]
            };

            $scope.triggerConfigTpl = {
                "type": "ConfigChange"
            };

            $scope.triggerImageTpl = {
                "type": "ImageChange",
                "imageChangeParams": {
                    "automatic": true,
                    "containerNames": [
                        ""          //todo 高级配置,手动填充
                    ],
                    "from": {
                        "kind": "ImageStreamTag",
                        "name": ""  //ruby-hello-world:latest
                    }
                }
            };

            $scope.dc = {
                kind: "DeploymentConfig",
                apiVersion: "v1",
                metadata: {
                    name: "",
                    labels: {
                        app: ""
                    }
                },
                spec: {
                    strategy: {},
                    triggers: [],
                    replicas: 1,
                    selector: {
                        app: "",
                        deploymentconfig: ""
                    },
                    template: {
                        metadata: {
                            labels: {
                                app: "",
                                deploymentconfig: ""
                            }
                        },
                        spec: {
                            containers: [],
                            "restartPolicy": "Always",
                            "terminationGracePeriodSeconds": 30,
                            "dnsPolicy": "ClusterFirst",
                            "securityContext": {}
                        }
                    },
                    test: false
                },
                status: {}
            };

            $scope.service = {
                "kind": "Service",
                "apiVersion": "v1",
                "metadata": {
                    "name": "",
                    "labels": {
                        "app": ""
                    }
                },
                "spec": {
                    "ports": [],
                    "selector": {
                        "app": "",
                        "deploymentconfig": ""
                    },
                    //"portalIP": "172.30.189.230",
                    //"clusterIP": "172.30.189.230",
                    "type": "ClusterIP",
                    "sessionAffinity": "None"
                }
            };

            $scope.containerModal = function (idx) {
                var o = $scope.pods.items[idx];
                ContainerModal.open(o);
            };

            $scope.addContainer = function () {
                console.log("addContainer");
                $scope.dc.spec.template.spec.containers.push(angular.copy($scope.containerTpl));
            };

            $scope.rmContainer = function (idx) {
                console.log("rmContainer");
                $scope.dc.spec.template.spec.containers.splice(idx, 1);
                updatePorts();
                isConflict();
            };

            var loadSecrets = function () {
                Secret.get({namespace: $rootScope.namespace}, function(res){
                    $log.info("secrets", res);

                    $scope.secrets = res;
                }, function(res){
                    $log.info("load secrets err", res);
                });
            };
            loadSecrets();

            var loadBsi = function (dc) {
                BackingServiceInstance.get({namespace: $rootScope.namespace}, function(res){
                    $log.info("backingServiceInstance", res);

                    for (var i = 0; i < res.items.length; i++) {
                        if (!res.items[i].spec.binding) {
                            continue;
                        }
                        for (var j = 0; j < res.items[i].spec.binding.length; j++) {
                            if (res.items[i].spec.binding[j].bind_deploymentconfig == dc) {
                                res.items[i].bind = true;
                            }
                        }
                    }

                    $scope.bsi = res;

                }, function(res){
                    //todo 错误处理
                    $log.info("loadBsi err", res);
                });
            };
            loadBsi();

            $scope.addSecret = function (name, idx, last) {
                var containers = $scope.dc.spec.template.spec.containers;
                var container = null;
                for (var i = 0; i < containers.length; i++) {
                    if (containers[i].name == name) {
                        container = containers[i];
                    }
                }
                if (!container) {
                    return;
                }
                if (last) {     //添加
                    container.volumeMounts.push({});
                } else {
                    container.volumeMounts.splice(idx, 1);
                }
            };

            $scope.addEnv = function (name, idx, last) {
                if (last) {     //添加
                    $scope.envs.push({name:'', value: ''});
                } else {
                    for (var i = 0; i < $scope.envs.length; i++) {
                        if ($scope.envs[i].name == name) {
                            $scope.envs.splice(i, 1);
                        }
                    }
                }
            };

            $scope.selectImage = function(idx){
                var container =  $scope.dc.spec.template.spec.containers[idx];
                ImageSelect.open().then(function(res){
                    console.log("imageStreamTag", res);
                    container.image = res.metadata.name;
                    container.ref = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];
                    container.commitId = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'];

                    container.ports = [];
                    var exposedPorts = res.image.dockerImageMetadata.Config.ExposedPorts;
                    for (var k in exposedPorts) {
                        var arr = k.split('/');
                        if (arr.length == 2) {
                            container.ports.push({
                                containerPort: parseInt(arr[0]),
                                protocol: arr[1]
                            })
                        }
                    }
                    updatePorts();
                    isConflict();
                });
            };

            $scope.portMap = {};
            var updatePorts = function(){
                angular.forEach($scope.dc.spec.template.spec.containers, function(item){
                    angular.forEach(item.ports, function(port){
                        port.open = true; //!!$scope.portMap[port.containerPort];
                        port.servicePort = $scope.portMap[port.containerPort] || port.containerPort;
                        if ($scope.grid.ports.indexOf(port.servicePort) == -1) {
                            $scope.grid.ports.push(port.servicePort);
                        }
                    });
                });
            };

            var isConflict = function(){
                var containers = $scope.dc.spec.template.spec.containers;
                for (var i = 0; i < containers.length; i++) {
                    var ports = containers[i].ports;
                    for (var j = 0; j < ports.length; j++) {
                        ports[j].conflict = portConflict(ports[j].containerPort, i, j)
                    }
                }
            };

            var portConflict = function(port, x, y){
                var containers = $scope.dc.spec.template.spec.containers;
                for (var i = 0; i < containers.length; i++) {
                    var ports = containers[i].ports;
                    for (var j = 0; j < ports.length; j++) {
                        if (i == x && j == y) {
                            continue;
                        }
                        if (ports[j].containerPort == port) {
                            return true;
                        }
                    }
                }
                return false;
            };

            $scope.jump = function(d){
                $scope.grid.checked = d;
            };

            var prepareVolume = function(dc){
                var containers = dc.spec.template.spec.containers;
                for (var i = 0; i < containers.length; i++) {
                    var container = containers[i];
                    for (var j = 0; j < container.volumeMounts.length; j++) {
                        if (!container.volumeMounts[j].name || !container.volumeMounts[j].mountPath) {
                            container.volumeMounts.splice(j, 1);
                        }
                    }
                }
            };

            var prepareTrigger = function(dc){
                var triggers = [];
                if ($scope.grid.configChange) {
                    triggers.push({type: 'ConfigChange'});
                }

                if ($scope.grid.imageChange) {
                    var containers = dc.spec.template.spec.containers;
                    for (var i = 0; i < containers.length; i++) {
                        triggers.push({
                            type: 'ImageChange',
                            imageChangeParams: {
                                "automatic": true,
                                "containerNames": [containers[i].name],
                                "from": {
                                    "kind": "ImageStreamTag",
                                    "name": containers[i].image
                                }
                            }
                        });
                    }
                }
                dc.spec.triggers = triggers;
            };

            var isBind = function(bsi, dc){
                var bindings = bsi.spec.binding;
                if (!bindings) {
                    return false;
                }
                for (var j = 0; j < bindings.length; j++) {
                    if (bindings[j].bind_deploymentconfig == dc.metadata.name) {
                        return true;
                    }
                }
                return false;
            };

            var bindService = function(dc){
                angular.forEach($scope.bsi.items, function(bsi){
                    var bindObj = {
                        metadata: {
                            name: bsi.metadata.name
                        },
                        resourceName : dc.metadata.name,
                        bindResourceVersion : '',
                        bindKind : 'DeploymentConfig'
                    };

                    if (isBind(bsi, dc) && !bsi.bind) {  //绑定设置为不绑定
                        BackingServiceInstance.bind.put({namespace: $rootScope.namespace, name: bsi.metadata.name}, bindObj, function(res){
                            $log.info("unbind service success", res);
                        }, function(res){
                            $log.info("unbind service fail", res);
                        });
                    }

                    if (!isBind(bsi, dc) && bsi.bind) {  //未绑定设置为绑定
                        BackingServiceInstance.bind.create({namespace: $rootScope.namespace, name: bsi.metadata.name}, bindObj, function(res){
                            $log.info("bind service success", res);
                        }, function(res){
                            $log.info("bind service fail", res);
                        });
                    }
                });
            };

            var createService = function(dc) {

                prepareService($scope.service, dc);

                var ps = [];
                var containers = dc.spec.template.spec.containers;
                for (var i = 0; i < containers.length; i++) {
                    var ports = containers[i].ports;
                    for (var j = 0; j < ports.length; j++) {
                        if (!ports[j].open) {
                            continue;
                        }
                        ps.push({
                            name: ports[j].servicePort + '-' + ports[j].protocol.toLowerCase(),
                            port: ports[j].servicePort,
                            protocol: ports[j].protocol,
                            targetPort: ports[j].containerPort
                        });
                    }
                }
                $scope.service.spec.ports = ps;
                Service.create({namespace: $rootScope.namespace}, $scope.service, function(res){
                    $log.info("create service success", res);
                    $scope.service = res;
                }, function(res){
                    $log.info("create service fail", res);
                });
            };

            var prepareService = function(service, dc){
                service.metadata.name = dc.metadata.name;
                service.metadata.labels.app = dc.metadata.name;
                service.spec.selector.app = dc.metadata.name;
                service.spec.selector.app = dc.metadata.name;
            };

            var prepareDc = function(dc){
                var name = dc.metadata.name;
                dc.metadata.labels.app = name;
                dc.spec.selector.app = name;
                dc.spec.selector.deploymentconfig = name;
                dc.spec.template.metadata.labels.app = name;
                dc.spec.template.metadata.labels.deploymentconfig = name;
            };

            var prepareEnv = function(dc){
                var containers = dc.spec.template.spec.containers;
                for (var i = 0; i < containers.length; i++) {
                    containers[i].env = $scope.envs;
                }
            };

            $scope.createDc = function(){
                var dc = angular.copy($scope.dc);

                prepareDc(dc);
                prepareVolume(dc);
                prepareTrigger(dc);
                prepareEnv(dc);

                if ($scope.grid.auto) {
                    console.log("=====auto-=====", $scope.grid.auto);
                    dc.status.latestVersion = 1;
                }

                $log.info("update dc", dc);

                DeploymentConfig.create({namespace: $rootScope.namespace}, dc, function(res){
                    $log.info("create dc success", res);
                    bindService(dc);
                    createService(dc);
                }, function(res){
                    //todo 错误处理
                    $log.info("create dc fail", res);
                });
            };



















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
                        replicas: 0,
                        restartPolicy: "Always",
                        Volumes: {
                            name: '',
                            secret: '',
                            secretName: ''
                        }
                    }
                }
            };


            //environment
            $scope.serviceport = $scope.service.spec.ports;
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
                //if($scope.grid.checkedsecond){setRoute()}
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
            // 路由设置
            $scope.routeobj = {
                metadata : {
                    name : $scope.deploymentConfig.metadata.name
                },
                spec : {
                    host : '',
                    to : {
                        kind : "Service",
                        name : $scope.deploymentConfig.metadata.name
                    },
                    port : {
                        targetPort : ''
                    }
                }
            }


             var setRoute = function(){
                 var copyrtb = angular.copy($scope.routeobj);
                 copyrtb.spec.host = copyrtb.spec.host+'lab.asiainfodata.com';
                 Route.create({namespace: $rootScope.namespace},copyrtb, function (data) {
                     $log.info("Route.create", data);

                 });
                 console.log('copyrtb----',copyrtb);
             }
            //绑定服务
            var bindService2 = function(){
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
            //go to advantage
       $scope.isValid = function() {
           if($scope.deploymentConfig.metadata.name && $scope.deploymentConfig.template.spec.containers.name) {
               $scope.grid.checked = true;
           }
       }
       //back to basic
       $scope.notVaild = function() {
           $scope.grid.checked = false;
       }

            // 自动部署
            $scope.grid.isautoDeploy = false;
            //自动发布
            $scope.grid.isautoRun = false;
            var autoDeploy = function(){
                $scope.triggers = [];
                var conTn = $scope.deploymentConfig.template.spec.containers;
                var serviceLi =  $scope.service.spec;
                for(var i = 0; i< conTn.length;i++){
                    var thisobj = {
                        "type":"ImageChange",
                        "imageChangeParams":{
                            "automatic":true,
                            "containerNames":[
                                conTn[i].name // 容器名字
                            ],
                            "from":{
                                "kind":"ImageStreamTag",
                                "name":"datafoundryweb:latest" // 镜像名称 : 镜像版本
                            },
                        }
                    }
                    $scope.triggers.push(thisobj);

                }
                $scope.deploymentConfig.spec.triggers = $scope.triggers;
            }
            $scope.addEnv2 = function(){
                var newenv = {};
                $scope.envList.push(newenv);
            };

            $scope.delEnv = function(idx){
                $scope.envList.splice(idx,1);
            }
            bsiList ();
            //add container panel and port panel
            $scope.addCon = $scope.deploymentConfig.template.spec.containers;

            //delete container panel
            $scope.delContainer = function(idx) {
                $scope.deploymentConfig.template.spec.containers.splice(idx,1);
            }
            //choose image
            $scope.loadImageStream = function() {
                ImageSelect.open();
            };
            //get port and tcp from imagestreamtag
            var loadport = function() {
            }
        }]);

