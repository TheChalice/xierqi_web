'use strict';
angular.module('console.services', [{
    files: [
        'components/searchbar/searchbar.js',
        'views/apps/apps.css'
    ]
}])
    .controller('ServicesCtrl', ['$scope', 'Service', 'Ws', '$rootScope', '$log',
        function ($scope, Service, Ws, $rootScope, $log) {
            $scope.text = "No services have been added to project " + $scope.namespace + ".";
            var getServicesSets = function () {
                Service.get({namespace: $scope.namespace}, function (res) {
                    $scope.items = res.items;
                    $scope.copyServe = angular.copy($scope.items);
                    watchServices(res.metadata.resourceVersion);
                    $scope.grid.total = $scope.items.length;
                    $scope.grid.page = 1;
                    $scope.grid.txt = '';
                    refresh(1);
                });
            };
            getServicesSets();
            $scope.grid = {
                page: 1,
                size: 10,
                txt: ''
            };
            //websocket
            var watchServices = function (resourceVersion) {
                Ws.watch({
                    api: 'k8s',
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'services',
                    name: ''
                }, function (res) {
                    // console.log('res---', res);
                    var data = JSON.parse(res.data);
                    updateServices(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'services', '');
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    watchServices($scope.resourceVersion);
                });
            };

            var updateServices = function (data) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    getServicesSets();
                    return;
                }
                $scope.resourceVersion = data.object.metadata.resourceVersion;
                if (data.type == 'ADDED') {
                    $scope.items.unshift(data.object);
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
                            $scope.items.splice(i, 1);
                            refresh(1);
                            $scope.$apply();
                        }
                    })
                }
            };
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
                $scope.serveItem = $scope.items.slice(skip, skip + $scope.grid.size) || [];
            };
            $scope.search = function (event) {
                $scope.grid.page = 1;
                if (!$scope.grid.txt) {
                    $scope.items = angular.copy($scope.copyServe);
                    refresh(1);
                    $scope.grid.total = $scope.items.length;
                    return;
                }
                $scope.items = [];
                var iarr = [];
                var str = $scope.grid.txt;
                str = str.toLocaleLowerCase();
                angular.forEach($scope.copyServe, function (item, i) {
                    var nstr = item.metadata.name;
                    nstr = nstr.toLocaleLowerCase();
                    if (nstr.indexOf(str) !== -1) {
                        iarr.push(item)
                    }
                });
                if (iarr.length === 0) {
                    $scope.text3 = '没有查询到相关数据';
                }
                else {
                    $scope.text3 = '您还没有创建密钥卷';
                }
                $scope.items = angular.copy(iarr);
                refresh(1);
                $scope.grid.total = $scope.items.length;

            };
        }
    ]);