'use strict';
angular.module('console.config_detail', [
    {
        files: []
    }
])
    .controller('configDetailCtrl', ['Confirm', 'configmaps', 'secretskey', 'by', '$state', '$http', '$scope', '$rootScope', 'listConfig', '$stateParams', 'toastr',
        function (Confirm, configmaps, secretskey, by, $state, $http, $scope, $rootScope, listConfig, $stateParams, toastr) {
            $scope.grid = {
                status: false
            };
            listConfig.get({
                namespace: $rootScope.namespace,
                name: $stateParams.name,
                region: $rootScope.region
            }, function (res) {
                console.log(res);
                $scope.volume = res;
                $scope.volume.configitems = [];
                $scope.change = false;
                angular.forEach($scope.volume.data, function (item, i) {
                    $scope.volume.configitems.push({key: i, value: item, showLog: false, isEdit: false});
                })
            }, function (err) {
                $state.go('console.resource_configMap', {namespace: $rootScope.namespace});
            });
            function readSingleFile(e) {
                var thisfilename = this.value;
                //console.log(thisfilename);
                if (thisfilename.indexOf('\\')) {
                    var arr = thisfilename.split('\\');
                    thisfilename = arr[arr.length - 1]
                }
                var file = e.target.files[0];
                if (!file) {
                    return;
                }
                var reader = new FileReader();
                reader.onload = function (e) {
                    var content = e.target.result;
                    $scope.volume.configitems[$scope.check].value = content;
                    $scope.$apply();
                };
                reader.readAsText(file);
            }
            $scope.cdEnter = function (idx) {
                $('div[class~="diantiao"]')[idx].style.backgroundColor = '#f7f8fb';
            };
            $scope.cdOut = function (idx) {
                if (!$scope.volume.configarr[idx].showLog) {
                    $('div[class~="diantiao"]')[idx].style.backgroundColor = '#fff';
                }
            };

            //添加文件
           $scope.addFile = function (i) {
                $scope.check = i;
                // document.getElementById('file-input').addEventListener('change', readSingleFile, false);
               document.getElementsByClassName('upLoadFile')[$scope.check].addEventListener('change', readSingleFile, false);
           };
            //删除新加数据
            $scope.deletekv = function (idx) {
                $scope.volume.configitems.splice(idx, 1);
            };
            //清空新加数据
            $scope.clearCode = function (index) {
                $scope.volume.configitems[index].value = '';
            };
            //新加配置文件
            $scope.AddConfigurationFile = function () {
                $scope.volume.configitems.push({key: '', value: ''});
            };
            //保存修改--- 请求后台接口
            $scope.isCreate = true;
            function keyerr(arr) {
                console.log('arr,', arr);
                var rex = /^\.?[a-z0-9]([-a-z0-9]*[a-z0-9])?(\.[a-z0-9]([-a-z0-9]*[a-z0-9])?)*$/;
                var cancreat = true;
                angular.forEach(arr, function (item, i) {
                    if (item.key === '') {
                        cancreat = false;
                        item.err.key.nil = true
                    } else if (!rex.test(item.key)) {
                        cancreat = false;
                        item.err.key.rexed = true
                    } else {
                        angular.forEach(arr, function (initem, k) {
                            if (i !== k) {
                                if (item.key === initem.key) {
                                    cancreat = false;
                                    item.err.key.repeated = true;
                                    initem.err.key.repeated = true;
                                }
                            }
                        })
                    }
                });
                if (cancreat) {
                    return 'cancreat'
                } else {
                    return 'dontcreat'
                }
            }
            $scope.cearteconfig = function () {
                $scope.volume.data = {};
                angular.forEach($scope.volume.configitems, function (item, i) {
                    $scope.volume.configitems[i].err = {
                        key: {
                            nil: false,
                            rexed: false,
                            repeated: false
                        }
                    }
                });
                console.log('keyerr($scope.volume.configitems)', keyerr($scope.volume.configitems));
                if (keyerr($scope.volume.configitems) !== 'cancreat') {

                    return
                }
                angular.forEach($scope.volume.configitems, function (item, i) {
                    $scope.volume.data[item.key] = item.value;
                });
                delete $scope.volume.configarr;
                delete $scope.volume.configitems;
                configmaps.updata({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name,
                    region: $rootScope.region
                }, $scope.volume, function (res) {
                    toastr.success('更新成功', {
                        closeButton: true
                    });
                    $state.go('console.resource_configMap', {namespace: $rootScope.namespace});
                })
            };
            //删除配置卷这条名称--- 请求后台接口
            $scope.delete = function () {
                Confirm.open("删除配置卷", "您确定要删除配置卷吗？", "如果配置卷已经挂载在容器中，删除此配置卷，容器启动将异常", "stop").then(function () {
                    configmaps.delete({
                        namespace: $rootScope.namespace,
                        name: $stateParams.name,
                        region: $rootScope.region
                    }, $scope.volume, function (res) {
                        toastr.success('删除成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                        $state.go('console.resource_configMap', {namespace: $rootScope.namespace});
                    }, function (err) {
                        Confirm.open("删除密钥卷", "删除密钥卷失败", "存储卷已经挂载在容器中，您需要先停止服务，卸载存储卷后，才能删除。", null, true)
                        toastr.error('删除失败，请重试', {
                            closeButton: true,
                            timeOut: 2000
                        });
                    })
                })
            };
        }]);