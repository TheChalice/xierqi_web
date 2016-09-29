angular.module('home.introduce', [
        {
            files: [
                'views/home/introduce/css/introduce.css'
            ]
        }
    ])
    .controller('introduceCtrl',['$scope','$rootScope','$state',function ($scope,$rootScope,$state) {
          $scope.grid = {
              cxjcidx : '',
              hdfw : '',
              yytg: ''
          }
          $scope.tabchange = function(objname,idx){
              if(objname == 'cxjc'){
                  $scope.grid.cxjcidx = idx
              }else if(objname == 'hdfw'){
                  $scope.grid.hdfw = idx
              }else if(objname == 'yytg'){
                  $scope.grid.yytg = idx
              }

          }

          $scope.cxjc = [
              {fun:'提升应用交付效率',funcon:'及时发现问题，生成随时随地可交付的镜像',img:'views/home/introduce/img/icon-27.png',mg:true},
              {fun:'一键自动部署',funcon:'通过镜像快速完成应用部署',img:'views/home/introduce/img/icon-28.png'},
              {fun:'自动测试',funcon:'与代码仓库的无缝对接，能够自动触发代码的集成测试，提高产品质量',img:'views/home/introduce/img/icon-29.png'}
          ]
        $scope.hdfw = [
            {fun:'计费灵活',funcon:'即买即用,按需提供',img:'views/home/introduce/img/icon-30.png'},
            {fun:'多样化后端服务',funcon:'应用开发者即可以在界面上申请,也可以通过编排来生成',img:'views/home/introduce/img/icon-31.png'},
            {fun:'使用方便',funcon:'应用开发者即可以在界面上申请，也可以通过编排来生成',img:'views/home/introduce/img/icon-32.png'}
        ]
        $scope.yytg = [
            {fun:'保障应用的高可用',funcon:'弹性伸缩，合理分配资源，保障应用访问的连续性',img:'views/home/introduce/img/icon-26.png'},
        ]
        $('.accordion li').mouseover(function(){
            $(this).animate({
                width: 420,
            }, 200 );
            $(this).siblings().animate({
                width: 200,
            }, 200 );
        })
        $scope.experience = function(){
            if(!$rootScope.user){
                $state.go('login');
            }else{
                $state.go('console.dashboard');
            }
        }
        $('.imgover').mouseover(function(){
            $(this).siblings('.imgdown').stop().slideDown(200);
        }).mouseout(function(){
            $(this).siblings('.imgdown').stop().slideUp(200);
        })
    }]);
