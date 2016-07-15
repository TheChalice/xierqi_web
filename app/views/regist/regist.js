'use strict';
angular.module('home.regist', [])
    .controller('registCtrl', ['$state','AuthService','registration','$scope', '$log', 'Alert',
      function ($state,AuthService,registration,$scope, $log, Alert) {
      $log.info('regist');
      $scope.credentials = {
      };
        $scope.xieyi=false;
      $scope.regist = function () {
        //注册相关代码...
          registration.regist({}, $scope.credentials, function(data){
              $state.go('home.index');
          })
      };

      // $scope.cancel = function () {
      //   $state.go('home.index');
      // };

    }]);