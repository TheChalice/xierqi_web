'use strict';

angular.module("console.timeline", [])

    .directive('cTimeline', [function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                data: '='
            },
            templateUrl: 'components/timeline/timeline.html'
        }
    }]);

