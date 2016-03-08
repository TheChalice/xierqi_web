'use strict';

angular.module("console.timeline", [])

    .directive('cTimeline', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/timeline/timeline.html'
        }
    }]);

