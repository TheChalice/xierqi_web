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
    .controller('ServiceCreateCtrl', ['by','diploma', 'Confirm', 'Toast', '$rootScope', '$state', '$scope', '$log', '$stateParams', 'ImageStream', 'DeploymentConfig', 'ImageSelect', 'BackingServiceInstance', 'BackingServiceInstanceBd', 'ReplicationController', 'Route', 'Secret', 'Service', 'ChooseSecret', '$base64', 'secretskey', 'serviceaccounts',
        function (by,diploma, Confirm, Toast, $rootScope, $state, $scope, $log, $stateParams, ImageStream, DeploymentConfig, ImageSelect, BackingServiceInstance, BackingServiceInstanceBd, ReplicationController, Route, Secret, Service, ChooseSecret, $base64, secretskey, serviceaccounts) {
            $log.info('ServiceCreate');
            $scope.checkEnv = false;

            $scope.portsArr = [
                //{
                //  containRouteerPort: "",
                //  hostPort: "",
                //  protocol: ""
                //}
            ]
            //$scope.addprot = function (ind, last) {
            //  if (last) {     //添加
            //    $scope.portsArr.unshift({
            //      containerPort: "",
            //      protocol: "",
            //      hostPort: "",
            //    })
            //  } else {
            //    $scope.portsArr.splice(ind, 1);
            //  }
            //};
            $scope.addprot = function () {
                $scope.portsArr.unshift({
                    containerPort: "",
                    protocol: "",
                    hostPort: "",
                })
            };

            $scope.delprot = function (idx) {
                $scope.grid.port = '端口';
                $scope.portsArr.splice(idx, 1);
            };

            $scope.dc = {
                kind: "DeploymentConfig",
                apiVersion: "v1",
                metadata: {
                    name: "",
                    labels: {
                        app: ""
                    },
                    annotations: {
                        "dadafoundry.io/images-from": "public",
                        "dadafoundry.io/create-by": $rootScope.user.metadata.name
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
                            "securityContext": {},
                            'volumes': []
                        }
                    },
                    test: false
                },
                status: {}
            };

            // console.log('$rootScope',$rootScope);

            $scope.grid = {
                ports: [],
                port: 0,
                cname: '系统域名',
                host: '',
                noroute: false,
                cando:false,
                zsfile: {},
                syfile: {},
                cafile: {},
                mcafile: {},
                namerepeat:false,
                rexnameerr:false,
                tlsshow: false,
                tlsset: 'None',
                httpset: 'Allow',
                suffix: '.' + $rootScope.namespace + '.app.dataos.io',
                imageChange: false,
                configChange: true,
                checkedsecond: false,
                auto: true,
                conflict: false,
                serviceConflict: false,
                servicepot: false,
                servicepoterr: false,
                createdcerr: false,
                isserviceName: false,
                isimageChange: true,
                servicenameerr: false,
                imagePullSecrets: false
            };

            $scope.tlsroutes = [];

            $scope.savetls = function () {

                prepareRoute($scope.route, $scope.dc);
                if ($scope.grid.tlsset == 'Passthrough') {
                    $scope.route.spec.tls.termination = $scope.grid.tlsset;

                } else if ($scope.grid.tlsset == 'Edge') {
                    $scope.route.spec.tls.termination = $scope.grid.tlsset;
                    $scope.route.spec.tls.insecureEdgeTerminationPolicy = $scope.grid.httpset;
                    if ($scope.grid.zsfile.value) {
                        $scope.route.spec.tls.certificate = $scope.grid.zsfile.value
                    }
                    if ($scope.grid.syfile.value) {
                        $scope.route.spec.tls.key = $scope.grid.syfile.value
                    }
                    if ($scope.grid.cafile.value) {
                        $scope.route.spec.tls.caCertificate = $scope.grid.cafile.value
                    }
                } else if ($scope.grid.tlsset == 'Re-encrypt') {
                    $scope.route.spec.tls.termination = $scope.grid.tlsset;
                    if ($scope.grid.zsfile.value) {
                        $scope.route.spec.tls.certificate = $scope.grid.zsfile.value
                    }
                    if ($scope.grid.syfile.value) {
                        $scope.route.spec.tls.key = $scope.grid.syfile.value
                    }
                    if ($scope.grid.cafile.value) {
                        $scope.route.spec.tls.caCertificate = $scope.grid.cafile.value
                    }
                    if ($scope.grid.mcafile.value) {
                        $scope.route.spec.tls.destinationCACertificate = $scope.grid.mcafile.value
                    }
                } else {
                    delete $scope.route.spec.tls
                }

                Route.create({namespace: $rootScope.namespace}, $scope.route, function (res) {
                    $log.info("create route success", res);

                    $scope.tlsroutes.push(res);
                    $log.info("create route fail", res);
                    //复原router
                    $scope.grid.cname = '域名';
                    $scope.grid.host = '';
                    $scope.grid.zsfile = {};
                    $scope.grid.syfile = {};
                    $scope.grid.mcafile = {};
                    $scope.grid.cafile = {};
                    $scope.grid.tlsshow = false;
                    $scope.grid.tlsset = 'None';
                    $scope.grid.httpset = 'None';
                    $scope.route = {
                        "kind": "Route",
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
                            "host": "",
                            "to": {
                                "kind": "Service",
                                "name": ""
                            },
                            "port": {
                                "targetPort": ""
                            },
                            "tls": {}
                        }
                    };
                    $scope.grid.tlsshow = false
                }, function (res) {
                    $log.info("create route fail", res);
                });


            }

            $scope.showdiploma = function (idx) {
                //$scope.tlsroutes[idx].spec.zhengshu
                diploma.open($scope.tlsroutes[idx]).then(function () {

                })
            }

            function readSingleFile(e, name) {
                //alert(1111)
                var thisfilename = document.getElementById(name).value;
                //console.log(this);
                if (thisfilename.indexOf('\\')) {
                    var arr = thisfilename.split('\\');
                    thisfilename = arr[arr.length - 1]
                }
                var file = e.target.files[0];
                if (!file) {
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (e) {
                    var content = e.target.result;

                    $scope.grid[name] = {key: thisfilename, value: content}
                    $scope.$apply();
                };
                reader.readAsText(file);
            };

            $scope.addzhengshu = function () {

                document.getElementById('zsfile').addEventListener('change', function (e) {
                    readSingleFile(e, 'zsfile')
                }, false);
            }

            $scope.addsy = function () {

                document.getElementById('syfile').addEventListener('change', function (e) {
                    readSingleFile(e, 'syfile')
                }, false);
            }

            $scope.addca = function () {

                document.getElementById('cafile').addEventListener('change', function (e) {
                    readSingleFile(e, 'cafile')
                }, false);
            }

            $scope.addmca = function () {

                document.getElementById('mcafile').addEventListener('change', function (e) {
                    readSingleFile(e, 'mcafile')
                }, false);
            }

            $scope.invalid = {};

            $scope.envs = [];

            //$scope.createdcerr = false;

            $scope.containerTpl = {
                name: "",
                image: "",    //imageStreamTag
                //ports: [{protocol: ""}],
                "env": [],

                "resources": {},
                "imagePullPolicy": "Always",
                isimageChange: true,
                secretsobj: {
                    secretarr: []
                    ,
                    configmap: []
                    ,
                    persistentarr: []

                }
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
//Route
            $scope.route = {
                "kind": "Route",
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
                    "host": "",
                    "to": {
                        "kind": "Service",
                        "name": ""
                    },
                    "port": {
                        "targetPort": ""
                    },
                    "tls": {}
                }
            };
            // 仓库镜像时需要先获取该数据添加到imagePullSecrets字段中
            var getserviceaccounts = function () {
                serviceaccounts.get({namespace: $rootScope.namespace}, function (res) {
                    $scope.serviceas = res
                    console.log('----------------------', res);
                })
            }

            getserviceaccounts();
            // 判断从镜像仓库跳转过来时属于哪种镜像
            var initContainer = function () {
                if ($stateParams.image) {

                    // console.log("$stateParams.image", $stateParams.image);
                    // console.log("initContainer", $scope.dc.spec.template.spec.containers.tag);
                    // if (!$scope.dc.spec.template.spec.containers.tag) {
                    //   $scope.named=$stateParams.image.metadata.name;
                    // }
                    console.log("initContainer", $stateParams.image);

                    if ($stateParams.image.metadata) {
                        var container = angular.copy($scope.containerTpl);
                        container.image = $stateParams.image.metadata.name;
                        console.log($stateParams.image.metadata.name)
                        if ($stateParams.image.tag) {
                            container.tag = $stateParams.image.tag.name;

                        }

                        // console.log($stateParams.image.metadata.name.split(':')[1]);
                        container.tag = $stateParams.image.metadata.name.split(':')[1];
                        container.strname = container.name = $stateParams.image.metadata.name.split(':')[0]
                        container.ports = [];
                        var exposedPorts = $stateParams.image.image.dockerImageMetadata.Config.ExposedPorts;
                        if (!$stateParams.image.image.dockerImageMetadata.Config.ExposedPorts) {
                            //container.ports.push({
                            //  containerPort: "",
                            //  hostPort: "",
                            //  protocol: "",
                            //})
                            $scope.portsArr = [
                                {
                                    containerPort: "",
                                    hostPort: "",
                                    protocol: ""
                                }
                            ]
                        } else {
                            $scope.portsArr = []
                        }
                        for (var k in exposedPorts) {
                            var arr = k.split('/');
                            if (arr.length == 2) {
                                var val = arr[1].toUpperCase()
                                $scope.portsArr.push({
                                    containerPort: parseInt(arr[0]),
                                    hostPort: parseInt(arr[0]),
                                    protocol: val,
                                    //open: true
                                });
                            }
                        }
                        // $scope.dc.spec.template.spec.containers[0].name=$stateParams.image.metadata.name.split(':')[0]

                        $scope.dc.spec.template.spec.containers.push(container);
                        $scope.invalid.containerLength = false;
                    } else {
                        var imagetag = '';
                        console.log('私有镜像', $stateParams.ports);
                        //  私有镜像
                        if ($stateParams.image.indexOf('@') != -1) {
                            console.log($stateParams.image)
                            var arr = $stateParams.image.split("@");
                            console.log(arr)
                            var container = angular.copy($scope.containerTpl);
                            container.image = arr[0] + "@" + arr[1];
                            container.tag = arr[2];
                            container.truename = arr[3];
                            container.strname = container.name = arr[3];
                            $scope.grid.imageChange = true;
                            container.isimageChange = true;
                            container.isshow = true;
                            $scope.grid.isimageChange = true;
                            imagetag = 'dadafoundry.io/image-' + container.name;
                            container.triggerImageTpl = {
                                "type": "ImageChange",
                                "imageChangeParams": {
                                    "automatic": true,
                                    "containerNames": [
                                        container.name          //todo 高级配置,手动填充
                                    ],
                                    "from": {
                                        "kind": "ImageStreamTag",
                                        "name": arr[3] + ":" + container.tag  //ruby-hello-world:latest
                                    }
                                }
                            };
                            $scope.dc.metadata.annotations[imagetag] = arr[3] + ":" + arr[2];
                            $scope.portsArr = []
                            if ($stateParams.ports.length > 0) {
                                var arr = angular.copy($stateParams.ports)
                                angular.forEach(arr, function (port, i) {

                                    var strarr = port.split('/');
                                    var val = strarr[1].toUpperCase();
                                    $scope.portsArr.push({
                                        containerPort: strarr[0],
                                        hostPort: strarr[0],
                                        protocol: val,
                                    });
                                })

                            }

                        } else {
                            // 公共镜像
                            var container = angular.copy($scope.containerTpl);
                            var arrtest = $stateParams.image.split(':');
                            if (arrtest.length > 2) {
                                $scope.grid.imagePullSecrets = true;
                                $scope.dc.spec.template.spec.imagePullSecrets = [
                                    {
                                        "name": "registry-dockercfg-" + $rootScope.user.metadata.name
                                    }
                                ]
                            }
                            container.image = 'registry.dataos.io/' + $stateParams.image.split(':')[0];
                            container.tag = $stateParams.image.split(':')[1];
                            container.strname = container.name = $stateParams.image.split(':')[0].replace('/', '-');
                            container.truename = $stateParams.image.split(':')[0].replace('/', '-');
                            $scope.grid.imageChange = false;
                            container.isimageChange = false;
                            container.isshow = false;
                            $scope.grid.isimageChange = false;
                            imagetag = 'dadafoundry.io/image-' + container.name;
                            container.triggerImageTpl = {
                                "type": "ImageChange",
                                "imageChangeParams": {
                                    "automatic": true,
                                    "containerNames": [
                                        container.name          //todo 高级配置,手动填充
                                    ],
                                    "from": {
                                        "kind": "ImageStreamTag",
                                        "name": container.truename + ":" + container.tag  //ruby-hello-world:latest
                                    }
                                }
                            };
                            $scope.dc.metadata.annotations[imagetag] = container.truename + ":" + $stateParams.image.split(':')[1];
                            $scope.portsArr = []
                        }


                        $scope.dc.spec.template.spec.containers.push(container);
                        $scope.invalid.containerLength = false;
                    }
                }
            };

            initContainer();

            $scope.containerModal = function (idx) {
                var o = $scope.pods.items[idx];
                ContainerModal.open(o);
            };
            //  添加容器
            $scope.addContainer = function () {
                console.log("addContainer");
                $scope.dc.spec.template.spec.containers.push(angular.copy($scope.containerTpl));
                $scope.invalid.containerLength = false;
            };
            // 删除容器
            $scope.rmContainer = function (idx) {
                //console.log("rmContainer");
                $scope.dc.spec.template.spec.containers.splice(idx, 1);

                $scope.portsArr = [];
                //路由端口需清空
                $scope.grid.port = '端口';
                //console.log('$scope.dc.spec.template.spec.containers', $scope.dc.spec.template.spec.containers);
                angular.forEach($scope.dc.spec.template.spec.containers, function (ports, i) {
                    if (ports.port) {
                        angular.forEach(ports.port, function (port, k) {
                            var strarr = port.split('/');
                            var val = strarr[1].toUpperCase();
                            $scope.portsArr.push({
                                containerPort: strarr[0],
                                hostPort: strarr[0],
                                protocol: val,
                                //open: true
                            });
                        })
                    }

                })
                isConflict();
            };

            //  获取dc列表,用于在创建dc时验证dc名称是否重复
            var serviceNameArr = [];
            
            var loadDcList = function () {
                DeploymentConfig.get({namespace: $rootScope.namespace}, function (data) {
                    for (var i = 0; i < data.items.length; i++) {
                        serviceNameArr.push(data.items[i].metadata.name);
                    }
                    serviceNameArr.sort();
                    $scope.grid.namerepeat=true;
                    //console.log('serviceNameArr',serviceNameArr);

                }, function (res) {
                    $log.info('loadDcList', res);
                    //todo ������
                });
            }

            loadDcList();



            $scope.$watch('dc.metadata.name', function (n,o) {
                if (n == o) {
                    return
                }
                var r = /^[a-z][-a-z0-9]*[a-z0-9]$/;
                if (!r.test(n)) {
                    $scope.grid.rexnameerr = true; 
                }else {
                    $scope.grid.rexnameerr = false;
                }
                if ($scope.grid.namerepeat) {
                    var repeat=false;
                    angular.forEach(serviceNameArr, function (item,i) {
                        if (!repeat) {
                            if (item===n) {
                                repeat=true;
                            }
                        }

                    })
                    if (!repeat) {

                        $scope.grid.servicenameerr=false;
                    }else {
                        $scope.grid.servicenameerr=true;
                    }
                }
                
            })
            // 验证dc名称规范
            
            //$scope.serviceNamekedown = function () {
            //    for (var i = 0; i < serviceNameArr.length; i++) {
            //        if (serviceNameArr[i] == $scope.dc.metadata.name) {
            //            $scope.grid.createdcerr = true;
            //            break;
            //        } else {
            //            $scope.grid.createdcerr = false;
            //            $scope.grid.isserviceName = false;
            //        }
            //    }
            //    if (!$scope.dc.metadata.name) {
            //        $scope.grid.isserviceName = true;
            //        $scope.grid.createdcerr = false;
            //    }
            //}
            // 验证dc名称规范
            //$scope.checknames = function () {
            //    var r = /^[a-z][-a-z0-9]*[a-z0-9]$/; // 不能以数字开头,有小写字母跟数字组成;
            //    //console.log('!r.test($scope.dc.metadata.name)', !r.test($scope.dc.metadata.name))
            //    if (!r.test($scope.dc.metadata.name)) {
            //        $scope.grid.servicenameerr = true;
            //    } else if ($scope.dc.metadata.name.length < 2 || $scope.dc.metadata.name.length > 24) {
            //        $scope.grid.servicenameerr = true;
            //    } else {
            //        $scope.grid.servicenameerr = false;
            //    }
            //}
            // 获取后端服务列表
            var loadBsi = function (dc) {
                BackingServiceInstance.get({namespace: $rootScope.namespace}, function (res) {
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

                }, function (res) {
                    //todo 错误处理
                    $log.info("loadBsi err", res);
                });
            };

            loadBsi();

            //////获取密钥列表
            //var loadsecretsList = function(){
            //  secretskey.get({namespace:$rootScope.namespace},function(res){
            //    console.log('-------loadsecrets',res);
            //    if(res.items){
            //        $scope.loadsecretsitems = res.items;
            //    }
            //  })
            //}
            //loadsecretsList();
            //   添加挂载卷


            var cintainersidx;
            //$scope.secretsobj = {
            //
            //    secretarr : []
            //  ,
            //
            //    configmap : []
            //  ,
            //
            //    persistentarr : []
            //
            //}
            $scope.addVolume = function (idx) {
                var olength = 0;
                if ($scope.dc.spec.template.spec.volumes) {
                    olength = $scope.dc.spec.template.spec.volumes.length;
                }
                cintainersidx = idx;
                ChooseSecret.open(olength, $scope.dc.spec.template.spec.containers[idx].secretsobj).then(function (volumesobj) {
                    console.log('------------------------', volumesobj);
                    $scope.dc.spec.template.spec.containers[idx].volumeMounts = volumesobj.arr2;
                    $scope.dc.spec.template.spec.volumes = $scope.dc.spec.template.spec.volumes.concat(volumesobj.arr1);
                    $scope.dc.spec.template.spec.containers[idx].secretsobj = volumesobj.arr3
                }, function (close) {
                    console.log(close);
                    if (close == 'cancel') {
                        $scope.dc.spec.template.spec.containers[idx].volumeMounts = [];
                        $scope.dc.spec.template.spec.volumes = [];
                        $scope.dc.spec.template.spec.containers[idx].secretsobj = [];
                    }
                });
            }


            //$scope.addEnv = function (name, idx, last) {
            //  if (last) {     //添加
            //    $scope.envs.push({name: '', value: ''});
            //  } else {
            //    for (var i = 0; i < $scope.envs.length; i++) {
            //      if ($scope.envs[i].name == name) {
            //        $scope.envs.splice(i, 1);
            //      }
            //    }
            //  }
            //};
            $scope.delEnv = function (idx) {
                //if (last) {     //添加
                //  $scope.envs.push({name: '', value: ''});
                //} else {
                //  for (var i = 0; i < $scope.envs.length; i++) {
                //    if ($scope.envs[i].name == name) {
                $scope.envs.splice(idx, 1);
                //    }
                //  }
                //}
            };

            $scope.addEnv = function () {
                $scope.envs.push({name: '', value: ''});
            }
            //// 选择镜像节流阀
            $scope.chooesimage = false;

            $scope.selectImage = function (idx) {

                if (!$scope.chooesimage) {
                    $scope.chooesimage = true;
                    var container = $scope.dc.spec.template.spec.containers[idx];
                    //console.log('container2',container);
                    var cons = $scope.dc.spec.template.spec.containers;
                    ImageSelect.open().then(function (res) {
                        //console.log("imageStreamTag2", res);
                        var imagetag = '';
                        container.ports = [];
                        if (container.ports.length == 0) {
                            container.ports.push({
                                containerPort: '',
                                hostPort: '',
                                protocol: '',
                                //open: true
                            })
                        }
                        if (res.ispublicimage) {
                            /////公共镜像
                            container.isimageChange = false;
                            container.isshow = false;
                            var str1 = res.imagesname.split("/");
                            var strname1 = str1[0] + '/' + str1[1];
                            container.truename = strname1.replace('/', "-");
                            container.image = 'registry.dataos.io/' + str1[0] + '/' + str1[1] + ':' + str1[2];
                            var olsname = strname1.replace('/', "-");
                            if (idx > 0) {
                                for (var i = 0; i < cons.length; i++) {
                                    if (i != idx) {
                                        if (container.name && cons[i].name == container.name) {
                                            strname1 = str1[0] + '/' + str1[1] + idx;
                                        }
                                    }
                                }
                            } else {
                                for (var i = 1; i < cons.length; i++) {
                                    if (container.name && cons[i].name == container.name) {
                                        strname1 = str1[0] + '/' + str1[1] + idx;
                                    }
                                }
                            }
                            container.strname = strname1.replace('/', "-");
                            if (!container.name) {
                                container.name = strname1.replace('/', "-");
                            }
                            container.tag = str1[2];
                            imagetag = 'dadafoundry.io/image-' + container.name;
                            ////仓库镜像
                            if (res.imagePullSecrets) {
                                container.imagePullSecrets = true;
                            } else {
                                delete container["imagePullSecrets"];
                            }
                            container.triggerImageTpl = {
                                "type": "ImageChange",
                                "imageChangeParams": {
                                    "automatic": true,
                                    "containerNames": [
                                        container.name          //todo 高级配置,手动填充
                                    ],
                                    "from": {
                                        "kind": "ImageStreamTag",
                                        "name": container.strname + ":" + container.tag  //ruby-hello-world:latest
                                    }
                                }
                            };
                            container.port=[]
                            $scope.dc.metadata.annotations[imagetag] = container.truename + ":" + str1[2];

                        } else {
                            // 私有镜像
                            //var dockerImageIP  = res.image.dockerImageReference.split('@');
                            container.isimageChange = true;
                            container.isshow = true;
                            delete container["imagePullSecrets"];
                            var str = res.metadata.name.split(":");
                            //container.image = dockerImageIP[0]+':'+str[1];
                            container.image = res.image.dockerImageReference;
                            var strname = str[0];
                            container.truename = str[0];
                            if (idx > 0) {
                                for (var i = 0; i < cons.length; i++) {
                                    if (i != idx) {
                                        if (container.name && cons[i].name == container.name) {
                                            strname = str[0] + idx
                                            container.name = strname;
                                        }
                                    }

                                }
                            } else {
                                for (var i = 1; i < cons.length; i++) {
                                    if (container.name && cons[i].name == container.name) {
                                        strname = str[0] + idx
                                        container.name = strname;
                                    }
                                }
                            }
                            container.strname = strname;
                            if (!container.name) {
                                container.name = strname;
                            }
                            //container.name = strname;
                            container.tag = str[1];
                            imagetag = 'dadafoundry.io/image-' + container.name;

                            container.triggerImageTpl = {
                                "type": "ImageChange",
                                "imageChangeParams": {
                                    "automatic": true,
                                    "containerNames": [
                                        container.name          //todo 高级配置,手动填充
                                    ],
                                    "from": {
                                        "kind": "ImageStreamTag",
                                        "name": container.truename + ":" + container.tag  //ruby-hello-world:latest
                                    }
                                }
                            };
                            $scope.dc.metadata.annotations[imagetag] = str[0] + ":" + str[1];
                            if (res.image.dockerImageMetadata.Config.Labels) {
                                container.ref = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref'];
                                container.commitId = res.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'];
                            }

                            container.port = [];
                            angular.forEach(res.image.dockerImageMetadata.Config.ExposedPorts, function (item, i) {
                                container.port.push(i)
                            })

                        }

                        $scope.portsArr = [];
                        //路由端口需清空
                        $scope.grid.port = '端口';
                        //console.log($scope.dc.spec.template.spec.containers);
                        //console.log('$scope.dc.spec.template.spec.containers', $scope.dc.spec.template.spec.containers);
                        angular.forEach($scope.dc.spec.template.spec.containers, function (ports, i) {
                            if (ports.port) {
                                angular.forEach(ports.port, function (port, k) {
                                    var strarr = port.split('/');
                                    var val = strarr[1].toUpperCase();
                                    $scope.portsArr.push({
                                        containerPort: strarr[0],
                                        hostPort: strarr[0],
                                        protocol: val,
                                        //open: true
                                    });
                                })
                            }
                            //delete $scope.dc.spec.template.spec.containers[i].port
                        })


                        var conlength = $scope.dc.spec.template.spec.containers
                        for (var i = 0; i < conlength.length; i++) {
                            if (conlength[i].isimageChange == false) {
                                $scope.grid.isimageChange = false;
                                $scope.grid.imageChange = false;
                                break;
                            } else {
                                $scope.grid.isimageChange = true;
                                $scope.grid.imageChange = true;
                            }
                        }
                        //console.log('_+_+_+_+_+_+',$scope.dc);
                        $scope.chooesimage = false;
                    }, function (close) {
                        if (close == 'cancel') {
                            $scope.chooesimage = false;
                        }
                    });
                }


            };

            $scope.updatePorts = function () {
                $scope.grid.ports = [];
                //angular.forEach($scope.dc.spec.template.spec.containers, function (item) {
                //console.log('tpc端口',$scope.portsArr);
                angular.forEach($scope.portsArr, function (port) {
                    if ($scope.grid.ports.indexOf(port.hostPort) == -1 && port.protocol == "TCP") {
                        $scope.grid.ports.push(port.hostPort);
                    }
                });
                //});
            };
            //
            var isConflict = function () {
                console.log($scope.portsArr)
                var conflict = false;
                var serviceConflict = false;
                for (var i = 0; i < $scope.portsArr.length; i++) {
                    $scope.portsArr[i].conflict = false;
                    $scope.portsArr[i].serviceConflict = false;
                }
                //var containers = $scope.portsArr;
                //for (var i = 0; i < containers.length; i++) {
                var ports = $scope.portsArr;
                for (var j = 0; j < ports.length; j++) {
                    conflict = portConflict(ports[j].containerPort, j, 'containerPort');
                    serviceConflict = portConflict(ports[j].hostPort, j, 'hostPort');
                    console.log(conflict, j)
                    if (conflict) {
                        for (var k = 0; k < conflict.length; k++) {
                            ports[conflict[k]].conflict = true
                        }
                        ports[j].conflict = true;
                    }

                    if (serviceConflict) {
                        for (var k = 0; k < serviceConflict.length; k++) {
                            ports[serviceConflict[k]].serviceConflict = true
                        }
                        ports[j].serviceConflict = true;
                    }


                    if (ports[j].containerPort && ports[j].hostPort) {
                        $scope.grid.servicepot = false;
                        $scope.grid.conflict = conflict;
                        $scope.grid.serviceConflict = serviceConflict;
                        if (j == ports.length - 1) {
                            return conflict || serviceConflict;
                        }
                    } else if (!ports[j].containerPort && !ports[j].containerPort) {
                        return false
                    } else {

                        $scope.grid.servicepot = true;
                        return true
                    }
                }
                //}


                // console.log('ports', ports.containerPort)
                // return conflict || serviceConflict;
            };

            var portConflict = function (port, y, tp) {
                var ports = $scope.portsArr;
                var arr = [];
                for (var j = 0; j < ports.length; j++) {
                    if (j != y) {
                        if (tp == 'containerPort' && ports[j].containerPort == port) {
                            arr.push(j)
                        }
                        if (tp == 'hostPort' && ports[j].hostPort == port) {
                            arr.push(j)
                        }
                    }
                    if (j == ports.length - 1) {
                        if (arr.length > 0) {
                            return arr;
                        }
                    }
                }

                return false;
            };

            $scope.jump = function (d) {
                var i;
                for (i = 0; i < $scope.envs.length; i++) {
                    if ($scope.envs[i].name == '' || $scope.envs[i].value == '') {
                        $scope.checkEnv = true;
                        return;
                    }
                }

                if ($scope.grid.isserviceName || $scope.grid.createdcerr || $scope.grid.servicenameerr) {
                    return;
                }
                if (!valid($scope.dc)) {
                    return;
                }
                if (!prepareport()) {
                    return;
                }

                $scope.grid.checked = d;
                window.scrollTo(0, 0);
                for (var i = 0; i < $scope.portsArr.length; i++) {
                    $scope.portsArr[i].conflict = false;
                    $scope.portsArr[i].serviceConflict = false;
                }
                //var conlength = $scope.dc.spec.template.spec.containers;
                //for(var i = 0 ;i < conlength.length;i++ ){
                //  if(conlength[i].isimageChange == false){
                //    $scope.grid.isimageChange = false;
                //    return
                //  }else{
                //    $scope.grid.isimageChange = true;
                //    $scope.grid.imageChange = true;
                //  }
                //}
            };

            var prepareVolume = function (dc) {
                var containers = dc.spec.template.spec.containers;
                for (var i = 0; i < containers.length; i++) {
                    var container = containers[i];
                    if (container.volumeMounts && container.volumeMounts.length == 0) {
                        delete container["volumeMounts"];
                    }
                }
                if (dc.spec.template.spec.volumes.length == 0) {
                    delete dc.spec.template.spec["volumes"];
                }
            };

            var prepareTrigger = function (dc) {
                //var triggers = [];
                if ($scope.grid.configChange) {
                    dc.spec.triggers.push({type: 'ConfigChange'});
                }
                //console.log($scope.grid.imageChange)
                //console.log($scope.grid.isimageChange)
                //if ($scope.grid.imageChange && $scope.grid.isimageChange) {
                //  var containers = dc.spec.template.spec.containers;
                //  for (var i = 0; i < containers.length; i++) {
                //    var match = containers[i].truename+":"+containers[i].tag;
                //   console.log('match....',match)
                //    triggers.push({
                //      type: 'ImageChange',
                //      imageChangeParams: {
                //        "automatic": true,
                //        "containerNames": [containers[i].name],
                //        "from": {
                //          "kind": "ImageStreamTag",
                //          "name": match
                //        }
                //      }
                //    });
                //  }
                //}
                //dc.spec.triggers = triggers;
                //console.log(' dc.spec.triggers',dc.spec.triggers);
            };

            var bindService = function (dc) {
                angular.forEach($scope.bsi.items, function (bsi) {
                    var bindObj = {
                        metadata: {
                            name: bsi.metadata.name,
                            annotations: {
                                "dadafoundry.io/create-by": $rootScope.user.metadata.name
                            }
                        },
                        resourceName: dc.metadata.name,
                        bindResourceVersion: '',
                        bindKind: 'DeploymentConfig'
                    };

                    if (bsi.bind) {  //未绑定设置为绑定
                        BackingServiceInstance.bind.create({
                            namespace: $rootScope.namespace,
                            name: bsi.metadata.name
                        }, bindObj, function (res) {
                            $log.info("bind service success", res);
                        }, function (res) {
                            $log.info("bind service fail", res);
                        });
                    }
                });
            };
            // 创建服务
            var createService = function (dc) {

                prepareService($scope.service, dc);
                var ps = [];
                if ($scope.portsArr) {
                    var ports = $scope.portsArr;
                    for (var j = 0; j < ports.length; j++) {
                        //if (!ports[j].open) {
                        //  continue;
                        //}
                        if (ports[j].hostPort) {
                            var val = ports[j].protocol.toUpperCase()
                            ps.push({
                                name: ports[j].hostPort + '-' + ports[j].protocol.toLowerCase(),
                                port: parseInt(ports[j].hostPort),
                                protocol: val,
                                targetPort: parseInt(ports[j].containerPort)
                            });
                        }
                    }
                }
                if (ps.length > 0) {
                    $scope.service.spec.ports = ps;
                } else {
                    $scope.service.spec.ports = null;
                }
                //$log.info('$scope.service0-0-0-0-', $scope.service.spec.ports);
                Service.create({namespace: $rootScope.namespace}, $scope.service, function (res) {
                    $log.info("create service success", res);
                    $scope.service = res;

                    //if ($scope.grid.route) {
                    //  createRoute(res);
                    //}
                    //$state.go('console.service_detail', {name: dc.metadata.name});
                }, function (res) {
                    $log.info("create service fail", res);
                    $state.go('console.service_detail', {name: dc.metadata.name});
                });
            };

            var prepareService = function (service, dc) {
                service.metadata.name = dc.metadata.name;
                service.metadata.labels.app = dc.metadata.name;
                service.spec.selector.app = dc.metadata.name;
                service.spec.selector.deploymentconfig = dc.metadata.name;
            };

            var prepareDc = function (dc) {
                var name = dc.metadata.name;
                dc.metadata.labels.app = name;
                dc.spec.selector.app = name;
                dc.spec.selector.deploymentconfig = name;
                dc.spec.template.metadata.labels.app = name;
                dc.spec.template.metadata.labels.deploymentconfig = name;
            };

            var prepareEnv = function (dc) {
                var containers = dc.spec.template.spec.containers;
                var reg = new RegExp(/^[a-zA-Z_]+[a-zA-Z0-9_]*$/gi);
                for (var i = 0; i < containers.length; i++) {

                    var thisenv = angular.copy($scope.envs);
                    for (var k = 0; k < $scope.envs.length; k++) {
                        if (!$scope.envs[k].name) {
                            thisenv.splice(k, 1);
                        }
                    }
                    containers[i].env = thisenv;
                    //console.log(containers[i]);
                    for (var j = 0; j < containers[i].env.length; j++) {
                        if (reg.test(containers[i].env[j].name) == false) {
                            $scope.checkEnv = true;
                            return false;
                        }
                    }

                }
            };

            var prepareRoute = function (route, service) {
                route.metadata.name = service.metadata.name;
                route.metadata.labels.app = service.metadata.name;
                route.spec.host = $scope.grid.host + $scope.grid.suffix;
                route.spec.to.name = service.metadata.name;
                route.spec.port.targetPort = $scope.grid.port + '-tcp';
            };
            // 创建路由
            var createRoute = function (service) {
                prepareRoute($scope.route, service);
                //alert(111)
                console.log('route', $scope.grid);
                if ($scope.grid.tlsset == 'Passthrough') {
                    $scope.route.spec.tls.termination = $scope.grid.tlsset;

                } else if ($scope.grid.tlsset == 'Edge') {
                    $scope.route.spec.tls.termination = $scope.grid.tlsset;
                    $scope.route.spec.tls.insecureEdgeTerminationPolicy = $scope.grid.httpset;
                    if ($scope.grid.zsfile.value) {
                        $scope.route.spec.tls.certificate = $scope.grid.zsfile.value
                    }
                    if ($scope.grid.syfile.value) {
                        $scope.route.spec.tls.key = $scope.grid.syfile.value
                    }
                    if ($scope.grid.cafile.value) {
                        $scope.route.spec.tls.caCertificate = $scope.grid.cafile.value
                    }
                } else if ($scope.grid.tlsset == 'Re-encrypt') {
                    $scope.route.spec.tls.termination = $scope.grid.tlsset;
                    if ($scope.grid.zsfile.value) {
                        $scope.route.spec.tls.certificate = $scope.grid.zsfile.value
                    }
                    if ($scope.grid.syfile.key) {
                        $scope.route.spec.tls.key = $scope.grid.syfile.value
                    }
                    if ($scope.grid.cafile.value) {
                        $scope.route.spec.tls.caCertificate = $scope.grid.cafile.value
                    }
                    if ($scope.grid.mcafile.value) {
                        $scope.route.spec.tls.destinationCACertificate = $scope.grid.mcafile.value
                    }
                } else {
                    delete $scope.route.spec.tls
                }

                Route.create({namespace: $rootScope.namespace}, $scope.route, function (res) {
                    $log.info("create route success", res);
                    $scope.route = res;
                }, function (res) {
                    $log.info("create route fail", res);
                });
            };

            var valid = function (dc) {
                console.log('dc', dc);
                var containers = dc.spec.template.spec.containers;
                if (!containers.length) {

                    $scope.invalid.containerLength = true;
                    return false;
                }

                for (var i = 0; i < containers.length; i++) {
                    if (!containers[i].strname) {
                        containers[i].emptyName = true;
                        return false;
                    }
                    if (!containers[i].image) {
                        containers[i].emptyImage = true;
                        return false;
                    }
                }

                if (isConflict()) {
                    return false;
                }
                return true;
            };
            //  删除同名服务,创建dc之前执行该方法
            var deleService = function () {
                Service.delete({namespace: $rootScope.namespace, name: $scope.dc.metadata.name}, function (res) {
                    console.log("deleService-yes", res);
                }, function (res) {
                    console.log("deleService-no", res);
                })
            }
            //  删除同名路由,创建dc之前执行该方法
            var deleRoute = function () {
                Route.delete({namespace: $rootScope.namespace, name: $scope.dc.metadata.name}, function (res) {
                    console.log("deleRoute-yes", res);
                }, function (res) {
                    console.log("deleRoute-no", res);
                })
            }

            /////验证环境变量
            var prepareport = function () {
                var createports = true;
                if ($scope.portsArr) {
                    for (var j = 0; j < $scope.portsArr.length; j++) {
                        if ($scope.portsArr[j].hostPort && $scope.portsArr[j].protocol && $scope.portsArr[j].containerPort) {
                            if ($scope.portsArr[j].containerPort || $scope.portsArr[j].hostPort) {
                                if ($scope.portsArr[j].containerPort < 1 || $scope.portsArr[j].containerPort > 65535 || $scope.portsArr[j].hostPort < 1 || $scope.portsArr[j].hostPort > 64435) {
                                    createports = false;
                                    $scope.grid.ervicepoterr = true;
                                }
                            }
                        } else if (!$scope.portsArr[j].hostPort && !$scope.portsArr[j].containerPort && !$scope.portsArr[j].protocol) {
                            createports = true;
                        } else {
                            createports = false;
                            $scope.grid.servicepoterr = true;
                            // console.log("33333");
                        }
                    }
                }
                return createports;
            }

            // 创建dc
            $scope.createDc = function () {

                angular.forEach($scope.dc.spec.template.spec.containers, function (ports, i) {
                    if (ports.port) {
                        delete $scope.dc.spec.template.spec.containers[i].port
                    }

                })
                //console.log('$scope.dc', $scope.dc);
                var i;
                for (i = 0; i < $scope.envs.length; i++) {
                    if ($scope.envs[i].name == '' || $scope.envs[i].value == '') {
                        $scope.checkEnv = true;
                        return;
                    }
                }

                if ($scope.grid.isserviceName || $scope.grid.createdcerr || $scope.grid.servicenameerr) {
                    return;
                }
                if (!valid($scope.dc)) {
                    return;
                }

                //$rootScope.lding = true;
                var dc = angular.copy($scope.dc);
                //console.log('xiugaiDC--------------------------',dc);
                //for(var i = 0 ;i < dc.spec.template.spec.containers.length;i++ ){
                //  if(dc.spec.template.spec.containers[i].isimageChange == false){
                //    $scope.grid.isimageChange = false;
                //    break;
                //  }else{
                //    $scope.grid.isimageChange = true;
                //  }
                //}

                var cons = angular.copy($scope.dc.spec.template.spec.containers);
                var flog = 0;
                for (var i = 0; i < dc.spec.template.spec.containers.length; i++) {
                    //$scope.dc.spec.template.spec.containers[i].name = dc.spec.template.spec.containers[i].strname;
                    delete dc.spec.template.spec.containers[i]["strname"];
                    if (dc.spec.template.spec.containers[i].isimageChange) {
                        //console.log('111111111111');
                        dc.spec.triggers.push(dc.spec.template.spec.containers[i].triggerImageTpl)
                    }
                    if (cons[i].ports) {
                        var testlength = cons[i].ports.length;
                        for (var k = 0; k < testlength; k++) {
                            if (!cons[i].ports[k].containerPort) {
                                cons[i].ports.splice(k, 1);
                                k--;
                                testlength--;
                            } else {
                                cons[i].ports[k].name = cons[i].ports[k].protocol + "-" + cons[i].ports[k].containerPort;
                                cons[i].ports[k].protocol = cons[i].ports[k].protocol.toUpperCase()
                            }
                        }
                    }

                    dc.spec.template.spec.containers[i].ports = cons[i].ports;
                }
                prepareDc(dc);
                prepareVolume(dc);
                prepareTrigger(dc);
                prepareEnv(dc);

                //if (!$scope.grid.auto) {
                //  dc.spec.replicas = 0;
                //}
                console.log(prepareport());
                if (prepareport() == false) {
                    return;
                }

                deleService();
                deleRoute();
                var clonedc = angular.copy(dc);
                var arrimgs = [];
                var arrisshow = [];
                for (var i = 0; i < clonedc.spec.template.spec.containers.length; i++) {
                    arrisshow.push(clonedc.spec.template.spec.containers[i].isshow);
                    delete clonedc.spec.template.spec.containers[i]["commitId"];
                    delete clonedc.spec.template.spec.containers[i]["triggerImageTpl"];
                    delete clonedc.spec.template.spec.containers[i]["secretsobj"];
                    delete clonedc.spec.template.spec.containers[i]["truename"];
                    delete clonedc.spec.template.spec.containers[i]["ref"];
                    delete clonedc.spec.template.spec.containers[i]["tag"];
                    delete clonedc.spec.template.spec.containers[i]["isshow"];
                    arrimgs.push(clonedc.spec.template.spec.containers[i].isimageChange);
                    delete clonedc.spec.template.spec.containers[i]["isimageChange"];
                    if (clonedc.spec.template.spec.containers[i].ports) {
                        delete clonedc.spec.template.spec.containers[i]["ports"];
                    }
                    if (clonedc.spec.template.spec.containers[i].env.length == 0) {
                        delete clonedc.spec.template.spec.containers[i]["env"];
                    }
                    if (clonedc.spec.template.spec.containers[i].imagePullSecrets) {
                        $scope.grid.imagePullSecrets = true;
                        var flog = true;
                        var imgps = [
                            {
                                "name": "registry-dockercfg-" + $rootScope.user.metadata.name
                            }
                        ]
                        angular.forEach($scope.serviceas.imagePullSecrets, function (v, k) {
                            if (v.name == imgps[0].name) {
                                flog = false;
                            }
                        })
                        if (flog) {
                            clonedc.spec.template.spec.imagePullSecrets = imgps.concat($scope.serviceas.imagePullSecrets);
                        } else {
                            clonedc.spec.template.spec.imagePullSecrets = $scope.serviceas.imagePullSecrets;
                        }
                        delete clonedc.spec.template.spec.containers[i]["imagePullSecrets"];
                    }
                }
                if ($scope.grid.imagePullSecrets) {
                    var nameandps = localStorage.getItem("Auth");
                    var newnameandps = $base64.decode(nameandps);
                    var registryobjs = {
                        "registry.dataos.io": {
                            "auth": nameandps,
                            "email": "builder@registry.dataos.io",
                            "password": newnameandps.split(':')[1],
                            "username": newnameandps.split(':')[0]
                        }
                    }
                    registryobjs = JSON.stringify(registryobjs)
                    var isdockercfg = $base64.encode(registryobjs);
                } else {
                    delete dc.spec.template.spec["imagePullSecrets"];
                }
                var arrimgstr = arrimgs.join();
                arrisshow = arrisshow.join();
                clonedc.metadata.annotations["dadafoundry.io/imageorpublic"] = arrimgstr;
                clonedc.metadata.annotations["dadafoundry.io/imageorisshow"] = arrisshow;
                var isport = false;
                for (var i = 0; i < $scope.portsArr.length; i++) {
                    if ($scope.portsArr[i].hostPort) {
                        isport = true;
                        break;
                    }
                }
                if (isport) {
                    createService(dc);
                }
                if ($scope.grid.route) {
                    createRoute(dc);
                }
                var createDcfn = function () {
                    DeploymentConfig.create({namespace: $rootScope.namespace}, clonedc, function (res) {
                        $log.info("create dc success", res);
                        bindService(dc);
                        $state.go('console.service_detail', {name: dc.metadata.name, from: 'create'});
                    }, function (res) {
                        //todo 错误处理
                        $log.info("create dc fail", res);
                        if (res.status == 409) {
                            $scope.grid.createdcerr = true;
                        }
                    });
                }
                console.log('$scope.grid.imagePullSecrets-----', $scope.grid.imagePullSecrets)
                if ($scope.grid.imagePullSecrets) {
                    var secretsobj = {
                        "kind": "Secret",
                        "apiVersion": "v1",
                        "metadata": {
                            "name": "registry-dockercfg-" + $rootScope.user.metadata.name
                        },
                        "data": {
                            ".dockercfg": isdockercfg

                        },
                        "type": "kubernetes.io/dockercfg"

                    }

                    secretskey.create({namespace: $rootScope.namespace}, secretsobj, function (res) {
                        createDcfn();
                    }, function (res) {
                        if (res.status == 409) {
                            createDcfn();
                        }
                    })
                } else {
                    createDcfn();
                }


            };
        }]);
