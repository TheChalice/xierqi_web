'use strict';

define([
    'angular',
    'ngResource'
], function (angular) {

    var HOST = 'https://lab.asiainfodata.com:8443/oapi/v1';

    return angular.module('myApp.resource', ['ngResource'])
        .factory('Build', ['$resource', function($resource){
            //GET /oapi/v1/namespaces/{namespace}/builds
            var Build = $resource(HOST + '/namespaces/:namespace/builds', {namespace: '@namespace'}, {
                create: { method: 'POST'}
            });
            return Build;
        }])
        .factory('Image', ['$resource', function($resource){
            var Image =$resource(HOST + '/images/:name',{name: '@name'},{
                create: {method:'POST'}
            });
            return Image;
        }]);


});
