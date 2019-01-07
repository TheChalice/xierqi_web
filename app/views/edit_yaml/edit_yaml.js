'use strict';

angular.module('console.edit_yaml_file', [
    {
        files: []
    }])
    .controller('EditYamlCtrl', ['$location', '$stateParams', 'toastr', '$rootScope', '$scope', '$state', 'EditYamlDeployment', 'EditYamlDeploymentConfigs',
        function ($location, $stateParams, toastr, $rootScope, $scope, $state, EditYamlDeployment, EditYamlDeploymentConfigs) {
            console.log('EditYamlCtrl---type', $stateParams.kind);
            // var findType = $stateParams.kind;
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
            function saveUpdateData(dataResource,kind) {
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
                        namespace: $stateParams.namespace,
                        name: $stateParams.name
                        // kind: $stateParams.kind
                    }, $scope.newData.resource, function (response) {
                        console.log('resres', response);
                        toastr.success('编辑成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                        $scope.resource = response;
                        if(kind === 'Deployment'){
                            $state.go('console.deployment_detail', {
                                namespace: $stateParams.namespace,
                                name: $stateParams.name
                            });
                        }else if (kind === 'DeploymentConfig'){
                            $state.go('console.deploymentconfig_detail', {
                                namespace: $stateParams.namespace,
                                name: $stateParams.name
                            });
                        }

                    },function (err) {
                        console.log(err);
                        toastr.error('修改有误，请检查重试', {
                            closeButton: true,
                            timeOut: 2000
                        });
                    })
                }
            }
            function cancelUpdateData(kind) {
                if(kind === 'Deployment'){
                    $state.go('console.deployment_detail', {
                        namespace: $stateParams.namespace,
                        name: $stateParams.name
                    });
                }else if (kind === 'DeploymentConfig'){
                    $state.go('console.deploymentconfig_detail', {
                        namespace: $stateParams.namespace,
                        name: $stateParams.name
                    });
                }
            }

            function typeOfData(dataType,kind) {
                dataType.get({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name
                }, function (result) {
                    setData(result);
                    $scope.save = function () {
                        saveUpdateData(dataType,kind);
                    };
                    $scope.cancel = function () {
                        cancelUpdateData(kind)
                    };
                });
            }
            if ($stateParams.kind == 'DeploymentConfig') {
                typeOfData(EditYamlDeploymentConfigs,$stateParams.kind);
            } else if ($stateParams.kind == 'Deployment') {
                typeOfData(EditYamlDeployment,$stateParams.kind);

            }
        }]);