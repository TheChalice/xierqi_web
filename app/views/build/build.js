'use strict';

angular.module('console.build', [
    {
        files: [
            'components/searchbar/searchbar.js',
            'views/build/build.css'
        ]
    }
])
    .controller('BuildCtrl', ['toastr','$rootScope', '$scope', '$log', '$state', '$stateParams', 'BuildConfig', 'Build', 'GLOBAL', 'Confirm', 'Sort', 'Ws',
        function (toastr,$rootScope, $scope, $log, $state, $stateParams, BuildConfig, Build, GLOBAL, Confirm, Sort, Ws) {

            //分页
            $scope.grid = {
                page: 1,
                size: 10,
                txt: ''
            };

            $scope.$watch('grid.page', function (newVal, oldVal) {
                if (newVal != oldVal) {
                    refresh(newVal);
                }
            });

            var refresh = function (page) {
                $(document.body).animate({
                    scrollTop: 0
                }, 200);
                var skip = (page - 1) * $scope.grid.size;
                $scope.items = $scope.data.slice(skip, skip + $scope.grid.size);
            };

            $scope.text = '您还没有代码构建';

            $scope.begin_blank=true;

            $scope.buildsearch = function (event) {
                //if (event.keyCode === 13 || event === 'search') {
                //console.log($scope.grid.txt);
                if (!$scope.grid.txt) {
                    $scope.data = angular.copy($scope.copydata)
                    refresh(1);
                    $scope.grid.total = $scope.copydata.length;
                    return;
                } else {
                    var iarr = [];
                    var str = $scope.grid.txt;
                    str = str.toLocaleLowerCase();
                    // console.log('$scope.copydata', $scope.copydata);
                    angular.forEach($scope.copydata, function (item, i) {
                        // console.log(item.build);
                        var nstr = item.metadata.name;
                        nstr = nstr.toLocaleLowerCase();
                        if (nstr.indexOf(str) !== -1) {
                            iarr.push(item)
                        }
                        //console.log(repo.instance_data, $scope.grid.txt);
                    })
                    $scope.isQuery = false;
                    if (iarr.length === 0) {
                        $scope.isQuery = true;
                        $scope.begin_blank=false;
                        $scope.text = '没有查询到符合条件的数据';
                        // console.log($scope.items.length);
                    }
                    else {
                        $scope.text = '您还没有任何代码构建数据，现在就创建一个吧';
                    }
                    $scope.data = angular.copy(iarr);
                    refresh(1);
                    // console.log('$scope.data', $scope.data);
                    $scope.grid.total = $scope.data.length;
                }
                //}
            }

            var loadbuildslist= function () {
                Build.get({ namespace: $rootScope.namespace, region: $rootScope.region }, function (data) {
                    $log.info("builds", data);
                    watchBuilds(data.metadata.resourceVersion);
                });
            }

            function watchBuilds(resourceVersion){
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
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    //watchBuilds($scope.resourceVersion);
                });
            }

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
                } else if (data.type == "MODIFIED") {

                    angular.forEach($scope.items, function (item, i) {
                        if (!item.build) {
                            return;
                        }
                        var bcname= item.metadata.name+'-'+item.status.lastVersion
                        if (bcname == data.object.metadata.name) {

                            $scope.items[i].build = data.object;
                            //loadBuilds([$scope.items[i]])
                            //console.log('build-data.type == "MODIFIED"', data);
                            if (data.object.status.phase === 'Complete') {
                                toastr.success(data.object.metadata.name + '构建成功', {
                                    timeOut: 2000,
                                    closeButton: true
                                });
                            }else if(data.object.status.phase === 'Failed'){
                                toastr.error(data.object.metadata.name + '构建失败', {
                                    timeOut: 2000,
                                    closeButton: true
                                });
                            }
                        }
                        $scope.$apply()
                    });

                }
            };

            loadbuildslist()
            //获取buildConfig列表
            var loadBuildConfigs = function ()  {
                BuildConfig.get({ namespace: $rootScope.namespace, region: $rootScope.region }, function (data) {
                    $log.info('buildConfigs', data);
                    data.items = Sort.sort(data.items, -1); //排序


                    // console.log('data.items', data.items);
                    //$scope.copydata = angular.copy(data.items);
                    $scope.data = [];
                    angular.forEach(data.items, function (item, i) {
                        if (item.spec.strategy.type !== "JenkinsPipeline" && item.spec.source.type !== "Binary") {
                            $scope.data.push(item)
                        }
                    })

                    $scope.grid.total = $scope.data.length;
                    //console.log('$scope.data', $scope.data);
                    refresh(1);
                    loadBuilds($scope.data);
                    $scope.resourceVersion = data.metadata.resourceVersion;
                    watchBuildconfig(data.metadata.resourceVersion);



                    $scope.uex_back = true;
                    $scope.uex_front = false;
                    //列表排序
                    $scope.sortDetail = function () {
                        if ($scope.uex_back) {
                            // alert(1);
                            data.items = Sort.sort(data.items, 1); //排序
                            $scope.uex_back = false;
                            $scope.uex_front = true;
                            $scope.data = [];
                            angular.forEach(data.items, function (item, i) {
                                if (item.spec.strategy.type !== "JenkinsPipeline" && item.spec.source.type !== "Binary") {
                                    $scope.data.push(item)
                                }
                            })
                            $scope.grid.total = $scope.data.length;
                            refresh(1);
                        } else {
                            // alert(13);
                            data.items = Sort.sort(data.items, -1); //排序
                            $scope.uex_back = true;
                            $scope.uex_front = false;
                            $scope.data = [];
                            angular.forEach(data.items, function (item, i) {
                                if (item.spec.strategy.type !== "JenkinsPipeline" && item.spec.source.type !== "Binary") {
                                    $scope.data.push(item)
                                }
                            })
                            $scope.grid.total = $scope.data.length;
                            refresh(1);
                        }
                    }


                }, function (res) {
                    //todo 错误处理
                });
            };

            //根据buildConfig标签获取build列表
            var loadBuilds = function (items) {

                var labelSelector = '';
                if (items.length > 0) {
                    labelSelector = 'buildconfig in (';
                    for (var i = 0; i < items.length; i++) {
                        labelSelector += items[i].metadata.name + ','
                    }
                    labelSelector = labelSelector.substring(0, labelSelector.length - 1) + ')';
                }
                Build.get({ namespace: $rootScope.namespace, labelSelector: labelSelector, region: $rootScope.region }, function (data) {
                    //$log.info("builds", data);



                    fillBuildConfigs(data.items);
                });
            };

            var watchBuildconfig = function (resourceVersion) {
                Ws.watch({
                    resourceVersion: resourceVersion,
                    namespace: $rootScope.namespace,
                    type: 'buildconfigs',
                    name: ''
                }, function (res) {
                    var data = JSON.parse(res.data);
                    updateBuildConfigs(data);
                }, function () {
                    $log.info("webSocket start");
                }, function () {
                    $log.info("webSocket stop");
                    var key = Ws.key($rootScope.namespace, 'builds', '');
                    if (!$rootScope.watches[key] || $rootScope.watches[key].shouldClose) {
                        return;
                    }
                    //watchBuilds($scope.resourceVersion);
                });
            };

            var updateBuildConfigs = function (data) {
                if (data.type == 'ERROR') {
                    $log.info("err", data.object.message);
                    Ws.clear();
                    //loadBuilds($scope.data.items);
                    return;
                }

                $scope.resourceVersion = data.object.metadata.resourceVersion;
                if (data.type == 'ADDED') {

                } else if (data.type == "MODIFIED") {
                    angular.forEach($scope.items, function (item, i) {
                        if (!item.build) {
                            return;
                        }
                        //if (item.build.metadata.name == data.object.metadata.name) {
                        //    $scope.items[i].build = data.object;
                        //}
                    });
                    // console.log('$scope.items.build.status.phase',$scope.items);
                } else if (data.type == "DELETED") {
                    angular.forEach($scope.items, function (item, i) {
                        if (item.metadata.name == data.object.metadata.name) {
                            $scope.items.splice(i, 1)

                        }
                    })
                }
            };

            //填充buildConfig列表
            var fillBuildConfigs = function (items) {
                var buildMap = {};
                for (var i = 0; i < items.length; i++) {
                    if (!items[i].metadata.labels) {
                        continue;
                    }
                    var label = items[i].metadata.labels.buildconfig;
                    if (!buildMap[label]) {
                        buildMap[label] = items[i];
                        continue;
                    }
                    var st = (new Date(items[i].metadata.creationTimestamp)).getTime();
                    if ((new Date(buildMap[label].metadata.creationTimestamp)).getTime() < st) {
                        buildMap[label] = items[i];
                    }
                }
                angular.forEach($scope.data, function (item) {
                    var label = item.metadata.name;
                    if (!buildMap[label]) {
                        return;
                    }
                    item.build = buildMap[label];
                    //todo 构建类型
                });
                $scope.copydata = angular.copy($scope.data);
                // console.log($scope.copydata);

            };

            loadBuildConfigs();

            $scope.reload = function () {
                loadBuildConfigs();
                $scope.grid.page = 1;
                $state.reload();
            };

            //开始构建
            $scope.startBuild = function (idx) {
                var name = $scope.items[idx].metadata.name;
                var buildRequest = {
                    metadata: {
                        name: name
                    }
                };
                BuildConfig.instantiate.create({ namespace: $rootScope.namespace, name: name, region: $rootScope.region }, buildRequest, function () {
                    $log.info("build instantiate success");
                    $state.go('console.build_detail', { namespace: $rootScope.namespace, name: name, from: 'create' })
                }, function (res) {
                    //todo 错误处理
                });
            };

            $scope.stop = function (idx, bc) {
                Confirm.open("提示信息", "您确定要终止本次构建吗？").then(function () {
                    var build = $scope.items[idx].build;
                    build.status.cancelled = true;
                    //build.region=$rootScope.region
                    Build.put({ namespace: $rootScope.namespace, name: build.metadata.name, region: $rootScope.region }, build, function (res) {
                        bc.build.status.phase = 'Cancelled'
                        $log.info("stop build success");
                        //$scope.$apply()
                        //$scope.items[idx].build = res;
                    }, function (res) {

                        if (res.data.code == 409) {
                            Confirm.open("提示信息", "当数据正在New的时候，构建不能停止，请等到正在构建时，再请求停止。");
                        }
                    });
                });
            };

            $scope.$on('$destroy', function () {
                Ws.clear();
            });

        }]);

