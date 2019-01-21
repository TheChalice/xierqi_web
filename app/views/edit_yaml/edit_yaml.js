'use strict';

angular.module('console.edit_yaml_file', [
    {
        files: []
    }])
    .controller('EditYamlCtrl', ['$location', '$stateParams', 'toastr', '$rootScope', '$scope', '$state', 'EditYamlDeployment', 'EditYamlOfPodAndService', 'EditYamlOfDcAndRoute',
        function ($location, $stateParams, toastr, $rootScope, $scope, $state, EditYamlDeployment, EditYamlOfPodAndService, EditYamlOfDcAndRoute) {
            $scope.lineerror = {};
            //根据url地址获取数值
            function getData() {
                var kind = ($stateParams.kind).toLowerCase() + 's';
                if ($stateParams.kind == 'DeploymentConfig' || $stateParams.kind == 'Route') {
                    typeOfData(EditYamlOfDcAndRoute, kind);
                } else if ($stateParams.kind == 'Deployment') {
                    typeOfData(EditYamlDeployment, kind);
                } else if ($stateParams.kind == 'Pod' || $stateParams.kind == 'Service' || $stateParams.kind == 'Secret' || $stateParams.kind == 'ConfigMap' || $stateParams.kind =='PersistentVolumeClaim') {
                    typeOfData(EditYamlOfPodAndService, kind);
                }
            }

            getData();

            //根据kind获取数据
            function typeOfData(dataType, kind) {
                dataType.get({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name,
                    type: kind
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

            //处理请求到的数据
            function setData(data) {
                if (!data) return;
                delete data.$promise;
                delete data.$resolved;
                $scope.original = data;
                $scope.newData = {};
                $scope.newData.resource = angular.copy(data);
            }

            //页面错误提示
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

            //页面跳转
            function kindOfData(kind) {
                var editKind = kind.toLowerCase();
                kind = editKind.slice(0, kind.length - 1);
                // console.log('kindOfData', kind);
                switch (kind) {
                    case kind: {
                        $state.go('console.' + kind + '_detail', {
                            namespace: $rootScope.namespace,
                            name: $stateParams.name
                        });
                        break;
                    }
                    default:
                        break;

                }
            }

            //页面保存功能
            function saveUpdateData(dataResource, kind) {
                if (iserror('kind') || iserror('apiVersion') || iserror('name') || iserror('namespace')) {
                    return
                }
                dataResource.put({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name,
                    type: kind
                }, $scope.newData.resource, function (response) {
                    toastr.success('编辑成功', {
                        timeOut: 2000,
                        closeButton: true
                    });
                    // console.log('response', response);
                    $scope.newData.resource = response;
                    kindOfData(kind);
                }, function (err) {
                    console.log('err', err);
                    $scope.error = {
                        message: err.data.message
                    };
                })

            }

            //页面取消功能
            function cancelUpdateData(kind) {
                kindOfData(kind);
            }
        }]);