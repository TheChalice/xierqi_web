'use strict';
angular.module('console.pods', [{
    files: [
        'components/searchbar/searchbar.js',
        'views/apps/apps.css'
    ]
}])
    .controller('PodsCtrl', ['$scope', 'Pod', 'Ws', '$rootScope', '$log', 'Sort',
        function ($scope, Pod, Ws, $rootScope, $log, Sort) {
            $scope.text = "当前列表暂时没有数据";
            $scope.grid = {
                page: 1,
                size: 10,
                txt: ''
            };
            Pod.get({ namespace: $scope.namespace }, function (res) {
                $scope.items = res.items;
                $scope.items = Sort.sort(res.items, -1)
                $scope.copyPod = angular.copy($scope.items);
                $scope.grid.total = $scope.items.length;
                watchpod(res.metadata.resourceVersion);
                $scope.grid.page = 1;
                $scope.grid.txt = '';
                refresh(1);
            });

            //websocket
            var watchpod = function (resourceVersion) {
                Ws.watch({
                    api: 'k8s',
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'pods',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updatepod(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'pods', '');
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    watchpod($scope.resourceVersion);
                });
            };

            var updatepod = function (data) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    return;
                }
                $scope.resourceVersion = data.object.metadata.resourceVersion;
                if (data.type == 'ADDED') {
                    $scope.items.unshift(data.object)
                    refresh(1);
                    $scope.$apply();

                } else if (data.type == "MODIFIED") {
                    angular.forEach($scope.items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.items[i] = data.object;
                            refresh(1);
                            $scope.$apply();
                        }
                    })

                } else if (data.type == "DELETED") {
                    angular.forEach($scope.items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.items.splice(i, 1)
                            refresh(1);
                            $scope.$apply();
                        }
                    })
                }
            }




            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });
            var refresh = function (page) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                $scope.podItem = $scope.items.slice(skip, skip + $scope.grid.size) || [];
            };
            $scope.search = function (event) {
                $scope.grid.page = 1;
                if (!$scope.grid.txt) {
                    $scope.items = angular.copy($scope.copyPod);
                    refresh(1);
                    $scope.grid.total = $scope.items.length;
                    return;
                }
                $scope.items = [];
                var iarr = [];
                var str = $scope.grid.txt;
                str = str.toLocaleLowerCase();
                angular.forEach($scope.copyPod, function (item, i) {
                    var nstr = item.metadata.name;
                    nstr = nstr.toLocaleLowerCase();
                    if (nstr.indexOf(str) !== -1) {
                        iarr.push(item)
                    }
                })
                $scope.isQuery = false;
                if (iarr.length === 0) {
                    $scope.isQuery = true;
                    $scope.text = '没有查询到符合条件的数据';
                    // console.log($scope.items.length);
                }
                else {
                    $scope.text = '您还没有任何创建密钥卷数据';
                }
                $scope.items = angular.copy(iarr);
                refresh(1);
                $scope.grid.total = $scope.items.length;

            };

        }
    ]);