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
        .factory('Build', ['$resource', '$ws', '$log', 'GLOBAL', function($resource, $ws, $log, GLOBAL){
            //GET /oapi/v1/namespaces/{namespace}/builds
            var Build = $resource(GLOBAL.host + '/namespaces/' + GLOBAL.namespace + '/builds/:name', {name: '@name'}, {
                create: { method: 'POST'},
                put: { method: 'PUT'}
            });
            Build.log = $resource(GLOBAL.host + '/namespaces/' + GLOBAL.namespace + '/builds/:name/log', {name: '@name'}, {
                get: {method: 'GET', responseType: 'text'}
            });
            Build.watch = function(onmessage, onopen, onclose, resourceVersion){
                if (!$ws.available()) {
                    return;
                }
                $ws({
                    method: "WATCH",
                    url: GLOBAL.host_wss + '/namespaces/' + GLOBAL.namespace + '/builds?watch=true&resourceVersion='+ resourceVersion +'&access_token=' + GLOBAL.token,
                    onclose:   onclose,
                    onmessage: onmessage,
                    onopen:    onopen
                });
            };
            return Build;
        }])
        .factory('BuildConfig', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var BuildConfig = $resource(GLOBAL.host + '/namespaces/' + GLOBAL.namespace + '/buildconfigs/:name', {name: '@name'}, {
                create: { method: 'POST'},
                put: { method: 'PUT'}
            });
            BuildConfig.instantiate = $resource(GLOBAL.host + '/namespaces/' + GLOBAL.namespace + '/buildconfigs/:name/instantiate', {name: '@name'}, {
                create: { method: 'POST'}
            });
            return BuildConfig;
        }])
        .factory('ImageStream', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var ImageStream = $resource(GLOBAL.host + '/namespaces/'+ GLOBAL.namespace + '/imagestreams/:name', {name: '@name'}, {
                create: {method: 'POST'}
            });
            return ImageStream;
        }])
        .factory('ImageStreamTag', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var ImageStreamTag= $resource(GLOBAL.host + '/namespaces/'+ GLOBAL.namespace  + '/imagestreamtags/:name', {name: '@name'},{
                create: {method: 'POST'}
            });
            return ImageStreamTag;
        }]);
});
