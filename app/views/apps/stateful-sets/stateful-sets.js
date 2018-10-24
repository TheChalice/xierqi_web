'use strict';
angular.module('console.stateful-sets', [{
    files: [
        'components/searchbar/searchbar.js',
        'views/apps/apps.css'
    ]
}])
    .controller('Stateful-setsCtrl', ['statefulsets', '$scope', 'Ws', '$rootScope', '$log', 'Sort',
        function (statefulsets, $scope, Ws, $rootScope, $log, Sort) {
            $scope.text = "无";
            var getStatefulsets = function () {
                statefulsets.get({namespace: $scope.namespace}, function (res) {
                    $scope.items = res.items;
                    $scope.items = Sort.sort($scope.items, -1);
                    $scope.copySets = angular.copy($scope.items);
                    $scope.grid.total = $scope.items.length;
                    $scope.grid.page = 1;
                    $scope.grid.txt = '';
                    $scope.resourceVersion = res.metadata.resourceVersion;
                    watchPc(res.metadata.resourceVersion);
                    refresh(1);
                });
            };
            getStatefulsets();
            $scope.grid = {
                page: 1,
                size: 10,
                txt: ''
            };

            var watchPc = function (resourceVersion) {
                Ws.watch({
                    api: 'wsapis',
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'statefulsets',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updatePC(data);
                    //console.log(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'statefulsets', '');
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    watchPc($scope.resourceVersion);
                });
            };
            var updatePC = function (data) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    getStatefulsets();
                    return;
                }
                $scope.resourceVersion = data.object.metadata.resourceVersion;
                //data.object.spec.resources.requests.storage=data.object.spec.resources.requests.storage.replace('i','B')
                if (data.type == 'ADDED') {
                    $scope.items.unshift(data.object);
                    refresh(1);
                    $scope.$apply();
                } else if (data.type == "MODIFIED") {
                    //data.object.spec.resources.requests.storage=data.object.spec.resources.requests.storage.replace('i','B')
                    angular.forEach($scope.items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.items[i] = data.object;
                            refresh(1);
                            $scope.$apply();
                        }
                    })
                } else if (data.type == "DELETED") {
                    //data.object.spec.resources.requests.storage=data.object.spec.resources.requests.storage.replace('i','B')
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
                $scope.setsItem = $scope.items.slice(skip, skip + $scope.grid.size) || [];
            };
            $scope.search = function (event) {
                $scope.grid.page = 1;
                if (!$scope.grid.txt) {
                    $scope.items = angular.copy($scope.copySets);
                    refresh(1);
                    $scope.grid.total = $scope.items.length;
                    return;
                }
                $scope.items = [];
                var iarr = [];
                var str = $scope.grid.txt;
                str = str.toLocaleLowerCase();
                angular.forEach($scope.copySets, function (item, i) {
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