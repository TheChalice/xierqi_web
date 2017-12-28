'use strict';

define(['angular', 'moment'], function(angular, moment) {
    moment.locale('zh-cn');
    return angular.module('myApp.filter', [])
        .filter('dateRelative', [function() {
            // dropSuffix will tell moment whether to include the "ago" text
            console.log('timestamp', 1);
            return function(timestamp, dropSuffix) {

                if (!timestamp) {
                    return "-";
                }

                return moment(timestamp).fromNow(dropSuffix);
            };
        }])
        .filter('duration', [function() {
            return function(um) {
                if (!um) {
                    return "-";
                }
                var duration = moment.duration(um / 1000000);
                //console.log(duration);
                var humanizedDuration = [];
                var years = duration.years();
                var months = duration.months();
                var days = duration.days();
                var hours = duration.hours();
                var minutes = duration.minutes();
                var seconds = duration.seconds();

                function add(count, pluralText) {
                    if (count > 0) {
                        humanizedDuration.push(count + pluralText);
                    }
                }

                add(years, "年");
                add(months, "月");
                add(days, "日");
                add(hours, "时");
                add(minutes, "分");
                add(seconds, "秒");

                if (humanizedDuration.length === 0) {
                    humanizedDuration.push("0秒");
                }

                if (humanizedDuration.length > 2) {
                    humanizedDuration.length = 2;
                }

                return humanizedDuration.join("");
            };
        }])
        .filter('duration2', [function() {
            return function(um) {
                if (!um) {
                    return "-";
                }
                um = (new Date()).getTime() - (new Date(um)).getTime();
                var duration = moment.duration(um);
                var humanizedDuration = [];
                var years = duration.years();
                var months = duration.months();
                var days = duration.days();
                var hours = duration.hours();
                var minutes = duration.minutes();
                var seconds = duration.seconds();

                function add(count, pluralText) {
                    if (count > 0) {
                        humanizedDuration.push(count + pluralText);
                    }
                }

                add(years, "年");
                add(months, "月");
                add(days, "日");
                add(hours, "时");
                add(minutes, "分");
                add(seconds, "秒");

                if (humanizedDuration.length === 0) {
                    humanizedDuration.push("0秒");
                }

                if (humanizedDuration.length > 2) {
                    humanizedDuration.length = 2;
                }

                return humanizedDuration.join("");
            };
        }])
        .filter('phaseFilter', [function() {
            return function(phase) {
                if (phase == "Complete") {
                    return "构建成功"
                } else if (phase == "Running") {
                    return "正在构建"
                } else if (phase == "Failed") {
                    return "构建失败"
                } else if (phase == "Pending" || phase == "New") {
                    return "正在拉取代码"
                } else if (phase == "Error") {
                    return "构建错误"
                } else if (phase == "Cancelled") {
                    return "终止"
                } else {
                    return phase || "-"
                }
            };
        }])
        .filter('bsiphaseFilter', [function() {
            return function(phase) {
                if (phase == 'Bound') {
                    return "已绑定"
                } else if (phase == 'Unbound') {
                    return "未绑定"
                } else if (phase == 'Provisioning' || phase == 'Pending') {
                    return "正在创建"
                } else if (phase == 'Deleted') {
                    return "正在注销"
                } else {
                    return phase || "-"
                }
            };
        }])
        .filter('bandFilter', [function() {
            return function(phase) {
                if (phase == 'band') {
                    return "已挂载"
                } else if (phase == 'Unbound') {
                    return "未绑定"
                } else if (phase == 'Pending') {
                    return "创建中"
                } else if (phase == 'Bound') {
                    return "未挂载"
                } else {
                    return phase || "-"
                }
            };
        }])
        .filter('numfilter', function() {
            // 分类过滤器
            return function(items, condition) {
                //console.log(items, condition);
                var filtered = [];

                if (condition === undefined || condition === '') {
                    if (items.length) {
                        angular.forEach(items, function(item, i) {
                            item.show = true
                        })
                    }
                    return items;
                }

                angular.forEach(items, function(item) {
                    if (condition.label === item.label) {
                        item.show = true
                        filtered.push(item);
                    } else {
                        item.show = false
                    }
                });
                return filtered;


            };
        })
        .filter('payFilter', [function() {
            return function(phase) {
                if (phase === 'coupon') {
                    return "充值卡"
                } else if (phase === 'wechat') {
                    return "微信支付"
                } else {
                    return phase || "账户余额"
                }
            };
        }])
        .filter('paytypeFilter', [function() {
            return function(phase) {
                if (phase === 'O') {
                    return "充值成功"
                } else if (phase === 'F') {
                    return "扣费失败"
                } else if (phase === 'I') {
                    return "充值中"
                } else if (phase === 'E') {
                    return "充值失败"
                } else {
                    return phase || "-"
                }
            };
        }])
        .filter("timescon", [function() {
            return function(times) {
                if (times) {
                    //var timesfilter = times.replace(/[a-zA-Z]/g,'');
                    return moment(times).format('YYYY-MM-DD HH:mm:ss');
                }
            }
        }])
        .filter("timesconbuy", [function() {
            return function(times) {
                if (times) {
                    //var timesfilter = times.replace(/[a-zA-Z]/g,'');
                    return moment(parseInt(moment(times).format('X')) - 28800).format('YYYY-MM-DD HH:mm:ss');
                }
            }
        }])
        .filter("duration3", [function() {
            return function(times) {
                if (times) {
                    //var timesfilter = times.replace(/[a-zA-Z]/g,'');
                    return moment(times).fromNow();
                }
            }
        }])
        .filter("timescon2", [function() {
            return function(times) {
                if (times) {
                    //var timesfilter = times.replace(/[a-zA-Z]/g,'');
                    return moment(times).format('HH:mm:ss');
                }
            }
        }])
        .filter("timescon3", [function() {
            return function(times) {
                if (times) {
                    //var timesfilter = times.replace(/[a-zA-Z]/g,'');
                    return moment(times).format('YYYY-MM-DD');
                }
            }
        }])
        .filter('webhooks', ['$rootScope', 'GLOBAL', function($rootScope, GLOBAL) {
            return function(buildConfig) {
                var triggers = buildConfig.spec.triggers;
                for (var k in triggers) {
                    if (triggers[k].type == 'GitHub') {
                        return GLOBAL.host_webhooks + '/namespaces/' + $rootScope.namespace + '/buildconfigs/' + buildConfig.metadata.name + '/webhooks/' + triggers[k].github.secret + '/github'
                    }
                }
                return "";
            }
        }])
        .filter('secret', [function() {
            return function(buildConfig) {
                var triggers = buildConfig.spec.triggers;
                for (var k in triggers) {
                    if (triggers[k].type == 'GitHub') {
                        return triggers[k].github.secret
                    }
                }
                return "";
            }
        }])
        .filter('imageStreamName', function() {
            return function(image) {
                if (!image) {
                    return "";
                }
                var match = image.match(/\/([^/]*)@sha256/);
                if (!match) {
                    //return image
                    var tag = image.split(':')[image.split(':').length - 1];
                    var imagename = image.split(':' + tag)[0];
                    console.log('image11', imagename);
                    return imagename;
                }
                return match[1];
            };
        })
        .filter('imageStreamName1', function() {
            return function(image) {
                if (!image) {
                    return "";
                }
                var images = image.split("@");
                return images[0]
            };
        })
        .filter("stripSHAPrefix", function() {
            return function(id) {
                if (!id) {
                    return id;
                }

                if (!/sha256:/.test(id)) {
                    return ""
                }
                return id.replace(/.*sha256:/, "");
            };
        })
        .filter("trimTag", function() {
            return function(id) {
                return id.replace(/:.*/, "");
            };
        })
        .filter("trimMore", function() {
            return function(str) {
                if (str.length >= 15) {
                    return str.slice(0, 15) + '...';
                } else {
                    return str;
                }
            }
        })
        .filter('isWebRoute', ["routeHostFilter", function(routeHostFilter) {
            return function(route) {
                return !!routeHostFilter(route, true) &&
                    _.get(route, 'spec.wildcardPolicy') !== 'Subdomain';
            };
        }])
        .filter('routeWebURL', ["routeHostFilter", function(routeHostFilter) {
            return function(route, host, omitPath) {
                var scheme = (route.spec.tls && route.spec.tls.tlsTerminationType !== "") ? "https" : "http";
                var url = scheme + "://" + (host || routeHostFilter(route));
                if (route.spec.path && !omitPath) {
                    url += route.spec.path;
                }
                return url;
            };
        }])
        .filter('routeTargetPortMapping', function() {
            var portDisplayValue = function(servicePort, containerPort, protocol) {
                servicePort = servicePort || "<unknown>";
                containerPort = containerPort || "<unknown>";

                // \u2192 is a right arrow (see examples below)
                var mapping = "Service Port " + servicePort + " \u2192 Container Port " + containerPort;
                if (protocol) {
                    mapping += " (" + protocol + ")";
                }

                return mapping;
            };

            // Returns a display value for a route target port that includes the
            // service port, e.g.
            //   Service Port 8080 -> Container Port 8081
            // If no target port for the route or service is undefined, returns an
            // empty string.
            // If the corresponding port is not found, returns
            //   Service Port <unknown> -> Container Port 8081
            // or
            //   Service Port web -> Container Port <unknown>
            return function(route, service) {
                if (!route.spec.port || !route.spec.port.targetPort || !service) {
                    return '';
                }
                var targetPort = route.spec.port.targetPort;
                var isPortNamed = function(port) {
                    return angular.isString(port);
                };
                // Find the corresponding service port.
                var servicePort = function(targetPort, service) {
                    return _.find(service.spec.ports, function(servicePort) {
                        if (isPortNamed(targetPort)) {
                            // When using a named port in the route target port, it refers to the service port.
                            return servicePort.name === targetPort;
                        }
                        // Otherwise it refers to the container port (the service target port).
                        // If service target port is a string, we won't be able to correlate the route port.
                        return servicePort.targetPort === targetPort;
                    });
                }; //getServicePortForRoute(targetPort, service);
                if (!servicePort(targetPort, service)) {
                    // Named ports refer to the service port name.
                    if (angular.isString(targetPort)) {
                        return portDisplayValue(targetPort, null);
                    }

                    // Numbers refer to the container port.
                    return portDisplayValue(null, targetPort);
                }

                return portDisplayValue(servicePort(targetPort, service).port, servicePort(targetPort, service).targetPort, servicePort(targetPort, service).protocol);
            };
        })
        .filter('routeLabel', ["routeHostFilter", "routeWebURLFilter", "isWebRouteFilter",
            function(routeHostFilter, routeWebURLFilter, isWebRouteFilter) {
                return function(route, host, omitPath) {

                    if (isWebRouteFilter(route)) {
                        return routeWebURLFilter(route, host, omitPath);
                    }

                    var label = (host || routeHostFilter(route));
                    if (!label) {
                        return '<unknown host>';
                    }

                    var getSubdomain = function(route) {
                        var hostname = _.get(route, 'spec.host', '');
                        return hostname.replace(/^[a-z0-9]([-a-z0-9]*[a-z0-9])\./, '');
                    };

                    if (_.get(route, 'spec.wildcardPolicy') === 'Subdomain') {
                        label = '*.' + getSubdomain(route); //RoutesService.getSubdomain(route);
                    }

                    if (omitPath) {
                        return label;
                    }

                    if (route.spec.path) {
                        label += route.spec.path;
                    }
                    return label;
                };
            }
        ])
        .filter('routeHost', function() {
            return function(route, onlyAdmitted) {
                if (!_.get(route, 'status.ingress')) {
                    return _.get(route, 'spec.host');
                }

                if (!route.status.ingress) {
                    return route.spec.host;
                }
                var oldestAdmittedIngress = null;
                angular.forEach(route.status.ingress, function(ingress) {
                    if (_.some(ingress.conditions, { type: "Admitted", status: "True" }) &&
                        (!oldestAdmittedIngress || oldestAdmittedIngress.lastTransitionTime > ingress.lastTransitionTime)) {
                        oldestAdmittedIngress = ingress;
                    }
                });

                if (oldestAdmittedIngress) {
                    return oldestAdmittedIngress.host;
                }

                return onlyAdmitted ? null : route.spec.host;
            };
        })
        .filter('humanizeTLSTermination', function() {
            return function(termination) {
                console.log('termination', termination)
                switch (termination) {
                    case 'edge':
                        return 'Edge';
                    case 'passthrough':
                        return 'Passthrough';
                    case 'reencrypt':
                        return 'Re-encrypt';
                    default:
                        return termination;
                }
            };
        })
        .filter('uid', function() {
            return function(resource) {
                if (resource && resource.metadata && resource.metadata.uid) {
                    return resource.metadata.uid;
                } else {
                    return resource;
                }
            };
        })
        .filter('annotationName', function() {
            // This maps an annotation key to all known synonymous keys to insulate
            // the referring code from key renames across API versions.
            var annotationMap = {
                "buildConfig": ["openshift.io/build-config.name"],
                "deploymentConfig": ["openshift.io/deployment-config.name"],
                "deployment": ["openshift.io/deployment.name"],
                "pod": ["openshift.io/deployer-pod.name"],
                "deployerPod": ["openshift.io/deployer-pod.name"],
                "deployerPodFor": ["openshift.io/deployer-pod-for.name"],
                "deploymentStatus": ["openshift.io/deployment.phase"],
                "deploymentStatusReason": ["openshift.io/deployment.status-reason"],
                "deploymentCancelled": ["openshift.io/deployment.cancelled"],
                "encodedDeploymentConfig": ["openshift.io/encoded-deployment-config"],
                "deploymentVersion": ["openshift.io/deployment-config.latest-version"],
                "displayName": ["openshift.io/display-name"],
                "description": ["openshift.io/description"],
                "buildNumber": ["openshift.io/build.number"],
                "buildPod": ["openshift.io/build.pod-name"],
                "jenkinsBuildURL": ["openshift.io/jenkins-build-uri"],
                "jenkinsLogURL": ["openshift.io/jenkins-log-url"],
                "jenkinsStatus": ["openshift.io/jenkins-status-json"],
                "loggingUIHostname": ["openshift.io/logging.ui.hostname"],
                "idledAt": ["idling.alpha.openshift.io/idled-at"],
                "idledPreviousScale": ["idling.alpha.openshift.io/previous-scale"],
                "systemOnly": ["authorization.openshift.io/system-only"]
            };
            return function(annotationKey) {
                return annotationMap[annotationKey] || null;
            };
        })
        .filter('annotation', ["annotationNameFilter", function(annotationNameFilter) {
            return function(resource, key) {
                if (resource && resource.metadata && resource.metadata.annotations) {
                    // If the key's already in the annotation map, return it.
                    if (resource.metadata.annotations[key] !== undefined) {
                        return resource.metadata.annotations[key];
                    }
                    // Try and return a value for a mapped key.
                    var mappings = annotationNameFilter(key) || [];
                    for (var i = 0; i < mappings.length; i++) {
                        var mappedKey = mappings[i];
                        if (resource.metadata.annotations[mappedKey] !== undefined) {
                            return resource.metadata.annotations[mappedKey];
                        }
                    }
                    // Couldn't find anything.
                    return null;
                }
                return null;
            };
        }])
        .filter('hasDeploymentConfig', ["annotationFilter", function(annotationFilter) {
            return function(deployment) {
                return !!annotationFilter(deployment, 'deploymentConfig');
            };
        }])
        .filter('deploymentStatus', ["annotationFilter", "hasDeploymentConfigFilter",
            function(annotationFilter, hasDeploymentConfigFilter) {
                return function(deployment) {

                    if (annotationFilter(deployment, 'deploymentCancelled')) {
                        return "Cancelled";
                    }
                    var status = annotationFilter(deployment, 'deploymentStatus');
                    // If it is just an RC (non-deployment) or it is a deployment with more than 0 replicas
                    if (!hasDeploymentConfigFilter(deployment) || status === "Complete" && deployment.spec.replicas > 0) {
                        return "Active";
                    }
                    return status;
                };
            }
        ])
        .filter('routeIngressCondition', function() {
            return function(ingress, type) {
                if (!ingress) {
                    return null;
                }
                return _.find(ingress.conditions, { type: type });
            };
        })
        .filter('podStatus', function() {
            // Return results that match kubernetes/pkg/kubectl/resource_printer.go
            return function(pod) {
                if (!pod || (!pod.metadata.deletionTimestamp && !pod.status)) {
                    return '';
                }

                if (pod.metadata.deletionTimestamp) {
                    return 'Terminating';
                }

                var reason = pod.status.reason || pod.status.phase;

                // Print detailed container reasons if available. Only the last will be
                // displayed if multiple containers have this detail.
                console.log('_', _);
                angular.forEach(pod.status.containerStatuses, function(containerStatus) {
                    var containerReason = _.get(containerStatus, 'state.waiting.reason') || _.get(containerStatus, 'state.terminated.reason'),
                        signal,
                        exitCode;

                    if (containerReason) {
                        reason = containerReason;
                        return;
                    }

                    signal = _.get(containerStatus, 'state.terminated.signal');
                    if (signal) {
                        reason = "Signal: " + signal;
                        return;
                    }

                    exitCode = _.get(containerStatus, 'state.terminated.exitCode');
                    if (exitCode) {
                        reason = "Exit Code: " + exitCode;
                    }
                });
                console.log('reason', reason)
                return reason;
            };
        })
        .filter('humanizeReason', function() {
            return function(reason) {
                var humanizedReason = _.startCase(reason);
                // Special case some values like "BackOff" -> "Back-off"
                return humanizedReason.replace("Back Off", "Back-off").replace("O Auth", "OAuth");
            };
        })
        .filter('humanizePodStatus', ["humanizeReasonFilter", function(humanizeReasonFilter) {
            return humanizeReasonFilter;
        }])
        .filter('numContainersReady', function() {
            return function(pod) {
                var numReady = 0;
                angular.forEach(pod.status.containerStatuses, function(status) {
                    if (status.ready) {
                        numReady++;
                    }
                });
                return numReady;
            };
        })
        .filter('numContainerRestarts', function() {
            return function(pod) {
                var numRestarts = 0;
                angular.forEach(pod.status.containerStatuses, function(status) {
                    numRestarts += status.restartCount;
                });
                return numRestarts;
            };
        })
        .filter('rcStatusFilter', [function() {
            return function(phase) {
                if (phase == "New" || phase == "Pending" || phase == "Running") {
                    return "正在部署"
                } else if (phase == "Complete") {
                    return "部署成功"
                } else if (phase == "Failed") {
                    return "部署失败"
                } else if (phase == "Error") {
                    return "部署错误"
                } else if (phase == "Cancelled") {
                    return "终止"
                } else {
                    return phase || "-"
                }
            };
        }])
        .filter('isDebugPod', ["annotationFilter", function(annotationFilter) {
            return function(pod) {
                return !!annotationFilter(pod, 'debug.openshift.io/source-resource');
            };
        }])
        .filter('debugPodSourceName', ["annotationFilter", function(annotationFilter) {
            return function(pod) {
                var source = annotationFilter(pod, 'debug.openshift.io/source-resource');
                if (!source) {
                    return '';
                }

                var parts = source.split('/');
                if (parts.length !== 2) {
                    Logger.warn('Invalid debug.openshift.io/source-resource annotation value "' + source + '"');
                    return '';
                }

                return parts[1];
            };
        }])
        .filter("toArray", function() {
            return _.toArray;
        })
        .filter('orderObjectsByDate', ["toArrayFilter", function(toArrayFilter) {
            return function(items, reverse) {
                items = toArrayFilter(items);

                /*
                 * Note: This is a hotspot in our code. We sort frequently by date on
                 *       the overview and browse pages.
                 */

                items.sort(function(a, b) {
                    if (!a.metadata || !a.metadata.creationTimestamp || !b.metadata || !b.metadata.creationTimestamp) {
                        throw "orderObjectsByDate expects all objects to have the field metadata.creationTimestamp";
                    }

                    // The date format can be sorted using straight string comparison.
                    // Compare as strings for performance.
                    // Example Date: 2016-02-02T21:53:07Z
                    if (a.metadata.creationTimestamp < b.metadata.creationTimestamp) {
                        return reverse ? 1 : -1;
                    }

                    if (a.metadata.creationTimestamp > b.metadata.creationTimestamp) {
                        return reverse ? -1 : 1;
                    }

                    return 0;
                });

                return items;
            };
        }])
        .filter('imageObjectRef', function() {
            return function(objectRef, /* optional */ nsIfUnspecified, shortOutput) {
                if (!objectRef) {
                    return "";
                }

                var ns = objectRef.namespace || nsIfUnspecified || "";
                if (!_.isEmpty(ns)) {
                    ns = ns + "/";
                }
                var kind = objectRef.kind;
                if (kind === "ImageStreamTag" || kind === "ImageStreamImage") {
                    return ns + objectRef.name;
                }
                if (kind === "DockerImage") {
                    // TODO: replace with real DockerImageReference parse function
                    var name = objectRef.name;
                    // TODO: should we be removing the n
                    if (shortOutput) {
                        name = name.substring(name.lastIndexOf("/") + 1);
                    }
                    return name;
                }
                // TODO: we may want to indicate the actual type
                var ref = ns + objectRef.name;
                return ref;
            };
        });
});