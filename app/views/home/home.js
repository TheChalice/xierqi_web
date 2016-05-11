'use strict';

angular.module('home', [])
    .controller('HomeCtrl', ['$scope', '$log', 'ModalLogin', 'ModalRegist', function ($scope, $log, ModalLogin, ModalRegist) {
        $log.info('Home');

        $scope.login = function(){
            ModalLogin.open();
        };

        $scope.regist = function(){
            ModalRegist.open();
        };
    }]);

