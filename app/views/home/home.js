'use strict';

angular.module('home', [])
    .controller('HomeCtrl', ['$state','$scope', '$rootScope', '$log', 'ModalLogin', 'ModalRegist', 'User',
      function ($state,$scope, $rootScope, $log, ModalLogin, ModalRegist, User) {
        $log.info('Home');

        if($rootScope.user){
            return $rootScope.user;
        }
        User.get({name: '~'}, function(res){
            $rootScope.user = res;
        });

        $scope.login = function(){
            // ModalLogin.open();
          $state.go('home.login');
        };

        $scope.regist = function(){
            // ModalRegist.open();
          $state.go('home.regist');
        };
    }]);

