'use strict';

define(['angular', 'moment'], function (angular, moment) {
    moment.locale('zh-cn');
    return angular.module('myApp.filter', [])
        .filter('dateRelative', [function() {
            // dropSuffix will tell moment whether to include the "ago" text
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
        .filter('webhooks', ['$rootScope', 'GLOBAL', function($rootScope, GLOBAL) {
            return function(buildConfig) {
                var triggers = buildConfig.spec.triggers;
                for (var k in triggers) {
                    if (triggers[k].type == 'GitHub') {
                        return GLOBAL.host_webhooks + '/namespaces/'+ $rootScope.namespace +'/buildconfigs/' + buildConfig.metadata.name + '/webhooks/' + triggers[k].github.secret + '/github'
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
                    return "";
                }
                return match[1];
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
        });
});
