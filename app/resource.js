'use strict';

define([
    'angular',
    'ngResource'
], function (angular) {

    return angular.module('myApp.resource', ['ngResource'])
        .factory('Ws', ['$rootScope', '$ws', '$log', 'GLOBAL', 'Cookie', function ($rootScope, $ws, $log, GLOBAL, Cookie) {
            var Ws = {};
            $rootScope.watches = $rootScope.watches || {};

            Ws.watch = function (params, onmessage, onopen, onclose) {
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
                var tokens = Cookie.get('df_access_token');
                var regions = Cookie.get('region');
                var tokenarr = tokens.split(',');
                var region = regions.split('-')[2];
                var token = tokenarr[region-1];
                if (params.api == 'k8s') {
                    host = host + GLOBAL.host_wss_k8s;


                    // host=host+'dev.dataos.io:8443/api/v1';
                } else {
                    //var token = tokenarr[0];
                    host = host + GLOBAL.host_wss;
                }
                //var tokens = Cookie.get('df_access_token');
                //var regions = Cookie.get('region');

                params.name = params.name ? '/' + params.name : '';
                if (params.pod) {
                    var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name +
                        '?follow=true' +
                        '&tailLines=1000' +
                        '&limitBytes=10485760' +
                        '&container=' + params.pod +
                        '&region=' + $rootScope.region +
                        '&access_token=' + token;
                } else if (params.app) {
                    var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name +
                        '?watch=true' +
                        '&resourceVersion=' + params.resourceVersion +
                        '&labelSelector=' + params.app +
                        '&region=' + $rootScope.region +
                        '&access_token=' + token;
                } else {
                    var url = host + '/namespaces/' + params.namespace + '/' + params.type + params.name +
                        '?watch=true' +
                        '&resourceVersion=' + params.resourceVersion +
                        '&region=' + $rootScope.region +
                        '&access_token=' + token;
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
        .factory('User', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var User = $resource(GLOBAL.host + '/users/:name', {name: '@name',region: '@region'}, {
                create: {method: 'POST'}
            });
            return User;
        }])

        .factory('Project', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Project = $resource(GLOBAL.host + '/projects/:name?region=:region', {name: '@name',region: '@region'}, {
                create: {method: 'POST'}
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

        .factory('ReplicationController', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var ReplicationController = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/replicationcontrollers/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                put: {method: 'PUT'}
            });
            return ReplicationController;
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

        .factory('BackingServiceInstance', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var BackingServiceInstance = $resource(GLOBAL.host + '/namespaces/:namespace/backingserviceinstances/:name?region=:region', {
                name: '@name',
                namespace: '@namespace',
                region: '@region'
            }, {
                create: {method: 'POST'},
                del: {method: 'DELETE'}
            });
            BackingServiceInstance.bind = $resource(GLOBAL.host + '/namespaces/:namespace/backingserviceinstances/:name/binding?region=:region', {
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

        .factory('BackingService', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var BackingService = $resource(GLOBAL.host + '/namespaces/:namespace/backingservices/:name?region=:region', {
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
                create: {method: 'POST'}
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

        .factory('Secret', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var Secret = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/secrets/:name?region=:region',
                {
                    name: '@name',
                    namespace: '@namespace',
                    region: '@region'
                }, {
                    create: {method: 'POST'}
                });
            return Secret;
        }])

        .factory('Metrics', ['$resource', function ($resource) {
            var Metrics = {};
            Metrics.mem = $resource('/hawkular/metrics/gauges/:gauges/data',
                {gauges: '@gauges', buckets: '@buckets', start: '@start'});
            Metrics.cpu = $resource('/hawkular/metrics/counters/:counters/data', {
                counters: '@counters',
                buckets: '@buckets',
                start: '@start'
            });
            Metrics.mem.all = $resource('/hawkular/metrics/gauges/data', {tags: '@tags', buckets: '@buckets'});
            Metrics.cpu.all = $resource('/hawkular/metrics/counters/data', {tags: '@tags', buckets: '@buckets'});
            return Metrics;
        }])
        .factory('Owner', ['$resource', function ($resource) {
            var Owner = $resource('/v1/repos/github/owner', {namespace: '@namespace', cache: '@cache'}, {
                'query': {method: 'GET'}
            });
            return Owner;
        }])
        .factory('Org', ['$resource', function ($resource) {
            var Org = $resource('/v1/repos/github/orgs', {
                cache: 'false'
            });
            return Org;
        }])
        .factory('Branch', ['$resource', function ($resource) {
            var Branch = $resource('/v1/repos/github/users/:users/repos/:repos', {
                users: '@users',
                repos: '@repos'
            }, {});
            return Branch;
        }])
        .factory('WebhookLabget', ['$resource', function ($resource) {
            var WebhookLabget = $resource('/v1/repos/source/gitlab/webhooks?namespace=:namespace&build=:build', {
                namespace: '@namespace',
                build: '@build'
            }, {});
            return WebhookLabget;
        }])
        .factory('WebhookGitget', ['$resource', function ($resource) {
            var WebhookGitget = $resource('/v1/repos/source/github/webhooks?namespace=:namespace&build=:build', {
                namespace: '@namespace',
                build: '@build'
            }, {})
            return WebhookGitget;
        }])
        .factory('WebhookLab', ['$resource', function ($resource) {
            var WebhookLab = $resource('/v1/repos/source/gitlab/webhooks', {}, {
                check: {method: 'POST'}
            });
            return WebhookLab;
        }])
        .factory('WebhookHub', ['$resource', function ($resource) {
            var WebhookHub = $resource('/v1/repos/source/github/webhooks', {}, {
                check: {method: 'POST'}
            });
            return WebhookHub;
        }])
        .factory('WebhookLabDel', ['$resource', function ($resource) {
            var WebhookLabDel = $resource('/v1/repos/source/gitlab/webhooks?host=:host&namespace=:namespace&build=:build&repo=:repo', {
                host: '@host',
                namespace: '@namespace',
                build: '@build',
                repo: '@repo'
            }, {
                del: {method: 'DELETE'}
            });
            return WebhookLabDel;
        }])
        .factory('WebhookHubDel', ['$resource', function ($resource) {
            var WebhookHubDel = $resource('/v1/repos/source/github/webhooks?namespace=:namespace&build=:build&user=:user&repo=:repo', {
                namespace: '@namespace',
                build: '@build',
                user: '@user',
                repo: '@repo'
            }, {
                del: {method: 'DELETE'}
            });
            return WebhookHubDel;
        }])
        .factory('platform', ['$resource', function ($resource) {
            var platform = $resource('/registry/api/repositories?project_id=:id', {id: '@id'});
            return platform;
        }])
        .factory('platformlist', ['$resource', function ($resource) {
            var platformlist = $resource('/registry/api/repositories/tags?repo_name=:id', {id: '@id'});
            return platformlist;
        }])
        .factory('platformone', ['$resource', function ($resource) {
            var platformone = $resource('/registry/api/repositories/manifests?repo_name=:id&tag=:tag', {
                id: '@id',
                tag: '@tag'
            });
            return platformone;
        }])
        .factory('labOwner', ['$resource', function ($resource) {
            var labOwner = $resource('/v1/repos/gitlab/owner', {}, {});
            return labOwner;
        }])
        .factory('psgitlab', ['$resource', function ($resource) {
            var psgitlab = $resource('/v1/repos/gitlab', {}, {
                create: {method: 'POST'}
            });
            return psgitlab;
        }])
        .factory('laborgs', ['$resource', function ($resource) {
            var laborgs = $resource('/v1/repos/gitlab/orgs', {}, {});
            return laborgs;
        }])
        .factory('labBranch', ['$resource', function ($resource) {
            var labBranch = $resource('/v1/repos/gitlab/:repo/branches', {repo: '@repo'}, {});
            return labBranch;
        }])
        .factory('registration', ['$resource', function ($resource) {
            var registration = $resource('/lapi/signup', {}, {
                regist: {method: 'POST'}
            });
            return registration;
        }])
        .factory('profile', ['$resource', function ($resource) {
            var profile = $resource('/lapi/user/profile', {}, {});
            return profile;
        }])
        .factory('pwdModify', ['$resource', function ($resource) {
            var pwdModify = $resource('/lapi/password_modify', {
                old_password: '@oldpassword',
                new_password: '@newpassword'
            }, {
                change: {method: 'PUT'}
            })
            return pwdModify;
        }])
        .factory('deletepod', ['$resource', function ($resource) {
            var deletepod = $resource('/lapi/v1/namespaces/:namespace/pods', {namespace: '@namespace'}, {
                delete: {method: 'DELETE'}
            })
            return deletepod;
        }])

        .factory('orgList', ['$resource', function ($resource) {
            var orgList = $resource('/lapi/v1/orgs/:namespace/roles', {namespace: '@namespace'}, {})
            return orgList;
        }])
        //.factory('orgList', ['$resource', function ($resource) {
        //    var orgList = $resource('/lapi/orgs', {}, {})
        //    return orgList;
        //}])
        //
        .factory('createOrg', ['$resource', function ($resource) {
            var createOrg = $resource('/lapi/v1/orgs?region=:region', {region: '@region'}, {
                create: {method: 'POST'}
            })
            return createOrg;
        }])
        .factory('addperpleOrg', ['$resource', function ($resource) {
            var addperpleOrg = $resource('/lapi/v1/orgs/:namespace/invite?region=:region', {namespace:'@namespace',region:'@region'}, {
                put: {method: 'PUT'}
            })
            return addperpleOrg;
        }])
        .factory('delperpleOrg', ['$resource', function ($resource) {
            var delperpleOrg = $resource('/lapi/v1/orgs/:namespace/remove?region=:region', {namespace:'@namespace',region:'@region'}, {
                put: {method: 'PUT'}
            })
            return delperpleOrg;
        }])
        .factory('loadOrg', ['$resource', function ($resource) {
            var loadOrg = $resource('/lapi/orgs/:org', {org: '@org'}, {})
            return loadOrg;
        }])
        .factory('invitation', ['$resource', function ($resource) {
            var invitation = $resource('/lapi/orgs/:orgs/invite', {org: '@org'}, {
                invite: {method: 'PUT'}
            })
            return invitation;
        }])
        .factory('remove', ['$resource', function ($resource) {
            var remove = $resource('/lapi/orgs/:org/remove', {org: '@org'}, {
                delete: {method: 'PUT'}
            })
            return remove;
        }])
        .factory('privileged', ['$resource', function ($resource) {
            var privileged = $resource('/lapi/orgs/:org/privileged', {org: '@org'}, {
                privileged: {method: 'PUT'}
            })
            return privileged;
        }])
        .factory('acception', ['$resource', function ($resource) {
            var acception = $resource('/lapi/orgs/:org/accept', {org: '@org'}, {
                accept: {method: 'PUT'}
            })
            return acception;
        }])
        .factory('leave', ['$resource', function ($resource) {
            var leave = $resource('/lapi/orgs/:org/leave', {org: '@org'}, {
                left: {method: 'PUT'}
            })
            return leave;
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
            var delSecret = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/secrets?region=:region', {
                    namespace: '@namespace',
                    region: '@region'
                },
                {
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
        .factory('delvolume', ['$resource', function ($resource) {
            var delvolume = $resource('/lapi/v1/namespaces/:namespace/volumes/:name', {
                namespace: '@namespace',
                name: '@name'
            }, {
                del: {method: 'DELETE'}
            })
            return delvolume;
        }])
        .factory('serviceaccounts', ['$resource', 'GLOBAL', function ($resource, GLOBAL) {
            var serviceaccounts = $resource(GLOBAL.host_k8s + '/namespaces/:namespace/serviceaccounts/deployer?region=:region', {
                namespace: '@namespace',
                region: '@region'
            }, {})
            return serviceaccounts;
        }])
        .factory('volume', ['$resource', function ($resource) {
            var volume = $resource('/lapi/v1/namespaces/:namespace/volumes', {namespace: '@namespace'}, {
                create: {method: 'POST'}
            })
            return volume;
        }])
        .factory('saas', ['$resource', function ($resource) {
            var saas = $resource('/saas/v1/apps/:id', {
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
        .factory('newBackingService', ['$resource', 'GLOBAL', function ($resource) {
            var newBackingService = $resource('/lapi/v1/backingservices/:name', {name: '@name'}, {});
            return newBackingService;
        }])

        .factory('account', ['$resource', 'GLOBAL', function ($resource) {//登陆检测套餐
            var account = $resource('/payment/v1/account?size=100', {}, {});
            return account;
        }])
        .factory('balance', ['$resource', 'GLOBAL', function ($resource) {//余额查询
            var balance = $resource('/payment/v1/balance', {}, {});
            return balance;
        }])
        .factory('market', ['$resource', 'GLOBAL', function ($resource) {//套餐
            var market = $resource('/payment/v1/market', {}, {});
            return market;
        }])
        .factory('amounts', ['$resource', 'GLOBAL', function ($resource) {//订单详情
            var amounts = $resource('/payment/v1/amounts', {}, {});
            return amounts;
        }])
        .factory('checkout', ['$resource', 'GLOBAL', function ($resource) {//选择套餐
            var checkout = $resource('/payment/v1/checkout?drytry=:drytry&region=:region', {drytry:'@drytry',region: '@region'}, {
                create: {method: 'POST'}
            });
            return checkout;
        }])
        .factory('recharge', ['$resource', 'GLOBAL', function ($resource) {//充值
            var recharge = $resource('/payment/v1/recharge', {}, {
                create: {method: 'POST'}
            });
            return recharge;
        }])

        .factory('redeem', ['$resource', 'GLOBAL', function ($resource) {//充值优惠卷
            var redeem = $resource('/payment/v1/redeem?region=:region', {region: '@region'}, {
                create: {method: 'POST'}
            });
            return redeem;
        }])
        //.factory('recharge2', ['$resource', 'GLOBAL', function ($resource) {//充值
        //    var recharge = $resource('http://datafoundry.recharge.app.dataos.io/charge/v1/recharge', {}, {
        //        create: {method: 'POST'}
        //    });
        //    return recharge;
        //}])
        .factory('orders', ['$resource', 'GLOBAL', function ($resource) {//获取订单
            var orders = $resource('/payment/v1/orders', {}, {});
            return orders;
        }])
        .factory('delorders', ['$resource', 'GLOBAL', function ($resource) {//获取订单
            var delorders = $resource('/payment/v1/orders/:id', {id:'@id'}, {
                delete: {method: 'DELETE'},
            });
            return delorders;
        }])

        .factory('regions', ['$resource', 'GLOBAL', function ($resource) {//获取区
            var regions = $resource('/payment/v1/regions', {}, {});
            return regions;
        }])

        .factory('coupon', ['$resource', 'GLOBAL', function ($resource) {//获取充值卡面额
            var regions = $resource('/payment/v1/coupon/:id', {id:'@id'}, {});
            return regions;
        }])

        .factory('repositories', ['$resource', 'GLOBAL', function ($resource) {//数据集成 公开数据集
            var repositories = $resource('/integration/v1/repos', {}, {});
            return repositories;
        }])

        .factory('repository', ['$resource', 'GLOBAL', function ($resource) {//数据集成 公开数据集详情
            var repository = $resource('/integration/v1/repos/:reponame', {}, {});
            return repository;
        }])

        .factory('dataitem', ['$resource', 'GLOBAL', function ($resource) {//数据集成 公开数据集详情预览
            var dataitem = $resource('/integration/v1/repos/:reponame/items/:itemname', {}, {});
            return dataitem;
        }])

        .factory('inservice', ['$resource', 'GLOBAL', function ($resource) {//数据集成 公开数据集详情预览
            var inservice = $resource('/integration/v1/services', {}, {
            });
            return inservice;
        }])

        .factory('instance', ['$resource', 'GLOBAL', function ($resource) {//数据集成 公开数据集详情预览
            var instance = $resource('/integration/v1/instance/:id', {id:'@id'}, {
                create: {method: 'POST'}
            });
            return instance;
        }])
        .factory('wechatrecharge', ['$resource', 'GLOBAL', function ($resource) {//数据集成 公开数据集详情预览
            var wechatrecharge = $resource('/payment/v1/recharge/weixin', {region:'@region'}, {
                create: {method: 'POST'}
            });
            return wechatrecharge;
        }])


});

