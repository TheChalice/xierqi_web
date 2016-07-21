'use strict';

angular.module("console.header", [
    {
        files: ['components/header/header.css']
    }
])

    .directive('cHeader', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/header/header.html',
            controller: ['Toast','Addmodal','$http','$location','orgList','$rootScope', '$scope', '$window', '$state', 'Cookie','$stateParams',
              function(Toast,Addmodal,$http,$location,orgList,$rootScope, $scope, $window, $state, Cookie,$stateParams){
                  if($state.params.useorg){
                          $http({
                              url:'/lapi/orgs/'+$state.params.useorg,
                              method:'GET'
                          }).success(function(data,header,config,status,orgid){
                              $scope.checked = data.name;
                          }).error(function(data,header,config,status){
                          });

                  }
                  //if($rootScope.delOrgs){
                  //    $http({
                  //        url:'/lapi/orgs/'+$state.params.useorg,
                  //        method:'GET'
                  //    }).success(function(data,header,config,status,orgid){
                  //        $scope.checked = data.name;
                  //    }).error(function(data,header,config,status){
                  //    });
                  //}

                  $scope.$watch('delOrgs', function (n,o) {
                      if(n == o){
                          return;
                      }
                      if(n){
                          $scope.checked = $rootScope.user.metadata.name;
                          $http({
                              url:'/lapi/orgs',
                              method:'GET'
                          }).success(function(data,header,config,status,orgid){
                              $scope.userorgs = data.orgnazitions;
                              $rootScope.delOrgs = false;
                          }).error(function(data,header,config,status){
                          });
                      }else{
                          $rootScope.isorg = false;
                      }
                  })
                  $scope.$watch('$state.params.useorg', function (n,o) {
                      if(n == o){
                          return;
                      }
                      if($state.params.useorg){
                          $rootScope.isorg = true;
                          $scope.neworgid = $state.params.useorg
                      }else{
                          $rootScope.isorg = false;
                      }
                  })
                  $rootScope.isorg = false;
                  $scope.$watch('namespace', function (n,o) {
                      console.log('new',n);
                      if (n.indexOf('org')==-1) {
                          $rootScope.timer = setInterval(function(){
                              $http({
                                  url:'/lapi/inbox_stat',
                                  method:'GET',
                              }).success(function(res){
                                  //console.log("test the inbox stat", res);
                                  if(res.data == null){
                                      res.data = {};
                                  }
                                  if (res.data.sitenotify || res.data.accountms || res.data.alert){
                                      $scope.isshow = true;
                                  }else{
                                      $scope.isshow = false;
                                  };
                              }).error(function(data){
                                  //console.log("Couldn't get inbox message", data)
                              });
                          },60000)
                      }else {
                          clearInterval($rootScope.timer);
                      }


                  })
                $scope.createOrg= function () {
                    Addmodal.open('创建组织', '组织名称', '','','org').then(function(res){
                        orgList.get({},function (org) {
                            // console.log(org);
                            Toast.open('创建成功')
                            $scope.userorgs = org.orgnazitions;
                        })
                    })

                }
                $scope.back = function(){
                  //console.log($state);
                  if ($state.current.name == "console.image_detail"&&$state.params.name.indexOf('/')!=-1) {
                    $state.go('console.image',{index:2})
                  }else {
                    $window.history.back();
                  }
                };

                // console.log($location.url().split('/')[2])
               if ($location.url().split('/')[2]==='org') {
                 $http({
                   url:'/lapi/orgs/'+$location.url().split('/')[3],
                   method:'GET'
                 }).success(function(data){
                   // console.log('112',data.name)
                   $scope.checked=data.name
                 })
               } else if (!$scope.checked) {
                 $scope.checked=$rootScope.namespace;
               }
                $scope.gotomy=function () {
                  $scope.checked=$rootScope.user.metadata.name;
                    $rootScope.namespace=$rootScope.user.metadata.name;

                }
                $scope.goto=function (ind) {
                  $scope.checked = $scope.userorgs[ind].name;
                    $rootScope.namespace=$scope.userorgs[ind].id;
                    //console.log($scope.userorgs);
                    // console.log($scope.userorgs,$scope.userorgs[ind].id);
                  //$state.go('console.org', {useorg:$scope.userorgs[ind].id})
                }
                orgList.get({},function (org) {
                  // console.log(org);
                  $scope.userorgs = org.orgnazitions;
                })
                $scope.hasBack = function(){
                    if ($state.current.name == "console.build" || $state.current.name == "console.image" || $state.current.name == "console.service" || $state.current.name == "console.backing_service" || $state.current.name == "console.dashboard" || $state.current.name == "console.user" || $state.current.name == "console.notification" || $state.current.name == "console.resource_management") {
                        return false
                    }
                    return true;
                };
                  $scope.$watch("orgStatus", function(n, old){
                      // console.log("%%%%%%", n, old);
                      if (n) {
                          orgList.get({},function (org) {
                              $scope.userorgs = org.orgnazitions;
                              $scope.checked = $rootScope.namespace;
                              $rootScope.orgStatus=false;
                          })
                      }
                  })
              //console.log('$rootScope',$rootScope);
              $scope.logout = function(){
                    Cookie.clear('df_access_token');
                    Cookie.clear('namespace');
                    $rootScope.user = null;
                    $rootScope.namespace = "";
                    $state.go('home.index');
                };
                $scope.setNamespace = function(namespace) {

                    $rootScope.namespace = namespace;
                    Cookie.set('namespace', namespace, 10 * 365 * 24 * 3600 * 1000);
                    $state.reload();
                    $scope.checked = namespace;
                }
            // setting timer
                  $scope.checkInbox = function() {
                      $scope.isshow = false;
                  }
            }]
        }
    }])
    .filter('stateTitleFilter', [function(){
        return function(state) {
            switch (state) {
                case "console.dashboard":
                    return "仪表盘"
                case "console.build":
                    return "代码构建";
                case "console.build_create_new":
                    return "新建构建";
                case "console.build_detail":
                    return "构建详情";
                case "console.image":
                    return "镜像仓库";
                case "console.image_detail":
                    return "镜像仓库";
                case "console.service":
                    return "服务部署";
                case "console.service_detail":
                    return "服务详情";
                case "console.service_create":
                    return "新建服务";
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
                case "console.create_constantly_volume":
                    return "新建持久化卷";
                case "console.create_config_volume":
                    return "新建配置卷";
                case "console.create_secret":
                    return "新建密钥"
            }
        };
    }]);

