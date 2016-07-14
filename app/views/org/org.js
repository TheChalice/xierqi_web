'use strict';

angular.module('console.user', [
  'kubernetesUI',
  {
    files: [
      'views/org/org.css',
      'components/datepick/datepick.js',
      'components/timeline/timeline.js',
      'components/checkbox/checkbox.js'

    ]
  }
]) .controller('orgCtrl', ['$http', '$rootScope', '$state','$cacheFactory','loadOrg','Addmodal','Confirm','$scope','$stateParams', 'invitation', 'leave',
  function ($http, $rootScope, $state, $cacheFactory,loadOrg,Addmodal,Confirm,$scope,$stateParams,invitation,leave) {
    $scope.grid={
      st:null,
      et:null
    }

    var loadOrg = function() {
      console.log('test org name',$stateParams.useorg)
      $http({
        url:'/lapi/orgs/'+$stateParams.useorg,
        method:'GET'
      }).success(function(data,header,config,status,orgid){
        if (data.id) {
          console.log('load org data',data);
          $scope.members=data.members;
          $scope.orgcon = data;
          $scope.rootmembers=[];
          $scope.norootmembers=[];
          angular.forEach(data.members,function (item) {
            if (item.privileged) {
              $scope.rootmembers.push(item);
            }else {
              $scope.norootmembers.push(item);
            }
          })
        }
      }).error(function(data,header,config,status){
      });
    }

    //load project
    var loadProject = function(){
      $http.get('/oapi/v1/projects', {
      }).success(function(data){
        console.log('test project', data);
      })
    }

    $scope.deletezz=function () {
      if($scope.rootmembers.length ==1 && $scope.norootmembers.length == 0){
        Confirm.open("离开组织", "您确定要删除组织吗？", "此操作不可撤销", "stop").then(function(){
          $http.delete('/lapi/orgs/'+$stateParams.useorg, {
          }).success(function(item){
            console.log('the org has been deelted', item);
            loadProject();
          })
        })
      }else{
        Confirm.open("离开组织", "删除组织失败", "组织内还有其他成员，您需要先移除其他成员", null,true)
      }
    }
    $scope.addpeople=function () {
      Addmodal.open('邀请新成员', '邮箱', '',$stateParams.useorg,'people').then(function (res) {
        console.log('test org member', res);
        //$http.put('/lapi/orgs/'+$stateParams.useorg+'/invite', {
        //  member_name: res,
        //  privileged: false
        //}).success(function(item){
        //  console.log('test invitation', item)
        //  if(item.privileged){
        //    $scope.rootmembers.push(item)
        //  }else{
        //    $scope.norootmembers.push(item)
        //  }
        //   loadOrg();
        //  console.log('adding new memeber',item)
        //})
      })
    }
    $scope.remove=function (idx) {
      Confirm.open("移除", "您确定要删除："+$scope.rootmembers[idx].member_name+"吗？", null, "").then(function(){
        console.log('test root members before remove',$scope.rootmembers )
        //$http.put('/lapi/orgs/'+$stateParams.useorg+'/remove',{
        //  member_name:$scope.rootmembers[idx].member_name
        //}).success(function(data){
        //  console.log('test rootmember who has been removed', $scope.rootmembers[idx].member_name);
        //  loadOrg();
        //})
      })
    }

    $scope.removenotroot=function (idx) {
      Confirm.open("移除", "您确定要删除："+$scope.norootmembers[idx].member_name+"吗？", null, "").then(function(){
        console.log('test noroot member before remove', $scope.norootmembers)
        $http.put('/lapi/orgs/'+$stateParams.useorg+'/remove',{
          member_name:$scope.norootmembers[idx].member_name
        }).success(function(){
          console.log('test noroot who has been removed', $scope.norootmembers[idx].member_name)
          loadOrg();
        })
      })
    }

    $scope.leave=function (res) {
      //for(var i = 0; i < $scope.rootmembers.length; i++){
        console.log('test how many rootmember',$scope.rootmembers.length )
        if($scope.rootmembers.length == 1){
          Confirm.open("离开组织", "不能离开!", "您是最后一名管理员请先指定其他管理员,才能离开", "", true).then(function() {
            //console.log('the last rootmember', $scope.rootmembers)
          })
          }else{
            //console.log('test leave', res);
            Confirm.open("离开组织", "您确定要离开："+$stateParams.useorg+"吗？",null, "").then(function(){
              leave.left({org:$stateParams.useorg}, function() {
                $rootScope.orgStatus = true;
                $state.go('console.dashboard');
              })
            })
        }
      }

      $scope.changetomember = function(idx){
        $http.put('/lapi/orgs/'+$stateParams.useorg+'/privileged',{
          member_name:$scope.rootmembers[idx].member_name,
          privileged: false
        }).success(function(data){
          console.log('test api changetomember', data);
          $scope.rootmembers[idx].privileged = false;
          var b = $scope.rootmembers[idx];
          $scope.rootmembers.splice(idx, 1);
          console.log('test changetomemeber', $scope.rootmembers, idx);
          $scope.norootmembers.push(b);
        })
      }
      $scope.changetoadmin = function(idx) {
      $http.put('/lapi/orgs/'+$stateParams.useorg+'/privileged',{
          member_name:$scope.norootmembers[idx].member_name,
          privileged: true
         }).success(function(data){
          console.log('test member', data);
          //  start from inx and delete one item
          $scope.norootmembers[idx].privileged = true;
          var a =  $scope.norootmembers[idx];
          $scope.norootmembers.splice(idx, 1);
          console.log('test api changetoadmin',$scope.norootmembers, idx);
          $scope.rootmembers.push(a);
      })
     }
    loadOrg();
  }])

