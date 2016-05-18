'use strict';
angular.module('console.service.detail', [
    'kubernetesUI',
    {
        files: [
            'views/service_detail/service_detail.css',
            'components/datepick/datepick.js',
            'components/checkbox/checkbox.js'
        ]
    }
])
    .controller('ServiceDetailCtrl', ['$state','$rootScope', '$scope', '$log', '$stateParams', 'DeploymentConfig', 'ReplicationController', 'Route', 'BackingServiceInstance', 'ImageStream', 'ImageStreamTag', 'Toast', 'Pod', 'Event', 'Sort', 'Confirm', 'Ws', 'LogModal', 'ContainerModal', 'Secret', 'ImageSelect', 'Service', 'ImageService',
        function($state,$rootScope, $scope, $log, $stateParams, DeploymentConfig, ReplicationController, Route, BackingServiceInstance, ImageStream, ImageStreamTag, Toast, Pod, Event, Sort, Confirm, Ws, LogModal, ContainerModal, Secret, ImageSelect, Service, ImageService) {
        //获取服务列表

        $scope.grid = {
            ports: [],
            port: 0,
            host: '',
            suffix: '.app.dataos.io'
        };
        $scope.portMap = {};

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

        var getEnvs = function(containers){
            $scope.envs = [];
            for (var i = 0; i < containers.length; i++) {
                var envs = containers[i].env || [];
                for (var j = 0; j < envs.length; j++) {
                    if (!inEnvs(envs[j].name)) {
                        $scope.envs.push(envs[j]);
                    }
                }
            }
        };

        var inEnvs = function(name){
            for (var i = 0; i < $scope.envs.length; i++) {
                if ($scope.envs[i].name == name) {
                    return true;
                }
            }
            return false;
        };

        var getIst = function(name){
            var triggers = $scope.dc.spec.triggers || [];
            for (var j = 0; j < triggers.length; j++) {
                if (triggers[j].type == "ImageChange") {
                    if (triggers[j].imageChangeParams.containerNames.indexOf(name) != -1) {
                        return triggers[j].imageChangeParams.from.name;
                    }
                }
            }
            return null;
        };

        var loadDc = function (name) {
            DeploymentConfig.get({namespace: $rootScope.namespace, name: name}, function(res){
                $log.info("deploymentConfigs", res);
                $scope.dc = res;

                getEnvs(res.spec.template.spec.containers);

                angular.forEach($scope.dc.spec.triggers, function(trigger){
                    if (trigger.type == 'ImageChange') {
                        $scope.grid.imageChange = true;
                    }
                    if (trigger.type == 'ConfigChange') {
                        $scope.grid.configChange = true;
                    }
                });

                var volumeMap = {};
                if (res.spec.template.spec.volumes) {
                    for (var i = 0; i < res.spec.template.spec.volumes.length; i++) {
                        volumeMap[res.spec.template.spec.volumes[i].name] = res.spec.template.spec.volumes[i].secret.secretName;
                    }
                }

                angular.forEach($scope.dc.spec.template.spec.containers, function(item){
                    angular.forEach(item.volumeMounts, function(volume){
                        if (volumeMap[volume.name]) {
                            volume.name = volumeMap[volume.name];
                        }
                    });
                    if (!item.volumeMounts || item.volumeMounts.length == 0) {
                        item.volumeMounts = [{}];
                    }
                    var name = getIst(item.name);
                    if (name) {
                        var foos = name.split(':');
                        if (foos.length > 1) {
                            item.image = foos[0];
                            item.tag = foos[1];
                        }
                        //ImageStreamTag.get({namespace: $rootScope.namespace, name: name}, function(res){
                        //    item.image = name;
                        //    if (res.tag) {
                        //        item.tag = res.tag.name;
                        //    }
                        //});
                    } else {
                        item.tag = ImageService.tag(item);
                    }
                });

                loadRcs(res.metadata.name);
                loadRoutes();
                loadBsi($scope.dc.metadata.name);
                loadPods(res.metadata.name);
                loadService(res.metadata.name);
                isConflict();   //判断端口是否冲突

            }, function(res){
                //todo 错误处理
            });
        };

        var updatePorts = function(containers){
            angular.forEach(containers, function(item){
                angular.forEach(item.ports, function(port){
                    port.servicePort = $scope.portMap[port.containerPort + ''] || port.containerPort;
                    port.open = !!$scope.portMap[port.containerPort];
                });
            });
        };

        var loadService = function(dc){
            Service.get({namespace: $rootScope.namespace, name: dc}, function(res){
                $log.info("service", res);
                $scope.service = res;

                for (var i = 0; i < res.spec.ports.length; i++) {
                    var port = res.spec.ports[i];
                    $scope.portMap[port.targetPort + ''] = port.port;
                }

                updatePorts($scope.dc.spec.template.spec.containers);

            }, function(res){
                $log.info("load service err", res);
                updatePorts($scope.dc.spec.template.spec.containers);
            });
        };

        $scope.updatePorts = function(){
            $scope.grid.ports = [];
            angular.forEach($scope.dc.spec.template.spec.containers, function(item){
                angular.forEach(item.ports, function(port){
                    if ($scope.grid.ports.indexOf(port.servicePort) == -1) {
                        $scope.grid.ports.push(port.servicePort);
                    }
                });
            });
        };

        var isConflict = function(){
            var containers = $scope.dc.spec.template.spec.containers;
            for (var i = 0; i < containers.length; i++) {
                var ports = containers[i].ports || [];
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

        loadDc($stateParams.name);

        var serviceState = function () {
            if ($scope.dc.spec.replicas == 0) {
                return 'ready'; //未启动
            }
            if ($scope.dc.status.replicas == 0) {
                return 'ready'; //未启动
            }
            if ($scope.dc.status.replicas == 0) {
                return 'abnormal';  //异常
            }
            if ($scope.dc.status.replicas == $scope.dc.spec.replicas ) {
                return 'normal';    //正常
            }
            return 'warning';   //告警
        };

        var loadRcs = function (name) {
            var labelSelector = 'openshift.io/deployment-config.name=' + name;
            ReplicationController.get({namespace: $rootScope.namespace, labelSelector: labelSelector}, function(res){
                $log.info("replicationControllers", res);

                res.items = Sort.sort(res.items, -1);

                for (var i = 0; i < res.items.length; i++) {
                    res.items[i].dc = JSON.parse(res.items[i].metadata.annotations['openshift.io/encoded-deployment-config']);
                    if (res.items[i].metadata.name == $scope.dc.metadata.name + '-' + $scope.dc.status.latestVersion) {
                        $scope.dc.status.replicas = res.items[i].status.replicas;
                        $scope.dc.status.phase = res.items[i].metadata.annotations['openshift.io/deployment.phase'];
                    }
                    if (res.items[i].metadata.annotations['openshift.io/deployment.cancelled'] == 'true') {
                        res.items[i].metadata.annotations['openshift.io/deployment.phase'] = 'Cancelled';
                    }
                }
                $scope.dc.state = serviceState();

                $scope.resourceVersion = res.metadata.resourceVersion;

                $scope.rcs = res;

                watchRcs(res.metadata.resourceVersion);
            }, function(res){
                //todo 错误处理
            });
        };

        var loadRoutes = function () {
            Route.get({namespace: $rootScope.namespace}, function(res){
                $log.info("routes", res);

                for (var i = 0; i < res.items.length; i++) {
                    if (res.items[i].spec.to.kind != 'Service') {
                        continue;
                    }
                    if (res.items[i].spec.to.name == $scope.dc.metadata.name) {
                        $scope.dc.route = res.items[i];

                        $scope.grid.route = true;
                        $scope.grid.host = $scope.dc.route.spec.host.replace($scope.grid.suffix, '');
                        $scope.grid.port = parseInt($scope.dc.route.spec.port.targetPort.replace(/-.*/, ''));
                    }
                }
            }, function(res){
                //todo 错误处理
                $log.info("loadRoutes err", res);
            });
        };

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

        var watchRcs = function(resourceVersion) {
            Ws.watch({
                api: 'k8s',
                resourceVersion: resourceVersion,
                namespace: $rootScope.namespace,
                type: 'replicationcontrollers',
                name: ''
            }, function(res){
                var data = JSON.parse(res.data);
                updateRcs(data);
            }, function(){
                $log.info("webSocket start");
            }, function(){
                $log.info("webSocket stop");
                var key = Ws.key($rootScope.namespace, 'replicationcontrollers', '');
                if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                    return;
                }
                watchRcs($scope.resourceVersion);
            });
        };

        var updateRcs = function(data){
            if (data.type == 'ERROR') {
                $log.info("err", data.object.message);
                Ws.clear();
                loadRcs($scope.dc.metadata.name);
                return;
            }

            $scope.resourceVersion = data.object.metadata.resourceVersion;
            $scope.dc.status.phase = data.object.metadata.annotations['openshift.io/deployment.phase'];
            $scope.dc.state = serviceState();

            data.object.dc = JSON.parse(data.object.metadata.annotations['openshift.io/encoded-deployment-config']);
            if (data.object.metadata.name == $scope.dc.metadata.name + '-' + $scope.dc.status.latestVersion) {
                $scope.dc.status.replicas = data.object.status.replicas;
            }
            if (data.object.metadata.annotations['openshift.io/deployment.cancelled'] == 'true') {
                data.object.metadata.annotations['openshift.io/deployment.phase'] = 'Cancelled';
            }

            DeploymentConfig.log.get({namespace: $rootScope.namespace, name: $scope.dc.metadata.name}, function(res){
                var result = "";
                for(var k in res){
                    result += res[k];
                }
                data.object.log = result;
            }, function(res){
                //todo 错误处理
                data.object.log = res.data.message;
            });

            if (data.type == 'ADDED') {
                data.object.showLog = true;
                if ($scope.rcs.items.length > 0) {
                    $scope.rcs.items.unshift(data.object);
                } else {
                    $scope.rcs.items = [data.object];
                }
            } else if (data.type == "MODIFIED") {
                angular.forEach($scope.rcs.items, function(item, i){
                    if (item.metadata.name == data.object.metadata.name) {
                        data.object.showLog = item.showLog;
                        $scope.rcs.items[i] = data.object;
                    }
                });
            }
        };

        $scope.startDc = function(){
            if ($scope.dc.spec.replicas == 0) {
                $scope.dc.spec.replicas = 1;
                $scope.dc.status.latestVersion = 2;
                $scope.updateDc();
                return;
            }

            var rcName = $scope.dc.metadata.name + '-' + $scope.dc.status.latestVersion;
            var items = $scope.rcs.items;
            var item = null;
            for (var i = 0; i < items.length; i++) {
                if (rcName == items[i].metadata.name) {
                    item = items[i]
                }
            }
            if (item) {
                item.spec.replicas = $scope.dc.spec.replicas;
                ReplicationController.put({namespace: $rootScope.namespace, name: item.metadata.name}, item, function(res){
                    $log.info("start dc success", res);
                    item = res;
                }, function(res){
                    //todo 错误处理
                    $log.info("start rc err", res);
                });
            } else {
                //todo 没有rc怎么办?
            }
        };

        $scope.stopDc = function(){
            var rcName = $scope.dc.metadata.name + '-' + $scope.dc.status.latestVersion;
            var items = $scope.rcs.items;
            var item = null;
            for (var i = 0; i < items.length; i++) {
                if (rcName == items[i].metadata.name) {
                    item = items[i]
                }
            }
            if (item) {
                item.spec.replicas = 0;
                ReplicationController.put({namespace: $rootScope.namespace, name: item.metadata.name}, item, function(res){
                    $log.info("start dc success", res);
                    item = res;

                }, function(res){
                    //todo 错误处理
                    $log.info("start rc err", res);
                });
            }
        };

        $scope.startRc = function(idx){
            var o = $scope.rcs.items[idx];
            if (!o.dc) {
                return;
            }
            o.dc.metadata.resourceVersion = $scope.dc.metadata.resourceVersion;
            o.dc.status.latestVersion = $scope.dc.status.latestVersion + 1;
            DeploymentConfig.put({namespace: $rootScope.namespace, name: o.dc.metadata.name}, o.dc, function(res){
                $log.info("start rc success", res);

            }, function(res){
                //todo 错误处理
                $log.info("start rc err", res);
            });
        };

        $scope.stopRc = function(idx){
            var o = $scope.rcs.items[idx];
            Confirm.open("终止部署", "您确定要终止本次部署吗?", "", 'stop').then(function() {
                o.metadata.annotations['openshift.io/deployment.cancelled'] = 'true';
                ReplicationController.put({namespace: $rootScope.namespace, name: o.metadata.name}, o, function(res){
                    $log.info("stop rc success", res);

                    Toast.open('本部署已经终止');

                }, function(res){
                    //todo 错误处理
                    $log.info("stop rc err", res);
                });
            });
        };

        var rmRcs = function (dc) {
            if (!dc) {
                return;
            }
            var labelSelector = 'openshift.io/deployment-config.name=' + dc;
            ReplicationController.remove({namespace: $rootScope.namespace, labelSelector: labelSelector}, function(res){
                $log.info("remove rcs success", res);
                rmDc(dc)
            }, function(res){
                $log.info("remove rcs err", res);
            });
        };

        var rmDc = function (dc) {
            if (!dc) {
                return;
            }
            DeploymentConfig.remove({
                namespace: $rootScope.namespace,
                name: dc
            }, function () {
                $log.info("remove deploymentConfig success");

                $state.go("console.service");

            }, function (res) {
                $log.info("remove deploymentConfig fail", res);
                //todo 错误处理
            });
        };

        $scope.delete = function(){
            Confirm.open("删除服务", "您确定要删除服务吗?", "删除服务将解绑持久化卷和外部服务,此操作不能被撤销", 'recycle').then(function() {
                if ($scope.rcs.items.length > 0) {
                    rmRcs($scope.dc.metadata.name);
                } else {
                    rmDc($scope.dc.metadata.name)
                }
            });
        };

        $scope.getLog = function(idx){
            var o = $scope.rcs.items[idx];
            o.showLog = !o.showLog;
            o.showConfig = false;

            //存储已经调取过的log
            if (o.log) {
                return;
            }
            DeploymentConfig.log.get({namespace: $rootScope.namespace, name: $scope.dc.metadata.name}, function(res){
                var result = "";
                for(var k in res){
                    result += res[k];
                }
                o.log = result;
            }, function(res){
                //todo 错误处理
                o.log = res.data.message;
            });
        };

        $scope.getConfig = function(idx){
            var o = $scope.rcs.items[idx];
            o.showConfig = !o.showConfig;

            if (o.dc) {
                updatePorts(o.dc.spec.template.spec.containers);
            }

            $scope.bindingBsi = [];
            angular.forEach($scope.bsi.items, function(item){
                angular.forEach(item.spec.binding, function(bind){
                    console.log("============", bind.bind_deploymentconfig, o.dc.metadata.name);
                    if (bind.bind_deploymentconfig == o.dc.metadata.name) {
                        $scope.bindingBsi.push(o.dc.metadata.name);
                    }
                })
            });

            o.showLog = false;

            //todo 获取更多的配置
        };

        var loadPods = function (dc) {
            var labelSelector = 'deploymentconfig=' + dc;
            Pod.get({namespace: $scope.namespace, labelSelector: labelSelector}, function(res){
                $log.info("pods", res);
                $scope.pods = res;

                loadEvents(res.items);

            }, function(res){
                //todo 错误处理
                $log.info("loadPods err", res);
            });
        };

        var loadEvents = function (pods) {
            var podNames = [];
            for (var i = 0; i < pods.length; i++) {
                podNames.push(pods[i].metadata.name);
            }
            Event.get({namespace: $rootScope.namespace}, function(res){
                $log.info("events", res);

                var events = [];
                for (var i = 0; i < res.items.length; i++) {
                    if (podNames.indexOf(res.items[i].involvedObject.name) != -1) {
                        events.push(res.items[i]);
                    }
                }
                res.items = Sort.sort(events, -1);
                $scope.events = res;
            }, function(res){
                //todo 错误处理
                $log.info("loadEvents err", res)
            });
        };

        $scope.logModal = function (idx) {
            var o = $scope.pods.items[idx];
            LogModal.open(o.metadata.name);
        };

        $scope.containerModal = function (idx) {
            var o = $scope.pods.items[idx];
            ContainerModal.open(o);
        };

        $scope.addContainer = function () {
            $log.info("addContainer");
            $scope.dc.spec.template.spec.containers.push({volumeMounts:[{}], show: true, new: true});
        };

        $scope.rmContainer = function (idx) {
            console.log("rmContainer");
            $scope.dc.spec.template.spec.containers.splice(idx, 1);
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

          $scope.addprot =function (container) {
            console.log(1)
            container.ports.push({
              containerPort: "",
              protocol: "tcp",
              servicePort: "",

            })
          };

        $scope.selectImage = function(idx){
            var container =  $scope.dc.spec.template.spec.containers[idx];
            ImageSelect.open().then(function(res){
                console.log("imageStreamTag", res);
                container.image = res.metadata.name;
                container.tag = res.tag.name;
                var arr = res.metadata.name.split(':');
                if (arr.length > 1) {
                    container.name = arr[0];
                }

                container.ports = [];
              
                var exposedPorts = res.image.dockerImageMetadata.Config.ExposedPorts;
                for (var k in exposedPorts) {
                    arr = k.split('/');
                    if (arr.length == 2) {
                        container.ports.push({
                              
                            containerPort: parseInt(arr[0]),
                            protocol: arr[1],
                            servicePort: $scope.portMap[arr[0]] || arr[0],
                            open: !!$scope.portMap[arr[0]]
                        })
                    }
                }
                isConflict();
            });
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
                    $log.info('containers=====',containers[i]);
                    triggers.push({
                        type: 'ImageChange',
                        imageChangeParams: {
                            "automatic": true,
                            "containerNames": [containers[i].name],
                            "from": {
                                "kind": "ImageStreamTag",
                                "name": containers[i].image+':'+containers[i].tag
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

        var updateService = function(dc) {
            var ps = [];
            var containers = dc.spec.template.spec.containers;
            for (var i = 0; i < containers.length; i++) {
                var ports = containers[i].ports || [];
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
            $scope.service.metadata.name = $scope.dc.metadata.name;
            Service.put({namespace: $rootScope.namespace, name: $scope.service.metadata.name}, $scope.service, function(res){
                $log.info("update service success", res);
                $scope.service = res;
            }, function(res){
                $log.info("update service fail", res);
            });
        };

        var prepareRoute = function(route, dc){
            route.metadata.name = dc.metadata.name;
            route.metadata.labels.app = dc.metadata.name;
            route.spec.host = $scope.grid.host + $scope.grid.suffix;
            route.spec.to.name = dc.metadata.name;
            route.spec.port.targetPort = $scope.grid.port + '-tcp';
        };

        var prepareEnv = function(dc){
            var containers = dc.spec.template.spec.containers;
            for (var i = 0; i < containers.length; i++) {
                containers[i].env = $scope.envs;
            }
        };

        $scope.route = {
            "kind": "Route",
            "apiVersion": "v1",
            "metadata": {
                "name": "",
                "labels": {
                    "app": ""
                }
            },
            "spec": {
                "host": "",
                "to": {
                    "kind": "Service",
                    "name": ""
                },
                "port": {
                    "targetPort": ""
                }
            }
        };

        var updateRoute = function(dc) {
            if (dc.route) {     //route存在,更新route
                dc.route.spec.host = $scope.grid.host + $scope.grid.suffix;
                dc.route.spec.port.targetPort = $scope.grid.port + '-tcp';
                Route.put({namespace: $rootScope.namespace, name: dc.route.metadata.name}, dc.route, function(res){
                    $log.info("create route success", res);
                    $scope.route = res;
                }, function(res){
                    $log.info("create route fail", res);
                });
            } else {            //route不存在,创建route
                prepareRoute($scope.route, dc);
                Route.create({namespace: $rootScope.namespace}, $scope.route, function(res){
                    $log.info("create route success", res);
                    $scope.route = res;
                }, function(res){
                    $log.info("create route fail", res);
                });
            }
        };

        $scope.updateDc = function(){
            var dc = angular.copy($scope.dc);
            $log.info("-=-=-=-=-=-=",dc);
            dc.spec.template.spec.volumes = [];
            var flog = 0;
            for(var i = 0 ; i <dc.spec.template.spec.containers.length; i++){
                for(var j = 0;j<dc.spec.template.spec.containers[i].volumeMounts.length;j++){
                    flog++;
                    var volume1 = "volume"+flog;

                    dc.spec.template.spec.volumes.push(
                        {
                            "name" : volume1,
                            "secret" : {
                                "secretName" : dc.spec.template.spec.containers[i].volumeMounts[j].name
                            }
                        }
                    );
                    dc.spec.template.spec.containers[i].volumeMounts[j].name = volume1;
                }
            }
            prepareVolume(dc);
            prepareTrigger(dc);
            prepareEnv(dc);
            updateService(dc);
            if ($scope.grid.route) {
                updateRoute(dc);
            }

            $log.info("update dc", dc);

            DeploymentConfig.put({namespace: $rootScope.namespace, name: dc.metadata.name}, dc, function(res){
                $log.info("update dc success", res);
                bindService(dc);
                $scope.active = 1;
            }, function(res){
                //todo 错误处理
                $log.info("update dc fail", res);
            });
        };
    }])
    .service('LogModal', ['$uibModal', function ($uibModal) {
        this.open = function (pod) {
            return $uibModal.open({
                templateUrl: 'views/service_detail/logModal.html',
                size: 'default modal-lg',
                controller: ['$rootScope', '$scope', '$uibModalInstance', 'Pod', function ($rootScope, $scope, $uibModalInstance, Pod) {
                    $scope.grid = {};
                    $scope.pod = pod;
                    $scope.ok = function () {
                        $uibModalInstance.close(true);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };

                    $scope.getLog = function (pod) {
                        var params = {
                            namespace: $rootScope.namespace,
                            name: pod,
                            sinceTime: $scope.grid.st ? $scope.grid.st.toISOString(): (new Date(0)).toISOString()
                        };
                        Pod.log.get(params, function(res){
                            var result = "";
                            for(var k in res){
                                result += res[k];
                            }
                            $scope.log = result;
                        }, function(res){
                            $scope.log = res.data.message;
                        });
                    };
                    $scope.getLog(pod);
                    $scope.search = function () {
                        $scope.getLog($scope.pod);
                    };
                }]
            }).result;
        };
    }])
    .service('ContainerModal', ['$uibModal', function ($uibModal) {
        this.open = function (pod) {
            return $uibModal.open({
                templateUrl: 'views/service_detail/containerModal.html',
                size: 'default modal-lg',
                controller: ['$rootScope', '$scope', '$log', '$uibModalInstance', 'ImageStream', 'Pod', 'Ws', 'Metrics', 'MetricsService', function ($rootScope, $scope, $log, $uibModalInstance, ImageStream, Pod, Ws, Metrics, MetricsService) {
                    $scope.pod = pod;
                    $scope.grid = {
                        show: false,
                        mem: false,
                        cpu: false
                    };
                    $scope.ok = function () {
                        $uibModalInstance.close(true);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };

                    var imageStreamName = function(image){
                        if (!image) {
                            return "";
                        }
                        var match = image.match(/\/([^/]*)@sha256/);
                        if (!match) {
                            return "";
                        }
                        return match[1];
                    };

                    var preparePod = function(pod){
                        var status = pod.status.containerStatuses;
                        var statusMap = {};
                        for (var i = 0; i < status.length; i++) {
                            statusMap[status[i].name] = status[i];
                        }
                        var containers = pod.spec.containers;
                        angular.forEach(pod.spec.containers, function(container){
                            if (statusMap[container.name]) {
                                container.status = statusMap[container.name];
                            }

                            ImageStream.get({namespace: $rootScope.namespace, name: imageStreamName(container.image)}, function(res){
                                if (res.kind == 'ImageStream') {
                                    angular.forEach(res.status.tags, function (tag) {
                                        angular.forEach(tag.items, function (item) {
                                            if (container.image.indexOf(item.image)) {
                                                container.tag = tag.tag;
                                            }
                                        });
                                    });
                                }
                            });
                        });
                        console.log('====', $scope.pod)
                    };
                    preparePod($scope.pod);

                    $scope.containerDetail = function(idx){
                        var o = pod.spec.containers[idx];
                        $scope.grid.show = true;
                        $scope.container = o;
                        $scope.getLog(o.name);
                        //terminal(o.name);
                        getMetrics(pod, o);
                    };

                    $scope.back = function(){
                        $scope.grid.show = false;
                    };

                    $scope.search = function(){
                        console.log("sinceTime", $scope.grid.st);
                        $scope.getLog($scope.container.name);
                    };

                    $scope.getLog = function (container) {
                        var params = {
                            namespace: $rootScope.namespace,
                            name: pod.metadata.name,
                            container: container,
                            sinceTime: $scope.grid.st ? $scope.grid.st.toISOString() : (new Date(0)).toISOString()
                        };
                        Pod.log.get(params, function(res){
                            var result = "";
                            for(var k in res){
                                result += res[k];
                            }
                            $scope.log = result;
                            console.log(result);
                        }, function(res){
                            $scope.log = res.data.message;
                        });
                    };

                    $scope.terminalSelect = function(){
                        $scope.terminalTabWasSelected = true;
                    };

                    $scope.terminalTabWasSelected = false;

                    var setChart = function(name, data){
                        data = prepareData(name, data);
                        return {
                            options: {
                                chart: {
                                    type: 'areaspline'
                                },
                                title: {
                                    text: name,
                                        align: 'left',
                                        x: 0,
                                        style: {
                                        fontSize: '12px'
                                    }
                                },
                                tooltip: {
                                    backgroundColor: '#666',
                                    borderWidth: 0,
                                    shadow: false,
                                    style: {
                                        color: '#fff'
                                    },
                                    formatter: function(){
                                        if (name == 'CPU') {
                                            return this.y.toFixed(2);
                                        }
                                        return (this.y / 1000000).toFixed(2) + 'M';
                                    }
                                },
                                legend: {
                                    enabled: false
                                }
                            },
                            series: [{
                                color: '#f6a540',
                                fillOpacity: 0.3,
                                marker: {
                                    enabled: false
                                },
                                data: data,
                                pointStart: (new Date()).getTime() - 30 * 60 * 1000 + 8 * 3600 * 1000,
                                pointInterval: 30000 //时间间隔
                            }],
                            xAxis: {
                                type: 'datetime',
                                gridLineWidth: 1
                            },
                            yAxis: {
                                gridLineDashStyle: 'ShortDash',
                                    title: {
                                    text: ''
                                }
                            },
                            size: {
                                width: 798,
                                height: 130
                            },
                            func: function (chart) {
                                //setup some logic for the chart
                            }
                        };
                    };

                    var prepareData = function(tp, data){
                        var res = [];
                        MetricsService.normalize(data, tp);
                        for (var i = 0; i < data.length - 1; i++) {
                            res.push(data[i].value);
                        }
                        return res;
                    };

                    var getMetrics = function(pod, container){
                        var st = (new Date()).getTime() - 30 * 60 * 1000;
                        var gauges = container.name + '/' + pod.metadata.uid + '/memory/usage';
                        var counters = container.name + '/' + pod.metadata.uid + '/cpu/usage';
                        Metrics.mem.query({gauges: gauges, buckets: 61, start: st}, function(res){
                            $log.info("metrics mem", res);
                            $scope.chartConfigMem = setChart('内存', res);
                            $scope.grid.mem = true;
                        }, function(res){
                            $log.info("metrics mem err", res);
                            $scope.chartConfigMem = setChart('内存', []);
                            $scope.grid.mem = false;
                        });
                        Metrics.cpu.query({counters: counters, buckets: 61, start: st}, function(res){
                            $log.info("metrics cpu", res);
                            $scope.chartConfigCpu = setChart('CPU', res);
                            $scope.grid.cpu = true;
                        }, function(res){
                            $log.info("metrics cpu err", res);
                            $scope.chartConfigCpu = setChart('CPU', []);
                            $scope.grid.cpu = false;
                        });
                    };

                    $scope.chartConfigIo = setChart('网络IO', []);
                }]
            }).result;
        };
    }])
    .filter('rcStatusFilter', [function() {
        return function(phase) {
            if (phase == "New" || phase == "Pending" || phase == "Running") {
                return "正在部署"
            } else if (phase == "Complete") {
                return "部署成功"
            } else if (phase == "Failed") {
                return "部署失败"
            } else if (phase == "Error") {
                return "部署错误"
            } else if (phase == "Cancelled") {
                return "终止"
            } else {
                return phase || "-"
            }
        };
    }]);
