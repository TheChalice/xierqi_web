'use strict';
angular.module('console.apply_instance', [
    {
        files: [
            'views/apply_instance/apply_instance.css'
        ]
    }
])
.controller('ApplyInstanceCtrl',['$log','$rootScope','$scope','BackingService', 'BackingServiceInstance', '$stateParams', function($log, $rootScope, $scope, BackingService, BackingServiceInstance, $stateParams){

    $scope.grid = {
        checked: 0
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

    var loadBs = function(){
        BackingService.get({namespace:'openshift',name:$stateParams.name},function(data){
            $log.info('loadBs',data);
            $scope.data = data;
            $scope.bsi.spec.provisioning.backingservice_spec_id = data.spec.id;
            $scope.bsi.spec.provisioning.backingservice_name = data.metadata.name;

    })
    };
    loadBs();


     $scope.createInstance = function (name){
         var plan = $scope.data.spec.plans[$scope.grid.checked];

         $scope.bsi.spec.provisioning.backingservice_plan_guid = plan.id;
         $scope.bsi.spec.provisioning.backingservice_plan_name = plan.name;

         $log.info("BackingServiceInstance==",$scope.bsi);
         BackingServiceInstance.create({namespace: $rootScope.namespace}, $scope.bsi,function(){
             $log.info("build backing service instance success");
        })

    };

}]);