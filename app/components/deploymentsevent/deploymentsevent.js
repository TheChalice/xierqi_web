/** * Created by sorcerer on 2017/12/29. */angular.module("console.dcevent", []).directive('deploymentsEvent', function () {    return {        restrict: 'E',        templateUrl: 'components/deploymentsevent/deploymentsevent.html',        scope: {            dcname: '=',            dcfit: '@'        },        controller: ['$scope', 'Ws', 'Event', '$rootScope', function ($scope, Ws, Event, $rootScope) {            //console.log($scope.dcname.split('-')[0], $scope.dcfit);            function watchevent(resourceVersion) {                Ws.watch({                    api: 'k8s',                    resourceVersion: resourceVersion,                    namespace: $rootScope.namespace,                    type: 'events',                    name: ''                }, function (res) {                    var data = JSON.parse(res.data);                    updateEvent(data);                }, function () {                    //$log.info("webSocket startRC");                }, function () {                });            }            var updateEvent = function (data) {                //console.log(data.object.involvedObject.name, data.object.involvedObject.kind);                if (data.type == "ADDED") {                    if (data.object.involvedObject.name.split('-')[0] == $scope.dcname.split('-')[0]) {                        data.object.mysort = -(new Date(data.object.metadata.creationTimestamp)).getTime()                        $scope.eventsws.items.push(data.object);                        //$scope.eventsws.items=sortevent($scope.eventsws.items)                        //console.log(data.object.involvedObject.name.split('-')[0] == $scope.dc.metadata.name);                        $scope.$apply()                    }                } else if (data.type == "MODIFIED") {                    if (data.object.involvedObject.name.split('-')[0] == $scope.dcname.split('-')[0]) {                        if (data.object.involvedObject.kind === $scope.dcfit) {                            data.object.mysort = -(new Date(data.object.metadata.creationTimestamp)).getTime()                            $scope.eventsws.items.push(data.object);                            $scope.$apply()                        }                    }                }                //console.log($scope.eventsws);            }            var loadeventws = function () {                Event.get({namespace: $rootScope.namespace, region: $rootScope.region}, function (res) {                    //console.log('event',res);                    if (!$scope.eventsws) {                        $scope.eventsws = []                        var arr = []                        angular.forEach(res.items, function (event, i) {                            //console.log('event', event);                            if (event.involvedObject.kind === $scope.dcfit) {                                if (event.involvedObject.name.split('-')[0] == $scope.dcname.split('-')[0]) {                                    arr.push(event)                                }                            }                        })                        angular.forEach(arr, function (item, i) {                            arr[i].mysort = -(new Date(item.metadata.creationTimestamp)).getTime()                        })                        arr.sort(function (x, y) {                            return x.mysort > y.mysort ? -1 : 1;                        });                        $scope.eventsws.items = arr;                        console.log($scope.eventsws);                    }                    $scope.resource = res.metadata.resourceVersion;                    watchevent(res.metadata.resourceVersion);                }, function (res) {                    //todo 错误处理                    // $log.info("loadEvents err", res)                });            };            loadeventws()        }],    };})