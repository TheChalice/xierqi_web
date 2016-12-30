/**
 * Created by sorcerer on 16/11/8.
 */
'use strict';
angular.module('console.backing_service_detail', [
        {
            files: [
                'views/Integration_dlist/Integration_dlist.css'
            ]
        }
    ])
    .controller('IntegrationDlistCtrl', ['$sce','dataitem', '$log', '$scope', '$rootScope', '$stateParams', 'BackingService', 'BackingServiceInstance', 'ServiceSelect', 'Confirm', 'BackingServiceInstanceBd', '$state', 'Toast', 'Ws'
        , function ($sce,dataitem, $log, $scope, $rootScope, $stateParams, BackingService, BackingServiceInstance, ServiceSelect, Confirm, BackingServiceInstanceBd, $state, Toast, Ws) {
            console.log($stateParams.name, $stateParams.plan);
            $scope.integrationname = $stateParams.name

            dataitem.get({reponame: $stateParams.name, itemname: $stateParams.plan}, function (data) {
                console.log('data', data);
                //angular.forEach(data.data.simple)
                data.sample=$sce.trustAsHtml(data.sample.replace(/\n/g,"<br/>"));
                console.log(data.sample);
                $scope.dataitems = data;

            })
            $scope.download=function(a,url){
                console.log(a,url)
                Confirm.open('下载文件', '您确定要下载文件吗！','','').then(function () {
                    location.href=url;
                })
            }

        }]);
