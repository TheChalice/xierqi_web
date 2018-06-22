'use strict';

angular.module("console.sidebar", [
    {
        files: ['components/sidebar/sidebar.css']
    }
])
    .directive('cSidebar', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/sidebar/sidebar.html',
            controller: ['$state', '$scope', '$rootScope', function ($state, $scope, $rootScope) {
                // const app = [
                //     { name: 'Deployments', url: 'console.deployments',stateUrl:'' ,children: [] },
                //     { name: 'Stateful Sets', url: 'console.stateful-sets',stateUrl:'' , children: [] },
                //     { name: 'Pods', url: 'console.pods',stateUrl:'' , children: [] },
                //     { name: 'Services', url: 'console.services', stateUrl:'' ,children: [] },
                //     { name: 'Routes', url: 'console.routes',stateUrl:'' , children: [] }
                // ];
                $scope.state = $state;
                $scope.goUrl = function (url) {
                    if (url) {
                        var urlarr = url.split('@');
                        // console.log('urlarr', urlarr);
                        if (urlarr && urlarr.length) {
                            $state.go(urlarr[0], ({namespace: urlarr[1]}));
                        }
                    } else {
                        $scope.activeStyle = false;
                        $(".zx_set_btn").removeClass("zx_set_btn_rotate");
                        $("#sidebar-container").removeClass("sider_zx");
                        $("#sidebar-right-fixed").removeClass("sidebar-fixed");
                        $(".nav_top_li").removeClass("nav_top_toggle");
                        $(".bread_set").removeClass("bread_set_toggle")
                        angular.forEach($rootScope.dataForTheTree, function (data, i) {
                            //console.log('data', data);
                            if (data.name == '容器应用') {
                                $rootScope.dataForTheTree[i].children = $rootScope.app
                            }
                            if (data.name == '资源管理') {
                                $rootScope.dataForTheTree[i].children = $rootScope.resources
                            }
                            if (data.name == '镜像仓库') {
                                $rootScope.dataForTheTree[i].children = $rootScope.imageChild
                            }
                        });
                        //$rootScope.dataForTheTree[4].children = $rootScope.app
                        //$rootScope.dataForTheTree[5].children = $rootScope.resources
                    }
                };
                $scope.activeStyle = false;
                $scope.treeOptions = {
                    nodeChildren: "children",
                    dirSelectable: false,
                    injectClasses: {
                        ul: "a1",
                        li: "a2",
                        liSelected: "a7",
                        iExpanded: "a3",
                        iCollapsed: "a4",
                        iLeaf: "a5",
                        label: "a6",
                        labelSelected: "a8"
                    }
                };
                var width = 0;
                width = $(window).width() - 168;
                $scope.sidebaerWidth = function () {
                    $(".zx_set_btn").toggleClass("zx_set_btn_rotate");
                    $("#sidebar-container").toggleClass("sider_zx");
                    $("#sidebar-right-fixed").toggleClass("sidebar-fixed");
                    $(".nav_top_li").toggleClass("nav_top_toggle");
                    $(".bread_set").toggleClass("bread_set_toggle")
                    $(".sb-arrow").toggleClass("rotate");

                    if ($(".zx_set_btn").hasClass('zx_set_btn_rotate')) {
                        $scope.activeStyle = true;
                        angular.forEach($rootScope.dataForTheTree, function (data, i) {
                            //console.log('data', data);
                            if (data.name == '容器应用') {
                                $rootScope.dataForTheTree[i].children = []
                            }
                            if (data.name == '资源管理') {
                                $rootScope.dataForTheTree[i].children = []
                            }
                            if (data.name == '镜像仓库') {
                                $rootScope.dataForTheTree[i].children = []
                            }
                        })

                    } else {
                        $scope.activeStyle = false;
                        angular.forEach($rootScope.dataForTheTree, function (data, i) {
                            //console.log('data', data);
                            if (data.name == '容器应用') {
                                $rootScope.dataForTheTree[i].children = $rootScope.app
                            }
                            if (data.name == '资源管理') {
                                $rootScope.dataForTheTree[i].children = $rootScope.resources
                            }
                            if (data.name == '镜像仓库') {
                                $rootScope.dataForTheTree[i].children = $rootScope.imageChild
                            }
                        });
                        //$rootScope.dataForTheTree[4].children = $rootScope.app
                        //$rootScope.dataForTheTree[5].children = $rootScope.resources

                    }
                };

                // $rootScope.dataForTheTree =
                //     [
                //         {name:'仪表盘',img:'icon25 icon25-dashboard',url:'console.dashboard',stateUrl:'' ,children:[]},
                //         {name:'代码构建',img:'icon25 icon25-build',url:'console.build',stateUrl:'' ,children:[]},
                //         {name:'镜像仓库',img:'icon25 icon25-repository',url:'console.image',stateUrl:'' ,children:[]},
                //         {name:'服务部署',img:'icon25 icon25-deployment',url:null,stateUrl:'' ,children:app},
                //         {name:'资源管理',img:'icon25 icon25-resource',url:'console.resource_management',stateUrl:'' ,children:[]}
                //     ];

            }]
        }
    }]);

