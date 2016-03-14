'use strict';

angular.module("console.header", [
    {
        files: ['components/header/header.css']
    }
])

    .directive('cHeader', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/header/header.html'
        }
    }]);

