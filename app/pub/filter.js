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
            return function(timestampLhs, timestampRhs, omitSingle) {
                if (!timestampLhs) {
                    return "-";
                }
                timestampRhs = timestampRhs || new Date(); // moment expects either an ISO format string or a Date object

                var ms = moment(timestampRhs).diff(timestampLhs);
                var duration = moment.duration(ms);
                // the out of the box humanize in moment.js rounds to the nearest time unit
                // but we need more details
                var humanizedDuration = [];
                var years = duration.years();
                var months = duration.months();
                var days = duration.days();
                var hours = duration.hours();
                var minutes = duration.minutes();
                var seconds = duration.seconds();

                function add(count, singularText, pluralText) {
                    if (count > 0) {
                        if (omitSingle && count === 1) {
                            humanizedDuration.push(singularText);
                        } else {
                            humanizedDuration.push(count + ' ' + (count === 1 ? singularText : pluralText));
                        }
                    }
                }

                add(years, "year", "年");
                add(months, "month", "月");
                add(days, "day", "日");
                add(hours, "hour", "时");
                add(minutes, "minute", "分");
                add(seconds, "second", "秒");

                if (humanizedDuration.length === 0) {
                    humanizedDuration.push("0 秒");
                }

                if (humanizedDuration.length > 2) {
                    humanizedDuration.length = 2;
                }

                return humanizedDuration.join(", ");
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
                } else {
                    return "-"
                }
            };
        }]);
});
