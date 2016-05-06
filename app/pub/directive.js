'use strict';

define(['angular', 'angularAnimate'], function (angular, angularAnimate) {
    return angular.module('myApp.directive', ['ngAnimate'])
        .directive('disableAnimate', ['$animate', function ($animate) {
            return function ($scope, $element) {
                $animate.enabled($element, false);
            }
        }])
        .directive('fullHeight', [function() {
            return function(scope, element, attr) {
                var height = document.documentElement.clientHeight - 70 + 'px';
                element.css({
                    'min-height': height
                });
            }
        }]);
});
