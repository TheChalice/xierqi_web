'use strict';

define([
    'angular',
    'bootstrap',
    'angularBase64',
    'ocLazyLoad',
    'uiBootstrap',
    'router',
    'resource',
    'pub/controller',
    'pub/service',
    'pub/origin-web-service',
    'pub/directive',
    'pub/filter',
    'pub/ws',
    'pub/fromFile',
    'components/version/version',
    'angularMd',
    'angularClipboard',
    'angularSlider',
    'kubernetesUI',
    'highchartsNg',
    'patternfly',
    'angular_patternfly',
    'treeControl',
    'lodash',
    'jsyaml',
    'ace',
    'ui_ace'
], function(angular) {

    // 声明应用及其依赖
    var DataFoundry = angular.module('DataFoundry', [
        'oc.lazyLoad',
        'ui.bootstrap',
        'myApp.router', //路由模块
        'myApp.resource', //资源模块
        'myApp.controller',
        'myApp.service',
        'myApp.directive',
        'myApp.filter',
        'myApp.webSocket',
        'myApp.version',
        'hc.marked',
        'rzModule',
        'highcharts-ng',
        'patternfly.wizard',
        'treeControl',
        'ui.ace',
        'myApp.origin-web-service',
        'myApp.fromFile'
    ]);

    DataFoundry.constant('GLOBAL', {
            size: 10,
            host: '/oapi/v1',
            host_k8s: '/api/v1',
            host_newk8s: '/apis/autoscaling/v1',
            host_newk8s1: '/apis/apps/v1beta1',
            host_repos: '/v1/repos',
            host_registry: '/registry/api',
            host_lapi: '/lapi',
            host_authorize: '/authorize',
            host_saas: '/saas/v1',
            host_payment: '/payment/v1',
            host_repo: '/repos',
            host_integration: '/integration/v1',
            host_hawkular: '/hawkular/metrics',
            host_wss: '/ws/oapi/v1',
            host_wss_k8s: '/ws/api/v1',
            login_uri: '/login',
            signin_uri: '/signin',
            host_webhooks: '<WEBHOOK_PREFIX>',
            service_url: '<ROUTER_DOMAIN_SUFFIX>',
            //internal_registry:'docker-registry.default.svc:5000',
            internal_registry: '<INTERNAL_REGISTRY_ADDR>',
            //service_url:'.cloud.new.dataos.io',
            common_url: '<REGISTRY_PUBLIC_ADDR>',
            //private_url:'registry.dataos.io',
            private_url: '<REGISTRY_PRIVATE_ADDR>'

        })
        .constant('AUTH_EVENTS', {
            loginNeeded: 'auth-login-needed',
            loginSuccess: 'auth-login-success',
            httpForbidden: 'auth-http-forbidden'
        })

    .config(['$httpProvider', 'GLOBAL', function($httpProvider) {
        $httpProvider.interceptors.push([
            '$injector',
            function($injector) {
                return $injector.get('AuthInterceptor');
            }
        ]);
    }])

    .run(['$rootScope', 'account', '$state', 'Cookie',
        function($rootScope, account, $state, Cookie) {
            var masterPublicHostname = 'http://127.0.0.1:8080';
            window.OPENSHIFT_CONFIG = {
                apis: {
                    "hostPort": "127.0.0.1:8080",
                    "prefix": "/apis",
                    "groups": {
                        "authentication.k8s.io": {
                            "name": "authentication.k8s.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "authentication.k8s.io/v1",
                                    "resources": {
                                        "tokenreviews": {
                                            "name": "tokenreviews",
                                            "namespaced": false,
                                            "kind": "TokenReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                },
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "authentication.k8s.io/v1beta1",
                                    "resources": {
                                        "tokenreviews": {
                                            "name": "tokenreviews",
                                            "namespaced": false,
                                            "kind": "TokenReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "authorization.k8s.io": {
                            "name": "authorization.k8s.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "authorization.k8s.io/v1",
                                    "resources": {
                                        "localsubjectaccessreviews": {
                                            "name": "localsubjectaccessreviews",
                                            "namespaced": true,
                                            "kind": "LocalSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "selfsubjectaccessreviews": {
                                            "name": "selfsubjectaccessreviews",
                                            "namespaced": false,
                                            "kind": "SelfSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "subjectaccessreviews": {
                                            "name": "subjectaccessreviews",
                                            "namespaced": false,
                                            "kind": "SubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                },
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "authorization.k8s.io/v1beta1",
                                    "resources": {
                                        "localsubjectaccessreviews": {
                                            "name": "localsubjectaccessreviews",
                                            "namespaced": true,
                                            "kind": "LocalSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "selfsubjectaccessreviews": {
                                            "name": "selfsubjectaccessreviews",
                                            "namespaced": false,
                                            "kind": "SelfSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "subjectaccessreviews": {
                                            "name": "subjectaccessreviews",
                                            "namespaced": false,
                                            "kind": "SubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "autoscaling": {
                            "name": "autoscaling",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "autoscaling/v1",
                                    "resources": {
                                        "horizontalpodautoscalers": {
                                            "name": "horizontalpodautoscalers",
                                            "namespaced": true,
                                            "kind": "HorizontalPodAutoscaler",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "hpa"
                                            ]
                                        },
                                        "horizontalpodautoscalers/status": {
                                            "name": "horizontalpodautoscalers/status",
                                            "namespaced": true,
                                            "kind": "HorizontalPodAutoscaler",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "batch": {
                            "name": "batch",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "batch/v1",
                                    "resources": {
                                        "jobs": {
                                            "name": "jobs",
                                            "namespaced": true,
                                            "kind": "Job",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "jobs/status": {
                                            "name": "jobs/status",
                                            "namespaced": true,
                                            "kind": "Job",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                },
                                "v2alpha1": {
                                    "version": "v2alpha1",
                                    "groupVersion": "batch/v2alpha1",
                                    "resources": {
                                        "cronjobs": {
                                            "name": "cronjobs",
                                            "namespaced": true,
                                            "kind": "CronJob",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "cronjobs/status": {
                                            "name": "cronjobs/status",
                                            "namespaced": true,
                                            "kind": "CronJob",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "scheduledjobs": {
                                            "name": "scheduledjobs",
                                            "namespaced": true,
                                            "kind": "ScheduledJob",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "scheduledjobs/status": {
                                            "name": "scheduledjobs/status",
                                            "namespaced": true,
                                            "kind": "ScheduledJob",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "certificates.k8s.io": {
                            "name": "certificates.k8s.io",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "certificates.k8s.io/v1beta1",
                                    "resources": {
                                        "certificatesigningrequests": {
                                            "name": "certificatesigningrequests",
                                            "namespaced": false,
                                            "kind": "CertificateSigningRequest",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "csr"
                                            ]
                                        },
                                        "certificatesigningrequests/approval": {
                                            "name": "certificatesigningrequests/approval",
                                            "namespaced": false,
                                            "kind": "CertificateSigningRequest",
                                            "verbs": [
                                                "update"
                                            ]
                                        },
                                        "certificatesigningrequests/status": {
                                            "name": "certificatesigningrequests/status",
                                            "namespaced": false,
                                            "kind": "CertificateSigningRequest",
                                            "verbs": [
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "extensions": {
                            "name": "extensions",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "extensions/v1beta1",
                                    "resources": {
                                        "daemonsets": {
                                            "name": "daemonsets",
                                            "namespaced": true,
                                            "kind": "DaemonSet",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "ds"
                                            ]
                                        },
                                        "daemonsets/status": {
                                            "name": "daemonsets/status",
                                            "namespaced": true,
                                            "kind": "DaemonSet",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "deployments": {
                                            "name": "deployments",
                                            "namespaced": true,
                                            "kind": "Deployment",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "deploy"
                                            ]
                                        },
                                        "deployments/rollback": {
                                            "name": "deployments/rollback",
                                            "namespaced": true,
                                            "kind": "DeploymentRollback",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "deployments/scale": {
                                            "name": "deployments/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "deployments/status": {
                                            "name": "deployments/status",
                                            "namespaced": true,
                                            "kind": "Deployment",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "horizontalpodautoscalers": {
                                            "name": "horizontalpodautoscalers",
                                            "namespaced": true,
                                            "kind": "HorizontalPodAutoscaler",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "hpa"
                                            ]
                                        },
                                        "horizontalpodautoscalers/status": {
                                            "name": "horizontalpodautoscalers/status",
                                            "namespaced": true,
                                            "kind": "HorizontalPodAutoscaler",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "ingresses": {
                                            "name": "ingresses",
                                            "namespaced": true,
                                            "kind": "Ingress",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "ing"
                                            ]
                                        },
                                        "ingresses/status": {
                                            "name": "ingresses/status",
                                            "namespaced": true,
                                            "kind": "Ingress",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "networkpolicies": {
                                            "name": "networkpolicies",
                                            "namespaced": true,
                                            "kind": "NetworkPolicy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "podsecuritypolicies": {
                                            "name": "podsecuritypolicies",
                                            "namespaced": false,
                                            "kind": "PodSecurityPolicy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "psp"
                                            ]
                                        },
                                        "replicasets": {
                                            "name": "replicasets",
                                            "namespaced": true,
                                            "kind": "ReplicaSet",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "rs"
                                            ]
                                        },
                                        "replicasets/scale": {
                                            "name": "replicasets/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "replicasets/status": {
                                            "name": "replicasets/status",
                                            "namespaced": true,
                                            "kind": "ReplicaSet",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "replicationcontrollers": {
                                            "name": "replicationcontrollers",
                                            "namespaced": true,
                                            "kind": "ReplicationControllerDummy",
                                            "verbs": []
                                        },
                                        "replicationcontrollers/scale": {
                                            "name": "replicationcontrollers/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "thirdpartyresources": {
                                            "name": "thirdpartyresources",
                                            "namespaced": false,
                                            "kind": "ThirdPartyResource",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "policy": {
                            "name": "policy",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "policy/v1beta1",
                                    "resources": {
                                        "poddisruptionbudgets": {
                                            "name": "poddisruptionbudgets",
                                            "namespaced": true,
                                            "kind": "PodDisruptionBudget",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "pdb"
                                            ]
                                        },
                                        "poddisruptionbudgets/status": {
                                            "name": "poddisruptionbudgets/status",
                                            "namespaced": true,
                                            "kind": "PodDisruptionBudget",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "rbac.authorization.k8s.io": {
                            "name": "rbac.authorization.k8s.io",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "rbac.authorization.k8s.io/v1beta1",
                                    "resources": {
                                        "clusterrolebindings": {
                                            "name": "clusterrolebindings",
                                            "namespaced": false,
                                            "kind": "ClusterRoleBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "clusterroles": {
                                            "name": "clusterroles",
                                            "namespaced": false,
                                            "kind": "ClusterRole",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "rolebindings": {
                                            "name": "rolebindings",
                                            "namespaced": true,
                                            "kind": "RoleBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "roles": {
                                            "name": "roles",
                                            "namespaced": true,
                                            "kind": "Role",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "storage.k8s.io": {
                            "name": "storage.k8s.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "storage.k8s.io/v1beta1",
                                    "resources": {
                                        "storageclasses": {
                                            "name": "storageclasses",
                                            "namespaced": false,
                                            "kind": "StorageClass",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "sc"
                                            ]
                                        }
                                    }
                                },
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "storage.k8s.io/v1",
                                    "resources": {
                                        "storageclasses": {
                                            "name": "storageclasses",
                                            "namespaced": false,
                                            "kind": "StorageClass",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "sc"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "apps": {
                            "name": "apps",
                            "preferredVersion": "v1beta1",
                            "versions": {
                                "v1beta1": {
                                    "version": "v1beta1",
                                    "groupVersion": "apps/v1beta1",
                                    "resources": {
                                        "deployments": {
                                            "name": "deployments",
                                            "namespaced": true,
                                            "kind": "Deployment",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "deploy"
                                            ]
                                        },
                                        "deployments/rollback": {
                                            "name": "deployments/rollback",
                                            "namespaced": true,
                                            "kind": "DeploymentRollback",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "deployments/scale": {
                                            "name": "deployments/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "deployments/status": {
                                            "name": "deployments/status",
                                            "namespaced": true,
                                            "kind": "Deployment",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "statefulsets": {
                                            "name": "statefulsets",
                                            "namespaced": true,
                                            "kind": "StatefulSet",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "statefulsets/status": {
                                            "name": "statefulsets/status",
                                            "namespaced": true,
                                            "kind": "StatefulSet",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "project.openshift.io": {
                            "name": "project.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "project.openshift.io/v1",
                                    "resources": {
                                        "projectrequests": {
                                            "name": "projectrequests",
                                            "namespaced": false,
                                            "kind": "ProjectRequest",
                                            "verbs": [
                                                "create",
                                                "list"
                                            ]
                                        },
                                        "projects": {
                                            "name": "projects",
                                            "namespaced": false,
                                            "kind": "Project",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "quota.openshift.io": {
                            "name": "quota.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "quota.openshift.io/v1",
                                    "resources": {
                                        "appliedclusterresourcequotas": {
                                            "name": "appliedclusterresourcequotas",
                                            "namespaced": true,
                                            "kind": "AppliedClusterResourceQuota",
                                            "verbs": [
                                                "get",
                                                "list"
                                            ]
                                        },
                                        "clusterresourcequotas": {
                                            "name": "clusterresourcequotas",
                                            "namespaced": false,
                                            "kind": "ClusterResourceQuota",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "clusterresourcequotas/status": {
                                            "name": "clusterresourcequotas/status",
                                            "namespaced": false,
                                            "kind": "ClusterResourceQuota",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "route.openshift.io": {
                            "name": "route.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "route.openshift.io/v1",
                                    "resources": {
                                        "routes": {
                                            "name": "routes",
                                            "namespaced": true,
                                            "kind": "Route",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "routes/status": {
                                            "name": "routes/status",
                                            "namespaced": true,
                                            "kind": "Route",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "image.openshift.io": {
                            "name": "image.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "image.openshift.io/v1",
                                    "resources": {
                                        "images": {
                                            "name": "images",
                                            "namespaced": false,
                                            "kind": "Image",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "imagesignatures": {
                                            "name": "imagesignatures",
                                            "namespaced": false,
                                            "kind": "ImageSignature",
                                            "verbs": [
                                                "create",
                                                "delete"
                                            ]
                                        },
                                        "imagestreamimages": {
                                            "name": "imagestreamimages",
                                            "namespaced": true,
                                            "kind": "ImageStreamImage",
                                            "verbs": [
                                                "get"
                                            ]
                                        },
                                        "imagestreamimports": {
                                            "name": "imagestreamimports",
                                            "namespaced": true,
                                            "kind": "ImageStreamImport",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "imagestreammappings": {
                                            "name": "imagestreammappings",
                                            "namespaced": true,
                                            "kind": "ImageStreamMapping",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "imagestreams": {
                                            "name": "imagestreams",
                                            "namespaced": true,
                                            "kind": "ImageStream",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "imagestreams/secrets": {
                                            "name": "imagestreams/secrets",
                                            "namespaced": true,
                                            "kind": "SecretList",
                                            "verbs": [
                                                "get"
                                            ]
                                        },
                                        "imagestreams/status": {
                                            "name": "imagestreams/status",
                                            "namespaced": true,
                                            "kind": "ImageStream",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "imagestreamtags": {
                                            "name": "imagestreamtags",
                                            "namespaced": true,
                                            "kind": "ImageStreamTag",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "apps.openshift.io": {
                            "name": "apps.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "apps.openshift.io/v1",
                                    "resources": {
                                        "deploymentconfigs": {
                                            "name": "deploymentconfigs",
                                            "namespaced": true,
                                            "kind": "DeploymentConfig",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "deploymentconfigs/instantiate": {
                                            "name": "deploymentconfigs/instantiate",
                                            "namespaced": true,
                                            "kind": "DeploymentRequest",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "deploymentconfigs/log": {
                                            "name": "deploymentconfigs/log",
                                            "namespaced": true,
                                            "kind": "DeploymentLog",
                                            "verbs": [
                                                "get"
                                            ]
                                        },
                                        "deploymentconfigs/rollback": {
                                            "name": "deploymentconfigs/rollback",
                                            "namespaced": true,
                                            "kind": "DeploymentConfigRollback",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "deploymentconfigs/scale": {
                                            "name": "deploymentconfigs/scale",
                                            "namespaced": true,
                                            "kind": "Scale",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "deploymentconfigs/status": {
                                            "name": "deploymentconfigs/status",
                                            "namespaced": true,
                                            "kind": "DeploymentConfig",
                                            "verbs": [
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "template.openshift.io": {
                            "name": "template.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "template.openshift.io/v1",
                                    "resources": {
                                        "processedtemplates": {
                                            "name": "processedtemplates",
                                            "namespaced": true,
                                            "kind": "Template",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "templates": {
                                            "name": "templates",
                                            "namespaced": true,
                                            "kind": "Template",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "security.openshift.io": {
                            "name": "security.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "security.openshift.io/v1",
                                    "resources": {
                                        "podsecuritypolicyreviews": {
                                            "name": "podsecuritypolicyreviews",
                                            "namespaced": true,
                                            "kind": "PodSecurityPolicyReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "podsecuritypolicyselfsubjectreviews": {
                                            "name": "podsecuritypolicyselfsubjectreviews",
                                            "namespaced": true,
                                            "kind": "PodSecurityPolicySelfSubjectReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "podsecuritypolicysubjectreviews": {
                                            "name": "podsecuritypolicysubjectreviews",
                                            "namespaced": true,
                                            "kind": "PodSecurityPolicySubjectReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "securitycontextconstraints": {
                                            "name": "securitycontextconstraints",
                                            "namespaced": false,
                                            "kind": "SecurityContextConstraints",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ],
                                            "shortNames": [
                                                "scc"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "build.openshift.io": {
                            "name": "build.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "build.openshift.io/v1",
                                    "resources": {
                                        "buildconfigs": {
                                            "name": "buildconfigs",
                                            "namespaced": true,
                                            "kind": "BuildConfig",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "buildconfigs/instantiate": {
                                            "name": "buildconfigs/instantiate",
                                            "namespaced": true,
                                            "kind": "BuildRequest",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "buildconfigs/instantiatebinary": {
                                            "name": "buildconfigs/instantiatebinary",
                                            "namespaced": true,
                                            "kind": "BinaryBuildRequestOptions",
                                            "verbs": []
                                        },
                                        "buildconfigs/webhooks": {
                                            "name": "buildconfigs/webhooks",
                                            "namespaced": true,
                                            "kind": "Build",
                                            "verbs": []
                                        },
                                        "builds": {
                                            "name": "builds",
                                            "namespaced": true,
                                            "kind": "Build",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "builds/clone": {
                                            "name": "builds/clone",
                                            "namespaced": true,
                                            "kind": "BuildRequest",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "builds/details": {
                                            "name": "builds/details",
                                            "namespaced": true,
                                            "kind": "Build",
                                            "verbs": [
                                                "update"
                                            ]
                                        },
                                        "builds/log": {
                                            "name": "builds/log",
                                            "namespaced": true,
                                            "kind": "BuildLog",
                                            "verbs": [
                                                "get"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "network.openshift.io": {
                            "name": "network.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "network.openshift.io/v1",
                                    "resources": {
                                        "clusternetworks": {
                                            "name": "clusternetworks",
                                            "namespaced": false,
                                            "kind": "ClusterNetwork",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "egressnetworkpolicies": {
                                            "name": "egressnetworkpolicies",
                                            "namespaced": true,
                                            "kind": "EgressNetworkPolicy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "hostsubnets": {
                                            "name": "hostsubnets",
                                            "namespaced": false,
                                            "kind": "HostSubnet",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "netnamespaces": {
                                            "name": "netnamespaces",
                                            "namespaced": false,
                                            "kind": "NetNamespace",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "user.openshift.io": {
                            "name": "user.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "user.openshift.io/v1",
                                    "resources": {
                                        "groups": {
                                            "name": "groups",
                                            "namespaced": false,
                                            "kind": "Group",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "identities": {
                                            "name": "identities",
                                            "namespaced": false,
                                            "kind": "Identity",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "useridentitymappings": {
                                            "name": "useridentitymappings",
                                            "namespaced": false,
                                            "kind": "UserIdentityMapping",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "users": {
                                            "name": "users",
                                            "namespaced": false,
                                            "kind": "User",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "authorization.openshift.io": {
                            "name": "authorization.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "authorization.openshift.io/v1",
                                    "resources": {
                                        "clusterpolicies": {
                                            "name": "clusterpolicies",
                                            "namespaced": false,
                                            "kind": "ClusterPolicy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "clusterpolicybindings": {
                                            "name": "clusterpolicybindings",
                                            "namespaced": false,
                                            "kind": "ClusterPolicyBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "clusterrolebindings": {
                                            "name": "clusterrolebindings",
                                            "namespaced": false,
                                            "kind": "ClusterRoleBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "clusterroles": {
                                            "name": "clusterroles",
                                            "namespaced": false,
                                            "kind": "ClusterRole",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "localresourceaccessreviews": {
                                            "name": "localresourceaccessreviews",
                                            "namespaced": true,
                                            "kind": "LocalResourceAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "localsubjectaccessreviews": {
                                            "name": "localsubjectaccessreviews",
                                            "namespaced": true,
                                            "kind": "LocalSubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "policies": {
                                            "name": "policies",
                                            "namespaced": true,
                                            "kind": "Policy",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "policybindings": {
                                            "name": "policybindings",
                                            "namespaced": true,
                                            "kind": "PolicyBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "resourceaccessreviews": {
                                            "name": "resourceaccessreviews",
                                            "namespaced": true,
                                            "kind": "ResourceAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "rolebindingrestrictions": {
                                            "name": "rolebindingrestrictions",
                                            "namespaced": true,
                                            "kind": "RoleBindingRestriction",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "rolebindings": {
                                            "name": "rolebindings",
                                            "namespaced": true,
                                            "kind": "RoleBinding",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "roles": {
                                            "name": "roles",
                                            "namespaced": true,
                                            "kind": "Role",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "get",
                                                "list",
                                                "patch",
                                                "update"
                                            ]
                                        },
                                        "selfsubjectrulesreviews": {
                                            "name": "selfsubjectrulesreviews",
                                            "namespaced": true,
                                            "kind": "SelfSubjectRulesReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "subjectaccessreviews": {
                                            "name": "subjectaccessreviews",
                                            "namespaced": true,
                                            "kind": "SubjectAccessReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        },
                                        "subjectrulesreviews": {
                                            "name": "subjectrulesreviews",
                                            "namespaced": true,
                                            "kind": "SubjectRulesReview",
                                            "verbs": [
                                                "create"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        },
                        "oauth.openshift.io": {
                            "name": "oauth.openshift.io",
                            "preferredVersion": "v1",
                            "versions": {
                                "v1": {
                                    "version": "v1",
                                    "groupVersion": "oauth.openshift.io/v1",
                                    "resources": {
                                        "oauthaccesstokens": {
                                            "name": "oauthaccesstokens",
                                            "namespaced": false,
                                            "kind": "OAuthAccessToken",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "oauthauthorizetokens": {
                                            "name": "oauthauthorizetokens",
                                            "namespaced": false,
                                            "kind": "OAuthAuthorizeToken",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "oauthclientauthorizations": {
                                            "name": "oauthclientauthorizations",
                                            "namespaced": false,
                                            "kind": "OAuthClientAuthorization",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        },
                                        "oauthclients": {
                                            "name": "oauthclients",
                                            "namespaced": false,
                                            "kind": "OAuthClient",
                                            "verbs": [
                                                "create",
                                                "delete",
                                                "deletecollection",
                                                "get",
                                                "list",
                                                "patch",
                                                "update",
                                                "watch"
                                            ]
                                        }
                                    }
                                }
                            },
                            "hostPrefix": null
                        }
                    }
                },
                api: {
                    "openshift": {
                        "hostPort": "127.0.0.1:8080",
                        "prefix": "/oapi",
                        "resources": {
                            "v1": {
                                "appliedclusterresourcequotas": {
                                    "name": "appliedclusterresourcequotas",
                                    "namespaced": true,
                                    "kind": "AppliedClusterResourceQuota",
                                    "verbs": [
                                        "get",
                                        "list"
                                    ]
                                },
                                "buildconfigs": {
                                    "name": "buildconfigs",
                                    "namespaced": true,
                                    "kind": "BuildConfig",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "buildconfigs/instantiate": {
                                    "name": "buildconfigs/instantiate",
                                    "namespaced": true,
                                    "kind": "BuildRequest",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "buildconfigs/instantiatebinary": {
                                    "name": "buildconfigs/instantiatebinary",
                                    "namespaced": true,
                                    "kind": "BinaryBuildRequestOptions",
                                    "verbs": []
                                },
                                "buildconfigs/webhooks": {
                                    "name": "buildconfigs/webhooks",
                                    "namespaced": true,
                                    "kind": "Build",
                                    "verbs": []
                                },
                                "builds": {
                                    "name": "builds",
                                    "namespaced": true,
                                    "kind": "Build",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "builds/clone": {
                                    "name": "builds/clone",
                                    "namespaced": true,
                                    "kind": "BuildRequest",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "builds/details": {
                                    "name": "builds/details",
                                    "namespaced": true,
                                    "kind": "Build",
                                    "verbs": [
                                        "update"
                                    ]
                                },
                                "builds/log": {
                                    "name": "builds/log",
                                    "namespaced": true,
                                    "kind": "BuildLog",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "clusternetworks": {
                                    "name": "clusternetworks",
                                    "namespaced": false,
                                    "kind": "ClusterNetwork",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "clusterpolicies": {
                                    "name": "clusterpolicies",
                                    "namespaced": false,
                                    "kind": "ClusterPolicy",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "clusterpolicybindings": {
                                    "name": "clusterpolicybindings",
                                    "namespaced": false,
                                    "kind": "ClusterPolicyBinding",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "clusterresourcequotas": {
                                    "name": "clusterresourcequotas",
                                    "namespaced": false,
                                    "kind": "ClusterResourceQuota",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "clusterresourcequotas/status": {
                                    "name": "clusterresourcequotas/status",
                                    "namespaced": false,
                                    "kind": "ClusterResourceQuota",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "clusterrolebindings": {
                                    "name": "clusterrolebindings",
                                    "namespaced": false,
                                    "kind": "ClusterRoleBinding",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "clusterroles": {
                                    "name": "clusterroles",
                                    "namespaced": false,
                                    "kind": "ClusterRole",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "deploymentconfigrollbacks": {
                                    "name": "deploymentconfigrollbacks",
                                    "namespaced": true,
                                    "kind": "DeploymentConfigRollback",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "deploymentconfigs": {
                                    "name": "deploymentconfigs",
                                    "namespaced": true,
                                    "kind": "DeploymentConfig",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "deploymentconfigs/instantiate": {
                                    "name": "deploymentconfigs/instantiate",
                                    "namespaced": true,
                                    "kind": "DeploymentRequest",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "deploymentconfigs/log": {
                                    "name": "deploymentconfigs/log",
                                    "namespaced": true,
                                    "kind": "DeploymentLog",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "deploymentconfigs/rollback": {
                                    "name": "deploymentconfigs/rollback",
                                    "namespaced": true,
                                    "kind": "DeploymentConfigRollback",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "deploymentconfigs/scale": {
                                    "name": "deploymentconfigs/scale",
                                    "namespaced": true,
                                    "kind": "Scale",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "deploymentconfigs/status": {
                                    "name": "deploymentconfigs/status",
                                    "namespaced": true,
                                    "kind": "DeploymentConfig",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "egressnetworkpolicies": {
                                    "name": "egressnetworkpolicies",
                                    "namespaced": true,
                                    "kind": "EgressNetworkPolicy",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "generatedeploymentconfigs": {
                                    "name": "generatedeploymentconfigs",
                                    "namespaced": true,
                                    "kind": "DeploymentConfig",
                                    "verbs": []
                                },
                                "groups": {
                                    "name": "groups",
                                    "namespaced": false,
                                    "kind": "Group",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "hostsubnets": {
                                    "name": "hostsubnets",
                                    "namespaced": false,
                                    "kind": "HostSubnet",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "identities": {
                                    "name": "identities",
                                    "namespaced": false,
                                    "kind": "Identity",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "images": {
                                    "name": "images",
                                    "namespaced": false,
                                    "kind": "Image",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "imagesignatures": {
                                    "name": "imagesignatures",
                                    "namespaced": false,
                                    "kind": "ImageSignature",
                                    "verbs": [
                                        "create",
                                        "delete"
                                    ]
                                },
                                "imagestreamimages": {
                                    "name": "imagestreamimages",
                                    "namespaced": true,
                                    "kind": "ImageStreamImage",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "imagestreamimports": {
                                    "name": "imagestreamimports",
                                    "namespaced": true,
                                    "kind": "ImageStreamImport",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "imagestreammappings": {
                                    "name": "imagestreammappings",
                                    "namespaced": true,
                                    "kind": "ImageStreamMapping",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "imagestreams": {
                                    "name": "imagestreams",
                                    "namespaced": true,
                                    "kind": "ImageStream",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "imagestreams/secrets": {
                                    "name": "imagestreams/secrets",
                                    "namespaced": true,
                                    "kind": "SecretList",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "imagestreams/status": {
                                    "name": "imagestreams/status",
                                    "namespaced": true,
                                    "kind": "ImageStream",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "imagestreamtags": {
                                    "name": "imagestreamtags",
                                    "namespaced": true,
                                    "kind": "ImageStreamTag",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "localresourceaccessreviews": {
                                    "name": "localresourceaccessreviews",
                                    "namespaced": true,
                                    "kind": "LocalResourceAccessReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "localsubjectaccessreviews": {
                                    "name": "localsubjectaccessreviews",
                                    "namespaced": true,
                                    "kind": "LocalSubjectAccessReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "netnamespaces": {
                                    "name": "netnamespaces",
                                    "namespaced": false,
                                    "kind": "NetNamespace",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "oauthaccesstokens": {
                                    "name": "oauthaccesstokens",
                                    "namespaced": false,
                                    "kind": "OAuthAccessToken",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "oauthauthorizetokens": {
                                    "name": "oauthauthorizetokens",
                                    "namespaced": false,
                                    "kind": "OAuthAuthorizeToken",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "oauthclientauthorizations": {
                                    "name": "oauthclientauthorizations",
                                    "namespaced": false,
                                    "kind": "OAuthClientAuthorization",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "oauthclients": {
                                    "name": "oauthclients",
                                    "namespaced": false,
                                    "kind": "OAuthClient",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "podsecuritypolicyreviews": {
                                    "name": "podsecuritypolicyreviews",
                                    "namespaced": true,
                                    "kind": "PodSecurityPolicyReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "podsecuritypolicyselfsubjectreviews": {
                                    "name": "podsecuritypolicyselfsubjectreviews",
                                    "namespaced": true,
                                    "kind": "PodSecurityPolicySelfSubjectReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "podsecuritypolicysubjectreviews": {
                                    "name": "podsecuritypolicysubjectreviews",
                                    "namespaced": true,
                                    "kind": "PodSecurityPolicySubjectReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "policies": {
                                    "name": "policies",
                                    "namespaced": true,
                                    "kind": "Policy",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "policybindings": {
                                    "name": "policybindings",
                                    "namespaced": true,
                                    "kind": "PolicyBinding",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "processedtemplates": {
                                    "name": "processedtemplates",
                                    "namespaced": true,
                                    "kind": "Template",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "projectrequests": {
                                    "name": "projectrequests",
                                    "namespaced": false,
                                    "kind": "ProjectRequest",
                                    "verbs": [
                                        "create",
                                        "list"
                                    ]
                                },
                                "projects": {
                                    "name": "projects",
                                    "namespaced": false,
                                    "kind": "Project",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "resourceaccessreviews": {
                                    "name": "resourceaccessreviews",
                                    "namespaced": true,
                                    "kind": "ResourceAccessReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "rolebindingrestrictions": {
                                    "name": "rolebindingrestrictions",
                                    "namespaced": true,
                                    "kind": "RoleBindingRestriction",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "rolebindings": {
                                    "name": "rolebindings",
                                    "namespaced": true,
                                    "kind": "RoleBinding",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "roles": {
                                    "name": "roles",
                                    "namespaced": true,
                                    "kind": "Role",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "routes": {
                                    "name": "routes",
                                    "namespaced": true,
                                    "kind": "Route",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "routes/status": {
                                    "name": "routes/status",
                                    "namespaced": true,
                                    "kind": "Route",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "selfsubjectrulesreviews": {
                                    "name": "selfsubjectrulesreviews",
                                    "namespaced": true,
                                    "kind": "SelfSubjectRulesReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "subjectaccessreviews": {
                                    "name": "subjectaccessreviews",
                                    "namespaced": true,
                                    "kind": "SubjectAccessReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "subjectrulesreviews": {
                                    "name": "subjectrulesreviews",
                                    "namespaced": true,
                                    "kind": "SubjectRulesReview",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "templates": {
                                    "name": "templates",
                                    "namespaced": true,
                                    "kind": "Template",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "useridentitymappings": {
                                    "name": "useridentitymappings",
                                    "namespaced": false,
                                    "kind": "UserIdentityMapping",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "users": {
                                    "name": "users",
                                    "namespaced": false,
                                    "kind": "User",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                }
                            }
                        }
                    },
                    "k8s": {
                        "hostPort": "127.0.0.1:8080",
                        "prefix": "/api",
                        "resources": {
                            "v1": {
                                "bindings": {
                                    "name": "bindings",
                                    "namespaced": true,
                                    "kind": "Binding",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "componentstatuses": {
                                    "name": "componentstatuses",
                                    "namespaced": false,
                                    "kind": "ComponentStatus",
                                    "verbs": [
                                        "get",
                                        "list"
                                    ],
                                    "shortNames": [
                                        "cs"
                                    ]
                                },
                                "configmaps": {
                                    "name": "configmaps",
                                    "namespaced": true,
                                    "kind": "ConfigMap",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "cm"
                                    ]
                                },
                                "endpoints": {
                                    "name": "endpoints",
                                    "namespaced": true,
                                    "kind": "Endpoints",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "ep"
                                    ]
                                },
                                "events": {
                                    "name": "events",
                                    "namespaced": true,
                                    "kind": "Event",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "ev"
                                    ]
                                },
                                "limitranges": {
                                    "name": "limitranges",
                                    "namespaced": true,
                                    "kind": "LimitRange",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "limits"
                                    ]
                                },
                                "namespaces": {
                                    "name": "namespaces",
                                    "namespaced": false,
                                    "kind": "Namespace",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "ns"
                                    ]
                                },
                                "namespaces/finalize": {
                                    "name": "namespaces/finalize",
                                    "namespaced": false,
                                    "kind": "Namespace",
                                    "verbs": [
                                        "update"
                                    ]
                                },
                                "namespaces/status": {
                                    "name": "namespaces/status",
                                    "namespaced": false,
                                    "kind": "Namespace",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "nodes": {
                                    "name": "nodes",
                                    "namespaced": false,
                                    "kind": "Node",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "proxy",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "no"
                                    ]
                                },
                                "nodes/proxy": {
                                    "name": "nodes/proxy",
                                    "namespaced": false,
                                    "kind": "Node",
                                    "verbs": []
                                },
                                "nodes/status": {
                                    "name": "nodes/status",
                                    "namespaced": false,
                                    "kind": "Node",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "persistentvolumeclaims": {
                                    "name": "persistentvolumeclaims",
                                    "namespaced": true,
                                    "kind": "PersistentVolumeClaim",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "pvc"
                                    ]
                                },
                                "persistentvolumeclaims/status": {
                                    "name": "persistentvolumeclaims/status",
                                    "namespaced": true,
                                    "kind": "PersistentVolumeClaim",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "persistentvolumes": {
                                    "name": "persistentvolumes",
                                    "namespaced": false,
                                    "kind": "PersistentVolume",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "pv"
                                    ]
                                },
                                "persistentvolumes/status": {
                                    "name": "persistentvolumes/status",
                                    "namespaced": false,
                                    "kind": "PersistentVolume",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "pods": {
                                    "name": "pods",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "proxy",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "po"
                                    ]
                                },
                                "pods/attach": {
                                    "name": "pods/attach",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": []
                                },
                                "pods/binding": {
                                    "name": "pods/binding",
                                    "namespaced": true,
                                    "kind": "Binding",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "pods/eviction": {
                                    "name": "pods/eviction",
                                    "namespaced": true,
                                    "kind": "Eviction",
                                    "verbs": [
                                        "create"
                                    ]
                                },
                                "pods/exec": {
                                    "name": "pods/exec",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": []
                                },
                                "pods/log": {
                                    "name": "pods/log",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": [
                                        "get"
                                    ]
                                },
                                "pods/portforward": {
                                    "name": "pods/portforward",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": []
                                },
                                "pods/proxy": {
                                    "name": "pods/proxy",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": []
                                },
                                "pods/status": {
                                    "name": "pods/status",
                                    "namespaced": true,
                                    "kind": "Pod",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "podtemplates": {
                                    "name": "podtemplates",
                                    "namespaced": true,
                                    "kind": "PodTemplate",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "replicationcontrollers": {
                                    "name": "replicationcontrollers",
                                    "namespaced": true,
                                    "kind": "ReplicationController",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "rc"
                                    ]
                                },
                                "replicationcontrollers/scale": {
                                    "name": "replicationcontrollers/scale",
                                    "namespaced": true,
                                    "kind": "Scale",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "replicationcontrollers/status": {
                                    "name": "replicationcontrollers/status",
                                    "namespaced": true,
                                    "kind": "ReplicationController",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "resourcequotas": {
                                    "name": "resourcequotas",
                                    "namespaced": true,
                                    "kind": "ResourceQuota",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "quota"
                                    ]
                                },
                                "resourcequotas/status": {
                                    "name": "resourcequotas/status",
                                    "namespaced": true,
                                    "kind": "ResourceQuota",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                },
                                "secrets": {
                                    "name": "secrets",
                                    "namespaced": true,
                                    "kind": "Secret",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "securitycontextconstraints": {
                                    "name": "securitycontextconstraints",
                                    "namespaced": false,
                                    "kind": "SecurityContextConstraints",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "scc"
                                    ]
                                },
                                "serviceaccounts": {
                                    "name": "serviceaccounts",
                                    "namespaced": true,
                                    "kind": "ServiceAccount",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "deletecollection",
                                        "get",
                                        "list",
                                        "patch",
                                        "update",
                                        "watch"
                                    ],
                                    "shortNames": [
                                        "sa"
                                    ]
                                },
                                "services": {
                                    "name": "services",
                                    "namespaced": true,
                                    "kind": "Service",
                                    "verbs": [
                                        "create",
                                        "delete",
                                        "get",
                                        "list",
                                        "patch",
                                        "proxy",
                                        "update",
                                        "watch"
                                    ]
                                },
                                "services/proxy": {
                                    "name": "services/proxy",
                                    "namespaced": true,
                                    "kind": "Service",
                                    "verbs": []
                                },
                                "services/status": {
                                    "name": "services/status",
                                    "namespaced": true,
                                    "kind": "Service",
                                    "verbs": [
                                        "get",
                                        "patch",
                                        "update"
                                    ]
                                }
                            }
                        }
                    }
                }
            };

            window.OPENSHIFT_VERSION = {
                openshift: "dev-mode",
                kubernetes: "dev-mode"
            };
            $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
                $rootScope.transfering = true;



            });

            $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
                //更新header标题
                if (navigator.userAgent.indexOf("Firefox") > 0) {
                    // console.log('dasd');
                    $(document).unbind('DOMMouseScroll');


                    $(document).bind('DOMMouseScroll', function(e) {
                        //  console.log('detail', e.detail);
                        //  console.log(toState.name)
                        //console.log(e);

                        if (toState.name !== "home.index") {
                            if (e.detail > 0) {
                                window.scrollBy(0, 40);
                            } else {
                                window.scrollBy(0, -40);
                            }
                        }
                    })
                }
                if (toState.name !== 'login') {
                    //console.log('namespace',$rootScope.namespace);
                    //console.log('$state.params.namespace', $state.params.namespace);
                    if ($state.params.namespace) {
                        $rootScope.namespace = $state.params.namespace
                        Cookie.set('namespace', $rootScope.namespace, 10 * 365 * 24 * 3600 * 1000);
                    }
                }

                if (toState.name !== "home.index") {
                    $('html').css('overflow', 'auto');
                    $('.foot_main').css('display', 'block');

                    window.onmousewheel = document.onmousewheel = true;

                } else {
                    $('html').css('overflow', 'hidden');
                    $('.foot_main').css('display', 'none');
                    scrollTo(0, 0);

                }
                if (toState && $rootScope.namespace && $rootScope.region) {

                    //console.log('套餐', data);
                    //$rootScope.payment=data;
                    //account.get({namespace: $rootScope.namespace, region: $rootScope.region,status:"consuming"}, function (data) {
                    //    //console.log('套餐', data);
                    //
                    //    if (data.purchased) {
                    //        //跳转dashboard
                    //
                    //    } else {
                    //        //console.log('app90',toState);
                    //        if (toState&&toState.name) {
                    //            if (toState.name === 'console.plan' || toState.name === 'console.pay'|| toState.name === 'console.dashboard' || toState.name === 'console.noplan') {
                    //                //$rootScope.projects=false;
                    //                //alert(1)
                    //            }else {
                    //
                    //                $state.go('console.noplan');
                    //            }
                    //        }
                    //
                    //
                    //        //跳转购买套餐
                    //    }

                    //})


                    if (toState.name === 'console.plan' || toState.name === 'console.pay' || toState.name === 'console.noplan') {
                        //$rootScope.projects=false;
                        //alert(1)
                        $rootScope.showsidebar = false;
                        $('#sidebar-right-fixed').css("marginLeft", 0)
                    } else {
                        $rootScope.showsidebar = true;
                        $('#sidebar-right-fixed').css("marginLeft", 188)
                    }

                    //跳转购买套餐


                }
                if (toState && toState.name) {
                    $rootScope.console.state = toState.name;
                    $rootScope.transfering = false;
                }

            });
        }
    ]);

    return DataFoundry;
});