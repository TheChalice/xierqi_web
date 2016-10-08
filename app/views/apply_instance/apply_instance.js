'use strict';
angular.module('console.apply_instance', [
    {
        files: [
            'views/apply_instance/apply_instance.css'
        ]
    }
])
.controller('ApplyInstanceCtrl',['$log','$rootScope','$scope','BackingService', 'BackingServiceInstance', '$stateParams', '$state', function($log, $rootScope, $scope, BackingService, BackingServiceInstance, $stateParams, $state){

    $scope.grid = {
        checked: 0,
        error:false
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
    console.log('@@@test bsname', $stateParams.name);
    var loadBs = function(){
        console.log("$state", $stateParams.plan)
        BackingService.get({namespace:'openshift',name:$stateParams.name},function(data){
            $log.info('loadBs',data);
            $scope.data = data;
            $scope.bsi.spec.provisioning.backingservice_spec_id = data.spec.id;
            $scope.bsi.spec.provisioning.backingservice_name = data.metadata.name;
            var plans = data.spec.plans;
            for (var i = 0; i < plans.length; i++) {
                if (plans[i].name == $stateParams.plan) {
                    $scope.grid.checked = i;
                    console.log("==============", i)
                    break;
                }
            }
        })
    };
    loadBs();


     $scope.createInstance = function (name){
         var plan = $scope.data.spec.plans[$scope.grid.checked];
         $scope.bsi.spec.provisioning.backingservice_plan_guid = plan.id;
         $scope.bsi.spec.provisioning.backingservice_plan_name = plan.name;

         $log.info("BackingServiceInstance==",$scope.bsi);
         BackingServiceInstance.create({namespace: $rootScope.namespace}, $scope.bsi,function(){
             $scope.grid.error=false
             $log.info("build backing service instance success");
             $state.go('console.backing_service_detail', {name: $scope.data.metadata.name, index:2})
        }, function (data) {
             //console.log(data.status);
             //$log.info("build backing service instance error");
             if (data.status === 409) {
                 $scope.grid.error=true
             }
         })


    };

}]);