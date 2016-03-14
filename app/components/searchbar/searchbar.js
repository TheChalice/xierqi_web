'use strict';

angular.module("console.search", [
    {
        files: ['components/searchbar/searchbar.css']
    }
])

    .directive('cSearch', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/searchbar/searchbar.html',
            controller:[function () {
            }]
        }
    }]);

