'use strict';

angular.module("console.search", [])

    .directive('cSearch', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/searchbar/searchbar.html',
            controller:[function () {
            }]
        }
    }]);

