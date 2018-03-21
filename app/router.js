'use strict';

define([
    'angular',
    'uiRouter',
    'ocLazyLoad'
], function(angular) {

    return angular.module('myApp.router', ['ui.router', 'oc.lazyLoad'])
        .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {

            //$urlRouterProvider.otherwise("/console/build/create");
            $urlRouterProvider.otherwise("/login");



            $stateProvider
                //home
                .state('home', {
                    url: '/home',
                    templateUrl: 'views/home/home.html',
                    controller: 'HomeCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/home.js')
                        }]
                    },
                    abstract: true
                })
                .state('home.recharge', {
                    url: '/recharge',
                    templateUrl: 'views/home/recharge/recharge.html',
                    controller: 'rechargeCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/recharge/recharge.js')
                        }]
                    }
                })
                .state('home.builder', {
                    url: '/builder',
                    templateUrl: 'views/home/builder/builder.html',
                    controller: 'builderCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/builder/builder.js')
                        }]
                    }
                })
                .state('home.application', {
                    url: '/application',
                    templateUrl: 'views/home/application/application.html',
                    controller: 'applicationCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/application/application.js')
                        }]
                    }
                })
                .state('home.index_backing_service', {
                    url: '/index_backing_service/:region',
                    templateUrl: 'views/home/index_backing_service/index_backing_service.html',
                    controller: 'index_backing_serviceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/index_backing_service/index_backing_service.js')
                        }]
                    }
                })
                .state('home.index_backing_Sdetail', {
                    url: '/index_backing_Sdetail/:name',

                    templateUrl: 'views/home/index_backing_Sdetail/index_backing_Sdetail.html',
                    controller: 'index_backing_SdetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/index_backing_Sdetail/index_backing_Sdetail.js')
                        }]
                    }
                })
                .state('home.application_image_detail', {
                    url: '/application_image_detail/:name',
                    templateUrl: 'views/home/application_image_detail/application_image_detail.html',
                    controller: 'application_image_detailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/application_image_detail/application_image_detail.js')
                        }]
                    }
                })
                .state('home.application_saas_detail', {
                    url: '/application_saas_detail/:id',
                    templateUrl: 'views/home/application_saas_detail/application_saas_detail.html',
                    controller: 'application_saas_detailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/application_saas_detail/application_saas_detail.js')
                        }]
                    }
                })
                .state('home.index', {
                    url: '/index',
                    templateUrl: 'views/home/introduce/introduce.html',
                    controller: 'introduceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/introduce/introduce.js')
                        }]
                    }
                })
                .state('login', {
                    url: '/login',
                    templateUrl: 'views/login/login.html',
                    controller: 'loginCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/login/login.js')
                        }]
                    }
                })
                .state('regist', {
                    url: '/regist',
                    templateUrl: 'views/regist/regist.html',
                    controller: 'registCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/regist/regist.js')
                        }]
                    }
                })
                //console
                .state('console', {
                    url: '/console/project',
                    templateUrl: 'views/console/console.html',
                    controller: 'ConsoleCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/console/console.js')
                        }],
                        user: ['regions', 'Cookie', '$rootScope', 'User', function(regions, Cookie, $rootScope, User) {
                            return User.get({ name: '~', region: Cookie.get('region') }).$promise;
                        }],
                        pro: ['$stateParams', 'Project', 'Cookie', '$rootScope', function($stateParams, Project, Cookie, $rootScope) {
                            return Project.get().$promise;
                        }]
                    },
                    abstract: true

                })
                .state('console.dashboard', {
                    url: '/:namespace/dashboard',
                    templateUrl: 'views/dashboard/dashboard.html',
                    controller: 'dashboardCtrl',
                    params: {
                        namespace: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/dashboard/dashboard.js'])
                        }]
                    }
                })//ok
                .state('console.build', {
                    url: '/:namespace/build',
                    templateUrl: 'views/build/build.html',
                    controller: 'BuildCtrl',
                    params: {
                        namespace: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/build/build.js')
                        }]
                    }
                })//ok
                .state('console.build_create', {
                    url: '/:namespace/build/create',
                    templateUrl: 'views/build_create/build_create.html',
                    controller: 'BuildCreateCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/build_create/build_create.js')
                        }]
                    }
                })//ok

                .state('console.build_detail', {
                    url: '/:namespace/build/:name',
                    params: {
                        from: null
                    },
                    templateUrl: 'views/build_detail/build_detail.html',
                    controller: 'BuildDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/build_detail/build_detail.js')
                        }]
                    }
                })

                .state('console.pipeline', {
                    url: '/pipeline',
                    templateUrl: 'views/pipeline/pipeline.html',
                    controller: 'PipelineCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/pipeline/pipeline.js')
                        }]
                    }
                })
                .state('console.image', {
                    url: '/image',
                    templateUrl: 'views/image/image.html',
                    controller: 'ImageCtrl',
                    params: {
                        index: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/image/image.js', 'views/image/image.css'])
                        }],
                        //primage: ['pubregistry', 'regions', 'Cookie', '$rootScope', 'User', function(pubregistry, regions, Cookie, $rootScope, User) {
                        //
                        //    pubregistry.get(function(data) {
                        //        return data
                        //    }, function(err) {
                        //        return err
                        //    });
                        //}]
                    }
                })
                .state('console.backing_service', {
                    url: '/backing_service',
                    params: {
                        index: null
                    },
                    templateUrl: 'views/backing_service/backing_service.html',
                    controller: 'BackingServiceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/backing_service/backing_service.js'])
                        }]
                    }

                })
                    //app
                .state('console.deployments', {
                    url: '/deployments',
                    templateUrl: 'views/apps/deployments/deployments.html',
                    controller: 'DeploymentsCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/apps/deployments/deployments.js', 'views/apps/apps.css'])
                        }],
                        mydcs: ['DeploymentConfig', 'Cookie',
                            function(DeploymentConfig, Cookie) {
                                return DeploymentConfig.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                        mydeployment: ['Deployments', 'Cookie',
                            function(Deployments, Cookie) {
                                return Deployments.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                        replicas: ['ReplicationController', 'Cookie',
                            function(ReplicationController, Cookie) {
                                return ReplicationController.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                        ReplicaSet: ['ReplicaSet', 'Cookie',
                            function(ReplicaSet, Cookie) {
                                return ReplicaSet.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ]
                    }
                })
                .state('console.stateful-sets', {
                    url: '/stateful-sets',
                    templateUrl: 'views/apps/stateful-sets/stateful-sets.html',
                    controller: 'Stateful-setsCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/apps/stateful-sets/stateful-sets.js', 'views/apps/apps.css'])
                        }]
                    }
                })
                .state('console.stateful-sets-detail', {
                    url: '/stateful-sets/:name',
                    templateUrl: 'views/apps/stateful-sets-detail/stateful-sets-detail.html',
                    controller: 'Stateful-setsDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/apps/stateful-sets-detail/stateful-sets-detail.js', 'views/apps/apps.css'])
                        }],
                        podList: ['Pod', 'Cookie',
                            function(Pod, Cookie) {
                                return Pod.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                        stateful: ['statefuldetail', 'Cookie', '$stateParams',
                            function(statefuldetail, Cookie, $stateParams) {
                                return statefuldetail.get({ username: Cookie.get('namespace'), name: $stateParams.name }).$promise
                            }
                        ],
                    }
                })
                .state('console.pods', {
                    url: '/pods',
                    templateUrl: 'views/apps/pods/pods.html',
                    controller: 'PodsCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/apps/pods/pods.js', 'views/apps/apps.css'])
                        }]
                    }
                })
                .state('console.services', {
                    url: '/services',
                    templateUrl: 'views/apps/services/services.html',
                    controller: 'ServicesCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/apps/services/services.js', 'views/apps/apps.css'])
                        }]
                    }
                })
                .state('console.routes', {
                    url: '/routes',
                    templateUrl: 'views/apps/routes/routes.html',
                    controller: 'RoutesCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/apps/routes/routes.js', 'views/apps/apps.css'])
                        }],
                        routes: ['Route', 'Cookie',
                            function(Route, Cookie) {
                                return Route.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ]
                    }
                })
                    //volume
                .state('console.resource_configMap', {
                    url: '/configmaps',
                    templateUrl: 'views/resource_configMap/resource_configMap.html',
                    controller: 'configMapCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/resource_configMap/resource_configMap.js')
                        }]
                    }
                }) //resource_persistentVolume
                .state('console.resource_persistentVolume', {
                    url: '/storage',
                    templateUrl: 'views/resource_persistentVolume/resource_persistentVolume.html',
                    controller: 'persistentVolumeCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/resource_persistentVolume/resource_persistentVolume.js')
                        }]
                    }
                })
                .state('console.resource_secret', {
                    url: '/secrets',
                    templateUrl: 'views/resource_secret/resource_secret.html',
                    controller: 'resourceSecret',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/resource_secret/resource_secret.js')
                        }]
                    }
                })



                .state('console.user', {
                    url: '/user',
                    templateUrl: 'views/user/user.html',
                    controller: 'userCtrl',
                    params: {
                        index: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/user/user.js')
                        }]
                    }
                })
                .state('console.org', {
                    url: '/org/:useorg',
                    templateUrl: 'views/org/org.html',
                    params: {
                        useorg: ''
                    },
                    controller: 'orgCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/org/org.js')
                        }]
                    }
                })
                .state('console.notification', {
                    url: '/notification',
                    templateUrl: 'views/notification/notification.html',
                    controller: 'notificationCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/notification/notification.js')
                        }]
                    }
                })
                //build

                .state('console.build_create_new', {
                    url: '/construction/create/new',
                    templateUrl: 'views/build_create_new/build_create_new.html',
                    controller: 'BuildcCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/build_create_new/build_create_new.js')
                        }]
                    }
                })

                
                .state('console.pipeline_detail', {
                    url: '/pipeline/:name',
                    params: {
                        from: null
                    },
                    templateUrl: 'views/pipeline_detail/pipeline_detail.html',
                    controller: 'pipelineDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/pipeline_detail/pipeline_detail.js')
                        }],
                        BuildConfigs: ['$stateParams', 'BuildConfig', 'Cookie', '$rootScope', function($stateParams, BuildConfig, Cookie, $rootScope) {
                            return BuildConfig.get({
                                namespace: Cookie.get('namespace'),
                                name: $stateParams.name
                            }).$promise;
                        }],
                        BuildConfigList: ['BuildConfig', 'Cookie',
                            function(BuildConfig, Cookie) {
                                return BuildConfig.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                    }
                })

                .state('console.pipelinetag_detail', {
                    url: '/pipeline/:name/:tag',
                    // params: {
                    //
                    // },
                    templateUrl: 'views/pipelineTag_detail/pipelineTag_detail.html',
                    controller: 'pipelineTagDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/pipelineTag_detail/pipelineTag_detail.js')
                        }],
                        myPipelineDetail: ['$stateParams', 'Build', 'Cookie', '$rootScope',
                            function ($stateParams, Build, Cookie, $rootScope) {
                                return Build.get({
                                    namespace: Cookie.get('namespace'),
                                    name: $stateParams.name + '-' + $stateParams.tag
                                }).$promise;
                            }
                        ]
                    }
                })


                //image

                .state('console.image_detail', {
                    url: '/image/myimage/:bc/:name',
                    templateUrl: 'views/image_detail/image_detail.html',
                    controller: 'ImageDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/image_detail/image_detail.js'])
                        }]
                    }
                })
                .state('console.primage_detail', {
                    url: '/image/primage/:name',
                    templateUrl: 'views/primage_detail/primage_detail.html',
                    controller: 'prImageDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/primage_detail/primage_detail.js'])
                        }]
                    }
                })
                .state('console.image_Public', {
                    url: '/image/imagePublic/:bc/:name',
                    templateUrl: 'views/image_Public/image_Public.html',
                    controller: 'imagePublicCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/image_Public/image_Public.js'])
                        }]
                    }
                })
                .state('console.image_regstry', {
                    url: '/image/image_regstry/:bc/:name',
                    templateUrl: 'views/image_Public/image_regstry.html',
                    controller: 'imagePublicCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/image_Public/image_Public.js'])
                        }]
                    }
                })

                .state('console.backing_service_detail', {
                    url: '/backing_service/:name',
                    params: {
                        plan: null,
                        update: false,
                        index: null,
                        type: null
                    },
                    templateUrl: 'views/backing_service_detail/backing_service_detail.html',
                    controller: 'BackingServiceInstanceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/backing_service_detail/backing_service_detail.js'])
                        }]
                    }
                })
                .state('console.apply_instance', {
                    url: '/apply_instance/:name',
                    templateUrl: 'views/apply_instance/apply_instance.html',
                    controller: 'ApplyInstanceCtrl',
                    params: {
                        plan: '',
                        index: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/apply_instance/apply_instance.js'])
                        }]
                    }
                })

                //service

                .state('console.service_create', {
                    url: '/create-deploy',
                    templateUrl: 'views/service_create/service_create.html',
                    controller: 'ServiceCreateCtrl',
                    params: {
                        image: null,
                        ports: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/service_create/service_create.js'])
                        }]
                    }
                })
                .state('console.import_from_file', {
                    url: '/import',
                    templateUrl: 'views/import_from_file/import_from_file.html',
                    controller: 'ImportFromFileCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/import_from_file/import_from_file.js'])
                        }],
                        project: ['Project', 'Cookie',
                            function(Project, Cookie) {
                                return Project.get({ name: Cookie.get('namespace') }).$promise
                            }
                        ]
                    }
                })
                .state('console.quick_deploy', {
                    url: '/create-quick-deploy',
                    templateUrl: 'views/quick_deploy/quick_deploy.html',
                    controller: 'QuickDeployCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/quick_deploy/quick_deploy.js'])
                        }],
                        myimage: ['ImageStream', 'Cookie', '$stateParams',
                            function(ImageStream, Cookie, $stateParams) {
                                return ImageStream.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                        mytag: ['$stateParams', 'ImageStreamTag', 'Cookie', '$rootScope', function($stateParams, ImageStreamTag, Cookie, $rootScope) {
                            return ImageStreamTag.get({
                                namespace: Cookie.get('namespace')
                            }).$promise;
                        }]
                    }
                })
                .state('console.route_detail', {
                    url: '/routes/:name',
                    templateUrl: 'views/route_details/route_details.html',
                    controller: 'RouteDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/route_details/route_details.js'])
                        }],
                        routeDetails: ['Route', 'Cookie', '$stateParams',
                            function(Route, Cookie, $stateParams) {
                                return Route.get({ namespace: Cookie.get('namespace'), name: $stateParams.name }).$promise
                            }
                        ],
                        services: ['Service', 'Cookie', '$stateParams',
                            function(Service, Cookie, $stateParams) {
                                return Service.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ]
                    }
                })
                .state('console.deploymentconfig_detail', {
                    url: '/deploymentconfigs/:name',
                    params: {
                        from: null
                    },
                    templateUrl: 'views/deploymentconfig_detail/deploymentconfig_detail.html',
                    controller: 'DeploymentConfigDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/deploymentconfig_detail/deploymentconfig_detail.js'])
                        }],
                        mydc: ['$stateParams', 'DeploymentConfig', 'Cookie', '$rootScope', function($stateParams, DeploymentConfig, Cookie, $rootScope) {
                            return DeploymentConfig.get({
                                namespace: Cookie.get('namespace'),
                                name: $stateParams.name
                            }).$promise;
                        }],
                        mytag: ['$stateParams', 'ImageStreamTag', 'Cookie', '$rootScope', function($stateParams, ImageStreamTag, Cookie, $rootScope) {
                            return ImageStreamTag.get({
                                namespace: Cookie.get('namespace')
                            }).$promise;
                        }]
                    }
                })
                .state('console.deployment_detail', {
                    url: '/deployments/:name',
                    templateUrl: 'views/deployment_detail/deployment_detail.html',
                    controller: 'DeploymentDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/deployment_detail/deployment_detail.js'])
                        }],
                        mydc: ['$stateParams', 'Deployments', 'Cookie', '$rootScope',
                            function($stateParams, Deployments, Cookie, $rootScope) {
                                //console.log('$stateParams', $stateParams);
                                return Deployments.get({
                                    namespace: Cookie.get('namespace'),
                                    name: $stateParams.name
                                }).$promise;
                            }
                        ],
                        myreplicaSet: ['$stateParams', 'ReplicaSet', 'Cookie', '$rootScope',
                            function($stateParams, ReplicaSet, Cookie, $rootScope) {
                                //console.log('$stateParams', $stateParams);
                                return ReplicaSet.get({
                                    namespace: Cookie.get('namespace')
                                }).$promise;
                            }
                        ],
                        mytag: ['$stateParams', 'ImageStreamTag', 'Cookie', '$rootScope', function($stateParams, ImageStreamTag, Cookie, $rootScope) {
                            return ImageStreamTag.get({
                                namespace: Cookie.get('namespace')
                            }).$promise;
                        }]
                    }
                })
                .state('console.service_details', {
                    url: '/services/:name',
                    params: {
                        from: null
                    },
                    templateUrl: 'views/service_details/service_details.html',
                    controller: 'ServicesDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/service_details/service_details.js'])
                        }],
                        routes: ['Route', 'Cookie',
                            function(Route, Cookie) {
                                return Route.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                        pods: ['Pod', 'Cookie',
                            function(Pod, Cookie) {
                                return Pod.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                        endpoints: ['Endpoint', 'Cookie',
                            function(Endpoint, Cookie) {
                                return Endpoint.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                        serviceDetails: ['Service', 'Cookie', '$stateParams',
                            function(Service, Cookie, $stateParams) {
                                return Service.get({
                                    namespace: Cookie.get('namespace'),
                                    name: $stateParams.name
                                }).$promise
                            }
                        ]
                    }
                })



                .state('console.create_saas', {
                    url: '/create_saas/:name',
                    templateUrl: 'views/create_saas/create_saas.html',
                    controller: 'create_saasCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_saas/create_saas.js')
                        }]
                    }
                })
                //resource management

                .state('console.create_constantly_persistentVolume', {
                    url: '/create-pvc',
                    templateUrl: 'views/create_constantly_volume/create_constantly_volume.html',
                    controller: 'createconvolumeCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_constantly_volume/create_constantly_volume.js')
                        }]
                    }
                })
                .state('console.create_config_configMap', {
                    url: '/create-configmap',
                    templateUrl: 'views/create_config_volume/create_config_volume.html',
                    controller: 'createfigvolumeCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_config_volume/create_config_volume.js')
                        }]
                    }
                })
                .state('console.create_secret', {
                    url: '/create-secret',
                    templateUrl: 'views/create_secret/create_secret.html',
                    controller: 'createSecretCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_secret/create_secret.js')
                        }]
                    }
                })
                .state('console.config_configMap', {
                    url: '/configmaps/:name',
                    templateUrl: 'views/config_detail/config_detail.html',
                    controller: 'configDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/config_detail/config_detail.js')
                        }]
                    }
                })
                .state('console.secret_secret', {
                    url: '/secrets/:name',
                    templateUrl: 'views/secret_detail/secret_detail.html',
                    controller: 'secretDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/secret_detail/secret_detail.js')
                        }]
                    }
                })
                .state('console.constantly_persistentVolume', {
                    url: '/storage/:name',
                    templateUrl: 'views/constantly_detail/constantly_detail.html',
                    controller: 'constDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/constantly_detail/constantly_detail.js')
                        }]
                    }
                })
                //数据集成
                .state('console.Integration', {
                    url: '/Integration',
                    params: {
                        index: null
                    },
                    templateUrl: 'views/Integration/Integration.html',
                    controller: 'IntegrationCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/Integration/Integration.js'])
                        }]
                    }

                })
                .state('console.Integration_detail', {
                    url: '/Integration_detail/:name',
                    params: {
                        plan: null,
                        update: false,
                        index: null,
                        type: null
                    },
                    templateUrl: 'views/Integration_detail/Integration_detail.html',
                    controller: 'IntegrationDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/Integration_detail/Integration_detail.js'])
                        }]
                    }

                })
                .state('console.Integration_dlist', {
                    url: '/Integration_dlist/:name/:plan',
                    params: {},
                    templateUrl: 'views/Integration_dlist/Integration_dlist.html',
                    controller: 'IntegrationDlistCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/Integration_dlist/Integration_dlist.js'])
                        }]
                    }

                })
                .state('console.dataseverdetail', {
                    url: '/dataseverdetail/:name',
                    templateUrl: 'views/dataseverdetail/dataseverdetail.html',
                    controller: 'dataseverdetailCtrl',
                    params: {
                        plan: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/dataseverdetail/dataseverdetail.js'])
                        }]
                    }
                })
                //panment
                .state('console.plan', {
                    url: '/plan',
                    templateUrl: 'views/plan/plan.html',
                    controller: 'planCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/plan/plan.js')
                        }]
                    }
                })
                .state('console.noplan', {
                    url: '/noplan',
                    templateUrl: 'views/noplan/noplan.html',
                    controller: 'noplanCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/noplan/noplan.js')
                        }]
                    }
                })
                .state('console.admin', {
                    url: '/admin',
                    templateUrl: 'views/admin/admin.html',
                    controller: 'adminCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/admin/admin.js')
                        }]
                    }
                })
                .state('console.pay', {
                    url: '/pay',
                    templateUrl: 'views/pay/pay.html',
                    controller: 'payCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/pay/pay.js')
                        }]
                    }
                })
                .state('wechatpay', {
                    url: '/wechatpay/:amount',
                    templateUrl: 'views/wechat_pay/wechat_pay.html',
                    params: {
                        amount: null
                    },
                    controller: 'wechatPayCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/wechat_pay/wechat_pay.js')
                        }]
                    }
                })

            //pods详情
                .state('console.pods_detail', {
                    url: '/pods/:name',
                    templateUrl: 'views/pods_detail/pods_detail.html',
                    controller: 'podsdetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/pods_detail/pods_detail.js')
                        }],
                        mypod: ['$stateParams', 'Pod', 'Cookie', '$rootScope', function($stateParams, Pod, Cookie, $rootScope) {
                            return Pod.get({
                                namespace: Cookie.get('namespace'),
                                name: $stateParams.name
                            }).$promise;
                        }],
                        podList: ['Pod', 'Cookie',
                            function(Pod, Cookie) {
                                return Pod.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                    }
                })
                //新建routes
                .state('console.create_routes', {
                    url: '/create-route/:name',
                    templateUrl: 'views/create_file/create_routes/create_routes.html',
                    params: {
                        name: null
                    },
                    controller: 'CreateRoutesCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_file/create_routes/create_routes.js')
                        }],
                        createRoutes: ['Route', 'Cookie', '$stateParams',
                            function(Route, Cookie, $stateParams) {
                                return Route.get({ namespace: Cookie.get('namespace'), name: $stateParams.name }).$promise
                            }
                        ],
                        routesList: ['Route', 'Cookie', '$stateParams',
                            function(Route, Cookie) {
                                return Route.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ],
                        ServiceList: ['Service', 'Cookie',
                            function(Service, Cookie) {
                                return Service.get({ namespace: Cookie.get('namespace') }).$promise
                            }
                        ]
                    }
                })
                //新建deployment
                .state('console.create_deployment', {
                    url: '/create_deployment',
                    templateUrl: 'views/create_deployment/create_deployment.html',
                    controller: 'createDeploymentCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/create_deployment/create_deployment.js')
                        }],
                        myProject: ['Project', 'Cookie', '$stateParams',
                            function(Project, Cookie, $stateParams) {
                                return Project.get().$promise
                            }
                        ]

                    }
                })

            //rc
                .state('console.rc', {
                    url: '/rc/:name',
                    templateUrl: 'views/rc/rc_detail.html',
                    controller: 'rcCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/rc/rc_detail.js')
                        }],
                        myPodList: ['$stateParams', 'Pod', 'Cookie', '$rootScope', function($stateParams, Pod, Cookie, $rootScope) {
                            return Pod.get({
                                namespace: Cookie.get('namespace')
                            }).$promise;
                        }],

                        myrc: ['$stateParams', 'ReplicationController', 'Cookie', '$rootScope',
                            function($stateParams, ReplicationController, Cookie, $rootScope) {
                                return ReplicationController.get({
                                    namespace: Cookie.get('namespace'),
                                    name: $stateParams.name
                                }).$promise;
                            }
                        ]
                    }
                })
                //rs
                .state('console.rs', {
                    url: '/rs/:name',
                    templateUrl: 'views/rs/rs_detail.html',
                    controller: 'rsCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function($ocLazyLoad) {
                            return $ocLazyLoad.load('views/rs/rs_detail.js')
                        }],

                        myPodList: ['$stateParams', 'Pod', 'Cookie', '$rootScope', function($stateParams, Pod, Cookie, $rootScope) {
                            return Pod.get({
                                namespace: Cookie.get('namespace')
                            }).$promise;
                        }],
                        myrs: ['$stateParams', 'ReplicaSet', 'Cookie', '$rootScope',
                            function($stateParams, ReplicaSet, Cookie, $rootScope) {
                                return ReplicaSet.get({
                                    namespace: Cookie.get('namespace'),
                                    name: $stateParams.name
                                }).$promise;
                            }
                        ]
                    }
                })

        }]);

});