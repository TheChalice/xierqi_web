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
            controller: ['$state', '$scope','$rootScope', function($state, $scope,$rootScope){
                const app = [
                    { name: 'Deployments', url: 'console.deployments', children: [] },
                    { name: 'Stateful Sets', url: 'console.stateful-sets', children: [] },
                    { name: 'Pods', url: 'console.pods', children: [] },
                    { name: 'Services', url: 'console.services', children: [] },
                    { name: 'Routes', url: 'console.routes', children: [] }
                ];
                $scope.state = $state;
                $scope.goUrl = function(url){
                       if(url){
                           $state.go(url);
                       }else{
                           $scope.activeStyle = false;
                           $(".zx_set_btn").removeClass("zx_set_btn_rotate");
                           $("#sidebar-container").removeClass("sider_zx");
                           $("#sidebar-right-fixed").removeClass("sidebar-fixed");
                           $rootScope.dataForTheTree[3].children = app
                       }
                }
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
                }

                // if ($state.current.name === 'console.dashboard') {
                //     // alert(11)
                //     ;
                // }
                var width = 0;
                width = $(window).width()-168;
                $scope.sidebaerWidth = function(){
                    $(".zx_set_btn").toggleClass("zx_set_btn_rotate");
                    $("#sidebar-container").toggleClass("sider_zx");
                    $("#sidebar-right-fixed").toggleClass("sidebar-fixed");
                    $(".sb-arrow").toggleClass("rotate");
                    if($(".zx_set_btn").hasClass('zx_set_btn_rotate')){
                        $scope.activeStyle = true;
                        $rootScope.dataForTheTree[3].children = [];
                    }else{
                        $scope.activeStyle = false;
                        $rootScope.dataForTheTree[3].children = app

                    }
                }
                $rootScope.dataForTheTree =
                    [
                        {name:'仪表盘',img:'icon25 icon25-dashboard',url:'console.dashboard',children:[]},
                        {name:'代码构建',img:'icon25 icon25-build',url:'console.build',children:[]},
                        {name:'镜像仓库',img:'icon25 icon25-repository',url:'console.image',children:[]},
                        {name:'服务部署',img:'icon25 icon25-deployment',url:'',children:app},
                        {name:'资源管理',img:'icon25 icon25-resource',url:'console.resource_management',children:[]}
                    ];



            }]
        }
    }]);

