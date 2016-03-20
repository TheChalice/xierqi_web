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

                function add(count, singularText, pluralText) {
                    if (count > 0) {
                        humanizedDuration.push(count + (count === 1 ? singularText : pluralText));
                    }
                }

                add(years, "year", "年");
                add(months, "month", "月");
                add(days, "day", "日");
                add(hours, "hour", "时");
                add(minutes, "minute", "分");
                add(seconds, "second", "秒");

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
                } else if (phase == "Pending") {
                    return "正在拉取代码"
                } else if (phase == "Error") {
                    return "构建错误"
                } else if (phase == "Cancelled") {
                    return "终止"
                } else {
                    return phase || "-"
                }
            };
        }]);
});
