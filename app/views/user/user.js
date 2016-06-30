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
]) .controller('userCtrl', ['$rootScope','$state','Cookie','Toast','$scope', 'ModalPwd', 'Addmodal', 'profile', 'pwdModify',
  function ($rootScope,$state,Cookie,Toast,$scope, ModalPwd, Addmodal, profile, pwdModify) {
    $scope.credentials = {};
    $scope.grid={
      st:null,
      et:null
    }
    $scope.orgName = "seferfe";
    $scope.addOrg = function(){
      Addmodal.open('创建组织', '组织名称', '信息错误').then(function(res){

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
    loadInfo();



  }])

