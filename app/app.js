'use strict';

define([
    'angular',
    'bootstrap',
    'angularBase64',
    'ocLazyLoad',
    'uiBootstrap',
    'router',
    'resource',
    'pub/controller',
    'pub/service',
    'pub/directive',
    'pub/filter',
    'pub/ws',
    'components/version/version',
    'angularMd',
    'angularClipboard',
    'angularSlider',
    'kubernetesUI',
    'highchartsNg',
], function (angular) {

    // 声明应用及其依赖
    var myApp = angular.module('myApp', [
        'oc.lazyLoad',
        'ui.bootstrap',
        'myApp.router',     //路由模块
        'myApp.resource',   //资源模块
        'myApp.controller',
        'myApp.service',
        'myApp.directive',
        'myApp.filter',
        'myApp.webSocket',
        'myApp.version',
        'hc.marked',
        'rzModule',
        'highcharts-ng',
    ]);

    myApp.constant('GLOBAL', {
            size: 10,
            host: '/oapi/v1',
            host_k8s: '/api/v1',
            host_newk8s: '/apis/autoscaling/v1',
            host_repos: '/v1/repos',
            host_registry: '/registry/api',
            host_lapi: '/lapi',
            host_saas: '/saas/v1',
            host_payment: '/payment/v1',
            host_integration: '/integration/v1',
            host_hawkular: '/hawkular/metrics',
            host_wss: '/ws/oapi/v1',
            host_wss_k8s: '/ws/api/v1',
            login_uri: '/login',
            signin_uri: '/signin',
            host_webhooks: 'http://hook.dataapp.c.citic/oapi/v1',
            service_url:'<ROUTER_DOMAIN_SUFFIX>',
            //service_url:'.cloud.new.dataos.io',
            common_url:'<REGISTRY_PUBLIC_ADDR>',
            //private_url:'registry.dataos.io',
            private_url:'<REGISTRY_PRIVATE_ADDR>',

        })
        .constant('AUTH_EVENTS', {
            loginNeeded: 'auth-login-needed',
            loginSuccess: 'auth-login-success',
            httpForbidden: 'auth-http-forbidden'
        })

        .config(['$httpProvider', 'GLOBAL', function ($httpProvider) {
            $httpProvider.interceptors.push([
                '$injector',
                function ($injector) {
                    return $injector.get('AuthInterceptor');
                }
            ]);
        }])

        .run(['$rootScope', 'account', '$state', function ($rootScope, account, $state) {
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.transfering = true;



            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                //更新header标题
                console.log('toState', toState);
                if(navigator.userAgent.indexOf("Firefox")>0){
                    // console.log('dasd');
                    $(document).unbind('DOMMouseScroll');


                    $(document).bind('DOMMouseScroll',function(e){
                        //  console.log('detail', e.detail);
                        //  console.log(toState.name)
                        //console.log(e);
                        if (toState.name !== "home.index") {
                            if(e.detail>0){
                                window.scrollBy(0,40);
                            }else{
                                window.scrollBy(0,-40);
                            }
                        }
                    })
                }


                if (toState.name !== "home.index") {
                    $('html').css('overflow', 'auto');
                    $('.foot_main').css('display', 'block');

                    window.onmousewheel = document.onmousewheel = true;

                } else {
                    $('html').css('overflow', 'hidden');
                    $('.foot_main').css('display', 'none');
                    scrollTo(0,0);

                }
                if (toState&&$rootScope.namespace && $rootScope.region) {

                    //console.log('套餐', data);
                    //$rootScope.payment=data;
                    //account.get({namespace: $rootScope.namespace, region: $rootScope.region,status:"consuming"}, function (data) {
                    //    //console.log('套餐', data);
                    //
                    //    if (data.purchased) {
                    //        //跳转dashboard
                    //
                    //    } else {
                    //        //console.log('app90',toState);
                    //        if (toState&&toState.name) {
                    //            if (toState.name === 'console.plan' || toState.name === 'console.pay'|| toState.name === 'console.dashboard' || toState.name === 'console.noplan') {
                    //                //$rootScope.projects=false;
                    //                //alert(1)
                    //            }else {
                    //
                    //                $state.go('console.noplan');
                    //            }
                    //        }
                    //
                    //
                    //        //跳转购买套餐
                    //    }
                    //})

                    if (toState.name === 'console.plan' || toState.name === 'console.pay' || toState.name === 'console.noplan') {
                        //$rootScope.projects=false;
                        //alert(1)
                        $rootScope.showsidebar = false;
                        $('#sidebar-right-fixed').css("marginLeft",0)
                    }else {
                        $rootScope.showsidebar = true;
                        $('#sidebar-right-fixed').css("marginLeft",188)
                    }

                    //跳转购买套餐


                }
                if (toState && toState.name) {
                    $rootScope.console.state = toState.name;
                    $rootScope.transfering = false;
                }

            });
        }]);

    return myApp;
});
