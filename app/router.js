'use strict';

define([
  'angular',
  'uiRouter',
  'ocLazyLoad'
], function (angular) {

  return angular.module('myApp.router', ['ui.router', 'oc.lazyLoad'])
      .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/home/index");
        $stateProvider
            .state('home', {
              url: '/home',
              templateUrl: 'views/home/home.html',
              controller: 'HomeCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/home/home.js')
                }]
              },
              abstract: true
            })
            .state('home.index', {
              url: '/index',
              templateUrl: 'views/home/index/index.html',
              controller: 'IndexCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/home/index/index.js')
                }]
              }
            })
            .state('login', {
              url: '/login',
              templateUrl: 'views/login/login.html',
              controller: 'loginCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/login/login.js')
                }]
              }
            })
            .state('regist', {
              url: '/regist',
              templateUrl: 'views/regist/regist.html',
              controller: 'registCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/regist/regist.js')
                }]
              }
            })
            .state('console', {
              url: '/console',
              templateUrl: 'views/console/console.html',
              controller: 'ConsoleCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/console/console.js')
                }],
                user: ['$rootScope', 'User', function ($rootScope, User) {
                  if ($rootScope.user) {
                    return $rootScope.user;
                  }
                  return User.get({name: '~'}).$promise;
                }]
              },
              abstract: true
            })
            .state('console.build', {
              url: '/build',
              templateUrl: 'views/build/build.html',
              controller: 'BuildCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/build/build.js')
                }]
              }
            })
            .state('console.build_create', {
              url: '/build/create',
              templateUrl: 'views/build_create/build_create.html',
              controller: 'BuildCreateCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/build_create/build_create.js')
                }]
              }
            })
            .state('console.build_detail', {
              url: '/build/:name',
              params: {
                from: null
              },
              templateUrl: 'views/build_detail/build_detail.html',
              controller: 'BuildDetailCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/build_detail/build_detail.js')
                }]
              }
            })
            .state('console.build_create_new', {
              url: '/construction/create/new',
              templateUrl: 'views/build_create_new/build_create_new.html',
              controller: 'BuildcCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/build_create_new/build_create_new.js')
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
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/image/image.js', 'views/image/image.css'])
                }]
              }
            })
            .state('console.image_detail', {
              url: '/image/:bc/:name',
              templateUrl: 'views/image_detail/image_detail.html',
              controller: 'ImageDetailCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/image_detail/image_detail.js'])
                }]
              }
            })
            .state('console.image_Public', {
              url: '/imagePublic/:bc/:name',
              templateUrl: 'views/image_Public/image_Public.html',
              controller: 'imagePublicCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/image_Public/image_Public.js'])
                }]
              }
            })
            .state('console.image_regstry', {
              url: '/image_regstry/:bc/:name',
              templateUrl: 'views/image_Public/image_regstry.html',
              controller: 'imagePublicCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/image_Public/image_Public.js'])
                }]
              }
            })
            .state('console.service', {
              url: '/service',
              templateUrl: 'views/service/service.html',
              controller: 'ServiceCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/service/service.js', 'views/service/service.css'])
                }]
              }
            })
            .state('console.service_create', {
              url: '/service/create',
              templateUrl: 'views/service_create/service_create.html',
              controller: 'ServiceCreateCtrl',
              params: {
                image: null
              },
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/service_create/service_create.js'])
                }]
              }
            })
            .state('console.service_detail', {
              url: '/service/:name',
              params: {
                from: null
              },
              templateUrl: 'views/service_detail/service_detail.html',
              controller: 'ServiceDetailCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/service_detail/service_detail.js'])
                }]
              }
            })
            .state('console.backing_service', {
              url: '/backing_service',
              templateUrl: 'views/backing_service/backing_service.html',
              controller: 'BackingServiceCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/backing_service/backing_service.js'])
                }]
              }

            })
            .state('console.backing_service_detail', {
              url: '/backing_service/:name',
              params: {
                plan: null,
                update: false,
                index: null,
                type:null
              },
              templateUrl: 'views/backing_service_detail/backing_service_detail.html',
              controller: 'BackingServiceInstanceCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/backing_service_detail/backing_service_detail.js'])
                }]
              }
            })
            .state('console.apply_instance', {
              url: '/apply_instance/:name',
              templateUrl: 'views/apply_instance/apply_instance.html',
              controller: 'ApplyInstanceCtrl',
              params: {
                plan: ''
              },
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/apply_instance/apply_instance.js'])
                }]
              }
            })
            .state('console.dashboard', {
              url: '/dashboard/:useorg',
              templateUrl: 'views/dashboard/dashboard.html',
              controller: 'dashboardCtrl',
              params: {},
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load(['views/dashboard/dashboard.js'])
                }]
              }
            })
            .state('console.user', {
              url: '/user',
              templateUrl: 'views/user/user.html',
              controller: 'userCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/user/user.js')
                }]
              }
            })
            .state('console.org', {
              url: '/org/:useorg',
              templateUrl: 'views/org/org.html',
              params: {
                useorg:''
              },
              controller: 'orgCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/org/org.js')
                }]
              }
            })
            .state('console.notification', {
              url: '/notification',
              templateUrl: 'views/notification/notification.html',
              controller: 'notificationCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/notification/notification.js')
                }]
              }
            })
            //resource management
            .state('console.resource_management', {
              url: '/resource_management',
              params: {
                index: null
              },
              templateUrl: 'views/resource_management/resource_management.html',
              controller: 'resmanageCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/resource_management/resource_management.js')
                }]
              }
            })
            .state('console.create_constantly_volume', {
              url: '/resource_create_persistentVolume',
              templateUrl: 'views/create_constantly_volume/create_constantly_volume.html',
              controller: 'createconvolumeCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/create_constantly_volume/create_constantly_volume.js')
                }]
              }
            })
            .state('console.create_config_volume', {
              url: '/resource_create_configMap',
              templateUrl: 'views/create_config_volume/create_config_volume.html',
              controller: 'createfigvolumeCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/create_config_volume/create_config_volume.js')
                }]
              }
            })
            .state('console.create_secret', {
              url: '/create_secret',
              templateUrl: 'views/create_secret/create_secret.html',
              controller: 'createSecretCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/create_secret/create_secret.js')
                }]
              }
            })
            .state('console.config_detail', {
              url:'/configMap/:name',
              templateUrl:'views/config_detail/config_detail.html',
              controller: 'configDetailCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/config_detail/config_detail.js')
                }]
              }
            })
            .state('console.secret_detail', {
              url:'/secret/:name',
              templateUrl:'views/secret_detail/secret_detail.html',
              controller: 'secretDetailCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/secret_detail/secret_detail.js')
                }]
              }
            })
            .state('console.constantly_detail', {
              url: '/persistentVolume/:name',
              templateUrl: 'views/constantly_detail/constantly_detail.html',
              controller: 'constDetailCtrl',
              resolve: {
                dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load('views/constantly_detail/constantly_detail.js')
                }]
              }
            })
      }]);
});
