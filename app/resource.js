'use strict';

define([
    'angular',
    'ngResource'
], function (angular) {

    return angular.module('myApp.resource', ['ngResource'])
        .factory('Ws', ['$rootScope', '$ws', '$log', 'GLOBAL', 'Cookie', function($rootScope, $ws, $log, GLOBAL, Cookie){
            var Ws = {};
            $rootScope.watches = $rootScope.watches || {};

            Ws.watch = function(params, onmessage, onopen, onclose){
                if (!$ws.available()) {
                    $log.info('webSocket is not available');
                    return;
                }

                var host = location.host + '/ws/oapi/v1';

                params.name = params.name ? '/' + params.name : '';
                var url = 'ws://' + host + '/namespaces/' + params.namespace + '/'+ params.type + params.name +
                          '?watch=true' +
                          '&resourceVersion='+ params.resourceVersion +
                          '&access_token=' + Cookie.get("df_access_token");
                $ws({
                    method: 'WATCH',
                    url: url,
                    onclose: onclose,
                    onmessage: onmessage,
                    onopen: onopen
                }).then(function(ws){
                    $rootScope.watches[Ws.key(params.namespace, params.type, params.name)] = ws;
                });
            };

            Ws.key = function(namespace, type, name){
                return namespace + '-' + type + '-' + name;
            };

            Ws.clear = function(){
                for (var k in $rootScope.watches) {
                    $rootScope.watches[k].shouldClose = true;
                    $rootScope.watches[k].close();
                }
                $rootScope.watches = {};
            };
            return Ws;
        }])
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
            Project.request = $resource(GLOBAL.host + '/projectrequests', {}, {
                create: {method: 'POST'}
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
        }])
        .factory('DeploymentConfig', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var DeploymentConfig= $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            return DeploymentConfig;
        }]);
});
