'use strict';
angular.module('console.secret_detail', [
        {
            files: [

            ]
        }
    ])
    .controller('secretDetailCtrl', ['$state', '$http', '$scope', '$rootScope', 'listSecret', '$stateParams',
        function($state, $http, $scope, $rootScope, listSecret, $stateParams){
            //list the detail of current secret
            listSecret.get({namespace: $rootScope.namespace, name:$stateParams.name},function(res){
                console.log(res);
                $scope.item = res;
                console.log('test item', $scope.item.metadata.name)
            })

            $scope.addSecret = function(){

            }

        }]);