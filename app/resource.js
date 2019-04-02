'use strict';

define([
    'angular',
    'ngResource'
], function (angular) {
    return angular.module('myApp.resource', ['ngResource'])
        .factory('Ws', ['$rootScope', '$ws', '$log', 'GLOBAL', 'Cookie', function ($rootScope, $ws, $log, GLOBAL, Cookie) {
            var Ws = {};
            var host =''
            $rootScope.watches = $rootScope.watches || {};

            Ws.watch = function (params, onmessage, onopen, onclose) {
                if (!$ws.available()) {
                    $log.info('webSocket is not available');
                    return;
                }

                var wsscheme = "wss://";
                if (window.location.protocol != "https:") {
                    wsscheme = "ws://";
                }
                //console.log('window.location.hostname === "localhost"', window.location.hostname == "localhost");
                //if (window.location.hostname == "localhost") {
                    host = wsscheme + location.host;
                //}else {
                //
                //    var path = window.location.pathname.split('/')[1]
                //    //console.log('window.location', path);
                //    host = wsscheme + location.host+'/'+path;
                //}
                //console.log('host', host);

                var regions = Cookie.get('region');

                var region = regions.split('-')[2];

                var token = '';

                if (params.api == 'k8s') {
                    host = host + GLOBAL.host_wss_k8s;

                } else if (params.api == 'broker') {
                    //var token = tokenarr[0];
                    host = host + GLOBAL.broker_ws_apigroup;
                } else if (params.api == 'wsapis') {
                    //var token = tokenarr[0];
                    host = host + GLOBAL.host_ws_apis;
                } else if (params.api == 'extensions') {
                    //var token = tokenarr[0];
                    host = host + GLOBAL.host_ws_apisextensions;
                } else {
                    host = host + GLOBAL.host_wss;
                }
                var tokens = Cookie.get('df_access_token');
                var regions = Cookie.get('region');
                var tokenarr = tokens.split(',');
                var region = regions.split('-')[2];

                var cluster = Cookie.get('cluster');
                var token = tokenarr[region - 1];
                var clusterip = '';

                //console.log(GLOBAL);
                if (cluster && cluster === 'cn-north-1') {
                    clusterip=GLOBAL.api_server_addr
                }else if (cluster && cluster === 'cn-north-2'){
                    clusterip=GLOBAL.api_sbnanji_addr
                }else {
                    clusterip=GLOBAL.api_server_addr
                }
                params.name = params.name ? '/' + params.name : '';
                if (params.pod) {
                    var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name +
                        '?follow=true' +
                        '&tailLines=1000' +
                        '&limitBytes=10485760' +
                        '&container=' + params.pod +
                        '&cluster=' + clusterip +
                        '&access_token=' + token;
                } else if (params.app) {
                    var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name +
                        '?watch=true' +
                        '&resourceVersion=' + params.resourceVersion +
                        '&labelSelector=' + params.app +
                        '&cluster=' + clusterip +
                        '&access_token=' + token;
                } else {

                    var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name


                    //console.log('params.follow', params.follow);
                    if (params.follow) {
                        url = url + '?follow=true'
                    } else {
                        url = url + '?watch=true'
                    }
                    if (params.resourceVersion) {
                        url = url + '&resourceVersion=' + params.resourceVersion
                    }
                    url = url+'&cluster=' + clusterip + '&access_token=' + token;

                }
                if (params.tailLines) {
                    url = url + '&tailLines=' + params.tailLines;
                }
                if (params.protocols) {
                    $ws({
                        method: 'WATCH',
                        url: url,
                        onclose: onclose,
                        onmessage: onmessage,
                        onopen: onopen,
                        protocols: params.protocols
                    }).then(function (ws) {
                        $rootScope.watches[Ws.key(params.namespace, params.type, params.name)] = ws;
                    });
                } else {
                    $ws({
                        method: 'WATCH',
                        url: url,
                        onclose: onclose,
                        onmessage: onmessage,
                        onopen: onopen,

                    }).then(function (ws) {
                        $rootScope.watches[Ws.key(params.namespace, params.type, params.name)] = ws;
                    });
                }


            };

            Ws.key = function (namespace, type, name) {
                return namespace + '-' + type + '-' + name;
            };

            Ws.clear = function () {
                for (var k in $rootScope.watches) {
                    $rootScope.watches[k].shouldClose = true;
                    $rootScope.watches[k].close();
                }
                $rootScope.watches = {};
            };
            return Ws;
        }])
        .factory('sessiontoken', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            //console.log('q11');
            var sessiontoken = $resource('/sessiontoken', {}, {});
            return sessiontoken;
        }])
        .factory('hucentersessiontoken', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            //console.log('q11');
            var hucentersessiontoken = $resource('/hucentersessiontoken', {}, {});
            return hucentersessiontoken;
        }])
        .factory('ssologout', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            //console.log('q11');
            var ssologout = $resource('/sso/logout', {}, {});
            return ssologout;
        }])
        .factory('User', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var User = $resource(GLOBAL.host + '/users/:name', {name: '@name', region: '@region'}, {
                create: {method: 'POST'}
            });
            return User;
        }])
        .factory('tempipline', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var tempipline = $resource(GLOBAL.host + '/namespaces/:namespace/templates/:name',
                {
                    name: '@name',
                    namespace: '@namespace',
                });
            return tempipline;
        }])
        .factory('processedtemplates', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var processedtemplates = $resource(GLOBAL.host + '/namespaces/:namespace/processedtemplates',
                {
                    namespace: '@namespace'
                },{
                    create: {method: 'POST'}
                });
            return processedtemplates;
        }])
        .factory('hasuser', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var hasuser = $resource(GLOBAL.host + '/users', {region: '@region'}, {
                //create: {method: 'POST'}
            });
            return hasuser;
        }])
        .factory('Project', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Project = $resource(GLOBAL.host + '/projects/:name?region=:region', {
                name: '@name',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'}
            });
            return Project;
        }])
        .factory('Build', ['$resource', '$rootScope', '$ws', '$log', 'Cookie', 'GLOBAL', function ($resource, $rootScope, $ws, $log, Cookie, GLOBAL) {
            var Build = $resource(GLOBAL.host + '/namespaces/:namespace/builds/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                delete: {method: 'DELETE'},
                put: {method: 'PUT'}
            });
            Build.log = $resource(GLOBAL.host + '/namespaces/:namespace/builds/:name/log', {
                name: '@name',
                namespace: '@namespace'
            }, {
                get: {method: 'GET', responseType: 'text'}
            });
            return Build;
        }])
        .factory('BuildConfig', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var BuildConfig = $resource(GLOBAL.host + '/namespaces/:namespace/buildconfigs/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'}
            });
            BuildConfig.instantiate = $resource(GLOBAL.host + '/namespaces/:namespace/buildconfigs/:name/instantiate?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'

            }, {
                create: {method: 'POST'}
            });
            return BuildConfig;
        }])
        .factory('ImageStream', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ImageStream = $resource(GLOBAL.host + '/namespaces/:namespace/imagestreams/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                delete: {method: 'delete'},
                get: {method: 'GET'}
            });
            return ImageStream;
        }])
        .factory('ImageStreamImage', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ImageStreamImage = $resource(GLOBAL.host + '/namespaces/:namespace/imagestreamimages/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            });
            //暂未使用
            return ImageStreamImage;
        }])
        .factory('resourcequotas', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var resourcequotas = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/resourcequotas', {
                namespace: '@namespace',
            });
            //暂未使用
            return resourcequotas;
        }])
        .factory('statefulsets', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var statefulsets = $resource(GLOBAL.host_newk8s1 + '/namespaces/:namespace/statefulsets', {
                namespace: '@namespace'
            }, {
                create: {method: 'POST'},
                get: {method: 'GET'},
                delete: {method: "DELETE"}
            });
            //暂未使用
            return statefulsets;
        }])
        .factory('statefulsetsdele', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var statefulsetsdele = $resource(GLOBAL.host_newk8s1 + '/namespaces/:namespace/statefulsets/:name', {
                namespace: '@namespace',
                name: '@name'
            }, {
                create: {method: 'POST'},
                get: {method: 'GET'},
                delete: {method: "DELETE"}
            });
            //暂未使用
            return statefulsetsdele;
        }])
        .factory('ImageStreamTag', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ImageStreamTag = $resource(GLOBAL.host + '/namespaces/:namespace/imagestreamtags/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                get: {method: 'GET'},
                delete: {method: "DELETE"}
            });
            return ImageStreamTag;
        }])
        .factory('DeploymentConfig', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var DeploymentConfig = $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'},
                patch: {method: "PATCH"}
            });
            DeploymentConfig.log = $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name/log?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'},
                patch: {method: "PATCH"}
            });
            return DeploymentConfig;
        }])
        .factory('Deployments', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Deployments = $resource(GLOBAL.host_newk8s2 + '/namespaces/:namespace/deployments/:name', {
                name: '@name',
                namespace: '@namespace'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'},
                patch: {method: "PATCH"}
            });

            return Deployments;
        }])
        .factory('ScaleRs', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ScaleRs = $resource(GLOBAL.host_newk8s2 + '/namespaces/:namespace/deployments/:name/scale', {
                name: '@name',
                namespace: '@namespace'
            }, {
                put: {method: 'PUT'}
            });

            return ScaleRs;
        }])
        .factory('ScaleRc', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ScaleRc = $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name/scale', {
                name: '@name',
                namespace: '@namespace'
            }, {
                put: {method: 'PUT'}
            });

            return ScaleRc;
        }])
        .factory('ReplicaSet', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ReplicaSet = $resource(GLOBAL.host_newk8s2 + '/namespaces/:namespace/replicasets/:name', {
                name: '@name',
                namespace: '@namespace'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'},
                patch: {method: "PATCH"},
                delete: {method: "DELETE"}
            });

            return ReplicaSet;
        }])
        .factory('ReplicationController', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ReplicationController = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/replicationcontrollers/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'},
                delete: {method: "DELETE"}
            });
            return ReplicationController;
        }])
        .factory('DeploymentConfigRollback', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var DeploymentConfigRollback = $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigrollbacks', {
                namespace: '@namespace'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'}
            });
            return DeploymentConfigRollback;
        }])
        .factory('Dcinstantiate', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Dcinstantiate = $resource(GLOBAL.host + '/namespaces/:namespace/deploymentconfigs/:name/instantiate', {
                name: '@name',
                namespace: '@namespace'
            }, {
                create: {method: 'POST'}
            });
            return Dcinstantiate;
        }])
        .factory('horizontalpodautoscalers', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var horizontalpodautoscalers = $resource(GLOBAL.host_newk8s + '/namespaces/:namespace/horizontalpodautoscalers/:name', {
                namespace: '@namespace',
                name: '@name',
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'},
                delete: {method: "DELETE"}
            });
            return horizontalpodautoscalers;
        }])
        .factory('Service', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Service = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/services/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'},
                delete: {method: "DELETE"}
            });
            return Service;
        }])
        .factory('Route', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Route = $resource(GLOBAL.host + '/namespaces/:namespace/routes/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'},
                delete: {method: "DELETE"}
            });
            return Route;
        }])
        // 铃铛上的数字显示接口http://10.1.235.157:9000/aipaas/open/ToDo/api/toDoTotalNum/｛username｝      
        .factory('userNum', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var userNum = $resource(GLOBAL.userNumapi + '/toDoTotalNum/:namespace', {namespace: '@namespace'}, {
                'query': {method: 'GET'}
            });
            return userNum;
        }])

        .factory('BackingServiceInstance', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var BackingServiceInstance = $resource(GLOBAL.broker_apigroup + '/namespaces/:namespace/backingserviceinstances/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                del: {method: 'DELETE'}
            });
            BackingServiceInstance.bind = $resource(GLOBAL.broker_apigroup + '/namespaces/:namespace/backingserviceinstances/:name/binding?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'}
            });
            return BackingServiceInstance;
        }])
        .factory('BackingServiceInstanceBd', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var BackingServiceInstanceBd = $resource(GLOBAL.host + '/namespaces/:namespace/backingserviceinstances/:name/binding?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'},
            });
            return BackingServiceInstanceBd;
        }])
        .factory('creatproject', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var creatproject = $resource(GLOBAL.host + '/projectrequests', {}, {
                create: {method: 'POST'}
            });
            return creatproject;
        }])
        .factory('imagestreamimports', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var imagestreamimports = $resource(GLOBAL.host + '/namespaces/:namespace/imagestreamimports', {
                namespace: '@namespace',
            }, {
                create: {method: 'POST'}
            });
            return imagestreamimports;
        }])
        .factory('BackingService', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var BackingService = $resource(GLOBAL.broker_apigroup + '/namespaces/:namespace/backingservices/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'}
            });
            return BackingService;
        }])
        .factory('Pod', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Pod = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/pods/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                delete: {method: 'DELETE'},
            });
            Pod.log = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/pods/:name/log?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            });
            return Pod;
        }])
        .factory('Event', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Event = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/events/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'

            }, {
                create: {method: 'POST'}
            });
            return Event;
        }])
        .factory('Endpoint', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Endpoint = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/endpoints'
                // {
                //     name: '@name',
                //     namespace: '@namespace',
                //     region: '@region'

                // }, {
                //     create: { method: 'POST' }
                // }
            );
            return Endpoint;
        }])
        .factory('Secret', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Secret = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/secrets/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'}
            });
            return Secret;
        }])
        .factory('PieChar', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var PieChar = $resource(GLOBAL.host_hawkular + '/m/stats/query', {}, {
                create: {method: 'POST'}
            });
            return PieChar;
        }])
        .factory('Metrics', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Metrics = {};
            Metrics.mem = $resource(GLOBAL.host_hawkular + '/gauges/:gauges/data', {
                gauges: '@gauges',
                buckets: '@buckets',
                start: '@start'
            });
            Metrics.cpu = $resource(GLOBAL.host_hawkular + '/counters/:counters/data', {
                counters: '@counters',
                buckets: '@buckets',
                start: '@start'
            });
            Metrics.network = $resource(GLOBAL.host_hawkular + '/network/:network/data', {
                network: '@network',
                buckets: '@buckets',
                start: '@start'
            });
            Metrics.mem.all = $resource(GLOBAL.host_hawkular + '/gauges/data', {tags: '@tags', buckets: '@buckets'});
            Metrics.network.all = $resource(GLOBAL.host_hawkular + '/gauges/data', {
                tags: '@tags',
                buckets: '@buckets'
            });
            Metrics.cpu.all = $resource(GLOBAL.host_hawkular + '/counters/data', {tags: '@tags', buckets: '@buckets'});
            return Metrics;
        }])
        .factory('Owner', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Owner = $resource(GLOBAL.host_repos + '/github/owner', {namespace: '@namespace', cache: '@cache'}, {
                'query': {method: 'GET'}
            });
            return Owner;
        }])
        .factory('Org', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Org = $resource(GLOBAL.host_repos + '/github/orgs', {
                cache: 'false'
            });
            return Org;
        }])
        .factory('Branch', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Branch = $resource(GLOBAL.host_repos + '/github/users/:users/repos/:repos', {
                users: '@users',
                repos: '@repos'
            }, {});
            return Branch;
        }])
        .factory('createdeploy', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var createdeploy = $resource(GLOBAL.host_repos + '/gitlab/authorize/deploy?namespace=:namespace', {
                namespace: '@namespace'
            }, {
                create: {method: 'POST'}
            });
            return createdeploy;
        }])
        .factory('WebhookLabget', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var WebhookLabget = $resource(GLOBAL.host_repo + '/gitlab/webhook?ns=:ns&bc=:bc', {
                ns: '@ns',
                bc: '@bc'
            }, {});
            return WebhookLabget;
        }])
        .factory('WebhookGitget', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var WebhookGitget = $resource(GLOBAL.host_repo + '/github/webhook?ns=:ns&bc=:bc', {
                ns: '@ns',
                bc: '@bc'
            }, {})
            return WebhookGitget;
        }])
        .factory('WebhookLab', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var WebhookLab = $resource(GLOBAL.host_repo + '/gitlab/webhook?ns=:ns&bc=:bc', {ns: '@ns', bc: '@bc'}, {
                check: {method: 'POST'}
            });
            return WebhookLab;
        }])
        .factory('WebhookHub', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var WebhookHub = $resource(GLOBAL.host_repo + '/github/webhook?ns=:ns&bc=:bc', {ns: '@ns', bc: '@bc'}, {
                check: {method: 'POST'}
            });
            return WebhookHub;
        }])
        .factory('WebhookLabDel', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var WebhookLabDel = $resource(GLOBAL.host_repo + '/gitlab/webhook/:id?ns=:ns&bc=:bc', {
                id: '@id',
                ns: '@ns',
                bc: '@bc'
            }, {
                del: {method: 'DELETE'}
            });
            return WebhookLabDel;
        }])
        .factory('WebhookHubDel', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var WebhookHubDel = $resource(GLOBAL.host_repo + '/github/webhook/:id?ns=:ns&bc=:bc', {
                id: '@id',
                ns: '@ns',
                bc: '@bc'
            }, {
                del: {method: 'DELETE'}
            });
            return WebhookHubDel;
        }])
        .factory('labOwner', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var labOwner = $resource(GLOBAL.host_repos + '/gitlab/owner', {}, {});
            return labOwner;
        }])
        .factory('psgitlab', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var psgitlab = $resource(GLOBAL.host_repos + '/gitlab', {}, {
                create: {method: 'POST'}
            });
            return psgitlab;
        }])
        .factory('laborgs', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var laborgs = $resource(GLOBAL.host_repos + '/gitlab/orgs', {}, {});
            return laborgs;
        }])
        .factory('labBranch', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var labBranch = $resource(GLOBAL.host_repos + '/gitlab/:repo/branches', {repo: '@repo'}, {});
            return labBranch;
        }])
        .factory('platform', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var platform = $resource(GLOBAL.host_registry + '/repositories?project_id=:id', {id: '@id'});
            return platform;
        }])
        .factory('pubregistry', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var pubregistry = $resource('/v2/_catalog', {});
            return pubregistry;
        }])
        .factory('registryp', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var registryp = $resource('/registry/api/projects', {});
            return registryp;
        }])
        .factory('registryptag', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var registryptag = $resource(GLOBAL.host_registry + '/repositories/:reponame/tags?detail=1', {reponame: '@reponame'});
            return registryptag;
        }])
        .factory('pubregistrytag', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var pubregistrytag = $resource('/v2/:namespace/:name/tags/list', {
                namespace: '@namespace',
                name: '@name'
            });
            return pubregistrytag;
        }])
        .factory('regpro', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var regpro = $resource(GLOBAL.host_registry + '/projects', {});
            return regpro;
        }])
        .factory('platformlist', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var platformlist = $resource(GLOBAL.host_registry + '/repositories/tags?repo_name=:id', {id: '@id'});
            return platformlist;
        }])
        .factory('platformone', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var platformone = $resource(GLOBAL.host_registry + '/repositories/manifests?repo_name=:id&tag=:tag', {
                id: '@id',
                tag: '@tag'
            });
            return platformone;
        }])
        .factory('registration', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var registration = $resource(GLOBAL.host_lapi + '/signup', {}, {
                regist: {method: 'POST'}
            });
            return registration;
        }])
        .factory('profile', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var profile = $resource(GLOBAL.host_lapi + '/user/profile', {}, {});
            return profile;
        }])
        .factory('pwdModify', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var pwdModify = $resource(GLOBAL.host_lapi + '/password_modify', {
                old_password: '@oldpassword',
                new_password: '@newpassword'
            }, {
                change: {method: 'PUT'}
            })
            return pwdModify;
        }])
        .factory('deletepod', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var deletepod = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/pods?labelSelector=deploymentconfig%3D:name&region=:region', {
                name: '@name',
                region: '@region',
                namespace: '@namespace'
            }, {
                delete: {method: 'DELETE'}
            })
            return deletepod;
        }])
        .factory('orgList', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var orgList = $resource(GLOBAL.host_lapi + '/v1/orgs/:namespace/roles', {namespace: '@namespace'}, {})
            return orgList;
        }])
        .factory('createOrg', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var createOrg = $resource(GLOBAL.host_lapi + '/v1/orgs?region=:region', {region: '@region'}, {
                create: {method: 'POST'}
            })
            return createOrg;
        }])
        .factory('addperpleOrg', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var addperpleOrg = $resource(GLOBAL.host_lapi + '/v1/orgs/:namespace/invite?region=:region', {
                namespace: '@namespace',
                region: '@region'
            }, {
                put: {method: 'PUT'}
            })
            return addperpleOrg;
        }])
        .factory('delperpleOrg', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var delperpleOrg = $resource(GLOBAL.host_lapi + '/v1/orgs/:namespace/remove?region=:region', {
                namespace: '@namespace',
                region: '@region'
            }, {
                put: {method: 'PUT'}
            })
            return delperpleOrg;
        }])
        .factory('loadOrg', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var loadOrg = $resource(GLOBAL.host_lapi + '/orgs/:org', {org: '@org'}, {})
            return loadOrg;
        }])
        .factory('invitation', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var invitation = $resource(GLOBAL.host_lapi + '/orgs/:orgs/invite', {org: '@org'}, {
                invite: {method: 'PUT'}
            })
            return invitation;
        }])
        .factory('remove', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var remove = $resource(GLOBAL.host_lapi + '/orgs/:org/remove', {org: '@org'}, {
                delete: {method: 'PUT'}
            })
            return remove;
        }])
        .factory('privileged', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var privileged = $resource(GLOBAL.host_lapi + '/orgs/:org/privileged', {org: '@org'}, {
                privileged: {method: 'PUT'}
            })
            return privileged;
        }])
        .factory('acception', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var acception = $resource(GLOBAL.host_lapi + '/orgs/:org/accept', {org: '@org'}, {
                accept: {method: 'PUT'}
            })
            return acception;
        }])
        .factory('leave', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var leave = $resource(GLOBAL.host_lapi + '/orgs/:org/leave', {org: '@org'}, {
                left: {method: 'PUT'}
            })
            return leave;
        }])
        .factory('delvolume', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var delvolume = $resource(GLOBAL.host_lapi + '/v1/namespaces/:namespace/volumes/:name', {
                namespace: '@namespace',
                name: '@name'
            }, {
                del: {method: 'DELETE'}
            })
            return delvolume;
        }])
        .factory('volume', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var volume = $resource(GLOBAL.host_lapi + '/v1/namespaces/:namespace/volumes', {namespace: '@namespace'}, {
                create: {method: 'POST'}
            })
            return volume;
        }])
        .factory('newBackingService', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var newBackingService = $resource(GLOBAL.host_lapi + '/v1/backingservices/:name', {name: '@name'}, {});
            return newBackingService;
        }])
        .factory('configmaps', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var configmaps = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/configmaps/:name?region=:region', {
                namespace: '@namespace',
                name: '@name',
                region: '@region'
            }, {
                create: {method: 'POST'},
                delete: {method: 'DELETE'},
                updata: {method: 'PUT'}
            })
            return configmaps;
        }])
        .factory('listConfig', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var listConfig = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/configmaps/:name?region=:region', {
                namespace: '@namespace',
                name: '@name',
                region: '@region'
            }, {})
            return listConfig;
        }])
        .factory('secretskey', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var secretskey = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/secrets/:name?region=:region', {
                namespace: '@namespace',
                name: '@name',
                region: '@region'
            }, {
                create: {method: 'POST'},
                delete: {method: 'DELETE'},
                updata: {method: 'PUT'}
            })
            return secretskey;
        }])
        .factory('creatapp', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var creatapp = $resource(GLOBAL.host + '/namespaces/:namespace/backingserviceinstances?region=:region', {
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                delete: {method: 'DELETE'},
                updata: {method: 'PUT'}
            })
            return creatapp;
        }])
        .factory('listSecret', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var listSecret = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/secrets/:name?region=:region', {
                namespace: '@namespace',
                name: '@name',
                region: '@region'
            }, {})
            return listSecret;
        }])
        .factory('modifySecret', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var modifySecret = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/secrets/:name?region=:region', {
                namespace: '@namespace',
                name: '@name',
                region: '@region'
            }, {
                update: {method: 'PUT'}
            })
            return modifySecret;
        }])
        .factory('deleteSecret', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var deleteSecret = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/secrets/:name?region=:region', {
                namespace: '@namespace',
                name: '@name',
                region: '@region'
            }, {
                delete: {method: 'DELETE'}
            })
            return deleteSecret;
        }])
        .factory('delSecret', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var delSecret = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/secrets/:name?region=:region', {
                namespace: '@namespace',
                region: '@region',
                name: '@name',
            }, {
                del: {method: 'DELETE'}
            })
            return delSecret;
        }])
        .factory('persistent', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var persistent = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/persistentvolumeclaims/:name?region=:region', {
                namespace: '@namespace',
                name: '@name',
                region: '@region'
            }, {
                del: {method: 'DELETE'}
            })
            return persistent;
        }])
        .factory('serviceaccounts', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var serviceaccounts = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/serviceaccounts/deployer?region=:region', {
                namespace: '@namespace',
                region: '@region'
            }, {})
            return serviceaccounts;
        }])
        .factory('saas', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var saas = $resource(GLOBAL.host_saas + '/apps/:id', {
                id: '@id',
                orderby: '@orderby',
                category: '@category',
                provider: '@provider'
            }, {
                create: {method: 'POST'},
                delete: {method: 'DELETE'},
                put: {method: 'PUT'}
            })
            return saas;
        }])
        .factory('account', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //登陆检测套餐
            var account = $resource(GLOBAL.host_payment + '/account?size=100', {}, {});

            return account;
        }])
        .factory('uploadinfo', ['$resource', 'GLOBAL', function($resource, GLOBAL) { //充值
            var uploadinfo = $resource(GLOBAL.uploadimage + '/:namespace/info', {}, {
                create: { method: 'POST' }
            });
            return uploadinfo;
        }])
        .factory('balance', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //余额查询
            var balance = $resource(GLOBAL.host_payment + '/balance', {}, {});
            return balance;
        }])
        .factory('market', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //套餐
            var market = $resource(GLOBAL.host_payment + '/market', {}, {});
            return market;
        }])
        .factory('amounts', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //订单详情
            var amounts = $resource(GLOBAL.host_payment + '/amounts', {}, {});
            return amounts;
        }])
        .factory('checkout', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //选择套餐
            var checkout = $resource(GLOBAL.host_payment + '/checkout?drytry=:drytry&region=:region', {
                drytry: '@drytry',
                region: '@region'
            }, {
                create: {method: 'POST'}
            });
            return checkout;
        }])
        .factory('recharge', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //充值
            var recharge = $resource(GLOBAL.host_payment + '/recharge', {}, {
                create: {method: 'POST'}
            });
            return recharge;
        }])
        .factory('redeem', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //充值优惠卷
            var redeem = $resource(GLOBAL.host_payment + '/redeem?region=:region', {region: '@region'}, {
                create: {method: 'POST'}
            });
            return redeem;
        }])
        .factory('addcard', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //生成卡
            var addcard = $resource(GLOBAL.host_payment + '/coupon?region=:region', {region: '@region'}, {
                create: {method: 'POST'}
            });
            return addcard;
        }])
        .factory('directrecharge', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //充钱
            var directrecharge = $resource(GLOBAL.host_payment + '/directrecharge?region=:region', {region: '@region'}, {
                create: {method: 'POST'}
            });
            return directrecharge;
        }])
        .factory('orders', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //获取订单
            var orders = $resource(GLOBAL.host_payment + '/orders', {}, {});
            return orders;
        }])
        .factory('delorders', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //获取订单
            var delorders = $resource(GLOBAL.host_payment + '/orders/:id', {id: '@id'}, {
                delete: {method: 'DELETE'}
            });
            return delorders;
        }])
        .factory('regions', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //获取区
            var regions = $resource(GLOBAL.host_payment + '/regions', {}, {});
            return regions;
        }])
        .factory('coupon', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //获取充值卡面额
            var regions = $resource(GLOBAL.host_payment + '/coupon/:id', {id: '@id'}, {});
            return regions;
        }])
        .factory('repositories', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //数据集成 公开数据集
            var repositories = $resource(GLOBAL.host_integration + '/repos', {}, {});
            return repositories;
        }])
        .factory('repository', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //数据集成 公开数据集详情
            var repository = $resource(GLOBAL.host_integration + '/repos/:reponame', {}, {});
            return repository;
        }])
        .factory('dataitem', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //数据集成 公开数据集详情预览
            var dataitem = $resource(GLOBAL.host_integration + '/repos/:reponame/items/:itemname', {}, {});
            return dataitem;
        }])
        .factory('inservice', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //数据集成 公开数据集详情预览
            var inservice = $resource(GLOBAL.host_integration + '/services', {}, {});
            return inservice;
        }])
        .factory('authorize', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //构建认证
            var authorize = $resource(GLOBAL.host_authorize + '/:source', {source: '@source'}, {});
            return authorize;
        }])
        .factory('repositorygit', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //获取仓库
            var repositorygit = $resource(GLOBAL.host_repo + '/:source', {source: '@source'}, {});
            return repositorygit;
        }])
        .factory('repositorybranches', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //获取仓库分支
            var repositorybranches = $resource(GLOBAL.host_repo + '/:source/branches', {source: '@source'}, {});
            return repositorybranches;
        }])
        .factory('repositorytags', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //获取仓库tag
            var repositorytags = $resource(GLOBAL.host_repo + '/:source/tags', {source: '@source'}, {});
            return repositorytags;
        }])
        .factory('repositorysecret', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //获取仓库分支
            var repositorysecret = $resource(GLOBAL.host_repo + '/:source/secret', {source: '@source'}, {});
            return repositorysecret;
        }])
        .factory('instance', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //数据集成 公开数据集详情预览
            var instance = $resource(GLOBAL.host_integration + '/instance/:id', {id: '@id'}, {
                create: {method: 'POST'}

            });
            return instance;
        }])
        .factory('wechatrecharge', ['$resource', 'GLOBAL', function ($resource) { //微信支付
            var wechatrecharge = $resource('/payment/v1/recharge/weixin', {region: '@region'}, {
                create: {method: 'POST'}
            });
            return wechatrecharge;
        }])
        .factory('wechatid', ['$resource', 'GLOBAL', function ($resource) { //微信订单查询
            var wechatid = $resource('/payment/v1/recharge/weixin/:trade_id', {
                region: '@region',
                trade_id: '@trade_id'
            }, {});
            return wechatid;
        }])
        .factory('statefuldetail', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //数据集成 公开数据集详情预览
            var statefuldetail = $resource(GLOBAL.host_newk8s1 + '/namespaces/:username/statefulsets/:name', {
                namespaces: '@username',
                name: '@name'
            }, {});
            return statefuldetail;
        }])
        .factory('uploadimageapi', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var uploadimage = $resource(GLOBAL.uploadimage + '/:namespace/complete', {
                namespaces: '@username'
            }, {});
            return uploadimage;
        }])
        .factory('allTenants', ['$resource', 'GLOBAL', function ($resource, GLOBAL) { //数据集成 公开数据集详情预览
            var allTenants = $resource(GLOBAL.ocmanager + '/user/name/:name/all/tenants', {
                namespaces: '@name'
            }, {});
            return allTenants;
        }])
        .factory('ServiceTenant', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ServiceTenant = $resource(GLOBAL.ocmanager + '/tenant/:tenantId/service/instances', {
                tenantId: '@tenantId'
            }, {});
            return ServiceTenant;
        }])
        .factory('ServiceTenantInfor', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ServiceTenantInfor = $resource(GLOBAL.ocmanager + '/tenant/:tenantId/service/instance/:instanceName/access/info', {
                tenantId: '@tenantId',
                instanceName:'@instanceName'
            }, {});
            return ServiceTenantInfor;
        }])
        .factory('ToolTenant', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ToolTenant = $resource(GLOBAL.ocmanager + '/instance/tool/tenant/:tenantId', {
                tenantId: '@tenantId'
            }, {});
            return ToolTenant;
        }])
});