'use strict';
angular.module('home.login', [])
    .controller('loginCtrl', ['$interval','$state','$rootScope','AuthService','$scope', '$log',
      function ($interval,$state,$rootScope,AuthService,$scope, $log) {
        
        // 进度条暂时不启用
        // var vm = $scope.vm = {};
        // vm.value = 0;
        // vm.style = 'progress-bar-danger';
        // vm.showLabel = true;
        // vm.striped = true;
        //
        // $scope.selectValue = function (){
        //   console.log(vm.style);
        // };
        // var index = 0;
        // var timeId = 100;
        // $scope.count = function(){
        //   var start = $interval(function(){
        //     vm.value =  ++index;
        //     if (index > 99) {
        //       $interval.cancel(start);
        //     }
        //     if (index == 60) {
        //       index = 99;
        //     }
        //   }, timeId);
        // };
          $scope.$watch('namespace', function (n,o) {
              //console.log('new1',n);
              if (n == '') {

                  clearInterval($rootScope.timer);
              }
          })
      $log.info('login');
        $rootScope.credentials = {};
      $scope.login = function () {
        AuthService.login($rootScope.credentials);
      };
      $scope.regist = function () {
        $state.go('regist');
      };
      // $scope.cancel = function () {
      //   $uibModalInstance.dismiss();
      // };
    }]);
