'use strict';
angular.module('console.deploymentconfig_detail', [
    'kubernetesUI',
    {
        files: [
            'views/deploymentconfig_detail/deploymentconfig_detail.css',
            'components/datepick/datepick.js',
            'components/checkbox/checkbox.js',
            'components/checkbox/checkbox_small.js',
            'components/deploymentsevent/deploymentsevent.js'
        ]
    }
])
    .controller('DeploymentConfigDetailCtrl', ['Toast', 'Confirm', 'delTip', '$log', 'Dcinstantiate', 'Ws', '$scope', 'DeploymentConfig', '$rootScope', 'horizontalpodautoscalers', '$stateParams', 'Event', 'mydc', 'mytag', '$state', 'toastr', 'Service',
        function (Toast, Confirm, delTip, $log, Dcinstantiate, Ws, $scope, DeploymentConfig, $rootScope, horizontalpodautoscalers, $stateParams, Event, mydc, mytag, $state, toastr, Service) {
            $scope.dc = angular.copy(mydc);
            $scope.resourcesunit = {
                mincpu: 'millicores',
                maxcpu: 'millicores',
                minmem: 'MB',
                maxmem: 'MB'
            };
            $scope.livenesshttpscheck = false;
            $scope.institution = {
                display: 1,
                configregistry: false,
                rubustCheck: false
            };
            function unit(num, unit) {
                if (unit === 'millicores') {
                    return num + 'm'
                } else if (unit === 'cores') {
                    return num
                } else if (unit === 'MB') {
                    return num + 'm'
                } else if (unit === 'GB') {
                    return num + 'G'
                }
            }

            for (var i = 0; i < $scope.dc.spec.template.spec.containers.length; i++) {
                $scope.dc.spec.template.spec.containers[i].retract = true;
            }

            $scope.mytag = angular.copy(mytag);
            $scope.err = {
                vol: {
                    secret: false,
                    configMap: false,
                    persistentVolumeClaim: false,
                    mountPath: false
                }
            };
            var cont = 0;
            $scope.envs = [];
            $scope.grid = {};
            $scope.quota = {};
            $scope.imagedockermap = {};
            $scope.imagemap = {};
            $scope.loaddirs = {
                loadcon: ''
            };
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
            };

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
            watchdcs(mydc.metadata.resourceVersion);
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
                    data.object.spec.replicas = $scope.dc.spec.replicas;
                    $scope.dc.status.replicas = data.object.status.replicas
                }
            };
            var creathor = function () {
                $scope.horiz.spec.maxReplicas = parseInt($scope.horiz.spec.maxReplicas) || $scope.dc.spec.replicas;
                $scope.horiz.spec.targetCPUUtilizationPercentage = parseInt($scope.horiz.spec.targetCPUUtilizationPercentage) || 80;
                horizontalpodautoscalers.create({namespace: $rootScope.namespace}, $scope.horiz, function (data) {


                })
            };
            var puthor = function (horiz, name) {
                horiz.spec.maxReplicas = parseInt($scope.horiz.spec.maxReplicas) || $scope.dc.spec.replicas;
                horiz.spec.targetCPUUtilizationPercentage = parseInt($scope.horiz.spec.targetCPUUtilizationPercentage) || 80;
                horizontalpodautoscalers.put({namespace: $rootScope.namespace, name: name}, horiz, function (data) {
                    // console.log('data', data);
                })
            };
            var delhor = function () {
                horizontalpodautoscalers.delete({
                    namespace: $rootScope.namespace,
                    name: $scope.dc.metadata.name
                }, function (data) {
                    //alert(11)
                })
            };
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
                });
                //console.log($scope.imagedockermap, $scope.imagemap);
            };
            makeimagemap();
            var volerr = function (vol) {
                var volerr = false;
                var cunt = 0;
                var copyarr = [];
                $scope.err = {
                    vol: {
                        secret: false,
                        configMap: false,
                        persistentVolumeClaim: false,
                        mountPath: false
                    }
                };
                angular.forEach(vol, function (item, i) {
                    angular.forEach(item, function (ovolment, k) {
                        ovolment.id = cunt;
                        ovolment.index = k;
                        ovolment.type = i
                        cunt = cunt + 1;
                        copyarr.push(ovolment)
                    })
                });
                // console.log('vol', vol);
                angular.forEach(vol, function (item, i) {

                    angular.forEach(item, function (ovolment, k) {
                        //console.log('item', volment.mountPath);
                        ovolment.mountPatherr = false;
                        ovolment.nameerr = false;
                        angular.forEach(copyarr, function (ivolment, j) {
                            //console.log(ovolment.id, ivolment.id);
                            if (ovolment.id !== ivolment.id) {
                                if (ovolment.mountPath === ivolment.mountPath) {
                                    volerr = true;
                                    // console.log(ivolment, vol[i]);
                                    vol[ivolment.type][ivolment.index].mountPatherr = true;
                                    ovolment.mountPatherr = true;
                                    $scope.err.vol.mountPath = true;
                                }
                            }
                        })
                        if (ovolment.name || ovolment.secretName || ovolment.claimName) {

                        } else {
                            volerr = true
                            ovolment.nameerr = true;
                            $scope.err.vol[i] = true
                        }

                        if (!ovolment.mountPath) {
                            ovolment.mountPatherr = true;
                            volerr = true
                            $scope.err.vol.mountPath = true
                        }
                    })

                })
                if (volerr) {
                    return true
                } else {
                    return false
                }
            };
            var updatedcput = function (dc) {
                DeploymentConfig.put({
                    namespace: $rootScope.namespace,
                    name: dc.metadata.name,
                    region: $rootScope.region
                }, dc, function (res) {
                    toastr.success('操作成功', {
                        timeOut: 2000,
                        closeButton: true
                    });
                    $scope.active = 1;
                    // angular.forEach(res, function (item, i) {  ////111
                    //     item.spec.template.spec.containers[i].retract = true;
                    // })
                    $scope.dc = angular.copy(res);
                    $scope.loaddirs.loadcon()
                }, function (res) {

                });
            };
            var creatvol = function (con, vol) {

                angular.forEach(vol, function (item, i) {
                    if (item.length > 0) {
                        //console.log(item, i);
                        angular.forEach(item, function (volment, k) {
                            if (volment.secretName || volment.name || volment.claimName) {
                                if (volment.mountPath) {
                                    var vol = angular.copy(volment);
                                    //console.log(volment);
                                    con.volumeMounts.push({name: 'volumes' + cont, mountPath: vol.mountPath});
                                    delete vol.mountPath;
                                    var volobj = {name: 'volumes' + cont};
                                    volobj[i] = vol;
                                    $scope.dc.spec.template.spec.volumes.push(volobj);
                                    cont = cont + 1;
                                }
                            }
                        })
                    }
                })

            };
            var creatimageconfig = function (con) {
                // console.log('con', con);
                var tpl = {
                    "type": "ImageChange",
                    "imageChangeParams": {
                        "automatic": true,
                        "containerNames": [
                            con.name          //todo 高级配置,手动填充
                        ],
                        "from": {
                            "kind": "ImageStreamTag",
                            "name": con.annotate.image + ":" + con.annotate.tag  //ruby-hello-world:latest
                        }
                    }
                };

                $scope.dc.spec.triggers.push(tpl)
            };
            //var volrepeat= function (vols) {
            //    var rep=false;
            //    angular.forEach(vols, function (ovol,i) {
            //        angular.forEach(vols, function (ivol,k) {
            //            if (i !== k) {
            //                if (ovol.mountPath === ivol.mountPath) {
            //                    rep=true
            //                }
            //            }
            //        })
            //    })
            //    if (rep) {
            //        return true
            //    } else {
            //        return false
            //    }
            //
            //}
            $scope.updateDc = function () {
                $scope.dc.spec.template.spec.volumes = [];
                var cancreat = true;
                angular.forEach($scope.dc.spec.triggers, function (tri, i) {
                    // console.log(tri);
                    if (tri.type !== "ConfigChange") {
                        $scope.dc.spec.triggers.splice(i, 1)
                    }
                });
                angular.forEach($scope.dc.spec.template.spec.containers, function (con, i) {
                    // delete con.retract;   //清除自定义key值retract
                    //健康检查
                    if (con.livenessFlag) {
                        if (con.livenessProbe.httpGet) {
                            con.livenessProbe.httpGet.port = parseInt(con.livenessProbe.httpGet.port)
                            if (con.livenesshttpscheck) {
                                con.livenessProbe.httpGet.scheme = 'HTTPS';
                            }

                        } else if (con.livenessProbe.tcpSocket) {
                            con.livenessProbe.tcpSocket.port = parseInt(con.livenessProbe.tcpSocket.port)

                        }
                        if (con.livenessProbe && con.livenesscheck === '命令' && con.livenessProbe.exec) {
                            angular.forEach(con.livenessProbe.exec.command, function (item, k) {
                                con.livenessProbe.exec.command[k] = item.key
                            })
                        }
                        con.livenessProbe.initialDelaySeconds = parseInt(con.livenessProbe.initialDelaySeconds)
                        con.livenessProbe.timeoutSeconds = parseInt(con.livenessProbe.timeoutSeconds)
                    }
                    //配额检查
                    if (con.resourcesFlag) {
                        con.resources.limits.cpu = unit(con.resources.limits.cpu, con.resourcesunit.maxcpu);
                        con.resources.limits.memory = unit(con.resources.limits.memory, con.resourcesunit.maxmem);
                        con.resources.requests.cpu = unit(con.resources.requests.cpu, con.resourcesunit.mincpu);
                        con.resources.requests.memory = unit(con.resources.requests.memory, con.resourcesunit.minmem);
                    } else {
                        delete con.resources
                    }
                    //可用性探测
                    if (con.doset) {
                        if (con.readinessProbe.httpGet) {
                            con.readinessProbe.httpGet.port = parseInt(con.readinessProbe.httpGet.port)

                        } else if (con.readinessProbe.tcpSocket) {
                            con.readinessProbe.tcpSocket.port = parseInt(con.readinessProbe.tcpSocket.port)

                        }
                        if (con.readinessProbe && con.dosetcon === '命令' && con.readinessProbe.exec) {
                            //console.log('con.readinessProbe.exec.command', con.readinessProbe.exec.command);
                            angular.forEach(con.readinessProbe.exec.command, function (item, k) {
                                //console.log(item.key);
                                con.readinessProbe.exec.command[k] = item.key

                            })
                        }
                        con.readinessProbe.initialDelaySeconds = parseInt(con.readinessProbe.initialDelaySeconds)
                        con.readinessProbe.timeoutSeconds = parseInt(con.readinessProbe.timeoutSeconds)
                    }

                    if (con.imageChange) {
                        creatimageconfig(con)
                    }
                    if (con.volment) {
                        con.volumeMounts = [];
                        if (volerr(con.volments)) {
                            cancreat = false;

                            toastr.error('操作失败,请重试', {

                                timeOut: 2000,
                                closeButton: true
                            });
                        }
                        creatvol(con, con.volments);
                        //if (volrepeat(con.volumeMounts)) {
                        //    Toast.open('卷路径重复');
                        //    cancreat=false
                        //}
                        //
                    } else {
                        delete con.volumeMounts;
                        delete con.volments
                    }


                    if (!con.display) {
                        con.image = con.annotate.regimage
                    }
                    //addemptyDir
                    if (con.emptyDir.length > 0) {
                        if (!con.volumeMounts) {
                            con.volumeMounts = []
                        }
                        if (!$scope.dc.spec.template.spec.volumes) {
                            $scope.dc.spec.template.spec.volumes = []
                        }
                        angular.forEach(con.emptyDir, function (vol, i) {
                            con.volumeMounts.push(vol.volumeMounts)
                        })
                        angular.forEach(con.emptyDir, function (vol, i) {
                            $scope.dc.spec.template.spec.volumes.push(vol.volumes)
                        })
                    }

                });
                if (!cancreat) {
                    return
                }
                //console.log('$scope.dc.spec.template.spec', $scope.dc.spec.template.spec);

                DeploymentConfig.get({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name,
                    region: $rootScope.region
                }, function (datadc) {

                    $scope.dc.status.latestVersion = datadc.status.latestVersion + 1;
                    $scope.dc.metadata.resourceVersion = datadc.metadata.resourceVersion;
                    //console.log($scope.envs);

                    if ($scope.quota.rubustCheck) {
                        horizontalpodautoscalers.get({
                            namespace: $rootScope.namespace,
                            name: $stateParams.name
                        }, function (data) {
                            // console.log('sdata', data);
                            puthor(data, $stateParams.name)

                        }, function (err) {
                            creathor()
                        })

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
                };
                Dcinstantiate.create({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name
                }, sendobj, function (obj) {
                    // console.log(obj);
                })
            };
            $scope.deleteDc = function (val) {
                delTip.open("删除Deployment", val, true).then(function () {
                    DeploymentConfig.delete({
                        namespace: $rootScope.namespace,
                        name: $stateParams.name
                    }, function (datadc) {
                        toastr.success('操作成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                        Service.delete(
                            {
                                namespace: $rootScope.namespace,
                                name: $stateParams.name
                            }, function (data) {

                            }
                        )
                        horizontalpodautoscalers.delete({
                            namespace: $rootScope.namespace,
                            name: $stateParams.name
                        }, function (data) {

                        })
                        $state.go('console.deployments', {namespace: $rootScope.namespace});
                    }, function () {
                        Confirm.open("删除Deployment", "删除" + val + "失败", null, null, true);
                        toastr.error('删除失败,请重试', {
                            timeOut: 2000,
                            closeButton: true
                        });
                    })
                })

            };
            $scope.$on('$destroy', function () {
                Ws.clear();
            });
        }])
    .directive('deploymentsConfig', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deploymentconfig_detail/tpl/config.html',
            scope: false,
            controller: ['persistent', 'configmaps', 'Secret', '$scope', 'horizontalpodautoscalers', '$rootScope', 'GLOBAL', 'ImageStreamTag', 'ImageStream',
                function (persistent, configmaps, Secret, $scope, horizontalpodautoscalers, $rootScope, GLOBAL, ImageStreamTag, ImageStream) {
                    var gethor = function (name) {
                        horizontalpodautoscalers.get({namespace: $rootScope.namespace, name: name}, function (hor) {
                            $scope.quota.rubustCheck = true;
                            $scope.horiz = hor;
                        })
                    };
                    Secret.get({namespace: $rootScope.namespace}, function (secrts) {
                        //console.log('secrts', secrts);
                        $scope.SecretList = angular.copy(secrts.items)
                    });
                    configmaps.get({namespace: $rootScope.namespace}, function (configs) {
                        //console.log('configs', configs);
                        $scope.ConfigMapList = angular.copy(configs.items)
                    });
                    persistent.get({namespace: $rootScope.namespace}, function (persistents) {
                        //console.log('persistents', persistents);
                        $scope.PersistentVolumeClaimList = angular.copy(persistents.items)
                    });
                    $scope.survey = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].doset) {
                            $scope.dc.spec.template.spec.containers[idx].doset = false;
                            delete $scope.dc.spec.template.spec.containers[idx].readinessProbe;
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
                    };
                    $scope.addvol = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].volment) {
                            $scope.dc.spec.template.spec.containers[idx].volment = false;
                            delete $scope.dc.spec.template.spec.containers[idx].volments;
                        } else {
                            $scope.dc.spec.template.spec.containers[idx].volment = true;
                            $scope.dc.spec.template.spec.containers[idx].volments = {}
                        }
                    };
                    $scope.openRc = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].resourcesFlag) {
                            $scope.dc.spec.template.spec.containers[idx].resourcesFlag = false;
                            // delete $scope.dc.spec.template.spec.containers[idx].resources;
                        } else {
                            $scope.dc.spec.template.spec.containers[idx].resourcesFlag = true;
                        }
                    };
                    $scope.openLivePro = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].livenessFlag) {
                            $scope.dc.spec.template.spec.containers[idx].livenessFlag = false;
                            delete $scope.dc.spec.template.spec.containers[idx].livenessProbe;
                        } else {
                            $scope.dc.spec.template.spec.containers[idx].livenessFlag = true;
                            $scope.dc.spec.template.spec.containers[idx].livenesscheck = "HTTP";
                            if ($scope.dc.spec.template.spec.containers[idx].livenesshttpscheck) {
                                $scope.dc.spec.template.spec.containers[idx].livenessProbe.httpGet.scheme = 'HTTPS';
                            }
                            $scope.dc.spec.template.spec.containers[idx].livenessProbe = {
                                "httpGet": {
                                    "path": "",
                                    "port": "",
                                    "scheme": "HTTP"
                                },
                                "initialDelaySeconds": '',
                                "timeoutSeconds": '',
                                "periodSeconds": 10,
                                "successThreshold": 1,
                                "failureThreshold": 3
                            }
                        }
                    };
                    $scope.mustnum = function (e, num, quate) {

                        if (quate === 10) {
                            var patrn = /^([1-9]||10)$/ig;
                        } else if (quate === 100) {
                            var patrn = /^(\d|[1-9]\d|100)$/;
                        } else {
                            var patrn = /^\d+$/;
                        }
                        //

                        if (patrn.test(num)) {
                            // console.log('t', e.currentTarget.value);
                        } else {
                            //console.log('f',num);
                            e.currentTarget.value = null
                        }
                    };

                    $scope.addcon = function () {
                        var num = 0;
                        num = num + 1;
                        var tmp = angular.copy($scope.dc.spec.template.spec.containers[$scope.dc.spec.template.spec.containers.length - 1]);
                        tmp.env = [];
                        tmp.doset = false;
                        tmp.volment = false;
                        tmp.display = true;
                        tmp.retract = true;
                        tmp.livenessFlag = false;
                        tmp.resourcesFlag = false;
                        tmp.livenesshttpscheck = false;
                        // delete tmp.readinessProbe;
                        tmp.name = 'container' + String($scope.dc.spec.template.spec.containers.length + num);
                        $scope.checkoutreg(tmp, true);
                        $scope.dc.spec.template.spec.containers.push(tmp);
                    };
                    $scope.rmContainer = function (idx) {
                        $scope.dc.spec.template.spec.containers.splice(idx, 1);
                    };
                    //展开收缩
                    $scope.uex_down = false;
                    $scope.uex_up = true;
                    $scope.pickdown = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].retract) {
                            $scope.dc.spec.template.spec.containers[idx].retract = false;
                            $scope.uex_down = true;
                            $scope.uex_up = false;
                        } else {
                            $scope.dc.spec.template.spec.containers[idx].retract = true;
                            $scope.uex_down = false;
                            $scope.uex_up = true;
                        }
                    }

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
                                        };
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
                                //    健康检查
                                if (n[i].livenesscheck != o[i].livenesscheck) {
                                    if (n[i].livenesscheck == "HTTP") {
                                        $scope.dc.spec.template.spec.containers[i].livenessProbe = {
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
                                        };

                                    } else if (n[i].livenesscheck == "命令") {
                                        $scope.dc.spec.template.spec.containers[i].livenessProbe = {
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
                                    } else if (n[i].livenesscheck == "TCP") {
                                        $scope.dc.spec.template.spec.containers[i].livenessProbe = {
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
                    }, true);
                    $scope.showEnv = function (idx) {
                        if ($scope.dc.spec.template.spec.containers[idx].annotate.isShowEnv) {
                            $scope.dc.spec.template.spec.containers[idx].annotate.isShowEnv = false;
                        } else {
                            $scope.dc.spec.template.spec.containers[idx].annotate.isShowEnv = true;
                        }
                    };
                    $scope.delcontainerEnv = function (outerIndex, innerIndex) {
                        $scope.dc.spec.template.spec.containers[outerIndex].env.splice(innerIndex, 1);
                    };

                    $scope.addContainerEnv = function (outerIndex, innerIndex) {
                        if ($scope.dc.spec.template.spec.containers[outerIndex].env) {

                        } else {
                            $scope.dc.spec.template.spec.containers[outerIndex].env = []
                        }
                        $scope.dc.spec.template.spec.containers[outerIndex].env.push({name: '', value: ''});
                    };

                    $scope.addconvol = function (outerIndex, obj, key) {
                        // if($scope.dc.spec.template.spec.containers[outerIndex].volments.secret.secretName)

                        // secret.secretName
                        // console.log("jia---0",$scope.dc.spec.template.spec.containers[outerIndex].volments)
                        // console.log("jia---1",$scope.dc.spec.template.spec.containers[outerIndex].volments[obj])
                        if ($scope.dc.spec.template.spec.containers[outerIndex].volments) {
                            var canadd = true;
                            angular.forEach($scope.dc.spec.template.spec.containers[outerIndex].volments[obj], function (vol, i) {
                                if (vol[key] && vol.mountPath) {

                                } else {
                                    canadd = false
                                }
                            });
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
                        volobj[key] = '';
                        $scope.dc.spec.template.spec.containers[outerIndex].volments[obj].push(volobj)

                    };
                    $scope.delconvol = function (outerIndex, innerIndex, obj) {
                        $scope.dc.spec.template.spec.containers[outerIndex].volments[obj].splice(innerIndex, 1);
                    };
                    $scope.delempty = function (outerIndex, innerIndex) {
                        $scope.dc.spec.template.spec.containers[outerIndex].emptyDir.splice(innerIndex, 1);
                    };
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
                    function cleararr(arr) {
                        var newarr = []
                        angular.forEach(arr, function (item, i) {
                            if (item == null) {

                            } else {
                                newarr.push(item)
                            }
                        })
                        return newarr
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
                    };
                    $scope.loaddirs.loadcon = function () {
                        angular.forEach($scope.dc.spec.template.spec.containers, function (con, i) {
                            con.resourcesunit = {
                                mincpu: 'millicores',
                                maxcpu: 'millicores',
                                minmem: 'MB',
                                maxmem: 'MB'
                            };
                            if ($scope.imagedockermap[con.image]) {
                                con.display = true;
                                con.regimage = '';
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
                            //配额限制
                            if (JSON.stringify(con.resources) != '{}') {
                                con.resourcesFlag = true;
                                if (con.resources.limits) {
                                    if (con.resources.limits.cpu) {
                                        if (con.resources.limits.cpu.charAt(con.resources.limits.cpu.length - 1) === 'm') {
                                            con.resourcesunit.maxcpu = 'millicores';
                                            con.resources.limits.cpu = con.resources.limits.cpu.slice(0, -1);
                                        } else {
                                            con.resourcesunit.maxcpu = 'cores';
                                        }
                                    }

                                    if (con.resources.limits.memory) {
                                        if (con.resources.limits.memory.charAt(con.resources.limits.memory.length - 1) === 'm') {
                                            con.resourcesunit.maxmem = 'MB';
                                            con.resources.limits.memory = con.resources.limits.memory.slice(0, -1);
                                        } else if (con.resources.limits.memory.charAt(con.resources.limits.memory.length - 1) === 'G') {
                                            con.resourcesunit.maxmem = 'GB';
                                            con.resources.limits.memory = con.resources.limits.memory.slice(0, -1);
                                        }
                                    }
                                }
                                if (con.resources.requests) {
                                    if (con.resources.requests.cpu) {
                                        if (con.resources.requests.cpu.charAt(con.resources.requests.cpu.length - 1) === 'm') {
                                            con.resourcesunit.mincpu = 'millicores';
                                            con.resources.requests.cpu = con.resources.requests.cpu.slice(0, -1);
                                        } else {
                                            con.resourcesunit.mincpu = 'cores';
                                        }
                                    }
                                    if (con.resources.requests.memory) {
                                        if (con.resources.requests.memory.charAt(con.resources.requests.memory.length - 1) === 'm') {
                                            con.resourcesunit.minmem = 'MB';
                                            con.resources.requests.memory = con.resources.requests.memory.slice(0, -1)
                                        } else if (con.resources.requests.memory.charAt(con.resources.requests.memory.length - 1) === 'G') {
                                            con.resourcesunit.minmem = 'GB';
                                            con.resources.requests.memory = con.resources.requests.memory.slice(0, -1)
                                        }
                                    }
                                }
                            } else {
                                con.resourcesFlag = false;
                            }

                            //可用性探测&&就绪检查
                            if (con.readinessProbe) {
                                con.doset = true;
                                if (con.readinessProbe.httpGet) {
                                    con.dosetcon = 'HTTP'
                                } else if (con.readinessProbe.tcpSocket) {
                                    con.dosetcon = 'TCP'
                                } else if (con.readinessProbe.exec) {
                                    // console.log('con.readinessProbe.exe',con.readinessProbe.exec);
                                    var copyexec = angular.copy(con.readinessProbe.exec.command)
                                    angular.forEach(copyexec, function (exec, k) {
                                        con.readinessProbe.exec.command[k] = {key: exec};
                                    })
                                    con.dosetcon = '命令'

                                }
                            }
                            //健康检查
                            if (con.livenessProbe) {
                                con.livenessFlag = true;
                                if (con.livenessProbe.httpGet) {
                                    con.livenesscheck = 'HTTP';
                                    if (con.livenessProbe.httpGet.scheme = 'HTTPS') {
                                        con.livenesshttpscheck = true
                                    }
                                } else if (con.livenessProbe.tcpSocket) {
                                    con.livenesscheck = 'TCP'
                                } else if (con.livenessProbe.exec) {
                                    // console.log('con.livenessProbe.exec',con.livenessProbe.exec);
                                    var copyexec = angular.copy(con.livenessProbe.exec.command)
                                    angular.forEach(copyexec, function (exec, k) {
                                        con.livenessProbe.exec.command[k] = {key: exec};
                                    })
                                    con.livenesscheck = '命令'
                                }
                            }
                            //emptyDir
                            //console.log($scope.dc.spec.template.spec.volumes);
                            //console.log(con.volumeMounts);
                            con.emptyDir = [];

                            angular.forEach($scope.dc.spec.template.spec.volumes, function (vol, i) {
                                angular.forEach(vol, function (value, key) {
                                    if (key === 'emptyDir') {
                                        con.emptyDir.push({name: vol.name, volumes: vol})
                                        $scope.dc.spec.template.spec.volumes.splice(i, 1, null)
                                    }
                                })
                            })

                            //$scope.dc.spec.template.spec.volumes=angular.copy(newvol.vol)
                            if (con.emptyDir.length > 0) {
                                angular.forEach(con.volumeMounts, function (vol, i) {
                                    angular.forEach(con.emptyDir, function (emp, k) {
                                        if (vol.name === emp.name) {
                                            con.emptyDir[k].mountPath = vol.mountPath
                                            con.emptyDir[k].volumeMounts = vol
                                            con.volumeMounts.splice(i, 1, null)
                                        }
                                    })
                                })
                                $scope.dc.spec.template.spec.volumes = cleararr($scope.dc.spec.template.spec.volumes);
                                con.volumeMounts = cleararr(con.volumeMounts);

                                //console.log($scope.dc.spec.template.spec.volumes);
                                //console.log(con.volumeMounts);
                            }
                            // console.log(con.emptyDir);
                            //console.log('con.volumeMounts', $scope.dc.spec.template.spec.volumes);
                            if (con.volumeMounts && con.volumeMounts.length > 0) {
                                //other
                                con.volment = true;
                                //console.log($scope.dc.spec.template.spec.volumes);
                                //console.log(con.volumeMounts);
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
                                                        // console.log(con.volments, j);
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
                            } else if (trigger.type == 'ImageChange') {
                                //console.log('trigger', trigger);
                                angular.forEach($scope.dc.spec.template.spec.containers, function (con, k) {
                                    if (trigger.imageChangeParams.containerNames[0] === con.name) {
                                        con.imageChange = true
                                    }
                                })
                            }
                        });
                    }
                    $scope.loaddirs.loadcon()

                    gethor($scope.dc.metadata.name);
                }]
        };
    })
    .directive('deploymentsHistory', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deploymentconfig_detail/tpl/history.html',
            scope: false,
            controller: ['$scope', 'ReplicationController', '$rootScope', 'Ws', 'Sort', 'toastr',
                function ($scope, ReplicationController, $rootScope, Ws, Sort, toastr) {
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
                        if ($scope.dc.status.replicas == $scope.dc.spec.replicas) {
                            return 'normal';    //正常
                        }
                        return 'warning';   //告警
                    };
                    var vaildarr = [];
                    var loadRcs = function (name) {
                        var labelSelector = 'openshift.io/deployment-config.name=' + name;
                        ReplicationController.get({
                            namespace: $rootScope.namespace,
                            labelSelector: labelSelector,
                            region: $rootScope.region
                        }, function (res) {
                            res.items = Sort.sort(res.items, -1);
                            for (var i = 0; i < res.items.length; i++) {
                                res.items[i].dc = JSON.parse(res.items[i].metadata.annotations['openshift.io/encoded-deployment-config']);
                                if (res.items[i].metadata.name == $scope.dc.metadata.name + '-' + $scope.dc.status.latestVersion) {
                                    //$scope.dc.status.replicas = res.items[i].status.replicas;
                                    $scope.dc.status.phase = res.items[i].metadata.annotations['openshift.io/deployment.phase'];
                                }
                                if (res.items[i].metadata.annotations['openshift.io/deployment.cancelled'] == 'true') {
                                    res.items[i].metadata.annotations['openshift.io/deployment.phase'] = 'Cancelled';
                                }
                            }
                            $scope.rcs = angular.copy(res);
                            $scope.dc.state = serviceState();

                            $scope.resourceVersion = res.metadata.resourceVersion;
                            angular.forEach(res.items, function (rc, i) {
                                if (rc.metadata.annotations['openshift.io/deployment.phase'] === 'Complete') {
                                    vaildarr.push(rc.metadata.name)
                                }
                            });

                            watchRcs(res.metadata.resourceVersion);
                        }, function (res) {
                            //todo 错误处理
                        });
                    };
                    var watchRcs = function (resourceVersion) {
                        Ws.watch({
                            api: 'k8s',
                            resourceVersion: resourceVersion,
                            namespace: $rootScope.namespace,
                            type: 'replicationcontrollers',
                            name: ''
                        }, function (res) {
                            var data = JSON.parse(res.data);
                            updateRcs(data);
                        }, function () {
                            //$log.info("webSocket startRC");
                        }, function () {
                            //$log.info("webSocket stopRC");
                            var key = Ws.key($rootScope.namespace, 'replicationcontrollers', '');
                            if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                                return;
                            }
                        });
                    };

                    var openToastr = function (data) {
                        var repvaild = false;
                        angular.forEach(vaildarr, function (name, i) {
                            if (name === data.metadata.name) {
                                repvaild = true
                            }
                        });
                        if (repvaild) {
                            return
                        }
                        var statusName = data.metadata.annotations['openshift.io/deployment.phase'];
                        // console.log('0000', statusName);
                        // console.log('0000', data);
                        if (statusName === 'Complete') {
                            toastr.success(data.metadata.name + '更新部署成功', {
                                timeOut: 2000,
                                closeButton: true
                            });
                            vaildarr.push(data.metadata.name)
                        } else if (statusName === 'Running' || statusName === 'New' || statusName === 'Pending') {
                            return
                        } else {
                            toastr.error(data.metadata.name + '更新部署失败', {
                                timeOut: 2000,
                                closeButton: true
                            });
                            vaildarr.push(data.metadata.name)
                        }
                    };
                    //执行log
                    var updateRcs = function (data) {
                        if (data.type == 'ADDED') {
                            if ($scope.rcs.items.length > 0) {
                                $scope.rcs.items.unshift(data.object);
                            } else {
                                $scope.rcs.items = [data.object];
                            }
                        } else if (data.type == "MODIFIED") {
                            $scope.baocuname = data.object.metadata.name;
                            angular.forEach($scope.rcs.items, function (item, i) {
                                if (item.metadata.name == data.object.metadata.name) {
                                    openToastr(data.object);
                                    $scope.rcs.items[i] = data.object;
                                    $scope.$apply();
                                }
                            });
                        }
                    };
                    loadRcs($scope.dc.metadata.name);
                }],
        };
    })
    .directive('setQuotaDetail', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deploymentconfig_detail/tpl/setQuotaDetail.html',
            scope: false,
            controller: ['$scope', function ($scope) {
                $scope.$watch('container.resourcesFlag', function (n, o) {
                    // console.log('n', n);
                    // console.log('$scope.institution', $scope.institution);
                    if ($scope.institution.rubustCheck && n === false) {
                        $scope.institution.rubustCheck = false
                    }

                })
            }]
        };
    })
    .directive('containerLivenessCheckDetail', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/deploymentconfig_detail/tpl/containerLivenessCheckDetail.html',
            scope: false,
            controller: ['$scope', function ($scope) {
                $scope.changeContainerPort = function (idx, port) {
                    // console.log('changeContainerPort',idx, port);
                    $scope.dc.spec.template.spec.containers[idx].livenessProbe.httpGet.port = port;
                }
            }]
        };
    })


