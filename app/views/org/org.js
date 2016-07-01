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
]) .controller('orgCtrl', ['$cacheFactory','loadOrg','Addmodal','Confirm','$scope','$stateParams',
  function ($cacheFactory,loadOrg,Addmodal,Confirm,$scope,$stateParams) {
    $scope.grid={
      st:null,
      et:null
    }
    console.log('org',$stateParams.useorg)
    console.log($stateParams.useorg)
    // var cache = $cacheFactory('myCache');
    loadOrg.load({org:$stateParams.useorg},function (data) {
      console.log(data)
    })
    
    $scope.deletezz=function () {
      // alert(1)
      Confirm.open("离开组织", "您确定要删除组织吗?", "此操作不可撤销", "stop").then(function(){
        Confirm.open("离开组织", "删除组织失败", "组织内还有其他成员，您需要先移除其他成员", null,true)
      })

    }
    $scope.addpeople=function () {
      Addmodal.open('邀请新成员', '邮箱', '信息错误').then(function (res) {
        console.log(res);
      })
    }
    $scope.remove=function () {
      Confirm.open("移除", "您确定要删除：xxxx吗?", null, "stop").then(function(){
        // Toast.open('删除成功');
        // ModalPullImage.open('删除成功')
        // Alert.open("移除", "您确定要删除：xxxx吗?",123)
      })
    }
  }])

