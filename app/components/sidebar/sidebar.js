'use strict';

angular.module("console.sidebar", [])

    .directive('cSidebar', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/sidebar/sidebar.html',
            controller: ['$state', '$scope', function($state, $scope){
                $scope.$state = $state;
            }]
        }
    }]);

