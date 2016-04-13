'use strict';

angular.module("console.datepick", [
        {
            files: ['components/datepick/datepick.css']
        }
    ])

    .directive('datePick', [function () {
        return {
            restrict: 'EA',
            replace: true,
            templateUrl: 'components/datepick/datepick.html',
            link: function(scope, ele){
                console.log("ele", ele);
            },
            controller: ['$scope', function ($scope) {
                $scope.open = function() {
                    $scope.opened = true;
                };
            }]
        };
    }]);

