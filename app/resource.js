'use strict';

define([
    'angular',
    'ngResource'
], function (angular) {

    return angular.module('myApp.resource', ['ngResource'])
        .factory('build', ['$resource', function($resource){
            //GET /oapi/v1/namespaces/{namespace}/builds
            var Build = $resource('/oapi/v1/namespaces/:namespace/builds', {namespace: '@namespace'}, {
                create: { method: 'POST'}
            });
            return Build;
        }]);

});
