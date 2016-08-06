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
                
                var wsscheme = "wss://";
                if (window.location.protocol != "https:") {
                    // wsscheme = "wss://";
                    wsscheme = "ws://";
                }

                var host = wsscheme + location.host;

                // var host = wsscheme;

                if (params.api == 'k8s') {
                    host = host + GLOBAL.host_wss_k8s;
                  // host=host+'dev.dataos.io:8443/api/v1';
                } else {
                    host = host + GLOBAL.host_wss;
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
                create: {method: 'POST'},
                delete: {method: 'delete'},
                get: {method: 'GET'}
            });
            return ImageStream;
        }])
        .factory('ImageStreamImage', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var ImageStreamImage = $resource(GLOBAL.host + '/namespaces/:namespace/imagestreamimages/:name', {name: '@name', namespace: '@namespace'});
            return ImageStreamImage;
        }])
        .factory('ImageStreamTag', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var ImageStreamTag= $resource(GLOBAL.host + '/namespaces/:namespace/imagestreamtags/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'},
              get: {method: 'GET'},
              delete: {method: "DELETE"}
            });
            return ImageStreamTag;
        }])
        .factory('DeploymentConfig', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var DeploymentConfig= $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'},
                put: {method: 'PUT'},
                patch : {method : "PATCH"}
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
                create: {method: 'POST'},
                put: {method: 'PUT'},
                delete : {method : "DELETE"}
            });
            return Service;
        }])
        .factory('Route', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var Route= $resource(GLOBAL.host + '/namespaces/:namespace/routes/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'},
                put: {method: 'PUT'},
                delete : {method : "DELETE"}
            });
            return Route;
        }])
        .factory('BackingServiceInstance', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var BackingServiceInstance= $resource(GLOBAL.host + '/namespaces/:namespace/backingserviceinstances/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'},
                del: {method: 'DELETE'}
            });
            BackingServiceInstance.bind = $resource(GLOBAL.host + '/namespaces/:namespace/backingserviceinstances/:name/binding', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'},
                put: {method: 'PUT'}
            });
            return BackingServiceInstance;
        }])
        .factory('BackingServiceInstanceBd', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var BackingServiceInstanceBd= $resource(GLOBAL.host + '/namespaces/:namespace/backingserviceinstances/:name/binding', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'},
                put: {method: 'PUT'},
            });
            return BackingServiceInstanceBd;
        }])
        .factory('BackingService', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var BackingService= $resource(GLOBAL.host + '/namespaces/:namespace/backingservices/:name', {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            return BackingService;
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
        }])
        .factory('Secret', ['$resource', 'GLOBAL', function($resource, GLOBAL){
            var Secret= $resource(GLOBAL.host_k8s + '/namespaces/:namespace/secrets/:name',
                {name: '@name', namespace: '@namespace'},{
                create: {method: 'POST'}
            });
            return Secret;
        }])

        .factory('Metrics', ['$resource', function($resource){
            var Metrics = {};
            Metrics.mem = $resource('/hawkular/metrics/gauges/:gauges/data',
                {gauges: '@gauges', buckets: '@buckets', start: '@start'});
            Metrics.cpu = $resource('/hawkular/metrics/counters/:counters/data', {counters: '@counters', buckets: '@buckets', start: '@start'});
            Metrics.mem.all = $resource('/hawkular/metrics/gauges/data', {tags: '@tags', buckets: '@buckets'});
            Metrics.cpu.all = $resource('/hawkular/metrics/counters/data', {tags: '@tags', buckets: '@buckets'});
            return Metrics;
        }])
        .factory('Owner', ['$resource', function($resource){
            var Owner = $resource('/v1/repos/github/owner', {namespace:'@namespace', cache:'@cache'}, {
                'query': {method: 'GET'}
            });
             return Owner;
        }])
        .factory('Org', ['$resource', function($resource){
            var Org = $resource('/v1/repos/github/orgs', {cache:'false'
            });
            return Org;
        }])
        .factory('Branch', ['$resource', function($resource){
            var Branch = $resource('/v1/repos/github/users/:users/repos/:repos',{users:'@users',repos:'@repos'}, {
            });
            return Branch;
        }])
        .factory('WebhookLabget', ['$resource', function($resource){
            var WebhookLabget = $resource('/v1/repos/source/gitlab/webhooks?namespace=:namespace&build=:build',{namespace:'@namespace', build:'@build'}, {
            });
            return WebhookLabget;
        }])
        .factory('WebhookGitget', ['$resource', function($resource){
            var WebhookGitget = $resource('/v1/repos/source/github/webhooks?namespace=:namespace&build=:build',{namespace:'@namespace', build:'@build'}, {
            })
            return WebhookGitget;
        }])
        .factory('WebhookLab',['$resource', function($resource){
            var WebhookLab = $resource('/v1/repos/source/gitlab/webhooks',{}, {
                check: {method: 'POST'}
            });
            return WebhookLab;
        }])
        .factory('WebhookHub',['$resource', function($resource){
            var WebhookHub = $resource('/v1/repos/source/github/webhooks', {} ,{
                check: {method: 'POST'}
            });
            return WebhookHub;
        }])
        .factory('WebhookLabDel',['$resource', function($resource){
            var WebhookLabDel =  $resource('/v1/repos/source/gitlab/webhooks?host=:host&namespace=:namespace&build=:build&repo=:repo', {host:'@host', namespace:'@namespace',build:'@build',repo:'@repo'},{
                del: {method: 'DELETE'}
            });
            return WebhookLabDel;
        }])
        .factory('WebhookHubDel',['$resource', function($resource){
            var WebhookHubDel = $resource('/v1/repos/source/github/webhooks?namespace=:namespace&build=:build&user=:user&repo=:repo', {namespace:'@namespace',build:'@build',user:'@user',repo:'@repo'},{
                del: {method: 'DELETE'}
            });
            return WebhookHubDel;
        }])
        .factory('platform', ['$resource', function($resource){
          var platform = $resource('/registry/api/repositories?project_id=:id', {id:'@id'});
          return platform;
        }])
        .factory('platformlist', ['$resource', function($resource){
          var platformlist = $resource('/registry/api/repositories/tags?repo_name=:id', {id:'@id'});
          return platformlist;
        }])
        .factory('platformone', ['$resource', function($resource){
            var platformone = $resource('/registry/api/repositories/manifests?repo_name=:id&tag=:tag', {id:'@id',tag:'@tag'});
            return platformone;
        }])
        .factory('labOwner', ['$resource', function($resource){
            var labOwner = $resource('/v1/repos/gitlab/owner',{cache:'@cache'}, {
            });
            return labOwner;
        }])
        .factory('psgitlab', ['$resource', function($resource){
            var psgitlab = $resource('/v1/repos/gitlab',{}, {
                create: {method: 'POST'}
            });
            return psgitlab;
        }])
        .factory('laborgs', ['$resource', function($resource){
            var laborgs = $resource('/v1/repos/gitlab/orgs',{cache:'false'}, {

            });
            return laborgs;
        }])
        .factory('labBranch', ['$resource', function($resource){
            var labBranch = $resource('/v1/repos/gitlab/:repo/branches',{repo:'@repo'}, {

            });
            return labBranch;
        }])
        .factory('registration', ['$resource', function($resource){
            var registration = $resource('/lapi/signup',{},{
                regist: {method: 'POST'}
            });
            return registration;
        }])
        .factory('profile', ['$resource', function($resource){
            var profile = $resource('/lapi/user/profile',{},{

            });
            return profile;
        }])
        .factory('pwdModify', ['$resource', function($resource){
            var pwdModify = $resource('/lapi/password_modify',{old_password:'@oldpassword', new_password:'@newpassword'},{
                change: {method: 'PUT'}
            })
            return pwdModify;
        }])

        .factory('deletepod', ['$resource', function($resource){
            var deletepod = $resource('/lapi/v1/namespaces/:namespace/pods',{namespace: '@namespace'},{
                delete: {method: 'DELETE'}
            })
            return deletepod;
        }])
        .factory('orgList', ['$resource', function($resource){
            var orgList = $resource('/lapi/orgs', {},{

            })
            return orgList;
        }])
        .factory('createOrg', ['$resource', function($resource){
            var createOrg = $resource('/lapi/orgs', {},{
                create: {method: 'POST'}
            })
            return createOrg;
        }])
        .factory('loadOrg', ['$resource', function($resource){
            var loadOrg = $resource('/lapi/orgs/:org', {org:'@org'},{
            })
            return loadOrg;
        }])
        .factory('invitation', ['$resource', function($resource){
            var invitation = $resource('/lapi/orgs/:orgs/invite', {org:'@org'},{
                invite: {method: 'PUT'}
            })
            return invitation;
        }])
        .factory('remove', ['$resource', function($resource){
            var remove = $resource('/lapi/orgs/:org/remove', {org:'@org'},{
                delete: {method: 'PUT'}
            })
            return remove;
        }])
        .factory('privileged', ['$resource',function($resource){
            var privileged = $resource('/lapi/orgs/:org/privileged', {org:'@org'},{
                privileged: {method: 'PUT'}
            })
            return privileged;
        }])
        .factory('acception', ['$resource',function($resource){
            var acception = $resource('/lapi/orgs/:org/accept', {org:'@org'},{
                accept: {method: 'PUT'}
            })
            return acception;
        }])
        .factory('leave', ['$resource', function($resource){
            var leave = $resource('/lapi/orgs/:org/leave', {org:'@org'},{
                left: {method:'PUT'}
            })
        return leave;
        }])
        .factory('configmaps', ['$resource', function($resource){
            var configmaps = $resource('/api/v1/namespaces/:namespace/configmaps/:name', {namespace:'@namespace', name:'@name'},{
                create: {method:'POST'},
                delete: {method:'DELETE'},
                updata: {method:'PUT'}
            })
            return configmaps;
        }])
        .factory('listConfig', ['$resource', function($resource){
            var listConfig = $resource('/api/v1/namespaces/:namespace/configmaps/:name',{namespace:'@namespace', name:'@name'}, {
            })
            return listConfig;
        }])
        .factory('secretskey', ['$resource', function($resource){
            var secretskey = $resource('/api/v1/namespaces/:namespace/secrets/:name', {namespace:'@namespace',name:'@name'},{
                create: {method:'POST'},
                delete: {method:'DELETE'},
                updata: {method:'PUT'}
            })
            return secretskey;
        }])
        .factory('listSecret', ['$resource', function($resource){
            var listSecret = $resource('/api/v1/namespaces/:namespace/secrets/:name', {namespace:'@namespace', name:'@name'}, {
            })
            return listSecret;
        }])
        .factory('modifySecret', ['$resource', function($resource){
            var modifySecret = $resource('/api/v1/namespaces/:namespace/secrets/:name', {namespace:'@namespace', name:'@name'}, {
                update: {method:'PUT'}
            })
            return modifySecret;
        }])
        .factory('deleteSecret', ['$resource', function($resource){
            var deleteSecret = $resource('/api/v1/namespaces/:namespace/secrets/:name', {namespace:'@namespace', name:'@name'}, {
                delete: {method:'DELETE'}
            })
            return deleteSecret;
        }])
        .factory('delSecret', ['$resource', function($resource){
            var delSecret = $resource('/api/v1/namespaces/:namespace/secrets', {namespace:'@namespace'}, {
                del: {method:'DELETE'}
            })
            return delSecret;
        }])
        .factory('persistent', ['$resource', function($resource){
            var persistent = $resource('/api/v1/namespaces/:namespace/persistentvolumeclaims/:name', {namespace:'@namespace', name:'@name'}, {
                del: {method:'DELETE'}
            })
            return persistent;
        }])
        .factory('serviceaccounts', ['$resource', function($resource){
            var serviceaccounts = $resource('/api/v1/namespaces/:namespace/serviceaccounts/deployer', {namespace:'@namespace'}, {
            })
            return serviceaccounts;
        }])
});
// http://registry.dataos.io/api/repositories/manifests?repo_name=library/alpine&tag=latest
// https://registry.dataos.io/api/projects?is_public=1
// https://registry.dataos.io/api/repositories/tags?repo_name=openshift/node
