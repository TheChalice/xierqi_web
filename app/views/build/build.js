'use strict';

angular.module('console.build', [
    {
        files: ['components/searchbar/searchbar.js']
    }
])
    .controller('BuildCtrl', ['$scope', '$log', '$stateParams', 'Build', 'AuthService', function ($scope, $log, $stateParams, Build, AuthService) {
        $scope.namespace = $stateParams.namespace || 'default';

        if(AuthService.isLoggedIn()){
            AuthService.withUser().then(function(user) {
                $log.info("authService success", user);
            }, function(){
                $log.info("authService fail")
            });
        } else {
            $log.info("err");
        }

        var loadBuilds = function() {
            Build.get({namespace: $scope.namespace}, function(data){
                $log.info('data', data);
            })
        };

        loadBuilds();


    }]);

