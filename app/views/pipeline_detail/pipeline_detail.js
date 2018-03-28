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
            $scope.databuild={
                items : []
            }

            //获取pipline记录
            var loadPiplineHistory = function (name) {
                //console.log('name',name)
                Build.get({
                    namespace: $rootScope.namespace,
                    labelSelector: 'buildconfig=' + name,
                    region: $rootScope.region
                }, function (data) {
                    $scope.databuild.items=data.items
                    var sortresv= function  (a,b){
                        return b.metadata.resourceVersion - a.metadata.resourceVersion
                    }
                    $scope.databuild.items=$scope.databuild.items.sort(sortresv)
                    console.log($scope.databuild);
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
                //console.log('ws状态', data);
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();

                    return;
                }

                $scope.resourceVersion = data.object.metadata.resourceVersion;

                if (data.type == 'ADDED') {
                    if (data.object.metadata.labels&&data.object.metadata.labels.buildconfig) {
                        if (data.object.metadata.labels.buildconfig === $stateParams.name) {

                            if (data.object.metadata.annotations['openshift.io/jenkins-status-json']) {
                                var stages=JSON.parse(data.object.metadata.annotations['openshift.io/jenkins-status-json']).stages;
                                //console.log(stages);
                                data.object.stages=stages
                            }

                            $scope.databuild.items.unshift(data.object)
                            var sortresv= function  (a,b){
                                return b.metadata.resourceVersion - a.metadata.resourceVersion
                            }
                            $scope.databuild.items=$scope.databuild.items.sort(sortresv)

                            $scope.$apply()
                        }
                    }
                } else if (data.type == "MODIFIED") {
                    if (data.object.metadata.annotations['openshift.io/jenkins-status-json']) {
                        var stages=JSON.parse(data.object.metadata.annotations['openshift.io/jenkins-status-json']).stages;
                        //console.log(stages);
                    }
                    angular.forEach($scope.databuild.items, function (item,i) {
                        //console.log('item.metadata.name', item.metadata.name);
                        if (item.metadata.name === data.object.metadata.name) {
                            item.stages=stages;
                            item.status=data.object.status
                            //console.log('item.metadata.name', item.metadata.name);
                            console.log('item.stages', item.stages);
                        }
                    })
                    $scope.$apply()

                }
            };

            //复制事件
            // = () => copyblock(event)
            //复制方法
            $scope.gcopy = function (event) {
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
             //保存
            $scope.saveBuild = function () {
                var name = $scope.BuildConfig.metadata.name;
                //var buildRequest = {
                //    metadata: {
                //        name: name
                //    }
                //};
                console.log('$scope.BuildConfig', $scope.BuildConfig);
                BuildConfig.get({namespace: $rootScope.namespace,
                    name: $scope.BuildConfig.metadata.name}, function (getbc) {
                    console.log(getbc);
                    BuildConfig.put({
                        namespace: $rootScope.namespace,
                        name: $scope.BuildConfig.metadata.name
                    }, $scope.BuildConfig, function (res) {
                        console.log('res', res);
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
                })

            };

            $scope.startBuild = function () {
                var name = $scope.BuildConfig.metadata.name;
                var buildRequest = {
                    metadata: {
                        name: name
                    }
                };
                BuildConfig.instantiate.create({
                    namespace: $rootScope.namespace,
                    name: name
                }, buildRequest, function (res) {
                    //$scope.BuildConfig=res
                    //deleteWebhook();
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
                 var o = $scope.databuild.items[idx];

                o.showLog = !o.showLog;

               
            };

        }])
    ;

