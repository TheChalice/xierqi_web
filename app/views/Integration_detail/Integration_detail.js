'use strict';
angular.module('console.backing_service_detail', [
      {
        files: [
          'views/Integration_detail/Integration_detail.css'
        ]
      }
    ])
    .controller('IntegrationDetailCtrl', ['repository','$log', '$scope', '$rootScope', '$stateParams', 'BackingService', 'BackingServiceInstance', 'ServiceSelect', 'Confirm', 'BackingServiceInstanceBd', '$state', 'Toast', 'Ws'
          , function (repository,$log, $scope, $rootScope, $stateParams, BackingService, BackingServiceInstance, ServiceSelect, Confirm, BackingServiceInstanceBd, $state, Toast, Ws) {
        //console.log($stateParams.name);
            $scope.integrationname=$stateParams.name
        repository.get({reponame:$stateParams.name}, function (data) {
          console.log(data);
            $scope.description=data.data.description;
            $scope.createUser=data.data.createUser;
            $scope.firtdetail=data.data.items
        })
      }]);