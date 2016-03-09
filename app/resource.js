'use strict';

define([
    'angular',
    'ngResource'
], function (angular) {

    var HOST = 'https://lab.asiainfodata.com:8443/oapi/v1';

    return angular.module('myApp.resource', ['ngResource'])
        .factory('Project', ['$resource', function($resource){
            var Project = $resource(HOST + '/projects');
            return Project;
        }])
        .factory('Build', ['$resource', function($resource){
            var Build = $resource(HOST + '/namespaces/:namespace/builds', {namespace: '@namespace'}, {
                create: { method: 'POST'}
            });
            return Build;
        }]);

});
