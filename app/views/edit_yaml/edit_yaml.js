'use strict';

angular.module('console.edit_yaml_file', [
    {
        files: []
    }])
    .controller('EditYamlCtrl', ['$filter','$location', '$stateParams', 'toastr', '$rootScope', '$scope', '$state', 'EditYamlDeployment', 'EditYamlDeploymentConfigs',
        function ($filter,$location, $stateParams, toastr, $rootScope, $scope, $state, EditYamlDeployment, EditYamlDeploymentConfigs) {
            // console.log('EditYamlCtrl---type', $stateParams);
            $scope.lineerror={};
            $scope.resourceChanged = false;
            var humanizeKind = $filter('humanizeKind');
            function setData(data) {
                if (!data) return;
                delete data.$promise;
                delete data.$resolved;
                $scope.original = data;
                 //console.log('data====', data);
                $scope.newData = {};
                $scope.newData.resource = angular.copy(data);
            }

            function saveUpdateData(dataResource,kind) {
                if ($scope.newData.resource.kind !== $scope.original.kind) {
                    $scope.error = {
                        message: '不能修 kind 属性'
                    };
                }else if($scope.newData.resource.apiVersion !== $scope.original.apiVersion){
                    $scope.error = {
                        message: '不能修 apiVersion 属性'
                    };
                }else if($scope.newData.resource.name !== $scope.original.name){
                    $scope.error = {
                        message: '不能修 name 属性'
                    };
                }else if($scope.newData.resource.namespace !== $scope.original.namespace){
                    $scope.error = {
                        message: '不能修 namespace 属性'
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
                        console.log('err',err);
                        $scope.error = {
                            message: err.data.message
                        };
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
                        // console.log('$scope.lineerror', $scope.lineerror);
                        if ($scope.lineerror.err) {
                            $scope.error = {
                                message: $scope.lineerror.err.error[0].text
                            };
                            return;
                        }
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