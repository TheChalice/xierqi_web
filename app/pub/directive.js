'use strict';

define(['angular'], function(angular) {
    return angular.module('myApp.directive', [])
        .directive('fullHeight', [function() {
            return function(scope, element, attr) {
                var height = document.documentElement.clientHeight - 70 + 'px';
                element.css({
                    'min-height': height
                });
            }
        }])
        .directive('onFinishRender', function($timeout) {
            return {
                restrict: 'A',
                link: function(scope, element, attr) {
                    if (scope.$last === true) {
                        $timeout(function() {
                            scope.$emit('ngRepeatFinished');
                        });
                    }
                }
            };
        })
        .directive('statusIcon', function() {
            return {
                restrict: 'E',
                templateUrl: 'views/directives/_status-icon.html',
                scope: {
                    status: '=',
                    disableAnimation: "@"
                },
                link: function($scope, $elem, $attrs) {
                    $scope.spinning = !angular.isDefined($attrs.disableAnimation);
                }
            };
        })

});