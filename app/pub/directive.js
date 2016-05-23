'use strict';

define(['angular'], function (angular) {
    return angular.module('myApp.directive', [])
        .directive('fullHeight', [function() {
            return function(scope, element, attr) {
                var height = document.documentElement.clientHeight - 70 + 'px';
                element.css({
                    'min-height': height
                });
            }
        }]);
});
