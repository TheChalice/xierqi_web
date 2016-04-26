'use strict';

define([
    'angular',
    'uiRouter',
    'ocLazyLoad'
], function (angular) {

    return angular.module('myApp.router', ['ui.router', 'oc.lazyLoad'])
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise("/console/build");
            $stateProvider
                .state('login', {
                    url: '/login',
                    templateUrl: 'views/login/login.html',
                    controller: 'LoginCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/login/login.js')
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
                        user: ['$rootScope', 'User', function($rootScope, User){
                            if($rootScope.user){
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
                .state('console.image',{
                    url: '/image',
                    templateUrl: 'views/image/image.html',
                    controller: 'ImageCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad)  {
                            return $ocLazyLoad.load(['views/image/image.js', 'views/image/image.css'])
                        }]
                    }
                })
                .state('console.image_detail',{
                    url: '/image/:bc/:name',
                    templateUrl: 'views/image_detail/image_detail.html',
                    controller: 'ImageDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad)  {
                            return $ocLazyLoad.load(['views/image_detail/image_detail.js'])
                        }]
                    }
                })
                .state('console.service',{
                    url: '/service',
                    templateUrl: 'views/service/service.html',
                    controller: 'ServiceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad)  {
                            return $ocLazyLoad.load(['views/service/service.js', 'views/service/service.css'])
                        }]
                    }
                })
                .state('console.service_create',{
                    url: '/service/create',
                    templateUrl: 'views/service_create/service_create.html',
                    controller: 'ServiceCreateCtrl',
                    params: {
                        image: null
                    },
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad)  {
                            return $ocLazyLoad.load(['views/service_create/service_create.js'])
                        }]
                    }
                })
                .state('console.service_detail',{
                    url: '/service/:name',
                    templateUrl: 'views/service_detail/service_detail.html',
                    controller: 'ServiceDetailCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad)  {
                            return $ocLazyLoad.load(['views/service_detail/service_detail.js'])
                        }]
                    }
                })
                .state('console.backing_service',{
                    url: '/backing_service',
                    templateUrl: 'views/backing_service/backing_service.html',
                    controller: 'BackingServiceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/backing_service/backing_service.js'])
                        }]
                    }

                })
                .state('console.backing_service_detail',{
                    url: '/backing_service/:name',
                    templateUrl: 'views/backing_service_detail/backing_service_detail.html',
                    controller: 'BackingServiceInstanceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['views/backing_service_detail/backing_service_detail.js'])
                        }]
                    }
                })
                .state('console.apply_instance',{
                    url: '/apply_instance/:name',
                    templateUrl: 'views/apply_instance/apply_instance.html',
                    controller: 'ApplyInstanceCtrl',
                    resolve: {
                        dep: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return  $ocLazyLoad.load(['views/apply-instance/apply_instance.js'])
                        }]
                    }
                })
        }]);
});
