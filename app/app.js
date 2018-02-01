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
    'patternfly',
    'angular_patternfly',
    'treeControl',
    'lodash',
    'stateEvents'
], function (angular) {

    // 声明应用及其依赖
    var DataFoundry = angular.module('DataFoundry', [
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
        "patternfly.wizard",
        'treeControl',
        'ui.router.state.events'
    ]);

    DataFoundry.constant('GLOBAL', {
            size: 10,
            host: '/oapi/v1',
            host_k8s: '/api/v1',
            host_newk8s: '/apis/autoscaling/v1',
            host_newk8s1: '/apis/apps/v1beta1',
            host_newk8s2: '/apis/extensions/v1beta1',
            host_repos: '/v1/repos',
            host_registry: '/registry/api',
            host_lapi: '/lapi',
            host_authorize: '/authorize',
            host_saas: '/saas/v1',
            host_payment: '/payment/v1',
            host_repo: '/repos',
            host_integration: '/integration/v1',
            host_hawkular: '/hawkular/metrics',
            host_wss: '/ws/oapi/v1',
            host_wss_k8s: '/ws/api/v1',
            login_uri: '/login',
            signin_uri: '/signin',
            host_webhooks: '<WEBHOOK_PREFIX>',
            service_url:'<ROUTER_DOMAIN_SUFFIX>',
            //internal_registry:'docker-registry.default.svc:5000',
            internal_registry:'<INTERNAL_REGISTRY_ADDR>',
            //service_url:'.cloud.new.dataos.io',
            common_url:'<REGISTRY_PUBLIC_ADDR>',
            //private_url:'registry.dataos.io',
            private_url:'<REGISTRY_PRIVATE_ADDR>'

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

        .run(['$rootScope', 'account', '$state','Cookie' ,
            function ($rootScope, account, $state,Cookie) {
            $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                $rootScope.transfering = true;



            });

            $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                //更新header标题
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
                if (toState.name !== 'login') {
                    //console.log('namespace',$rootScope.namespace);
                    //console.log('$state.params.namespace', $state.params.namespace);
                    if ($state.params.namespace) {
                        $rootScope.namespace=$state.params.namespace
                        Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                    }
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
                $rootScope.app = [
                    { name: 'Deployments', url: 'console.deployments',stateUrl:null ,children: [] },
                    { name: 'Stateful Sets', url: 'console.stateful-sets',stateUrl:null , children: [] },
                    { name: 'Pods', url: 'console.pods',stateUrl:null , children: [] },
                    { name: 'Services', url: 'console.services', stateUrl:null ,children: [] },
                    { name: 'Routes', url: 'console.routes',stateUrl:null , children: [] }
                ];
                $rootScope.resources = [
                    { name: '存储卷', url: 'console.resource_persistentVolume',stateUrl:null ,children: [] },
                    { name: '配置卷', url: 'console.resource_configMap',stateUrl:null ,children: [] },
                    { name: '密钥', url: 'console.resource_secret',stateUrl:null ,children: [] }
                ];

                $rootScope.dataForTheTree =
                    [
                        {name:'仪表盘',img:'icon25 icon25-dashboard',url:'console.dashboard',stateUrl:null ,children:[]},
                        {name:'代码构建',img:'icon25 icon25-build',url:'console.build',stateUrl:null ,children:[]},
                        {name:'镜像仓库',img:'icon25 icon25-repository',url:'console.image',stateUrl:null ,children:[]},
                        {name:'服务部署',img:'icon25 icon25-deployment',url:null,stateUrl:null ,children:$rootScope.app},
                        {name:'后端服务',img:'icon25 icon25-service',url:'console.backing_service',stateUrl:null ,children:[]},
                        {name:'资源管理',img:'icon25 icon25-resource',url:null,stateUrl:null ,children:$rootScope.resources}
                    ];
                if (toState && toState.name) {
                    $rootScope.console.state = toState.name;
                    if(toState.name.indexOf('dashboard') != -1){
                        $rootScope.dataForTheTree[0].stateUrl = toState.name
                    }else if(toState.name.indexOf('build') != -1){
                        $rootScope.dataForTheTree[1].stateUrl = toState.name;
                    }else if(toState.name.indexOf('image') != -1){
                        $rootScope.dataForTheTree[2].stateUrl = toState.name;
                    }else if(toState.name.indexOf('deployment') != -1 || toState.name.indexOf('quick_deploy') != -1 || toState.name.indexOf('service_create') != -1){
                        $rootScope.app[0].stateUrl = toState.name;
                    }else if(toState.name.indexOf('stateful-sets') != -1){
                        $rootScope.app[1].stateUrl = toState.name;
                    }else if(toState.name.indexOf('pods') != -1){
                        $rootScope.app[2].stateUrl = toState.name;
                    }else if(toState.name.indexOf('services') != -1 || toState.name.indexOf('service_details') != -1){
                        $rootScope.app[3].stateUrl = toState.name;
                    }else if(toState.name.indexOf('route') != -1){
                        $rootScope.app[4].stateUrl = toState.name;
                    }
                    // else if(toState.name.indexOf('resource_management') != -1 || toState.name.indexOf('constantly_') != -1 || toState.name.indexOf('config_') != -1 || toState.name.indexOf('create_secret') != -1 || toState.name.indexOf('secret_detail') != -1){
                    //     $rootScope.dataForTheTree[4].stateUrl = toState.name;
                    // }
                    else if(toState.name.indexOf('_persistentVolume') != -1 ){
                        $rootScope.resources[0].stateUrl = toState.name;
                    }else if(toState.name.indexOf('_configMap') != -1 ){
                        $rootScope.resources[1].stateUrl = toState.name;
                    }else if(toState.name.indexOf('_secret') != -1 ){
                        $rootScope.resources[2].stateUrl = toState.name;
                    }



                    $rootScope.transfering = false;
                }

            });
        }]);

    return DataFoundry;
});
