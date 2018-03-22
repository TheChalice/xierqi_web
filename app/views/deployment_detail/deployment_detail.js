'use strict';
angular.module('console.deployment_detail', [
        'kubernetesUI',
        {
            files: [
                'views/deployment_detail/deployment_detail.css',
                'components/datepick/datepick.js',
                'components/checkbox/checkbox.js',
                'components/checkbox/checkbox_small.js',
                'components/deploymentsevent/deploymentsevent.js',
            ]
        }
    ])
    .controller('DeploymentDetailCtrl', ['Deployments','Confirm','delTip','$log', 'Dcinstantiate', 'Ws', '$scope', 'DeploymentConfig', '$rootScope', 'horizontalpodautoscalers', '$stateParams', 'Event', 'mydc', 'mytag','myreplicaSet',
        function (Deployments,Confirm,delTip,$log, Dcinstantiate, Ws, $scope, DeploymentConfig, $rootScope, horizontalpodautoscalers, $stateParams, Event, mydc, mytag,myreplicaSet) {
            $scope.dc = angular.copy(mydc)
            console.log('dp', mydc);
            $scope.replicaset=[];
            //console.log('myreplicaSet.items', myreplicaSet.items);
            angular.forEach(myreplicaSet.items, function (item,i) {
                //console.log(item.metadata.labels.app);
                if (item.metadata.labels.app === $scope.dc.metadata.name) {
                    $scope.replicaset.push(item)
                }
                //
            })
            $scope.mytag = angular.copy(mytag)


            var cont = 0
            $scope.envs = [];
            $scope.grid = {}
            $scope.quota = {}
            $scope.imagedockermap = {}
            $scope.imagemap = {}
            $scope.loaddirs = {
                loadcon: ''
            }
            $scope.horiz = {
                "apiVersion": "autoscaling/v1",
                "kind": "HorizontalPodAutoscaler",
                "metadata": {
                    "name": $scope.dc.metadata.name,
                    "labels": {"app": $scope.dc.metadata.name}
                },
                "spec": {
                    "scaleTargetRef": {
                        "kind": "DeploymentConfig",
                        "name": $scope.dc.metadata.name,
                        "apiVersion": "extensions/v1beta1",
                        "subresource": "scale"
                    },
                    "minReplicas": null,
                    "maxReplicas": null,
                    "targetCPUUtilizationPercentage": null
                }
            }
            var watchdcs = function (resourceVersion) {
                Ws.watch({
                    api: 'other',
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'deploymentconfigs',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updateDcs(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");

                });
            };
            watchdcs(mydc.metadata.resourceVersion)
            var updateDcs = function (data) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    //serviceList();
                    return;
                }
                //console.log('data.object', data.object);
                $scope.resourceVersion = data.object.metadata.resourceVersion;


                if (data.type == 'ADDED') {
                    //$scope.rcs.items.shift(data.object);
                } else if (data.type == "MODIFIED") {
                    data.object.spec.replicas = $scope.dc.spec.replicas
                    $scope.dc.status.replicas = data.object.status.replicas
                }
            }
            var creathor = function () {
                $scope.horiz.spec.maxReplicas = parseInt($scope.horiz.spec.maxReplicas) || $scope.dc.spec.replicas;
                $scope.horiz.spec.targetCPUUtilizationPercentage = parseInt($scope.horiz.spec.targetCPUUtilizationPercentage) || 80;
                horizontalpodautoscalers.create({namespace: $rootScope.namespace}, $scope.horiz, function (data) {

                })
            }
            var delhor = function () {

                horizontalpodautoscalers.delete({
                    namespace: $rootScope.namespace,
                    name: $scope.dc.metadata.name
                }, function (data) {
                    //alert(11)
                })
            }
            var makeimagemap = function () {
                angular.forEach($scope.mytag.items, function (tag, i) {
                    $scope.imagedockermap[tag.image.dockerImageReference] = {
                        image: tag.metadata.name.split(':')[0],
                        tag: tag.metadata.name.split(':')[1],
                    }
                })
                angular.forEach($scope.imagedockermap, function (image, i) {
                    if (!$scope.imagemap[image.image]) {
                        $scope.imagemap[image.image] = [];
                    }
                    $scope.imagemap[image.image].push({
                        tag: image.tag,
                        dockerImageReference: i
                    })
                })
                //console.log($scope.imagedockermap, $scope.imagemap);
            }
            makeimagemap()
            var updatedcput = function (dc) {
                Deployments.put({
                    namespace: $rootScope.namespace,
                    name: dc.metadata.name,
                    region: $rootScope.region
                }, dc, function (res) {
                    $scope.dc = angular.copy(res);
                    console.log('$scope.dc', $scope.dc);
                    $scope.loaddirs.loadcon()
                }, function (res) {

                });
            }
            var creatvol = function (con, vol) {
                angular.forEach(vol, function (item, i) {
                    if (item.length > 0) {
                        //console.log(item, i);
                        angular.forEach(item, function (volment, k) {
                            if (volment.secretName || volment.name || volment.claimName) {
                                if (volment.mountPath) {
                                    var vol = angular.copy(volment)
                                    //console.log(volment);
                                    con.volumeMounts.push({name: 'volumes' + cont, mountPath: vol.mountPath})
                                    delete vol.mountPath
                                    var volobj = {name: 'volumes' + cont}
                                    volobj[i] = vol
                                    $scope.dc.spec.template.spec.volumes.push(volobj);
                                    cont = cont + 1;
                                }
                            }
                        })
                    }
                })

            }
            var volrepeat= function (vols) {
                var rep=false;
                angular.forEach(vols, function (ovol,i) {
                    angular.forEach(vols, function (ivol,k) {
                        if (i !== k) {
                            if (ovol.mountPath === ivol.mountPath) {
                                rep=true
                            }
                        }
                    })
                })
                if (rep) {
                    return true
                }else{
                    return false
                }

            }
            $scope.updateDc = function () {
                $scope.dc.spec.template.spec.volumes = []
                var cancreat= true
                angular.forEach($scope.dc.spec.template.spec.containers, function (con, i) {
                    //console.log(con.dosetcon.doset);
                    if (con.doset) {

                        if (con.readinessProbe.httpGet) {
                            con.readinessProbe.httpGet.port = parseInt(con.readinessProbe.httpGet.port)

                        } else if (con.readinessProbe.tcpSocket) {
                            con.readinessProbe.tcpSocket.port = parseInt(con.readinessProbe.tcpSocket.port)

                        }
                        //console.log('con', con);
                        if (con.readinessProbe && con.dosetcon === '命令' && con.readinessProbe.exec) {
                            console.log('con.readinessProbe.exec.command', con.readinessProbe.exec.command);
                            angular.forEach(con.readinessProbe.exec.command, function (item, k) {
                                console.log(item.key);
                                con.readinessProbe.exec.command[k] = item.key

                            })
                        }
                        con.readinessProbe.initialDelaySeconds = parseInt(con.readinessProbe.initialDelaySeconds)
                        con.readinessProbe.timeoutSeconds = parseInt(con.readinessProbe.timeoutSeconds)
                    }

                    if (con.volment) {
                        con.volumeMounts = []
                        creatvol(con, con.volments)
                        if (volrepeat(con.volumeMounts)) {
                            Toast.open('卷路径重复');
                            cancreat=false
                        }
                        //
                    } else {
                        delete con.volumeMounts
                        delete con.volments
                    }

                })
                if (!cancreat) {
                    return
                }
                //console.log('$scope.dc.spec.template.spec', $scope.dc.spec.template.spec);

                Deployments.get({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name,
                    region: $rootScope.region
                }, function (datadc) {

                    $scope.dc.status.latestVersion = datadc.status.latestVersion + 1;
                    $scope.dc.metadata.resourceVersion = datadc.metadata.resourceVersion;
                    //console.log($scope.envs);

                    if ($scope.quota.rubustCheck) {
                        creathor()
                    } else {
                        delhor()
                    }
                    updatedcput($scope.dc)
                })
            };
            $scope.deployDc = function () {
                var sendobj = {
                    "kind": "DeploymentRequest",
                    "apiVersion": "v1",
                    "name": $scope.dc.metadata.name,
                    "latest": true,
                    "force": true
                }
                Dcinstantiate.create({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name
                }, sendobj, function (obj) {
                    console.log(obj);
                })
            }
            $scope.deleteDc = function (val) {
                delTip.open("删除Deployment", val, true).then(function () {
                    Deployments.delete({
                        namespace: $rootScope.namespace,
                        name: $stateParams.name
                    }, function (datadc) {
                        $state.go('console.deployments',{namespace:$rootScope.namespace});
                    }, function () {
                        Confirm.open("删除Deployment", "删除" + val + "失败", null, null, true)
                    })
                })

            };
            $scope.$on('$destroy', function () {
                Ws.clear();
            });
        }])
    .directive('deploymentsRsConfig', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deployment_detail/tpl/config.html',
            scope: false,
            controller: ['persistent', 'configmaps', 'Secret', '$scope', 'horizontalpodautoscalers', '$rootScope', 'GLOBAL', 'ImageStreamTag', 'ImageStream',
                function (persistent, configmaps, Secret, $scope, horizontalpodautoscalers, $rootScope, GLOBAL, ImageStreamTag, ImageStream) {
                    var gethor = function (name) {
                        horizontalpodautoscalers.get({namespace: $rootScope.namespace, name: name}, function (hor) {
                            $scope.quota.rubustCheck = true;
                            $scope.horiz = hor;
                        })
                    }
                    Secret.get({namespace: $rootScope.namespace}, function (secrts) {
                        //console.log('secrts', secrts);
                        $scope.SecretList = angular.copy(secrts.items)
                    })
                    configmaps.get({namespace: $rootScope.namespace}, function (configs) {
                        //console.log('configs', configs);
                        $scope.ConfigMapList = angular.copy(configs.items)
                    })
                    persistent.get({namespace: $rootScope.namespace}, function (persistents) {
                        //console.log('persistents', persistents);
                        $scope.PersistentVolumeClaimList = angular.copy(persistents.items)
                    })
                    $scope.survey = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].doset) {
                            $scope.dc.spec.template.spec.containers[idx].doset = false;
                            delete  $scope.dc.spec.template.spec.containers[idx].readinessProbe;
                        } else {
                            $scope.dc.spec.template.spec.containers[idx].doset = true;
                            $scope.dc.spec.template.spec.containers[idx].dosetcon = "HTTP";
                            $scope.dc.spec.template.spec.containers[idx].readinessProbe = {
                                "httpGet": {
                                    "path": "",
                                    "port": "",
                                    "scheme": "HTTP"
                                },
                                "initialDelaySeconds": "",
                                "timeoutSeconds": "",
                                "periodSeconds": 10,
                                "successThreshold": 1,
                                "failureThreshold": 3
                            }
                        }
                    }
                    $scope.addvol = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].volment) {
                            $scope.dc.spec.template.spec.containers[idx].volment = false;
                            delete  $scope.dc.spec.template.spec.containers[idx].volments;
                        } else {
                            $scope.dc.spec.template.spec.containers[idx].volment = true;
                            $scope.dc.spec.template.spec.containers[idx].volments = {
                                secret: [{secretName: '', mountPath: ''}],
                                configMap: [{name: '', mountPath: ''}],
                                persistentVolumeClaim: [{claimName: '', mountPath: ''}]
                            }
                        }
                    }

                    $scope.addcon = function () {
                        var tmp = angular.copy($scope.dc.spec.template.spec.containers[$scope.dc.spec.template.spec.containers.length - 1]);
                        //console.log(tmp);
                        tmp.env = []
                        tmp.doset = false;
                        tmp.volment = false;
                        tmp.display = true;
                        delete tmp.readinessProbe
                        tmp.name = 'container' + $scope.dc.spec.template.spec.containers.length;
                        $scope.checkoutreg(tmp, true)
                        $scope.dc.spec.template.spec.containers.push(tmp)


                    };
                    $scope.rmContainer = function (idx) {
                        $scope.dc.spec.template.spec.containers.splice(idx, 1);

                    };
                    $scope.$watch('dc.spec.template.spec.containers', function (n, o) {
                        if (n == o) {
                            return;
                        }
                        angular.forEach(n, function (item, i) {
                            if (o && n && n[i] && o[i]) {
                                if (n[i].dosetcon != o[i].dosetcon) {
                                    if (n[i].dosetcon == "HTTP") {
                                        $scope.dc.spec.template.spec.containers[i].readinessProbe = {
                                            "httpGet": {
                                                "path": "",
                                                "port": "",
                                                "scheme": "HTTP"
                                            },
                                            "initialDelaySeconds": "",
                                            "timeoutSeconds": "",
                                            "periodSeconds": 10,
                                            "successThreshold": 1,
                                            "failureThreshold": 3
                                        }
                                    } else if (n[i].dosetcon == "命令") {
                                        $scope.dc.spec.template.spec.containers[i].readinessProbe = {
                                            "exec": {
                                                "command": [
                                                    {key: ''}
                                                ]
                                            },
                                            "initialDelaySeconds": "",
                                            "timeoutSeconds": "",
                                            "periodSeconds": 10,
                                            "successThreshold": 1,
                                            "failureThreshold": 3
                                        }
                                    } else if (n[i].dosetcon == "TCP") {
                                        $scope.dc.spec.template.spec.containers[i].readinessProbe = {
                                            "tcpSocket": {
                                                "port": ""
                                            },
                                            "initialDelaySeconds": "",
                                            "timeoutSeconds": "",
                                            "periodSeconds": 10,
                                            "successThreshold": 1,
                                            "failureThreshold": 3
                                        }
                                    }
                                }
                            }
                        })
                    }, true)
                    $scope.showEnv = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].annotate.isShowEnv) {
                            $scope.dc.spec.template.spec.containers[idx].annotate.isShowEnv = false;
                        } else {
                            $scope.dc.spec.template.spec.containers[idx].annotate.isShowEnv = true;
                        }
                    }
                    $scope.delcontainerEnv = function (outerIndex, innerIndex) {
                        $scope.dc.spec.template.spec.containers[outerIndex].env.splice(innerIndex, 1);
                    }

                    $scope.addContainerEnv = function (outerIndex, innerIndex) {
                        if ($scope.dc.spec.template.spec.containers[outerIndex].env) {

                        } else {
                            $scope.dc.spec.template.spec.containers[outerIndex].env = []
                        }
                        $scope.dc.spec.template.spec.containers[outerIndex].env.push({name: '', value: ''});
                    }

                    $scope.addconvol = function (outerIndex, obj, key) {

                        if ($scope.dc.spec.template.spec.containers[outerIndex].volments) {
                            var canadd=true
                            angular.forEach($scope.dc.spec.template.spec.containers[outerIndex].volments[obj], function (vol,i) {
                                if (vol[key] && vol.mountPath) {

                                }else {
                                    canadd=false
                                }
                            })
                            if (!canadd) {
                                return
                            }


                        } else {
                            $scope.dc.spec.template.spec.containers[outerIndex].volments = {}
                        }
                        if (!$scope.dc.spec.template.spec.containers[outerIndex].volments[obj]) {
                            $scope.dc.spec.template.spec.containers[outerIndex].volments[obj] = []
                        }
                        var volobj = {
                            mountPath: ''
                        }
                        volobj[key] = ''
                        $scope.dc.spec.template.spec.containers[outerIndex].volments[obj].push(volobj)

                    }
                    $scope.delconvol = function (outerIndex, innerIndex, obj) {
                        $scope.dc.spec.template.spec.containers[outerIndex].volments[obj].splice(innerIndex, 1);
                    }
                    $scope.selectimage = function (i, item, con) {
                        con.annotate.image = i
                        con.annotate.tag = item[0].tag
                        con.annotate.tags = item;
                    }
                    $scope.selecttag = function (idx, con) {
                        //console.log(con.annotate.tags[idx]);
                        con.annotate.tag = con.annotate.tags[idx].tag;
                        con.image = con.annotate.tags[idx].dockerImageReference;
                        //con.image=
                    }

                    $scope.checkoutreg = function (con, status) {
                        if (status === true && !con.annotate.image) {
                            //console.log($scope.mytag.items[0].metadata.name.split(':'));
                            var imagenametext = $scope.mytag.items[0].metadata.name
                            con.annotate.image = imagenametext.split(':')[0]
                            con.annotate.tag = imagenametext.split(':')[1]
                            con.annotate.images = angular.copy($scope.imagemap)
                            con.annotate.tags = $scope.imagemap[con.annotate.image]
                            con.image = con.annotate.tags[0].dockerImageReference;

                        }
                        if (con.display === status) {
                        } else {
                            con.display = !con.display
                        }
                    }
                    $scope.loaddirs.loadcon = function () {
                        angular.forEach($scope.dc.spec.template.spec.containers, function (con, i) {;
                            if ($scope.imagedockermap[con.image]) {
                                con.display = true;
                                con.regimage = ''
                                con.annotate = {
                                    image: $scope.imagedockermap[con.image].image,
                                    tag: $scope.imagedockermap[con.image].tag,
                                    images: angular.copy($scope.imagemap),
                                    tags: $scope.imagemap[$scope.imagedockermap[con.image].image],
                                    regimage: ''
                                }
                            } else {

                                con.annotate = {
                                    regimage: con.image
                                }
                                con.display = false;
                            }
                            //console.log('con.readinessProbe',con.readinessProbe);
                            if (con.readinessProbe) {
                                con.doset = true;
                                if (con.readinessProbe.httpGet) {
                                    con.dosetcon = 'HTTP'
                                } else if (con.readinessProbe.tcpSocket) {
                                    con.dosetcon = 'TCP'
                                } else if (con.readinessProbe.exec) {
                                    //console.log(con.readinessProbe.exec);
                                    var copyexec = angular.copy(con.readinessProbe.exec.command)
                                    angular.forEach(copyexec, function (exec, k) {
                                        con.readinessProbe.exec.command[k] = {key: exec};
                                    })
                                    con.dosetcon = '命令'

                                }
                            }
                            if (con.volumeMounts) {
                                con.volment = true;
                                //console.log($scope.dc.spec.template.spec.volumes);
                                if ($scope.dc.spec.template.spec.volumes) {
                                    con.volments = {
                                        secret: [],
                                        configMap: [],
                                        persistentVolumeClaim: []
                                    }

                                    angular.forEach(con.volumeMounts, function (convol, i) {
                                        angular.forEach($scope.dc.spec.template.spec.volumes, function (vol, k) {
                                            if (convol.name === vol.name) {
                                                //console.log(convol, vol);
                                                angular.forEach(vol, function (item, j) {
                                                    if (j !== 'name') {
                                                        item['mountPath'] = convol.mountPath
                                                        //console.log(item);
                                                        con.volments[j].push(item);
                                                    }
                                                })

                                            }
                                        })
                                    })
                                    //console.log('con.volment', con.volments);


                                }
                            }
                        })

                        angular.forEach($scope.dc.spec.triggers, function (trigger) {
                            if (trigger.type == 'ConfigChange') {
                                $scope.grid.configChange = true;
                            }
                        });
                    }
                    $scope.loaddirs.loadcon()

                    gethor($scope.dc.metadata.name);
                }],
        };
    })
    .directive('deploymentsRsHistory', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deployment_detail/tpl/history.html',
            scope: false,
            controller: ['$scope', 'ReplicationController', '$rootScope', 'Ws', 'Sort',
                function ($scope, ReplicationController, $rootScope, Ws, Sort) {



                }],
        };
    })


