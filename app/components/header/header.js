'use strict';

angular.module("console.header", [{
    files: ['components/header/header.css']
}])

    .directive('cHeader', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/header/header.html',
            controller: ['allTenants','GLOBAL', '$timeout', '$log', 'Project', 'account', 'regions', 'Toast', 'Addmodal', '$http', '$location', 'orgList', '$rootScope', '$scope', '$window', '$state', 'Cookie', '$stateParams',
                function (allTenants,GLOBAL, $timeout, $log, Project, account, regions, Toast, Addmodal, $http, $location, orgList, $rootScope, $scope, $window, $state, Cookie, $stateParams) {
                    var cmHost = 'http://sso-cm.southbase.prd.dataos.io/';
                    var dacpHost = 'http://10.1.235.155:9089/dacp/';
                    var aiopHost = 'http://10.1.253.98:9080/AIOP-WEB';
                    var dfHost = 'http://sso-console.southbase.prd.dataos.io/';

                    var columns = [
                        {
                            label: '运营管控',
                            url: cmHost,
                            children: [
                                {
                                    name: '',
                                    label: '服务接入',
                                    url: '',
                                    children: [
                                        { name: '', label: '服务管理', url: '', children: []},
                                        { name: '', label: '服务接入', url: '', children: []},
                                    ]
                                },
                                {
                                    name: '',
                                    label: '租户管理',
                                    url: '',
                                    children: [
                                        { name: '', label: '租户列表', url: '', children: []},
                                        { name: '', label: '服务实例', url: '', children: []},
                                        { name: '', label: '服务资源', url: '', children: []},
                                        { name: '', label: '工具申请', url: '', children: []},
                                        { name: '', label: '资源监控', url: '', children: []},
                                        { name: '', label: '成员授权 ', url: '', children: []},
                                    ]
                                },
                            ]
                        },
                        {
                            label: '数据资产',
                            url: dacpHost+'/dataps/frame?menuActive=use-home',
                            children: [
                                {
                                    name: '',
                                    label: '数据开发',
                                    url: '',
                                    children: [
                                        { name: '', label: '团队管理', url: '', children: []},
                                        { name: '', label: '开发者中心', url: '', children: []},
                                        { name: '', label: '数据开发', url: '', children: []},
                                        { name: '', label: '脚本开发', url: '', children: []},
                                        { name: '', label: '数据查询', url: '', children: []},
                                    ]
                                },
                                {
                                    name: '',
                                    label: '任务调度',
                                    url: '',
                                    children: [
                                        { name: '', label: '任务监控', url: '', children: []},
                                        { name: '', label: '任务配置', url: '', children: []},
                                        { name: '', label: '团队任务监控', url: '', children: []},
                                        { name: '', label: '调度管理', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '数据规划',
                                    url: '',
                                    children: [
                                        { name: '', label: '架构设计', url: '', children: []},
                                        { name: '', label: '流程管理', url: '', children: []},
                                        { name: '', label: '数据标准', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '数据治理',
                                    url: '',
                                    children: [
                                        { name: '', label: '元数据管理', url: '', children: []},
                                        { name: '', label: '生命周期', url: '', children: []},
                                        { name: '', label: '数据质量', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '资产管理',
                                    url: '',
                                    children: [
                                        { name: '', label: '数据资产地图', url: '', children: []},
                                        { name: '', label: '数据资产目录', url: '', children: []},
                                        { name: '', label: '数据资产盘点', url: '', children: []},
                                        { name: '', label: '数据资产运维', url: '', children: []},
                                        { name: '', label: '数据资产体检', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '数据安全',
                                    url: '',
                                    children: [
                                        { name: '', label: '敏感数据管理', url: '', children: []},
                                        { name: '', label: '数据安全策略', url: '', children: []},
                                        { name: '', label: '数据安全审计', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '数据服务',
                                    url: '',
                                    children: [
                                        { name: '', label: 'API管理', url: '', children: []},
                                        { name: '', label: '服务授权', url: '', children: []},
                                        { name: '', label: '服务调用监控', url: '', children: []},
                                        { name: '', label: '数据开放目录', url: '', children: []}
                                    ]
                                }
                            ]
                        },
                        {
                            label: '统一运维',
                            url:  aiopHost+'/#g=1&p=home-zl&c=1',
                            children: [
                                {
                                    name: '',
                                    label: '平台监控',
                                    url: '',
                                    children: [
                                        { name: '', label: '主机监控', url: '', children: []},
                                        { name: '', label: '集群监控', url: '', children: []},
                                        { name: '', label: '租户监控', url: '', children: []},
                                        { name: '', label: '容器监控', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '服务监控',
                                    url: '',
                                    children: [
                                        { name: '', label: '中间件监控', url: '', children: []},
                                        { name: '', label: '租户服务监控', url: '', children: []},
                                        { name: '', label: '采集服务监控', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '数据监控',
                                    url: '',
                                    children: [
                                        { name: '', label: '作业调度监控', url: '', children: []},
                                        { name: '', label: '接口调度监控', url: '', children: []},
                                        { name: '', label: '数据资产视图', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '应用监控',
                                    url: '',
                                    children: [
                                        { name: '', label: '应用报表监控', url: '', children: []},
                                        { name: '', label: '应用系统监控', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '监控告警',
                                    url: '',
                                    children: [
                                        { name: '', label: '实时告警', url: '', children: []},
                                        { name: '', label: '告警配置', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '知识库管理',
                                    url: '',
                                    children: [
                                        { name: '', label: '工单管理', url: '', children: []},
                                        { name: '', label: '知识库', url: '', children: []}
                                    ]
                                }
                            ]
                        },
                        {
                            label: '应用管理',
                            url: dfHost,
                            children: [
                                {
                                    name: '',
                                    label: '应用管理',
                                    url: '',
                                    children: [
                                        { name: '', label: '应用列表', url: '', children: []},
                                        { name: '', label: '应用发布', url: '', children: []},
                                        { name: '', label: '应用生命周期', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '代码构建',
                                    url: '',
                                    children: [
                                        { name: '', label: '构建任务管理', url: '', children: []},
                                        { name: '', label: 'VM管理', url: '', children: []},
                                        { name: '', label: '推送镜像仓库', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '容器管理',
                                    url: '',
                                    children: [
                                        { name: '', label: '容器状态', url: '', children: []},
                                        { name: '', label: '存储卷管理', url: '', children: []},
                                        { name: '', label: '域名管理', url: '', children: []},
                                        { name: '', label: '镜像部署', url: '', children: []},
                                        { name: '', label: '镜像仓库管理', url: '', children: []}
                                    ]
                                },
                                {
                                    name: '',
                                    label: '自定义编排',
                                    url: '',
                                    children: [
                                        { name: '', label: 'yaml编排', url: '', children: []},
                                        { name: '', label: 'yaml文件管理', url: '', children: []},
                                        { name: '', label: 'yaml执行', url: '', children: []}
                                    ]
                                }
                            ]
                        }
                    ];
                    $scope.columns = columns;
                /////////能力视图导航；
                //     $scope.colonyList = [
                //         {
                //             title:'运营管控',
                //             children:[
                //                 {
                //                     subtitle:'服务接入',
                //                     subChild:[
                //                         {
                //                             url:'https://sso-cm.southbase.prd.dataos.io/#/console/service',
                //                             urlName:'服务管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'服务接入'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'租户管理',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'租户列表'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'服务实例'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'服务资源'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'工具申请'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'资源监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'成员授权'
                //                         },
                //
                //                     ]
                //
                //                 }
                //             ]
                //
                //         },
                //         {
                //             title:'数据资产',
                //             children:[
                //                 {
                //                     subtitle:'数据开发',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'团队管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'开发者中心'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据开发'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'脚本开发'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据查询'
                //                         },
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'任务调度',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'任务监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'任务配置'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'团队任务监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'调度管理'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'数据规划',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'架构设计'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'流程管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据标准'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'数据治理',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'元数据管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'生命周期'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据质量'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'资产管理',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'数据资产地图'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据资产目录'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据资产盘点'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据资产运维'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据资产体检'
                //                         },
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'数据安全',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'敏感数据管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据安全策略'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据安全审计'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'数据服务',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'API管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'服务授权'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'服务调用监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据开放目录'
                //                         }
                //                     ]
                //
                //                 }
                //             ]
                //
                //         },
                //         {
                //             title:'统一运维',
                //             children:[
                //                 {
                //                     subtitle:'平台监控',
                //                     subChild:[
                //                         {
                //                             url:'http://10.1.253.98:9080/AIOP-WEB/#g=1&p=zjjk&c=1',
                //                             urlName:'主机监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'集群监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'租户监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'容器监控'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'服务监控',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'中间件监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'租户服务监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'采集服务监控'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'数据监控',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'作业调度监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'接口调度监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'数据资产视图'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'应用监控',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'应用报表监控'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'应用系统监控'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'监控告警',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'实时告警'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'告警配置'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'知识库管理',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'工单管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'知识库'
                //                         }
                //                     ]
                //
                //                 }
                //             ]
                //
                //         },
                //         {
                //             title:'应用管理',
                //             children:[
                //                 {
                //                     subtitle:'应用管理',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'应用列表'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'应用发布'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'应用生命周期'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'代码构建',
                //                     url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/build#/console/project/'+$rootScope.namespace+'/build',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'构建任务管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'VM管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'推送镜像仓库'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'容器管理',
                //                     subChild:[
                //                         {
                //                             url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/pods#/console/project/'+$rootScope.namespace+'/pods',
                //                             urlName:'容器状态'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'存储卷管理'
                //                         },
                //                         {
                //                             url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/routes#/console/project/'+$rootScope.namespace+'/routes',
                //                             urlName:'域名管理'
                //                         },
                //                         {
                //                             url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/deployments#/console/project/'+$rootScope.namespace+'/deployments',
                //                             urlName:'部署镜像'
                //                         },
                //                         // {
                //                         //     url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/private-image#/console/project/'+$rootScope.namespace+'/private-image',
                //                         //     urlName:'构建镜像'
                //                         // },
                //                         {
                //                             url:'https://sso-console.southbase.prd.dataos.io/?refer=/console/project/'+$rootScope.namespace+'/repository-image#/console/project/'+$rootScope.namespace+'/repository-image',
                //                             urlName:'镜像仓库管理'
                //                         }
                //                     ]
                //
                //                 },
                //                 {
                //                     subtitle:'自定义编排',
                //                     subChild:[
                //                         {
                //                             url:'',
                //                             urlName:'yaml编排'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'yaml文件管理'
                //                         },
                //                         {
                //                             url:'',
                //                             urlName:'yaml执行'
                //                         }
                //                     ]
                //
                //                 }
                //             ]
                //
                //         },
                //     ]
                    /////////能力视图链接跳转
                    $scope.colonyUrlGo = function(url){
                        if(url){
                            window.location.href=url
                        }
                    }
                    // 2018/08/23 能力视图去掉 begin
                    // $scope.colonyNavEnter = function(){
                    //     $('.menu-list').addClass('visible');
                    //     $('.colony-nav').css( 'background',' #252b39');
                    // }
                    // $scope.colonyNavLeave = function(){
                    //     // $('.visible').height(0);
                    //     $('.menu-list').removeClass('visible');
                    //     $('.colony-nav').css( 'background','#303643');
                    // }
                    // 2018/08/23 能力视图去掉 end
                //////获取租户数据
                    allTenants.query({name: "admin"}, function(data){
                        createTree(data);
                        console.log('createTree(data)',$scope.tenantsTree);

                    }, function(res) {
                        //todo 错误处理
                    });
                    /////点击其他地方隐藏。。。比较落后
                    // document.addEventListener("click",function(){
                    //     alert(1);
                    //     if($scope.tenantsBox){
                    //         $scope.tenantsBox = false;
                    //         $scope.$apply();
                    //     }
                    // });
                    document.getElementById("tenants-box").addEventListener("click",function(event){
                        event=event||window.event;
                        event.stopPropagation();
                    });
                    //点击其他地方隐藏
                    $(document.body).click(function(e){
                        var width = $('.head_drop_set').width();
                        var windowWidth = $(window).width();
                        if(e.clientY>52||(e.clientY<52&&e.clientX<windowWidth-width)){
                            $scope.tenantsBox = false;
                            $scope.$apply();
                        }
                    })


                    
                    $scope.tenantsBox = false;
                    $scope.tenantsIsShow = function(){
                        console.log('tenantsIsShow');
                        if($scope.tenantsBox){
                            $scope.tenantsBox = false;
                        }else{
                            $scope.tenantsBox = true;
                        }
                    }
                    $scope.curTenantName = $rootScope.namespace;///////默认为单点登录账号；
                    ////////////树点击事件
                    $scope.SelectedNode = function(node){
                        console.log('$scope.SelectedNode',node);
                        $scope.curTenantName = node;
                        $rootScope.namespace = $scope.curTenantName;
                        console.log('$rootScope.namespace',$rootScope.namespace);
                    }
                    /////////获取租户数据后组合成符合树符合的多维数组
                    function createTree(trees) {
                        $scope.tenantsTree = [];
                        $scope.treemap = {};
                        angular.forEach(trees, function (item) {
                            $scope.treemap[item.id] = item;
                            $scope.treemap[item.id].children = [];
                        });
                        angular.forEach(trees, function(item) {
                            if (item.parentId) {
                                if ($scope.treemap[item.parentId]) {
                                    $scope.treemap[item.parentId].children.push(item);
                                } else {
                                    delete $scope.treemap[item.id].parentId;
                                    $scope.tenantsTree.push($scope.treemap[item.id]);
                                }
                            } else {
                                $scope.tenantsTree.push($scope.treemap[item.id]);
                            }
                        });
                        var cinf = function(father) {
                            angular.forEach(father.children, function(child) {
                                cinf(child);
                                angular.forEach(child.bsis, function(bsi) {
                                    father.bsis.push(bsi);
                                });
                            });
                        };
                        angular.forEach($scope.tenantsTree, function(tree) {
                            cinf(tree);
                        });
                        $scope.selected = $scope.tenantsTree[0];

                    }

                    ///////分区
                    if (navigator.userAgent.indexOf("Firefox") > 0) {
                        $('#testjt').unbind('DOMMouseScroll');
                        $('#testjt').bind('DOMMouseScroll', function (e) {
                            if (e.detail > 0) {
                                document.getElementById('testjt').scrollBy(0, 40);
                            } else {
                                document.getElementById('testjt').scrollBy(0, -40);
                            }
                        })
                    }
                    //$scope.curregion = $rootScope.region;
                    //console.log('$rootScope.user',$rootScope.user);
                    //console.log('$rootScope.namespace',$rootScope.namespace);
                    //if ($rootScope.user.metadata.name) {
                    //
                    //}
                    //$scope.checkregion = function (res, id) {
                    //    $scope.curregion = res;
                    //    $rootScope.namespace=$rootScope.user.metadata.name
                    //    Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                    //    $rootScope.region = id
                    //    Cookie.set('region', id, 10 * 365 * 24 * 3600 * 1000);
                    $scope.nolohout = false;
                    if (GLOBAL.sso_switch === 'true') {
                        $scope.nolohout = true;
                    }
                    //   // console.log($state.current.name);
                    //    if ($state.current.name === 'console.dashboard') {
                    //        $state.reload();
                    //    } else {
                    //        $state.go("console.dashboard", { namespace: $rootScope.namespace });
                    //    }
                    //    //$state.reload();
                    //}
                    $scope.$watch('namespace', function (n, o) {
                        if (n === o) {
                            return
                        }
                        if (n !== "") {
                            if (n === $rootScope.user.metadata.name) {
                                $scope.orgimage = false;
                            } else {
                                $scope.orgimage = true;
                            }
                            loadProject()
                        }

                    })
                    $scope.$watch('changedisplayname', function (n, o) {
                        if (n === o) {
                            return
                        }
                        //console.log($rootScope.changedisplayname);

                        //if (n === $rootScope.user.metadata.name) {
                        //    $scope.orgimage = false;
                        //} else {
                        //    $scope.orgimage = true;
                        //}
                        loadProject()

                    })
                    var loadProject = function () {
                        //$log.info("load project");
                        Project.get({ region: $rootScope.region }, function (data) {

                            angular.forEach(data.items, function (item, i) {
                                //console.log('$rootScope.namespace', $rootScope.namespace);
                                if (item.metadata.name === $rootScope.namespace) {

                                    $scope.projectname = item.metadata.annotations['openshift.io/display-name'] === '' || !item.metadata.annotations['openshift.io/display-name'] ? item.metadata.name : item.metadata.annotations['openshift.io/display-name'];
                                    //console.log('item', item);
                                }
                            })

                            angular.forEach(data.items, function (item, i) {


                                //console.log($rootScope.user.metadata.name);
                                data.items[i].sortname = item.metadata.annotations['openshift.io/display-name'] || item.metadata.name;


                            })
                            data.items.sort(function (x, y) {
                                return x.sortname > y.sortname ? 1 : -1;
                            });
                            angular.forEach(data.items, function (project, i) {

                                if (/^[\u4e00-\u9fa5]/i.test(project.metadata.annotations['openshift.io/display-name'])) {
                                    //console.log(project.metadata.annotations['openshift.io/display-name']);
                                    //data.items.push(project);
                                    data.items.unshift(project);

                                    data.items.splice(i + 1, 1);
                                }
                            });

                            $rootScope.projects = data.items;
                        }, function (res) {
                            $log.info("find project err", res);
                        });
                    };

                    loadProject()

                    //regions.query({}, function (data) {
                    //    //console.log('regions', data);
                    //    $scope.regions = data;
                    //    $scope.copyregions = angular.copy(data);
                    //    angular.forEach(data, function (region, i) {
                    //        if (region.identification === $rootScope.region) {
                    //            $scope.curregion = region.region_describe;
                    //        }
                    //
                    //    })
                    //})

                    $scope.$watch('curregion', function (n, o) {
                        if (n === o) {
                            return
                        }
                        //$scope.regionlist=$scope.copyregionlist;
                        var arr = angular.copy($scope.copyregions)
                        if ($scope.regions) {
                            //console.log($scope.regionlist,$scope.copyregionlist);
                            angular.forEach($scope.copyregions, function (item, i) {
                                if (item.region_describe === n) {
                                    //console.log(item.region_describe, $scope.regionlist);
                                    arr.splice(i, 1);

                                }
                            })
                            $scope.regions = arr;
                        }
                    })
                    //$scope.regionlist = [
                    //    {regionname : '一区一区'},
                    //    {regionname : '二区二区'}
                    //]


                    //if ($state.params.useorg) {
                    //    $http({
                    //        url: '/lapi/orgs/' + $state.params.useorg,
                    //        method: 'GET'
                    //    }).success(function (data, header, config, status, orgid) {
                    //        //alert(data.name)
                    //        $scope.checked = data.name;
                    //    }).error(function (data, header, config, status) {
                    //    });
                    //
                    //}

                    //$scope.checked = '';

                    //if($rootScope.delOrgs){
                    //    $http({
                    //        url:'/lapi/orgs/'+$state.params.useorg,
                    //        method:'GET'
                    //    }).success(function(data,header,config,status,orgid){
                    //        $scope.checked = data.name;
                    //    }).error(function(data,header,config,status){
                    //    });
                    //}

                    //$scope.$watch('delOrgs', function (n, o) {
                    //    if (n == o) {
                    //        return;
                    //    }
                    //    if (n) {
                    //        //alert()
                    //        $scope.checked = $rootScope.user.metadata.name;
                    //        $http({
                    //            url: '/lapi/orgs',
                    //            method: 'GET'
                    //        }).success(function (data, header, config, status, orgid) {
                    //            $scope.userorgs = data.orgnazitions;
                    //            $rootScope.delOrgs = false;
                    //        }).error(function (data, header, config, status) {
                    //        });
                    //    } else {
                    //        //$rootScope.isorg = false;
                    //    }
                    //})
                    //$scope.$watch('$state.params.useorg', function (n, o) {
                    //    if (n == o) {
                    //        return;
                    //    }
                    //    if ($state.params.useorg) {
                    //        //$rootScope.isorg = true;
                    //        $scope.neworgid = $state.params.useorg
                    //    } else {
                    //        //$rootScope.isorg = false;
                    //    }
                    //})
                    //$rootScope.isorg = false;
                    //$scope.$watch('namespace', function (n, o) {
                    //    //console.log('new', n);
                    //    if (n == o) {
                    //        return
                    //    }
                    //    if (n.indexOf('org') == -1) {
                    //        $rootScope.isorg = false;
                    //        $http({
                    //            url: '/lapi/inbox_stat',
                    //            method: 'GET',
                    //        }).success(function (res) {
                    //            //console.log("test the inbox stat", res);
                    //            if (res.data == null) {
                    //                res.data = {};
                    //            }
                    //            if (res.data.sitenotify || res.data.accountms || res.data.alert) {
                    //                $scope.isshow = true;
                    //            } else {
                    //                $scope.isshow = false;
                    //            }
                    //            ;
                    //        }).error(function (data) {
                    //            //console.log("Couldn't get inbox message", data)
                    //        });
                    //        $scope.timer = setInterval(function () {
                    //            $http({
                    //                url: '/lapi/inbox_stat',
                    //                method: 'GET',
                    //            }).success(function (res) {
                    //                //console.log("test the inbox stat", res);
                    //                if (res.data == null) {
                    //                    res.data = {};
                    //                }
                    //                if (res.data.sitenotify || res.data.accountms || res.data.alert) {
                    //                    $scope.isshow = true;
                    //                } else {
                    //                    $scope.isshow = false;
                    //                }
                    //                ;
                    //            }).error(function (data) {
                    //                //console.log("Couldn't get inbox message", data)
                    //            });
                    //        }, 1000000)
                    //    } else {
                    //        clearInterval($scope.timer);
                    //        $rootScope.isorg = true;
                    //    }
                    //
                    //
                    //});
                    //$scope.$on('$destroy', function () {
                    //    clearInterval($scope.timer);
                    //});


                    //account.get({
                    //    namespace: $rootScope.namespace,
                    //    region: $rootScope.region,
                    //    status: "consuming"
                    //}, function (data) {
                    //    //console.log('套餐', data);
                    //    //$rootScope.payment=data;
                    //    if (data.purchased) {
                    $scope.cancreatorg = true
                    //跳转dashboard
                    //    } else {
                    //        $scope.cancreatorg = false
                    //        //跳转购买套餐
                    //    }
                    //})

                    $scope.createOrg = function () {
                        Addmodal.open('创建组织', '组织名称', '', '', 'org').then(function (res) {
                            //orgList.get({}, function (org) {
                            // console.log(org);
                            //console.log(1);

                            Toast.open('创建成功')
                            $timeout(function () {
                                loadProject()
                            }, 2000)

                            //    $scope.userorgs = org.orgnazitions;
                            //})
                        })

                    }

                    $scope.back = function () {
                        //console.log($state);
                        //if ($state.current.name == "console.image_detail") {
                        //    $state.go('console.image', { index: 1 })
                        //} else if ($state.current.name == "console.image_Public") {
                        //    $state.go('console.image', { index: 3 })
                        //} else if ($state.current.name == "console.image_regstry") {
                        //    $state.go('console.image', { index: 2 })
                        //} else {
                        $window.history.back();
                        //}
                    };

                    // console.log($location.url().split('/')[2])
                    //if ($location.url().split('/')[2] === 'org') {
                    //    $http({
                    //        url: '/lapi/orgs/' + $location.url().split('/')[3],
                    //        method: 'GET'
                    //    }).success(function (data) {
                    //        // console.log('112',data.name)
                    //        $scope.checked = data.name
                    //    })
                    //} else if ($rootScope.huancun && $rootScope.huancun.name) {
                    //    $scope.checked = $rootScope.huancun.name;
                    //    $rootScope.huancun.name = false
                    //} else if (!$scope.checked) {
                    //    $scope.checked = $rootScope.namespace;
                    //}

                    $scope.backindex = function () {
                        $rootScope.whereclick = '首页';
                        //$state.go('login')
                    }

                    $scope.gotomy = function () {
                        //$scope.checked = $rootScope.user.metadata.name;
                        $rootScope.namespace = $rootScope.user.metadata.name;
                        Cookie.set('namespace', $rootScope.user.metadata.name, 10 * 365 * 24 * 3600 * 1000);
                    }

                    //$scope.goto = function (ind) {
                    //    $scope.checked = $scope.userorgs[ind].name;
                    //    $rootScope.namespace = $scope.userorgs[ind].id;
                    //    $scope.neworgid = $scope.userorgs[ind].id
                    //    //console.log('路由',$state);
                    //    if ($state.current.name == 'console.apply_instance' || $state.current.name == 'console.build_create_new' || $state.current.name == 'console.service_create') {
                    //        return
                    //    } else if ($state.current.url.indexOf(':') !== -1 && $state.current.name !== 'console.dashboard') {
                    //        //$location.url('/'+)
                    //        //console.log($state.current.url.split('/')[1]);
                    //        $location.url('/console/' + $state.current.url.split('/')[1])
                    //    } else if ($state.current.name == 'console.dashboard') {
                    //        //console.log($rootScope.namespace);
                    //        $state.reload();
                    //    }
                    //    //console.log('路由',$state);
                    //
                    //}

                    //orgList.get({}, function (org) {
                    //    // console.log(org);
                    //    $scope.userorgs = org.orgnazitions;
                    //});
                    //图片预加载
                    var images = new Array()

                    function preload() {
                        for (var i = 0; i < arguments.length; i++) {
                            images[i] = new Image()
                            images[i].src = arguments[i]
                        }
                    };

                    preload(
                        "components/sidebar/img/build-active.png",
                        "components/sidebar/img/dashboard-active.png",
                        "components/sidebar/img/deployment-active.png",
                        "components/sidebar/img/make-active.png",
                        "components/sidebar/img/repository-active.png",
                        "components/sidebar/img/resource-active.png",
                        "components/sidebar/img/service-active.png",
                        //"pub/img/myimageh.png",
                        //"pub/img/registimageh.png",
                        //"pub/img/imagecenterh.png",
                        "pub/img/myimage.png",
                        "pub/img/registimage.png",
                        "pub/img/imagecenter.png"
                    );

                    $scope.hasBack = function () {

                        if ($state.current.name == "console.private-image"  || $state.current.name == "console.repository-image" || $state.current.name == "console.resource_secret" || $state.current.name == "console.resource_configMap" || $state.current.name == "console.resource_persistentVolume" || $state.current.name == "console.stateful-sets" || $state.current.name == "console.routes" || $state.current.name == "console.services" || $state.current.name == "console.pods" || $state.current.name == "console.deployments" || $state.current.name == "console.noplan" || $state.current.name == "console.Integration" || $state.current.name == "console.build" || $state.current.name == "console.image" || $state.current.name == "console.service" || $state.current.name == "console.backing_service" || $state.current.name == "console.dashboard" || $state.current.name == "console.user" || $state.current.name == "console.notification" || $state.current.name == "console.resource_management" || $state.current.name == "console.pipeline") {

                            return false
                        }
                        return true;
                    };

                    //$scope.$watch("orgStatus", function (n, old) {
                    //    // console.log("%%%%%%", n, old);
                    //    if (n) {
                    //        orgList.get({}, function (org) {
                    //            $scope.userorgs = org.orgnazitions;
                    //            //alert(11)
                    //            $scope.checked = $rootScope.namespace;
                    //
                    //            $rootScope.orgStatus = false;
                    //
                    //        })
                    //    }
                    //})

                    //$scope.$watch('checked', function (n, o) {
                    //    if (n == o) {
                    //        return
                    //    }
                    //    console.log('checked', n);
                    //})
                    //console.log('$rootScope',$rootScope);
                    $rootScope.huancun = {}

                    $scope.logout = function () {
                        Cookie.clear('df_access_token');
                        Cookie.clear('namespace');
                        Cookie.clear('region');
                        $rootScope.region = '';
                        $scope.checked = '';
                        $rootScope.user = null;
                        $rootScope.namespace = "";
                        //clearInterval($scope.timer);
                        $state.go('login');

                    };
                    $scope.change = false;

                    $scope.setNamespace = function (namespace) {
                        //console.log(namespace);
                        $rootScope.activeNode = $rootScope.dataForTheTree[0];
                        $rootScope.namespace = namespace;
                        Cookie.set('namespace', namespace, 10 * 365 * 24 * 3600 * 1000);
                        //$state.reload();
                        //$scope.change=true;
                        //$scope.checked = namespace;
                        //$rootScope.huancun.name = namespace;
                        //console.log('$scope.checked', $scope.checked);
                        //if (namespace) {
                        //    $state.go('console.org', {
                        //        useorg: namespace
                        //    });
                        //} else {
                        //console.log('$state.current.name', $state.current.name);
                        if ($state.current.name === 'console.dashboard') {
                            //$state.reload();
                            $state.go("console.build", { namespace: $rootScope.namespace })
                        } else {
                            $state.go("console.build", { namespace: $rootScope.namespace });
                        }
                        //$state.go("console.dashboard", { namespace: $rootScope.namespace });
                        //}
                    }

                    // setting timer
                    $scope.checkInbox = function () {
                        $scope.isshow = false;
                    }
                }
            ]
        }
    }])

    // 面包屑设置
    .filter('stateNameFilter', [function () {
        return function (state) {
            switch (state) {
                case "console.build_detail":
                    return "代码构建"
                case "console.build_create":
                    return "代码构建"
                case "console.image_detail":
                    return "镜像仓库"
                case "console.service_create":
                    return "部署镜像"
                case "console.primage":
                    return "仓库镜像"
                case "console.deploymentconfig_detail":
                    return "部署镜像"
                case "console.pods_detail":
                    return "容器状态"
                case "console.service_details":
                    return "服务地址"
                case "console.route_detail":
                    return "域名管理"
                case "console.create_routes":
                    return "域名管理"
                case "console.stateful-sets-detail":
                    return "有状态集"
                case "console.constantly_persistentVolume":
                    return "存储卷"
                case "console.create_constantly_persistentVolume":
                    return "存储卷"
                case "console.config_configMap":
                    return "配置卷"
                case "console.create_config_configMap":
                    return "配置卷"
                case "console.secret_secret":
                    return "密钥卷"
                case "console.create_secret":
                    return "密钥卷"
                case "console.pipeline_detail":
                    return "流水线"
                case "console.create_pipeline":
                    return "流水线"
                case "console.rc":
                    return "部署镜像"
                case "console.rs":
                    return "部署镜像"
                case "console.deployment_detail":
                    return "部署镜像";
                case "console.quick_deploy":
                    return "部署镜像"
                case "console.uploadimage":
                    return "镜像仓库";
            }
        };

    }])


    .filter('stateTitleFilter', [function () {
        return function (state) {
            switch (state) {
                case "console.deployments":
                    return "镜像部署"
                case "console.pipelinetag_detail":
                    return "流水线详情"
                case "console.pipeline_detail":
                    return "流水线详情"
                case "console.pipeline":
                    return "流水线"
                case "console.dashboard":
                    return "仪表盘"
                case "console.build":
                    return "代码构建";
                case "console.build_create":
                    return "新建构建";
                case "console.build_detail":
                    return "构建详情";
                case "console.image":
                    return "镜像仓库";
                case "console.image_detail":
                    return "镜像详情";
                case "console.image_Public":
                    return "镜像详情";
                case "console.image_regstry":
                    return "镜像详情";
                case "console.import_from_file":
                    return "导入yaml";
                case "console.rc":
                    return "rc详情";
                case "console.rs":
                    return "rs详情";
                case "console.primage":
                    return "镜像详情";
                case "console.service_detail":
                    return "服务详情";
                case "console.service_create":
                    return "新建服务";
                case "console.quick_deploy":
                    return "快速部署";
                case "console.create_pipeline":
                    return "新建流水线";
                case "console.backing_service":
                    return "后端服务";
                case "console.backing_service_detail":
                    return "后端服务详情";
                case "console.apply_instance":
                    return "新建后端服务实例";
                case "console.user":
                    return "用户中心";
                case "console.org":
                    return "用户中心";
                case "console.notification":
                    return "消息中心";
                case "console.resource_management":
                    return "资源管理";
                case "console.create_constantly_persistentVolume":
                    return "新建存储卷";
                case "console.create_config_configMap":
                    return "新建配置卷";
                case "console.create_secret":
                    return "新建密钥卷";
                case "console.config_configMap":
                    return "配置卷详情";
                case "console.secret_secret":
                    return "密钥卷详情";
                case "console.constantly_persistentVolume":
                    return "存储卷详情";
                case "console.create_saas":
                    return "新建服务实例";
                case "console.pay":
                    return "充值";
                case "console.plan":
                    return "套餐";
                case "console.Integration":
                    return "数据集成";
                case "console.Integration_detail":
                    return "数据详情";
                case "console.Integration_dlist":
                    return "数据预览";
                case "console.dataseverdetail":
                    return "创建服务实例";
                case "console.stateful-sets-detail":
                    return "有状态集详情";
                case "console.stateful-sets":
                    return "有状态集";
                case "console.create_routes":
                    return "域名路由设置";
                case "console.routes":
                    return "域名路由";
                case "console.route_detail":
                    return "域名路由详情";
                case "console.deploymentconfig_detail":
                    return "服务部署详情";
                case "console.deployment_detail":
                    return "服务部署详情";
                case "console.pods":
                    return "容器组";
                case "console.pods_detail":
                    return "容器组详情";
                case "console.services":
                    return "服务端口";
                case "console.service_details":
                    return "服务端口详情";
                case "console.resource_persistentVolume":
                    return "存储卷";
                case "console.resource_configMap":
                    return "配置卷";
                case "console.resource_secret":
                    return "密钥卷";
                case "console.uploadimage":
                    return "镜像上传";
            }
        };

    }]);