'use strict';
angular.module('console.stateful-sets', [{
    files: [
        'components/searchbar/searchbar.js',
        'views/apps/apps.css'
    ]
}])
    .controller('Stateful-setsCtrl', ['statefulsets', '$scope', 'Ws', '$rootScope', '$log', 'Sort',
        function (statefulsets, $scope, Ws, $rootScope, $log, Sort) {
            $scope.text = "当前列表暂时没有数据";
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
                    $scope.uex_back = true;
                    $scope.uex_front = false;
                    // 排列 如果页数发生变化而且点击排序按钮，就refresh()
                    $scope.sortDetail = function () {
                        if ($scope.uex_back) {
                            // alert(1);
                            $scope.items= Sort.sort($scope.items, 1); //排序
                            $scope.uex_back = false;
                            $scope.uex_front = true;
                            $scope.copySets = angular.copy($scope.items);
                            refresh($scope.grid.page);
                        } else {
                            // alert(13);
                            //默认降序
                            $scope.items = Sort.sort($scope.items, -1); //排序
                            $scope.uex_back = true;
                            $scope.uex_front = false;
                            $scope.copySets = angular.copy($scope.items);
                            refresh($scope.grid.page);
                        }

                            if ($scope.text_seach &&$scope.uex_front) {
                                // alert(1);
                                $scope.items_search= Sort.sort($scope.items_search, 1); //排序
                                $scope.uex_back = false;
                                $scope.uex_front = true;
                                $scope.items  = angular.copy($scope.items_search);
                                refresh($scope.grid.page);
                            }
                            if ( $scope.text_seach && $scope.uex_back) {
                                // alert(13);
                                //默认降序
                                $scope.items_search = Sort.sort($scope.items_search, -1); //排序
                                $scope.uex_back = true;
                                $scope.uex_front = false;
                                $scope.items  = angular.copy($scope.items_search);
                                refresh($scope.grid.page);
                            }

                    }
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
                    $scope.uex_back = true;
                    $scope.uex_front = false;
                    $scope.grid.page =1;
                    $scope.text_seach='';
                    refresh(1);
                    $scope.grid.total = $scope.items.length;
                    return;
                }
                $scope.items = [];
                var iarr = [];
                var str = $scope.grid.txt;
                str = str.toLocaleLowerCase();
                $scope.text_seach = str;
                angular.forEach($scope.copySets, function (item, i) {
                    var nstr = item.metadata.name;
                    nstr = nstr.toLocaleLowerCase();
                    if (nstr.indexOf(str) !== -1) {
                        iarr.push(item)
                    }
                });
                $scope.isQuery = false;
                if (iarr.length === 0) {
                    $scope.isQuery = true;
                    $scope.text = '没有查询到符合条件的数据';
                    // console.log($scope.items.length);
                }
                else {
                    $scope.text = '您还没有任何创建密钥卷数据，现在就创建一个吧';
                }
                $scope.items = angular.copy(iarr);
                $scope.items_search = $scope.items;
                refresh(1);
                $scope.grid.total = $scope.items.length;

            };
        }
    ]);