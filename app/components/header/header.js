'use strict';

angular.module("console.header", [])

    .directive('cHeader', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/header/header.html'
        }
    }]);

