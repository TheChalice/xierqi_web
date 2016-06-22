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
  $scope.updatePwd = function() {
    ModalPwd.open();
  };
    $scope.orgName = "seferfe"
    $scope.addOrg = function(){
      Addmodal.open('创建组织', '组织名称', '信息错误').then(function(res){

      })
    }
  }])

