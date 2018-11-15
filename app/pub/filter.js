'use strict';

define(['angular', 'moment'], function(angular, moment) {
    moment.locale('zh-cn');
    return angular.module('myApp.filter', [])
        .filter('imageSHA', function() {
            // Returns the trailing @sha:`...` if present from an image name.
            return function(imageName) {
                if (!imageName) {
                    return imageName;
                }
                var parts = imageName.split('@');
                return parts.length > 1 ? parts[1] : '';
            };
        })
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
        .filter('Millistime', [function() {
            // dropSuffix will tell moment whether to include the "ago" text

            return function(timestamp) {
                if (!timestamp) {
                    return "-";
                }
                //console.log('timestamp',moment().minutes(timestamp));
               var newtimestamp=moment().milliseconds(timestamp)
                return moment(newtimestamp).fromNow();

            };

        }])
        .filter('truncate', function() {
            return function(str, charLimit, useWordBoundary, newlineLimit) {
                if (!str) {
                    return str;
                }

                var truncated = str;

                if (charLimit) {
                    truncated = truncated.substring(0, charLimit);
                }

                if (newlineLimit) {
                    var nthNewline = str.split("\n", newlineLimit).join("\n").length;
                    truncated = truncated.substring(0, nthNewline);
                }

                if (useWordBoundary !== false) {
                    // Find the last word break, but don't look more than 10 characters back.
                    // Make sure we show at least the first 5 characters.
                    var startIndex = Math.max(4, charLimit - 10);
                    var lastSpace = truncated.lastIndexOf(/\s/, startIndex);
                    if (lastSpace !== -1) {
                        truncated = truncated.substring(0, lastSpace);
                    }
                }

                return truncated;
            };
        })
        .filter('highlightKeywords', ["KeywordService", function(KeywordService) {
            // Returns HTML wrapping the matching words in a `mark` tag.
            return function(str, keywords, caseSensitive) {
                if (!str) {
                    return str;
                }

                if (_.isEmpty(keywords)) {
                    return _.escape(str);
                }

                // If passed a plain string, get the keywords from KeywordService.
                if (_.isString(keywords)) {
                    keywords = KeywordService.generateKeywords(keywords);
                }

                // Combine the keywords into a single regex.
                var source = _.map(keywords, function(keyword) {
                    if (_.isRegExp(keyword)) {
                        return keyword.source;
                    }
                    return _.escapeRegExp(keyword);
                }).join('|');

                // Search for matches.
                var match;
                var result = '';
                var lastIndex = 0;
                var flags = caseSensitive ? 'g' : 'ig';
                var regex = new RegExp(source, flags);
                while ((match = regex.exec(str)) !== null) {
                    // Escape any text between the end of the last match and the start of
                    // this match, and add it to the result.
                    if (lastIndex < match.index) {
                        result += _.escape(str.substring(lastIndex, match.index));
                    }

                    // Wrap the match in a `mark` element to use the Bootstrap / Patternfly highlight styles.
                    result += "<mark>" + _.escape(match[0]) + "</mark>";
                    lastIndex = regex.lastIndex;
                }

                // Escape any remaining text and add it to the result.
                if (lastIndex < str.length) {
                    result += _.escape(str.substring(lastIndex));
                }

                return result;
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
        .filter('durdate', [function() {
        return function(um) {
            if (!um) {
                return "-";
            }
            um = (new Date(um)).getTime();
            moment.locale('zh-cn');
            var humanizedDuration = moment(new Date(um)).format(" MMMM Do YYYY, h:mm:ss a");
            return humanizedDuration;
        };
    }])
        .filter('webhookURL', ['DataService',function(DataService) {
        return function(buildConfig, type, secret, project) {
          return DataService.url({
            // arbitrarily many subresources can be included
            // url encoding of the segments is handled by the url() function
            // subresource segments cannot contain '/'
            resource: "buildconfigs/webhooks/" + secret + "/" + type.toLowerCase(),
            name: buildConfig,
            namespace: project
          });
        };
      }])
        .filter('durationtwo', [function() {
        return function(um, t) {
            var durstatus = new Date(t).getTime() - new Date(um).getTime();
            var duration = moment.duration(durstatus);
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
                    return "拉取代码"
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
        .filter('imageStreamNameOne', function() {
            return function(image) {
                if (!image) {
                    return "";
                }
                // TODO move this parsing method into a utility method

                // remove @sha256:....
                var imageWithoutID = image.split("@")[0];

                var slashSplit = imageWithoutID.split("/");
                var semiColonSplit;
                if (slashSplit.length === 3) {
                    semiColonSplit = slashSplit[2].split(":");
                    return slashSplit[1] + '/' + semiColonSplit[0];
                }
                else if (slashSplit.length === 2) {
                    // TODO umm tough... this could be registry/imageName or imageRepo/imageName
                    // have to check if the first bit matches a registry pattern, will handle this later...
                    return imageWithoutID;
                }
                else if (slashSplit.length === 1) {
                    semiColonSplit = imageWithoutID.split(":");
                    return semiColonSplit[0];
                }
            };
        })
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
                console.log(match)
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
        .filter("stripSHAPrefixOne", function() {
            return function(id) {
                if (!id) {
                    return id;
                }

                return id.replace(/^sha256:/, "");
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
                    //console.log("annotationFilter(deployment, 'deploymentCancelled')", annotationFilter(deployment, 'deploymentCancelled'));
                    if (annotationFilter(deployment, 'deploymentCancelled')) {
                        return "Cancelled";
                    }
                    //console.log(annotationFilter(deployment, 'deploymentStatus'));
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
        .filter('piplineStatusFilter', [function() {
            return function(phase) {
                if (phase == "New" || phase == "Pending" || phase == "Running") {
                    return "正在部署"
                } else if (phase == "Complete") {
                    return "流程完成"
                } else if (phase == "Failed") {
                    return "流程失败"
                } else if (phase == "Error") {
                    return "流程错误"
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
        })
        .filter('deploymentIsLatest',['annotationFilter',function(annotationFilter) {
            return function(deployment, deploymentConfig) {
                if (!deploymentConfig || !deployment) {
                    return false;
                }
                var deploymentVersion = parseInt(annotationFilter(deployment, 'deploymentVersion'));
                var deploymentConfigVersion = deploymentConfig.status.latestVersion;
                return deploymentVersion === deploymentConfigVersion;
            };
        }])
        //.filter('deploymentStatus', ['annotationFilter', 'hasDeploymentConfigFilter', function(annotationFilter, hasDeploymentConfigFilter) {
        //    return function(deployment) {
        //        //console.log('deployment', deployment);
        //        // We should show Cancelled as an actual status instead of showing Failed
        //        //console.log('annotationFilter', annotationFilter);
        //        if (annotationFilter(deployment, 'deploymentCancelled')) {
        //            return "Cancelled";
        //        }
        //        var status = annotationFilter(deployment, 'deploymentStatus');
        //        // If it is just an RC (non-deployment) or it is a deployment with more than 0 replicas
        //        if (!hasDeploymentConfigFilter(deployment) || status === "Complete" && deployment.spec.replicas > 0) {
        //            return "Active";
        //        }
        //        return status;
        //    };
        //}])
        .filter('displayName', ["annotationFilter", function(annotationFilter) {
            // annotationOnly - if true, don't fall back to using metadata.name when
            //                  there's no displayName annotation
            return function(resource, annotationOnly) {
                var displayName = annotationFilter(resource, "displayName");
                if (displayName || annotationOnly) {
                    return displayName;
                }

                if (resource && resource.metadata) {
                    return resource.metadata.name;
                }

                return null;
            };
        }])
        .filter('upperFirst', function() {
            // Uppercase the first letter of a string (without making any other changes).
            // Different than `capitalize` because it doesn't lowercase other letters.
            return _.upperFirst;
        })
        .filter('startCase', function() {
            return _.startCase;
        })
        .filter('humanizeKind', ["startCaseFilter", function(startCaseFilter) {
            // Changes "ReplicationController" to "replication controller".
            // If useTitleCase, returns "Replication Controller".
            return function(kind, useTitleCase) {
                if (!kind) {
                    return kind;
                }

                if (kind === 'ServiceInstance') {
                    return useTitleCase ? 'Provisioned Service' : 'provisioned service';
                }

                var humanized = _.startCase(kind);
                if (useTitleCase) {
                    return humanized;
                }

                return humanized.toLowerCase();
            };
        }])
        .filter('usageValue', function() {
            return function(value) {
                if (!value) {
                    return value;
                }
                var split = /(-?[0-9\.]+)\s*(.*)/.exec(value);
                if (!split) {
                    // We didn't get an amount? shouldn't happen but just in case
                    return value;
                }
                var number = split[1];
                if (number.indexOf(".") >= 0) {
                    number = parseFloat(number);
                } else {
                    number = parseInt(split[1]);
                }
                var siSuffix = split[2];
                var multiplier = 1;
                switch (siSuffix) {
                    case 'E':
                        multiplier = Math.pow(1000, 6);
                        break;
                    case 'P':
                        multiplier = Math.pow(1000, 5);
                        break;
                    case 'T':
                        multiplier = Math.pow(1000, 4);
                        break;
                    case 'G':
                        multiplier = Math.pow(1000, 3);
                        break;
                    case 'M':
                        multiplier = Math.pow(1000, 2);
                        break;
                    case 'K':
                    case 'k':
                        multiplier = 1000;
                        break;
                    case 'm':
                        multiplier = 0.001;
                        break;
                    case 'Ei':
                        multiplier = Math.pow(1024, 6);
                        break;
                    case 'Pi':
                        multiplier = Math.pow(1024, 5);
                        break;
                    case 'Ti':
                        multiplier = Math.pow(1024, 4);
                        break;
                    case 'Gi':
                        multiplier = Math.pow(1024, 3);
                        break;
                    case 'Mi':
                        multiplier = Math.pow(1024, 2);
                        break;
                    case 'Ki':
                        multiplier = 1024;
                        break;
                }

                return number * multiplier;
            };
        })
        .filter('humanizeUnit', function() {
            return function(unit, type, singular) {
                switch (type) {
                    case "memory":
                    case "limits.memory":
                    case "requests.memory":
                    case "storage":
                        if (!unit) {
                            return unit;
                        }
                        return unit + "B";
                    case "cpu":
                    case "limits.cpu":
                    case "requests.cpu":
                        if (unit === "m") {
                            unit = "milli";
                        }
                        var suffix = (singular) ? 'core' : 'cores';
                        return (unit || '') + suffix;
                    default:
                        return unit;
                }
            };
        })
        // Returns the amount and unit for compute resources, normalizing the unit.
        .filter('amountAndUnit',['humanizeUnitFilter', function(humanizeUnitFilter) {
            return function(value, type, humanizeUnits) {
                if (!value) {
                    return [value, null];
                }
                var split = /(-?[0-9\.]+)\s*(.*)/.exec(value);
                if (!split) {
                    // We didn't get an amount? shouldn't happen but just in case
                    return [value, null];
                }

                var amount = split[1];
                var unit = split[2];
                if (humanizeUnits) {
                    unit = humanizeUnitFilter(unit, type, amount === "1");
                }

                return [amount, unit];
            };
        }])
        .filter('percent', function() {
            // Takes a number like 0.33 and returns "33%". `precision` is the optional
            // number of digits to appear after the decimal point.
            return function(value, precision) {
                if (value === null || value === undefined) {
                    return value;
                }
                return _.round(Number(value) * 100, precision) + "%";
            };
        })
        .filter('humanizeQuotaResource', function() {
            return function(resourceType, useTitleCase) {
                if (!resourceType) {
                    return resourceType;
                }

                var nameTitleCaseFormatMap = {
                    'configmaps': 'Config Maps',
                    'cpu': 'CPU (Request)',
                    'limits.cpu': 'CPU (Limit)',
                    'limits.memory': 'Memory (Limit)',
                    'memory': 'Memory (Request)',
                    'openshift.io/imagesize': 'Image Size',
                    'openshift.io/imagestreamsize': 'Image Stream Size',
                    'openshift.io/projectimagessize': 'Project Image Size',
                    'persistentvolumeclaims': 'Persistent Volume Claims',
                    'requests.storage': 'Storage (Request)',
                    'pods': 'Pods',
                    'replicationcontrollers': 'Replication Controllers',
                    'requests.cpu': 'CPU (Request)',
                    'requests.memory': 'Memory (Request)',
                    'resourcequotas': 'Resource Quotas',
                    'secrets': 'Secrets',
                    'services': 'Services',
                    'services.loadbalancers': 'Service Load Balancers',
                    'services.nodeports': 'Service Node Ports'
                };

                var nameFormatMap = {
                    'configmaps': 'config maps',
                    'cpu': 'CPU (request)',
                    'limits.cpu': 'CPU (limit)',
                    'limits.memory': 'memory (limit)',
                    'memory': 'memory (request)',
                    'openshift.io/imagesize': 'image size',
                    'openshift.io/imagestreamsize': 'image stream size',
                    'openshift.io/projectimagessize': 'project image size',
                    'persistentvolumeclaims': 'persistent volume claims',
                    'requests.storage': 'storage (request)',
                    'replicationcontrollers': 'replication controllers',
                    'requests.cpu': 'CPU (request)',
                    'requests.memory': 'memory (request)',
                    'resourcequotas': 'resource quotas',
                    'services.loadbalancers': 'service load balancers',
                    'services.nodeports': 'service node ports'
                };
                if (useTitleCase) {
                    return nameTitleCaseFormatMap[resourceType] || resourceType;
                }
                return nameFormatMap[resourceType] || resourceType;
            };
        })
        .filter('humanizeKind', ["startCaseFilter", function(startCaseFilter) {
            // Changes "ReplicationController" to "replication controller".
            // If useTitleCase, returns "Replication Controller".
            return function(kind, useTitleCase) {
                if (!kind) {
                    return kind;
                }

                if (kind === 'ServiceInstance') {
                    return useTitleCase ? 'Provisioned Service' : 'provisioned service';
                }

                var humanized = _.startCase(kind);
                if (useTitleCase) {
                    return humanized;
                }

                return humanized.toLowerCase();
            };
        }])
        // Checks if a value is null or undefined.
        .filter('isNil', function() {
            return function(value) {
                return value === null || value === undefined;
            };
        })
        // Formats a compute resource value for display.
        .filter('usageWithUnits',['amountAndUnitFilter', function(amountAndUnitFilter) {
            return function(value, type) {
                var toString = _.spread(function(amount, unit) {
                    if (!unit) {
                        return amount;
                    }

                    return amount + " " + unit;
                });

                return toString(amountAndUnitFilter(value, type, true));
            };
        }])
        .filter('upperFirst', function() {
            // Uppercase the first letter of a string (without making any other changes).
            // Different than `capitalize` because it doesn't lowercase other letters.
            return _.upperFirst;
        })
        .filter("getErrorDetails", ["upperFirstFilter", function(upperFirstFilter) {
            return function(result, capitalize) {
                if (!result) {
                    return "";
                }

                var error = result.data || {};
                if (error.message) {
                    return capitalize ? upperFirstFilter(error.message) : error.message;
                }

                var status = result.status || error.status;
                if (status) {
                    return "Status: " + status;
                }

                return "";
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
        .filter('lastDeploymentRevision', ['annotationFilter', function(annotationFilter) {
            return function(deployment) {
                if (!deployment) {
                    return '';
                }

                var revision = annotationFilter(deployment, 'deployment.kubernetes.io/revision');
                return revision ? "#" + revision : 'Unknown';
            };
        }])
        .filter('camelToLower', function() {
            return function(str) {
                if (!str) {
                    return str;
                }

                // Use the special logic in _.startCase to handle camel case strings, kebab
                // case strings, snake case strings, etc.
                return _.startCase(str).toLowerCase();
            };
        })
        .filter('upperFirst', function() {
            // Uppercase the first letter of a string (without making any other changes).
            // Different than `capitalize` because it doesn't lowercase other letters.
            return function(str) {
                if (!str) {
                    return str;
                }

                return str.charAt(0).toUpperCase() + str.slice(1);
            };
        })
        .filter('sentenceCase', ["camelToLowerFilter", "upperFirstFilter", function(camelToLowerFilter, upperFirstFilter) {
            // Converts a camel case string to sentence case
            return function(str) {
                if (!str) {
                    return str;
                }

                // Unfortunately, _.lowerCase() and _.upperFirst() aren't in our lodash version.
                var lower = camelToLowerFilter(str);
                return upperFirstFilter(lower);
            };
        }])
        .filter('podTemplate', function() {
            return function(apiObject) {
                if (!apiObject) {
                    return null;
                }

                if (apiObject.kind === 'Pod') {
                    return apiObject;
                }

                return _.get(apiObject, 'spec.template');
            };
        })
        .filter('hasHealthChecks', function() {
            return function(podTemplate) {
                // Returns true if every container has a readiness or liveness probe.
                var containers = _.get(podTemplate, 'spec.containers', []);
                return _.every(containers, function(container) {
                    return container.readinessProbe || container.livenessProbe;
                });
            };
        })
        //add
        .filter('podStartTime', function() {
            return function(pod) {
                var earliestStartTime = null;
                _.each(_.get(pod, 'status.containerStatuses'), function(containerStatus) {
                    var status = _.get(containerStatus, 'state.running') || _.get(containerStatus, 'state.terminated');
                    if (!status) {
                        return;
                    }
                    if (!earliestStartTime || moment(status.startedAt).isBefore(earliestStartTime)) {
                        earliestStartTime = status.startedAt;
                    }
                });
                return earliestStartTime;
            };
        })
        .filter('podCompletionTime', function() {
            return function(pod) {
                var lastFinishTime = null;
                _.each(_.get(pod, 'status.containerStatuses'), function(containerStatus) {
                    var status = _.get(containerStatus, 'state.terminated');
                    if (!status) {
                        return;
                    }
                    if (!lastFinishTime || moment(status.finishedAt).isAfter(lastFinishTime)) {
                        lastFinishTime = status.finishedAt;
                    }
                });
                return lastFinishTime;
            };
        })
        .filter("humanizeDurationValue", function() {
            return function(a, b) {
                return moment.duration(a, b).humanize();
            };
        })
        .filter('volumeMountMode', function() {
            var isConfigVolume = function(volume) {
                return _.has(volume, 'configMap') || _.has(volume, 'secret');
            };

            return function(mount, volumes) {
                if (!mount) {
                    return '';
                }

                // Config maps and secrets are always read-only, even if not explicitly
                // set in the volume mount.
                var volume = _.find(volumes, { name: mount.name });
                if (isConfigVolume(volume)) {
                    return 'read-only';
                }

                if (_.get(volume, 'persistentVolumeClaim.readOnly')) {
                    return 'read-only';
                }

                return mount.readOnly ? 'read-only' : 'read-write';
            };
        })
        .filter("limitToOrAll", ['limitToFilter', function(limitToFilter) {
            return function(input, limit) {
                if (isNaN(limit)) {
                    return input;
                }

                return limitToFilter(input, limit);
            };
        }])
        .filter('volumeMountMode', function() {
            var isConfigVolume = function(volume) {
                return _.has(volume, 'configMap') || _.has(volume, 'secret');
            };

            return function(mount, volumes) {
                if (!mount) {
                    return '';
                }

                // Config maps and secrets are always read-only, even if not explicitly
                // set in the volume mount.
                var volume = _.find(volumes, { name: mount.name });
                if (isConfigVolume(volume)) {
                    return 'read-only';
                }

                if (_.get(volume, 'persistentVolumeClaim.readOnly')) {
                    return 'read-only';
                }

                return mount.readOnly ? 'read-only' : 'read-write';
            };
        })
        .filter('jenkinsLogURL',['annotationFilter', function(annotationFilter) {
            return function(build, asPlainText) {
                var logURL = annotationFilter(build, 'jenkinsLogURL');
                if (!logURL || asPlainText) {
                    return logURL;
                }

                // Link to the Jenkins console that follows the log instead of the raw log text.
                return logURL.replace(/\/consoleText$/, '/console');
            };
        }])
        .filter('startCase', function () {
            return function(str) {
                if (!str) {
                    return str;
                }

                // https://lodash.com/docs#startCase
                return _.startCase(str);
            };
        })
        .filter('buildStrategy', function() {
            return function(build) {
                if (!build || !build.spec || !build.spec.strategy) {
                    return null;
                }
                switch (build.spec.strategy.type) {
                    case 'Source':
                        return build.spec.strategy.sourceStrategy;
                    case 'Docker':
                        return build.spec.strategy.dockerStrategy;
                    case 'Custom':
                        return build.spec.strategy.customStrategy;
                    case 'JenkinsPipeline':
                        return build.spec.strategy.jenkinsPipelineStrategy;
                    default:
                        return null;
                }
            };
        })
});