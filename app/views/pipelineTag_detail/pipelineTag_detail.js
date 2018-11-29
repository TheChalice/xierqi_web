'use strict';

angular.module('console.pipelinetag.detail', [
    {
        files: [
            'components/checkbox/checkbox.js',
            'components/deploymentsevent/deploymentsevent.js',
            'views/pipeline_detail/pipeline_detail.css'
        ]
    }
])
    .controller('pipelineTagDetailCtrl', ['$sce', 'ansi_ups', 'ImageStreamTag', 'deleteSecret', 'Ws', 'Sort', 'GLOBAL', '$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'UUID', 'WebhookLab', 'WebhookHub', 'WebhookLabDel', 'WebhookHubDel', 'ImageStream', 'WebhookLabget', 'WebhookGitget', 'toastr', 'myPipelineDetail', 'delTip'
        , function ($sce, ansi_ups, ImageStreamTag, deleteSecret, Ws, Sort, GLOBAL, $rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, UUID, WebhookLab, WebhookHub, WebhookLabDel, WebhookHubDel, ImageStream, WebhookLabget, WebhookGitget, toastr, myPipelineDetail, delTip) {
            var getPipelineTagDetail = function () {
                $scope.buildSet = angular.copy(myPipelineDetail);
                // console.log('121212', $scope.buildSet);
                $scope.deletePipeTag = function (val) {
                    delTip.open("删除" + $scope.buildSet.metadata.name, val, true).then(function () {
                        Build.delete({
                            namespace: $rootScope.namespace,
                            name: $scope.buildSet.metadata.name
                        }, function (datadc) {
                            toastr.success('操作成功', {
                                timeOut: 2000,
                                closeButton: true
                            });
                            $state.go('console.pipeline',{namespace:$rootScope.namespace});
                        }, function () {
                            Confirm.open("删除" + $scope.buildSet.metadata.name, "删除" + val + "失败", null, null, true);
                            toastr.error('删除失败,请重试', {
                                timeOut: 2000,
                                closeButton: true
                            });
                        })
                    })
                };
            };
            getPipelineTagDetail();
        }]);

