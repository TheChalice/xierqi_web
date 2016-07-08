/**
 * Created by Administrator on 2016/7/8.
 */
'use strict';
angular.module('home.regist', [])
    .controller('registCtrl', ['$state','AuthService','registration','$scope', '$log',
      function ($state,AuthService,registration,$scope, $log) {
      $log.info('regist');
      $scope.credentials = {
      };
        $scope.xieyi=false;
      $scope.regist = function () {
        //注册相关代码...
        registration.regist({username: $scope.credentials.username, password: $scope.credentials.password, email: $scope.credentials.email}, function(data){
          $state.go('home.index');
        })
      };
      // $scope.cancel = function () {
      //   $state.go('home.index');
      // };

    }]);