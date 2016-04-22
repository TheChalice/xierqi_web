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
    .controller('ServiceDetailCtrl', ['$rootScope', '$scope', '$log', '$stateParams', 'DeploymentConfig', 'ReplicationController', 'Route', 'BackingServiceInstance', 'ImageStream', 'ImageStreamTag', 'Toast', 'Pod', 'Event', 'Sort', 'Confirm', 'Ws', 'LogModal', 'ContainerModal', 'Secret', 'ImageSelect',
        function($rootScope, $scope, $log, $stateParams, DeploymentConfig, ReplicationController, Route, BackingServiceInstance, ImageStream, ImageStreamTag, Toast, Pod, Event, Sort, Confirm, Ws, LogModal, ContainerModal, Secret, ImageSelect) {
        //获取服务列表
        var loadDc = function (name) {
            DeploymentConfig.get({namespace: $rootScope.namespace, name: name}, function(res){
                $log.info("deploymentConfigs", res);
                $scope.dc = res;

                $scope.envs = [];
                if (res.spec.template.spec.containers.length > 0) {
                    $scope.envs = res.spec.template.spec.containers[0].env;
                }

                angular.forEach($scope.dc.spec.template.spec.containers, function(item){
                    if (!item.volumeMounts || item.volumeMounts.length == 0) {
                        item.volumeMounts = [{}];
                    }
                    ImageStreamTag.get({namespace: $rootScope.namespace, name: item.image}, function(res){
                        item.ref = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];
                        item.commitId = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'];
                    });
                });

                loadRcs(res.metadata.name);
                loadRoutes();
                loadBsi($scope.dc.metadata.name);
                loadPods(res.metadata.name);
                isConflict();   //判断端口是否冲突

            }, function(res){
                //todo 错误处理
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
                $scope.resourceVersion = data.object.metadata.resourceVersion;
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
            o.showLog = false;

            //todo 获取更多的配置
        };

        var loadPods = function (dc) {
            var labelSelector = '';//'deploymentconfig=' + dc;
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
            console.log("addContainer");
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

        $scope.selectImage = function(idx){
            var container =  $scope.dc.spec.template.spec.containers[idx];
            ImageSelect.open().then(function(res){
                console.log("imageStreamTag", res);
                container.image = res.metadata.name;
                container.name = res.metadata.name.replace(/:.*/, '');
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
                isConflict();
            });
        };
    }])
    .service('LogModal', ['$uibModal', function ($uibModal) {
        this.open = function (pod) {
            return $uibModal.open({
                templateUrl: 'views/service_detail/logModal.html',
                size: 'default modal-lg',
                controller: ['$rootScope', '$scope', '$uibModalInstance', 'Pod', function ($rootScope, $scope, $uibModalInstance, Pod) {
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
                            name: pod
                            //sinceTime: ''
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
                }]
            }).result;
        };
    }])
    .service('ContainerModal', ['$uibModal', function ($uibModal) {
        this.open = function (pod) {
            return $uibModal.open({
                templateUrl: 'views/service_detail/containerModal.html',
                size: 'default modal-lg',
                controller: ['$rootScope', '$scope', '$log', '$uibModalInstance', 'Pod', 'Ws', function ($rootScope, $scope, $log, $uibModalInstance, Pod, Ws) {
                    $scope.pod = pod;
                    $scope.grid = {
                        show: false
                    };
                    $scope.ok = function () {
                        $uibModalInstance.close(true);
                    };
                    $scope.cancel = function () {
                        $uibModalInstance.dismiss();
                    };

                    $scope.containerDetail = function(idx){
                        var o = pod.spec.containers[idx];
                        $scope.grid.show = true;
                        $scope.container = o;
                        $scope.getLog(o.name);
                        //terminal(o.name);
                    };

                    $scope.back = function(){
                        $scope.grid.show = false;
                    };

                    $scope.getLog = function (container) {
                        var params = {
                            namespace: $rootScope.namespace,
                            name: pod.metadata.name,
                            container: container
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

                    $scope.terminalTabWasSelected = false;

                    var setChart = function(name, data){
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
                                        return this.y;
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
                                data: data
                            }],
                            xAxis: {
                                gridLineWidth: 1,
                                currentMin: 0,
                                currentMax: 20
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

                    $scope.chartConfigCpu = setChart('CPU', [0.01, 0.02, 0.04, 0.01, 0.02, 0.02, 0.09, 0.04,0.05, 0.01, 0.09, 0.04, 0.02]);
                    $scope.chartConfigMem = setChart('内存', []);
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
