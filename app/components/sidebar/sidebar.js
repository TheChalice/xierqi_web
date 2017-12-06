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
            controller: ['$state', '$scope', function ($state, $scope) {
                $scope.goUrl = function (url, node) {
                    if (node) {
                        console.log('node', node);
                    }
                    if (url) {
                        $state.go(url)
                    } else {
                        $(".zx_set_btn").removeClass("zx_set_btn_rotate");
                        $("#sidebar-container").removeClass("sider_zx");
                        $("#sidebar-right-fixed").removeClass("sidebar-fixed");
                        $scope.dataForTheTree[3].children = [{name: '服务部署', url: 'console.service', children: []}];
                    }
                }
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
                }
                $scope.dataForTheTree =
                    [
                        {name: '仪表盘', img: 'icon25 icon25-dashboard', url: 'console.dashboard', children: []},
                        {name: '代码构建', img: 'icon25 icon25-build', url: 'console.build', children: []},
                        {name: '镜像仓库', img: 'icon25 icon25-repository', url: 'console.image', children: []},
                        {
                            name: '服务部署',
                            img: 'icon25 icon25-deployment',
                            url: '',
                            children: [{name: '服务部署', url: 'console.service', children: []}]
                        },
                        {name: '资源管理', img: 'icon25 icon25-resource', url: 'console.resource_management', children: []},
                    ];

                var width = 0;
                width = $(window).width() - 168;

                $scope.sidebaerWidth = function () {
                    $(".zx_set_btn").toggleClass("zx_set_btn_rotate");
                    $("#sidebar-container").toggleClass("sider_zx");
                    $("#sidebar-right-fixed").toggleClass("sidebar-fixed");
                    if ($(".zx_set_btn").hasClass('zx_set_btn_rotate')) {
                        $scope.dataForTheTree[3].children = [];
                    } else {
                        $scope.dataForTheTree[3].children = [{name: '服务部署', url: 'console.service', children: []}];
                    }
                }

            }]
        }
    }]);

