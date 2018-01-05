'use strict';
angular.module('console.deployments', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/apps.css'
        ]
    }])
    .controller('DeploymentsCtrl', ['$rootScope', '$scope', 'replicas', 'dc', '$filter',
        function($rootScope, $scope, replicas, dc, $filter) {
            console.log("$scope.namespace ", $scope.namespace)
            $scope.text = "No deployments have been added to project " + $scope.namespace + ".";
            if (dc.items) {
                angular.forEach(dc.items, function(dc, i) {
                    angular.forEach(replicas.items, function(replica) {
                        if (dc.metadata.name === replica.metadata.ownerReferences[0].name) {
                            dc.rc = replica || {};
                            dc.rc.kind = "ReplicationController"
                        }
                    })
                })
                $scope.items = dc.items;
                console.log("$scope.items", $scope.items)
            }
            $scope.showOrderingPanel = function(panelName) {
                $scope.orderingPanelVisible = true;
                console.log('------------------------> panelName', panelName)
                $scope.orderKind = panelName;
            };
        }
    ]);