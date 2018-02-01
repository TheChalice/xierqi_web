'use strict';
angular.module('console.routes', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('RouteDetailCtrl', ['$state','$scope', 'Route', 'routeDetails', 'services', 'Cookie','Confirm','delTip','toastr',
        function($state,$scope, Route, routeDetails, services, Cookie,Confirm,delTip,toastr) {
            $scope.text = "No routes have been added to project " + $scope.namespace + ".";
            if (routeDetails) {
                $scope.route = routeDetails;
                $scope.services = {};

               var getService =  function getService(routeToNm, serviceList) {
                    for (var i = 0; i < serviceList.length; i++) {
                        if (routeToNm === serviceList[i].metadata.name) {
                            return serviceList[i];
                        }
                    }
                }
                if (services && services.items && routeDetails.spec.to.kind === 'Service') {
                    $scope.services = getService(routeDetails.spec.to.name, services.items);
                }

            }
            var deleteRoute = function (val)  {
                Route.delete({ namespace: $scope.route.metadata.namespace, name: $scope.route.metadata.name, region: Cookie.get('region') },function(){
                    toastr.success('操作成功');
                    $state.go('console.routes')
                },function(){
                    Confirm.open("删除Route", "删除"+val+"失败", null, null,true);
                    toastr.error('操作失败');
                } )
            }
            $scope.delete =function (val) {
                if ($scope.route) {
                    delTip.open("删除Route", val, true).then(function(){
                        deleteRoute(val);
                    })

                }
            };


        }
    ]);