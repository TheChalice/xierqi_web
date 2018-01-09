'use strict';
angular.module('console.deployments', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('DeploymentsCtrl', ['$rootScope', '$scope', 'replicas', 'mydcs', '$filter','mydeployment',
        function($rootScope, $scope, replicas, mydcs, $filter,mydeployment) {

            //$scope.mydeploylist=angular.copy(mydeployment)
            console.log(mydeployment,mydcs);
            $scope.items=addrc(mydcs)
            $scope.mydeploylist= addrc(mydeployment)
            $scope.text = "No deployments have been added to project " + $scope.namespace + ".";

            function addrc(dc,items){
                if (dc.items) {
                    angular.forEach(dc.items, function(dc, i) {
                        angular.forEach(replicas.items, function(replica) {
                            if (dc.metadata.name === replica.metadata.ownerReferences[0].name) {
                                dc.rc = replica || {};
                                dc.rc.kind = "ReplicationController"
                            }
                        })
                    })
                    return angular.copy(dc.items);
                    console.log("$scope.items", items)
                }
            }

        }
    ]);