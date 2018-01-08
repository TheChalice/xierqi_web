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
                    customNameHeader: '=?',
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


});