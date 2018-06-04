'use strict';

angular.module('console.build.detail', [
    {
        files: [
            'components/checkbox/checkbox.js',
            'views/build_detail/build_detail.css'
        ]
    }
])
    .controller('BuildDetailCtrl', ['$sce', 'ansi_ups', 'ImageStreamTag', 'deleteSecret', 'Ws', 'Sort', 'GLOBAL', '$rootScope', '$scope', '$log', '$state', '$stateParams', '$location', 'BuildConfig', 'Build', 'Confirm', 'UUID', 'WebhookLab', 'WebhookHub', 'WebhookLabDel', 'WebhookHubDel', 'ImageStream', 'WebhookLabget', 'WebhookGitget', 'toastr','$base64'
        , function ($sce, ansi_ups, ImageStreamTag, deleteSecret, Ws, Sort, GLOBAL, $rootScope, $scope, $log, $state, $stateParams, $location, BuildConfig, Build, Confirm, UUID, WebhookLab, WebhookHub, WebhookLabDel, WebhookHubDel, ImageStream, WebhookLabget, WebhookGitget, toastr,$base64) {
            $scope.grid = {};

            //console.log('路由',$state);
            $scope.grid.checked = false;
            $scope.grid.pedding = false

            $scope.bcName = $stateParams.name;
            $scope.websocklink=[]
            $scope.$on('image-enable', function (e, enable) {
                $scope.imageEnable = enable;
            });
            $scope.showwebhook = false
            var loadBuildConfig = function () {
                BuildConfig.get({
                    namespace: $rootScope.namespace,
                    name: $stateParams.name,
                    region: $rootScope.region
                }, function (data) {
                    $log.info('data', data);
                    //$log.info('labsecrect is',data.spec.source.sourceSecret.name);
                    $scope.data = data;
                    var host = $scope.data.spec.source.git.uri;
                    if (data.metadata.annotations.user) {
                        $scope.showwebhook = true;
                        checkWebStatus()
                    } else {
                        $scope.showwebhook = false;
                    }
                    if (data.spec.source.git.uri.split(':')[0] == 'ssh') {
                        var host = data.spec.source.git.uri.replace('git@', '').replace('.git', '');

                        //console.log(host.split('/'));

                        var parser = document.createElement('a');

                        parser.href = host;

                        parser.protocol = 'http:';

                        var post = parser.host.split(':')[0];
                        parser.host = post;
                        //console.log(parser.href);
                        //console.log(parser.hostname);
                        //console.log(parser.pathname);
                        data.spec.source.git.uri = 'https://' + parser.hostname + parser.pathname
                    }

                    if (data.spec && data.spec.completionDeadlineSeconds) {
                        $scope.grid.completionDeadlineMinutes = parseInt(data.spec.completionDeadlineSeconds / 60);
                    }
                    if (data.spec.triggers.length) {
                        //$scope.grid.checked = 'start';
                        //$scope.grid.checkedLocal = true;
                    }
                    //checkWebStatus();

                }, function (res) {
                    //错误处理
                });
            };

            loadBuildConfig();
            //开始构建
            $scope.startBuild = function () {
                var name = $scope.data.metadata.name;
                var buildRequest = {
                    metadata: {
                        name: name
                    }
                };
                BuildConfig.instantiate.create({
                    namespace: $rootScope.namespace,
                    name: name,
                    region: $rootScope.region
                }, buildRequest, function (res) {
                    $log.info("build instantiate success", res);
                    $scope.active = 1;  //打开记录标签
                    $scope.$broadcast('timeline', 'add', res);
                    createWebhook();
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

            $scope.deletes = function () {
                var name = $scope.data.metadata.name;
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
                            // console.log('getSourceHost(host)', getSourceHost(host));
                            if (getSourceHost(host) === 'github.com') {

                                WebhookHubDel.del({
                                    ns: $rootScope.namespace,
                                    bc: $stateParams.name,
                                    id:$scope.webhookid
                                }, function (item1) {

                                })
                            } else {
                                WebhookLabDel.del({
                                    ns: $rootScope.namespace,
                                    bc: $stateParams.name,
                                    id:$scope.webhookid
                                }, function (data2) {

                                });
                            }
                        }
                        $state.go("console.build",{namespace: $rootScope.namespace});
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
            };

            var removeBuilds = function (bcName) {
                if (!bcName) {
                    return;
                }
                Build.remove({ namespace: $rootScope.namespace, labelSelector: 'buildconfig=' + bcName }, function () {
                    $log.info("remove builds of " + bcName + " success");
                }, function (res) {
                    $log.info("remove builds of " + bcName + " error");
                });
            };

            var removeIs = function (name) {
                ImageStream.delete({
                    namespace: $rootScope.namespace,
                    name: name,
                    region: $rootScope.region
                }, {}, function (res) {
                    //console.log("yes removeIs");
                }, function (res) {
                    //console.log("err removeIs");
                })
            }

            //$scope.$watch('grid.checked', function (newVal, oldVal) {
            //    if (newVal == "start") {
            //        return;
            //    }
            //    //if ($scope.selection) {
            //    //    $scope.selection = false;
            //    //    return;
            //    //}
            //    console.log('newVal', newVal);
            //    if (newVal != oldVal) {
            //        $scope.saveTrigger();
            //    }
            //});

            $scope.saveTrigger = function (checked) {
                var name = $scope.data.metadata.name;
                //if ($scope.grid.checked) {
                //    $scope.data.spec.triggers = [
                //        {
                //            type: 'GitHub',
                //            github: {
                //                secret: UUID.guid().replace(/-/g, "")
                //            }
                //        }
                //    ];
                //} else {
                //    $scope.data.spec.triggers = [];
                //}
                //$scope.data.region=$rootScope.region;
                if ($scope.grid.pedding) {
                    return
                }
                BuildConfig.put({
                    namespace: $rootScope.namespace,
                    name: name,
                    region: $rootScope.region
                }, $scope.data, function (res) {
                    $log.info("put success", res);
                    $scope.data = res;
                    $scope.deadlineMinutesEnable = false;
                    $scope.grid.checkedLocal = $scope.grid.checked;
                    if (!checked) {
                        createWebhook();
                    } else {
                        deleteWebhook();
                    }

                    //deleteWebhook();
                    //createWebhook();

                }, function (res) {
                    //todo 错误处理
                    $log.info("put failed");
                });
            };

            $scope.save = function () {
                if (!$scope.deadlineMinutesEnable) {
                    $scope.deadlineMinutesEnable = true;
                    return;
                }
                var name = $scope.data.metadata.name;
                $scope.data.spec.completionDeadlineSeconds = $scope.grid.completionDeadlineMinutes * 60;
                //$scope.data.region=$rootScope.region;
                BuildConfig.put({
                    namespace: $rootScope.namespace,
                    name: name,
                    region: $rootScope.region
                }, $scope.data, function (res) {
                    $log.info("put success", res);
                    $scope.data = res;
                    $scope.deadlineMinutesEnable = false;
                }, function (res) {
                    //todo 错误处理
                    $log.info("put failed");
                });
            };

            var getSourceHost = function (href) {
                var l = document.createElement("a");
                l.href = href;
                return l.hostname;
            };

            var getConfig = function (triggers, type) {
                //console.log(triggers)
                if(triggers==""){
                    return;
                    }                    
                var str = ''
                if (type == 'github' && triggers[0].github) {
                    str = GLOBAL.host_webhooks + '/oapi/v1/namespaces/' + $rootScope.namespace + '/buildconfigs/' + $scope.data.metadata.name + '/webhooks/' + triggers[0].github.secret + '/github'
                    return str;
                } else if (type == 'gitlab' && triggers[1].generic) {
                    str = GLOBAL.host_webhooks + '/oapi/v1/namespaces/' + $rootScope.namespace + '/buildconfigs/' + $scope.data.metadata.name + '/webhooks/' + triggers[1].generic.secret + '/generic'
                    return str;
                }


                var str = "";
                for (var k in triggers) {
                    if (triggers[k].type == 'GitHub') {
                        str = GLOBAL.host_webhooks + '/namespaces/' + $rootScope.namespace + '/buildconfigs/' + $scope.data.metadata.name + '/webhooks/' + triggers[k].github.secret + '/github'
                        return str;
                    }
                }
            };

            var checkWebStatus = function () {
                var host = $scope.data.spec.source.git.uri;
                // console.log('getSourceHost(host)', getSourceHost(host));
                if (getSourceHost(host) === 'github.com') {
                    WebhookGitget.get({
                        ns: $rootScope.namespace,
                        bc: $stateParams.name
                    }, function (res) {
                        if (res.id) {
                            $scope.webhookid=res.id
                            $scope.grid.checked = true;
                            $scope.grid.checkeds = true
                        }else {
                            $scope.grid.checked = false;
                            $scope.grid.checkeds = false;
                        }


                        //}

                    }, function (res) {
                        //console.log('666',res);
                        //if (res.data.code == 1404) {

                        //}
                    })
                } else {

                    WebhookLabget.get({
                        ns: $rootScope.namespace,
                        bc: $stateParams.name
                    }, function (res) {

                        if (res.id) {
                            $scope.webhookid=res.id
                            $scope.grid.checked = true;
                            $scope.grid.checkeds = true
                        }else {
                            $scope.grid.checked = false;
                            $scope.grid.checkeds = false;
                        }


                    }, function (res) {

                    });
                }
                //$scope.selection = true
            }

            var createWebhook = function () {
                var host = $scope.data.spec.source.git.uri;
                var triggers = $scope.data.spec.triggers;
                //console.log('triggers', triggers);
                $scope.grid.pedding = true
                // console.log('checked', $scope.grid.checked);
                if (!$scope.grid.checked) {
                    var config = getConfig(triggers, 'github');
                    if (getSourceHost(host) === 'github.com') {

                        $log.info("user is", $scope.data.metadata.annotations.user);
                        //{
                        //    name:$scope.data.metadata.annotations.user,
                        //    Params:{
                        //    ns:$rootScope.namespace
                        //    repo: $scope.data.metadata.annotations.repo
                        //}
                        //{
                        //    host: 'https://github.com',
                        //        namespace: $rootScope.namespace,
                        //    build: $stateParams.name,
                        //    ns:$rootScope.namespace,
                        //    bc:$scope.data.metadata.annotations.user,
                        //    user: $scope.data.metadata.annotations.user,
                        //    repo: $scope.data.metadata.annotations.repo,
                        //    spec: { "active": true, events: ['push', 'pull_request', 'status'], config: { url: config } }
                        //}
                        //}
                        WebhookHub.check({
                            ns:$rootScope.namespace,
                            bc:$stateParams.name
                        },{
                            name:$scope.data.metadata.annotations.user+'/'+$stateParams.name,
                            params:{
                                    ns:$scope.data.metadata.annotations.user,
                                    url:config,
                                    repo: $scope.data.metadata.annotations.repo
                                }
                        }, function (data) {
                            $scope.webhookid=data.id
                            $scope.grid.pedding = false
                            $scope.grid.checked = true
                        }, function (err) {
                            $scope.grid.pedding = false
                        });
                    } else {
                        var config = getConfig(triggers, 'gitlab');
                        WebhookLab.check({
                            ns:$rootScope.namespace,
                            bc:$stateParams.name
                        },{
                            name:$scope.data.metadata.annotations.user+'/'+$stateParams.name,
                            params:{
                                id:$scope.data.metadata.annotations.id,
                                url:config
                            }
                        }, function (data) {
                            $scope.webhookid=data.id
                            $scope.grid.pedding = false
                            $scope.grid.checked = true
                            //console.log("test repo", $scope.data.metadata.annotations.repo)
                        });
                    }
                }
            };

            var deleteWebhook = function () {
                var host = $scope.data.spec.source.git.uri;
                $scope.grid.pedding = true;
                if ($scope.grid.checked) {
                    if (getSourceHost(host) === 'github.com') {
                        WebhookHubDel.del({
                            ns: $rootScope.namespace,
                            bc: $stateParams.name,
                            id:$scope.webhookid
                        }, function (item1) {
                            $scope.grid.pedding = false
                            $scope.grid.checked = false
                        }, function (err) {
                            $scope.grid.pedding = false
                        })
                    } else {
                        WebhookLabDel.del({
                            ns: $rootScope.namespace,
                            bc: $stateParams.name,
                            id:$scope.webhookid
                        }, function (data2) {
                            $scope.grid.pedding = false
                            $scope.grid.checked = false
                        }, function (err) {
                            $scope.grid.pedding = false
                        });
                    }
                }
            }

            $scope.isshow = true;
            $scope.gitStore = {};
            $scope.databuild={
                items : []
            }
            //获取build记录
            var loadBuildHistory = function (name) {
                //console.log('name',name)
                Build.get({
                    namespace: $rootScope.namespace,
                    labelSelector: 'buildconfig=' + name,
                    region: $rootScope.region
                }, function (res) {
                    var obj = angular.copy(res)
                    //console.log(obj);
                    //res.items = res.items.sort(res.items, -1); //排序
                    //console.log("history", res);
                    $scope.databuild.items=res.items
                    var sortresv= function  (a,b){
                        return b.metadata.resourceVersion - a.metadata.resourceVersion
                    }
                    $scope.databuild.items=$scope.databuild.items.sort(sortresv)
                    $scope.databuild.items=Sort.sort($scope.databuild.items, -1)
                    //console.log($scope.databuild);
                    //if ($stateParams.from == "create/new") {
                    //    $scope.databuild.items[0].showLog = true;
                    //}
                    //console.log($scope.databuild);
                    //fillHistory(data.items);

                    //emit(imageEnable(data.items));
                    $scope.resourceVersion = res.metadata.resourceVersion;
                    watchBuilds(res.metadata.resourceVersion);
                }, function (res) {
                    //todo 错误处理
                });
            };

            var loglast = function () {
                setTimeout(function () {
                    $('#sa').scrollTop(1000000)
                }, 200)
            }

            var fillHistory = function (items) {
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
                angular.forEach(items, function (item) {
                    loadImageStreamTag(item);
                });
            };

            var loadImageStreamTag = function (item) {
                ImageStreamTag.get({
                    namespace: $rootScope.namespace,
                    name: item.spec.output.to.name,
                    region: $rootScope.region
                }, function (data) {
                    item.bsi = data;
                    if (data.image.dockerImageMetadata.Config.Labels) {
                        $scope.gitStore[item.spec.output.to.name] = {
                            id: data.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.id'],
                            ref: data.image.dockerImageMetadata.Config.Labels['io.openshift.build.commit.ref']
                        }
                    }


                }, function (res) {
                    //todo 错误处理
                });
            };

            var emit = function (enable) {
                $scope.$emit('image-enable', enable);
            };

            var imageEnable = function (items) {
                if (!items || items.length == 0) {
                    return false;
                }
                for (var i = 0; i < items.length; i++) {
                    if (items[i].status.phase == 'Complete') {
                        return true;
                    }
                }
                return false;
            };

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
            var watchBuildlog = function (name) {
                var canlink= true
                angular.forEach($scope.websocklink, function (namelinked) {
                    if (namelinked === name) {
                        canlink=false
                    }
                })
                if (canlink) {
                    $scope.websocklink.push(name)
                    Ws.watch({
                        namespace: $rootScope.namespace,
                        type: 'builds/'+name+'/log',
                        protocols: 'base64.binary.k8s.io',
                        follow:true
                    }, function (res) {
                        angular.forEach($scope.databuild.items, function (build) {
                            //console.log(res);
                            if (build.metadata.name === name) {
                                //console.log(build.metadata.name,$base64.decode(res.data));
                                build.baselog+=$base64.decode(res.data)
                                var html ='';
                                //console.log('build.baselog', build.baselog);
                                if (build.baselog!=='undefined') {
                                    build.baselog=build.baselog.replace('undefined','')
                                    html = ansi_ups.ansi_to_html(build.baselog)
                                    //html = ansi_ups.ansi_to_html('none')
                                }else {
                                    html = ansi_ups.ansi_to_html('暂无日志')

                                }
                                build.buildLog=$sce.trustAsHtml(html)


                            }
                        })
                    }, function () {
                        $log.info("webSocket start");
                    }, function () {
                        $log.info("webSocket stop");
                        var key = Ws.key($rootScope.namespace, 'builds', '');
                        //console.log(key, $rootScope);
                        if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                            return;
                        }
                    });
                }

            };


            var updateBuilds = function (data) {
                //console.log('ws状态', data);
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    //TODO直接刷新bc会导致页面重新渲染
                    //loadBuildHistory($state.params.name);
                    return;
                }

                $scope.resourceVersion = data.object.metadata.resourceVersion;

                if (data.type == 'ADDED') {
                    //data.object.showLog = true;
                    if (data.object.metadata.labels&&data.object.metadata.labels.buildconfig) {
                        if (data.object.metadata.labels.buildconfig === $stateParams.name) {
                            $scope.databuild.items.unshift(data.object)
                           var sortresv= function  (a,b){
                             return b.metadata.resourceVersion - a.metadata.resourceVersion
                            }
                            $scope.databuild.items=$scope.databuild.items.sort(sortresv)

                            $scope.$apply()
                        }
                    }

                } else if (data.type == "MODIFIED") {
                    angular.forEach($scope.databuild.items, function (build,i) {
                        if (build.metadata.name === data.object.metadata.name) {
                            // console.log('build.metadata.name', build.metadata.name);
                            build.metadata.creationTimestamp=data.object.metadata.creationTimestamp
                            build.status.phase=data.object.status.phase
                            build.status.duration=data.object.status.duration
                            if (data.object.spec.revision&&data.object.spec.revision.git) {
                                build.spec.revision={
                                    git:{
                                        commit:data.object.spec.revision.git.commit
                                    }
                                }
                                //build.spec.revision.git.commit=
                            }

                            $scope.$apply()
                        }
                    })
                }
            };
            loadBuildHistory($state.params.name);

            //如果是新创建的打开第一个日志,并监控
            //if ($stateParams.from == "create") {
            //    $scope.$watch("databuild", function (newVal, oldVal) {
            //        //console.log(newVal);
            //
            //        if (newVal != oldVal) {
            //            if (newVal.items.length > 0 && $scope.databuild.items[0].object) {
            //
            //                $scope.getLog(0);
            //
            //                $scope.databuild.items[0].object.showLog = true;
            //            }
            //        }
            //    });
            //}

            $scope.getLog = function (idx) {
                var o = $scope.databuild.items[idx];
                o.showLog = !o.showLog;
                watchBuildlog(o.metadata.name)
                Build.log.get({
                    namespace: $rootScope.namespace,
                    name: o.metadata.name,
                    region: $rootScope.region
                }, function (res) {
                    // console.log('res', res);
                }, function (res) {
                    //console.log("res", res);
                    var html = ansi_ups.ansi_to_html(res.data.message);
                    o.buildLog = $sce.trustAsHtml(html)
                    //o.buildLog = res.data.message;
                });
            };

            //$scope.pull = function(idx){
            //    // console.log(idx)
            //    // console.log(idx,$scope.data.status.tags[idx].tag)
            //    var name = $scope.name + ':' + $scope.date.status.tags[idx].tag;
            //    // var name = $scope.data.items[idx].spec.output.to.name;
            //    console.log('name',name);
            //    ModalPullImage.open(name, true).then(function (res) {
            //        console.log("cmd", res);
            //    });
            //};

            $scope.delete = function (idx) {
                var title = "删除构建";
                var msg = "您确定要删除构建记录吗？";
                //var tip = "删除构建将清除构建的所有历史数据以及相关的镜像，该操作不能被恢复";

                var name = $scope.databuild.items[idx].metadata.name;
                if (!name) {
                    return;
                }
                Confirm.open(title, msg, '', 'recycle').then(function () {
                    Build.remove({ namespace: $rootScope.namespace, name: name }, function () {
                        $log.info("deleted");
                        toastr.success('操作成功', {
                            timeOut: 2000,
                            closeButton: true
                        });
                        for (var i = 0; i < $scope.databuild.items.length; i++) {
                            if (name == $scope.databuild.items[i].metadata.name) {
                                $scope.databuild.items.splice(i, 1)
                            }
                        }

                        $scope.$watch('databuild', function (n, o) {
                            //console.log(n.items.length);
                            if (n.items.length == '0') {
                                $rootScope.testq = 'finsh'
                            }
                        })
                        // if (idx == '0') {
                        //   $rootScope.testq.type = 'delete';
                        //   $rootScope.testq.git = $scope.data.items[0].spec.revision.git.commit;
                        // }
                    }, function (res) {
                        toastr.error('删除失败,请重试', {
                            timeOut: 2000,
                            closeButton: true
                        });
                        //todo 错误处理
                        $log.info("err", res);
                    });
                });
            }

            $scope.stop = function (idx) {
                var o = $scope.databuild.items[idx];
                o.status.cancelled = true;
                //o.region=$rootScope.region
                Confirm.open("终止构建", "您确定要终止本次构建吗？", "", "stop").then(function () {
                    Build.put({
                        namespace: $rootScope.namespace,
                        name: o.metadata.name,
                        region: $rootScope.region
                    }, o, function (res) {
                        $log.info("stop build success");
                        $scope.databuild.items[idx] = res;
                    }, function (res) {
                        if (res.data.code == 409) {
                            Confirm.open("提示信息", "初始化中不能终止，请稍后再试", null, 144, true);
                        }
                    });
                });
            };

            $scope.$on('$destroy', function () {
                Ws.clear();
            });

        }])
    ;

