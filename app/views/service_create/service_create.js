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
    .controller('ServiceCreateCtrl', ['mytag', 'ImageStreamImage', 'myimage', 'imagestreamimports', 'GLOBAL', 'resourcequotas', '$http', 'by', 'diploma', 'Confirm', 'Toast', '$rootScope', '$state', '$scope', '$log', '$stateParams', 'ImageStream', 'DeploymentConfig', 'ImageSelect', 'BackingServiceInstance', 'BackingServiceInstanceBd', 'ReplicationController', 'Route', 'Secret', 'Service',
        function (mytag, ImageStreamImage, myimage, imagestreamimports, GLOBAL, resourcequotas, $http, by, diploma, Confirm, Toast, $rootScope, $state, $scope, $log, $stateParams, ImageStream, DeploymentConfig, ImageSelect, BackingServiceInstance, BackingServiceInstanceBd, ReplicationController, Route, Secret, Service) {
            $scope.institution = {
                display: 1,
                configregistry: false
            }

            $scope.advancedConfig = false

            $scope.portsArr = [];

            $scope.jump = function () {
                if (!$scope.dc.metadata.name) {
                    $scope.err.name.null = true;
                    return
                }
                //console.log(invrepname());
                if (!invrepname()) {
                    $scope.err.name.repeated = true;
                    return
                }
                $scope.advancedConfig = true
            }

            DeploymentConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                $scope.servelist = data;
            })

            $scope.err = {
                url: {
                    null: false,
                    notfind: false,
                    role: false
                },
                name: {
                    null: false,
                    repeated: false,
                    pattern: false
                },
                env: {
                    null: false,
                    repeated: false,
                },
                label: {
                    null: false,
                    repeated: false,
                }

            }

            var cont = 0

            $scope.istag = angular.copy(mytag)

            $scope.imageslist = [];

            $scope.tagslist = [];

            angular.forEach(myimage.items, function (image) {
                //console.log('image.status.tags', image.status.tags);
                if (image.status.tags) {
                    $scope.imageslist.push(image)
                }
            })

            $scope.checked = {
                namespace: '',
                image: '',
                tag: ''
            }

            $scope.postobj = {
                "kind": "ImageStreamImport",
                "apiVersion": "v1",
                "metadata": {"name": "newapp", "namespace": $rootScope.namespace},
                "spec": {
                    "import": false,
                    "images": [
                        {
                            "from": {
                                "kind": "DockerImage",
                                "name": ""
                            }

                        }
                    ]


                },
                "status": {}
            }

            $scope.service = {
                "kind": "Service",
                "apiVersion": "v1",
                "metadata": {
                    "name": "",
                    "labels": {
                        "app": ""
                    },
                    annotations: {
                        "dadafoundry.io/create-by": $rootScope.user.metadata.name
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

            $scope.showall = false;

            $scope.hasport = false;

            $scope.dc = {
                "kind": "DeploymentConfig",
                "apiVersion": "v1",
                "metadata": {
                    "name": '',
                    "labels": [{name: "app", value: ''}],
                    "annotations": {
                        "openshift.io/generated-by": "OpenShiftWebConsole",
                        "dadafoundry.io/create-by": $rootScope.user.metadata.name
                    }
                },
                "spec": {
                    ConfigChange: true,
                    "strategy": {"resources": {}},
                    "triggers": [],
                    "replicas": 1,
                    "test": false,
                    "selector": {
                        "deploymentconfig": '',
                        "app": ''
                    },
                    "template": {
                        "metadata": {
                            "labels": {"deploymentconfig": '', "app": ''},
                            "annotations": {"openshift.io/generated-by": "OpenShiftWebConsole"}
                        },
                        "spec": {
                            "volumes": [],
                            "containers": [{
                                "name": '',
                                "image": '',
                                'env': [{name: '', value: ''}],
                                volments: {
                                    //secret: [{secretName: '', mountPath: ''}],
                                    //configMap: [{name: '', mountPath: ''}],
                                    //persistentVolumeClaim: [{claimName: '', mountPath: ''}]
                                },
                                imageChange: false,
                                "ports": [
                                    {
                                        "containerPort": 80,
                                        "protocol": "TCP"
                                    }
                                ],
                                "resources": {
                                    "limits": {
                                        "cpu": "20m",
                                        "memory": "20Mi"
                                    },
                                    "requests": {
                                        "cpu": "10m",
                                        "memory": "10Mi"
                                    }
                                },
                                open: {
                                    resources: false,
                                    volment: false,
                                    livenessProbe: false,
                                    readinessProbe: false,
                                    livenesscheck: 'HTTP',
                                    livenesshttpscheck: false,
                                    readinesscheck: 'HTTP',
                                    readinesshttpscheck: false
                                },
                                resourcesunit: {
                                    mincpu: 'millicores',
                                    maxcpu: 'millicores',
                                    minmem: 'MB',
                                    maxmem: 'MB'
                                },
                                "livenessProbe": {
                                    annotations: {
                                        path: '',
                                        port: '',
                                        command: '',

                                    },
                                    "httpGet": {
                                        "path": "/Liveness",
                                        "port": 80,
                                        "scheme": "HTTP" //HTTPS
                                    },
                                    exec: {
                                        command: ["ls", "-l", "/"]
                                    },
                                    tcpSocket: {
                                        port: 80
                                    },
                                    "initialDelaySeconds": 1,
                                    "timeoutSeconds": 1,
                                    "periodSeconds": 10,
                                    "successThreshold": 1,
                                    "failureThreshold": 3
                                },
                                "readinessProbe": {
                                    annotations: {
                                        path: '',
                                        port: '',
                                        command: '',

                                    },
                                    httpGet: {
                                        "path": "/Liveness",
                                        "port": 80,
                                        "scheme": "HTTP" //HTTPS
                                    },
                                    exec: {
                                        command: ["ls", "-l", "/"]
                                    },
                                    tcpSocket: {
                                        port: 80
                                    },
                                    "initialDelaySeconds": 1,
                                    "timeoutSeconds": 1,
                                    "periodSeconds": 10,
                                    "successThreshold": 1,
                                    "failureThreshold": 3
                                },
                                entrypoint: '',
                                cmd: '',
                                "command": [
                                    "tail"
                                ],
                                "args": [
                                    "-f",
                                    "/dev/null"
                                ],


                            }],
                            "resources": {}
                        }
                    }
                },
                "status": {}
            }

            $scope.$watch('dc.metadata.name', function (n, o) {
                if (n == o) {
                    return
                }
                if (n === '') {
                    //$scope.namerr.nil = true
                    return
                }
                if (n) {
                    $scope.err.name.pattern = false;

                    $scope.err.name.null = false;

                    $scope.err.name.repeated = false;
                    //dcname(n)
                }
            })

            $scope.$watch('institution.display', function (n, o) {
                if (n == o) {
                    return
                }
                if (n) {
                    console.log(n);
                    $scope.showall = false
                    $scope.checked = {
                        namespace: '',
                        image: '',
                        tag: ''
                    }
                    $scope.postobj.spec.images[0].from.name = ''
                }
            })
            $scope.tocheckedtag= function (tag,idx,checked,istags) {
                //var con =
                console.log('tag,idx,checked,istags', tag, idx, checked, istags);
                $scope.dc.spec.template.spec.containers[idx].creattime=tag.image.metadata.creationTimestamp
                if (tag.image.dockerImageMetadata.Config.ExposedPorts) {

                    var posts = []
                    //$scope.port = []
                    $scope.dc.spec.template.spec.containers[idx].strport = '';

                    for (var k in tag.image.dockerImageMetadata.Config.ExposedPorts) {
                        var pot = parseInt(k.split('/')[0])
                        posts.push({protocol: k.split('/')[1].toUpperCase(), containerPort: pot})
                        var rep = false
                        angular.forEach($scope.portsArr, function (item, i) {
                            if (item.containerPort && item.containerPort == pot) {
                                rep = true
                            }
                        })
                        if (!rep) {
                            $scope.portsArr.push({
                                protocol: k.split('/')[1].toUpperCase(),
                                containerPort: pot,
                                hostPort: pot
                            })
                        }
                        $scope.dc.spec.template.spec.containers[idx].strport += k.split('/')[0] + '/' + k.split('/')[1].toUpperCase() + ',';
                    }
                    $scope.dc.spec.template.spec.containers[idx].strport = $scope.dc.spec.template.spec.containers[idx].strport.replace(/\,$/, "")
                    $scope.dc.spec.template.spec.containers[idx].ports = angular.copy(posts)
                }

                $scope.dc.spec.template.spec.containers[idx].annotate= {
                    image:checked.image,
                    tag:checked.tag
                }
                $scope.dc.spec.template.spec.containers[idx].annotate.ismy=true

                $scope.dc.spec.template.spec.containers[idx].name = checked.image
                //$scope.fuwuname = checked.image;

                //tag.image.
                angular.forEach(istags.items, function (istag, i) {
                    if (istag.image.metadata.name === tag.image.metadata.name) {
                        //console.log(istag.image.dockerImageReference);
                        $scope.dc.spec.template.spec.containers[idx].image = istag.image.dockerImageReference;
                    }
                })

            }
            function dcname(n, image) {
                $scope.dc.metadata.name = n;
                if ($scope.dc.metadata.labels && $scope.dc.metadata.labels[0]) {
                    $scope.dc.metadata.labels[0].value = n;
                }

                $scope.dc.spec.selector.deploymentconfig = n;
                $scope.dc.spec.selector.app = n;
                $scope.dc.spec.template.metadata.labels.deploymentconfig = n;
                $scope.dc.spec.template.metadata.labels.app = n;
                //$scope.dc.spec.template.spec.containers[0].name = n;
                //if (image) {
                //    $scope.dc.spec.template.spec.containers[0].image = image;
                //}
            }

            var prepareService = function (service, dc) {
                service.metadata.name = $scope.dc.metadata.name;
                service.metadata.labels.app = $scope.dc.metadata.name;
                service.spec.selector.app = $scope.dc.metadata.name;
                service.spec.selector.deploymentconfig = $scope.dc.metadata.name;
            };

            function creatdc() {

                dcname($scope.dc.metadata.name, $scope.imagetext)
                prepareLabel($scope.dc)
                prepareEnv($scope.dc)
                DeploymentConfig.get({
                    namespace: $rootScope.namespace,
                    region: $rootScope.region,
                    name: $scope.dc.metadata.name
                }, function (data) {
                    //$scope.namerr.repeated = true;
                }, function (err) {
                    if (err.status === 404) {
                        DeploymentConfig.create({
                            namespace: $rootScope.namespace,
                            region: $rootScope.region
                        }, $scope.dc, function (res) {
                            $state.go('console.deploymentconfig_detail', {
                                namespace: $rootScope.namespace,
                                name: $scope.dc.metadata.name,
                                from: 'create'
                            });
                        }, function (res) {
                            //todo 错误处理
                            $log.info("create dc fail", res);
                            if (res.status == 409) {
                                //$scope.grid.createdcerr = true;
                            }
                        });
                    }
                })

            }

            var createService = function (dc) {
                prepareService($scope.service, dc);
                var ps = [];
                //console.log('$scope.port', $scope.port);
                angular.forEach($scope.portsArr, function (port, i) {
                    var val = port.protocol.toUpperCase()
                    ps.push({
                        name: port.containerPort + '-' + port.protocol.toLowerCase(),
                        port: parseInt(port.containerPort),
                        protocol: val,
                        targetPort: parseInt(port.containerPort)
                    })
                })
                if (ps.length > 0) {
                    $scope.service.spec.ports = ps;
                } else {
                    $scope.service.spec.ports = null;
                }
                Service.get({
                    namespace: $rootScope.namespace,
                    region: $rootScope.region,
                    name: dc.metadata.name
                }, function (serve) {
                    //console.log('serve', serve);
                    $scope.err.name.repeated = true;
                }, function (err) {
                    //console.log('err', err.status);
                    if (err.status === 404) {
                        Service.create({
                            namespace: $rootScope.namespace,
                            region: $rootScope.region
                        }, $scope.service, function (res) {
                            $log.info("create service success", res);
                            //$scope.service = res;
                            creatdc()
                        }, function (res) {
                            $log.info("create service fail", res);
                            //$state.go('console.service_detail', {name: dc.metadata.name});
                        });
                    }
                })

            };

            function prepareLabel(dc) {
                console.log('dc.metadata.labels', dc.metadata.labels);
                dc.metadata.labels[0].value = $scope.fuwuname;
                var labels = angular.copy(dc.metadata.labels)

                $scope.dc.metadata.labels = {}
                angular.forEach(labels, function (label, i) {
                    if (label.name !== '' && label.value !== "") {
                        $scope.dc.metadata.labels[label.name] = label.value;
                    }
                })
            }

            function prepareEnv(dc) {
                var envs = angular.copy(dc.spec.template.spec.containers[0].env);
                $scope.dc.spec.template.spec.containers[0].env = [];
                angular.forEach(envs, function (env, i) {
                    if (env.name !== '' && env.value !== '') {
                        $scope.dc.spec.template.spec.containers[0].env.push({name: env.name, value: env.value})
                    }
                })
                if ($scope.dc.spec.template.spec.containers[0].env.length > 0) {
                } else {
                    delete $scope.dc.spec.template.spec.containers[0].env
                }

            }

            function invrepname() {
                var norep = true
                angular.forEach($scope.servelist.items, function (dc, i) {
                    //console.log(dc.metadata.name, $scope.fuwuname);
                    if (dc.metadata.name === $scope.dc.metadata.name) {
                        norep = false

                    }
                })
                if (norep) {
                    return true
                } else {
                    return false
                }

            }

            function unit(num, unit) {
                if (unit === 'millicores') {
                    return num + 'm'
                } else if (unit === 'cores') {
                    return num + 'cores'
                } else if (unit === 'MB') {
                    return num + 'm'
                } else if (unit === 'GB') {
                    return num + 'g'
                }
            }

            function invEnv() {
                var envs = angular.copy($scope.dc.spec.template.spec.containers[0].env)
                angular.forEach(envs, function (env) {

                })
            }

            function creatimageconfig(con) {
                console.log('con', con);
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
                }

                $scope.dc.spec.triggers.push(tpl)
            }

            function volerr(vol) {
                var volerr = false;
                var cunt = 0;
                var copyarr = []
                $scope.err = {
                    vol: {
                        secret: false,
                        configMap: false,
                        persistentVolumeClaim: false,
                        mountPath: false
                    }
                }
                angular.forEach(vol, function (item, i) {
                    angular.forEach(item, function (ovolment, k) {
                        ovolment.id = cunt;
                        ovolment.index = k;
                        ovolment.type = i
                        cunt = cunt + 1;
                        copyarr.push(ovolment)
                    })
                })
                console.log('vol', vol);
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
                                    console.log(ivolment, vol[i]);
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
            }

            function creatvol(con, vol) {

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

            $scope.createDc = function () {
                //console.log($scope.frm.serviceName.$error.pattern);
                $scope.dc.spec.template.spec.volumes = [];
                var cancreat = true
                angular.forEach($scope.dc.spec.template.spec.containers, function (con, i) {
                    //console.log(con.dosetcon.doset);
                    if (con.open.readinessProbe) {
                        if (con.open.readinesscheck === 'HTTP') {
                            delete con.readinessProbe.exec
                            delete con.readinessProbe.tcpSocket
                            if (con.open.readinesshttpscheck) {
                                con.readinessProbe.httpGet.scheme = 'HTTPS';
                            }
                            con.readinessProbe.httpGet.path = con.readinessProbe.annotations.path;
                            con.readinessProbe.httpGet.port = parseInt(con.readinessProbe.annotations.port)
                        } else if (con.open.readinesscheck === 'TCP') {
                            delete con.readinessProbe.httpGet
                            delete con.readinessProbe.exec
                            if (con.readinessProbe.tcpSocket) {
                                con.readinessProbe.tcpSocket.port = parseInt(con.readinessProbe.annotations.port)
                            }
                        } else if (con.open.readinesscheck === '命令') {
                            //console.log('con.readinessProbe.exec.command', con.readinessProbe.exec.command);
                            angular.forEach(con.readinessProbe.annotations.command, function (item, k) {
                                con.readinessProbe.exec.command[k] = item.key
                            })
                            delete con.readinessProbe.httpGet
                            delete con.readinessProbe.tcpSocket
                        }
                        con.readinessProbe.initialDelaySeconds = parseInt(con.readinessProbe.initialDelaySeconds)
                        con.readinessProbe.timeoutSeconds = parseInt(con.readinessProbe.timeoutSeconds)
                    }else {
                        delete con.readinessProbe
                    }
                    if (con.open.livenessProbe) {
                        if (con.open.livenesscheck === 'HTTP') {
                            delete con.livenessProbe.exec
                            delete con.livenessProbe.tcpSocket
                            if (con.open.livenesshttpscheck) {
                                con.livenessProbe.httpGet.scheme = 'HTTPS';
                            }
                            con.livenessProbe.httpGet.path = con.livenessProbe.annotations.path;
                            con.livenessProbe.httpGet.port = parseInt(con.livenessProbe.annotations.port)
                        } else if (con.open.livenesscheck === 'TCP') {
                            delete con.livenessProbe.httpGet
                            delete con.livenessProbe.exec
                            if (con.livenessProbe.tcpSocket) {
                                con.livenessProbe.tcpSocket.port = parseInt(con.livenessProbe.annotations.port)
                            }
                        } else if (con.open.livenesscheck === '命令') {
                            angular.forEach(con.livenessProbe.annotations.command, function (item, k) {
                                con.livenessProbe.exec.command[k] = item.key
                            })
                            delete con.livenessProbe.httpGet
                            delete con.livenessProbe.tcpSocket
                        }
                        con.livenessProbe.initialDelaySeconds = parseInt(con.livenessProbe.initialDelaySeconds)
                        con.livenessProbe.timeoutSeconds = parseInt(con.livenessProbe.timeoutSeconds)
                    }else {
                        delete con.livenessProbe
                    }
                    if (con.entrypoint) {
                        con.command = con.entrypoint.split(' ')

                    }else {
                        delete con.command
                    }
                    if (con.cmd) {
                        con.args = con.cmd.split(' ')
                    }else {
                        delete con.args
                    }
                    //console.log('con.imageChange', con.imageChange);
                    if (con.imageChange) {
                        creatimageconfig(con)
                    }
                    //console.log('con.volment', con.volment);
                    if (con.open.volment) {
                        con.volumeMounts = []
                        if (volerr(con.volments)) {
                            cancreat = false
                        }
                        //console.log('con.volment', con.volments);
                        creatvol(con, con.volments)

                        //if (volrepeat(con.volumeMounts)) {
                        //    Toast.open('卷路径重复');
                        //    cancreat=false
                        //}
                        //
                    } else {
                        delete con.volumeMounts
                        delete con.volments
                    }

                    if (con.open.resources) {
                        con.resources.limits.cpu = unit(con.resources.limits.cpu, con.resourcesunit.mincpu)
                        con.resources.limits.memory = unit(con.resources.limits.memory, con.resourcesunit.minmem)
                        con.resources.requests.cpu = unit(con.resources.requests.cpu, con.resourcesunit.maxcpu)
                        con.resources.requests.memory = unit(con.resources.requests.memory, con.resourcesunit.maxmem)
                    }else {
                        delete con.resources
                    }


                })
                if (!cancreat) {
                    return
                }

                //console.log($scope.fuwuname);
                if (!$scope.dc.metadata.name) {
                    $scope.err.name.null = true;
                    return
                }
                //console.log(invrepname());
                if (!invrepname()) {
                    $scope.err.name.repeated = true;
                    return
                }
                invEnv()
                if ($scope.dc.spec.ConfigChange) {
                    $scope.dc.spec.triggers.push({"type": "ConfigChange"})
                }

                if ($scope.portsArr.length&&$scope.portsArr.length>0) {
                    createService($scope.dc)
                } else {
                    creatdc()
                }

            }
        }])
    .directive('addSecrets', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/service_create/tpl/addSecrets.html',
            scope: false,
            controller: ['$scope', 'Secret', 'configmaps', 'persistent', '$rootScope',
                function ($scope, Secret, configmaps, persistent, $rootScope) {
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
                    $scope.addconvol = function (outerIndex, obj, key) {

                        if ($scope.dc.spec.template.spec.containers[outerIndex].volments) {
                            var canadd = true
                            angular.forEach($scope.dc.spec.template.spec.containers[outerIndex].volments[obj], function (vol, i) {
                                if (vol[key] && vol.mountPath) {

                                } else {
                                    canadd = false
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
                }],
        };
    })
    .directive('dcContainers', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/service_create/tpl/dcContainers.html',
            scope: false,
            controller: ['$scope', 'ChangeImages',
                function ($scope, ChangeImages) {
                    $scope.selectImage = function (idx) {
                        console.log('outerIndex', idx);
                        ChangeImages.open($scope.imageslist,$scope.istag).then(function (res) {
                            //console.log('tag,checked,istag,ismy', tag, checked, istag, ismy);
                            if (res.ismy==='mytag') {

                                $scope.tocheckedtag(res.mytag,idx,res,res.istag)
                            }

                        })
                    }
                    $scope.addenv = function (con) {
                        con.env.push({name: '', value: ''})
                    }
                    $scope.delenv = function (con,idx) {
                        con.env.splice(idx, 1);
                    }
                }],
        };
    })
    .directive('changeImage', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/service_create/tpl/changeImage.html',
            scope: false,
            controller: ['ImageStreamImage', '$scope', 'imagestreamimports', '$rootScope', 'ChangeImages',
                function (ImageStreamImage, $scope, imagestreamimports, $rootScope, ChangeImages) {
                    $scope.checkedimage = function (image) {
                        $scope.checked.image = image.metadata.name;
                        $scope.checked.tag = '';
                        $scope.tagslist = [];
                        if (image.status.tags) {
                            angular.forEach(image.status.tags, function (tag, i) {
                                tag.items[0].name = tag.tag
                                tag.items[0].imagecopy = angular.copy(image)
                                $scope.tagslist.push(tag.items[0])
                            })
                        }
                    }

                    $scope.myKeyup = function (e) {
                        var keycode = window.event ? e.keyCode : e.which;
                        if (keycode == 13) {
                            $scope.find();
                        }
                    }

                    function imagetimemessage(imagestime) {
                        $scope.creattime = imagestime
                    }

                    function imageportmessage(port) {
                        var port = port;
                        //console.log('port', port);
                        $scope.port = []
                        $scope.strport = '';

                        for (var k in port) {
                            var pot = parseInt(k.split('/')[0])
                            $scope.port.push({protocol: k.split('/')[1].toUpperCase(), containerPort: pot})
                            var rep = false
                            angular.forEach($scope.portsArr, function (item, i) {
                                if (item.containerPort && item.containerPort == pot) {
                                    rep = true
                                }
                            })
                            if (!rep) {
                                $scope.portsArr.push({
                                    protocol: k.split('/')[1].toUpperCase(),
                                    containerPort: pot,
                                    hostPort: pot
                                })
                            }
                            $scope.strport += k.split('/')[0] + '/' + k.split('/')[1].toUpperCase() + ',';
                        }
                        $scope.strport = $scope.strport.replace(/\,$/, "")
                        $scope.dc.spec.template.spec.containers[0].ports = angular.copy($scope.port)
                    }

                    $scope.find = function () {
                        if ($scope.institution.display == 2) {
                            return
                        }
                        $scope.err.url.null = false;
                        $scope.err.url.role = false;
                        $scope.err.url.notfind = false;
                        if (!$scope.finding) {
                            if ($scope.postobj.spec.images[0].from.name === '') {
                                $scope.err.url.null = true
                                return
                            }
                            $scope.finding = true;
                            if ($scope.institution.configregistry) {
                                $scope.postobj.spec.images[0].importPolicy = {
                                    insecure: true
                                }
                            }
                            $scope.postobj.spec.images[0].from.name = $scope.postobj.spec.images[0].from.name.replace(/^\s+|\s+$/g, "");
                            imagestreamimports.create({namespace: $rootScope.namespace}, $scope.postobj, function (images) {
                                $scope.finding = false;
                                var allsize = 0
                                //console.log('images', images.status.images[0].image.dockerImageLayers);
                                if (images.status.images[0].image.dockerImageLayers && images.status.images[0].image.dockerImageLayers.length) {
                                    angular.forEach(images.status.images[0].image.dockerImageLayers, function (size, i) {

                                        allsize = allsize + size.size;
                                    })
                                }
                                $scope.imagesize = Math.round(parseInt(allsize) / 1024 / 1024 * 100) / 100
                                //console.log('size', $scope.imagesize);
                                if (images.status.images && images.status.images[0] && images.status.images[0].status) {
                                    if (images.status.images[0].status.code && images.status.images[0].status.code === 401) {
                                        $scope.err.url.role = true;
                                        return
                                    }
                                    if (images.status.images[0].status.code && images.status.images[0].status.code === 404) {
                                        //$scope.namerr.url = true;
                                        $scope.err.url.notfind = true;
                                        return
                                    }
                                    if (images.status.images[0].status.code && images.status.images[0].status.code === 500) {
                                        //$scope.namerr.url = true;
                                        $scope.err.url.role = true;
                                        return
                                    }
                                }
                                //$scope.namerr.canbuild = false;
                                $scope.images = images;
                                $scope.curl = $scope.postobj.spec.images[0].from.name;
                                var name = $scope.postobj.spec.images[0].from.name.split('/')[$scope.postobj.spec.images[0].from.name.split('/').length - 1]
                                $scope.fuwuname = name.split(':').length > 1 ? name.split(':')[0] : name;
                                $scope.dc.spec.template.spec.containers[0].name = $scope.fuwuname
                                $scope.tag = name.split(':').length > 1 ? name.split(':')[1] : 'latest';
                                $scope.dc.spec.template.spec.containers[0].image = $scope.postobj.spec.images[0].from.name;
                                //$scope.dc.spec.template.spec.containers[0].ports

                                //var imagetag = 'dadafoundry.io/image-' + $scope.postobj.spec.images[0].from.name;
                                //
                                //$scope.dc.metadata.annotations[imagetag] = $scope.fuwuname + ":" + $scope.tag;

                                if (images.status.images[0] && images.status.images[0].image.dockerImageMetadata) {
                                    imagetimemessage(images.status.images[0].image.dockerImageMetadata.Created)
                                    //console.log('images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts', images.status.images[0].image.dockerImageMetadata);
                                    if (images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts) {
                                        imageportmessage(images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts)
                                    }
                                } else {
                                    //$scope.namerr.url = true;
                                }
                                $scope.showall = true;

                                $scope.dc.metadata.labels[0].value = $scope.fuwuname;
                            }, function (err) {
                                //$scope.namerr.url = true;
                                $scope.finding = false;
                            })
                        }
                    }

                    $scope.checkedtag = function (tag) {
                        //console.log('tag', tag);
                        $scope.checked.tag = tag.name;
                        $scope.detail = {}
                        //imagemessage(tag.imagecopy)
                        ImageStreamImage.get({
                            namespace: $rootScope.namespace,
                            name: $scope.checked.image + '@' + tag.image
                        }, function (tag) {
                            $scope.tocheckedtag(tag,0,$scope.checked,$scope.istag)


                        })
                    }
                }],
        };
    })
    .directive('containerLivenessCheck', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/service_create/tpl/containerLivenessCheck.html',
            scope: false,
            controller: ['$scope', function ($scope) {

            }],
        };
    })
    .directive('containerReadinessCheck', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/service_create/tpl/containerReadinessCheck.html',
            scope: false,
            controller: ['$scope', function ($scope) {

            }],
        };
    })
    .directive('setPorts', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/service_create/tpl/setPorts.html',
            scope: false,
            controller: ['$scope', function ($scope) {
                $scope.addprot = function () {
                    $scope.portsArr.unshift({
                        containerPort: "",
                        protocol: "TCP",
                        hostPort: ""
                    })
                };

                $scope.delprot = function (idx) {
                    $scope.portsArr.splice(idx, 1);
                };
            }],
        };
    })
    .directive('setQuota', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/service_create/tpl/setQuota.html',
            scope: false,
            controller: ['$scope', function ($scope) {

            }],
        };
    })

