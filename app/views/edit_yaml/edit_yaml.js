'use strict';

angular.module('console.edit_yaml_file', [
    {
        files: []
    }])
    .controller('EditYamlCtrl', ['$location', '$stateParams', '$filter', '$rootScope', '$scope', '$state', 'EditYamlDeployment', 'EditYamlDeploymentConfigs',
        function ($location, $stateParams, $filter, $rootScope, $scope, $state, EditYamlDeployment, EditYamlDeploymentConfigs) {
            // console.log('EditYamlCtrl---type', $location.path().split('/')[4]);
            var findType = $location.path().split('/')[4];
            $scope.textError = false;
            function setData(data) {
                if (!data) return;
                delete data.$promise;
                delete data.$resolved;
                $scope.original = data;
                $scope.newData = {};
                $scope.newData.resource = angular.copy(data);
                // console.log('$scope.newData.resource', $scope.newData.resource);
            }
            function saveUpdateData(dataResource,type) {
                if ($scope.newData.resource.kind !== $scope.original.kind){
                    $scope.textError = true;
                    $scope.textErrorMessage = 'kind 不能修改'
                }else if ($scope.newData.resource.apiVersion !== $scope.original.apiVersion){
                    $scope.textError = true;
                    $scope.textErrorMessage = 'apiVersion 不能修改'
                }else if ($scope.newData.resource.metadata.name !== $scope.original.metadata.name){
                    $scope.textError = true;
                    $scope.textErrorMessage = 'name 不能修改'
                }else if ($scope.newData.resource.metadata.namespace !== $scope.original.metadata.namespace){
                    $scope.textError = true;
                    $scope.textErrorMessage = 'namespace 不能修改'
                }else {
                    dataResource.put({
                        namespace: $rootScope.namespace,
                        name: $scope.original.metadata.name,
                        type: type
                    }, $scope.newData.resource, function (response) {
                        // console.log('resres', response);
                        $scope.resource = response;
                        if(type === 'deployment'){
                            $state.go('console.deployment_detail', {
                                namespace: $scope.original.metadata.namespace,
                                name: $scope.original.metadata.name
                            });
                        }else if (type === 'deploymentconfigs'){
                            $state.go('console.deploymentconfig_detail', {
                                namespace: $scope.original.metadata.namespace,
                                name: $scope.original.metadata.name
                            });
                        }

                    })
                }
            }
            function cancelUpdateData(type) {
                if(type === 'deployment'){
                    $state.go('console.deployment_detail', {
                        namespace: $scope.original.metadata.namespace,
                        name: $scope.original.metadata.name
                    });
                }else if (type === 'deploymentconfigs'){
                    $state.go('console.deploymentconfig_detail', {
                        namespace: $scope.original.metadata.namespace,
                        name: $scope.original.metadata.name
                    });
                }
            }

            if (findType == 'deploymentconfigs') {
                EditYamlDeploymentConfigs.get({
                    namespace: $rootScope.namespace,
                    name: $location.path().split('/')[7]
                }, function (result) {
                    setData(result);
                    $scope.save = function () {
                        saveUpdateData(EditYamlDeploymentConfigs,'deploymentconfigs');
                    };
                    $scope.cancel = function () {
                        cancelUpdateData('deploymentconfigs')
                    };
                });

            } else if (findType == 'deployment') {
                EditYamlDeployment.get({
                    namespace: $rootScope.namespace,
                    name: $location.path().split('/')[7]
                }, function (result) {
                    setData(result);
                    $scope.save = function () {
                        saveUpdateData(EditYamlDeployment,'deployment');
                    };
                    $scope.cancel = function () {
                        cancelUpdateData('deployment')
                    };
                });
            }
        }]);