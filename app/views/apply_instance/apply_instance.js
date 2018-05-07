'use strict';
angular.module('console.apply_instance', [
        {
            files: [
                'views/apply_instance/apply_instance.css'
            ]
        }
    ])
    .controller('ApplyInstanceCtrl', ['Tip','market','checkout', 'Modalbs', '$log', '$rootScope', '$scope', 'BackingService', 'BackingServiceInstance', '$stateParams', '$state',
        function (Tip,market,checkout, Modalbs, $log, $rootScope, $scope, BackingService, BackingServiceInstance, $stateParams, $state) {

            $scope.grid = {
                checked: 0,
                error: false
            };

            $scope.bsi = {
                metadata: {
                    name: ''
                },
                spec: {
                    provisioning: {
                        backingservice_name: '',
                        backingservice_spec_id: '',
                        backingservice_plan_guid: ''
                    }
                }
            };
            $scope.bsName = $stateParams.name;
            var cuename = $stateParams.name;
            BackingService.get({namespace: 'openshift', name: cuename, region: $rootScope.region}, function (data) {

                $scope.data=data.spec.plans;
                //console.log('data', data.spec.plans);
                $scope.bsi.spec.provisioning.backingservice_name=data.metadata.name
                $scope.bsi.spec.provisioning.backingservice_spec_id=data.spec.id
                $scope.bsi.spec.provisioning.backingservice_plan_guid=data.spec.plans[0].id
            })
            BackingServiceInstance.get({
                namespace: $rootScope.namespace,
                region: $rootScope.region
            }, function (res) {
                console.log('bsi',res.items);
                $scope.bsinamearr=res.items;
                //angular.forEach(res.items, function (item,i) {
                //    $scope.bsinamearr.push(item.metadata.name)
                //});

            })
            $scope.namerr = {
                nil: false,
                rexed: false,
                repeated: false
            }
            $scope.nameblur = function () {
                //console.log($scope.buildConfig.metadata.name);
                if (!$scope.bsi.metadata.name) {
                    $scope.namerr.nil = true
                } else {
                    $scope.namerr.nil = false
                }
            }
            $scope.namefocus = function () {
                $scope.namerr.nil = false
            }


            var r =/^[a-z][a-z0-9-]{2,28}[a-z0-9]$/;
            $scope.$watch('bsi.metadata.name', function (n, o) {
                if (n === o) {
                    return;
                }
                if (n && n.length > 0) {
                    if (r.test(n)) {
                        $scope.namerr.rexed = false;
                        $scope.namerr.repeated=false;
                        if ($scope.bsinamearr) {
                            //console.log($scope.buildConfiglist);
                            angular.forEach($scope.bsinamearr, function (bsiname, i) {
                                //console.log(bsiname);
                                if (bsiname.metadata.name === n) {
                                    //console.log(bsiname,n);
                                    $scope.namerr.repeated = true;

                                }
                                //console.log($scope.namerr.repeated);
                            })
                        }

                    } else {
                        $scope.namerr.rexed = true;
                    }
                } else {
                    $scope.namerr.rexed = false;
                }
            })
            $scope.createInstance = function (name) {
                if (!$scope.namerr.nil && !$scope.namerr.rexed && !$scope.namerr.repeated) {

                }else {
                    return
                }
                //var plan = $scope.data[$scope.grid.checked];
                $scope.bsi.spec.provisioning.backingservice_plan_guid=$scope.data[$scope.grid.checked].id
                BackingServiceInstance.create({namespace: $rootScope.namespace,region:$rootScope.region}, $scope.bsi,function(){
                    $scope.grid.error=false
                    $log.info("build backing service instance success");
                    $state.go('console.backing_service_detail', {namespace:$rootScope.namespace,name: cuename, index:2})
                }, function (data) {
                    if (data.status === 409) {
                        $scope.grid.error=true
                    }
                })


            };

        }]);