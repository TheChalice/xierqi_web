'use strict';
angular.module('console.services', [
        'kubernetesUI',
        {
            files: [
                'views/service_details/service_details.css',
                'components/datepick/datepick.js',
                'components/checkbox/checkbox.js'
            ]
        }
    ])
    .controller('ServicesDetailCtrl', ['$scope', 'serviceDetails', 'Service', 'routes', 'pods', 'endpoints', 'Cookie',
        function($scope, serviceDetails, Service, routes, pods, endpoints, Cookie) {
            $scope.text = "No routes have been added to project " + $scope.namespace + ".";

            if (serviceDetails) {
                $scope.service = serviceDetails;
                $scope.routesForService = {};
                $scope.podsForService = {};
                $scope.portsByRoute = {};
                $scope.podsWithEndpoints = {};
                $scope.podFailureReasons = {
                    "Pending": "This pod will not receive traffic until all of its containers have been created."
                };

                function getPodsForService(podsList) {
                    if (!$scope.service.spec.selector) return;
                    _.each(podsList, pod => {
                        let podForService = _.filter([pod.metadata.labels], _.matches($scope.service.spec.selector)) || [];
                        if (podForService.length !== 0) {
                            $scope.podsForService[pod.metadata.name] = pod;
                        }
                    })
                }

                function getRoutesForService(routesList) {
                    angular.forEach(routesList, route => {
                        if (route.spec.to.kind === "Service" &&
                            route.spec.to.name === $scope.service.metadata.name) {
                            $scope.routesForService[route.metadata.name] = route;
                        }
                    });
                };

                function getPortsByRoute() {
                    _.each($scope.service.spec.ports, port => {
                        var reachedByRoute = false;
                        if (port.nodePort) {
                            $scope.showNodePorts = true;
                        }
                        _.each($scope.routesForService, route => {
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
                    });
                };
                if (routes) {
                    getRoutesForService(routes.items);
                    getPortsByRoute();
                }
                if (pods) {
                    getPodsForService(pods.items);
                    if (endpoints) {
                        _.each(endpoints.items, svcEndpoint => {
                            if (svcEndpoint.metadata.name === $scope.service.metadata.name) {
                                _.each(svcEndpoint.subsets, subset => {
                                    _.each(subset.addresses, address => {
                                        if (_.get(address, "targetRef.kind") === "Pod") {
                                            $scope.podsWithEndpoints[address.targetRef.name] = true;
                                        }
                                    });
                                });
                            }
                        });
                    }
                }
                let deleteService = () => {
                    Service.delete({ namespace: $scope.service.metadata.namespace, name: $scope.service.metadata.name, region: Cookie.get('region') }, )
                }
                $scope.delete = () => {
                    if ($scope.service) {
                        deleteService();
                    }
                };

            }
        }
    ]);