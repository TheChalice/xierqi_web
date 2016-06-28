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
]) .controller('userCtrl', ['$scope', 'ModalPwd', 'Addmodal', 'profile', 'pwdModify',
  function ($scope, ModalPwd, Addmodal, profile, pwdModify) {
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
      ModalPwd.open();
      $scope.look = function() {
        console.log('%%%%%%%%%%',$scope.frm);
      };
      $scope.newPwd = function() {
        pwdModify.change({new_password: $scope.pwd, old_password: $scope.oldpwd}, function(data){

        })
      }

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
        console.log('******',data);
      })
    }
    loadInfo();



  }])

