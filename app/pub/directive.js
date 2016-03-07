'use strict';

define(['angular', 'angularAnimate'], function (angular, angularAnimate) {
    return angular.module('myApp.directive', ['ngAnimate'])
        .directive('disableAnimate', ['$animate', function ($animate) {
            return function ($scope, $element) {
                $animate.enabled($element, false);
            }
        }]);
});
