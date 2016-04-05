'use strict';

angular.module("console.timeline", [
    {
        files: ['components/timeline/timeline.css']
    }
])

    .directive('cTimeline', [function () {
        return {
            restrict: 'EA',
            replace: true,

            scope: {
                name: '=',
                type: '@'
            },
            controller: ['$rootScope', '$scope', '$log', 'BuildConfig', 'Build', 'Confirm', '$stateParams', 'ImageStreamTag', 'Sort', 'ModalPullImage', function($rootScope, $scope, $log, BuildConfig, Build, Confirm, $stateParams, ImageStreamTag, Sort, ModalPullImage){
                console.log("$scope.name", $scope.name);
                $scope.gitStore = {};

                $scope.$on('timeline', function(e, type, data){
                    $scope.data.items = $scope.data.items || [];
                    console.log("type", type, "data", data);
                    if (type == 'add') {
                        data.showLog = true;
                        $scope.data.items.unshift(data);
                    }
                });

                //获取build记录
                var loadBuildHistory = function (name) {
                    Build.get({namespace: $rootScope.namespece, labelSelector: 'buildconfig=' + name}, function(data){
                        $log.info("history", data);
                        data.items = Sort.sort(data.items, -1); //排序
                        $scope.data = data;

                        fillHistory(data.items);

                        watchBuilds(data.metadata.resourceVersion);
                    }, function(res){
                        //todo 错误处理
                    });
                };

                var fillHistory = function(items){
                    var tags = [];
                    for (var i = 0; i < items.length; i++) {
                        if (!items[i].spec.output || !items[i].spec.output.to || !items[i].spec.output.to.name) {
                            continue;
                        }
                        if (tags.indexOf(items[i].spec.output.to.name) != -1) {
                            continue;
                        }
                        tags.push(items[i].spec.output.to.name);
                    }
                    angular.forEach(tags, function(tag){
                        loadImageStreamTag(tag);
                    });
                };

                var loadImageStreamTag = function(name){
                    ImageStreamTag.get({namespace: $rootScope.namespece, name: name}, function(data){
                        $log.info('imageStreamTag', data);

                        $scope.gitStore[name] = {
                            id: data.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'],
                            ref: data.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref']
                        }

                    }, function(res){
                        //todo 错误处理
                    });
                };

                var watchBuilds = function(resourceVersion) {
                    Build.watch(function(res){
                        var data = JSON.parse(res.data);
                        updateBuilds(data);
                    }, function(){
                        $log.info("webSocket start");
                    }, function(){
                        $log.info("webSocket stop");
                    }, resourceVersion)
                };

                var updateBuilds = function (data) {
                    if (data.type == 'ADDED') {

                    } else if (data.type == "MODIFIED") {
                        //todo  这种方式非常不好,尽快修改
                        angular.forEach($scope.data.items, function(item, i){
                            if (item.metadata.name == data.object.metadata.name) {
                                data.object.showLog = $scope.data.items[i].showLog;
                                Build.log.get({namespace: $rootScope.namespece, name: data.object.metadata.name}, function(res){
                                    var result = "";
                                    for(var k in res){
                                        result += res[k];
                                    }
                                    data.object.buildLog = result;
                                    $scope.data.items[i] = data.object;
                                }, function(){
                                    $scope.data.items[i] = data.object;
                                });
                            }
                        });
                    }
                };

                loadBuildHistory($scope.name);


                //如果是新创建的打开第一个日志,并监控
                if ($stateParams.from == "create") {
                    $scope.$watch("data", function(newVal, oldVal){
                        if (newVal != oldVal) {
                            if (newVal.items.length > 0) {
                                $scope.getLog(0);
                            }
                        }
                    });
                }

                $scope.getLog = function(idx){
                    var o = $scope.data.items[idx];
                    o.showLog = !o.showLog;

                    if (o.status.phase == "Pending") {
                        return;
                    }
                    //存储已经调取过的log
                    if (o.buildLog) {
                        return;
                    }
                    Build.log.get({namespace: $rootScope.namespece, name: o.metadata.name}, function(res){
                        var result = "";
                        for(var k in res){
                            result += res[k];
                        }
                        o.buildLog = result;
                    }, function(res){
                        //todo 错误处理
                        $log.info("err", res);
                    });
                };

                $scope.pull = function(idx){
                    var name = $scope.data.items[idx].spec.output.to.name;
                    ModalPullImage.open(name).then(function(res){
                        console.log("cmd", res);
                    });
                };

                $scope.delete = function(idx){
                    var title = "删除构建";
                    var msg = "您确定要删除构建吗?";
                    var tip = "删除构建将清除构建的所有历史数据以及相关的镜像,该操作不能被恢复";
                    if ($scope.type == 'image') {
                        title = "删除镜像版本";
                        msg = "您确定要删除该镜像版本吗?";
                        tip = "";
                    }

                    var name = $scope.data.items[idx].metadata.name;
                    if (!name) {
                        return;
                    }
                    Confirm.open(title, msg, tip, 'recycle').then(function(){
                        Build.remove({namespace: $rootScope.namespece, name: name}, function(){
                            $log.info("deleted");
                            for (var i = 0; i < $scope.data.items.length; i++) {
                                if (name == $scope.data.items[i].metadata.name) {
                                    $scope.data.items.splice(i, 1)
                                }
                            }
                        }, function(res){
                            //todo 错误处理
                            $log.info("err", res);
                        });
                    });
                };

                $scope.stop = function(idx){
                    var o = $scope.data.items[idx];
                    o.status.cancelled = true;
                    Confirm.open("提示信息","您确定要终止本次构建吗?").then(function(){
                        Build.put({namespace: $rootScope.namespece, name: o.metadata.name}, o, function(res){
                            $log.info("stop build success");
                            $scope.data.items[idx] = res;
                        }, function(res){
                            if(res.data.code== 409){
                                Confirm.open("提示信息","当数据正在New的时候,构建不能停止,请等到正在构建时,在请求停止.");
                            }
                        });
                    });
                };

                $scope.forward = function(idx){
                    var o = $scope.data.items[idx];
                    $state.go('console.image_detail', {bc: o.metadata.labels.buildConfig, name: o.spec.output.to.name});

                };
            }],
            templateUrl: 'components/timeline/timeline.html'
        }
    }]);



