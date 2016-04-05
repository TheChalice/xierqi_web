'use strict';

define([
    'angular',
    'ngResource'
], function (angular) {

    return angular.module('myApp.resource', ['ngResource'])
        .factory('User', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var User = $resource(GLOBAL.host + '/users/:name', {name: '@name'}, {
                create: { method: 'POST'}
            });
            return User;
        }])
        .factory('Project', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var Project = $resource(GLOBAL.host + '/projects/:name', {name: '@name'}, {
                create: { method: 'POST'}
            });
            return Project;
        }])
        .factory('Build', ['$resource', '$rootScope', '$ws', '$log', 'Cookie', 'GLOBAL', function($resource, $rootScope, $ws, $log, Cookie, GLOBAL){
            var Build = $resource(GLOBAL.host + '/namespaces/:namespace/builds/:name', {name: '@name', namespace: '@namespace'}, {
                create: { method: 'POST'},
                put: { method: 'PUT'}
            });
            Build.log = $resource(GLOBAL.host + '/namespaces/:namespace/builds/:name/log', {name: '@name', namespace: '@namespace'}, {
                get: {method: 'GET', responseType: 'text'}
            });
            Build.watch = function(onmessage, onopen, onclose, resourceVersion){
                if (!$ws.available()) {
                    return;
                }
                $ws({
                    method: "WATCH",
                    url: GLOBAL.host_wss + '/namespaces/' + $rootScope.namespace + '/builds?watch=true&resourceVersion='+ resourceVersion +'&access_token=' + Cookie.get("df_access_token"),
                    onclose:   onclose,
                    onmessage: onmessage,
                    onopen:    onopen
                });
            };
            return Build;
        }])
        .factory('BuildConfig', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var BuildConfig = $resource(GLOBAL.host + '/namespaces/:namespace/buildconfigs/:name', {name: '@name', namespace: '@namespace'}, {
                create: { method: 'POST'},
                put: { method: 'PUT'}
            });
            BuildConfig.instantiate = $resource(GLOBAL.host + '/namespaces/:namespace/buildconfigs/:name/instantiate', {name: '@name', namespace: '@namespace'}, {
                create: { method: 'POST'}
            });
            return BuildConfig;
        }])
        .factory('ImageStream', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var ImageStream = $resource(GLOBAL.host + '/namespaces/:namespace/imagestreams/:name', {name: '@name', namespace: '@namespace'}, {
                create: {method: 'POST'}
            });
            return ImageStream;
        }])
        .factory('ImageStreamTag', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var ImageStreamTag= $resource(GLOBAL.host + '/namespaces/:namespace/imagestreamtags/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            return ImageStreamTag;
        }]);
});
