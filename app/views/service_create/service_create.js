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
    .controller('ServiceCreateCtrl', ['imagestreamimports','ImageStreamImage','mytag','myimage','horizontalpodautoscalers', 'GLOBAL', 'resourcequotas', '$http', 'by', 'diploma', 'Confirm', 'Toast', '$rootScope', '$state', '$scope', '$log', '$stateParams', 'ImageStream', 'DeploymentConfig', 'ImageSelect', 'BackingServiceInstance', 'BackingServiceInstanceBd', 'ReplicationController', 'Route', 'Secret', 'Service', 'ChooseSecret', '$base64', 'secretskey', 'serviceaccounts', 'toastr',
        function (imagestreamimports,ImageStreamImage,mytag,myimage,horizontalpodautoscalers, GLOBAL, resourcequotas, $http, by, diploma, Confirm, Toast, $rootScope, $state, $scope, $log, $stateParams, ImageStream, DeploymentConfig, ImageSelect, BackingServiceInstance, BackingServiceInstanceBd, ReplicationController, Route, Secret, Service, ChooseSecret, $base64, secretskey, serviceaccounts, toastr) {
            $scope.advancedConfig = false;
            $scope.jump = function(){
                $scope.advancedConfig = true;
            }
            $scope.checked = {
                namespace: '',
                image: '',
                tag: ''
            }
            $scope.institution = {
                configregistry: false
            }
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
                env : {
                    null:false,
                    repeated: false,
                },
                label: {
                    null:false,
                    repeated: false,
                }

            }
            /////////有时间把每个注释加上，不然一脸懵逼。
            $scope.grid = {
                ports: [],
                port: 0,
                cname: '系统域名',
                host: '',
                noroute: false,
                quotamemory: null,
                quotacpu: null,
                zsfile: {},
                syfile: {},
                cafile: {},
                mcafile: {},
                namerepeat: false,
                rexnameerr: false,
                tlsshow: false,
                tlsset: 'None',
                httpset: 'Allow',
                suffix: '.' + $rootScope.namespace + GLOBAL.service_url,
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
                imagePullSecrets: false,
                volumerr: false,
                quota: true,
            };
            /////////有时间把每个注释加上，不然一脸懵逼。
            $scope.quota = {
                rubustCheck: false,
                doquota: false,
                //memunit: 'GB',
                //cpuunit: 'millcores',
                //cpu: null,
                //memory: null,
                cpu: {
                    request: {
                        cpuunit: 'millcores',
                        cpuquota: null
                    },
                    limit: {
                        cpuunit: 'millcores',
                        cpuquota: null
                    }
                },
                memory: {
                    request: {
                        memoryunit: 'MB',
                        memoryquota: null
                    },
                    limit: {
                        memoryunit: 'MB',
                        memoryquota: null
                    }
                }
            };
            $scope.istag = angular.copy(mytag)
            $scope.imageslist = [];
                $scope.tagslist = [];
                angular.forEach(myimage.items, function (image) {
                    //console.log('image.status.tags', image.status.tags);
                    if (image.status.tags) {
                        $scope.imageslist.push(image)
                    }
                });
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
                function imagetimemessage(imagestime) {
                    $scope.creattime = imagestime;
                }

                function imageportmessage(port) {
                    var port = port;
                    console.log('port', port);
                    $scope.port = []
                    $scope.strport = '';
                    for (var k in port) {
                        $scope.port.push({protocol: k.split('/')[1].toUpperCase(), containerPort: k.split('/')[0]})
                        $scope.strport += k.split('/')[0] + '/' + k.split('/')[1].toUpperCase() + ',';
                    }
                    $scope.strport = $scope.strport.replace(/\,$/, "")
                    $scope.hasport = true;
                    $scope.dc.spec.template.spec.containers[0].ports = angular.copy($scope.port)
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

                        var allsize = 0;
                        if (tag.image.dockerImageLayers&&tag.image.dockerImageLayers.length) {
                            angular.forEach(tag.image.dockerImageLayers, function (size, i) {
                                console.log('size.size', size.size);
                                allsize=allsize+size.size;
                            })
                        }
                        $scope.imagesize = Math.round(parseInt(allsize)/1024/1024* 100) / 100
                        console.log('size',$scope.imagesize);
                        imagetimemessage(tag.image.metadata.creationTimestamp)
                        if (tag.image.dockerImageMetadata.Config.ExposedPorts) {
                            imageportmessage(tag.image.dockerImageMetadata.Config.ExposedPorts)
                        }

                        $scope.curl = $scope.checked.image;
                        $scope.fuwuname = $scope.checked.image;
                        //tag.image.
                        angular.forEach($scope.istag.items, function (istag, i) {
                            if (istag.image.metadata.name === tag.image.metadata.name) {
                                //console.log(istag.image.dockerImageReference);
                                $scope.imagetext = istag.image.dockerImageReference;
                            }
                        })
                        $scope.showall = true;

                        //$scope.dc.metadata.labels[0].value =$scope.fuwuname ;

                    })
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
                        "strategy": {"resources": {}},
                        "triggers": [{
                            "type": "ConfigChange"
                        }
                        ],
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
                                    'env': [{name: '', value: ''}]
                                    //"ports": [{"containerPort": 8080, "protocol": "TCP"}]
                                },
                                    {
                                        "name": '',
                                        "image": '',
                                        'env': [{name: '', value: ''}]
                                        //"ports": [{"containerPort": 8080, "protocol": "TCP"}]
                                    }
                                ],
                                "resources": {}
                            }
                        }
                    },
                    "status": {}
                }
                $scope.find = function () {
                    $scope.err.url.null = false;
                    $scope.err.url.role = false;
                    $scope.err.url.notfind = false;
                        if ($scope.postobj.spec.images[0].from.name === '') {
                            $scope.err.url.null = true
                            return;
                        }
                        $scope.finding = true;
                        if ($scope.institution.configregistry) {
                            $scope.postobj.spec.images[0].importPolicy = {
                                insecure: true
                            };
                        }
                        $scope.postobj.spec.images[0].from.name = $scope.postobj.spec.images[0].from.name.replace(/^\s+|\s+$/g, "");
                        imagestreamimports.create({namespace: $rootScope.namespace}, $scope.postobj, function (images) {
                            $scope.finding = false;
                            var allsize = 0;
                            if (images.status.images[0].image.dockerImageLayers && images.status.images[0].image.dockerImageLayers.length) {
                                angular.forEach(images.status.images[0].image.dockerImageLayers, function (size, i) {

                                    allsize=allsize+size.size;
                                });
                            }
                            $scope.imagesize = Math.round(parseInt(allsize)/1024/1024* 100) / 100
                            if (images.status.images && images.status.images[0] && images.status.images[0].status) {
                                if (images.status.images[0].status.code && images.status.images[0].status.code === 401) {
                                    $scope.err.url.role = true;
                                    return;
                                }
                                if (images.status.images[0].status.code && images.status.images[0].status.code === 404) {
                                    $scope.err.url.notfind = true;
                                    return;
                                }
                                if (images.status.images[0].status.code && images.status.images[0].status.code === 500) {
                                    $scope.err.url.role = true;
                                    return;
                                }
                            }
                            $scope.images = images;
                            $scope.curl = $scope.postobj.spec.images[0].from.name;
                            var name = $scope.postobj.spec.images[0].from.name.split('/')[$scope.postobj.spec.images[0].from.name.split('/').length - 1]
                            $scope.fuwuname = name.split(':').length > 1 ? name.split(':')[0] : name;
                            $scope.tag = name.split(':').length > 1 ? name.split(':')[1] : 'latest';
                            $scope.imagetext = $scope.postobj.spec.images[0].from.name;
                            if (images.status.images[0] && images.status.images[0].image.dockerImageMetadata) {
                                imagetimemessage(images.status.images[0].image.dockerImageMetadata.Created)
                                if (images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts) {
                                    imageportmessage(images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts)
                                }
                            } else {

                            }
                            $scope.showall = true;

                            $scope.dc.metadata.labels[0].value =$scope.fuwuname ;
                        }, function (err) {
                            $scope.finding = false;
                        })

                };
                $scope.invalid = {};
                $scope.addContainer = function () {
                    //console.log("addContainer");
                    $scope.dc.spec.template.spec.containers.push(angular.copy($scope.containerTpl));

                    $scope.invalid.containerLength = false;
                };
                //// 选择镜像节流阀
                $scope.chooesimage = false;
                ///////更改镜像
                $scope.selectImage = function (idx) {
                    if (!$scope.chooesimage) {
                        $scope.chooesimage = true;
                        var container = $scope.dc.spec.template.spec.containers[idx];
                        //console.log('container2',container);
                        var cons = $scope.dc.spec.template.spec.containers;
                        ImageSelect.open().then(function (res) {
                            $scope.chooesimage = false;
                            console.log("imageStreamTag2", res);
                            var imagetag = '';
                            container.ports = [];
                            if (container.ports.length == 0) {
                                container.ports.push({
                                    containerPort: '',
                                    hostPort: '',
                                    protocol: ''
                                    //open: true
                                })
                            }
                            //选择镜像取消报错
                            container.emptyImage = false;
                            container.emptyName = false;
                            if (res.ispublicimage) {
                                /////公共镜像
                                container.isimageChange = false;
                                container.isshow = false;
                                var tag = res.imagesname.split("/")[res.imagesname.split("/").length - 1];
                                var strname1 = res.imagesname.split('/' + tag)[0];
                                container.truename = strname1.replace('/', "-");
                                container.image = GLOBAL.common_url + '/' + strname1 + ':' + tag;
                                container.yesimage = GLOBAL.common_url + '/' + strname1 + ':' + tag;
                                console.log('container.yesimage', container.yesimage);
                                var olsname = strname1.replace('/', "-");
                                if (idx > 0) {
                                    for (var i = 0; i < cons.length; i++) {
                                        if (i != idx) {
                                            if (container.name && cons[i].name == container.name) {
                                                strname1 = strname1 + idx;
                                            }
                                        }
                                    }
                                } else {

                                    for (var i = 1; i < cons.length; i++) {
                                        if (container.name && cons[i].name == container.name) {
                                            strname1 = strname1 + idx;
                                        }
                                    }
                                }
                                container.strname = strname1.replace('/', "-");
                                if (!container.name) {
                                    container.name = strname1.replace('/', "-");
                                }
                                container.tag = tag;
                                //container.tag = str1[2];
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
                                container.port = [];
                                $scope.dc.metadata.annotations[imagetag] = container.truename + ":" + tag;

                            } else {
                                // 私有镜像
                                //var dockerImageIP  = res.image.dockerImageReference.split('@');
                                console.log('imageres', res);
                                container.isimageChange = true;
                                container.isshow = true;
                                delete container["imagePullSecrets"];
                                var str = res.metadata.name.split(":");
                                //container.image = dockerImageIP[0]+':'+str[1];
                                container.image = res.image.dockerImageReference;

                                container.yesimage = res.image.dockerImageReference;
                                var strname = str[0];
                                container.truename = str[0];
                                if (idx > 0) {
                                    for (var i = 0; i < cons.length; i++) {
                                        if (i != idx) {
                                            if (container.name && cons[i].name == container.name) {
                                                strname = str[0] + idx;
                                                container.name = strname;
                                            }
                                        }

                                    }
                                } else {
                                    for (var i = 1; i < cons.length; i++) {
                                        if (container.name && cons[i].name == container.name) {
                                            strname = str[0] + idx;
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
                                });
                                $scope.portsArr = [];
                                //路由端口需清空
                                //$scope.grid.port = '端口';

                                //console.log($scope.dc.spec.template.spec.containers);
                                //console.log('$scope.dc.spec.template.spec.containers', $scope.dc.spec.template.spec.containers);
                                angular.forEach($scope.dc.spec.template.spec.containers, function (ports, i) {
                                    if (ports.port) {
                                        angular.forEach(ports.port, function (port, k) {
                                            var strarr = port.split('/');
                                            var val = strarr[1].toUpperCase();
                                            $scope.portsArr.push({
                                                containerPort: parseInt(strarr[0]),
                                                hostPort: parseInt(strarr[0]),
                                                protocol: val
                                                //open: true
                                            });
                                        })
                                    }
                                    //delete $scope.dc.spec.template.spec.containers[i].port
                                });
                                if ($scope.portsArr.length > 0) {
                                    if ($scope.portsArr[0] && $scope.portsArr[0].hostPort) {
                                        $scope.grid.port = $scope.portsArr[0].hostPort;
                                    }
                                }

                            }


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
            //  获取dc列表,用于在创建dc时验证dc名称是否重复
            $scope.serviceNameArr = [];

            var loadDcList = function () {
                DeploymentConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                    for (var i = 0; i < data.items.length; i++) {
                        $scope.serviceNameArr.push(data.items[i].metadata.name);
                    }
                    $scope.serviceNameArr.sort();
                    $scope.grid.namerepeat = true;
                    //console.log('serviceNameArr',$scope.serviceNameArr);

                }, function (res) {
                    $log.info('loadDcList', res);
                    //todo ������
                });
            };

            loadDcList();
            //////初始化端口数组
            $scope.portsArr = [];
            //////添加端口
            $scope.addprot = function () {
                $scope.portsArr.unshift({
                    containerPort: "",
                    protocol: "TCP",
                    hostPort: ""
                })
            };
            ////删除端口
            $scope.delprot = function (idx) {
                //console.log($scope.portsArr);
                if ($scope.portsArr[0] && $scope.portsArr[0].hostPort) {
                    $scope.grid.port = $scope.portsArr[0].hostPort;
                }

                $scope.portsArr.splice(idx, 1);
            };
        }]);
