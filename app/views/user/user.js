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
]) .controller('userCtrl', ['$scope',"Addmodal","Confirm",
  function ($scope,Addmodal,Confirm) {
    $scope.grid={
      st:null,
      et:null
    }
    $scope.orgName = "seferfe"
    $scope.addOrg = function(){
      Addmodal.open('创建组织', '组织名称', '信息错误').then(function(res){

      })
    }
    $scope.lvOrg = function(){
      Confirm.open("离开组织","您确定要离开组织吗?","","",false);
    }
  }])

