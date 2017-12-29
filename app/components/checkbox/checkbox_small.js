'use strict';

angular.module("console.checkboxSmall", [
        {
            files: ['components/checkbox/checkbox_small.css']
        }
    ])

    .directive('checkboxSmall', [function () {
        return {
            restrict: 'EA',
            replace: true,
            scope: {
                checked: '=',
                text: '@'
            },
            templateUrl: 'components/checkbox/checkbox_small.html'
        }
    }]);

