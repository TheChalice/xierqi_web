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
]) .controller('userCtrl', ['createOrg', '$rootScope','$state','$stateParams','Cookie','Toast','$scope', 'ModalPwd', 'Addmodal', 'profile', 'pwdModify', '$http', 'Confirm','leave','orgList',
  function (createOrg, $rootScope,$state,$stateParams,Cookie,Toast,$scope, ModalPwd, Addmodal, profile, pwdModify, $http, Confirm, leave,orgList) {
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
      orgList.get({},function(data){
        $scope.orgList = data.orgnazitions;
        for(var i = 0 ; i < $scope.orgList.length; i++){
           for(var j = 0; j < $scope.orgList[i].members.length;j++){
             if($scope.orgList[i].members[j].member_name == $rootScope.user.metadata.name){
               $scope.orgList[i].privileged = $scope.orgList[i].members[j].privileged;
             }
           }
        }
        console.log('test length111',data);
      })
    }
    $scope.leaveOrg = function(idx,orgid,oname,privilegeds) {
      var privilegednum = 0;
      for(var i = 0; i < $scope.orgList[idx].members.length;i++){
        if($scope.orgList[idx].members[i].privileged){
           privilegednum++;
        }
      }
      var leaving = function() {
        leave.leave({orgs:orgid}, function() {
          console.log('test leave', res);
          loadOrg();
        })
      }
      //angular.forEach($scope.orgList, function(item,idx){
      //  angular.forEach(item.members,function(item1, index1){
      //    if(item1.member_name === $rootScope.user.metadata.name){
      //      item.test = item1.privileged;
      //    }
      //  })
      //})
      console.log(privilegeds);
      console.log(privilegednum);
      console.log($rootScope.user.metadata.name);
      if ((privilegeds && privilegednum > 1) || !privilegeds){
        Confirm.open("离开组织", "您确定要离开"+oname+"组织吗?", "", "stop").then(function(){
          leaving();
        })
      }
      if (privilegeds && privilegednum == 1 ){
        Confirm.open("离开组织", "不能离开!", "您是最后一名管理员请先指定其他管理员,才能离开", "stop").then(function(){
        })
      }
    }
    loadInfo();
    loadOrg();
  }])

