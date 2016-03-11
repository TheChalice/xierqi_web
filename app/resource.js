'use strict';

define([
    'angular',
    'ngResource'
], function (angular) {

    var HOST = 'https://lab.asiainfodata.com:8443/oapi/v1';
    var NAMESPACE = 'default';

    return angular.module('myApp.resource', ['ngResource'])
        .factory('Build', ['$resource', function($resource){
            //GET /oapi/v1/namespaces/{namespace}/builds
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
        //.factory('ImageStream', ['$resource', function($resource){
        //    var ImageStream = $resource(HOST + '/namespaces/'+ NAMESPACE + '/imagestreams/:name',{name: '@name'},{
        //        create: {method: 'POST'}
        //    });
        //    return ImageStream;
        //}]);
        .factory('ImageStreamTag', ['$resource', function($resource){
            var ImageStreamTag= $resource(HOST + '/namespaces/'+ NAMESPACE  + '/imagestreamtags/:name', {name: '@name'},{
                create: {method: 'POST'}
            });
            return ImageStreamTag;
        }]);
});
