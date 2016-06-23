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
]) .controller('userCtrl', ['$scope', 'ModalPwd', 'Addmodal',
  function ($scope, ModalPwd,Addmodal) {
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
    };
    $scope.updateToken = function() {
      Addmodal.open('更新私有token', '私有token', '信息错误').then(function(res){

      })
    }
    var a;
    $scope.showpop = function() {
      document.getElementById("pop").style.display = "block"; clearTimeout(a);
    }
    $scope.hidepop = function() {
      var a;
      var out = function () {
        a = setTimeout(function () {
          document.getElementById("pop").style.display = "none";
        }, 100)
      }
      out();
    }
  }])

