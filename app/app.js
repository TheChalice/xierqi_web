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
    'pub/origin-web-service',
    'pub/directive',
    'pub/filter',
    'pub/ws',
    'pub/fromFile',
    'pub/modals',
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
    'jsyaml',
    'ace',
    'ui_ace',
    'stateEvents',
    'toastr',
    'uploadShim',
    'ngUpload',
    'fileserve'
], function (angular) {

    // 声明应用及其依赖
    var DataFoundry = angular.module('DataFoundry', [
        'oc.lazyLoad',
        'ui.bootstrap',
        'myApp.router', //路由模块
        'myApp.resource', //资源模块
        'myApp.controller',
        'myApp.service',
        'myApp.directive',
        'myApp.filter',
        'myApp.webSocket',
        'myApp.version',
        'hc.marked',
        'rzModule',
        'highcharts-ng',
        'patternfly.wizard',
        'treeControl',
        'ui.ace',
        'myApp.origin-web-service',
        'myApp.fromFile',
        'myApp.modals',
        'ui.router.state.events',
        'toastr',
        'ngFileUpload'
    ]);

    DataFoundry.constant('GLOBAL', {
        size: 10,
        host: '/oapi/v1',
        upload_url: '/uploadimage',
        host_k8s: '/api/v1',
        uploadimage: '/uploadimage',
        broker_apigroup: '/apis/prd.asiainfo.com/v1',
        broker_ws_apigroup: '/ws/apis/prd.asiainfo.com/v1',
        host_ws_apis: '/ws/apis/apps/v1beta1',
        host_newk8s: '/apis/autoscaling/v1',
        host_ws_apisextensions: '/ws/apis/extensions/v1beta1',
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
        //host_webhooks: 'https://lab.new.dataos.io',
        host_webhooks: '<WEBHOOK_PREFIX>',
         //service_url: '.prd.dataos.io',
        service_url: '<ROUTER_DOMAIN_SUFFIX>',
        //internal_registry:'docker-registry.default.svc:5000',
        internal_registry: '<INTERNAL_REGISTRY_ADDR>',
        //service_url:'.cloud.new.dataos.io',
        common_url: '<REGISTRY_PUBLIC_ADDR>',
        private_url: '<REGISTRY_PRIVATE_ADDR>'
           // common_url:'registry.dataos.io',
           // private_url:'registry.dataos.io'

    })
        .constant('AUTH_EVENTS', {
            loginNeeded: 'auth-login-needed',
            loginSuccess: 'auth-login-success',
            httpForbidden: 'auth-http-forbidden'
        })
        .constant('IS_SAFARI', /Version\/[\d\.]+.*Safari/.test(navigator.userAgent))

        .config(['$httpProvider', 'GLOBAL', function ($httpProvider) {
            $httpProvider.interceptors.push([
                '$injector',
                function ($injector) {
                    return $injector.get('AuthInterceptor');
                }
            ]);
        }])
        .config(['toastrConfig', function (toastrConfig) {
            angular.extend(toastrConfig, {
                allowHtml: false,
                closeButton: false,
                closeHtml: '<button>&times;</button>',
                extendedTimeOut: 1000,
                iconClasses: {
                    error: 'toast-shibai',
                    info: 'toast-info',
                    success: 'toast-chenggong',
                    warning: 'toast-warning'
                },
                messageClass: 'toast-message',
                onHidden: null,
                onShown: null,
                onTap: null,
                progressBar: false,
                tapToDismiss: true,
                //templates: {
                //    toast: 'directives/toast/toast.html',
                //    progressbar: 'directives/progressbar/progressbar.html'
                //},
                timeOut: 1000,
                titleClass: 'toast-title',
                toastClass: 'toast'
            });
        }])
        .run(['$rootScope', 'account', '$state', 'Cookie','User','$http',
            function ($rootScope, account, $state, Cookie,User,$http) {

                //var allapi= {
                //    apis:{
                //        "hostPort": "127.0.0.1:8080",
                //        "prefix": "/apis",
                //        "groups": {}
                //    },
                //    api:{
                //        openshift:{
                //            "hostPort": "127.0.0.1:8080",
                //            "prefix": "/oapi",
                //            "resources":{
                //                v1:{}
                //            }
                //        },
                //        k8s:{ "hostPort": "127.0.0.1:8080",
                //            "prefix": "/api",
                //            "resources": {
                //                v1:{}
                //            }
                //        }
                //    }
                //
                //
                //}
                //function getapis (getstr){
                //    var promise = new Promise(function (resolve, reject) {
                //        $http({
                //            method: 'GET',
                //            url: getstr,
                //        }).success(function (apis) {
                //            //var arrstr = data.join(',');
                //            resolve(apis)
                //        })
                //    })
                //    return promise
                //}
                //function arr2map (arr,key){
                //    var map ={}
                //    angular.forEach(arr,function (item) {
                //        map[item[key]]=item
                //    })
                //    return map
                //}
                //getapis ("/apis").then(function (apis) {
                //    //console.log('apis', apis);
                //    allapi.apis.groups=arr2map(apis.groups,'name');
                //    angular.forEach(allapi.apis.groups, function (item) {
                //        item.preferredVersion=item.preferredVersion.version;
                //        item.versions = arr2map(item.versions,'version');
                //    })
                //    //console.log('allapi.apis.groups', allapi.apis.groups);
                //    return getapis ("/api/v1")
                //}).then(function (api) {
                //
                //    allapi.api.k8s.resources.v1=arr2map(api.resources,'name');
                //
                //    return getapis ("/oapi/v1")
                //}).then(function (oapi) {
                //    allapi.api.openshift.resources.v1=arr2map(oapi.resources,'name');
                //    //console.log('allapi', allapi);
                //    window.OPENSHIFT_CONFIG=allapi
                //})



                window.OPENSHIFT_VERSION = {
                    openshift: "dev-mode",
                    kubernetes: "dev-mode"
                };
                $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
                    $rootScope.transfering = true;


                });

                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    //更新header标题
                    if (navigator.userAgent.indexOf("Firefox") > 0) {
                        // console.log('dasd');
                        $(document).unbind('DOMMouseScroll');


                        $(document).bind('DOMMouseScroll', function (e) {
                            //  console.log('detail', e.detail);
                            //  console.log(toState.name)
                            //console.log(e);

                            if (toState.name !== "home.index") {
                                if (e.detail > 0) {
                                    window.scrollBy(0, 40);
                                } else {
                                    window.scrollBy(0, -40);
                                }
                            }
                        })
                    }
                    if (toState.name !== 'login') {
                        //console.log('namespace',$rootScope.namespace);
                        //console.log('$state.params.namespace', $state.params.namespace);
                        if ($state.params.namespace) {
                            $rootScope.namespace = $state.params.namespace
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
                        scrollTo(0, 0);

                    }
                    if (toState && $rootScope.namespace && $rootScope.region) {

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
                            $('#sidebar-right-fixed').css("marginLeft", 0)
                        } else {
                            $rootScope.showsidebar = true;
                            $('#sidebar-right-fixed').css("marginLeft", 188)
                        }

                        //跳转购买套餐


                    }
                    //console.log("Cookie.get('namespace')",Cookie.get('namespace'));
                    var namespace = Cookie.get('namespace')
                    $rootScope.app = [
                        {name: '部署镜像', url: 'console.deployments@' + namespace, stateUrl: null, children: []},
                        {name: '容器状态', url: 'console.pods@' + namespace, stateUrl: null, children: []},
                        {name: '服务地址', url: 'console.services@' + namespace, stateUrl: null, children: []},
                        {name: '域名管理', url: 'console.routes@' + namespace, stateUrl: null, children: []},
                        {name: '有状态集', url: 'console.stateful-sets@' + namespace, stateUrl: null, children: []},
                    ];
                    $rootScope.imageChild = [
                        {name: '构建镜像', url: 'console.private-image@' + namespace, stateUrl: null, children: []},
                        {name: '仓库镜像', url: 'console.repository-image@' + namespace, stateUrl: null, children: []},
                    ];
                    $rootScope.resources = [
                        {
                            name: '存储卷',
                            url: 'console.resource_persistentVolume@' + namespace,
                            stateUrl: null,
                            children: []
                        },
                        {name: '配置卷', url: 'console.resource_configMap@' + namespace, stateUrl: null, children: []},
                        {name: '密钥卷', url: 'console.resource_secret@' + namespace, stateUrl: null, children: []}
                    ];

                    $rootScope.dataForTheTree = [
                        {
                            name: '仪表盘',
                            img: 'icon25 icon25-dashboard',
                            url: 'console.dashboard@' + namespace,
                            stateUrl: null,
                            children: []
                        },
                        {
                            name: '代码构建',
                            img: 'icon25 icon25-build',
                            url: 'console.build@' + namespace,
                            stateUrl: null,
                            children: []
                        },
                        {
                            name: '镜像仓库',
                            img: 'icon25 icon25-repository',
                            url: null,
                            stateUrl: null,
                            children: $rootScope.imageChild
                        },
                        {
                            name: '流水线',
                            img: 'icon25 icon25-pipeline',
                            url: 'console.pipeline@' + namespace,
                            stateUrl: null,
                            children: []
                        },
                        {
                            name: '容器应用',
                            img: 'icon25 icon25-deployment',
                            url: null,
                            stateUrl: null,
                            children: $rootScope.app
                        },
                        //{ name: '后端服务', img: 'icon25 icon25-service', url: 'console.backing_service@'+namespace, stateUrl: null, children: [] },
                        {
                            name: '资源管理',
                            img: 'icon25 icon25-resource',
                            url: null,
                            stateUrl: null,
                            children: $rootScope.resources
                        },
                        {
                            name: '监视',
                            img: 'icon25 icon25-repository',
                            url: 'console.monitoring@' + namespace,
                            stateUrl: null,
                            children: []
                        }

                    ];
                    //console.log('toState.name', toState.name);
                    if (toState && toState.name) {
                        //console.log("toState.name.indexOf('_configMap')", toState.name.indexOf('_configMap'));
                        $rootScope.console.state = toState.name;
                        if(toState.name == "login"){
                            User.get({name: '~', region: $rootScope.region}, function (res) {
                                $state.go("console.dashboard", {namespace: $rootScope.namespace});
                                $rootScope.dataForTheTree[0].stateUrl = toState.name
                            })
                        }

                        if (toState.name.indexOf('dashboard') != -1) {
                            $rootScope.dataForTheTree[0].stateUrl = toState.name
                        } else if (toState.name.indexOf('build') != -1) {
                            $rootScope.dataForTheTree[1].stateUrl = toState.name;
                        } else if (toState.name.indexOf('repository-image') !== -1 || toState.name.indexOf('primage_detail') !== -1) {
                            $rootScope.imageChild[1].stateUrl = toState.name;
                        } else if (toState.name.indexOf('private-image') !== -1 || toState.name.indexOf('image_detail') !== -1 || toState.name.indexOf('uploadimage') !== -1) {
                            $rootScope.imageChild[0].stateUrl = toState.name;
                        } else if (toState.name.indexOf('pipeline') != -1) {
                            $rootScope.dataForTheTree[3].stateUrl = toState.name;
                        }
                        else if (toState.name.indexOf('monitoring') != -1) {
                            $rootScope.dataForTheTree[6].stateUrl = toState.name;
                        }

                        else if (toState.name.indexOf('deployment') != -1 || toState.name.indexOf('quick_deploy') != -1 || toState.name.indexOf('service_create') != -1 || toState.name.indexOf('replication') != -1|| toState.name.indexOf('replicaset') != -1) {
                            $rootScope.app[0].stateUrl = toState.name;
                        } else if (toState.name.indexOf('stateful-sets') != -1) {
                            $rootScope.app[4].stateUrl = toState.name;
                        } else if (toState.name.indexOf('pods') != -1) {
                            $rootScope.app[1].stateUrl = toState.name;
                        } else if (toState.name.indexOf('services') != -1 || toState.name.indexOf('service_details') != -1) {
                            $rootScope.app[2].stateUrl = toState.name;
                        }
                        else if (toState.name.indexOf('route') != -1) {
                            $rootScope.app[3].stateUrl = toState.name;
                        }
                        // else if(toState.name.indexOf('resource_management') != -1 || toState.name.indexOf('constantly_') != -1 || toState.name.indexOf('config_') != -1 || toState.name.indexOf('create_secret') != -1 || toState.name.indexOf('secret_detail') != -1){
                        //     $rootScope.dataForTheTree[4].stateUrl = toState.name;
                        // }
                        else if (toState.name.indexOf('_persistentVolume') != -1) {
                            $rootScope.resources[0].stateUrl = toState.name;
                        } else if (toState.name.indexOf('_configMap') != -1) {
                            $rootScope.resources[1].stateUrl = toState.name;
                        } else if (toState.name.indexOf('_secret') != -1) {
                            $rootScope.resources[2].stateUrl = toState.name;
                        }
                        $rootScope.transfering = false;
                    }

                });
            }
        ]);

    return DataFoundry;
});