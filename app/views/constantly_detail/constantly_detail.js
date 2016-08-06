'use strict';
angular.module('console.constantly_detail', [
        {
            files: [

            ]
        }
    ])
    .controller('constDetailCtrl', ['volume','DeploymentConfig','persistent','$stateParams','$state', '$http', '$scope', '$rootScope',
        function(volume,DeploymentConfig,persistent,$stateParams,$state, $http, $scope, $rootScope){
            console.log($stateParams.name);
            $scope.name=$stateParams.name
            persistent.get({namespace: $rootScope.namespace,name:$stateParams.name}, function (res) {
                //console.log('chijiu',res);
                res.arr=[];
                DeploymentConfig.get({namespace: $rootScope.namespace}, function (dcres) {
                    angular.forEach(dcres.items, function (dcitem,i) {
                        angular.forEach(dcitem.spec.template.spec.volumes, function (item,i) {
                            if (res.metadata.name == item.persistentVolumeClaim.claimName) {
                                res.arr.push(dcitem.metadata.name)
                            }
                        })
                    })
                    $scope.persistents=res;
                    console.log('chijiu',res);
                })
            }, function (err) {

            })
        }]);