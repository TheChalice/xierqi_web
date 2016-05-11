'use strict';

angular.module('home', [])
    .controller('HomeCtrl', ['$scope', '$rootScope', '$log', 'ModalLogin', 'ModalRegist', 'User', function ($scope, $rootScope, $log, ModalLogin, ModalRegist, User) {
        $log.info('Home');

        if($rootScope.user){
            return $rootScope.user;
        }
        User.get({name: '~'}, function(res){
            $rootScope.user = res;
        });

        $scope.login = function(){
            ModalLogin.open();
        };

        $scope.regist = function(){
            ModalRegist.open();
        };
    }]);

