'use strict';
angular.module('console.apply_instance', [
    {
        files: [
            'views/apply_instance/apply_instance.css'
        ]
    }
])
.controller('ApplyInstanceCtrl',['checkout','Modalbs','$log','$rootScope','$scope','BackingService', 'BackingServiceInstance', '$stateParams', '$state',
    function(checkout,Modalbs,$log, $rootScope, $scope, BackingService, BackingServiceInstance, $stateParams, $state){

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
    //console.log('@@@test bsname', $stateParams.name);
    var loadBs = function(){
        //console.log("$state", $stateParams.plan)
        BackingService.get({namespace:'openshift',name:$stateParams.name,region:$rootScope.region},function(data){
            $log.info('loadBs',data);
            $scope.data = data;
            $scope.bsi.spec.provisioning.backingservice_spec_id = data.spec.id;
            $scope.bsi.spec.provisioning.backingservice_name = data.metadata.name;
            var plans = data.spec.plans;
            for (var i = 0; i < plans.length; i++) {
                if (plans[i].name == $stateParams.plan) {
                    $scope.grid.checked = i;
                    //console.log("==============", i)
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
         Modalbs.open($scope.bsName,plan).then(function () {
             $log.info("BackingServiceInstance",$scope.bsi);

             checkout.create({
                 drytry:0,
                 plan_id: plan.id,
                 namespace: $rootScope.namespace,
                 region:$rootScope.region,
                 parameters:{
                     resource_name:$scope.bsi.metadata.name
                 }
             }, function (data) {
                 //console.log(data);
                 //volume.create({namespace: $rootScope.namespace}, $scope.volume, function (res) {
                 //    //alert(11111)
                 //    $scope.loaded = false;
                 //$state.go('console.resource_management', {index: 1});
                 $state.go('console.backing_service_detail', {name: $scope.data.metadata.name, index:2})
                 //}, function (err) {
                 //    $scope.loaded = false;
                 //    Toast.open('构建失败,请重试');
                 //})

             }, function (err) {
                 $scope.loaded = false;
                 if (err.data.code === 3316) {

                     Tip.open('提示', '账户可用余额不足。', '充值', true).then(function () {
                         $state.go('console.pay');
                     })
                 } else {

                     Tip.open('提示', '支付失败,请重试', '知道了', true).then(function () {

                     })
                 }

             })
             //BackingServiceInstance.create({namespace: $rootScope.namespace,region:$rootScope.region}, $scope.bsi,function(){
             //    $scope.grid.error=false
             //    $log.info("build backing service instance success");
             //    $state.go('console.backing_service_detail', {name: $scope.data.metadata.name, index:2})
             //}, function (data) {
             //    if (data.status === 409) {
             //        $scope.grid.error=true
             //    }
             //})
         })






    };

}]);