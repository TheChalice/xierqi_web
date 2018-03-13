'use strict';

angular.module('console.pipelinetag.detail', [
    {
        files: [
            'components/checkbox/checkbox.js',
            'components/deploymentsevent/deploymentsevent.js',
            'views/pipelineTag_detail/pipelineTag_detail.css'
        ]
    }
])
    .controller('pipelineTagDetailCtrl', ['$sce', 'ansi_ups', 'ImageStreamTag', 'deleteSecret', 'Ws', 'Sort', 'GLOBAL', '$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'UUID', 'WebhookLab', 'WebhookHub', 'WebhookLabDel', 'WebhookHubDel', 'ImageStream', 'WebhookLabget', 'WebhookGitget', 'toastr', 'myPipelineDetail'
        , function ($sce, ansi_ups, ImageStreamTag, deleteSecret, Ws, Sort, GLOBAL, $rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, UUID, WebhookLab, WebhookHub, WebhookLabDel, WebhookHubDel, ImageStream, WebhookLabget, WebhookGitget, toastr, myPipelineDetail) {
            var getPipelineTagDetail = function () {
                    $scope.buildSet = angular.copy(myPipelineDetail);
                    console.log('121212', $scope.buildSet);
                };
                getPipelineTagDetail();
            }]);

