'use strict';

angular.module('login', [
        'base64'
    ])
    .controller('LoginCtrl', ['$scope', 'AuthService', function($scope, AuthService){
        $scope.credentials = {};
        $scope.login = function(){
            AuthService.login($scope.credentials);
        }
    }])
    .service('AuthService', ['$http', '$base64', 'Cookie', '$state', 'GLOBAL', function($http, $base64, Cookie, $state, GLOBAL){
        this.login = function(credentials) {
            console.log("login");
            var req = {
                method: 'GET',
                url: 'http://localhost:9090/login',
                headers: {
                    'Authorization': 'Basic ' + $base64.encode(credentials.username + ':' + credentials.password)
                }
            };

            $http(req).success(function(data){
                console.log(data);
                Cookie.set('df_access_token', data.access_token, 10 * 365 * 24 * 3600 * 1000);
                $state.go('console.build');
            }).error(function(data){
                //todo 错误处理
            });
        };
    }]);