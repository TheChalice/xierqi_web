'use strict';
angular.module('console.config_detail', [
    {
        files: [

        ]
    }
])
    .controller('configDetailCtrl', ['$state', '$http', '$scope', '$rootScope', 'listConfig', '$stateParams',
        function($state, $http, $scope, $rootScope, listConfig, $stateParams){
            listConfig.get({namespace: $rootScope.namespace, name:$stateParams.name}, function(res){
                console.log(res);
                $scope.item = res;
            })
        }]);