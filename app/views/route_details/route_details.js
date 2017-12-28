'use strict';
angular.module('console.routes', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('RouteDetailCtrl', ['$scope', 'Route', 'routeDetails', 'services', 'Cookie',
        function($scope, Route, routeDetails, services, Cookie) {
            $scope.text = "No routes have been added to project " + $scope.namespace + ".";
            if (routeDetails) {
                $scope.route = routeDetails;
                $scope.services = {};

                function getService(routeToNm, serviceList) {
                    for (let i = 0; i < serviceList.length; i++) {
                        if (routeToNm === serviceList[i].metadata.name) {
                            return serviceList[i];
                        }
                    }
                }
                if (services && services.items && routeDetails.spec.to.kind === 'Service') {
                    $scope.services = getService(routeDetails.spec.to.name, services.items);
                }

            }
            let deleteRoute = () => {
                Route.delete({ namespace: $scope.route.metadata.namespace, name: $scope.route.metadata.name, region: Cookie.get('region') }, )
            }
            $scope.delete = () => {
                if ($scope.route) {
                    deleteRoute();
                }
            };


        }
    ]);