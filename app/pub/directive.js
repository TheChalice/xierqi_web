'use strict';

define(['angular'], function(angular) {
    return angular.module('myApp.directive', [])
        .directive('fullHeight', [function() {
            return function(scope, element, attr) {
                var height = document.documentElement.clientHeight - 70 + 'px';
                element.css({
                    'min-height': height
                });
            }
        }])
        .directive('onFinishRender', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function() {
                            scope.$emit('ngRepeatFinished');
                        });
                    }
                }
            };
        })
        .directive('statusIcon', function() {
            return {
                restrict: 'E',
                templateUrl: 'views/directives/_status-icon.html',
                scope: {
                    status: '=',
                    disableAnimation: "@"
                },
                link: function($scope, $elem, $attrs) {
                    $scope.spinning = !angular.isDefined($attrs.disableAnimation);
                }
            };
        })
        .directive('trafficTable', function() {
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
        .directive('podsTable', function($filter) {
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
                link: function($scope) {
                    var orderObjectsByDate = $filter('orderObjectsByDate');
                    var sortPods = _.debounce(function(pods) {
                        $scope.$evalAsync(function() {
                            $scope.sortedPods = orderObjectsByDate(pods, true);
                        });
                    }, 150, { maxWait: 500 });
                    $scope.$watch('pods', sortPods);
                }
            };
        })
        .directive('podTemplate', function() {
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
                templateUrl: 'views/pods_detail/tpl/pod-template.html'
            };
        })
        .directive('podTemplateContainer', function() {
            return {
                restrict: 'E',
                scope: {
                    container: '=podTemplateContainer',
                    imagesByDockerReference: '=',
                    builds: '=',
                    detailed: '=?',
                    labelPrefix: '@?'
                },
                templateUrl: 'views/pods_detail/tpl/pod-template-container.html'
            };
        })


        .directive('containerStatuses', function($filter) {
            return {
              restrict: 'E',
              scope: {
                pod: '=',
                onDebugTerminal: '=?',
                detailed: '=?'
              },
              templateUrl: 'views/pods_detail/tpl/container-statuses.html',
              link: function(scope) {
                scope.hasDebugTerminal = angular.isFunction(scope.onDebugTerminal);
        
                // var isContainerTerminatedSuccessfully = $filter('isContainerTerminatedSuccessfully');
                // var haveAllContainersTerminatedSuccessfully = function(containerStatuses) {
                //   return _.every(containerStatuses, isContainerTerminatedSuccessfully);
                // };
        
                scope.$watch('pod', function(updatedPod) {
                //   scope.initContainersTerminated = haveAllContainersTerminatedSuccessfully(updatedPod.status.initContainerStatuses);
        
                  if (scope.expandInitContainers !== false) {
                    scope.expandInitContainers = !scope.initContainersTerminated;
                  }
                });
        
                scope.toggleInitContainer = function() {
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
        
                scope.debugTerminal = function(containerStatusName) {
                  if (scope.hasDebugTerminal) {
                    return scope.onDebugTerminal.call(this, containerStatusName);
                  }
                };
              }
            };
          })
        .directive('volumes', function() {
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
                    podContainerName: '@podContainerName',
                    podResourceVersion: '@podResourceVersion',
                    type: '@type'
                },
                controller: ['$scope', 'ReplicationController', '$rootScope', 'Ws', '$base64', 'ansi_ups', '$sce', '$log',
                    function ($scope, ReplicationController, $rootScope, Ws, $base64, ansi_ups, $sce, $log) {
                        console.log('$scope.podName---',$scope.podName);
                        var watchpod = function (resourceVersion, podContainerName, podName) {
                            var wsobj ={
                                api: 'k8s',
                                namespace: $rootScope.namespace,
                                type: $scope.type,
                                name: podName + '/log',
                                protocols: 'base64.binary.k8s.io'
                            };
                            if (resourceVersion) {
                                wsobj.resourceVersion=resourceVersion
                            }
                            if (podContainerName) {
                                wsobj.pod=podContainerName
                            }
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
                        watchpod($scope.podResourceVersion, $scope.podContainerName, $scope.podName)
                    }]
            };
        })

});