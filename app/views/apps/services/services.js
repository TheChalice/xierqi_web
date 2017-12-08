'use strict';
angular.module('console.services', [{
        files: [
            'components/searchbar/searchbar.js',
            'views/apps/services/services.css'
        ]
    }])
    .controller('ServicesCtrl', ['$rootScope', '$scope', '$log', '$state', '$stateParams', 'DeploymentConfig', 'ReplicationController', 'Route', 'BackingServiceInstance', 'GLOBAL', 'Confirm', 'Sort', 'Ws', 'Pod', 'Service',
        function($rootScope, $scope, $log, $state, $stateParams, DeploymentConfig, ReplicationController, Route, BackingServiceInstance, GLOBAL, Confirm, Sort, Ws, Pod, Service) {
            $(".service_close").on("click", function() {
                $(".sevice_alert_jia").slideUp();
            });

            Service.get({ namespace: $scope.namespace }, function(res) {
                $scope.items = res.items;
                console.log('$scope.items', $scope.items)
            })
        }
    ]);