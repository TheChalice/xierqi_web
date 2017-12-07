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
                console.log('$state', $state.current.name);

                $scope.goUrl = function(url){
                       if(url){
                           $state.go(url);
                       }else{
                           $(".zx_set_btn").removeClass("zx_set_btn_rotate");
                           $("#sidebar-container").removeClass("sider_zx");
                           $("#sidebar-right-fixed").removeClass("sidebar-fixed");
                           $rootScope.dataForTheTree[3].children = [{name:'服务部署',url:'console.service',children:[]}];
                           if(!$(".zx_set_btn").hasClass('zx_set_btn_rotate')){
                               $('.node-name').show()
                               $('.tooltip-r').hide()
                           }
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
                        $('.node-name').hide();
                        $scope.activeStyle = true;
                        $rootScope.dataForTheTree[3].children = [];
                    }else{
                        $('.node-name').show();
                        $scope.activeStyle = false;
                        $rootScope.dataForTheTree[3].children = [{name:'服务部署',url:'console.service',children:[]}];

                    }
                }



            }]
        }
    }]);

