/** * Created by sorcerer on 2017/12/29. */angular.module("console.dcevent", []).directive('deploymentsEvent', function () {    return {        restrict: 'E',        templateUrl: 'components/deploymentsevent/deploymentsevent.html',        scope: {            dcname: '=',            type: '=',            dcfit: '@'        },        controller: ['$scope', 'Ws', 'Event', '$rootScope', function ($scope, Ws, Event, $rootScope) {            console.log('type', $scope.dcname);            $scope.dataCache = [];            function watchevent(resourceVersion) {                Ws.watch({                    api: 'k8s',                    resourceVersion: resourceVersion,                    namespace: $rootScope.namespace,                    type: 'events',                    name: ''                }, function (res) {                    // console.log('watchevent',res);                    var data = JSON.parse(res.data);                    if ($scope.isPlay) {                        updateEvent(data);                    } else {                        $scope.dataCache.push(data);                    }                }, function () {                    //$log.info("webSocket startRC");                }, function () {                });            }            var updateEvent = function (data) {                if (data.type == "ADDED") {                    if ($scope.type && $scope.type.kind === "ReplicationController") {                        if (data.object.involvedObject.kind === $scope.type.kind) {                            //console.log('data.object', data.object);                            //console.log('$scope.dcname', $scope.dcname);                            if (data.object.involvedObject.name === $scope.dcname) {                                $scope.eventsws.items.push(data.object);                                // $scope.$apply()                            }                        }                    } else {                        console.log('data.object', data.object);                        if (data.object.involvedObject.name.split('-')[0] == $scope.dcname.split('-')[0]) {                            data.object.mysort = -(new Date(data.object.metadata.creationTimestamp)).getTime()                            $scope.eventsws.items.push(data.object);                            // $scope.$apply()                        }                    }                } else if (data.type == "MODIFIED") {                    if (data.object.involvedObject.name.split('-')[0] == $scope.dcname.split('-')[0]) {                        if (data.object.involvedObject.kind === $scope.dcfit) {                            data.object.mysort = -(new Date(data.object.metadata.creationTimestamp)).getTime()                            $scope.eventsws.items.push(data.object);                            // $scope.$apply()                        }                    }                }                //console.log($scope.eventsws);            };            $scope.isPlay = true;            $scope.playEvent = function () {                $scope.isPlay = !$scope.isPlay;                if ($scope.isPlay) {                    while ($scope.dataCache.length > 0) {                        updateEvent($scope.dataCache.shift())                    }                }            };            var loadeventws = function () {                Event.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {                    // console.log('event',res);                    if (!$scope.eventsws) {                        $scope.eventsws = [];                        var arr = [];                        angular.forEach(res.items, function (event, i) {                            //console.log('event', event);                            if ($scope.type && $scope.type.kind === "ReplicationController") {                                if (event.involvedObject.kind === $scope.type.kind) {                                    if (event.involvedObject.name == $scope.dcname) {                                        arr.push(event)                                    }                                }                            } else {                                if (event.involvedObject.kind === $scope.dcfit) {                                    if (event.involvedObject.name.split('-')[0] == $scope.dcname.split('-')[0]) {                                        arr.push(event)                                    }                                }                            }                        });                        angular.forEach(arr, function (item, i) {                            arr[i].mysort = -(new Date(item.metadata.creationTimestamp)).getTime()                        });                        arr.sort(function (x, y) {                            return x.mysort > y.mysort ? -1 : 1;                        });                        $scope.eventsws.items = arr;                        console.log($scope.eventsws);                    }                    $scope.resource = res.metadata.resourceVersion;                    watchevent(res.metadata.resourceVersion);                }, function (res) {                    //todo 错误处理                    // $log.info("loadEvents err", res)                });            };            loadeventws()        }]    };})