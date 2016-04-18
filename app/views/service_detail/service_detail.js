'use strict';
angular.module('console.service.detail', [
    'kubernetesUI',
    {
        files: [
            'views/service_detail/service_detail.css',
            'components/datepick/datepick.js'
        ]
    }
])
    .controller('ServiceDetailCtrl', ['$rootScope', '$scope', '$log', '$stateParams', 'DeploymentConfig', 'ReplicationController', 'Route', 'BackingServiceInstance', 'ImageStream', 'ImageStreamImage', 'Toast', 'Pod', 'Event', 'Sort', 'Confirm', 'Ws', 'LogModal', 'ContainerModal',
        function($rootScope, $scope, $log, $stateParams, DeploymentConfig, ReplicationController, Route, BackingServiceInstance, ImageStream, ImageStreamImage, Toast, Pod, Event, Sort, Confirm, Ws, LogModal, ContainerModal) {
        //获取服务列表
        var loadDc = function (name) {
            DeploymentConfig.get({namespace: $rootScope.namespace, name: name}, function(res){
                $log.info("deploymentConfigs", res);
                $scope.dc = res;

                loadRcs(res.metadata.name);
                loadRoutes();
                loadBsi();

            }, function(res){
                //todo 错误处理
            });
        };

        loadDc($stateParams.name);

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

        var loadBsi = function () {
            BackingServiceInstance.get({namespace: $rootScope.namespace}, function(res){
                $log.info("backingServiceInstance", res);

                $scope.dc.bsi = [];

                for (var i = 0; i < res.items.length; i++) {
                    for (var j = 0; j < res.items[i].spec.binding.length; j++) {
                        if (res.items[i].spec.binding[j].bind_deploymentconfig == $scope.dc.metadata.name) {
                            $scope.dc.bsi.push(res.items[i].metadata.name);
                        }
                    }
                }

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
        loadPods('test');

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


                    //var terminal = function(container) {
                    //    console.log("pods", pod.metadata.name);
                    //    Ws.terminal({
                    //        api: 'k8s',
                    //        namespace: $rootScope.namespace,
                    //        type: 'pods',
                    //        name: pod.metadata.name,
                    //        container: container
                    //    }, function(res){
                    //        console.log('data======', res);
                    //
                    //        //var data = JSON.parse(res.data);
                    //
                    //    }, function(){
                    //        $log.info("webSocket start");
                    //    }, function(){
                    //        $log.info("webSocket stop");
                    //        var key = Ws.key($rootScope.namespace, 'pods', container);
                    //        if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                    //            return;
                    //        }
                    //        terminal(container);
                    //    });
                    //};

                    //$scope.$on('$destroy', function(){
                    //    Ws.clear();
                    //});
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
