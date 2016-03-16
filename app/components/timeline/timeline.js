'use strict';

angular.module("console.timeline", [
    {
        files: ['components/timeline/timeline.css']
    }
])

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

