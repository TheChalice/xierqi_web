'use strict';

define([
    'angular',
    'uiRouter',
    'ocLazyLoad'
], function (angular) {

    return angular.module('myApp.router', ['ui.router', 'oc.lazyLoad'])
        .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

            $urlRouterProvider.otherwise("home/view1");
            $stateProvider
                .state('home', {
                    url: '/home',
                    templateUrl: 'views/home/home.html',
                    controller: 'HomeCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/home/home.js');
                        }]
                        //deps: $requireProvider.require('views/home/home.js')
                        //deps: asyncjs('views/home/home.js')
                    },
                    abstract: true
                })
                .state('home.view1', {
                    url: '/view1',
                    templateUrl: 'views/view1/view1.html',
                    controller: 'View1Ctrl',
                    resolve: {
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/view1/view1.js');
                        }]
                        //deps: $requireProvider.require('views/view1/view1.js')
                        //deps: asyncjs('views/view1/view1.js')
                    }
                })
                .state('home.view2', {
                    url: '/view2',
                    templateUrl: 'views/view2/view2.html',
                    controller: 'View2Ctrl',
                    resolve: {
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('views/view2/view2.js');
                        }]
                        //deps: $requireProvider.require('views/view2/view2.js')
                        //deps: asyncjs('views/view2/view2.js')
                    }
                })
        }]);
});
