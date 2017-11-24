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
            //console.log('@@@test bsname', $stateParams.name);
            //var loadBs = function () {
            //    //console.log("$state", $stateParams.plan)
            //    market.get({region: $rootScope.region,belong:$scope.bsName}, function (data) {
            //        console.log('newdata', data);
            //        $scope.data=data.plans;
            //    })
            //
            //};
            //loadBs();
            var cuename = $stateParams.name;
            BackingService.get({namespace: 'openshift', name: cuename, region: $rootScope.region}, function (data) {
                //$log.info('价格', data);
                //
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
                    $state.go('console.backing_service_detail', {name: cuename, index:2})
                }, function (data) {
                    if (data.status === 409) {
                        $scope.grid.error=true
                    }
                })
                //Modalbs.open($scope.bsName, plan).then(function () {
                //    $log.info("BackingServiceInstance", $scope.bsi);
                //    $scope.applyloaded=true
                //checkout.create({
                //    drytry: 0,
                //    plan_id: plan.plan_id,
                //    namespace: $rootScope.namespace,
                //    region: $rootScope.region,
                //    parameters: {
                //        resource_name: $scope.bsi.metadata.name
                //    }
                //}, function (data) {
                //    $scope.applyloaded=false;
                //    //console.log(data);
                //    //volume.create({namespace: $rootScope.namespace}, $scope.volume, function (res) {
                //    //    //alert(11111)
                //    //    $scope.loaded = false;
                //    //$state.go('console.resource_management', {index: 1});
                //    $state.go('console.backing_service_detail', {name: $scope.bsName, index: 2})
                //    //}, function (err) {
                //    //    $scope.loaded = false;
                //    //    Toast.open('构建失败,请重试');
                //    //})
                //
                //}, function (err) {
                //    $scope.applyloaded=false
                //    if (err.data.code === 3316) {
                //
                //        Tip.open('提示', '账户可用余额不足。', '充值', true).then(function () {
                //            $state.go('console.pay');
                //        })
                //    } else {
                //
                //        Tip.open('提示', '支付失败,请重试', '知道了', true).then(function () {
                //
                //        })
                //    }
                //
                //})

                //})


            };

        }]);