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
    .service('AuthService', ['$rootScope', '$http', '$base64', 'Cookie', '$state', '$log', 'Project', 'GLOBAL', 'Alert', function($rootScope, $http, $base64, Cookie, $state, $log, Project, GLOBAL, Alert){
        this.login = function(credentials) {
            console.log("login");
            var req = {
                method: 'GET',
                url: GLOBAL.login_uri,
                headers: {
                    'Authorization': 'Basic ' + $base64.encode(credentials.username + ':' + credentials.password)
                }
            };

            var loadProject = function(name){
                $log.info("load project");
                Project.get(function(data){
                    $log.info("load project success", data);
                    for(var i = 0; i < data.items.length; i++) {
                        if(data.items[i].metadata.name == name){
                            $rootScope.namespace = name;
                            $state.go('console.build');
                            return;
                        }
                    }
                    $log.info("can't find project");
                }, function(res){
                    $log.info("find project err", res);
                });
            };

            $http(req).success(function(data){
                console.log(data);
                Cookie.set('df_access_token', data.access_token, 10 * 365 * 24 * 3600 * 1000);

                loadProject(credentials.username);

            }).error(function(data){
                Alert.open('错误', '用户名或密码不正确');
            });
        };
    }]);