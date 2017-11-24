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
    .controller('QuickDeployCtrl', ['imagestreamimports', 'GLOBAL', 'resourcequotas', '$http', 'by', 'diploma', 'Confirm', 'Toast', '$rootScope', '$state', '$scope', '$log', '$stateParams', 'ImageStream', 'DeploymentConfig', 'ImageSelect', 'BackingServiceInstance', 'BackingServiceInstanceBd', 'ReplicationController', 'Route', 'Secret', 'Service', 'ChooseSecret', '$base64', 'secretskey', 'serviceaccounts',
        function (imagestreamimports, GLOBAL, resourcequotas, $http, by, diploma, Confirm, Toast, $rootScope, $state, $scope, $log, $stateParams, ImageStream, DeploymentConfig, ImageSelect, BackingServiceInstance, BackingServiceInstanceBd, ReplicationController, Route, Secret, Service, ChooseSecret, $base64, secretskey, serviceaccounts) {
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
            $scope.namerr = {
                urlnull: false,
                url: false,
                quanxian: false,
                nil: true,
                rexed: false,
                repeated: false,
                canbuild: true
            }
            $scope.hasport = false;
            $scope.hasurl = false;
            $scope.finding = false;
            DeploymentConfig.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (data) {
                $scope.servelist = data;
                //console.log('scope.servelist', $scope.servelist);
            })
            $scope.$watch('fuwuname', function (n, o) {
                if (n == o) {
                    return
                }
                if (n === '') {
                    $scope.namerr.nil = true
                    return
                }
                if (n) {
                    $scope.namerr.nil = false;
                    $scope.namerr.rexed = false;
                    $scope.namerr.repeated = false;


                    $scope.dc.metadata.name = n;
                    $scope.dc.metadata.labels.app = n;
                    $scope.dc.spec.selector.deploymentconfig = n;
                    $scope.dc.spec.selector.app = n;
                    $scope.dc.spec.template.metadata.labels.deploymentconfig = n;
                    $scope.dc.spec.template.metadata.labels.app = n;
                    $scope.dc.spec.template.spec.containers[0].name = n;

                }
            })
            $scope.$watch('postobj.spec.images[0].from.name', function (n, o) {
                if (n == o) {
                    return
                }
                if (n) {
                    $scope.namerr.urlnull = false;
                    $scope.namerr.url = false;
                    $scope.namerr.quanxian = false;
                }
            })
            $scope.find = function () {
                if (!$scope.finding) {
                    if ($scope.postobj.spec.images[0].from.name === '') {
                        return
                    }
                    $scope.finding = true;

                    $scope.postobj.spec.images[0].from.name = $scope.postobj.spec.images[0].from.name.replace(/^\s+|\s+$/g, "");
                    imagestreamimports.create({namespace: $rootScope.namespace}, $scope.postobj, function (images) {
                        $scope.finding = false;
                        if (images.status.images && images.status.images[0] && images.status.images[0].status) {
                            if (images.status.images[0].status.code && images.status.images[0].status.code === 401) {
                                $scope.namerr.quanxian = true;
                                return
                            }
                            if (images.status.images[0].status.code && images.status.images[0].status.code === 404) {
                                $scope.namerr.url = true;
                                return
                            }
                        }
                        $scope.namerr.canbuild = false;
                        $scope.images = images;
                        $scope.curl = $scope.postobj.spec.images[0].from.name;
                        var name = $scope.postobj.spec.images[0].from.name.split('/')[$scope.postobj.spec.images[0].from.name.split('/').length - 1]
                        $scope.fuwuname = name.split(':').length > 1 ? name.split(':')[0] : name;
                        $scope.dc = {
                            "kind": "DeploymentConfig",
                            "apiVersion": "v1",
                            "metadata": {
                                "name": $scope.fuwuname,
                                "labels": {"app": $scope.fuwuname},
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
                                    //,
                                    //    {
                                    //    "type": "ImageChange",
                                    //    "imageChangeParams": {
                                    //        "automatic": true,
                                    //        "containerNames": ["go-web-demo"],
                                    //        "from": {"kind": "ImageStreamTag", "name": "go-web-demo:latest"}
                                    //    }
                                    //}
                                ],
                                "replicas": 1,
                                "test": false,
                                "selector": {
                                    "deploymentconfig": $scope.fuwuname,
                                    "app": $scope.fuwuname
                                },
                                "template": {
                                    "metadata": {
                                        "labels": {"deploymentconfig": $scope.fuwuname, "app": $scope.fuwuname},
                                        "annotations": {"openshift.io/generated-by": "OpenShiftWebConsole"}
                                    },
                                    "spec": {
                                        "volumes": [],
                                        "containers": [{
                                            "name": $scope.fuwuname,
                                            "image": $scope.postobj.spec.images[0].from.name,
                                            //"ports": [{"containerPort": 8080, "protocol": "TCP"}]
                                        }],
                                        "resources": {}
                                    }
                                }
                            },
                            "status": {}
                        }
                        if (images.status.images[0] && images.status.images[0].image.dockerImageMetadata) {
                            $scope.creattime = images.status.images[0].image.dockerImageMetadata.Created
                            $scope.imagesizs = (images.status.images[0].image.dockerImageMetadata.Size / 1024 / 1024).toFixed(2)
                            $scope.hasurl = true;
                            if (images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts) {
                                var port = images.status.images[0].image.dockerImageMetadata.Config.ExposedPorts;
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
                        }else {
                            $scope.namerr.url = true;
                        }

                    }, function (err) {
                        $scope.namerr.url = true;
                        $scope.finding = false;
                    })
                }
            }
            $scope.myKeyup= function (e) {
                var keycode = window.event?e.keyCode:e.which;
                if(keycode==13){
                    $scope.find();
                }
            }
            var prepareService = function (service, dc) {
                service.metadata.name = dc.metadata.name;
                service.metadata.labels.app = dc.metadata.name;
                service.spec.selector.app = dc.metadata.name;
                service.spec.selector.deploymentconfig = dc.metadata.name;
            };
            function creatdc() {
                DeploymentConfig.get({
                    namespace: $rootScope.namespace,
                    region: $rootScope.region,
                    name: $scope.fuwuname
                }, function (data) {
                    $scope.namerr.repeated = true;
                }, function (err) {
                    if (err.status === 404) {
                        DeploymentConfig.create({
                            namespace: $rootScope.namespace,
                            region: $rootScope.region
                        }, $scope.dc, function (res) {
                            $log.info("create dc success", res);
                            $state.go('console.service_detail', {name: $scope.dc.metadata.name, from: 'create'});
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
                    $scope.namerr.repeated = true;
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
            $scope.createDc = function () {
                //angular.forEach($scope.servelist.items, function (serve, i) {
                //    if (serve.metadata.name === $scope.fuwuname) {
                //        $scope.namerr.repeated = true;
                //        return
                //    }
                //})
                if ($scope.postobj.spec.images[0].from.name === '') {
                    $scope.namerr.urlnull = true;
                }
                for (var k in $scope.namerr) {
                    if ($scope.namerr[k]) {
                        return
                    }
                }
                if ($scope.hasport) {
                    createService($scope.dc)
                } else {
                    creatdc()
                }

            }
        }]);
