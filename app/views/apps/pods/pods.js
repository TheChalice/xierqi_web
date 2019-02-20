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
            $scope.podStatusName = 'All';
            $scope.statusList = ['All', 'Running', 'Pending', 'Terminating', 'CrashLoopBackOff', 'Completed', 'Failed', 'Unknown'];

            Pod.get({namespace: $scope.namespace}, function (res) {
                $scope.originalItems = Sort.sort(res.items, -1);
                $scope.items = angular.copy($scope.originalItems);
                $scope.grid.total = $scope.items.length;
                watchpod(res.metadata.resourceVersion);
                $scope.grid.page = 1;
                $scope.grid.txt = '';
                refresh(1);
            });
            var getPodStatus = function (pod) {
                if (!pod) {
                    return '';
                }

                if (pod.metadata && pod.metadata.deletionTimestamp) {
                    return 'Terminating';
                }

                var status = pod.status || {};
                if (!status) {
                    return '';
                }
                var reason = status.reason || status.phase;
                if (reason != 'Pending' && reason != 'Failed') {
                    reason = (function () {
                            var containerStatuses = status.containerStatuses || [];
                            for (var i = 0; i < containerStatuses.length; i++) {
                                var item = containerStatuses[i];
                                var state = item.state || {};
                                if (!!state.waiting) {
                                    return state.waiting.reason;
                                } else if (!!state.terminated) {
                                    return state.terminated.reason;
                                } else {
                                    return status.reason || status.phase;
                                }
                            }
                        })() || '';
                }

                if (reason == 'Running' || reason == 'Pending' || reason == 'Failed' || reason == 'Terminating' || reason == 'CrashLoopBackOff' || reason == 'Completed' || reason == 'Unknown') {
                    return reason;
                }
            };
            $scope.changePodStatus = function (status) {
                $scope.podStatusName = status;
                $scope.pageStatus = false;
                filterByStatusAndSearchText();
            };
            var filterByStatusAndSearchText = function () {
                var status = $scope.podStatusName;
                var searchText = $scope.grid.txt;
                var podList = [];
                // console.log('searchText',searchText);
                angular.forEach($scope.originalItems, function (item, i) {
                    var name = item.metadata.name || '';
                    // console.log('getPodStatus(item)',name,status);
                    if (getPodStatus(item) === status && name.indexOf(searchText) > -1) {
                        podList.push(item)
                    } else if (status === 'All' && name.indexOf(searchText) > -1) {
                        podList.push(item);
                    }
                });

                $scope.items = angular.copy(podList);
                // refresh(1);
                if(!$scope.pageStatus){
                    $scope.grid.page = 1;
                    refresh(1);
                }else {
                    refresh($scope.grid.page);
                }
                $scope.grid.total = $scope.items.length;
            };

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
                    $scope.originalItems.unshift(data.object);
                    $scope.$apply();
                    $scope.pageStatus = true;
                    filterByStatusAndSearchText();
                } else if (data.type == "MODIFIED") {
                    angular.forEach($scope.originalItems, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.originalItems[i] = data.object;
                            $scope.$apply();
                        }
                    });
                    $scope.pageStatus = true;
                    filterByStatusAndSearchText();
                } else if (data.type == "DELETED") {
                    angular.forEach($scope.originalItems, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.originalItems.splice(i, 1);
                            $scope.$apply();
                        }
                    });
                    $scope.pageStatus = true;
                    filterByStatusAndSearchText();
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
                $scope.podItem = $scope.items.slice(skip, skip + $scope.grid.size) || [];
            };
            $scope.search = function (event) {
                $scope.grid.page = 1;
                $scope.pageStatus = false;
                filterByStatusAndSearchText();
                $scope.isQuery = false;
                if ($scope.items.length === 0) {
                    $scope.isQuery = true;
                    $scope.text = '没有查询到符合条件的数据';
                    // console.log($scope.items.length);
                }
                else {
                    $scope.text = '您还没有任何创建密钥卷数据';
                }
            };

        }
    ]);