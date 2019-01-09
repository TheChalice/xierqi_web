'use strict';

angular.module('console.edit_yaml_file', [
    {
        files: []
    }])
    .controller('EditYamlCtrl', ['yaml','$location', '$stateParams', 'toastr', '$rootScope', '$scope', '$state', 'EditYamlDeployment', 'EditYamlDeploymentConfigs',
        function (yaml,$location, $stateParams, toastr, $rootScope, $scope, $state, EditYamlDeployment, EditYamlDeploymentConfigs) {
            // console.log('EditYamlCtrl---type', $stateParams);
            $scope.$on('yaml-update-result',function (event,data) {
                switch (data.type) {
                    case 'success': {
                        $scope.syntaxError = null;
                        break;
                    }
                    case 'error': {
                        $scope.syntaxError = {
                            type: data.type,
                            message: data.info.message
                        };
                        break;
                    }
                    case 'warning': {
                        $scope.syntaxError = {
                            type: data.type,
                            message: data.info.message
                        };
                        break;
                    }
                    default:
                        break;
                }

            });

            function setData(data) {
                if (!data) return;
                delete data.$promise;
                delete data.$resolved;
                $scope.original = data;
                // console.log('data====', data);
                $scope.newData = {};
                $scope.newData.resource = angular.copy(data);
            }
            function saveUpdateData(dataResource,kind) {
                if ($scope.syntaxError) {
                    $scope.error = {
                        message: $scope.syntaxError.message
                    };
                    return;
                }

                if ($scope.newData.resource.kind !== $scope.original.kind
                    || $scope.newData.resource.apiVersion !== $scope.original.apiVersion
                    || $scope.newData.resource.metadata.name !== $scope.original.metadata.name
                    || $scope.newData.resource.metadata.namespace !== $scope.original.metadata.namespace){
                    $scope.error = {
                        message: '不能修改这个属性'
                    };
                }else {
                    dataResource.put({
                        namespace: $rootScope.namespace,
                        name: $stateParams.name
                    }, $scope.newData.resource, function (response) {
                        toastr.success('编辑成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                        $scope.newData.resource = response;
                        if(kind === 'Deployment'){
                            $state.go('console.deployment_detail', {
                                namespace: $rootScope.namespace,
                                name: $stateParams.name
                            });
                        }else if (kind === 'DeploymentConfig'){
                            $state.go('console.deploymentconfig_detail', {
                                namespace: $rootScope.namespace,
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
                        namespace: $rootScope.namespace,
                        name: $stateParams.name
                    });
                }else if (kind === 'DeploymentConfig'){
                    $state.go('console.deploymentconfig_detail', {
                        namespace: $rootScope.namespace,
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