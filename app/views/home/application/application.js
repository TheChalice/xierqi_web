/**
 * Created by jxy on 16/8/30.
 */
angular.module('home.application', [
    {
        files: [
            'views/home/application/application.css'
        ]
    }
])
    .controller('applicationCtrl', ['$scope', '$log','$state','$rootScope', function ($scope, $log,$state,$rootScope) {
           $scope.grid = {
               active : 1,
               hotimglist :1
           }
        ////////////SAAS,镜像切换
        $scope.changeTb = function(num){
            if(num == 1){
                $scope.grid.active = 1
            }else if(num == 2){
                $scope.grid.active = 2
            }
        }
        ////// 热门镜像排行切换
        $scope.changehotTab = function(idx){
            if(idx == 1){
                $scope.grid.hotimglist = 1
            }else if(idx == 2){
                $scope.grid.hotimglist = 2
            }
        }
        //$scope.howSaas = function(){
        //    simpleAlert.open('申请使用说明','您申请服务之后，通过创建用户自定义后端服务实例来集成自己的服务以及SaaS服务.');
        //}
        //$scope.howpushimg = function(){
        //    simpleAlert.open('拉取镜像说明','<p>11<p/><p>22<p/>');
        //}
        $scope.checkcollect = function(){
            if(!$rootScope.user){
                $state.go('login');
            }else{
                alert(1);
            }
        }
        $scope.createsaas = function(){
            if(!$rootScope.user){
                $state.go('login');
            }else{
                $state.go('login');
            }
        }
        $scope.deployimg = function(){
            if(!$rootScope.user){
                $state.go('login',{type : 'q',name : 'aaa'+':latest'+':registryjump'});
            }else{
                $state.go('console.service_create',{image:'aaa'+':latest'+':registryjump'});
            }
        }
    }]);
