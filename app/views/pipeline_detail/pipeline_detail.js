'use strict';

angular.module('console.pipeline.detail', [
    {
        files: [
            'components/checkbox/checkbox.js',
            'views/pipeline_detail/pipeline_detail.css'
        ]
    }
])
    .controller('pipelineDetailCtrl', ['$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'toastr', 'BuildConfigs', 'Project', 'deleteSecret', 'Sort', 'Ws'
        , function ($rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, toastr, BuildConfigs, Project, deleteSecret, Sort, Ws) {
            Project.get({ region: $rootScope.region }, function (data) {
                angular.forEach(data.items, function (item, i) {
                    if (item.metadata.name === $rootScope.namespace) {
                        $scope.projectname = item.metadata.annotations['openshift.io/display-name'] === '' || !item.metadata.annotations['openshift.io/display-name'] ? item.metadata.name : item.metadata.annotations['openshift.io/display-name'];
                    }
                })
                $scope.BuildConfig = angular.copy(BuildConfigs);
            });

            //获取pipline记录
            var loadPiplineHistory = function (name) {
                //console.log('name',name)
                Build.get({
                    namespace: $rootScope.namespace,
                    labelSelector: 'buildconfig=' + name,
                    region: $rootScope.region
                }, function (data) {
                    console.log("history", data);
                    data.items = Sort.sort(data.items, -1); //排序
                    $scope.databuild = data;
                    if ($stateParams.from == "create/new") {
                        $scope.databuild.items[0].showLog = true;
                    }
                    //console.log($scope.databuild);
                    //fillHistory(data.items);

                    //emit(imageEnable(data.items));
                    $scope.resourceVersion = data.metadata.resourceVersion;
                    watchBuilds(data.metadata.resourceVersion);
                }, function (res) {
                    //todo 错误处理
                });
            };

            loadPiplineHistory($state.params.name);
            // websocket设置
            var watchBuilds = function (resourceVersion) {
                Ws.watch({
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'builds',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updateBuilds(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'builds', '');
                    //console.log(key, $rootScope);
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    watchBuilds($scope.resourceVersion);
                });
            };

            //复制事件
            $scope.gcopy = () => copyblock(event)
            //复制方法
            var copyblock = function (event) {
                var e = event.target.previousElementSibling;
                var textInput = document.createElement('input');
                textInput.setAttribute('value', e.textContent)
                textInput.style.cssText = "position: absolute; top:0; left: -9999px";
                document.body.appendChild(textInput);
                textInput.select();
                var success = document.execCommand('copy');
                if (success) {
                    if (event.target.innerText == "复制") {
                        event.target.innerText = '已复制'
                    }

                }
            }
            //删除方法
            $scope.deletes = function () {
                var name = $scope.BuildConfig.metadata.name;
                console.log("12123", $scope.BuildConfig);
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
                        $state.go("console.pipeline");
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
            //查看内容
             $scope.getLog = function (idx) {
                console.log("9999",$scope.databuild)
                var o = $scope.databuild.items[idx];
                console.log("12321",o)
                o.showLog = !o.showLog;

                if (o.status.phase == "New") {
                    
                }
                //存储已经调取过的log
                if (o.buildLog) {
                    loglast()
                    return;
                }
               
            };

        }])
    ;

