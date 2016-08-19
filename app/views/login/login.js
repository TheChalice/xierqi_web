'use strict';
angular.module('home.login', [])
    .controller('loginCtrl', ['ModalRegist','$interval','$state','$rootScope','AuthService','$scope', '$log',
      function (ModalRegist,$interval,$state,$rootScope,AuthService,$scope, $log) {
        
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
          function codenum() {
              var str = [
                  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
                  'o', 'p', 'q', 'r', 's', 't', 'x', 'u', 'v', 'y', 'z', 'w', 'n',
                  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
              ];
              var num = null;
              for (var i = 0; i < 4; i++) {
                  var index = Math.floor(Math.random() * str.length);
                  if (num) {
                      num += str[index];
                  } else {
                      num = str[index]
                  }

              }
              $scope.yzcode = num;
          }

          codenum()
          $scope.changecode = function () {
              codenum()
          };
          $scope.$watch('code', function (n,o) {
              if (n == o) {
                  return
              }
              if (n !== $scope.yzcode) {
                  $scope.credentials.codeerror=true
              }else {
                  $scope.credentials.codeerror=false
              }
          })
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
          //ModalRegist.open();
        $state.go('regist');
      };
      // $scope.cancel = function () {
      //   $uibModalInstance.dismiss();
      // };
    }]);
