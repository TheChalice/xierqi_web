'use strict';

angular.module('console.pipelinetag.detail', [
    {
        files: [
            'components/checkbox/checkbox.js',
            'views/pipelineTag_detail/pipelineTag_detail.css'
        ]
    }
])
    .controller('pipelineTagDetailCtrl', ['$sce', 'ansi_ups', 'ImageStreamTag', 'deleteSecret', 'Ws', 'Sort', 'GLOBAL', '$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'UUID', 'WebhookLab', 'WebhookHub', 'WebhookLabDel', 'WebhookHubDel', 'ImageStream', 'WebhookLabget', 'WebhookGitget', 'toastr'
        , function ($sce, ansi_ups, ImageStreamTag, deleteSecret, Ws, Sort, GLOBAL, $rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, UUID, WebhookLab, WebhookHub, WebhookLabDel, WebhookHubDel, ImageStream, WebhookLabget, WebhookGitget, toastr) {


        }])
    ;

