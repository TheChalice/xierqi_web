'use strict';
angular.module('console.service', [
    'kubernetesUI',
    {
        files: [
            'views/service_details/service_details.css',
            'components/datepick/datepick.js',
            'components/checkbox/checkbox.js'
        ]
    }
])
    .controller('ServicesDetailCtrl', ['$rootScope','$state','$scope', 'serviceDetails', 'Service', 'routes', 'pods', 'endpoints', 'Cookie',
        function ($rootScope,$state,$scope, serviceDetails, Service, routes, pods, endpoints, Cookie) {
            $scope.text = "无";
            $scope.routenamespace = Cookie.get('namespace')
            if (serviceDetails) {
                $scope.service = serviceDetails;
                $scope.routesForService = {};
                $scope.podsForService = {};
                $scope.portsByRoute = {};
                $scope.podsWithEndpoints = {};
                $scope.podFailureReasons = {
                    "Pending": "This pod will not receive traffic until all of its containers have been created."
                };
                $scope.editYaml = function () {
                    $state.go('console.edit_yaml_file',{namespace: $rootScope.namespace, name: $scope.service.metadata.name,kind: $scope.service.kind});
                };
                var getPodsForService = function (podsList) {
                    if (!$scope.service.spec.selector) return;

                    _.each(podsList, function (pod) {
                        var podForService = _.filter([pod.metadata.labels], _.matches($scope.service.spec.selector)) || [];
                        if (podForService.length !== 0) {
                            $scope.podsForService[pod.metadata.name] = pod;
                            // console.log("12312",$scope.podsForService)
                            var podsnum = Object.keys($scope.podsForService);
                            $scope.podsnum = podsnum.length
                        }
                    })

                }

                var getRoutesForService = function (routesList) {
                    angular.forEach(routesList, function (route) {
                        if (route.spec.to.kind === "Service" &&
                            route.spec.to.name === $scope.service.metadata.name) {
                            $scope.routesForService[route.metadata.name] = route;
                        }
                    });
                };

                var getPortsByRoute = function () {
                    _.each($scope.service.spec.ports, function (port) {
                        {
                            var reachedByRoute = false;
                            if (port.nodePort) {
                                $scope.showNodePorts = true;
                            }
                            _.each($scope.routesForService, function (route) {
                                if (!route.spec.port || route.spec.port.targetPort === port.name ||
                                    route.spec.port.targetPort === port.targetPort) {
                                    $scope.portsByRoute[route.metadata.name] = $scope.portsByRoute[route.metadata.name] || [];
                                    $scope.portsByRoute[route.metadata.name].push(port);
                                    reachedByRoute = true;
                                }
                            });

                            if (!reachedByRoute) {
                                $scope.portsByRoute[''] = $scope.portsByRoute[''] || [];
                                $scope.portsByRoute[''].push(port);
                            }
                        }
                    });
                };
                if (routes) {
                    getRoutesForService(routes.items);
                    getPortsByRoute();
                }
                if (pods) {
                    getPodsForService(pods.items);
                    if (endpoints) {
                        _.each(endpoints.items, function (svcEndpoint) {
                            if (svcEndpoint.metadata.name === $scope.service.metadata.name) {
                                _.each(svcEndpoint.subsets, function (subset) {
                                    _.each(subset.addresses, function (address) {
                                        if (_.get(address, "targetRef.kind") === "Pod") {
                                            $scope.podsWithEndpoints[address.targetRef.name] = true;
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
                var deleteService = function () {
                    Service.delete({
                        namespace: $scope.service.metadata.namespace,
                        name: $scope.service.metadata.name,
                        region: Cookie.get('region')
                    })
                };

                $scope.delete = function () {
                    if ($scope.service) {
                        deleteService();
                    }
                }

            }
        }
    ]);