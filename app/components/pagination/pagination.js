'use strict';

angular.module("console.pagination", [])

    .directive('cPagination', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/pagination/pagination.html',
            controller:[function () {
            }]
        }
    }]);

