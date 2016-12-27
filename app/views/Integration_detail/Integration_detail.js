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
            $scope.description=data.description;

            $scope.createUser=data.display_name;
    
            $scope.firtdetail=data.items
        })
            $scope.down=function(a,url){
                console.log(a,url)
                Confirm.open('下载文件', '您确定要下载文件吗！','','').then(function () {
                    location.href=url;
                })
            }

      }]);