'use strict';
angular.module('home.regist', [])
    .controller('registCtrl', ['$state','AuthService','registration','$scope', '$log', 'Alert',
      function ($state,AuthService,registration,$scope, $log, Alert) {
      $log.info('regist');
      $scope.credentials = {

      };
          $scope.xieyi=false;
      $scope.regist = function () {
          $scope.sendobj={
              username:$scope.credentials.username,
              password:$scope.credentials.password,
              email:$scope.credentials.email
          }
        //注册相关代码...
          registration.regist({}, $scope.sendobj, function(data){
              Alert.open('注册账号', '激活邮件发送成功!', '', true).then(function(){
                  $state.go('home.index');
              })
          })
      };

      // $scope.cancel = function () {
      //   $state.go('home.index');
      // };

    }]);