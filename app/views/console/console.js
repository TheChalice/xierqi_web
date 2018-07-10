'use strict';

angular.module('console', [
        {
            files: [
                'components/header/header.js',
                'components/sidebar/sidebar.js',
                'views/console/console.css'
            ]
        }
    ])
    .controller('ConsoleCtrl', ['creatproject','$timeout', 'sessiontoken', 'regions', 'account', '$http', '$rootScope', '$scope', '$log', 'AUTH_EVENTS', 'User', 'user', 'Project', 'Cookie', '$state','GLOBAL','$stateParams','$location',
        function (creatproject,$timeout, sessiontoken, regions, account, $http, $rootScope, $scope, $log, AUTH_EVENTS, User, user, Project, Cookie, $state,GLOBAL,$stateParams,$location) {

            //console.log('$state', $state);

            console.log('$stateParams', $stateParams);
            console.log('$location', $location);

            if (GLOBAL.sso_switch === 'true') {
                if (!Cookie.get('df_access_token')) {
                    Cookie.set('df_access_token', user.access_token + ',' + user.access_token, 23 * 3600 * 1000);
                }
                if (!Cookie.get('region')) {
                    Cookie.set('region', 'cn-north-1', 24 * 3600 * 1000);
                }

                //Cookie.set('df_access_token', user.access_token + ',' + user.access_token, 23 * 3600 * 1000);

                if ($stateParams.namespace) {
                    if ($rootScope.user) {
                        console.log('$rootScope.user', $rootScope.user.metadata.name);
                    } else {

                        $rootScope.user = {metadata:{
                            name:$stateParams.namespace
                        }};
                    }
                    var namespace = Cookie.get('namespace');
                    var region = Cookie.get('region');
                    if (region) {
                        $rootScope.region = region;
                    } else {
                        console.log('noregion');
                        $rootScope.region = 'cn-north-1';
                        Cookie.set('region', $rootScope.region, 10 * 365 * 24 * 3600 * 1000);
                    }

                    if (namespace) {
                        $rootScope.namespace = namespace;
                    } else {
                        //console.log('nonamespace');
                        $rootScope.namespace = $rootScope.user.metadata.name;
                        Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                    }
                }

            }else {
                if ($rootScope.user) {
                    console.log('$rootScope.user', $rootScope.user.metadata.name);
                } else {

                    $rootScope.user = user;
                }
                var namespace = Cookie.get('namespace');
                var region = Cookie.get('region');
                if (region) {
                    $rootScope.region = region;
                } else {
                    console.log('noregion');
                    $rootScope.region = 'cn-north-1';
                    Cookie.set('region', $rootScope.region, 10 * 365 * 24 * 3600 * 1000);
                }

                if (namespace) {
                    $rootScope.namespace = namespace;
                } else {
                    //console.log('nonamespace');
                    $rootScope.namespace = $rootScope.user.metadata.name;
                    Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                }

            }

            //$log.info('Console', $state.current.name);



            if ($state.current.name === 'console.plan' || $state.current.name === 'console.pay' || $state.current.name === 'console.noplan') {
                $rootScope.showsidebar = false;
                $('#sidebar-right-fixed').css("marginLeft", 0)
            } else {
                $rootScope.showsidebar = true;
                $('#sidebar-right-fixed').css("marginLeft", 180)
            }
            $scope.colonyList = [
                {
                    title:'运营管控',
                    children:[
                        {
                            subtitle:'服务接入',
                            subChild:[
                                {
                                    url:'https://sso-cm.southbase.prd.dataos.io/#/console/service',
                                    urlName:'服务管理'
                                },
                                {
                                    url:'',
                                    urlName:'服务接入'
                                }
                            ]

                        },
                        {
                            subtitle:'租户管理',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'租户列表'
                                },
                                {
                                    url:'',
                                    urlName:'服务实例'
                                },
                                {
                                    url:'',
                                    urlName:'服务资源'
                                },
                                {
                                    url:'',
                                    urlName:'工具申请'
                                },
                                {
                                    url:'',
                                    urlName:'资源监控'
                                },
                                {
                                    url:'',
                                    urlName:'成员授权'
                                },

                            ]

                        }
                    ]

                },
                {
                    title:'数据资产',
                    children:[
                        {
                            subtitle:'数据开发',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'团队管理'
                                },
                                {
                                    url:'',
                                    urlName:'开发者中心'
                                },
                                {
                                    url:'',
                                    urlName:'数据开发'
                                },
                                {
                                    url:'',
                                    urlName:'脚本开发'
                                },
                                {
                                    url:'',
                                    urlName:'数据查询'
                                },
                            ]

                        },
                        {
                            subtitle:'任务调度',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'任务监控'
                                },
                                {
                                    url:'',
                                    urlName:'任务配置'
                                },
                                {
                                    url:'',
                                    urlName:'团队任务监控'
                                },
                                {
                                    url:'',
                                    urlName:'调度管理'
                                }
                            ]

                        },
                        {
                            subtitle:'数据规划',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'架构设计'
                                },
                                {
                                    url:'',
                                    urlName:'流程管理'
                                },
                                {
                                    url:'',
                                    urlName:'数据标准'
                                }
                            ]

                        },
                        {
                            subtitle:'数据治理',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'元数据管理'
                                },
                                {
                                    url:'',
                                    urlName:'生命周期'
                                },
                                {
                                    url:'',
                                    urlName:'数据质量'
                                }
                            ]

                        },
                        {
                            subtitle:'资产管理',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'数据资产地图'
                                },
                                {
                                    url:'',
                                    urlName:'数据资产目录'
                                },
                                {
                                    url:'',
                                    urlName:'数据资产盘点'
                                },
                                {
                                    url:'',
                                    urlName:'数据资产运维'
                                },
                                {
                                    url:'',
                                    urlName:'数据资产体检'
                                },
                            ]

                        },
                        {
                            subtitle:'数据安全',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'敏感数据管理'
                                },
                                {
                                    url:'',
                                    urlName:'数据安全策略'
                                },
                                {
                                    url:'',
                                    urlName:'数据安全审计'
                                }
                            ]

                        },
                        {
                            subtitle:'数据服务',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'API管理'
                                },
                                {
                                    url:'',
                                    urlName:'服务授权'
                                },
                                {
                                    url:'',
                                    urlName:'服务调用监控'
                                },
                                {
                                    url:'',
                                    urlName:'数据开放目录'
                                }
                            ]

                        }
                    ]

                },
                {
                    title:'统一运维',
                    children:[
                        {
                            subtitle:'平台监控',
                            subChild:[
                                {
                                    url:'http://10.1.253.98:9080/AIOP-WEB/#g=1&p=zjjk&c=1',
                                    urlName:'主机监控'
                                },
                                {
                                    url:'',
                                    urlName:'集群监控'
                                },
                                {
                                    url:'',
                                    urlName:'租户监控'
                                },
                                {
                                    url:'',
                                    urlName:'容器监控'
                                }
                            ]

                        },
                        {
                            subtitle:'服务监控',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'中间件监控'
                                },
                                {
                                    url:'',
                                    urlName:'租户服务监控'
                                },
                                {
                                    url:'',
                                    urlName:'采集服务监控'
                                }
                            ]

                        },
                        {
                            subtitle:'数据监控',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'作业调度监控'
                                },
                                {
                                    url:'',
                                    urlName:'接口调度监控'
                                },
                                {
                                    url:'',
                                    urlName:'数据资产视图'
                                }
                            ]

                        },
                        {
                            subtitle:'应用监控',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'应用报表监控'
                                },
                                {
                                    url:'',
                                    urlName:'应用系统监控'
                                }
                            ]

                        },
                        {
                            subtitle:'监控告警',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'实时告警'
                                },
                                {
                                    url:'',
                                    urlName:'告警配置'
                                }
                            ]

                        },
                        {
                            subtitle:'知识库管理',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'工单管理'
                                },
                                {
                                    url:'',
                                    urlName:'知识库'
                                }
                            ]

                        }
                    ]

                },
                {
                    title:'应用管理',
                    children:[
                        {
                            subtitle:'应用管理',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'应用列表'
                                },
                                {
                                    url:'',
                                    urlName:'应用发布'
                                },
                                {
                                    url:'',
                                    urlName:'应用生命周期'
                                }
                            ]

                        },
                        {
                            subtitle:'代码构建',
                            url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/build#/console/project/'+$rootScope.namespace+'/build',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'构建任务管理'
                                },
                                {
                                    url:'',
                                    urlName:'VM管理'
                                },
                                {
                                    url:'',
                                    urlName:'推送镜像仓库'
                                }
                            ]

                        },
                        {
                            subtitle:'容器管理',
                            subChild:[
                                {
                                    url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/pods#/console/project/'+$rootScope.namespace+'/pods',
                                    urlName:'容器状态'
                                },
                                {
                                    url:'',
                                    urlName:'存储卷管理'
                                },
                                {
                                    url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/routes#/console/project/'+$rootScope.namespace+'/routes',
                                    urlName:'域名管理'
                                },
                                {
                                    url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/deployments#/console/project/'+$rootScope.namespace+'/deployments',
                                    urlName:'部署镜像'
                                },
                                // {
                                //     url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/private-image#/console/project/'+$rootScope.namespace+'/private-image',
                                //     urlName:'构建镜像'
                                // },
                                {
                                    url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/repository-image#/console/project/'+$rootScope.namespace+'/repository-image',
                                    urlName:'镜像仓库管理'
                                }
                            ]

                        },
                        {
                            subtitle:'自定义编排',
                            subChild:[
                                {
                                    url:'',
                                    urlName:'yaml编排'
                                },
                                {
                                    url:'',
                                    urlName:'yaml文件管理'
                                },
                                {
                                    url:'',
                                    urlName:'yaml执行'
                                }
                            ]

                        }
                    ]

                },
            ]

        }]);

