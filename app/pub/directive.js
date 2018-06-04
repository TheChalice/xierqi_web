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
                    namespace: '=',
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
                    //$scope.namespace=$rootScope.namespace
                    console.log('$scope.namespace', $scope.namespace);
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
        .directive('truncateLongText', ["truncateFilter", function(truncateFilter) {
            return {
                restrict: 'E',
                scope: {
                    content: '=',
                    limit: '=',
                    newlineLimit: '=',
                    useWordBoundary: '=',
                    expandable: '=',
                    // When expandable is on, optionally hide the collapse link so text can only be expanded. (Used for toast notifications.)
                    hideCollapse: '=',
                    keywords: '=highlightKeywords',  // optional keywords to highlight using the `highlightKeywords` filter
                    prettifyJson: '='                // prettifies JSON blobs when expanded, only used if expandable is true
                },
                templateUrl: 'views/directives/truncateLongText.html',
                link: function(scope) {
                    scope.toggles = {expanded: false};
                    scope.$watch('content', function(content) {
                        if (content) {
                            scope.truncatedContent = truncateFilter(content, scope.limit, scope.useWordBoundary, scope.newlineLimit);
                            scope.truncated = scope.truncatedContent.length !== content.length;
                        }
                        else {
                            scope.truncatedContent = null;
                            scope.truncated = false;
                        }
                    });
                }
            };
        }])
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
                    removeFn: '&?',
                    name:'='
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
        .directive('oscFileInput', function() {
            return {
                restrict: 'E',
                scope: {
                    model: "=",
                    required: "=",
                    disabled: "=ngDisabled",
                    readonly: "=ngReadonly",
                    showTextArea: '=',
                    // Hide the clear value link.
                    hideClear: '=?',
                    helpText: "@?",
                    dropZoneId: "@?"
                },
                templateUrl: 'views/directives/osc-file-input.html',
                link: function(scope, element) {
                    var id = _.uniqueId('osc-file-input-');
                    scope.dropMessageID = id + '-drop-message';
                    scope.helpID = id + '-help';
                    scope.supportsFileUpload = (window.File && window.FileReader && window.FileList && window.Blob);
                    scope.uploadError = false;

                    var dropMessageSelector = "#" + scope.dropMessageID,
                        highlightDropZone = false,
                        showDropZone = false,
                        inputFileField = element.find('input[type=file]');

                    setTimeout(addDropZoneListeners);

                    $(document).on('drop.' + id, function() {
                        removeDropZoneClasses();
                        element.find('.drag-and-drop-zone').trigger('putDropZoneFront', false);
                        return false;
                    });

                    $(document).on('dragenter.' + id, function() {
                        if (scope.disabled) {
                            return;
                        }

                        showDropZone = true;
                        element.find('.drag-and-drop-zone').addClass('show-drag-and-drop-zone');
                        element.find('.drag-and-drop-zone').trigger('putDropZoneFront', true);
                        return false;
                    });

                    $(document).on('dragover.' + id, function() {
                        if (scope.disabled) {
                            return;
                        }

                        showDropZone = true;
                        element.find('.drag-and-drop-zone').addClass('show-drag-and-drop-zone');
                        return false;
                    });

                    $(document).on('dragleave.' + id, function() {
                        showDropZone = false;
                        _.delay(function() {
                            if (!showDropZone) {
                                element.find('.drag-and-drop-zone').removeClass('show-drag-and-drop-zone');
                            }
                        }, 200);
                        return false;
                    });

                    scope.cleanInputValues = function() {
                        scope.model = '';
                        scope.fileName = '';
                        inputFileField[0].value = "";
                    };

                    inputFileField.change(function() {
                        addFile(inputFileField[0].files[0]);
                    });

                    // Add listeners for the dropZone element
                    function addDropZoneListeners() {
                        var dropMessageElement = element.find('.drag-and-drop-zone');

                        dropMessageElement.on('dragover', function() {
                            if (scope.disabled) {
                                return;
                            }

                            dropMessageElement.addClass('highlight-drag-and-drop-zone');
                            highlightDropZone = true;
                        });

                        element.find('.drag-and-drop-zone p').on('dragover', function() {
                            if (scope.disabled) {
                                return;
                            }

                            highlightDropZone = true;
                        });

                        dropMessageElement.on('dragleave', function() {
                            if (scope.disabled) {
                                return;
                            }

                            highlightDropZone = false;
                            _.delay(function() {
                                if (!highlightDropZone) {
                                    dropMessageElement.removeClass('highlight-drag-and-drop-zone');
                                }
                            }, 200);
                        });

                        dropMessageElement.on('drop', function(e) {
                            if (scope.disabled) {
                                return;
                            }

                            var files = _.get(e, 'originalEvent.dataTransfer.files', []);
                            if (files.length > 0) {
                                scope.file = _.head(files);
                                addFile(scope.file);
                            }
                            removeDropZoneClasses();
                            $('.drag-and-drop-zone').trigger('putDropZoneFront', false);
                            $('.drag-and-drop-zone').trigger('reset');
                            return false;
                        });

                        var positionOver = function(element, target) {
                            var offset = target.offset();
                            var outerWidth = target.outerWidth();
                            var outerHeight = target.outerHeight();
                            element.css({
                                // Account for -3px margin by adding 6 to width and height.
                                height: outerHeight + 6,
                                width: outerWidth + 6,
                                top: offset.top,
                                left: offset.left,
                                position: 'fixed',
                                'z-index': 100
                            });
                        };

                        dropMessageElement.on('putDropZoneFront', function(event, putFront) {
                            if (scope.disabled) {
                                return;
                            }

                            var droppableElement, dropZoneMessage = element.find('.drag-and-drop-zone');
                            if (putFront) {
                                droppableElement = (scope.dropZoneId) ? $('#' + scope.dropZoneId) : element,
                                    positionOver(dropZoneMessage, droppableElement);
                            } else {
                                dropZoneMessage.css('z-index', '-1');
                            }
                            return false;
                        });

                        dropMessageElement.on('reset', function() {
                            if (scope.disabled) {
                                return;
                            }

                            showDropZone = false;
                            return false;
                        });
                    }

                    function addFile(file) {
                        var reader = new FileReader();
                        reader.onloadend = function() {
                            scope.$apply(function() {
                                scope.fileName = file.name;
                                scope.model = reader.result;
                            });
                        };
                        reader.onerror = function(e) {
                            scope.supportsFileUpload = false;
                            scope.uploadError = true;
                            //Logger.error("Could not read file", e);
                        };
                        reader.readAsText(file);
                    }

                    function removeDropZoneClasses() {
                        element.find('.drag-and-drop-zone').removeClass("show-drag-and-drop-zone highlight-drag-and-drop-zone");
                    }

                    scope.$on('$destroy', function() {
                        $(dropMessageSelector).off();
                        $(document)
                            .off('drop.' + id)
                            .off('dragenter.' + id)
                            .off('dragover.' + id)
                            .off('dragleave.' + id);
                    });
                }
            };
        })

});