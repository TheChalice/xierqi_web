'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.directive', [])
        .directive('fullHeight', [function () {
            return function (scope, element, attr) {
                var height = document.documentElement.clientHeight - 70 + 'px';
                element.css({
                    'min-height': height
                });
            }
        }])
        .directive('onFinishRender', function ($timeout) {
            return {
                restrict: 'A',
                link: function (scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function () {
                            scope.$emit('ngRepeatFinished');
                        });
                    }
                }
            };
        })
        .directive('statusIcon', function () {
            return {
                restrict: 'E',
                templateUrl: 'views/directives/_status-icon.html',
                scope: {
                    status: '=',
                    disableAnimation: "@"
                },
                link: function ($scope, $elem, $attrs) {
                    $scope.spinning = !angular.isDefined($attrs.disableAnimation);
                }
            };
        })
        .directive('trafficTable', function () {
            return {
                restrict: 'E',
                scope: {
                    routes: '=',
                    services: '=',
                    portsByRoute: '=',
                    showNodePorts: '=?',
                    // Alternative header text to display in the 'Name' column.
                    customNameHeader: '=?'
                },
                templateUrl: 'views/directives/traffic-table.html'
            };
        })
        .directive('podsTable', ["$filter", function ($filter) {
            return {
                restrict: 'E',
                scope: {
                    pods: '=',
                    // Optional active pods map to display whether or not pods have endpoints
                    activePods: '=?',
                    // Optional empty message to display when there are no pods.
                    emptyMessage: '=?',
                    // Alternative header text to display in the 'Name' column.
                    customNameHeader: '=?',
                    // Optional map of explanations or warnings for each phase of a pod
                    podFailureReasons: '=?'
                },
                templateUrl: 'views/directives/pods-table.html',
                link: function ($scope) {
                    var orderObjectsByDate = $filter('orderObjectsByDate');
                    var sortPods = _.debounce(function (pods) {
                        $scope.$evalAsync(function () {
                            $scope.sortedPods = orderObjectsByDate(pods, true);
                        });
                    }, 150, { maxWait: 500 });
                    $scope.$watch('pods', sortPods);
                }
            };
        }])
        .directive('podTemplate', function () {
            return {
                restrict: 'E',
                scope: {
                    podTemplate: '=',
                    imagesByDockerReference: '=',
                    builds: '=',
                    detailed: '=?',
                    // Optional URL for setting health checks on the resource when missing.
                    addHealthCheckUrl: '@?'
                },
                templateUrl: 'views/directives/pod-template.html'
            };
        })
        .directive('podTemplateContainer', function () {
            return {
                restrict: 'E',
                scope: {
                    container: '=podTemplateContainer',
                    imagesByDockerReference: '=',
                    builds: '=',
                    detailed: '=?',
                    labelPrefix: '@?'
                },
                templateUrl: 'views/directives/pod-template-container.html'
            };
        })
        .directive('probe', function () {
            return {
                restrict: 'E',
                scope: {
                    probe: '='
                },
                templateUrl: 'views/directives/probe.html'
            };
        })
        .directive('containerStatuses', ["$filter", function ($filter) {
            return {
                restrict: 'E',
                scope: {
                    pod: '=',
                    onDebugTerminal: '=?',
                    detailed: '=?'
                },
                templateUrl: 'views/pods_detail/tpl/container-statuses.html',
                controller: ['$scope', '$rootScope',
                    function ($scope, $rootScope) {
                        $scope.lastset = function (obj) {
                            for (var name in obj) {
                                return false;
                            }
                            return true;
                        }
                    }],
                link: function (scope) {
                    scope.hasDebugTerminal = angular.isFunction(scope.onDebugTerminal);

                    // var isContainerTerminatedSuccessfully = $filter('isContainerTerminatedSuccessfully');
                    // var haveAllContainersTerminatedSuccessfully = function(containerStatuses) {
                    //   return _.every(containerStatuses, isContainerTerminatedSuccessfully);
                    // };


                    scope.$watch('pod', function (updatedPod) {
                        //   scope.initContainersTerminated = haveAllContainersTerminatedSuccessfully(updatedPod.status.initContainerStatuses);

                        if (scope.expandInitContainers !== false) {
                            scope.expandInitContainers = !scope.initContainersTerminated;
                        }
                    });

                    scope.toggleInitContainer = function () {
                        scope.expandInitContainers = !scope.expandInitContainers;
                    };

                    scope.showDebugAction = function (containerStatus) {

                        if (_.get(scope.pod, 'status.phase') === 'Completed') {
                            return false;
                        }

                        if ($filter('annotation')(scope.pod, 'openshift.io/build.name')) {
                            return false;
                        }

                        if ($filter('isDebugPod')(scope.pod)) {
                            return false;
                        }

                        var waitingReason = _.get(containerStatus, 'state.waiting.reason');
                        if (waitingReason === 'ImagePullBackOff' || waitingReason === 'ErrImagePull') {
                            return false;
                        }

                        return !_.get(containerStatus, 'state.running') || !containerStatus.ready;
                    };

                    scope.debugTerminal = function (containerStatusName) {
                        if (scope.hasDebugTerminal) {
                            return scope.onDebugTerminal.call(this, containerStatusName);
                        }
                    };
                }
            };
        }])
        .directive('volumes', function () {
            return {
                restrict: 'E',
                scope: {
                    volumes: '=',
                    namespace: '=',
                    canRemove: '=?',
                    removeFn: '&?'
                },
                templateUrl: 'views/directives/_volumes.html'
            };
        })
        .directive('podLogs', function () {
            return {
                restrict: 'EA',
                templateUrl: 'views/directives/logs.html',
                scope: {
                    podName: '@podName',
                    podContainer: '=',
                    podResourceVersion: '@podResourceVersion',
                    type: '@type',
                    api: '@api'
                },
                controller: ['$scope', 'ReplicationController', '$rootScope', 'Ws', '$base64', 'ansi_ups', '$sce', '$log',
                    function ($scope, ReplicationController, $rootScope, Ws, $base64, ansi_ups, $sce, $log) {
                        //console.log('$scope.podContainer',$scope.podContainer);
                        $scope.copycon=angular.copy($scope.podContainer)
                        $scope.conlist=[]
                        var makeconarr= function (name) {
                            $scope.conlist=[]
                            angular.forEach($scope.copycon, function (con,i) {
                                if (con.name != name) {
                                    $scope.conlist.push(con)
                                }
                            })
                        }
                        if ($scope.podContainer) {
                            $scope.podContainername=$scope.podContainer[0].name
                            if ($scope.podContainer.length > 1) {
                                $scope.showcon=true
                                $scope.selectcon=$scope.podContainer[0].name
                                makeconarr($scope.selectcon)
                            }
                        }
                        $scope.changecon= function (name) {
                            $scope.selectcon=name;
                            $scope.podContainername=name;
                            makeconarr(name)
                            Ws.clear();
                            watchpod($scope.podResourceVersion, $scope.podContainername, $scope.podName, $scope.api);
                        }

                        var watchpod = function (resourceVersion, podContainerName, podName, api) {
                            $scope.log=''
                            $scope.result=''
                            var wsobj = {
                                namespace: $rootScope.namespace,
                                type: $scope.type,
                                name: podName + '/log',
                                protocols: 'base64.binary.k8s.io',
                                tailLines: 500
                            };
                            if (api) {
                                wsobj.api = api
                            }
                            if (resourceVersion) {
                                wsobj.resourceVersion = resourceVersion
                            }
                            if (podContainerName) {
                                wsobj.pod = podContainerName
                            }

                            //不同屏幕处理
                            var w_h_set = function () {
                                var wid_height = $(window).height();
                                $("#sc").height(wid_height - 320);
                            }
                            $(window).resize(function () {
                                w_h_set();
                            });
                            $(function () {
                                w_h_set();
                            })
                            // console.log('wsobj', wsobj);
                            Ws.watch(wsobj, function (res) {
                                if (res.data && typeof res.data == "string") {
                                    $scope.result += $base64.decode(res.data);
                                    var html = ansi_ups.ansi_to_html($scope.result);
                                    $scope.log = $sce.trustAsHtml(html);
                                    //console.log('$scope.log ', html);
                                    $scope.$apply();

                                }
                            }, function () {
                                $log.info("webSocket startRC");
                            }, function () {
                                $log.info("webSocket stopRC");
                                var key = Ws.key($rootScope.namespace, 'pods', $scope.pod);
                                if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                                    return;
                                }
                            });
                        };
                        watchpod($scope.podResourceVersion, $scope.podContainername, $scope.podName, $scope.api)
                    }]
            };
        })

});