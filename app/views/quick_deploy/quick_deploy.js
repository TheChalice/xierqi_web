'use strict';
angular.module('console.quick_deploy', [
        {
            files: [
                'components/searchbar/searchbar.js',
                'components/checkbox/checkbox.js',
                'views/quick_deploy/quick_deploy.css'
            ]
        }
    ])
    .controller('QuickDeployCtrl', ['mytag', 'ImageStreamImage', 'myimage', 'imagestreamimports', 'GLOBAL', 'resourcequotas', '$http', 'by', 'diploma', 'Confirm', 'Toast', '$rootScope', '$state', '$scope', '$log', '$stateParams', 'ImageStream', 'DeploymentConfig', 'ImageSelect', 'BackingServiceInstance', 'BackingServiceInstanceBd', 'ReplicationController', 'Route', 'Secret', 'Service',
        function (mytag, ImageStreamImage, myimage, imagestreamimports, GLOBAL, resourcequotas, $http, by, diploma, Confirm, Toast, $rootScope, $state, $scope, $log, $stateParams, ImageStream, DeploymentConfig, ImageSelect, BackingServiceInstance, BackingServiceInstanceBd, ReplicationController, Route, Secret, Service) {
            $scope.institution = {
                display: 1,
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
                env :{
                    null:false,
                    repeated: false,
                },
                label:{
                    null:false,
                    repeated: false, 
                }

            }

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
                            }],
                            "resources": {}
                        }
                    }
                },
                "status": {}
            }

            DeploymentConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                $scope.servelist = data;
                //console.log('scope.servelist', $scope.servelist);
            })

            $scope.$watch('fuwuname', function (n, o) {
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
                    $scope.showall=false
                    $scope.checked = {
                        namespace: '',
                        image: '',
                        tag: ''
                    }
                }
            })

            function dcname(n, image) {
                $scope.dc.metadata.name = n;
                $scope.dc.metadata.labels[0].value = n;
                $scope.dc.spec.selector.deploymentconfig = n;
                $scope.dc.spec.selector.app = n;
                $scope.dc.spec.template.metadata.labels.deploymentconfig = n;
                $scope.dc.spec.template.metadata.labels.app = n;
                $scope.dc.spec.template.spec.containers[0].name = n;
                if (image) {
                    $scope.dc.spec.template.spec.containers[0].image = image;
                }
            }

            var prepareService = function (service, dc) {
                service.metadata.name = $scope.fuwuname;
                service.metadata.labels.app = $scope.fuwuname;
                service.spec.selector.app = $scope.fuwuname;
                service.spec.selector.deploymentconfig = $scope.fuwuname;
            };

            function creatdc() {

                dcname($scope.fuwuname, $scope.imagetext)
                prepareLabel($scope.dc)
                prepareEnv($scope.dc)
                DeploymentConfig.get({
                    namespace: $rootScope.namespace,
                    region: $rootScope.region,
                    name: $scope.fuwuname
                }, function (data) {
                    //$scope.namerr.repeated = true;
                }, function (err) {
                    if (err.status === 404) {
                        DeploymentConfig.create({
                            namespace: $rootScope.namespace,
                            region: $rootScope.region
                        }, $scope.dc, function (res) {
                            $state.go('console.deploymentconfig_detail', {
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
                angular.forEach($scope.port, function (port, i) {
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
                    name: $scope.fuwuname
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
                    if (dc.metadata.name === $scope.fuwuname) {
                        norep = false

                    }
                })
                if (norep) {
                    return true
                } else {
                    return false
                }

            }
            function invEnv(){
                var envs=angular.copy($scope.dc.spec.template.spec.containers[0].env)
                angular.forEach(envs, function (env) {
                    
                })
            }
            $scope.createDc = function () {
                //console.log($scope.frm.serviceName.$error.pattern);
                if ($scope.frm.serviceName.$error.pattern) {
                    $scope.err.name.pattern = true;
                    return
                }
                console.log($scope.fuwuname);
                if (!$scope.fuwuname) {
                    $scope.err.name.null = true;
                    return
                }
                //console.log(invrepname());
                if (!invrepname()) {
                    $scope.err.name.repeated = true;
                    return
                }
                invEnv()


                if ($scope.hasport) {
                    createService($scope.dc)
                } else {
                    creatdc()
                }

            }
        }])
    .directive('createDeployment', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/quick_deploy/tpl/CreateDeployment.html',
            scope: false,
            controller: ['ImageStreamImage', '$scope', 'imagestreamimports', '$rootScope',
                function (ImageStreamImage, $scope, imagestreamimports, $rootScope) {
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

                    $scope.find = function () {
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
                                console.log('images', images);
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
                                $scope.tag = name.split(':').length > 1 ? name.split(':')[1] : 'latest';
                                $scope.imagetext = $scope.postobj.spec.images[0].from.name;

                                var imagetag = 'dadafoundry.io/image-' + $scope.postobj.spec.images[0].from.name;
                                $scope.dc.metadata.annotations[imagetag] = $scope.fuwuname + ":" + $scope.tag;
                                $scope.dc.metadata.annotations[imagetag] = $scope.fuwuname + ":" + $scope.tag;
                                if (images.status.images[0] && images.status.images[0].image.dockerImageMetadata) {
                                    imagetimemessage(images.status.images[0].image.dockerImageMetadata.Created)
                                    if (images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts) {
                                        //console.log('images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts', images.status.images[0].image.dockerImageMetadata);
                                        imageportmessage(images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts)
                                    }
                                } else {
                                    //$scope.namerr.url = true;
                                }
                                $scope.showall = true;

                                $scope.dc.metadata.labels[0].value =$scope.fuwuname ;
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
                            console.log('tag', tag);
                            imagetimemessage(tag.image.metadata.creationTimestamp)
                            imageportmessage(tag.image.dockerImageMetadata.Config.ExposedPorts)
                            $scope.curl = $scope.checked.image;
                            $scope.fuwuname = $scope.checked.image;
                            //tag.image.
                            angular.forEach($scope.istag.items, function (istag, i) {
                                if (istag.image.metadata.name === tag.image.metadata.name) {
                                    console.log(istag.image.dockerImageReference);
                                    $scope.imagetext = istag.image.dockerImageReference;
                                }
                            })
                            $scope.showall = true;

                            $scope.dc.metadata.labels[0].value =$scope.fuwuname ;

                        })
                    }
                }],
        };
    })
    .directive('dcLoading', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/quick_deploy/tpl/dcLoading.html',
            scope: false,
            controller: ['$scope',
                function ($scope) {

                }],
        };
    })
    .directive('imageMessage', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/quick_deploy/tpl/imageMessage.html',
            scope: false,
            controller: ['$scope',
                function ($scope) {

                }],
        };
    })
    .directive('dcName', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/quick_deploy/tpl/dcname.html',
            scope: false,
            controller: ['$scope',
                function ($scope) {

                }],
        };
    })
    .directive('conEnv', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/quick_deploy/tpl/env.html',
            scope: false,
            controller: ['$scope',
                function ($scope) {
                    $scope.delcontainerEnv = function (innerIndex) {
                        $scope.dc.spec.template.spec.containers[0].env.splice(innerIndex, 1);
                    }
                    $scope.addContainerEnv = function (outerIndex, innerIndex) {
                        if ($scope.dc.spec.template.spec.containers[0].env) {

                        } else {
                            $scope.dc.spec.template.spec.containers[0].env = []
                        }
                        $scope.dc.spec.template.spec.containers[0].env.push({name: '', value: ''});
                    }
                }],
        };
    })
    .directive('dcLabel', function () {
        return {
            restrict: 'E',
            templateUrl: 'views/quick_deploy/tpl/dclabel.html',
            scope: false,
            controller: ['$scope',
                function ($scope) {

                    $scope.delcontainerlabel = function (innerIndex) {
                        $scope.dc.metadata.labels.splice(innerIndex, 1);
                    }

                    $scope.addContainerlabel = function (outerIndex, innerIndex) {
                        if ($scope.dc.metadata.labels) {

                        } else {
                            $scope.dc.metadata.labels = []
                        }
                        $scope.dc.metadata.labels.push({name: '', value: ''});
                    }
                }],
        };
    })
;
