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

                var host = GLOBAL.host_wss;
                if (params.api == 'k8s') {
                    host = GLOBAL.host_wss_k8s;
                }

                params.name = params.name ? '/' + params.name : '';

                var url = host + '/namespaces/' + params.namespace + '/'+ params.type + params.name +
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

            Ws.terminal = function(params, onmessage, onopen, onclose){
                if (!$ws.available()) {
                    $log.info('webSocket is not available');
                    return;
                }

                var host = GLOBAL.host_wss;
                if (params.api == 'k8s') {
                    host = GLOBAL.host_wss_k8s;
                }

                params.name = params.name ? '/' + params.name : '';

                var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name + '/exec' +
                          '?stdout=1' +
                          '&stdin=1' +
                          '&stderr=1' +
                          '&tty=1' +
                          '&container='+ params.container +
                          '&command=%2Fbin%2Fsh' +
                          '&command=-i' +
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
        .factory('ImageStreamImage', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var ImageStreamImage = $resource(GLOBAL.host + '/namespaces/:namespace/imagestreamimages/:name', {name: '@name', namespace: '@namespace'});
            return ImageStreamImage;
        }])
        .factory('ImageStreamTag', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var ImageStreamTag= $resource(GLOBAL.host + '/namespaces/:namespace/imagestreamtags/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            return ImageStreamTag;
        }])
        .factory('DeploymentConfig', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var DeploymentConfig= $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'},
                put: {method: 'PUT'}
            });
            DeploymentConfig.log = $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name/log');
            return DeploymentConfig;
        }])
        .factory('ReplicationController', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var ReplicationController= $resource(GLOBAL.host_k8s + '/namespaces/:namespace/replicationcontrollers/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'},
                put: {method: 'PUT'}
            });
            return ReplicationController;
        }])
        .factory('Service', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var Service= $resource(GLOBAL.host_k8s + '/namespaces/:namespace/services/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            return Service;
        }])
        .factory('Route', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var Route= $resource(GLOBAL.host + '/namespaces/:namespace/routes/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            return Route;
        }])
        .factory('BackingServiceInstance', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var BackingServiceInstance= $resource(GLOBAL.host + '/namespaces/:namespace/backingserviceinstances/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            return BackingServiceInstance;
        }])
        .factory('Pod', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var Pod= $resource(GLOBAL.host_k8s + '/namespaces/:namespace/pods/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            Pod.log = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/pods/:name/log', {name: '@name', namespace: '@namespace'});
            return Pod;
        }])
        .factory('Event', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var Event= $resource(GLOBAL.host_k8s + '/namespaces/:namespace/events/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            return Event;
        }]);
});
