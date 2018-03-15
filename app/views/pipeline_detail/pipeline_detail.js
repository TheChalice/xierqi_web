'use strict';

angular.module('console.pipeline.detail', [
    {
        files: [
            'components/checkbox/checkbox.js',
            'views/pipeline_detail/pipeline_detail.css'
        ]
    }
])
    .controller('pipelineDetailCtrl', ['$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'toastr', 'BuildConfigs', 'Project','deleteSecret'
        , function ($rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, toastr, BuildConfigs, Project,deleteSecret) {
            Project.get({ region: $rootScope.region }, function (data) {
                angular.forEach(data.items, function (item, i) {
                    if (item.metadata.name === $rootScope.namespace) {
                        $scope.projectname = item.metadata.annotations['openshift.io/display-name'] === '' || !item.metadata.annotations['openshift.io/display-name'] ? item.metadata.name : item.metadata.annotations['openshift.io/display-name'];
                    }
                })
                $scope.BuildConfig = angular.copy(BuildConfigs);
            });

            $scope.gcopy = () =>copyblock(event)


           //复制方法
            var copyblock = function (event) {
                var e = event.target.previousElementSibling;
                var textInput = document.createElement('input');
                textInput.setAttribute('value', e.textContent)
                //textInput.style.cssText = "position: absolute; top:0; left: -9999px";
                document.body.appendChild(textInput);
                textInput.select();
                var success = document.execCommand('copy');
                if (success) { 
                    if(event.target.innerText=="复制"){
                        event.target.innerText='已复制'
                    }
                   
                }
            }

            $scope.deletes = function () {
                var name = $scope.BuildConfig.metadata.name;
                console.log("12123",$scope.BuildConfig);
                Confirm.open("删除构建", "您确定要删除构建吗？", "删除构建将删除构建的所有历史数据以及相关的镜像，且该操作不能恢复", 'recycle').then(function () {
                    BuildConfig.remove({
                        namespace: $rootScope.namespace,
                        name: name,
                        region: $rootScope.region
                    }, {}, function () {
                        $log.info("remove buildConfig success");

                        deleteSecret.delete({
                            namespace: $rootScope.namespace,
                            name: "custom-git-builder-" + $rootScope.user.metadata.name + '-' + name,
                            region: $rootScope.region
                        }), {}, function (res) {

                        }
                        removeIs($scope.data.metadata.name);
                        removeBuilds($scope.data.metadata.name);
                        var host = $scope.data.spec.source.git.uri;
                        if (!$scope.grid.checked) {
                            if (getSourceHost(host) === 'github.com') {
                                WebhookHubDel.del({
                                    namespace: $rootScope.namespace,
                                    build: $stateParams.name,
                                    user: $scope.data.metadata.annotations.user,
                                    repo: $scope.data.metadata.annotations.repo
                                }, function (item1) {

                                })
                            } else {
                                WebhookLabDel.del({
                                    host: 'https://code.dataos.io',
                                    namespace: $rootScope.namespace,
                                    build: $stateParams.name,
                                    repo: $scope.data.metadata.annotations.repo
                                }, function (data2) {

                                });
                            }
                        }
                        $state.go("console.build");
                        toastr.success('操作成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                    }, function (res) {
                        //todo 错误处理
                        toastr.error('删除失败,请重试', {
                            timeOut: 2000,
                            closeButton: true
                        });
                    });
                });


            }
            


            $scope.getLog = function (idx) {

            };

        }])
    ;

