'use strict';

angular.module('console.edit_yaml_file', [
    {
        files: []
    }])
    .controller('EditYamlCtrl', ['$location','$stateParams', '$filter', '$rootScope', '$scope', '$state','EditYamlDeployment','EditYamlDeploymentConfigs',
        function ($location,$stateParams, $filter, $rootScope, $scope, $state, EditYamlDeployment, EditYamlDeploymentConfigs) {
            // console.log('EditYamlCtrl---type', $location.path().split('/')[4]);
            var findType = $location.path().split('/')[4];
            if(findType == 'deploymentconfigs'){
                EditYamlDeploymentConfigs.get({
                    namespace: $rootScope.namespace,
                    name: $location.path().split('/')[7]
                }, function (result) {
                    // console.log('deploymentconfigs-=====', result);
                    $scope.deployment = result;
                });
            }else if(findType == 'deployment'){
                EditYamlDeployment.get({
                    namespace: $rootScope.namespace,
                    name: $location.path().split('/')[7]
                }, function (result) {
                    // console.log('edit_yaml-=====', result);
                    $scope.deployment = result;
                });
            }
        }]);