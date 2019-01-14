'use strict';

angular.module('console.edit_yaml_file', [
    {
        files: []
    }])
    .controller('EditYamlCtrl', ['$filter', '$location', '$stateParams', 'toastr', '$rootScope', '$scope', '$state', 'EditYamlDeployment', 'EditYamlDeploymentConfigs','EditYamlOfPod', 'EditYamlOfService', 'EditYamlOfRoute',
        function ($filter, $location, $stateParams, toastr, $rootScope, $scope, $state, EditYamlDeployment, EditYamlDeploymentConfigs, EditYamlOfPod, EditYamlOfService, EditYamlOfRoute) {
            $scope.lineerror = {};
            if ($stateParams.kind == 'DeploymentConfig') {
                typeOfData(EditYamlDeploymentConfigs, $stateParams.kind);
            } else if ($stateParams.kind == 'Deployment') {
                typeOfData(EditYamlDeployment, $stateParams.kind);
            } else if ($stateParams.kind == 'Pod') {
                typeOfData(EditYamlOfPod, $stateParams.kind);
            } else if ($stateParams.kind == 'Service') {
                typeOfData(EditYamlOfService, $stateParams.kind);
            } else if ($stateParams.kind == 'Route') {
                typeOfData(EditYamlOfRoute, $stateParams.kind);
            }
            function typeOfData(dataType, kind) {
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
                        saveUpdateData(dataType, kind);
                    };
                    $scope.cancel = function () {
                        cancelUpdateData(kind)
                    };
                });
            }
            function setData(data) {
                if (!data) return;
                delete data.$promise;
                delete data.$resolved;
                $scope.original = data;
                $scope.newData = {};
                $scope.newData.resource = angular.copy(data);
            }

            function iserror(type, property) {
                var haserr = false;
                var message = '';
                if (property) {
                    if ($scope.newData.resource[type][property] !== $scope.original[type][property]) {
                        haserr = true;
                        message = '不能修改' + property + '属性'
                    }
                } else {
                    if ($scope.newData.resource[type] !== $scope.original[type]) {
                        haserr = true;
                        message = '不能修改' + type + '属性'
                    }
                }
                if (haserr) {
                    $scope.error = {
                        message: message
                    };
                    return true
                } else {
                    return false
                }

            }
            function kindOfData(kind) {
                var kind = kind.toLowerCase();
                switch(kind){
                    case kind:{
                        $state.go('console.'+ kind + '_detail', {
                        namespace: $rootScope.namespace,
                        name: $stateParams.name
                    });
                        break;
                    }
                    default:
                        break;

                }
            }
            function saveUpdateData(dataResource, kind) {
                if (iserror('kind') || iserror('apiVersion') || iserror('name') || iserror('namespace')) {
                    return
                }
                dataResource.put({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name
                }, $scope.newData.resource, function (response) {
                    toastr.success('编辑成功', {
                        timeOut: 2000,
                        closeButton: true
                    });
                    console.log('response',response);
                    $scope.newData.resource = response;
                    kindOfData(kind);
                }, function (err) {
                    console.log('err', err);
                    $scope.error = {
                        message: err.data.message
                    };
                })

            }
            function cancelUpdateData(kind) {
                kindOfData(kind);
            }
        }]);