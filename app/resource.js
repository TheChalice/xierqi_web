'use strict';

define([
    'angular',
    'ngResource'
], function (angular) {

    var HOST = 'https://lab.asiainfodata.com:8443/oapi/v1';
    var NAMESPACE = 'default';

    return angular.module('myApp.resource', ['ngResource'])
        .factory('Build', ['$resource', function($resource){
            var Build = $resource(HOST + '/namespaces/' + NAMESPACE + '/builds/:name', {name: '@name'}, {
                create: { method: 'POST'}
            });
            return Build;
        }])
        .factory('BuildConfig', ['$resource', function($resource){
            var BuildConfig = $resource(HOST + '/namespaces/' + NAMESPACE + '/buildconfigs/:name', {name: '@name'}, {
                create: { method: 'POST'}
            });
            return BuildConfig;
        }])
        .factory('Image', ['$resource', function($resource){
            var Image =$resource(HOST + '/images/:name',{name: '@name'},{
                create: {method:'POST'}
            });
            return Image;
        }]);


});
