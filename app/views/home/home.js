'use strict';

angular.module('home', [])
    .controller('HomeCtrl', ['$state','$scope', '$rootScope', '$log', 'ModalLogin', 'ModalRegist', 'User',
      function ($state,$scope, $rootScope, $log, ModalLogin, ModalRegist, User) {
        $log.info('Home');
          $scope.$watch('namespace', function (n,o) {
              //console.log('new1',n);
              if (n == '') {
                  clearInterval($rootScope.timer)
              }
          })
        if($rootScope.user){
            return $rootScope.user;
        }
        User.get({name: '~'}, function(res){
            $rootScope.user = res;
        });

        $scope.login = function(){
            // ModalLogin.open();
          $state.go('login');
        };

        $scope.regist = function(){
            // ModalRegist.open();
          $state.go('regist');
        };
    }]);

