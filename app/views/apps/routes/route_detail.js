'use strict';
angular.module('console.routes', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('RouteDetailCtrl', ['$scope', 'Route', 'route', 'services', 'Cookie',
        function($scope, Route, route, services, Cookie) {
            $scope.text = "No routes have been added to project " + $scope.namespace + ".";
            if (route) {
                $scope.route = route;
                $scope.services = {};

                function getService(routeToNm, serviceList) {
                    for (let i = 0; i < serviceList.length; i++) {
                        if (routeToNm === serviceList[i].metadata.name) {
                            return serviceList[i];
                        }
                    }
                }
                if (services && services.items && route.spec.to.kind === 'Service') {
                    $scope.services = getService(route.spec.to.name, services.items);
                }

            }
            let deleteRoute = () => {
                // Route.get({ namespace: $scope.namespace }, function(res) {
                //     console.log("ROUTE get", res);
                // })
                Route.delete({ namespace: $scope.route.metadata.namespace, name: $scope.route.metadata.name, region: Cookie.get('region') },
                    // res => {
                    //     console.log("deletRoute-yes", res);
                    // },
                    // res => {
                    //     console.log("deletRoute-no", res);
                    // }
                )
            }
            $scope.delete = () => {
                if ($scope.route) {
                    deleteRoute();
                }
            };


        }
    ]);