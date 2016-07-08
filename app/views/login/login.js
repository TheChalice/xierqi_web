/**
 * Created by Administrator on 2016/7/8.
 */
'use strict';
angular.module('home.login', [])
    .controller('loginCtrl', ['$state','$rootScope','AuthService','$scope', '$log',
      function ($state,$rootScope,AuthService,$scope, $log) {
      $log.info('login');
        $rootScope.credentials = {};
      $scope.login = function () {

        AuthService.login($rootScope.credentials);

      };
      $scope.regist = function () {
        // $uibModalInstance.close();
        // ModalRegist.open();
        $state.go('home.regist');
      };
      // $scope.cancel = function () {
      //   $uibModalInstance.dismiss();
      // };
    }]);
