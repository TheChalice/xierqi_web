'use strict';

angular.module('console.pipeline.detail', [
    {
        files: [
            'components/checkbox/checkbox.js',
            'views/pipeline_detail/pipeline_detail.css'
        ]
    }
])
    .controller('pipelineDetailCtrl', ['$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'toastr', 'BuildConfigs', 'Project', 'deleteSecret', 'Sort', 'Ws','delTip'
        , function ($rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, toastr, BuildConfigs, Project, deleteSecret, Sort, Ws,delTip) {
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

            var updateBuilds = function (data) {
                console.log('ws状态', data);
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    //TODO直接刷新bc会导致页面重新渲染
                    loadBuildHistory($state.params.name);
                    return;
                }

                $scope.resourceVersion = data.object.metadata.resourceVersion;

                if (data.type == 'ADDED') {
                    data.object.showLog = true;
                    $scope.databuild.items.unshift(data.object);

                } else if (data.type == "MODIFIED") {
                    // 这种方式非常不好,尽快修改
                    angular.forEach($scope.databuild.items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            data.object.showLog = $scope.databuild.items[i].showLog;
                            if (data.object.status.phase == 'Complete') {
                                emit(true);
                            }
                            Build.log.get({
                                namespace: $rootScope.namespace,
                                name: data.object.metadata.name,
                                region: $rootScope.region
                            }, function (res) {
                                var result = "";
                                for (var k in res) {
                                    if (/^\d+$/.test(k)) {
                                        result += res[k];
                                    }
                                }
                                var html = ansi_ups.ansi_to_html(result);
                                data.object.buildLog = $sce.trustAsHtml(html)
                                //data.object.buildLog = result;
                                $scope.databuild.items[i] = data.object;
                                loglast()
                            }, function () {
                                $scope.databuild.items[i] = data.object;
                            });
                        }
                    });
                }
            };

            //复制事件
            //$scope.gcopy = () => copyblock(event)
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
             //更新部署
            $scope.startBuild = function () {
                var name = $scope.BuildConfig.metadata.name;
                var buildRequest = {
                    metadata: {
                        name: name
                    }
                };
                BuildConfig.instantiate.create({
                    namespace: $rootScope.namespace,
                    name: $scope.BuildConfig.metadata.name
                }, buildRequest, function (res) {
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
            };


            //删除方法
            $scope.deletes = function () {
                var name = $scope.BuildConfig.metadata.name;
                delTip.open("删除", $scope.BuildConfig.metadata.name, true).then(function () {
                    BuildConfig.remove({
                        namespace: $rootScope.namespace,
                        name: $scope.BuildConfig.metadata.name
                    }, {}, function () {
                        toastr.success('操作成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                        $state.go("console.pipeline",{namespace:$rootScope.namespace});
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

