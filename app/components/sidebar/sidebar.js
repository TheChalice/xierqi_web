'use strict';

angular.module("console.sidebar", [])

    .directive('cSidebar', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/sidebar/sidebar.html'
        }
    }]);

