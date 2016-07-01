'use strict';

angular.module('console.user', [
  'kubernetesUI',
  {
    files: [
      'views/user/user.css',
      'components/datepick/datepick.js',
      'components/timeline/timeline.js',
      'components/checkbox/checkbox.js'

    ]
  }
]) .controller('userCtrl', ['createOrg', '$rootScope','$state','$stateParams','Cookie','Toast','$scope', 'ModalPwd', 'Addmodal', 'profile', 'pwdModify', '$http', 'Confirm','leave',
  function (createOrg, $rootScope,$state,$stateParams,Cookie,Toast,$scope, ModalPwd, Addmodal, profile, pwdModify, $http, Confirm, leave) {
    $scope.credentials = {};
    $scope.grid={
      st:null,
      et:null
    }
    $scope.orgName = "seferfe";
    //创建组织
    $scope.addOrg = function(){
      Addmodal.open('创建组织', '组织名称', '信息错误').then(function(res){
        createOrg.create({name:res},function (data) {
          console.log(data)
        })
      })
    }
    $scope.updatePwd = function() {
      ModalPwd.open().then(function (password) {
        console.log(password);
        pwdModify.change({new_password: password.pwd, old_password: password.oldpwd}, function(data){
          Toast.open('更改密码成功');
          setTimeout(function () {
            Cookie.clear('namespace');
            Cookie.clear('df_access_token');
            $rootScope.user = null;
            $rootScope.namespace = "";
            $state.go('home.index');
          },2000)
        })
      })

      // $scope.newPwd = function() {
      //
      // }

    };
    $scope.updateToken = function() {
      Addmodal.open('更新私有token', '私有token', '信息错误').then(function(res){
      })
    }
    var a;
    var keep = function() {
      a  = setTimeout($scope.showpop,1000);
    }
    $scope.showpop = function() {
      keep();
      document.getElementById("pop").style.display = "block"; clearTimeout(a);
    }
    $scope.hidepop = function() {
      document.getElementById("pop").style.display = "none";
    }
    $scope.showbig = function() {
      keep();
      document.getElementById("pop").style.display = "block"; clearTimeout(a);
    }
    var loadInfo = function() {
      profile.get({},function(data) {
         $scope.curUserInfo = data;
      })
    }
    var loadOrg = function() {
      $http({
        url:'/lapi/orgs',
        method:'GET'
      }).success(function(data,header,config,status){
        console.log('test org', data);
        $scope.data = data;
        console.log('test length',$scope.data.length);
      })
    }
    $scope.leaveOrg = function(idx) {
      loadOrg();
      var leaving = function() {
        leave.leave({orgs:$scope.data[idx].ID}, function() {
          console.log('test leave', res);
        })
      }
      angular.forEach($scope.data, function(item,idx){
        //idx represents data[i];
        angular.forEach(item.members,function(item1, index1){
          if(item1.member_name === $rootScope.user.metadata.name){
            item.test = item1.privileged;
          }
        })
      })
      console.log($scope.data);
      //.data[idx] = org
      //test = privileged
      if ($scope.data[idx].test && $scope.data[idx].members.length > 1 ){
        Confirm.open("离开组织", "您确定要离开"+$scope.data[idx].name+"组织吗?", "", "stop").then(function(){
          leaving();
        })
      }
      if ($scope.data[idx].test && $scope.data[idx].members.length == 1 ){
        Confirm.open("离开组织", "不能离开!", "您是最后一名管理员请先指定其他管理员,才能离开", "stop").then(function(){
        })
      }
      if (!$scope.data[idx].test){
        Confirm.open("离开组织", "您确定要离开"+$scope.data[idx].name+"组织吗?", "", "stop").then(function(){
          leaving();
        })
      }
      //if ($scope.data.length != 0 && $scope.data[idx].members.privileged){
      //  Confirm.open("离开组织", "您确定要离开{{}}组织吗?", "", "stop").then(function(){
      //    leaving();
      //  })
      //}
      //if ($scope.data.length = 0 && $scope.data[idx].members.privileged){
      //  Confirm.open("离开组织", "不能离开!", "您是最后一名管理员请先指定其他管理员,才能离开", "stop").then(function(){
      //  })
      //}
      //if($scope.data[idx].members.privileged = false){
      //  Confirm.open("离开组织", "您确定要离开{{}}组织吗?", "", "stop").then(function(){
      //    leaving();
      //  })
      //}
    }
    loadInfo();
    loadOrg();
  }])

