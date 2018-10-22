'use strict';

angular.module('console.events', [
    {
        files: [
            'views/events/events.css'
        ]
    }
])
    .controller('EventsCtrl', ['$rootScope', '$scope', 'Event', 'Ws', '$log',
        function ($rootScope, $scope, Event, Ws, $log) {
            $scope.grid = {
                text: '',
                noItems: '暂无信息'
            };
            Event.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {
                // console.log('0123', res);
                $scope.items = res.items;
                $scope.eventsCopy = angular.copy($scope.items);
                watchEvents(res.metadata.resourceVersion);
            });

            //sort by
            $scope.sortConfig = {
                fields: [{
                    id: 'lastTimestamp',
                    title: 'Time'
                }, {
                    id: 'name',
                    title: 'Name'
                }, {
                    id: 'type',
                    title: 'Kind'
                }, {
                    id: 'reason',
                    title: 'Reason'
                }, {
                    id: 'message',
                    title: 'Message'
                }]
            };

            $scope.chooseMenu = function (idx) {
                // console.log('123',idx);
                $scope.chooseTitle = $scope.sortConfig.fields[idx].title;
                $scope.choosesortType = $scope.sortConfig.fields[idx].id;
                // console.log('choosesortType',$scope.choosesortType);
                //    根据页面选择title，对$scope.items 排序；
                $scope.items.sort(function (first, second) {
                    if ($scope.choosesortType === 'lastTimestamp') {
                        if (first.metadata.creationTimestamp > second.metadata.creationTimestamp) return 1;
                        if (first.metadata.creationTimestamp < second.metadata.creationTimestamp) return -1;
                        return 0;
                    } else if ($scope.choosesortType === 'name') {
                        if (first.involvedObject.name > second.involvedObject.name) return 1;
                        if (first.involvedObject.name < second.involvedObject.name) return -1;
                        return 0;
                    } else if ($scope.choosesortType === 'type') {
                        if (first.involvedObject.kind > second.involvedObject.kind) return 1;
                        if (first.involvedObject.kind < second.involvedObject.kind) return -1;
                        return 0;
                    } else if ($scope.choosesortType === 'reason') {
                        if (first.reason > second.reason) return 1;
                        if (first.reason < second.reason) return -1;
                        return 0;
                    } else if ($scope.choosesortType === 'message') {
                        if (first.message > second.message) return 1;
                        if (first.message < second.message) return -1;
                        return 0;
                    }
                })
            };
            //input search
            $scope.search = function () {
                // console.log('12121');
                if (!$scope.grid.text) {
                    $scope.items = angular.copy($scope.eventsCopy);
                    return;
                } else {
                    $scope.items = [];
                    var iarr = [];
                    var str = $scope.grid.text;
                    str = str.toLocaleLowerCase();
                    angular.forEach($scope.eventsCopy, function (item, i) {
                        var nstr = item.metadata.name;
                        nstr = nstr.toLocaleLowerCase();
                        if (nstr.indexOf(str) !== -1) {
                            iarr.push(item)
                        }
                    });
                    if (iarr.length === 0) {
                        $scope.text = '没有查询到相关数据';
                    }
                    $scope.items = angular.copy(iarr);
                }
            };
            //websocket
            var watchEvents = function (resourceVersion) {
                Ws.watch({
                    api: 'k8s',
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'events',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updateEvents(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'events', '');
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    watchEvents($scope.resourceVersion);
                });
            };

            var updateEvents = function (data) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    return;
                }
                $scope.resourceVersion = data.object.metadata.resourceVersion;
                if (data.type == 'ADDED') {
                    $scope.items.unshift(data.object);
                    $scope.$apply();

                } else if (data.type == "MODIFIED") {
                    angular.forEach($scope.items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.items[i] = data.object;
                            $scope.$apply();
                        }
                    })

                } else if (data.type == "DELETED") {
                    angular.forEach($scope.items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.items.splice(i, 1);
                            $scope.$apply();
                        }
                    })
                }
            };

        }]);